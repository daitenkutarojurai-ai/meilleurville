# Ultra-audit hebdomadaire — 2026-09-13

Audit autonome du dimanche. **37 commits** depuis le dernier audit (2026-09-06),
dont deux correctifs de moteurs (`classements` / `agenda`, `biodiversité`), le
36ᵉ profil « pour qui » et son axe d'accès aérien neuf, et une forte poussée de
contenu : **guides FR 1 080 → 1 119, EN 845 → 908**.

Toutes les gardes existantes passent. Le run a trouvé **trois défauts réels que
l'outillage en place ne pouvait pas voir**, et les a corrigés :

1. 🟠 **Le titre des 114 pages de tag anglaises portait la marque en son
   milieu**, ce que la convention interdit (`title.template` est un `%s` nu) :
   19 caractères par titre, la plus longue à **61**, et une jumelle FR
   (`/tags/<slug>`) deux fois plus courte pour la même page.
2. 🟠 **19 mètres carrés écrits `m2` en ascii** dans les deux corpus de guides —
   la régression exacte que la passe de restauration du 2026-06-03 avait traitée,
   sur 6 guides qu'elle avait manqués. À côté de **2 576** `m²` corrects.
3. 🟡 **Le docstring de `airportAccess` annonçait un plafond à 30 km** quand la
   constante et la prose publiée disent 20.

Aucun secret commité. Aucun canonical vers un domaine d'aperçu. Aucune asymétrie
hreflang réelle sur 3 367 liens. **Aucun écart FR/EN sur une note publiée, sur
les 540 villes × 39 paires de sous-pages.** Aucun lien interne mort. Aucune
régression de perf, aucun import de corpus dans un composant client.

⚠️ **`npm run build` n'a pas été lancé**, conformément à `CLAUDE.md` § Commands.
Substitut détaillé en §5 — **sixième semaine que je le signale**.

⚠️ **L'egress vers la production reste refusé depuis cette routine.** Cf. §5.

---

## 1. Vérifié — conforme

### Sync + outillage (étape 1)
- Session démarrée en `HEAD` détaché, arbre propre. `git checkout main &&
  git pull --rebase origin main` → à jour sur `4c601c6`. Aucun `stash`, aucun
  force-push.
- ⚠️ **Le dépôt de la routine est un clone *shallow* (50 commits, greffé sur
  `a8fe23b` du 2026-09-04)**, et c'est un piège de lecture qu'il faut connaître :
  `git log --diff-filter=A -- worker/index.ts` y répond « ajouté le 2026-09-04 »
  pour **tout** fichier plus ancien que la greffe. J'ai failli rapporter que
  `worker/index.ts`, `lib/spam-filter.ts` et `lib/rate-limit.ts` avaient été
  créés par un commit de contenu (1 293 insertions, 0 suppression, message
  « Aucune route touchée »). C'est l'horizon du clone, pas un ajout. **Vérifier
  `test -f .git/shallow` avant de conclure quoi que ce soit d'un `git log` sur
  un fichier ancien.** Conséquence utile : les trois fichiers n'ont pas bougé
  dans la fenêtre visible, la revue handler par handler du 30/08 reste valide.
- `npm install` — OK. `npx tsc --noEmit` — **0 erreur**, avant et après
  corrections.
- `npm run integrity` — vert : 540 villes, guides **FR 1 119 / EN 908**, 0 score
  brut recopié, 540 villes × 4 292 signaux, glossaire 169 termes, plus les
  gardes `og:image`, `jsonld`, `env quartet` (20 surfaces), `moteurs`
  (52 surfaces) et `classements` — ces deux dernières ajoutées cette semaine.
- `npm run hreflang:check`, `npm run parity` (FR 220 · EN 166, 0 route FR sans
  jumelle), `npm run search-index:check` — verts.
- `npm run sitemap:check` — vert dans les deux sens, les deux locales :
  FR **29 220** URL / 18 chunks ; EN **28 800** URL / 21 chunks.
- **Les quatre selftests hors ligne passent** : `biodiversity:selftest`,
  `news:selftest` (73 contrôles), `protected-areas:selftest` (540/540 villes
  placées), `property-prices:selftest` (15 OK).

### Complétude des routes (étape 2)
- Les deux défauts distincts que demande l'étape (route sans entrée sitemap ;
  entrée sitemap sans route) sont **absents** dans les deux locales. Aucune
  `page.pending.tsx`.
- **Liens internes littéraux** — contrôle rejoué (il avait trouvé un vrai défaut
  la semaine dernière). Méthode corrigée au passage : le balayage extrait les
  `href` entièrement littéraux de `app/`, `components/` et `lib/`, mais l'arbre
  source contient **les deux locales**, donc les confronter au seul jeu de routes
  FR signale 71 chemins EN parfaitement valides. Le défaut réel est un chemin
  absent **des deux** locales : il n'y en a qu'un, `/feed.xml`, et c'est un
  `route.ts` — donc invisible d'un balayage qui ne cherche que des `page.tsx`.
  **0 lien interne mort.**

### SEO (étape 3)
Balayage réel : les `page.tsx` de l'arbre chargés et exécutés, leurs
`generateStaticParams()` joués, `generateMetadata()` rendue sur un échantillon
par famille incluant **systématiquement le slug le plus long** (pire cas de
longueur). **391 rendus FR, 450 EN.**

- **Canonical** : présent sur **toutes** les routes dynamiques des deux locales
  (0 manquant). 0 `localhost`, 0 `*.pages.dev` / `*.workers.dev`, 0 canonical FR
  vers `bestcitiesinfrance.com` ni l'inverse. Seul `app/page.tsx` (racine FR)
  n'exporte pas de `metadata` : il hérite du layout, comportement voulu.
- **hreflang** : réciprocité testée paire par paire, **3 367 liens, 0 asymétrie
  réelle**. ⚠️ Piège de méthode : un index « canonical → page » écrase la page
  canonique par son **alias** (`/quiz` déclare le canonical `/city-match`,
  `/dashboard` celui de `/mes-villes`), ce qui fabrique 8 fausses asymétries sur
  `/city-match`. Les deux alias sont les doublons connus et arbitrés ; côté EN,
  **0 canonical partagé par deux fichiers**.
- **`openGraph` sans `images`** : **0**, dans les deux locales. La garde tient.
- **`app/robots.ts`** : `/api/`, `/admin/`, `/auth` en `Disallow`, chunks dérivés
  de `SITEMAP_CHUNK_COUNT`. `noindex` vérifié **en rendant** les métadonnées :
  `/dashboard`, `/favoris`, `/mes-villes`, `/connexion`, `/auth/callback` côté
  FR, `/my-account`, `/sign-in`, `/auth/callback` côté EN portent tous
  `index: false`.
- **`alt`** : 0 `<img>` sans `alt` dans `app/` et `components/`.
- **Marque dans les titres** — contrôle neuf, demandé par l'étape 3 du prompt
  (« un suffixe de marque ajouté à la main est un défaut »). FR : 9 rendus sur
  7 fichiers, **0 au-dessus de 60**. EN : 46 rendus sur 22 fichiers, **1
  au-dessus** → §2.1. Aucune occurrence de `MaVilleIdeal` sans accent, ni en
  titre ni en description.
- **Queues génériques de description** : aucune queue répétée ≥ 20 fois dans
  l'échantillon, des deux côtés.

### Intégrité des données (étape 4 — sondage)
- **540 villes**, 0 violation de bornes (`global ∈ [2,8 – 8,6]`, les 8 axes dans
  `[0, 10]`, coordonnées présentes), 0 slug dupliqué.
- **3 villes tirées** — Thiers (6,0), Bondy (2,8), Savigny-le-Temple (4,4) :
  scores numériques, dans les bornes, `computeNicheScores` cohérent.
- **Le contrôle FR/EN, fait en grand et pour de vrai.** C'est celui qui a attrapé
  les deux vrais bugs du projet (sécurité FR 6,8 vs EN 3,2 ; le quartet
  environnement). Rendu de `generateMetadata()` des deux arbres pour **les 540
  villes × les 39 paires de `FR_TO_EN_CITY_SUB`** ; sur les **3 428**
  descriptions qui portent une note `/10` **des deux côtés**, **0 divergence**.
  ⚠️ Trois fausses pistes écartées avant d'arriver là, qui valent d'être notées
  parce qu'elles reviendront : ① comparer les nombres avec un regex unique fait
  lire « 3,368 species » comme un décimal et invente une divergence par ligne
  (**le séparateur de milliers est une virgule en anglais**) ; ② une jumelle qui
  ne cite aucun chiffre n'est pas une contradiction, c'est une asymétrie de
  style — les deux proses sont écrites **nativement** et ne citent pas les mêmes
  faits, donc toute comparaison de multiensembles ne peut que bruiter ; ③ le
  défaut réel à chercher est la **note sur 10**, parce que c'est là que
  l'inversion se produit.
- **Résolution guide ↔ page ville** (la classe de bug des batches 32 et 44),
  passée sur **les 540 villes et les 522 guides de la série tourisme**, avec le
  vrai résolveur (`citySlugElisions` + formes contractées `au-`/`aux-`) :
  **FR 261/261 et EN 261/261 atteignables, 0 orphelin, 0 collision**, et
  **0 guide ne manquant de lister sa propre ville** dans `relatedCities`.
- `assertUniqueSlugs` rejouée pour de vrai sur les deux corpus par
  `npm run integrity`.

### Perf (étape 5)
- **Graphe d'imports client tracé** depuis les **84** composants `"use client"`,
  imports transitifs suivis, `import type` écartés : **180 modules
  atteignables**. Sur les JSON de plus de 50 Ko, **4 seulement** sont
  atteignables et ce sont exactement les quatre documentés —
  `search-index.json` / `.en.json` (la projection faite pour ça, une seule des
  deux part), `city-population.json` (140 Ko, le levier connu réservé à une
  passe locale) et `city-cards.json` (63 Ko). Les gros fichiers
  (`city-parks` 2,5 Mo, `city-biodiversity`, `city-news`,
  `city-protected-areas`) restent **hors du graphe client**.
- **0 import en valeur** de `data/guides`, `data/guides-en`, `lib/guide-tags`,
  `lib/guide-tags-en`, `lib/rankings` ou `data/cities-seed` depuis un composant
  client. La discipline du 2026-08-04 et du 2026-08-27 tient.
- `framer-motion` : toujours **aucun import réel** (deux mentions, en commentaire).

### Sécurité (étape 6)
- **Aucun secret commité.** Le regex du prompt et un balayage de préfixes
  (`xkeysib-`, `sk-ant-`, `ghp_`, `github_pat_`, `AKIA…`, `BEGIN PRIVATE KEY`) ne
  remontent que des citations dans d'anciens rapports d'audit. Seul
  `.env.example` est versionné.
- **21 routes `/api/*`**, inventaire inchangé. Revue de la frontière :
  **tout POST public porte un `rateLimit`** (souvent double, burst en mémoire +
  fenêtre fixe D1), et **toute lecture privée est scopée sur `user.id`** issu de
  `authedUser`, qui vérifie le JWT contre `AUTH_SECRET` avant de résoudre
  l'utilisateur. Vérifié nommément sur `/api/favorites`, `/api/projections`,
  `/api/account`, `/api/reviews`, `/api/alertes/*`.
- Spot-check de `handleAlertesList` : scopé sur `user.email` issu du JWT, et le
  code **porte la raison en commentaire** (« Never expose this by bare email:
  anyone knowing an address could enumerate subscriptions and steal unsubscribe
  tokens »). Le chemin rapide de `/api/alertes/subscribe` exige
  `user.email === email` avant d'activer sans double opt-in — pas d'activation
  croisée possible.

---

## 2. Cassé — trouvé cette semaine

### 2.1 🟠 Le titre des 114 pages de tag anglaises porte la marque, la jumelle FR non

`app/[locale]/tags/[slug]/page.tsx:33` écrivait :

```tsx
title: `${label} · ${guides.length} BestCitiesInFrance guides`,
```

quand sa jumelle hreflang `app/tags/[slug]/page.tsx:27` écrit :

```tsx
title: `${label} · ${guides.length} guides`,
```

La convention de `CLAUDE.md` § Title length est explicite : le `title.template`
du layout racine est un **`%s` nu**, et une page ne peut rajouter la marque que
si le résultat **tient en 60 caractères**, au moyen de `hubTitle()`
(`lib/brand.ts`). Ici la marque est écrite en dur, **au milieu du titre**, et
sans garde de longueur.

Mesuré sur les **114 tags EN** réels :

| | max | médiane | > 60 |
|---|---|---|---|
| EN, tel quel | **61** | 40 | **1** |
| EN, sans la marque | 42 | 21 | 0 |
| FR (jumelle) | 56 | 20 | 0 |

Soit 19 caractères dépensés sur **chacune** des 114 pages pour un mot qui ne dit
rien de la page, une médiane double de celle de la jumelle, et
`moving to france with children · 21 BestCitiesInFrance guides` à 61 caractères —
le seul titre du site portant la marque qui dépasse la limite.

La marque n'est pas perdue : les **deux** descriptions la portent déjà
(« Tous les guides MaVilleIdéale traitant de… » / « Every BestCitiesInFrance
guide about… »), donc la retirer du titre rend les jumelles symétriques au lieu
de les désaligner.

### 2.2 🟠 19 mètres carrés écrits en ascii dans les deux corpus de guides

`CLAUDE.md` documente la régression : le 2026-06-03, 58 guides tourisme avaient
été sauvegardés ascii-strippés (`m2`, `28,30 EUR`, `360 deg`) et une passe a
restauré diacritiques et unités sur 638 chaînes. **Six guides lui ont échappé**,
et portaient encore `m2` là où le reste du corpus écrit `m²` :

| corpus | occ. | guides |
|---|---|---|
| `data/guides.ts` | 14 | `villes-france-bord-de-mer-budget-accessible-2025` (9), `10-choses-a-faire-a-avignon-2026` (2), `vivre-en-montagne-villes-alpes-pyrenees-france-2025` (1), `10-choses-a-faire-a-troyes-2026` (1), `10-choses-a-faire-a-nimes-2026` (1) |
| `data/guides-en.ts` | 5 | `where-to-buy-in-montpellier-2026` — les 5 dans **une seule chaîne** (« a roughly 65m2 », « a smaller ~45m2 », « a 70 to 90m2 », « a 100m2 », « 80 to 110m2 ») |

À comparer aux **2 576** `m²` corrects du seul corpus FR : c'est bien une poche
résiduelle, pas une convention concurrente. Exemples :
`de 1 500€/m2 à Boulogne-sur-Mer`, `possède 1 800 m2 de vitraux`,
`le plus grand palais gothique du monde (15 000 m2)`.

⚠️ **Le même balayage remonte aussi 9 occurrences de `EUR`, et celles-là sont
légitimes — ne pas les « corriger ».** `CLAUDE.md` le dit déjà
(« Legit currency-code `EUR` (EUR/USD context) left intact ») et la lecture du
contexte le confirme : il s'agit du **code de devise**, pas d'un `€` strippé —
« le Luxembourg, la Belgique et l'Allemagne en EUR », « le taux de change
EUR/USD », « holds GBP, EUR, USD in the same account ». Un `sed` global sur
`EUR` casserait ces phrases.

### 2.3 🟡 Le docstring de `airportAccess` annonce un plafond à 30 km, la constante dit 20

`lib/profile-pages.ts:494`, dans l'axe d'accès aérien livré cette semaine avec le
36ᵉ profil :

```
 * d'une décroissance de distance : plein plafond jusqu'à 30 km de route, zéro
```

alors que `AIR_FULL_KM = 20` (ligne 461), que `CLAUDE.md` écrit « plein plafond
jusqu'à 20 km », et que la prose **publiée** sur `/pour-qui/famille-a-l-etranger`
écrit « un plein score jusqu'à vingt kilomètres ». C'est donc le commentaire seul
qui est faux — la classe d'écart que `CLAUDE.md` signale ailleurs (« 7 sur 20
décrivaient un autre calcul », « ni `tsc` ni `npm run integrity` ne peuvent voir
l'écart entre une phrase et une formule »).

**Le reste de l'axe a été vérifié contre le vrai module, et il est juste.** Les
~20 chiffres que la prose publie ont été recalculés : Senlis 9,6 / Roissy 28 km,
Rennes-Limoges-Clermont 4,0, Lille et Montpellier 5,5, Mulhouse 6,8 / 27 km,
Annemasse et Gex 8,5 / Genève 14 km, Saint-Laurent-du-Maroni 0,0 à 249 km,
Bourges 1,3, Nevers 1,2, Bar-sur-Aube 1,1, les cinq DROM à 6,0 et 5,0 —
**tous exacts**, comme la médiane (5,3), les « 60 villes sous 3 », l'ordre des
20 premiers et le palier de **sept villes à 6,9 aux rangs 15-21**.

⚠️ Et une fausse alerte que je signale pour qu'elle ne soit pas « corrigée » au
prochain run : compter les villes à 10/10 **en arrondissant** en donne 21 et
laisse croire que la prose (qui en annonce 18, « toutes à moins de vingt
kilomètres ») est fausse. Elle ne l'est pas : **18 villes valent exactement 10**,
la plus lointaine à 20 km ; les trois autres sont à 21 km et valent 9,95, soit
« 10,0 » une fois affichées. La prose est juste, c'est l'arrondi du contrôle qui
ment.

---

## 3. Corrigé

4 fichiers. Aucun score déplacé, aucun refactor structurel, aucune migration D1,
**aucun déploiement**.

| # | Correction | Fichier |
|---|---|---|
| 1 | Marque retirée du titre des 114 pages de tag EN (61 → 42 car. au pire), alignement sur la jumelle FR ; commentaire posant la règle | `app/[locale]/tags/[slug]/page.tsx` |
| 2 | 14 `m2` → `m²` | `data/guides.ts` |
| 3 | 5 `m2` → `m²` | `data/guides-en.ts` |
| 4 | Docstring `airportAccess` : 30 km → 20 km, avec le nom de la constante | `lib/profile-pages.ts` |

**Portée du correctif 2-3, vérifiée avant application** : les 19 occurrences ont
été **énumérées une à une** et sont toutes des mètres carrés (précédées d'un
chiffre ou de `€/`) ; aucun autre `m2` n'existe dans les deux fichiers. Le
`git diff --word-diff` ne montre que 38 jetons, tous porteurs de `m2`/`m²`, sur
11 lignes — aucun autre mot touché.

Vérifications après coup : `tsc` **0 erreur**, `integrity`, `hreflang:check`,
`parity`, `search-index` + `search-index:check`, `sitemap:check` tous verts et
**inchangés** (FR 29 220 / EN 28 800 — aucune route neuve, aucune URL déplacée).
Le rendu réel des métadonnées EN confirme le correctif 1 : plus aucun titre
portant la marque au-dessus de 60.

*Note sur les index de recherche* : `npm run search-index` a été rejoué après la
correction des corpus ; les deux fichiers ressortent **identiques au bit près**,
parce que les chaînes corrigées sont dans le corps des sections et pas dans la
projection (titre + extrait de 200 caractères). `search-index:check` reste donc
vert sans commit d'index — c'est le comportement attendu, pas un oubli.

---

## 4. À arbitrer

### 4.1 🟠 `next` porte 11 avis dont 2 critiques — et la production n'y est pas exposée

`npm audit` annonce **14 vulnérabilités, dont 1 critique**, et la critique est
dans `next` (16.2.9 installé ; correctifs en 16.2.11 et 16.3.3). Le chiffre a
l'air alarmant et **il ne décrit pas ce site** : `next.config.ts` porte
`output: "export"` et `images: { unoptimized: true }`, et les pages sont servies
par **Cloudflare Workers Static Assets**. Or les 11 avis visent tous un runtime
serveur Next :

| avis | s'applique ici ? |
|---|---|
| RCE non authentifiée, Image Optimization API (AVIF) — **critique** | non : `images.unoptimized`, l'API n'existe pas dans l'export |
| RCE non authentifiée sur serveur Windows — **critique** | non : pas de serveur Next, et l'hôte n'est pas Windows |
| Middleware/Proxy bypass, DoS et SSRF via Server Actions | non : `output: "export"` interdit middleware et Server Actions |
| SSRF via `rewrites`, cache confusion, endpoints de Server Functions | non : pas de rewrites, pas de cache serveur, pas de Server Functions |

**L'exposition réelle est donc limitée au poste de développement** (`next dev`) et
à la machine de build. Ce n'est pas une raison de ne rien faire — c'est une
raison de ne pas traiter ça en urgence de production. Je n'ai pas bougé la
dépendance : `package-lock.json` est modifié par ~15 agents en semaine, un bump
de `next` demande un `npm run build` pour être validé, et le build ne tient pas
dans le quota d'une session cloud. **À faire dans la passe locale qui porte déjà
le build**, en même temps que le retrait de `framer-motion` (§4.5).

### 4.2 🟠 Le séparateur décimal français — le constat de la semaine dernière, confirmé et chiffré autrement

L'audit du 06/09 §4.2 a établi que `formatScore()` est un `toFixed(1)` nu et que
le site français écrit donc « 6.8/10 ». **Je n'ai rien corrigé non plus**, et je
ne rouvre pas l'arbitrage — mais mon contrôle FR/EN est tombé dessus par un autre
chemin, ce qui en donne une mesure neuve et plus parlante : dans la
**description** des 540 pages `/villes/<ville>/climat-2040`, la version française
écrit

> « juillet **24.3 °C** (+**2.2 °C** vs aujourd'hui) »

pendant que la page `/villes/<ville>/biodiversite`, à côté, écrit correctement
« **15,7 %** ». Les deux textes sont français, sur le même site, pour la même
ville. Le dépôt reste donc en désaccord avec lui-même **jusque dans ce que Google
affiche en SERP**, et pas seulement dans le corps des pages.

Remède inchangé, et toujours un refactor : `formatScore` est partagé avec les
pages EN où le point est correct, donc il faut un helper conscient de la locale
appliqué à ~500 sites d'appel. À arbitrer d'un coup, dans un run dédié.

### 4.3 🟡 Vesoul n'a pas de photo, et le manifeste ne le dit pas

Le contrôle de résolution guide ↔ ville (§1) a relevé **2 guides de la série
tourisme sans photo d'en-tête** : `10-choses-a-faire-a-vesoul-2026` et sa jumelle
`things-to-do-in-vesoul-2026`. Ce n'est **pas** un défaut de résolution — le
lookup fonctionne, les 261 guides sont atteignables. La cause est en amont :
`data/city-images.json` compte **538 entrées pour 540 villes**, et les deux
absentes sont `vesoul` et `pierrefitte-sur-seine`.

Pour Pierrefitte, c'est attendu et documenté ailleurs dans `CLAUDE.md` : la
commune a fusionné dans Saint-Denis en 2025. **Vesoul est un vrai trou** — soit
Wikidata n'y porte pas de `P18`, soit le fichier a été écarté par le filtre de
licence (`LICENSE_OK`). Le rendu reste correct (le guide s'affiche sans bandeau,
ce que le pipeline prévoit), donc rien n'est cassé.

Non corrigé : combler le trou demande un crawl Wikidata/Commons, donc de
l'egress, refusé depuis cette routine. **C'est une ligne pour la prochaine passe
locale** — `npm run photos:update` suffit si le `P18` existe désormais.

### 4.4 Descriptions et titres — arbitrage inchangé, chiffres à jour

Sur mon échantillon (qui inclut toujours le pire cas) :

| | titres > 60 | desc > 160 |
|---|---|---|
| FR | 147 rendus / 94 fichiers | 103 rendus / 87 fichiers |
| EN | 134 rendus / 67 fichiers | 127 rendus / 54 fichiers |

Et sur les corpus de guides, dont le `metaTitle` **est** le titre de la page :
**FR 674 guides sur 1 119 au-dessus de 60** (max 97), **EN 338 sur 908** (max
101) ; côté description, **FR 339 au-dessus de 160** (max 228), **EN 114** (max
204). Les pires cas sont d'anciens guides `-2025` et les séries régionales, pas
les batches de cette semaine.

L'arbitrage des audits des 09/08 §4.6, 16/08 §4.2, 30/08 §4.2 et 06/09 §4.3 tient
et je ne le rouvre pas : le segment de tête identifie la page dans les
60 premiers caractères, et Google indexe le titre complet même s'il n'en affiche
qu'une partie. Je le chiffre ici parce que **c'est la première fois que le
corpus de guides est mesuré séparément des routes** : les 674 titres longs ne
sont pas des gabarits allongés par un nom de commune, ce sont des titres
éditoriaux, et ils relèveraient d'une passe de réécriture de contenu — pas d'un
correctif d'audit.

### 4.5 Rappels d'arbitrages déjà ouverts

- **La préséance de `NEXT_PUBLIC_BASE_URL`** (06/09 §4.1) : toujours ouverte. La
  garde au déploiement posée la semaine dernière tient, mais les cinq modules
  lisent encore `process.env.NEXT_PUBLIC_BASE_URL ?? (locale…)`. Le geste de
  vérification reste une ligne sur la machine de publication :
  `grep -n NEXT_PUBLIC_BASE_URL …/.env.local`.
- **`framer-motion` toujours déclaré dans `package.json`**, importé nulle part,
  zéro octet livré. **Neuvième report consécutif** — à joindre à la passe locale
  du §4.1, qui touchera de toute façon `package-lock.json`.
- **`app/quiz/page.tsx`** : page complète, canonique de `/city-match`, absente du
  sitemap, générée à chaque build et jamais atteignable. Signalée les 23/08,
  30/08 et 06/09 ; toujours là.
- **`data/city-population.json` (140 Ko)** sur les 1 080 pages ville via
  `CityProfile → DemographyCard`. Remède connu, mais il touche le rendu des pages
  ville : passe locale avec build.
- **`?limit=abc` sur `/api/cities/search`** rend `{results: []}` au lieu des 8 par
  défaut (`parseInt` → `NaN` → `slice(0, NaN)`). Toujours là, toujours sans
  portée sécurité (entrée bornée par le haut, endpoint rate-limité).
- **L'index de recherche continue de grossir**, mais **moins vite** : FR
  291 483 o brut / **45 632 o gzip** (+1 048 o en huit jours, contre +4 500 la
  semaine précédente), EN 231 795 / **38 809** (+2 192). Toujours pas un défaut —
  `SearchPaletteLauncher` charge la palette en `next/dynamic`.
- **Classement biodiversité / espaces verts** : ne pas recréer
  `/classements/biodiversite`, ne pas remettre `RICHNESS_RANKING_PUBLISHED` ni
  `GREEN_SPACE_RANKING_PUBLISHED` à `true`.
- **Les 27 scores en dur de `n8n/workflows/social-media-daily.json`** restent en
  écart avec le pipeline. Décision inchangée depuis le 09/08.

---

## 5. Écart avec le prompt de la routine

Les deux mêmes que les cinq semaines précédentes, tous deux inchangés.

**L'étape 1 demande `npm run build`**, que `CLAUDE.md` interdit depuis une
session cloud (§ Commands, note du 2026-08-08 : > 4 h 30 sans finalisation,
`.next` à 25 Go, `ENOSPC`). J'ai suivi `CLAUDE.md`. Le substitut exécuté en
entier : `npx tsc --noEmit`, `npm run integrity` (qui rejoue les vraies gardes de
chargement en 2 s), `hreflang:check`, `parity`, `search-index:check`,
`sitemap:check`, les quatre selftests hors ligne, plus le rendu réel des
`generateMetadata` de tout l'arbre (841 rendus), le traçage du graphe d'imports
client, le contrôle de liens littéraux, le contrôle de résolution guide ↔ ville
sur les 540 villes et le contrôle FR/EN sur 3 428 descriptions.
**Sixième semaine que je le signale** : je recommande que l'étape 1 du prompt
remplace `npm run build` par cette combinaison.

**Les étapes 2 et 3 supposent qu'on peut interroger les sites.** L'egress est
refusé depuis la routine. Tout ce qui touche au comportement d'edge —
redirections réellement servies, canonicalisation d'hôte, `robots.txt` en
production, propagation d'un déploiement — n'est vérifiable qu'en **lisant**
`worker/index.ts` et l'export. La question ouverte au §4.1 de l'audit précédent
(l'export EN publie-t-il aujourd'hui l'origine FR ?) se trancherait encore d'un
seul `curl https://bestcitiesinfrance.com/robots.txt`. Deux pistes, inchangées :
autoriser l'egress vers les deux domaines de production depuis cette routine, ou
déclarer le comportement d'edge hors périmètre.

**Note de méthode pour le prochain run**, tirée de deux fausses pistes de
celui-ci : le dépôt de la routine est un **clone shallow**, donc `git log` sur un
fichier antérieur à la greffe ment (§1) ; et un contrôle de chiffres entre
locales doit comparer des **notes sur 10**, pas des multiensembles de nombres,
sous peine de rapporter des centaines de divergences qui n'en sont pas (§1).
