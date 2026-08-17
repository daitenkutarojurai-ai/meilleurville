#!/usr/bin/env bash
#
# Runs the data pipelines that the cloud routines cannot run, on this machine,
# and pushes what they collect.
#
#   scripts/local-data-runner.sh            # one pass: pull, crawl, commit, push
#   scripts/local-data-runner.sh --dry-run  # crawl, show the diff, commit nothing
#
# WHY THIS EXISTS
# The scheduled cloud agents get 403 CONNECT on every open-data host (GBIF,
# INPN, BODACC, Géorisques, data.gouv.fr, the État directory). Three pipelines
# depend on those hosts, so three roadmap items were stuck at 0/540 rows while
# their routines kept firing and kept writing "run this locally" into the log.
# This machine has egress. The crawl belongs here; the routines keep the
# editorial work they can actually do.
#
# Installed as a nightly cron job — see `crontab -l`.

set -uo pipefail

REPO="/home/flammeur/meilleurville"
STATE_DIR="${HOME}/.local/state/meilleurville"
LOG="${STATE_DIR}/data-runner.log"
LOCK="${STATE_DIR}/data-runner.lock"
# Free space below this and a crawl is not the thing to spend it on: the SSG
# build alone writes ~33 GB into .next/ + out/.
MIN_FREE_GB=8
# Batch sizes, overridable for a smoke test: BIODIV_LIMIT=2 NEWS_LIMIT=2 …
BIODIV_LIMIT="${BIODIV_LIMIT:-60}"
NEWS_LIMIT="${NEWS_LIMIT:-180}"
DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

mkdir -p "$STATE_DIR"

# cron gets a bare PATH; nvm's node is not on it.
NODE_BIN="$(ls -d "${HOME}"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1)"
export PATH="${NODE_BIN}:/usr/local/bin:/usr/bin:/bin"

say() { printf '%s %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*" | tee -a "$LOG"; }

# One runner at a time. A crawl takes ~1 h; overlapping runs would fight over
# the same JSON files and lose rows on the second write.
exec 9>"$LOCK"
if ! flock -n 9; then
  say "another run holds the lock — skipping"
  exit 0
fi

cd "$REPO" || { say "FATAL repo missing: $REPO"; exit 1; }

free_gb=$(df -BG --output=avail "$REPO" | tail -1 | tr -dc '0-9')
if (( free_gb < MIN_FREE_GB )); then
  say "FATAL only ${free_gb}G free (need ${MIN_FREE_GB}G) — run: rm -rf .next out"
  exit 1
fi

# The data files this runner owns. Nothing else is ever staged: ~15 cloud agents
# push to main all day and their work must not ride along in a data commit.
OWNED=(
  data/city-biodiversity.json
  data/city-protected-areas.json
  data/city-news.json
)

foreign=""
while read -r _flag file; do
  [[ -z "${file:-}" ]] && continue
  printf '%s\n' "${OWNED[@]}" | grep -qxF "$file" || foreign+="  $file"$'\n'
done < <(git status --porcelain)
if [[ -n "$foreign" ]]; then
  say "working tree carries changes outside the data files — refusing to touch it:"
  printf '%s' "$foreign" | tee -a "$LOG"
  exit 1
fi

say "=== run start (free ${free_gb}G) ==="
git checkout main >>"$LOG" 2>&1
git pull --rebase origin main >>"$LOG" 2>&1 || { say "FATAL pull failed"; exit 1; }

summary=()

run_stage() {
  local label="$1" timeout_s="$2"; shift 2
  say "-> $label"
  if timeout "$timeout_s" "$@" >>"$LOG" 2>&1; then
    say "   $label ok"
    return 0
  fi
  local code=$?
  # 124 is timeout(1): the crawl is resumable and picks up where it stopped,
  # so a cut-off batch is a partial result, not a failure to report.
  [[ $code -eq 124 ]] && say "   $label hit the time cap — partial batch kept" \
                      || say "   $label FAILED (exit $code)"
  return 0
}

# GBIF: ~45 s a city, so 60 cities is about 45 min. 540 cities = 9 nights.
run_stage "biodiversité (GBIF)" 4200 npm run biodiversity -- --limit="$BIODIV_LIMIT"
summary+=("biodiv $(node scripts/city-biodiversity.mjs stats 2>/dev/null | grep -oP 'covered \K[0-9]+/[0-9]+' || echo '?')")

# BODACC + Géorisques: ~4 s a city, the whole seed fits in one pass.
run_stage "signaux publics (BODACC/CatNat)" 3600 npm run news -- --limit="$NEWS_LIMIT"
summary+=("news $(node scripts/city-news.mjs stats 2>/dev/null | grep -oP '[0-9]+/[0-9]+ (cit|vill)' | head -1 || echo '?')")

# INPN protected areas. Two stages: `fetch` resolves the seven national zoning
# layers on data.gouv.fr and downloads them, the ingest rasterises them against
# the 540 cities.
#
# This used to be hardcoded to skip, with a comment saying the layers had to be
# downloaded and reprojected by hand — true until 2026-08-13, when `fetch` was
# written, and false since. Nothing called `fetch`, so the sources never
# appeared, so the ingest never ran: the component would have sat at 0/540 for
# ever while the script that fills it was already in the repo. That is the whole
# point of this block.
#
# The layers are large national shapefiles, so the download gets its own free
# space floor rather than riding on the one at the top of the run.
PA_SOURCES=".cache/city-protected-areas/sources"
PA_FREE_GB=15

if compgen -G "$PA_SOURCES/*.geojson" >/dev/null; then
  say "-> zones protégées: couches déjà en place, pas de re-téléchargement"
elif (( free_gb < PA_FREE_GB )); then
  say "-> zones protégées: fetch sauté, ${free_gb}G libres (il en faut ${PA_FREE_GB})"
else
  # ogr2ogr converts the shapefiles to WGS84 GeoJSON, which is what the ingest
  # reads. Without it `fetch` downloads and unpacks but produces no source
  # layer, and the run would look like a silent no-op — so say it plainly.
  if ! command -v ogr2ogr >/dev/null; then
    say "   note: ogr2ogr absent (apt install gdal-bin) — fetch téléchargera sans reprojeter"
  fi
  run_stage "zones protégées — sources (data.gouv.fr)" 5400 npm run protected-areas:fetch
fi

if compgen -G "$PA_SOURCES/*.geojson" >/dev/null; then
  # The ingest is a deterministic local pass over the same files: re-running it
  # nightly would burn an hour to rewrite an identical JSON. Run it when the
  # output is missing or older than the layers it reads.
  newest_src="$(ls -t "$PA_SOURCES"/*.geojson 2>/dev/null | head -1)"
  if [[ ! -s data/city-protected-areas.json ]] \
     || [[ "$(head -c 3 data/city-protected-areas.json)" == "{}" ]] \
     || [[ "$newest_src" -nt data/city-protected-areas.json ]]; then
    run_stage "zones protégées (INPN)" 3600 npm run protected-areas
    summary+=("protected $(node scripts/city-protected-areas.mjs stats 2>/dev/null | grep -oP 'covered \K[0-9]+/[0-9]+' || echo '?')")
  else
    say "-> zones protégées: ingest à jour (couches inchangées depuis la dernière passe)"
  fi
else
  say "-> zones protégées: aucune couche dans $PA_SOURCES — voir le journal du fetch ci-dessus"
fi

changed="$(git status --porcelain -- "${OWNED[@]}")"
if [[ -z "$changed" ]]; then
  say "=== nothing new to commit ==="
  exit 0
fi

if (( DRY_RUN )); then
  say "=== dry run, not committing ==="
  git --no-pager diff --stat -- "${OWNED[@]}" | tee -a "$LOG"
  exit 0
fi

git add -- "${OWNED[@]}"
git commit -q -m "data(pipelines): passe locale — ${summary[*]} [local-runner]" \
  -m "Collecte lancée depuis la machine locale : l'environnement des routines cloud répond 403 CONNECT sur GBIF, INPN, BODACC et data.gouv.fr." \
  -m "Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>" >>"$LOG" 2>&1

for attempt in 1 2 3; do
  git pull --rebase origin main >>"$LOG" 2>&1
  if git push origin main >>"$LOG" 2>&1; then
    say "=== pushed: ${summary[*]} ==="
    exit 0
  fi
  say "push attempt $attempt failed (agents push to main all day) — retrying"
  sleep 20
done

say "FATAL push failed three times; the commit is local, next run will carry it"
exit 1
