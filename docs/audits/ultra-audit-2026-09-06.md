# Ultra-audit hebdomadaire — 2026-09-06

Audit autonome du dimanche. **35 commits** depuis le dernier audit (2026-08-30),
dont deux correctifs JSON-LD, deux correctifs biodiversité, un correctif F64 et
la garde `hreflang:check` étendue aux 195 paires écrites à la main.

Toutes les gardes existantes passent. Le run a trouvé **deux défauts réels que
l'outillage en place ne pouvait pas voir**, les a corrigés, et a ajouté une garde
pour que le premier ne puisse plus partir en production :

1. 🔴 **`NEXT_PUBLIC_BASE_URL` l'emporte sur la locale, et `npm run build:en` ne
   la surcharge pas.** Le correctif du 05/09 sur `lib/jsonld.ts` a ajouté le repli
   par locale sans retirer la préséance de la variable ambiguë : si `.env.local`
   la pose (c'est ce que `.env.example` prescrivait, sur le domaine FR), l'export
   **anglais** publie l'origine **française** dans son `robots.txt`, son sitemap,
   son `metadataBase` et ses `BreadcrumbList`. Mesuré en exécutant les modules.
   Le canonical, lui, reste juste — c'est exactement pourquoi rien ne le voyait.
2. 🟠 **La phrase de consentement du formulaire de connexion EN envoyait le
   lecteur sur `/legal-notice` sous le libellé « Terms »**, alors que les CGU
   anglaises sont `/terms`. La branche FR juste en dessous pointe correctement
   sur `/cgu`, et le Footer EN distingue déjà les deux pages.

Aucun secret commité. Aucun canonical vers un domaine d'aperçu. Aucune asymétrie
hreflang réelle sur 3 159 liens. Aucun écart FR/EN sur un chiffre publié
(440 paires de sous-pages ville comparées). Aucune régression de perf, aucun
import de corpus dans un composant client.

⚠️ **`npm run build` n'a pas été lancé**, conformément à `CLAUDE.md` § Commands.
Substitut détaillé en §5 — **cinquième semaine que je le signale**.

⚠️ **L'egress vers la production reste refusé depuis cette routine.** Cf. §5.

---

## 1. Vérifié — conforme

### Sync + outillage (étape 1)
- Session démarrée en `HEAD` détaché, arbre propre, aucun travail en cours.
  `git checkout main && git pull --rebase origin main` → à jour sur `7b938a4`.
  Aucun `stash`, aucun force-push.
- `npm install` — aucune vulnérabilité annoncée.
- `npx tsc --noEmit` — **0 erreur**, avant et après les corrections.
- `npm run integrity` — vert : 540 villes, guides **FR 1 080 / EN 845**, 0 score
  brut recopié, 540 villes × 4 284 signaux, glossaire 155 termes, la garde
  `og:image` (386 `page.tsx`) et la garde `jsonld` neuve du 05/09.
- `npm run hreflang:check` — OK. 39 sous-pages ville FR, 40 EN, 39 paires, plus
  les **195 paires écrites à la main** que la garde relit depuis le 02/09.
- `npm run parity` — FR 220 · EN 166, **0 route FR sans jumelle**.
- `npm run search-index:check` — à jour des deux côtés.
- `npm run sitemap:check` — vert dans les deux sens, les deux locales :
  FR **29 169** URL / 18 chunks / 134 routes statiques / 86 familles dynamiques ;
  EN **28 737** URL / 21 chunks / 78 routes statiques / 88 familles dynamiques.

### Complétude des routes (étape 2)
- Les deux défauts distincts que demande l'étape (route sans entrée sitemap ;
  entrée sitemap sans route) sont **absents** dans les deux locales. Aucune
  `page.pending.tsx`.
- **Contrôle neuf ce run — les liens internes écrits en dur.** `sitemap:check`
  compare le sitemap à l'arbre de routes ; personne ne comparait les `href`
  littéraux du code à ce même arbre. Un `<Link href="/…">` vers un chemin qui
  n'existe pas est un 404 cliquable qu'aucune garde ne voit : `tsc` type une
  chaîne, le sitemap ne connaît que ce qu'il déclare.
  Méthode : extraction des `href` **entièrement littéraux** (aucune
  interpolation, donc aucun faux positif de template) de `app/`, `components/`
  et `lib/`, confrontés à l'ensemble complet des URL du sitemap plus les routes
  statiques hors sitemap (`noindex`, alias) et les redirections déclarées.
  Résultat : **123 chemins distincts côté FR, 84 côté EN**. Un seul défaut réel
  (§2.2) ; tous les autres signalements sont des chemins de l'autre locale dans
  un composant partagé **correctement gaté** (`FranceHeatmap`,
  `HonestReviewCard`, `ConnexionForm`) ou des fichiers statiques de `public/`.
- **Le CSV presse est à jour, vérifié et non supposé.** `/presse` et `/press`
  offrent un classement complet en téléchargement — un chiffre publié que rien
  ne relie au pipeline. Les deux fichiers ont été relus ligne à ligne contre
  `CITIES_SEED` : **540 lignes, 0 slug inconnu, 0 score en écart, 0 position
  différente du tri actuel**, des deux côtés.

### SEO (étape 3)
Balayage réel : les `page.tsx` de l'arbre chargés et exécutés, leurs
`generateStaticParams()` joués, `generateMetadata()` rendue sur un échantillon
par famille incluant **systématiquement le slug le plus long** (pire cas de
longueur de titre). **988 rendus FR, 946 EN.**

- **Canonical** : présent sur toutes les routes dynamiques des deux locales.
  0 `localhost`, 0 `*.pages.dev` / `*.workers.dev`, 0 canonical FR pointant vers
  `bestcitiesinfrance.com` ni l'inverse. Seul `app/page.tsx` (racine FR)
  n'exporte pas de `metadata` : il hérite du layout, comportement voulu.
- **hreflang** : réciprocité testée paire par paire — pour chaque page déclarant
  `languages`, la page visée a-t-elle été rendue, et redéclare-t-elle l'URL de
  départ ? **3 159 liens vérifiés, 0 asymétrie réelle.** Les 2 signalements
  bruts sont les artefacts connus (`app/leaderboard/page.tsx`, non chargeable
  par un transpileur CommonJS — cf. audit du 30/08 §4.5 — et la racine FR).
- **`openGraph` sans `images`** : **0**, dans les deux locales. La garde ajoutée
  la semaine dernière tient.
- **Canonicals dupliqués** : 3, tous volontaires et déjà arbitrés —
  `/quiz` → `/city-match`, `/dashboard` → `/mes-villes`, et `/auth/callback`
  dont les deux locales partagent le chemin (`noindex, nofollow` des deux côtés).
- **`app/robots.ts`** : `/api/`, `/admin/`, `/auth` en `Disallow` — et le
  commentaire explique pourquoi les pages de compte n'y sont **pas** (un
  `Disallow` empêcherait Google de lire le `noindex`). Vérifié en **rendant** les
  métadonnées : `/dashboard`, `/favoris`, `/mes-villes`, `/connexion`,
  `/auth/callback` côté FR, `/my-account`, `/sign-in`, `/auth/callback` côté EN
  portent tous `index: false`. Chunks dérivés de `SITEMAP_CHUNK_COUNT`.
- **`alt`** : 0 `<img>` sans `alt` dans `app/` et `components/`.
- **Redirections** — contrôle neuf : les **85 lignes** de `public/_redirects`
  résolues contre l'arbre de routes des **deux** locales. **0 cible morte dans sa
  propre locale, 0 chaîne de redirections.** Les 33 lignes qui 404 côté FR et les
  50 côté EN sont le même fichier servi par les deux Workers : chacune vise le
  domaine auquel elle appartient, et sa source y est de toute façon un 404. Cela
  chiffre enfin l'arbitrage laissé ouvert le 23/08 §4.1 — le coût réel est nul.

### Intégrité des données (étape 4 — sondage)
- **540 villes**, 0 violation de bornes (`global ∈ [2,8 – 8,6]`, les 8 axes dans
  `[0, 10]`, coordonnées présentes), 0 slug dupliqué.
- Guides : **FR 1 080**, **EN 845**, `assertUniqueSlugs` rejouée pour de vrai par
  `npm run integrity` sur les deux corpus.
- **3 villes tirées** — Île de Ré (7,60), Château-Gontier-sur-Mayenne (6,80),
  Saint-Herblain (5,00) : scores numériques, dans les bornes, `computeNicheScores`
  cohérent sur les cinq scores niche et le terrain.
- **Le contrôle FR/EN, fait en grand.** C'est celui qui a attrapé les deux vrais
  bugs du projet. Les descriptions rendues des sous-pages ville ont été
  rapprochées **paire à paire** via `FR_TO_EN_CITY_SUB`, et tous les décimaux
  qu'elles citent comparés : **440 paires, 0 divergence**. Les jumelles hreflang
  affichent le même nombre, prouvé et non supposé.

### Perf (étape 5)
- **Graphe d'imports client tracé pour de vrai** depuis les **84** composants
  `"use client"`, imports transitifs suivis, `import type` écartés. Sur les JSON
  de plus de 50 Ko, **4 seulement sont atteignables** et ce sont exactement les
  quatre documentés : `search-index.json` / `.en.json` (la projection faite pour
  ça, une seule des deux part, la locale étant inlinée au build),
  `city-cards.json` (63 Ko, lu par `CityCard` qui rend dans du client) et
  `city-population.json` (140 Ko, le levier connu réservé à une passe locale).
  Les gros fichiers — `city-parks` 2,5 Mo, `city-biodiversity`, `city-news`,
  `city-protected-areas` — restent **hors du graphe client**.
- **0 import en valeur** de `data/guides`, `data/guides-en`, `lib/guide-tags`,
  `lib/guide-tags-en`, `lib/rankings` ou `data/cities-seed` depuis un composant
  client. La discipline posée le 2026-08-04 et le 2026-08-27 tient.
- `framer-motion` : toujours **aucun import réel**.
- `public/_headers` inchangé et cohérent (hashés en `immutable`, pas de
  `Cache-Control` sur `/*` — le commentaire explique la fusion de règles
  Cloudflare qui avait annulé le cache des bundles).

### Sécurité (étape 6)
- **Aucun secret commité.** Le regex du prompt et un balayage de préfixes
  (`xkeysib-`, `sk-ant-`, `ghp_`, `AKIA…`, `BEGIN PRIVATE KEY`) ne remontent que
  des citations dans d'anciens rapports d'audit. Seul `.env.example` est versionné.
- `worker/index.ts`, `lib/spam-filter.ts`, `lib/rate-limit.ts` et les stores
  **n'ont pas bougé depuis le 2026-08-27** : la revue handler par handler de
  l'audit du 30/08 reste valide et je ne la redouble pas. Inventaire inchangé —
  21 routes `/api/*`, tout POST public porte un `rateLimit`, toute lecture privée
  est scopée sur `user.id` via `authedUser`.
- Spot-check du seul endpoint que l'audit précédent n'avait pas nommé,
  `GET /api/cities/search` : rate-limité (30 req/min par IP), lecture publique du
  seed, projection de 6 champs, aucun accès D1, `Cache-Control` public. Une nit
  de robustesse sans portée sécurité en §4.5.

---

## 2. Cassé — trouvé cette semaine

### 2.1 🔴 L'export EN peut publier l'origine FR — le correctif du 05/09 est incomplet côté environnement

Le 05/09, `dbf587a` a corrigé un vrai défaut : `lib/jsonld.ts` était le seul
module d'origine sans repli par locale, et le site EN publiait
`https://www.mavilleideale.fr/cities/lyon/schools` dans ses `BreadcrumbList` —
une URL qui n'existe pas sur le domaine FR. Le correctif ajoute le repli :

```ts
process.env.NEXT_PUBLIC_BASE_URL ?? (DEFAULT_LOCALE === "en" ? EN_URL : FR_URL)
```

**Le repli est juste, la préséance ne l'est pas.** `NEXT_PUBLIC_BASE_URL` reste
lue **en premier**, et `npm run build:en` vaut
`NEXT_PUBLIC_DEFAULT_LOCALE=en npm run build` : il ne surcharge **que** la
locale. Or les deux exports sortent du **même arbre de travail et du même
`.env.local`** — `scripts/local-deploy-runner.sh:231` recopie ce fichier dans le
worktree de publication, et Next le lit à chaque build. Une valeur posée là
survit donc au build EN et écrase la locale.

Ce n'est pas une hypothèse sur un fichier que je ne peux pas lire : c'est ce que
**`.env.example`, le gabarit du dépôt, prescrivait**, sur le domaine FR, sous le
commentaire « Canonical origin of THIS deployment » — vrai quand un dépôt sert un
domaine, faux ici où un arbre en sert deux.

Mesuré en exécutant les modules dans les deux régimes :

| | `robots.txt` | sitemap | `BreadcrumbList` |
|---|---|---|---|
| `DEFAULT_LOCALE=en`, variable absente | `bestcitiesinfrance.com` | `bestcitiesinfrance.com` | `bestcitiesinfrance.com/cities` |
| `DEFAULT_LOCALE=en`, `BASE_URL=` domaine FR | **`www.mavilleideale.fr`** | **`www.mavilleideale.fr`** | **`www.mavilleideale.fr/cities`** |

Soit, sur le site anglais : un `robots.txt` qui annonce
`https://www.mavilleideale.fr/sitemap-index.xml`, un sitemap qui déclare
**28 737 URL sur l'autre domaine** (Google rejette un sitemap inter-domaines),
un `metadataBase` français — donc toute URL relative résolue vers le mauvais
hôte — et les `BreadcrumbList` que `dbf587a` venait de corriger, revenues à leur
état d'avant. Cinq modules sont concernés : `app/robots.ts`, `app/sitemap.ts`,
`app/layout.tsx`, `lib/jsonld.ts`, `app/feed.xml` et `app/guides/feed.xml`.

**Pourquoi rien ne pouvait le voir.** Le canonical passe par `ORIGIN_BY_LOCALE`
(`lib/i18n.ts`), qui ne connaît que la locale : il est juste quoi qu'il arrive.
`scripts/check-deploy-locale.mjs` ne lisait **que** le canonical et le
`<html lang>` — et son en-tête affirmait lire « le `NEXT_PUBLIC_BASE_URL`
réellement inliné », ce qui était faux et expliquait sa confiance. `sitemap:check`
et le balayage de métadonnées tournent sans `.env.local`, donc toujours dans le
régime sain. La seconde origine du site n'était contrôlée nulle part.

Je ne peux pas lire le `.env.local` de la machine de publication, donc je ne peux
pas dire si la production est touchée **aujourd'hui**. Deux gestes ce run :
`.env.example` cesse de prescrire le piège, et le déploiement refuse désormais un
export dont l'origine contredit le Worker visé (§3).

### 2.2 🟠 Le lien « Terms » du formulaire de connexion anglais menait aux mentions légales

`app/connexion/ConnexionForm.tsx` est partagé par `/connexion` (FR) et
`/sign-in` (EN), correctement gaté sur la locale. Sa phrase de consentement :

```tsx
By signing in, you agree to our <a href="/legal-notice">Terms</a> and <a href="/privacy-policy">Privacy Policy</a>.
…
En vous connectant, vous acceptez nos <a href="/cgu">CGU</a> et notre <a href="/confidentialite">politique de confidentialité</a>.
```

Les deux pages existent et ne disent pas la même chose : `/terms` est la jumelle
EN de `/cgu` (conditions d'utilisation), `/legal-notice` celle de
`/mentions-legales` (éditeur, hébergeur, mention d'affiliation). La branche FR
pointe bien sur les CGU ; la branche EN envoyait le lecteur ailleurs que sur le
texte qu'on lui fait accepter. `components/Footer.tsx` distingue pourtant déjà
« Terms of use » → `/terms` de « Legal notice » → `/legal-notice` : le formulaire
était le seul endroit du site à confondre les deux.

Trouvé par le contrôle de liens de §1, qui a signalé `/legal-notice` depuis un
fichier de l'arbre FR ; la vérification a montré que le chemin était bon pour la
locale mais faux pour le libellé.

---

## 3. Corrigé

3 fichiers. Aucun score déplacé, aucun refactor structurel, aucune migration D1,
**aucun déploiement**.

| # | Correction | Fichier |
|---|---|---|
| 1 | `/legal-notice` → `/terms` dans la branche EN de la phrase de consentement | `app/connexion/ConnexionForm.tsx` |
| 2 | **Garde neuve** : le déploiement refuse un export dont l'origine exportée contredit le Worker visé | `scripts/check-deploy-locale.mjs` |
| 3 | `NEXT_PUBLIC_BASE_URL` commentée, avec la mesure et la raison | `.env.example` |

Vérifications après coup : `tsc` **0 erreur**, `integrity`, `hreflang:check`,
`parity`, `search-index:check`, `sitemap:check` tous verts et **inchangés**
(FR 29 169 / EN 28 737 — aucune route neuve, aucune longueur de titre touchée).
Le balayage de liens rejoué ne signale plus `/legal-notice`.

### La garde ajoutée — la seconde origine, lue dans l'export

`npm run cf:deploy` et `cf:deploy:en` appellent déjà
`scripts/check-deploy-locale.mjs`, qui lit `out/index.html`. Il vérifiait le
canonical et le `<html lang>` : les deux valeurs dérivées de la **seule locale**,
donc les deux toujours justes. Il vérifie désormais aussi l'origine réellement
écrite dans `out/robots.txt` (ligne `Sitemap:`) et dans `out/sitemap/0.xml` —
les deux fichiers alimentés par `NEXT_PUBLIC_BASE_URL`, tous deux conservés par
le `postbuild`.

Lire la **sortie** plutôt que l'environnement est le point : la valeur peut venir
du shell, de `.env.local`, de `.env.production` ou d'un export oublié, et aucune
de ces provenances n'est visible depuis le script. L'export, lui, dit la vérité.

Les deux causes possibles reçoivent deux messages distincts, parce qu'elles ont
deux remèdes : canonical ou `lang` faux ⇒ c'est l'export de l'autre locale qui
traîne dans `out/` (défaut historique du 10/08, message inchangé) ; canonical
juste mais origine fausse ⇒ l'export est le bon et c'est la variable qui
contredit la locale, avec la marche à suivre. Un fichier absent de l'export ne
bloque pas le déploiement : il est signalé, le contrôle historique restant
décisif.

*Testé dans les cinq cas* sur un `out/` synthétique, supprimé ensuite : export EN
sain vers EN (passe), export EN à origine FR (refus, message « la variable »),
export FR vers EN (refus, message « mauvais export »), export FR sain vers FR
(passe), fichiers absents (passe, avec l'avertissement). Coût : deux lectures de
fichier.

---

## 4. À arbitrer

### 4.1 🔴 La préséance elle-même n'est pas corrigée — décision propriétaire

Ce run pose une garde au déploiement et retire le piège du gabarit. **La cause
reste** : cinq modules lisent `process.env.NEXT_PUBLIC_BASE_URL ?? (locale…)`,
donc une variable qui ne connaît pas la locale l'emporte sur une locale qui, elle,
est explicite.

Le remède est d'inverser la préséance — faire gagner `NEXT_PUBLIC_BASE_URL_FR` /
`_EN` selon `NEXT_PUBLIC_DEFAULT_LOCALE`, et ne garder `NEXT_PUBLIC_BASE_URL` que
comme repli. **Je ne l'ai pas fait**, pour une raison : je ne sais pas si
quelqu'un s'en sert pour publier sur un domaine d'aperçu. Si personne ne le fait,
c'est cinq lignes et le trou se referme ; si quelqu'un le fait, l'inversion casse
son usage en silence. C'est un arbitrage de propriétaire, pas une correction sûre.

Le geste de vérification tient en une ligne sur la machine de publication :

```bash
grep -n NEXT_PUBLIC_BASE_URL ~/…/meilleurville/.env.local
```

Si la variable y est posée, l'export EN publié aujourd'hui porte l'origine FR
dans son `robots.txt`, son sitemap et ses données structurées — et le prochain
`npm run cf:deploy:en` refusera de partir, avec le message qui dit quoi faire.

### 4.2 🟠 Le séparateur décimal français : le site écrit « 6.8/10 »

Constat neuf, mesuré ce run. `formatScore()` (`lib/utils.ts`) est un
`score.toFixed(1)` nu, et **121 fichiers de page FR** appellent `toFixed(1)`
directement. Le point est donc le séparateur décimal de tous les scores rendus
sur le site français — dans le corps des pages **et** dans les descriptions
qu'un lecteur voit en SERP : « Score coût 8.0/10 », « Ratio prix/loyer : 10.1 »,
« Score composite 1.7/10 ». **29 fichiers FR** en émettent au moins un dans leurs
métadonnées, dont les gabarits de sous-pages ville, donc à l'échelle des
540 villes.

Ce n'est pas une préférence de ma part : **le dépôt est en désaccord avec
lui-même**. Huit fichiers corrigent explicitement en `.toFixed(1).replace(".", ",")`
— `demographie`, `statistiques`, la carte biodiversité de `CityProfile` — si bien
que `/villes/<ville>/demographie` affiche « 5,6 % » de seniors au-dessus d'un
score écrit « 5.6/10 », sur la même page. `formatNumber()` utilise bien
`Intl.NumberFormat("fr-FR")` pour les milliers : seuls les décimaux échappent à
la convention.

**Je n'ai rien corrigé, et c'est délibéré.** `formatScore` est partagé avec les
pages EN, où le point est correct : un correctif naïf casserait l'anglais. Le
remède propre est un helper conscient de la locale, appliqué à ~500 sites
d'appel — un refactor, et un changement visible sur toutes les pages FR. À
arbitrer d'un coup, dans un run dédié, ou à laisser tel quel en l'assumant.

### 4.3 Descriptions et titres — arbitrage inchangé, chiffres à jour

Le balayage donne, sur mon échantillon (qui inclut toujours le pire cas) :

| | titres > 60 | dont pages statiques | desc > 160 | dont pages statiques |
|---|---|---|---|---|
| FR | 340 rendus / 95 fichiers | 34 | 147 rendus / 89 fichiers | 63 |
| EN | 289 rendus / 68 fichiers | 11 | 113 rendus / 59 fichiers | 35 |

Les plus longues descriptions sont les mêmes hubs éditoriaux que les trois
audits précédents (`/synthese` 250, `/palmares` 238, EN `/synthesis` 269), et les
titres les plus longs restent des gabarits de sous-pages ville allongés par le
nom de commune (Château-Gontier-sur-Mayenne est le pire cas dans les deux
locales). L'arbitrage des audits du 09/08 §4.6, 16/08 §4.2 et 30/08 §4.2 tient et
je ne le rouvre pas : le segment de tête identifie la page à 60 caractères, et
Google indexe le titre complet même s'il n'en affiche qu'une partie.

### 4.4 L'index de recherche continue de grossir

Mesuré : FR **283 517 o brut / 44 584 o gzip**, EN **220 397 / 36 617**. Il y a
huit jours : 267 Ko / 40 Ko et 204 Ko / 32 Ko. Soit **+4,5 Ko gzip en une
semaine** côté FR — sensiblement plus vite que le « +1 à 1,5 Ko par mois » estimé
le 30/08, parce que le corpus a pris 54 guides FR et 65 EN cette semaine.

Toujours pas un défaut : `SearchPaletteLauncher` charge la palette en
`next/dynamic` au premier déclenchement, donc une page où personne ne cherche ne
télécharge rien. Mais la trajectoire mérite d'être suivie, et les deux leviers
restent ceux du 30/08 (couper `intro`/`excerpt` de la projection, ou servir
l'index en `fetch`). À mesurer avant d'agir.

### 4.5 Nit — `?limit=abc` sur `/api/cities/search` renvoie zéro résultat

`Math.min(parseInt(url.searchParams.get("limit") ?? "8"), 20)` vaut `NaN` sur une
valeur non numérique, et `.slice(0, NaN)` rend un tableau vide : la requête
répond `{results: []}` au lieu des 8 par défaut. Aucune portée sécurité (l'entrée
est bornée par le haut, l'endpoint est rate-limité). Non corrigé : c'est le
Worker, que je ne peux pas exécuter depuis cette routine, pour un défaut qui ne
casse rien.

### 4.6 Rappels d'arbitrages déjà ouverts

- **`app/quiz/page.tsx`** : page complète, canonique de `/city-match`, absente du
  sitemap, générée à chaque build et jamais atteignable. Signalée les 23/08 et
  30/08 ; toujours là. Suppression = retrait de contenu, donc arbitrage propriétaire.
- **`framer-motion` toujours déclaré dans `package.json`**, importé nulle part,
  zéro octet livré. `npm uninstall` touche `package-lock.json`, que ~15 agents
  modifient en semaine — **huitième report consécutif**. À huit, le report n'est
  plus une décision : planifier le run dédié.
- **`data/city-population.json` (140 Ko) sur les 1 080 pages ville** via
  `CityProfile → DemographyCard`. Remède connu, mais il touche le rendu des pages
  ville : passe locale avec build, pas une routine.
- **Les 33 + 50 redirections cross-locale** : chiffrées ce run (§1), coût réel
  nul, correctif non additif. Refermable comme « constaté, sans suite ».
- **Classement biodiversité** : ne pas recréer `/classements/biodiversite`, ne pas
  remettre `RICHNESS_RANKING_PUBLISHED` ni `GREEN_SPACE_RANKING_PUBLISHED` à
  `true`. Rien à faire côté routine.
- **Les 27 scores en dur de `n8n/workflows/social-media-daily.json`** restent en
  écart avec le pipeline (jusqu'à 1,6 point). Décision inchangée depuis le 09/08 :
  le remède est de faire lire le seed au workflow, pas de recopier 27 valeurs.

---

## 5. Écart avec le prompt de la routine

Les deux mêmes que les quatre semaines précédentes, tous deux inchangés.

**L'étape 1 demande `npm run build`**, que `CLAUDE.md` interdit depuis une
session cloud (§ Commands, note du 2026-08-08 : > 4 h 30 sans finalisation,
`.next` à 25 Go, `ENOSPC`). J'ai suivi `CLAUDE.md`. Le substitut exécuté en
entier : `npx tsc --noEmit`, `npm run integrity` (qui rejoue les vraies gardes de
chargement en 2 s), `hreflang:check`, `parity`, `search-index:check`,
`sitemap:check`, plus le rendu réel des `generateMetadata` de tout l'arbre
(1 934 rendus), le traçage du graphe d'imports client, le contrôle de liens
littéraux et celui des redirections. **Cinquième semaine que je le signale** : je
recommande que l'étape 1 du prompt remplace `npm run build` par cette
combinaison.

**Les étapes 2 et 3 supposent qu'on peut interroger les sites.** L'egress est
refusé depuis la routine. Tout ce qui touche au comportement d'edge —
redirections réellement servies, canonicalisation d'hôte, `robots.txt` en
production, propagation d'un déploiement — n'est vérifiable qu'en **lisant**
`worker/index.ts` et l'export, jamais en le constatant. Le défaut §2.1 de ce run
est exactement de cette classe : il ne se voit ni dans le dépôt seul (il dépend
d'un `.env.local` hors dépôt) ni depuis ici (il faudrait lire le `robots.txt`
servi par `bestcitiesinfrance.com`). **Une seule requête `curl` vers
`https://bestcitiesinfrance.com/robots.txt` trancherait la question posée en
§4.1.** Deux pistes, inchangées : autoriser l'egress vers les deux domaines de
production depuis cette routine, ou déclarer le comportement d'edge hors
périmètre pour qu'il soit contrôlé ailleurs.
