# Déploiement et build — historique et runbook manuel

> Déplacé hors de `CLAUDE.md` le 2026-10-29 (le fichier faisait 535 Ko et chaque routine le relisait).
> Le résumé opérationnel reste dans `CLAUDE.md` § Déploiement.
> Les journaux de run s'ajoutent **ici**, jamais dans `CLAUDE.md`.


## Commands

```bash
npm install
npm run dev          # http://localhost:3000 (Turbopack)
npx tsc --noEmit     # strict TS pass (currently clean)
npm run integrity    # gardes de lib/data-integrity + contrôle des scores cités dans les guides (bruts vs rendus) hors build — 2 s. **À LANCER AVANT DE POUSSER UN BATCH DE CONTENU.**
npm run sitemap:check # sitemap ↔ arbre de routes, dans les deux sens, les deux locales — 22 s. **À LANCER APRÈS TOUTE NOUVELLE ROUTE.** Exécute app/sitemap.ts et les generateStaticParams() réels : URL déclarée sans page (le défaut biodiversité du 06/08, 604 x 404), page indexable sans URL (F61, expat-retour), doublons, origine, lastModified, chunk > 50 000.
npm run coast        # data/city-coast.json : distance à la mer ouverte des 540 villes (Natural Earth, ~5 s, egress requis)
npm run build        # full SSG build — 56 185 pages, ~15 min (le « ~3 000 » historique est très obsolète)
npm run lint         # 231 errors / 27 warnings (mostly @next/next/no-html-link-for-pages — harmless under output:"export" — plus residual react/no-unescaped-entities; none are runtime bugs). See latest docs/audit-*.md for the rule breakdown.
```

⚠️ **`npm run build` ne tient plus dans le quota disque d'une session cloud** (constaté 2026-08-04,
deux tentatives). Le build compile, passe TypeScript et **génère les 56 185 pages avec succès en
~12,5 min**, puis meurt en `ENOSPC` sur « Finalizing page optimization » : `.next` seul dépasse
l'allocation d'écriture de la session, avant même que `out/` soit écrit. Conséquences pratiques
pour une routine planifiée :
- L'étape qui valide le contenu (rendu de chaque page, `assertUniqueSlugs`, imports) est la
  **génération**, et elle, elle passe. Un run qui atteint `(56185/56185)` a validé son contenu.
- La finalisation qui échoue est du bundling/export, elle ne relit pas les données.
- Nettoyer `.next` et `out` **avant** de relancer quoi que ce soit — sinon les fichiers de sortie
  des outils eux-mêmes deviennent illisibles (ENOSPC silencieux : les logs reviennent vides, ce
  qui se lit à tort comme un plantage sans message).
- Ne pas conclure « build cassé » sur un `EXIT=1` sans avoir lu la ligne d'erreur : ici la cause
  est l'environnement, pas le code. La vérification complète (export `out/`) reste une passe locale.

⚠️ **Mise à jour 2026-08-08 : le « ~12,5 min » ci-dessus ne vaut plus pour une session cloud.**
Constaté sur le batch 27 : la génération tournait encore **après 4 h 30**, `.next` à **25 Go** et
toujours en croissance régulière (~1 Go / 10 min), sans jamais atteindre la finalisation — la
session a été arrêtée à 3 Go d'espace libre pour ne pas figer le conteneur. Deux conséquences
opérationnelles :
- **Ne lance pas `npm run build` pour valider un batch de contenu depuis une routine.** Tu ne verras
  ni `(56185/56185)` ni la moindre erreur, et tu auras brûlé plusieurs heures pour un ENOSPC.
- Quand la sortie est tuyautée (`| tail`), rien ne s'affiche avant la fin : suivre l'avancement par
  `du -sh .next` et `df -h`, pas par le log. Et **nettoyer `.next`/`out` avant de quitter**, sinon le
  `/tmp` des outils sature à son tour et leurs sorties reviennent vides (constaté ce run).
- ⚠️ **Conséquence trouvée le 2026-08-09 : `tsc` ne remplace pas le build.** Les gardes
  `assertUniqueSlugs` / `assertKnownSlugs` ne tournent qu'au **chargement** des modules de données,
  donc au `next build` / `next dev` — et un `relatedGuides` pointant vers un slug inexistant est
  parfaitement bien typé. Le batch `vacances-celibataire` du 08/08 a ainsi laissé `main`
  **non-buildable pendant une nuit** sans qu'aucun contrôle ne parle. D'où **`npm run integrity`**
  (`scripts/check-integrity.mjs`) : il exécute les vrais `cities-seed` / `guides` / `guides-en`,
  donc les vraies gardes, en deux secondes. **Le lancer avant tout push de contenu**, au même titre
  que `npm run search-index` après un guide EN.
- Le substitut qui marche, et qui a validé le batch 27 : `npx tsc --noEmit` (propre), puis un script
  `npx tsx` qui importe `@/data/guides-en` — l'import exécute `assertUniqueSlugs` — et vérifie sur
  les nouveaux slugs longueur de `metaTitle`/`metaDesc`, nombre de sections, `category`, présence
  des `relatedCities` dans `CITIES_SEED` et absence d'unités ascii-strippées. Une minute au lieu de
  cinq heures, et ça couvre ce qu'un batch de guides peut casser. Le rendu réel reste une passe locale.

## Déploiement — automatique la nuit, manuel si tu es pressé

⚠️ **Depuis le 2026-10-09, publication et collecte tournent sur GitHub Actions**, la machine Linux
du propriétaire ayant été retirée : `.github/workflows/deploy.yml` (chaque jour à 05h30 UTC,
rien ne part si `main` n'a pas bougé depuis la dernière publication réussie ; secret
`CLOUDFLARE_API_TOKEN`) et `.github/workflows/data-runner.yml` (02h20 / 14h20 UTC, exécute
`scripts/local-data-runner.sh` tel quel, `.cache` conservé entre passes par `actions/cache`).
Tout ce qui suit sur le cron local, `~/.local/state/meilleurville` et le worktree décrit le
mécanisme d'origine ; la fraîcheur de la prod se lit désormais dans l'onglet Actions
(`gh run list --workflow deploy.yml`), pas dans un journal local. Lancer une publication à la
main : `gh workflow run deploy.yml`.

**Depuis le 2026-08-10, `scripts/local-deploy-runner.sh` publie `main` chaque nuit à 04h12 UTC**
(cron de cette machine, à côté du data-runner). Il ne fait rien si `main` n'a pas bougé, ne tourne
pas pendant le crawl du data-runner, passe `tsc` + `npm run integrity` avant de publier, déploie FR
puis EN, vérifie que les deux domaines répondent 200 et n'enregistre le sha publié
(`~/.local/state/meilleurville/deployed-sha`) que si tout est vert — un échec est donc réessayé la
nuit suivante, pas oublié. Journal : `~/.local/state/meilleurville/deploy-runner.log`.
`--dry-run` liste les commits qui partiraient ; `--force` republie même sans changement ;
`--status` dit en trois lignes où en est la prod (sha publié, âge, commits en attente).

⚠️ **Un arbre de travail sale ne bloque plus la publication — c'est le correctif du 2026-08-19.**
Le runner refusait de publier tant que le dépôt portait des fichiers modifiés. Refuser était juste
(on ne publie pas du travail que personne n'a validé), mais le résultat était la panne que ce
script existe pour empêcher : 175 fichiers laissés par une session interrompue ont gardé trois
commits de routine en 404 pendant une journée, et la seule trace était une ligne de journal que
personne ne lit. Désormais, dépôt sale ⇒ la publication passe par un **worktree git détaché calé
sur `origin/main`** (`~/.cache/meilleurville-deploy`, `node_modules` et `.env.local` en liens vers
le dépôt) : on ne publie toujours **que ce qui est commité et poussé**, et l'état du dossier de
travail n'a plus voix au chapitre. Deux gardes ajoutées avec : une passe qui n'aboutit pas alors
que la prod a plus de 36 h de retard **alerte** (fichier d'état, notification bureau, e-mail Brevo
depuis `bonjour@mavilleideale.fr`, au plus un par 24 h), et un `.next`/`out` abandonné depuis plus
de 6 h est effacé au lieu d'affamer le build suivant — les 35 Go d'un build manuel interrompu
suffisaient à faire échouer la passe sur le plancher d'espace libre.

La suite reste vraie pour un déploiement manuel, et explique ce que le runner fait à ta place.

Aucune routine ne déploie : elles poussent sur `main`, et c'est tout. Avant l'automatisation, rien
ne reliait `main` à la production, donc **pousser n'était pas publier**. Vérifié le 2026-08-10 : le site en ligne était
**cinq jours en retard** sur `main` (les sous-pages biodiversité du 06/08, `/pour-qui/navetteurs-hybrides`
du 07/08 et le batch `parent-solo` répondaient 404 en production alors qu'ils étaient dans le dépôt).
C'est le mode de défaillance à surveiller : il ne produit aucune erreur, seulement du travail invisible.

Le runbook complet, dans l'ordre, ~50 min par domaine :

```bash
nvm use 22                 # wrangler exige Node >= 22 ; le node par défaut de la machine est 20
npx tsc --noEmit && npm run integrity && npm run parity
rm -rf .next out           # le build a besoin de ~35 Go libres ; un reste de build précédent les mange
npm run build              # FR — 58 396 pages, ~6,5 min de génération + finalisation/export
npm run cf:deploy          # -> www.mavilleideale.fr (worker `meilleurville`)
rm -rf .next out
npm run build:en           # EN — même arbre, NEXT_PUBLIC_DEFAULT_LOCALE=en
npm run cf:deploy:en       # -> bestcitiesinfrance.com (worker `meilleurville-en`)
```

**Le piège que garde `scripts/check-deploy-locale.mjs`** : les deux `wrangler.toml` pointent vers le
**même** dossier `out/`, et la locale est figée au build. Enchaîner `npm run build` puis
`cf:deploy:en` publierait donc le site **français** sur le domaine anglais, sans qu'aucune commande
n'échoue. Les deux scripts `cf:deploy*` lisent maintenant le `<link rel="canonical">` réellement
inliné dans `out/index.html` et refusent de partir si l'export ne correspond pas au worker visé.

Chiffres réels du 2026-08-10, pour savoir à quoi s'attendre : 58 396 pages générées en 5,8–6,5 min,
`out/` fait ~9 Go et 117 000 fichiers, dont ~57 300 nouveaux ou modifiés à téléverser ; l'upload
prend **11 à 13 min** par domaine (`Uploaded meilleurville (799 s)`, `meilleurville-en (668 s)`).
Compter ~35 min par domaine, build compris.

Puis on vérifie **en ligne**, avec `curl -o /dev/null -w '%{http_code}'`, une page livrée depuis le
dernier déploiement — une 404 sur une page présente dans `out/` veut dire que le déploiement n'est
pas allé au bout, quoi qu'en dise le log. **Mais laisse passer 2 à 5 minutes** : la propagation des
assets n'est pas instantanée, et une page vérifiée dans la minute qui suit le déploiement répond
encore 404 avant de passer à 200 sans que rien n'ait été refait. Vérifier trop tôt, c'est fabriquer
un faux incident.

Une dernière chose sur les URL de contrôle : côté EN, l'arbre servi est `out/en/**` (le Worker
réécrit `/<chemin>` en `/en/<chemin>`), et les départements sont **slugués**, pas numérotés
(`/departments/ain/tax`, pas `/departments/01/tax`). Prends l'URL dans `out/`, ne la devine pas.
