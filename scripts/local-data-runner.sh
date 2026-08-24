#!/usr/bin/env bash
#
# Runs the data pipelines that the cloud routines cannot run, on this machine,
# and pushes what they collect.
#
#   scripts/local-data-runner.sh            # one pass: pull, crawl, commit, push
#   scripts/local-data-runner.sh --dry-run  # crawl, show the diff, commit nothing
#   scripts/local-data-runner.sh --status   # where each pipeline stands, in a screenful
#
# WHY THIS EXISTS
# The scheduled cloud agents get 403 CONNECT on every open-data host (GBIF,
# INPN, BODACC, Géorisques, data.gouv.fr, the État directory). Three pipelines
# depend on those hosts, so three roadmap items were stuck at 0/540 rows while
# their routines kept firing and kept writing "run this locally" into the log.
# This machine has egress. The crawl belongs here; the routines keep the
# editorial work they can actually do.
#
# CE QUE LE 2026-08-24 A CORRIGÉ
# Ce script n'avait aucun moyen de dire qu'il ne faisait rien, et il ne faisait
# plus rien : au 24/08, `data/city-news.json` datait du **05/08** (la bascule
# `QUERY_VERSION = 2` du 18/08 n'avait jamais rejoué les 540 villes) et
# `data/city-protected-areas.json` valait toujours `{}`, sept nuits après que le
# 17/08 eut branché `protected-areas:fetch` sur ce runner. Trois semaines de
# passes nocturnes, zéro ligne collectée, zéro signal. Deux causes, toutes deux
# traitées ici :
#   1. **un arbre de travail sale arrêtait la passe** — `git pull --rebase`
#      échoue sur un dépôt modifié, et le garde-fou « fichiers étrangers »
#      sortait en erreur avant même d'essayer. C'est exactement la panne que le
#      runner de déploiement a connue et corrigée le 19/08 : dépôt sale ⇒ on
#      travaille dans un **worktree détaché calé sur origin/main**. La correction
#      n'avait été appliquée qu'à l'un des deux runners.
#   2. **un échec ne réveillait personne** — `run_stage` avale tous les codes de
#      retour (il le doit : un GBIF en panne ne doit pas empêcher le BODACC),
#      donc une étape qui échoue chaque nuit est indiscernable d'une étape qui
#      n'a rien à faire. Désormais chaque pipeline a un compteur de couverture
#      suivi dans le temps : **incomplet et immobile depuis plus de
#      STALL_ALERT_HOURS ⇒ fichier d'état, notification bureau, e-mail Brevo**
#      (au plus un par 24 h). Un échec silencieux est le seul mode de
#      défaillance qu'on ne peut pas rattraper.
#
# Installed as a nightly cron job — see `crontab -l`.

set -uo pipefail

REPO="${REPO:-/home/flammeur/meilleurville}"
STATE_DIR="${STATE_DIR:-${HOME}/.local/state/meilleurville}"
LOG="${STATE_DIR}/data-runner.log"
LOCK="${STATE_DIR}/data-runner.lock"
STATUS_FILE="${STATE_DIR}/data-runner.status"
# Tampon d'alerte **propre à ce runner** : partager celui du déploiement ferait
# qu'une alerte de publication étoufferait une alerte de collecte pendant 24 h.
ALERT_STAMP="${STATE_DIR}/data-alert-sent-at"
# component <TAB> couverture <TAB> epoch du dernier changement de couverture.
# C'est l'immobilité, pas l'échec, qui se mesure : une étape peut échouer sans
# conséquence (rien à collecter) et une étape peut « réussir » sans rien écrire.
PROGRESS_FILE="${STATE_DIR}/pipeline-progress"
# Collecte de secours quand le dépôt est sale : worktree git détaché recalé sur
# origin/main. `node_modules`, `.env.local` et surtout `.cache` y sont des liens
# vers le dépôt — sans `.cache`, chaque passe repartirait d'un crawl vierge.
WORKTREE="${HOME}/.cache/meilleurville-data"
# Le worktree porte une **branche** et non un HEAD détaché : cette passe commite
# et pousse, et depuis un HEAD détaché `git pull --rebase origin main` refuse de
# choisir une base tandis que `git push origin main` pousserait le `main` du
# dépôt — c'est-à-dire pas le commit qu'on vient d'écrire.
WORKTREE_BRANCH="local-data-runner"
# Free space below this and a crawl is not the thing to spend it on: the SSG
# build alone writes ~33 GB into .next/ + out/.
MIN_FREE_GB=8
# Toutes les villes du seed. Une couverture en dessous = pipeline incomplet.
TARGET_CITIES=540
# Deux nuits sans avancer sur un pipeline incomplet : ce n'est plus un
# contretemps, c'est une panne. (Le lot GBIF fait 60 villes la nuit, le lot
# BODACC 180 : un pipeline vivant bouge à chaque passe.)
STALL_ALERT_HOURS=48
ALERT_COOLDOWN_H=24
# Batch sizes, overridable for a smoke test: BIODIV_LIMIT=2 NEWS_LIMIT=2 …
BIODIV_LIMIT="${BIODIV_LIMIT:-60}"
NEWS_LIMIT="${NEWS_LIMIT:-180}"

DRY_RUN=0
STATUS_ONLY=0
case "${1:-}" in
  --dry-run) DRY_RUN=1 ;;
  --status) STATUS_ONLY=1 ;;
  "") ;;
  *) echo "usage: $0 [--dry-run|--status]" >&2; exit 2 ;;
esac

mkdir -p "$STATE_DIR"
touch "$PROGRESS_FILE"

# cron gets a bare PATH; nvm's node is not on it.
NODE_BIN="$(ls -d "${HOME}"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1)"
export PATH="${NODE_BIN}:/usr/local/bin:/usr/bin:/bin"

say() { printf '%s %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*" | tee -a "$LOG"; }

# The data files this runner owns. Nothing else is ever staged: ~15 cloud agents
# push to main all day and their work must not ride along in a data commit.
OWNED=(
  data/city-biodiversity.json
  data/city-protected-areas.json
  data/city-news.json
)

# Les trois pipelines : étiquette courte, commande de statut, libellé lisible.
# `stats` tourne hors ligne dans les trois cas — c'est ce qui permet de mesurer
# la couverture sans dépendre du réseau.
COMPONENTS=(biodiv news protected)
component_label() {
  case "$1" in
    biodiv) echo "biodiversité (GBIF)" ;;
    news) echo "signaux publics (BODACC/CatNat)" ;;
    protected) echo "zones protégées (INPN)" ;;
  esac
}
component_script() {
  case "$1" in
    biodiv) echo "scripts/city-biodiversity.mjs" ;;
    news) echo "scripts/city-news.mjs" ;;
    protected) echo "scripts/city-protected-areas.mjs" ;;
  esac
}

# Couverture d'un pipeline, lue dans son propre `stats`. Les trois impriment
# « covered X/540 … » en première ligne. `?` si la commande ne répond pas — un
# point d'interrogation ne doit jamais être compté comme une couverture.
component_covered() {
  local dir="$1" comp="$2" out
  out="$(cd "$dir" && node "$(component_script "$comp")" stats 2>/dev/null | grep -oP 'covered \K[0-9]+' | head -1)"
  echo "${out:-?}"
}

# Depuis combien d'heures la couverture de ce composant n'a pas bougé, et
# mémorisation de la valeur du jour. L'horodatage suit le dernier *changement*,
# pas la dernière passe : c'est bien l'immobilité qu'on veut dater.
progress_record() {
  local comp="$1" count="$2" now prev prev_count prev_epoch
  now=$(date +%s)
  prev="$(awk -F'\t' -v c="$comp" '$1==c {print $2" "$3}' "$PROGRESS_FILE" 2>/dev/null | tail -1)"
  prev_count="${prev%% *}"
  prev_epoch="${prev##* }"
  if [[ -z "$prev" || "$prev_count" != "$count" || ! "$prev_epoch" =~ ^[0-9]+$ ]]; then
    prev_epoch="$now"
  fi
  { awk -F'\t' -v c="$comp" '$1!=c' "$PROGRESS_FILE" 2>/dev/null
    printf '%s\t%s\t%s\n' "$comp" "$count" "$prev_epoch"; } > "${PROGRESS_FILE}.new"
  mv "${PROGRESS_FILE}.new" "$PROGRESS_FILE"
  echo $(( (now - prev_epoch) / 3600 ))
}

progress_hours() {
  local comp="$1" epoch
  epoch="$(awk -F'\t' -v c="$comp" '$1==c {print $3}' "$PROGRESS_FILE" 2>/dev/null | tail -1)"
  [[ "$epoch" =~ ^[0-9]+$ ]] || { echo '?'; return; }
  echo $(( ( $(date +%s) - epoch ) / 3600 ))
}

# Un échec qui ne réveille personne se répète toutes les nuits. Fichier d'état
# (lisible par --status), notification bureau si une session est ouverte, et
# e-mail — au plus un par ALERT_COOLDOWN_H, pour que l'alarme reste lisible.
# Même mécanique que scripts/local-deploy-runner.sh, tampon distinct.
alert() {
  local subject="$1" body="$2"
  printf '%s\n%s\n\n%s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$subject" "$body" > "$STATUS_FILE"
  DISPLAY="${DISPLAY:-:0}" notify-send -u critical "MaVilleIdéale — collecte" "$subject" 2>/dev/null

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
    if (!fs.existsSync(process.env.ALERT_ENV)) { console.log("pas de .env.local"); process.exit(2); }
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
        sender: { email: "bonjour@mavilleideale.fr", name: "MaVilleIdéale — collecte" },
        to: [{ email: env.CONTACT_TO_EMAIL }],
        subject: process.env.ALERT_SUBJECT,
        textContent: process.env.ALERT_BODY,
      }),
    }).then((r) => { console.log("brevo " + r.status); process.exit(r.ok ? 0 : 4); })
      .catch((e) => { console.log("brevo " + e.message); process.exit(5); });
  ' >>"$LOG" 2>&1 && date +%s > "$ALERT_STAMP"
}

status_report() {
  local dir="$REPO" comp count hours dirty
  echo "dépôt              ${REPO}"
  dirty="$(git -C "$REPO" status --porcelain 2>/dev/null | wc -l)"
  echo "arbre de travail   ${dirty} fichier(s) modifié(s)$( ((dirty)) && echo ' — la collecte passera par le worktree propre')"
  for comp in "${COMPONENTS[@]}"; do
    count="$(component_covered "$dir" "$comp")"
    hours="$(progress_hours "$comp")"
    printf '%-18s %s/%s villes' "$comp" "$count" "$TARGET_CITIES"
    [[ "$hours" == "?" ]] && echo "  (jamais mesuré par ce runner)" \
                          || echo "  — inchangé depuis ${hours} h"
  done
  if compgen -G "${REPO}/.cache/city-protected-areas/sources/*.geojson" >/dev/null; then
    echo "couches INPN       présentes dans .cache/city-protected-areas/sources/"
  else
    echo "couches INPN       ABSENTES — voir le journal du fetch"
  fi
  command -v ogr2ogr >/dev/null && echo "ogr2ogr            ok" \
                                || echo "ogr2ogr            absent (apt install gdal-bin)"
  echo "journal            ${LOG}"
  [[ -f "$STATUS_FILE" ]] && { echo "--- dernière alerte"; cat "$STATUS_FILE"; }
  return 0
}

if (( STATUS_ONLY )); then status_report; exit 0; fi

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
  alert "collecte à l'arrêt — ${free_gb}G libres" \
"Le runner de données refuse de démarrer : il faut ${MIN_FREE_GB}G libres.

À faire : rm -rf ${REPO}/.next ${REPO}/out
Journal  : ${LOG}
État     : ${REPO}/scripts/local-data-runner.sh --status"
  exit 1
fi

# Un worktree recalé sur origin/main. Ce qu'il protège : la passe ne
# publie **que** ce qui est commité et poussé, et l'état du dossier de travail
# du propriétaire n'a plus voix au chapitre.
prepare_worktree() {
  if [[ ! -e "$WORKTREE/.git" ]]; then
    git -C "$REPO" worktree add -B "$WORKTREE_BRANCH" "$WORKTREE" origin/main >>"$LOG" 2>&1 || return 1
  fi
  git -C "$WORKTREE" fetch origin main >>"$LOG" 2>&1 || return 1
  # Restes d'un crawl interrompu entre l'écriture du JSON et le commit : ils se
  # jettent (les crawls reprennent sur `.cache`, le JSON est réécrit en entier).
  git -C "$WORKTREE" reset --hard HEAD >>"$LOG" 2>&1
  # -fd sans -x : on efface les fichiers non suivis, pas les ignorés (les liens
  # node_modules / .cache / .env.local survivent à la passe).
  git -C "$WORKTREE" clean -fd >>"$LOG" 2>&1
  # HEAD détaché (worktree créé par une version antérieure de ce script) : on le
  # rattache **sans** repartir d'origin/main, sinon un commit collecté mais non
  # poussé la nuit d'avant disparaîtrait — le script promet l'inverse.
  git -C "$WORKTREE" symbolic-ref -q HEAD >/dev/null \
    || git -C "$WORKTREE" checkout -B "$WORKTREE_BRANCH" >>"$LOG" 2>&1 || return 1
  # Recale sur origin/main en emportant un éventuel commit non poussé.
  if ! git -C "$WORKTREE" rebase FETCH_HEAD >>"$LOG" 2>&1; then
    git -C "$WORKTREE" rebase --abort >>"$LOG" 2>&1
    return 1
  fi
  ln -sfn "$REPO/node_modules" "$WORKTREE/node_modules"
  # `.cache` porte la reprise des trois crawls (GBIF, BODACC, archives INPN).
  # Sans ce lien, une passe en worktree repartirait de zéro et ne finirait pas.
  mkdir -p "$REPO/.cache"
  ln -sfn "$REPO/.cache" "$WORKTREE/.cache"
  [[ -f "$REPO/.env.local" ]] && ln -sfn "$REPO/.env.local" "$WORKTREE/.env.local"
  if ! cmp -s "$REPO/package-lock.json" "$WORKTREE/package-lock.json"; then
    say "   ATTENTION package-lock.json diffère du dépôt — node_modules partagé peut être périmé"
  fi
  return 0
}

say "=== run start (free ${free_gb}G) ==="

git -C "$REPO" fetch --quiet origin main >>"$LOG" 2>&1
if [[ -n "$(git -C "$REPO" status --porcelain)" ]]; then
  say "arbre de travail sale ($(git -C "$REPO" status --porcelain | wc -l) fichiers) — collecte depuis le worktree propre"
  git -C "$REPO" status --porcelain >>"$LOG"
  if ! prepare_worktree; then
    say "FATAL worktree de collecte indisponible"
    alert "collecte à l'arrêt — worktree indisponible" \
"Le dépôt est sale et le worktree de secours n'a pas pu être préparé.

Worktree : ${WORKTREE}
Journal  : ${LOG}
État     : ${REPO}/scripts/local-data-runner.sh --status"
    exit 1
  fi
  WORK="$WORKTREE"
else
  git checkout main >>"$LOG" 2>&1
  git pull --rebase origin main >>"$LOG" 2>&1 || { say "FATAL pull failed"; exit 1; }
  WORK="$REPO"
fi
cd "$WORK" || { say "FATAL cannot enter $WORK"; exit 1; }

summary=()
failures=()

run_stage() {
  local label="$1" timeout_s="$2"; shift 2
  say "-> $label"
  # `if cmd; then …; fi` puis `local code=$?` lisait le code du **si**, qui vaut
  # 0 quand la condition est fausse et qu'il n'y a pas de else : toute panne
  # s'écrivait « FAILED (exit 0) » et la branche 124 ne pouvait jamais sortir,
  # donc un lot coupé par le time cap se lisait comme un plantage. On capture le
  # code sur la commande elle-même.
  local code=0
  timeout "$timeout_s" "$@" >>"$LOG" 2>&1 || code=$?
  if (( code == 0 )); then
    say "   $label ok"
    return 0
  fi
  # 124 is timeout(1): the crawl is resumable and picks up where it stopped,
  # so a cut-off batch is a partial result, not a failure to report.
  if (( code == 124 )); then
    say "   $label hit the time cap — partial batch kept"
  else
    say "   $label FAILED (exit $code)"
    # Retenu pour le corps de l'alerte. Le code de retour est avalé — une étape
    # en panne ne doit pas empêcher les deux autres — mais plus perdu.
    failures+=("$label (exit $code)")
  fi
  return 0
}

# GBIF: ~45 s a city, so 60 cities is about 45 min. 540 cities = 9 nights.
run_stage "biodiversité (GBIF)" 4200 npm run biodiversity -- --limit="$BIODIV_LIMIT"

# BODACC + Géorisques: ~4 s a city, the whole seed fits in one pass.
run_stage "signaux publics (BODACC/CatNat)" 3600 npm run news -- --limit="$NEWS_LIMIT"

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
# Pourquoi l'étape n'a rien produit, en clair, pour le corps de l'alerte : la
# ligne de journal correspondante ne sort d'ici que si personne ne la lit.
pa_reason=""

if compgen -G "$PA_SOURCES/*.geojson" >/dev/null; then
  say "-> zones protégées: couches déjà en place, pas de re-téléchargement"
elif (( free_gb < PA_FREE_GB )); then
  say "-> zones protégées: fetch sauté, ${free_gb}G libres (il en faut ${PA_FREE_GB})"
  pa_reason="fetch sauté faute d'espace disque (${free_gb}G libres, il en faut ${PA_FREE_GB})"
else
  # ogr2ogr converts the shapefiles to WGS84 GeoJSON, which is what the ingest
  # reads. Without it `fetch` downloads and unpacks but produces no source
  # layer, and the run would look like a silent no-op — so say it plainly.
  if ! command -v ogr2ogr >/dev/null; then
    say "   note: ogr2ogr absent (apt install gdal-bin) — fetch téléchargera sans reprojeter"
    pa_reason="ogr2ogr absent : les archives se dépaquettent mais aucune couche GeoJSON n'en sort (apt install gdal-bin)"
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
  else
    say "-> zones protégées: ingest à jour (couches inchangées depuis la dernière passe)"
  fi
elif [[ -z "$pa_reason" ]]; then
  say "-> zones protégées: aucune couche dans $PA_SOURCES — voir le journal du fetch ci-dessus"
  pa_reason="aucune couche dans ${PA_SOURCES} après le fetch — voir le journal"
fi

# --- couverture, immobilité, alerte -----------------------------------------
# C'est ici que le runner arrête d'être muet. On mesure ce que chaque pipeline
# couvre *après* la passe, on date le dernier changement, et un pipeline
# incomplet qui n'a pas bougé depuis deux nuits déclenche l'alarme.
stalled=()
for comp in "${COMPONENTS[@]}"; do
  count="$(component_covered "$WORK" "$comp")"
  hours="$(progress_record "$comp" "$count")"
  summary+=("$comp ${count}/${TARGET_CITIES}")
  if [[ "$count" =~ ^[0-9]+$ ]] && (( count < TARGET_CITIES )) && (( hours >= STALL_ALERT_HOURS )); then
    stalled+=("$(component_label "$comp") : ${count}/${TARGET_CITIES}, inchangé depuis ${hours} h")
  elif [[ ! "$count" =~ ^[0-9]+$ ]]; then
    stalled+=("$(component_label "$comp") : couverture illisible, son stats ne répond pas")
  fi
done

if (( ${#stalled[@]} )); then
  say "PIPELINE(S) À L'ARRÊT :"
  printf '   %s\n' "${stalled[@]}" | tee -a "$LOG"
  alert "collecte à l'arrêt — ${#stalled[@]} pipeline(s) n'avancent plus" \
"$(printf '%s\n' "${stalled[@]}")
${pa_reason:+
Zones protégées : ${pa_reason}}
${failures:+
Étapes en échec cette nuit :
$(printf '  %s\n' "${failures[@]}")}
Journal : ${LOG}
État    : ${REPO}/scripts/local-data-runner.sh --status"
fi

changed="$(git status --porcelain -- "${OWNED[@]}")"
if [[ -z "$changed" ]]; then
  say "=== nothing new to commit (${summary[*]}) ==="
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
  # HEAD:main, pas main : dans le worktree la branche s'appelle
  # local-data-runner, et `git push origin main` y pousserait le main du dépôt.
  if git push origin HEAD:main >>"$LOG" 2>&1; then
    say "=== pushed: ${summary[*]} ==="
    exit 0
  fi
  say "push attempt $attempt failed (agents push to main all day) — retrying"
  sleep 20
done

say "FATAL push failed three times; the commit is local, next run will carry it"
alert "collecte : trois échecs de push d'affilée" \
"La passe a collecté (${summary[*]}) mais n'a pas pu pousser sur main.
Le commit est local, dans ${WORK} ; la passe suivante le reprendra.

Journal : ${LOG}
État    : ${REPO}/scripts/local-data-runner.sh --status"
exit 1
