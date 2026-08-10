#!/usr/bin/env bash
#
# Publishes `main` to the two production domains, from this machine.
#
#   scripts/local-deploy-runner.sh            # deploy if main moved since last time
#   scripts/local-deploy-runner.sh --force    # deploy even if nothing moved
#   scripts/local-deploy-runner.sh --dry-run  # say what it would do, touch nothing
#
# WHY THIS EXISTS
# Nothing connected `main` to production. ~15 cloud routines push all day, no
# routine can deploy (the export needs ~35 GB and Cloudflare credentials), and
# the gap was invisible: pushing succeeds, the site simply doesn't change. On
# 2026-08-10 production was five days behind main — the biodiversity sub-pages,
# /pour-qui/navetteurs-hybrides and a whole guide batch answered 404 in
# production while sitting in the repo. Nobody had noticed, because nothing
# ever failed.
#
# This machine is the only place that can do it: it has the disk, and the
# Cloudflare OAuth token in ~/.config/.wrangler.
#
# Installed as a nightly cron job — see `crontab -l`.

set -uo pipefail

REPO="/home/flammeur/meilleurville"
STATE_DIR="${HOME}/.local/state/meilleurville"
LOG="${STATE_DIR}/deploy-runner.log"
LOCK="${STATE_DIR}/deploy-runner.lock"
LAST_SHA_FILE="${STATE_DIR}/deployed-sha"
# A full build peaks around 35 GB (.next ~25 + out ~9). Starting one below this
# is how you get an ENOSPC halfway through the export.
MIN_FREE_GB=45
# Assets propagate for a couple of minutes after `wrangler deploy` returns.
# Checking before that reports a 404 on a page that is fine — a false alarm is
# worse than no check, so wait first.
PROPAGATION_WAIT_S=240

FORCE=0
DRY_RUN=0
case "${1:-}" in
  --force) FORCE=1 ;;
  --dry-run) DRY_RUN=1 ;;
  "") ;;
  *) echo "usage: $0 [--force|--dry-run]" >&2; exit 2 ;;
esac

mkdir -p "$STATE_DIR"

# cron gets a bare PATH. wrangler needs Node >= 22 and this machine's default
# node is v20 — take the highest nvm version, not `which node`.
NODE_BIN="$(ls -d "${HOME}"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1)"
export PATH="${NODE_BIN}:/usr/local/bin:/usr/bin:/bin"

say() { printf '%s %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*" | tee -a "$LOG"; }

# One deploy at a time, and never alongside the data runner's crawl: both want
# the same working tree, and a build that starts mid-`git pull` exports a
# half-updated corpus.
exec 9>"$LOCK"
if ! flock -n 9; then
  say "another deploy holds the lock — skipping"
  exit 0
fi
exec 8>"${STATE_DIR}/data-runner.lock"
if ! flock -n 8; then
  say "the data runner is crawling — skipping this pass"
  exit 0
fi

cd "$REPO" || { say "FATAL repo missing: $REPO"; exit 1; }

if [[ -n "$(git status --porcelain)" ]]; then
  say "working tree is dirty — refusing to publish something that isn't main:"
  git status --porcelain | tee -a "$LOG"
  exit 1
fi

git checkout main >>"$LOG" 2>&1
git pull --rebase origin main >>"$LOG" 2>&1 || { say "FATAL pull failed"; exit 1; }

head_sha="$(git rev-parse HEAD)"
last_sha="$(cat "$LAST_SHA_FILE" 2>/dev/null || echo none)"
if [[ "$head_sha" == "$last_sha" && $FORCE -eq 0 ]]; then
  say "main unchanged since last deploy (${head_sha:0:8}) — nothing to publish"
  exit 0
fi

behind="$(git rev-list --count "${last_sha}..HEAD" 2>/dev/null || echo '?')"
say "=== deploy start — ${head_sha:0:8}, ${behind} commit(s) since last publish ==="

if (( DRY_RUN )); then
  say "dry run: would deploy the following commits"
  git log --oneline "${last_sha}..HEAD" 2>/dev/null | tee -a "$LOG"
  exit 0
fi

# Never publish a main that doesn't hold together. `tsc` misses the data guards
# (a relatedGuides pointing at a missing slug is perfectly well typed), so
# integrity runs too — it is the check that would have caught the batch that
# left main non-buildable overnight on 2026-08-08.
say "-> contrôles (tsc + integrity)"
if ! npx tsc --noEmit >>"$LOG" 2>&1; then say "FATAL tsc failed — main is not publishable"; exit 1; fi
if ! npm run integrity >>"$LOG" 2>&1; then say "FATAL integrity failed — main is not publishable"; exit 1; fi
say "   contrôles ok"

build_and_deploy() {
  local label="$1" build_script="$2" deploy_script="$3"

  rm -rf .next out
  local free_gb
  free_gb=$(df -BG --output=avail "$REPO" | tail -1 | tr -dc '0-9')
  if (( free_gb < MIN_FREE_GB )); then
    say "FATAL ${label}: only ${free_gb}G free, need ${MIN_FREE_GB}G"
    return 1
  fi

  say "-> ${label}: build (${free_gb}G free)"
  if ! timeout 5400 npm run "$build_script" >>"$LOG" 2>&1; then
    say "   ${label}: build FAILED"
    return 1
  fi

  # cf:deploy* run scripts/check-deploy-locale.mjs first: both wrangler configs
  # serve the same out/, and the locale is baked at build time, so a stale
  # export would publish the wrong language on the wrong domain without any
  # command failing.
  say "-> ${label}: upload"
  if ! timeout 3600 npm run "$deploy_script" >>"$LOG" 2>&1; then
    say "   ${label}: deploy FAILED"
    return 1
  fi
  say "   ${label}: deployed"
  return 0
}

ok=1
build_and_deploy "FR" build cf:deploy || ok=0
if (( ok )); then
  build_and_deploy "EN" build:en cf:deploy:en || ok=0
fi
rm -rf .next out

if (( ! ok )); then
  say "=== deploy FAILED — sha not recorded, next run retries ==="
  exit 1
fi

# Verify against production, not against the log: `wrangler` reporting success
# and the page actually being served are two different claims.
say "-> vérification (attente ${PROPAGATION_WAIT_S}s de propagation)"
sleep "$PROPAGATION_WAIT_S"
checks_ok=1
for u in "https://www.mavilleideale.fr/" "https://bestcitiesinfrance.com/"; do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$u")"
  say "   ${code} ${u}"
  [[ "$code" == "200" ]] || checks_ok=0
done
if (( ! checks_ok )); then
  say "=== deployed but a domain does not answer 200 — sha not recorded ==="
  exit 1
fi

printf '%s\n' "$head_sha" > "$LAST_SHA_FILE"
say "=== deploy done — ${head_sha:0:8} is live on both domains ==="
