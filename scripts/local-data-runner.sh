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

# INPN ships shapefiles behind a download page, not an API: this stage stays
# skipped until someone drops the converted GeoJSON layers in place. The script
# prints the exact ogr2ogr line — `npm run protected-areas:sources`.
if compgen -G ".cache/city-protected-areas/sources/*.geojson" >/dev/null; then
  run_stage "zones protégées (INPN)" 3600 npm run protected-areas
else
  say "-> zones protégées: skipped, no source layer in .cache/city-protected-areas/sources"
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
