# Ultra-audit hebdomadaire — 2026-08-02

Audit autonome du dimanche. 50 commits depuis le dernier audit (2026-07-26).
`npx tsc --noEmit` propre avant et après corrections. Build : compilation ✓,
TypeScript ✓, **55 777 pages générées ✓**, l'étape de copie vers `out/` a échoué
sur `ENOSPC` — contrainte disque de l'environnement, pas un défaut du code
(détail en fin de rapport). Les mesures ci-dessous portent sur les
**54 646 fichiers HTML** réellement produits dans `.next/server/app`, ce que
`next export` se contente de recopier.

Deux constats structurels de fond, jamais remontés par les audits précédents :
**hreflang absent sur 94 % des pages** et **un chunk client de 5,9 Mo qui
embarque tout le corpus éditorial**. Les deux sont documentés en « à arbitrer »
avec la mesure, pas corrigés — ce sont des refactors.

---

## 1. Vérifié — conforme

### Sync + build
- `git checkout main && git pull --rebase origin main` — à jour, arbre propre.
  Aucun `stash`, aucun force-push. 50 commits depuis le 26/07 (F62 biodiversité +
  zones protégées INPN, tourisme batch 22 FR / 23 EN, population Insee RP 2022,
  revenus Filosofi, palmarès août, vacances-célibataire batch 1).
- `npm install` — 0 vulnérabilité annoncée.
- `npx tsc --noEmit` — **0 erreur**, avant et après les corrections de ce rapport.
- `npm run build` — compilé en 44 s, TypeScript en 54 s, **55 777/55 777 pages
  générées en 13,6 min**. Aucune erreur de rendu.

### Complétude des routes (étape 2)
Les deux défauts sont cherchés séparément : route sans entrée sitemap, et entrée
sitemap sans route.

| Groupe | Routes sur disque | Entrées sitemap | Écart |
|---|---|---|---|
| `villes/[slug]/*` (FR) | 39 | 39 | aucun |
| `cities/[slug]/*` (EN) | 40 | 40 | aucun |
| `pour-qui/[profil]` | 32 (`PROFILE_PAGES`) | 32 | aucun |
| `for-who/[slug]` (EN) | 13 (`EN_PROFILES`) | 11 | **2 manquantes → corrigé** |
| `red-flags/themes` (EN) | 28 | 28 | aucun |
| `classements` | 19 `RANKING_META` + 10 owner + 3 standalone | idem | aucun |

`biodiversite` / `biodiversity` : répertoires présents mais garés en
`page.pending.tsx`, et le sitemap n'émet leurs URL que sous
`hasBiodiversityData()` — qui est faux partout (`data/city-biodiversity.json`
vaut `{}`). Route et sitemap sont donc cohérents : ni l'un ni l'autre n'existe.
Correct, rien à faire.

### Intégrité des données (étape 4 — sondage)
- **540 villes**, 0 violation : `global ∈ [2,8 – 8,6]`, les 8 axes numériques
  finis dans `[0, 10]`. 0 slug dupliqué dans le seed.
- Guides : **FR 894**, **EN 541**, 0 slug dupliqué de part et d'autre.
  `assertUniqueSlugs()` bien câblé aux deux corpus (`data/guides.ts:43988`,
  `data/guides-en.ts:20975`).
- **Parité hreflang FR/EN sur 3 villes tirées** (nantes, perpignan, annecy) —
  c'est le contrôle qui a attrapé les deux vrais bugs du projet :

  | Ville | Global FR | Global EN | Sécurité FR | Sécurité EN |
  |---|---|---|---|---|
  | Nantes | 6,9 | 6,9 | 4,0 | 4,0 |
  | Perpignan | 4,7 | 4,7 | 4,3 | 4,3 |
  | Annecy | 7,3 | 7,3 | 6,3 | 6,3 |

  Les sous-dimensions coïncident aussi (3,9 / 3,7 / 6,7). La convention de
  direction tient toujours.
- Couvertures de données conformes à `CLAUDE.md` : population 538/540, revenus
  533/540, parcs 540/540.

### Sécurité (étape 6)
- **Aucun secret commité.** Le regex du prompt ne remonte que les rapports
  d'audit antérieurs ; aucun préfixe `xkeysib-` / `sk-ant-` / `ghp_` / `AKIA…`
  dans les sources suivies. La seule occurrence de `xkeysib-` est un commentaire
  de documentation (`lib/brevo.ts:5`).
- **Validation à la frontière** : chaque endpoint public en écriture combine
  rate-limit et `safeParse` zod (`/api/comments`, `/contact`, `/feedback`,
  `/newsletter`, `/vacances/newsletter`, `/alertes/subscribe`, `/reviews`,
  `/auth/*`). Une exception trouvée — `/api/quiz` — corrigée (§3).
- **Aucune fuite inter-utilisateur** : `handleFavorites`, `handleProjections`,
  `handleAccount`, `handleAlertesList` passent tous par `authedUser(request)`
  puis filtrent sur `user.id` / `user.email`. `handleAlertesList` porte même le
  commentaire expliquant pourquoi l'exposition par email nu est refusée.
  `removeProjection(user.id, id)` est scopé propriétaire.
- **`/widget/embed` : pas de XSS.** Les paramètres `city` / `city2` ne servent
  que de clé de recherche dans `CITIES_SEED` ; un slug inconnu rend un littéral
  statique, et toutes les chaînes issues du seed passent par `escapeHtml`.
  Rien de contrôlé par l'appelant n'atteint le HTML, malgré `frame-ancestors *`.
- **`getClientIp`** refuse explicitement `X-Forwarded-For` au profit de
  `CF-Connecting-IP`, avec le commentaire qui explique pourquoi. Correct.
- Les endpoints coûteux (auth, IA) doublent le rate-limit mémoire d'un
  `rateLimitD1` qui survit au recyclage d'isolat, plus le garde-fou
  `AI_DAILY_BUDGET`. Cohérent.

### SEO — ce qui est bon
- **Canonical : 54 645 / 54 646 pages.** La seule sans canonical est
  `_global-error.html`, la frontière d'erreur interne — correct, elle n'a pas
  vocation à être indexée. **0 canonical pointant vers `localhost`, `vercel.app`
  ou un domaine d'aperçu.** Toutes les routes dynamiques ont bien
  `alternates.canonical` en source.
- Titres : le template du layout est bien un `%s` nu (`app/layout.tsx:68`), sans
  suffixe de marque. Les suffixes présents sur les hubs sont volontaires et
  passent par `hubTitle()`.
- `app/robots.ts` : `/api/`, `/admin/`, `/auth` en `Disallow` ; `/dashboard`
  (`index:false, follow:false`), `/favoris` et `/mes-villes`
  (`index:false, follow:true`) en **noindex par metadata** — le bon choix, un
  `Disallow` empêcherait Google de lire le noindex et produirait des zombies
  « indexed though blocked ». Les chunks sitemap sont dérivés de
  `SITEMAP_CHUNK_COUNT`, donc pas de dérive possible avec `robots.txt`.
- Marque : aucune occurrence de `MaVilleIdeal` sans accent ni de
  `mavilleideal.com` dans le code.
- Configuration cohérente : `wrangler.toml` fixe
  `NEXT_PUBLIC_BASE_URL = "https://www.mavilleideale.fr"`, crons
  `["0 7 * * SUN", "0 8 * * MON"]`, `cpu_ms = 1000`, D1 bindée.

---

## 2. Cassé — trouvé cette semaine

### 2.1 🔴 hreflang absent sur 51 743 pages sur 54 646 (94 %)

**C'est le plus gros défaut SEO du site, et il est invisible à la lecture du
code.** Le layout racine déclare bien `alternates.languages` avec
`fr` / `en` / `x-default` (`app/layout.tsx:50-56`). Mais Next.js **remplace
l'objet `alternates` entier** quand une page en fournit un : toute route qui
retourne `alternates: { canonical: … }` sans répéter `languages` perd le hreflang
hérité, silencieusement.

Mesuré sur le HTML produit :

```
avec hreflang    :  2 903 pages
sans hreflang    : 51 743 pages
```

Les seules familles qui l'émettent sont celles dont le `generateMetadata`
construit explicitement `languages` :

| Émet hreflang | Ne l'émet pas |
|---|---|
| `villes/[slug]` (540) · `en/cities/[slug]` (540) | **toutes les sous-pages ville FR et EN** (~42 000) |
| `comparer/[a]-vs-[b]` (771) · `en/compare` (771) | `guides/[slug]` (894) · `en/guides` (541) |
| `departements` (102) · `en/departments` (102) | `vacances` (588) · `en/vacations` (587) |
| `classements` (19) · `en/rankings` (19) | `red-flags` (575) · `en/red-flags` (569) |
| `regions` (18) · `en/regions` (18) | `badge` (540) · calculateurs (1 081) · `gentrification` (541) |

Sous-constat : les triplets `comparer/[a]-vs-[b]-vs-[c]` n'émettent pas de
hreflang alors que les paires en émettent — 771 pages de chaque côté.

**Pourquoi je ne l'ai pas corrigé.** Le helper existe déjà
(`hreflangLanguages()`, `lib/i18n.ts:110`) mais il mappe uniquement le **segment
de tête** via `FR_TO_EN_SEGMENT` : il traduirait `/villes/lyon/sante` en
`/cities/lyon/sante`, alors que la vraie route EN est
`/cities/lyon/healthcare`. L'appliquer en masse produirait **des hreflang faux
sur 42 000 pages, ce qui est pire que pas de hreflang du tout.** Il faut d'abord
une table de correspondance des sous-segments. La voici, dérivée pendant cet
audit (39 paires FR→EN, vérifiées contre les répertoires des deux arbres) :

```
a-faire→things-to-do  agenda→calendar  air→air-quality  avis-honnete→honest-review
biodiversite→biodiversity  bruit→noise  climat→climate  climat-2040→climate-2040
commerces→retail  connexion-internet→internet-quality  cout-de-la-vie→cost-of-living
demographie→demographics  eau→water  ecoles→schools  emploi→employment
empreinte→fingerprint  fiscalite→tax  logement→housing  louer-ou-acheter→own-vs-rent
mentalite-locale→local-mindset  parcs→parks  parent-solo→single-parent
profils→profiles  quartiers→neighbourhoods  questions→questions
risques→natural-risks  s-installer→get-settled  saisons→seasons  sante→healthcare
securite→safety  services-publics→public-services  sport→sports-leisure
statistiques→statistics  synthese→synthesis  teletravail→remote-work
tension-locative→rental-market  transports→transport  velo→cycling  vibe→vibe
```

(`overview` côté EN n'a pas de jumelle FR — c'est la fiche ville elle-même.)

Chantier proposé : étendre `lib/i18n.ts` avec cette table, exposer un
`hreflangCitySub(frSub, slug)`, et l'ajouter aux `alternates` des 79 fichiers de
sous-pages. Mécanique et typé, mais ça touche 79 fichiers — hors périmètre
« correction sûre ».

### 2.2 🔴 Un chunk client de 5,9 Mo embarque tout le corpus éditorial

`components/SearchPalette.tsx` importe `GUIDES` depuis `@/data/guides` (5,96 Mo
de source, 894 guides avec le texte intégral) pour n'en extraire que
`slug` / `title` / `emoji`. Turbopack ne peut pas tree-shaker un tableau de
littéraux : **tout part dans le bundle.**

Mesuré sur `.next/static/chunks/` :

```
1a-4ka0bud_kc.js   5,9 Mo   (1,79 Mo gzip)
chunk suivant        332 Ko
```

Un ordre de grandeur au-dessus de tout le reste. Le contenu du chunk confirme :
894 `intro:`, 894 `sections:`, **6 078 `body:`** — c'est-à-dire le corps de
chaque section de chaque guide, expédié au navigateur pour afficher une liste de
titres.

**Le code-splitting, lui, est correct et fonctionne.** `SearchPaletteLauncher`
charge la palette en `next/dynamic` au premier `Cmd+K` / `/` / clic ; les pages
où l'utilisateur ne cherche jamais ne téléchargent rien. Le commentaire du
fichier annonce d'ailleurs « pulls in the full city + guide index ». Ce qui a
échappé, c'est que ce n'est pas un *index* qui part, mais le corpus entier.
**Coût réel : 1,79 Mo gzip à la première recherche.**

C'est exactement le principe « Projections, not entities » de `CLAUDE.md`,
appliqué partout ailleurs et manqué ici. Le correctif est un artefact généré au
build (`data/guides-index.json` : slug / title / emoji, ~60 Ko) importé à la
place de `@/data/guides` — même traitement pour `getAllTagsWithCounts()`, qui
lit le même module. Refactor de pipeline → rapporté, pas touché.

### 2.3 🟠 2 routes EN sans entrée sitemap — **corrigé**

`EN_FOR_WHO_SLUGS` (`app/sitemap.ts`) recopiait à la main les slugs de
`EN_PROFILES` (`app/[locale]/for-who/[slug]/page.tsx:24`) et avait dérivé :

- `/for-who/first-time-buyers` — route générée, absente du sitemap
- `/for-who/single-parents` — idem ; c'est la jumelle EN du travail F58
  parent-solo, livrée sans mettre le sitemap à jour

### 2.4 🟠 9 129 meta descriptions au-delà de 160 caractères (16,7 %) — corrigé à 91 %

Maximum mesuré : **330 caractères** (`en/cities/[slug]/synthesis`). Les familles
les plus touchées avant correction :

| Pages | Max | Famille |
|---|---|---|
| 562 / 560 | 251 / 242 | `red-flags/[slug]` FR / EN |
| 540 | 330 | `en/cities/[slug]/synthesis` |
| 540 / 540 | 297 / 292 | `villes/[slug]/parcs` / `en/…/parks` |
| 540 | 199 | `villes/[slug]/sante` |
| 540 | 195 | `en/cities/[slug]/single-parent` |
| 464 / 429 / 413 / 382 | ~190 | `demographie` / `securite` / `services-publics` / `emploi` |
| 305 | 180 | `en/cities/[slug]/climate-2040` |
| 263 / 176 | ~178 | `calculateur-cout-reel` / `cout-menage` |
| 156 | 224 | `comparer-regions/[pair]` |
| 104 | 217 | `departements/[dept]` |

Ce ne sont pas des queues génériques de remplissage : c'est du texte utile qui
dépasse. `clampMeta()` existe précisément pour ce cas (coupe sur frontière de
phrase ou de proposition, jamais en plein mot, sans ellipse) et n'était appliqué
qu'aux guides, classements et fiches ville EN.

### 2.5 🟠 JSON-LD pointant vers l'hôte non canonique — corrigé

Quatre pages `/vacances/*` codaient en dur `https://mavilleideale.fr` dans leur
`ItemList` JSON-LD, alors que l'hôte canonique est `www.` (le Worker 301 l'apex,
`worker/index.ts:750`) et que toutes les autres pages passent par `BASE_URL`.
Les URL d'entités en données structurées désignaient donc une adresse qui
redirige.

Même chose côté Worker : les liens des e-mails transactionnels (confirmation
d'alerte, désabonnement, notification cron) visaient l'apex, soit un 301 de plus
à chaque clic — y compris sur les endpoints `/api/alertes/confirm` et
`/unsubscribe`.

### 2.6 🟠 `/api/quiz` sans rate-limit — corrigé

Seul POST public du Worker sans garde. Non authentifié, il score les 540 villes
à chaque appel. Pas de fuite de donnée (calcul pur, aucune écriture), mais c'est
un amplificateur CPU gratuit face au budget par requête de Cloudflare, alors que
tous ses voisins sont plafonnés.

### 2.7 🟡 Page EN qualité de l'air sans légende ni mention du modèle — corrigé

`app/[locale]/cities/[slug]/air-quality/page.tsx` affichait un score /10 **sans
dire dans quel sens il se lit** (« 10 = cleanest » n'existait qu'en commentaire
de code) **et sans dire d'où il vient**. La jumelle FR dit les deux. C'est
contraire à la convention maison « chaque surface énonce ce que vaut 10 dans sa
légende », sur 540 pages.

Au passage, la légende FR disait `10 = air le plus pur · ATMO · CITEPA · RNSA`,
ce qui se lit comme « chiffre publié par ces organismes ». Il ne l'est pas :
`lib/air-quality.ts` calcule par heuristique depuis le seed (« Aucune dépendance
externe », l.4) et la section Méthodologie de la page le dit correctement
(« proxy à partir de la population »). Seule la légende était ambiguë.

---

## 3. Corrigé

34 fichiers, +120 / −69. `npx tsc --noEmit` propre après coup.

| # | Correction | Fichiers |
|---|---|---|
| 1 | 2 slugs EN ajoutés au sitemap (`first-time-buyers`, `single-parents`) + commentaire d'ancrage sur `EN_PROFILES` | `app/sitemap.ts` |
| 2 | Bloc `pour-qui` du sitemap dérivé de `PROFILE_PAGES` au lieu de 32 lignes recopiées (sortie identique aujourd'hui, dérive impossible demain) | `app/sitemap.ts` |
| 3 | `clampMeta()` appliqué à 22 familles de routes (~8 260 des 9 129 descriptions trop longues) | 22 `page.tsx` FR + EN |
| 4 | JSON-LD `ItemList` sur l'hôte canonique via `BASE_URL` | 4 × `app/vacances/*` |
| 5 | Liens e-mail Worker vers `www.mavilleideale.fr` (supprime un 301 par clic) | `worker/index.ts`, `worker/crons.ts` |
| 6 | Rate-limit sur `/api/quiz` (20/min/IP, motif de `/api/cities/search`) | `worker/index.ts` |
| 7 | Légende + mention du modèle sur la page EN qualité de l'air | `app/[locale]/cities/[slug]/air-quality/page.tsx` |
| 8 | Légende FR qualité de l'air alignée sur sa propre méthodologie | `app/villes/[slug]/air/page.tsx` |

Sur le point 6 : le plafond est généreux (une soumission de quiz = une requête)
et `QuizFlow.tsx:190` retombe déjà sur ses résultats de démonstration si la
réponse n'est pas `ok` — le déclenchement du garde ne casse rien.

**Rien de touché** qui déplace un score publié, aucun refactor structurel,
aucune migration D1. **Aucun déploiement.**

---

## 4. À arbitrer

### 4.1 hreflang sur 94 % des pages (§2.1)
Le plus rentable des chantiers listés ici. Table de correspondance fournie,
helper à étendre, 79 fichiers à toucher. À faire en une passe dédiée, avec
vérification que chaque URL EN émise existe bien dans l'arbre construit —
un hreflang faux coûte plus cher que pas de hreflang.

### 4.2 Chunk de recherche à 5,9 Mo (§2.2)
Générer `data/guides-index.json` au build et le substituer à `@/data/guides`
dans `SearchPalette` + `lib/guide-tags`. Gain attendu : 1,79 Mo → ~20 Ko gzip.

### 4.3 Titres au-delà de 60 caractères : 25 771 pages (47 %)
Mesuré, mais **je ne le classe pas en défaut**, et voici pourquoi : sur les 663
`metaTitle` FR trop longs, **zéro** a son segment de tête (avant le premier
`—` / `:` / `·`) au-delà de 60. L'entité — la ville, le guide — survit toujours
à la troncature ; ce qui est coupé est la queue de mots-clés, ce qui est le
comportement voulu. C'est l'inverse du bug historique où le suffixe de marque
chassait le nom de la ville.

Côté EN, **35 guides** ont un segment de tête au-delà de 60, à cause d'un `:`
placé tard. Les 8 plus longs valent une retouche éditoriale :

```
78  Nice vs Marseille 2026: Which Mediterranean City for Expats? Honest Comparison
77  Montpellier vs Toulouse 2026: Which Occitanie City for Expats? Complete Guide
76  Sunniest Cities in France 2026: Beat Winter Blues, Best for SAD, Expat Guide
76  Best Cities France for Expat Families 2026: Schools, Safety, Quality of Life
74  Rennes vs Nantes 2026: Which City for Expats? Brittany vs Loire Comparison
74  Nantes vs Bordeaux 2026: Which City for Expats? Atlantic France Comparison
74  Strasbourg vs Colmar 2026: Which Alsace City for Expats? Honest Comparison
72  Lyon vs Bordeaux 2026: Which City for Expats? Complete Honest Comparison
```

Réécriture éditoriale, pas mécanique : je ne l'ai pas faite.

### 4.4 Pages HTML les plus lourdes
7 pages au-delà de 1 Mo de HTML, 129 au-delà de 400 Ko :

```
1,7 Mo  regions/ile-de-france        1,2 Mo  villes
1,4 Mo  guides                       1,2 Mo  en/cities
1,3 Mo  leaderboard                  1,2 Mo  en/guides
1,1 Mo  en/leaderboard
```

L'anomalie est **`/regions/ile-de-france`** : la page rend les **122 villes** de
la région en cartes complètes, sans plafond (`app/regions/[region]/page.tsx`
l.132-133, `top3` + `rest`). C'est du serveur, donc la contrainte « jamais une
collection entière dans une grille client » ne s'applique pas à la lettre, mais
1,7 Mo à parser reste le pire de la production. Le motif de correction existe
déjà dans le dépôt : plafonner l'affichage et garder le maillage dans un
`<details>` d'index compact, comme `/guides`. Changement d'UX sur une page
publiée → rapporté.

`/guides` (1,4 Mo) et `/villes` (1,2 Mo) sont déjà plafonnés
(`INITIAL_VISIBLE` 60 et 120) : ils sont au plafond, pas en dérive.

### 4.5 `framer-motion` toujours dans `package.json`
`package.json:29` déclare `framer-motion@^12.38.0` alors que **plus aucun
fichier ne l'importe** — `ScrollReveal` a été réécrit sur IntersectionObserver
exprès. Aucun octet n'atteint le bundle (rien ne l'importe), c'est du poids mort
d'installation. `npm uninstall framer-motion` est sans risque, mais ça touche
`package-lock.json` que ~15 agents modifient dans la semaine : laissé à une
fenêtre calme.

### 4.6 Qualité de l'air : F63 reste ouvert
Corrigé la légende, pas le fond. `lib/air-quality.ts` reste entièrement
heuristique (population, département, `characterTags`) là où la roadmap prévoit
l'indice ATMO quotidien à la commune et Geod'Air. Rien de neuf cette semaine ;
juste la confirmation que la page dit désormais ce qu'elle fait.

### 4.7 Le build ne tient pas dans le disque de cette session
`npm run build` a généré ses 55 777 pages sans erreur puis a échoué à l'étape de
copie vers `out/` :

```
Error: ENOSPC: no space left on device,
  copyfile '.next/server/app/villes/haguenau/sante.html' -> 'out/villes/haguenau/sante.html'
```

`.next` pèse **22 Go** et l'export en recopie l'intégralité : il faut donc ~28 Go
libres pour un build complet, contre ~37 Go d'allocation dans cette session.
**Ce n'est pas un défaut du code** — la génération est intégralement passée, et
l'export n'est qu'une copie. Mais un audit ne peut pas produire `out/` ici, et un
déploiement depuis un environnement de cette taille échouera au même endroit.
Contournement pour mesurer : lire `.next/server/app`, dont `out/` est la copie
conforme. À noter pour le déploiement manuel (qui a déjà besoin de
`NODE_OPTIONS=--max-old-space-size=4096`, cf. `[[deploy-manual-no-ci]]`).

---

## 5. Écarts avec le prompt de la routine

Aucun cette semaine — le prompt a été corrigé le 2026-07-29 (Cloudflare, D1,
`worker/index.ts`, absence de `proxy.ts`) et décrit désormais fidèlement la
stack. Les deux notes de dérive que les audits du 07/06 au 26/07 traînaient
(domaine canonical, cron Vercel) sont éteintes.

Une précision utile pour les prochains runs : `app/robots.ts` n'est effectivement
pas ce qui est servi en production (Cloudflare y injecte ses règles anti-crawler
IA), donc l'écart n'a pas été traité comme un défaut.
