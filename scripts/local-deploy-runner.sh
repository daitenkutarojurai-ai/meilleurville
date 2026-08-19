#!/usr/bin/env bash
#
# Publishes `main` to the two production domains, from this machine.
#
#   scripts/local-deploy-runner.sh            # deploy if main moved since last time
#   scripts/local-deploy-runner.sh --force    # deploy even if nothing moved
#   scripts/local-deploy-runner.sh --dry-run  # say what it would do, touch nothing
#   scripts/local-deploy-runner.sh --status   # où en est la prod : ni verrou, ni effet de bord
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
# POURQUOI IL NE S'ARRÊTE PLUS SUR UN ARBRE SALE (2026-08-19)
# Le 19/08 la passe a refusé de publier : 175 fichiers modifiés traînaient dans
# le dépôt, laissés par une session interrompue. Refuser était juste — on ne
# publie pas du travail que personne n'a validé — mais le résultat était la
# panne même que ce script existe pour empêcher : trois commits poussés par les
# routines sont restés en 404 pendant une journée, et la seule trace était une
# ligne dans un journal que personne ne lit. Deux corrections :
#   1. un arbre sale ne bloque plus rien. La publication se fait alors depuis un
#      worktree git propre calé sur `origin/main` — on ne publie toujours que ce
#      qui est commité et poussé, et l'état du dossier de travail n'a plus voix
#      au chapitre.
#   2. une passe qui n'aboutit pas alors que la prod a du retard **parle** :
#      fichier d'état, notification bureau, et e-mail via Brevo. Un échec
#      silencieux est le seul mode de défaillance qu'on ne peut pas rattraper.
#
# Installed as a nightly cron job — see `crontab -l`.

set -uo pipefail

REPO="/home/flammeur/meilleurville"
STATE_DIR="${HOME}/.local/state/meilleurville"
LOG="${STATE_DIR}/deploy-runner.log"
LOCK="${STATE_DIR}/deploy-runner.lock"
LAST_SHA_FILE="${STATE_DIR}/deployed-sha"
STATUS_FILE="${STATE_DIR}/deploy-runner.status"
ALERT_STAMP="${STATE_DIR}/alert-sent-at"
# Publication de secours quand le dépôt est sale : un worktree git détaché,
# recalé sur origin/main à chaque passe. `node_modules` et `.env.local` y sont
# des liens vers le dépôt — inutile de dupliquer 1 Go et un fichier ignoré.
WORKTREE="${HOME}/.cache/meilleurville-deploy"
# A full build peaks around 35 GB (.next ~25 + out ~9). Starting one below this
# is how you get an ENOSPC halfway through the export.
MIN_FREE_GB=45
# Un `.next`/`out` abandonné par un build manuel occupe ces 35 Go et affame la
# passe suivante. Passé ce délai, plus personne ne travaille dessus : on reprend
# la place. (Assez long pour ne pas casser un build humain en cours.)
STALE_BUILD_HOURS=6
# Au-delà, une prod en retard n'est plus un contretemps : on réveille quelqu'un.
STALE_ALERT_HOURS=36
ALERT_COOLDOWN_H=24
# Assets propagate for a couple of minutes after `wrangler deploy` returns.
# Checking before that reports a 404 on a page that is fine — a false alarm is
# worse than no check, so wait first.
PROPAGATION_WAIT_S=240

FORCE=0
DRY_RUN=0
STATUS_ONLY=0
case "${1:-}" in
  --force) FORCE=1 ;;
  --dry-run) DRY_RUN=1 ;;
  --status) STATUS_ONLY=1 ;;
  "") ;;
  *) echo "usage: $0 [--force|--dry-run|--status]" >&2; exit 2 ;;
esac

mkdir -p "$STATE_DIR"

# cron gets a bare PATH. wrangler needs Node >= 22 and this machine's default
# node is v20 — take the highest nvm version, not `which node`.
NODE_BIN="$(ls -d "${HOME}"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1)"
export PATH="${NODE_BIN}:/usr/local/bin:/usr/bin:/bin"

say() { printf '%s %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*" | tee -a "$LOG"; }

last_sha() { cat "$LAST_SHA_FILE" 2>/dev/null || echo none; }

# Depuis quand la prod n'a-t-elle pas bougé. 999 = jamais publié.
deployed_age_hours() {
  [[ -f "$LAST_SHA_FILE" ]] || { echo 999; return; }
  echo $(( ( $(date +%s) - $(stat -c %Y "$LAST_SHA_FILE") ) / 3600 ))
}

# Combien de commits attendent, d'après le dernier origin/main connu localement.
pending_commits() {
  git -C "$REPO" rev-list --count "$(last_sha)..origin/main" 2>/dev/null || echo '?'
}

# Un échec qui ne réveille personne se répète toutes les nuits. Fichier d'état
# (lisible par --status), notification bureau si une session est ouverte, et
# e-mail — au plus un par ALERT_COOLDOWN_H, pour que l'alarme reste lisible.
alert() {
  local subject="$1" body="$2"
  printf '%s\n%s\n\n%s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$subject" "$body" > "$STATUS_FILE"
  DISPLAY="${DISPLAY:-:0}" notify-send -u critical "MaVilleIdéale — déploiement" "$subject" 2>/dev/null

  local now stamp
  now=$(date +%s)
  stamp=$(cat "$ALERT_STAMP" 2>/dev/null || echo 0)
  if (( now - stamp < ALERT_COOLDOWN_H * 3600 )); then
    say "   (alerte déjà envoyée il y a moins de ${ALERT_COOLDOWN_H} h — journal seulement)"
    return
  fi

  ALERT_SUBJECT="$subject" ALERT_BODY="$body" ALERT_ENV="${REPO}/.env.local" \
  node -e '
    const fs = require("fs");
    const env = Object.fromEntries(
      fs.readFileSync(process.env.ALERT_ENV, "utf8").split("\n")
        .map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean)
        .map((m) => [m[1], m[2].trim()]),
    );
    if (!env.BREVO_API_KEY || !env.CONTACT_TO_EMAIL) { console.log("pas de clé Brevo"); process.exit(3); }
    fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        sender: { email: "bonjour@mavilleideale.fr", name: "MaVilleIdéale — déploiement" },
        to: [{ email: env.CONTACT_TO_EMAIL }],
        subject: process.env.ALERT_SUBJECT,
        textContent: process.env.ALERT_BODY,
      }),
    }).then((r) => { console.log("brevo " + r.status); process.exit(r.ok ? 0 : 4); })
      .catch((e) => { console.log("brevo " + e.message); process.exit(5); });
  ' >>"$LOG" 2>&1 && date +%s > "$ALERT_STAMP"
}

# Sortie sans publication. On n'alerte que si la prod a réellement du retard :
# une passe qui n'a rien à publier n'est pas un incident.
stop() {
  local code="$1" reason="$2"
  say "$reason"
  local age pending
  age=$(deployed_age_hours)
  pending=$(pending_commits)
  if (( age >= STALE_ALERT_HOURS )) && [[ "$pending" != "0" ]]; then
    alert "prod figée depuis ${age} h — ${pending} commit(s) en attente" \
"$reason

Dernier sha publié : $(last_sha)
Commits en attente  : ${pending}
Journal             : ${LOG}
État                : ${REPO}/scripts/local-deploy-runner.sh --status"
  fi
  exit "$code"
}

status_report() {
  git -C "$REPO" fetch --quiet origin main 2>/dev/null
  local head dirty
  head="$(git -C "$REPO" rev-parse --short origin/main 2>/dev/null || echo '?')"
  dirty="$(git -C "$REPO" status --porcelain | wc -l)"
  echo "origin/main        ${head}"
  echo "dernier publié     $(last_sha | cut -c1-8), il y a $(deployed_age_hours) h"
  echo "en attente         $(pending_commits) commit(s)"
  echo "arbre de travail   ${dirty} fichier(s) modifié(s)$( ((dirty)) && echo ' — la publication passera par le worktree propre')"
  [[ -f "$STATUS_FILE" ]] && { echo "--- dernière alerte"; cat "$STATUS_FILE"; }
  git -C "$REPO" log --oneline "$(last_sha)..origin/main" 2>/dev/null | sed 's/^/  /'
}

if (( STATUS_ONLY )); then status_report; exit 0; fi

# Each pass appends two full build logs (~130 KB). Keep the last run whole and
# drop what's older, so a year of nightly deploys doesn't quietly fill the disk
# this script is supposed to protect.
if [[ -f "$LOG" ]] && (( $(stat -c%s "$LOG") > 5000000 )); then
  tail -c 1000000 "$LOG" > "${LOG}.tmp" && mv "${LOG}.tmp" "$LOG"
fi

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
  stop 0 "the data runner is crawling — skipping this pass"
fi

cd "$REPO" || { say "FATAL repo missing: $REPO"; exit 1; }

# Un build manuel abandonné laisse 35 Go derrière lui, et la passe suivante
# meurt sur le plancher d'espace libre sans que le dépôt ait changé.
reclaim_stale_builds() {
  local dir
  for dir in "$REPO/.next" "$REPO/out"; do
    [[ -d "$dir" ]] || continue
    local age_h=$(( ( $(date +%s) - $(stat -c %Y "$dir") ) / 3600 ))
    (( age_h >= STALE_BUILD_HOURS )) || continue
    say "   build abandonné depuis ${age_h} h : $(du -sh "$dir" | cut -f1) récupérés ($dir)"
    rm -rf "$dir"
  done
}

# Publier depuis un checkout propre d'origin/main, quoi que contienne le dépôt.
prepare_worktree() {
  if [[ ! -e "$WORKTREE/.git" ]]; then
    git -C "$REPO" worktree add --detach "$WORKTREE" origin/main >>"$LOG" 2>&1 || return 1
  fi
  git -C "$WORKTREE" fetch origin main >>"$LOG" 2>&1 || return 1
  git -C "$WORKTREE" reset --hard FETCH_HEAD >>"$LOG" 2>&1 || return 1
  # -fd sans -x : on efface les fichiers non suivis, pas les ignorés (les liens
  # node_modules / .env.local et les restes de build survivent à la passe).
  git -C "$WORKTREE" clean -fd >>"$LOG" 2>&1
  ln -sfn "$REPO/node_modules" "$WORKTREE/node_modules"
  [[ -f "$REPO/.env.local" ]] && ln -sfn "$REPO/.env.local" "$WORKTREE/.env.local"
  if ! cmp -s "$REPO/package-lock.json" "$WORKTREE/package-lock.json"; then
    say "   ATTENTION package-lock.json diffère du dépôt — node_modules partagé peut être périmé"
  fi
  return 0
}

git fetch --quiet origin main || stop 1 "FATAL fetch failed"

if [[ -n "$(git status --porcelain)" ]]; then
  say "arbre de travail sale ($(git status --porcelain | wc -l) fichiers) — publication depuis le worktree propre"
  git status --porcelain >>"$LOG"
  reclaim_stale_builds
  prepare_worktree || stop 1 "FATAL worktree de publication indisponible"
  WORK="$WORKTREE"
else
  git checkout main >>"$LOG" 2>&1
  git pull --rebase origin main >>"$LOG" 2>&1 || stop 1 "FATAL pull failed"
  WORK="$REPO"
fi

cd "$WORK" || stop 1 "FATAL source de publication introuvable: $WORK"

head_sha="$(git rev-parse HEAD)"
prev_sha="$(last_sha)"
if [[ "$head_sha" == "$prev_sha" && $FORCE -eq 0 ]]; then
  say "main unchanged since last deploy (${head_sha:0:8}) — nothing to publish"
  exit 0
fi

behind="$(git rev-list --count "${prev_sha}..HEAD" 2>/dev/null || echo '?')"
say "=== deploy start — ${head_sha:0:8}, ${behind} commit(s) since last publish (source: ${WORK}) ==="

if (( DRY_RUN )); then
  say "dry run: would deploy the following commits"
  git log --oneline "${prev_sha}..HEAD" 2>/dev/null | tee -a "$LOG"
  exit 0
fi

# Never publish a main that doesn't hold together. `tsc` misses the data guards
# (a relatedGuides pointing at a missing slug is perfectly well typed), so
# integrity runs too — it is the check that would have caught the batch that
# left main non-buildable overnight on 2026-08-08.
say "-> contrôles (tsc + integrity)"
if ! npx tsc --noEmit >>"$LOG" 2>&1; then stop 1 "FATAL tsc failed — main is not publishable"; fi
if ! npm run integrity >>"$LOG" 2>&1; then stop 1 "FATAL integrity failed — main is not publishable"; fi
say "   contrôles ok"

# Sitemap vs arbre de routes : signalé, jamais bloquant. Une URL déclarée en
# trop ou une page non déclarée est un défaut de référencement, pas une raison
# de ne pas publier — et un runner qui refuse de déployer pour ça reproduirait
# la panne du 2026-08-10, où la prod avait cinq jours de retard sans que rien
# ne parle. Le contrôle est bloquant côté agent, avant le push.
if ! npm run sitemap:check >>"$LOG" 2>&1; then
  say "   ATTENTION sitemap:check en échec (voir le journal) — publication maintenue"
fi

build_and_deploy() {
  local label="$1" build_script="$2" deploy_script="$3"

  rm -rf .next out
  [[ "$WORK" == "$REPO" ]] || reclaim_stale_builds
  local free_gb
  free_gb=$(df -BG --output=avail "$WORK" | tail -1 | tr -dc '0-9')
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
  stop 1 "=== deploy FAILED — sha not recorded, next run retries ==="
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
  stop 1 "=== deployed but a domain does not answer 200 — sha not recorded ==="
fi

printf '%s\n' "$head_sha" > "$LAST_SHA_FILE"
printf '%s\nok — %s publié sur les deux domaines\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "${head_sha:0:8}" > "$STATUS_FILE"
say "=== deploy done — ${head_sha:0:8} is live on both domains ==="
