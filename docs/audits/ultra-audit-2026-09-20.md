# Ultra-audit hebdomadaire — 2026-09-20

Audit autonome du dimanche. **20 commits** depuis le dernier audit (2026-09-13) :
deux correctifs de moteur (biodiversité — le disque qui compte la mer ; hreflang —
7 familles à jumelle exacte), le correctif F64 de la fenêtre d'actualité, la fiche
expat Mexique et son article de pays, la section « Eau, assainissement, déchets et
réseaux » du glossaire, le 39ᵉ thème red-flag, et une forte poussée de contenu :
**guides FR 1 119 → 1 151, EN 908 → 948**.

Toutes les gardes existantes passent, avant comme après correction. Le run a trouvé
**deux défauts réels que l'outillage en place ne pouvait pas voir**, et les a corrigés :

1. 🟠 **Les 5 pages légales et presse anglaises jetaient la moitié de leur
   hreflang** : elles appellent `pathAlternatesEn()` puis **écrasent** la table
   `languages` qu'il retourne par un littéral à deux entrées. Plus de `x-default`,
   plus de `fr-FR` ni `en-US` — pendant que leurs 5 jumelles FR, qui utilisent le
   même helper sans le contredire, les déclarent. C'est le piège de remplacement
   *wholesale* documenté dans `CLAUDE.md`, descendu d'un cran : ici ce n'est pas le
   layout qui est écrasé par la page, c'est le helper qui est écrasé par la page
   qui vient de l'appeler.
2. 🟡 **`app/leaderboard/page.tsx` cachait deux imports au milieu du fichier**,
   dont un utilisé par `export const metadata` trente lignes plus haut. Légal en
   ESM, mais **le chargeur de modules du dépôt** — celui que partagent
   `check-sitemap.mjs`, `check-integrity.mjs` et les balayages d'audit — ne pouvait
   pas charger le fichier. La page était donc un angle mort de l'outillage.

Aucun secret commité. **0 canonical manquant sur route dynamique, 0 vers un domaine
d'aperçu, 0 croisé entre locales**, sur 873 rendus de `generateMetadata()`. **Aucun
écart FR/EN sur une note publiée**, sur les 540 villes × 39 paires de sous-pages.
Aucun lien interne mort. Aucune cible de redirection morte. Aucune route EN masquée
par le routage de locale du Worker. Aucune régression de perf, aucun import de
corpus dans un composant client.

⚠️ **`npm run build` n'a pas été lancé**, conformément à `CLAUDE.md` § Commands.
Substitut détaillé en §5 — **septième semaine que je le signale**.

⚠️ **L'egress vers la production reste refusé depuis cette routine.** Cf. §5.

---

## 1. Vérifié — conforme

### Sync + outillage (étape 1)
- Session démarrée en `HEAD` détaché, arbre propre. `git checkout main &&
  git pull --rebase origin main` → à jour sur `42f0982`. Aucun `stash`, aucun
  force-push.
- ⚠️ Rappel de la note de méthode du 13/09, revérifié ce run : `test -f .git/shallow`
  répond **oui**. Le dépôt de la routine est un clone *shallow*, donc `git log` sur
  un fichier antérieur à la greffe répond « ajouté à la greffe » et non sa vraie
  date. Ne rien conclure d'un `git log` sur un fichier ancien.
- `npm install` — OK. `npx tsc --noEmit` — **0 erreur**, avant et après corrections.
- `npm run integrity` — vert, 15 gardes : 540 villes, guides **FR 1 151 / EN 948**,
  0 score brut recopié, 540 villes × 4 292 signaux, glossaire **183 termes**, plus
  `og:image` (387 `page.tsx`), `jsonld`, `env quartet` (20 surfaces), `moteurs`
  (52 surfaces), `protégées` (4 surfaces, 101/540 villes), `classements` et `expat`.
- `npm run hreflang:check` (39 paires de sous-pages ville + 209 paires à la main),
  `npm run parity` (FR 221 · EN 166, 0 route FR sans jumelle),
  `npm run search-index:check` — verts.
- `npm run sitemap:check` — vert **dans les deux sens, les deux locales** :
  FR **29 257** URL / 18 chunks, EN **28 840** URL / 21 chunks. Inchangés après
  correction : mes correctifs n'ajoutent ni ne déplacent aucune URL.
- **Les quatre selftests hors ligne passent** : `biodiversity:selftest`,
  `news:selftest` (**77** contrôles), `protected-areas:selftest` (540/540 villes
  placées), `property-prices:selftest` (15 OK).
- **Le dépôt n'a pas divergé de son origine** (`origin/main` et `HEAD` sur le même
  sha) — c'est le contrôle que `CLAUDE.md` § F64 impose depuis la panne de `git push`
  du 27/08-10/09, où quatre commits de collecte étaient restés locaux et se
  lisaient comme un collecteur mort.

### Fraîcheur des pipelines — **le contrôle porte sur la date des lignes, jamais sur leur nombre**
C'est la consigne de `CLAUDE.md` § F64, et trois JSON pleins à 540/540 ne disent
rien de la santé du collecteur. Mesuré ligne par ligne :

| pipeline | lignes | version | dates de relevé | âge |
|---|---|---|---|---|
| `city-news.json` | 540 | `queryVersion` 3 (540/540) | 09 et 10/09 | 10-11 j |
| `city-biodiversity.json` | 540 | `queryVersion` 3 (540/540) | 09 → 13/09 | 7-11 j |
| `city-protected-areas.json` | 540 | `ingestVersion` 3 (540/540) | 19/08 | 32 j |

**Aucune ligne n'est échue, et le silence du collecteur est nominal** : `news`
n'est servie qu'après `DUE_AFTER_DAYS` (14), donc rien n'est dû avant le ~23/09 —
exactement la lecture posée par l'audit du 15/09, qu'il faut se garder de
re-diagnostiquer en panne. Les zones protégées sont une passe BD TOPO unique
(périmètres arrêtés au 19/08), leur âge est attendu.

### Complétude des routes (étape 2)
- Les deux défauts distincts que demande l'étape — route sans entrée sitemap ;
  entrée sitemap sans route — sont **absents dans les deux locales**
  (`sitemap:check`, 86 familles dynamiques FR et 88 EN vérifiées contre les vrais
  `generateStaticParams()`). Aucune `page.pending.tsx`.
- **Liens internes littéraux** : 189 `href` entièrement littéraux extraits de
  `app/`, `components/` et `lib/`, confrontés à l'**union** des deux arbres de
  routes (la correction de méthode du 13/09 : l'arbre source contient les deux
  locales) plus `public/` et les `route.ts`. **0 lien interne mort.**
- **`public/_redirects` — 85 règles, contrôle neuf.** Chaque cible relative a été
  confrontée à l'arbre de routes : **0 cible sans route, 0 boucle
  (`from === to`), 0 règle masquant un guide vivant.** Les 15 guides EN retirés au
  dédoublonnage ont leur 301 et leur cible est vivante (garde `integrity`).

### Routage de locale du Worker — **contrôle neuf, jamais fait**
`CLAUDE.md` § Conventions demande de vérifier qu'un slug partagé FR/EN n'est pas
piégé par le routage de locale. La liste vit dans `worker/index.ts` (l'ancien
`FR_ONLY_SEGMENTS` de `proxy.ts` n'existe plus). Le risque réel est l'inverse de
celui que le texte décrit : sur le domaine EN, `frPathToEn()` **301-redirige** tout
chemin dont la tête est dans `FR_HEAD_TO_EN`, donc une route **EN** portant une de
ces 7 têtes serait redirigée au lieu d'être servie.

Mesuré en croisant les deux arbres de routes : **80 têtes FR, 76 têtes EN, 0 tête
EN masquée**. Les 7 têtes traduites (`villes`, `comparer`, `comparer-departements`,
`classements`, `departements`, `depuis`, `vacances`) n'existent dans aucune route
anglaise. Et les **18 têtes réellement partagées** (`about`, `auth`, `city-match`,
`contact`, `copilot`, `faq`, `future-you`, `gentrification`, `guides`,
`leaderboard`, `people-like-you`, `projection-5ans`, `quiz`, `red-flags`,
`regions`, `sport`, `tags`, `vibe`) ne sont dans aucune des deux tables, donc elles
passent par la réécriture `/en/*` — le comportement voulu.

### SEO (étape 3)
Balayage réel : les `page.tsx` des deux arbres chargés et exécutés, leurs
`generateStaticParams()` joués, `generateMetadata()` rendue sur un échantillon par
famille incluant **systématiquement le slug le plus long** (pire cas de longueur).
**461 rendus FR, 412 EN — 873 au total, 0 erreur de rendu** après le correctif §2.2.

- **Canonical** : présent sur **toutes** les routes dynamiques des deux locales
  (**0 manquant**). 0 `localhost`, 0 `*.pages.dev` / `*.workers.dev` / `*.vercel.app`,
  **0 canonical FR pointant vers `bestcitiesinfrance.com` ni l'inverse**. Seul
  `app/page.tsx` (racine FR) n'exporte pas de `metadata` : il hérite du layout,
  comportement voulu.
- **hreflang** : réciprocité testée paire par paire après normalisation d'origine
  (⚠️ les canonicals FR sont **relatifs** et les cibles hreflang **absolues** —
  les comparer bruts fabrique 373 fausses asymétries). **742 liens contrôlés, 0
  asymétrie réelle** ; les 4 restantes sont des artefacts d'échantillonnage
  (2 fiches expat hors tirage, `/leaderboard` et `/` déjà expliqués).
  Côté FR, 2 canonicals portés par deux fichiers — `/city-match` (alias `/quiz`) et
  `/mes-villes` (alias `/dashboard`) : les deux doublons connus et arbitrés. Côté
  EN, **0 canonical partagé**.
- **`x-default`** : **0 page sans `x-default` dans les deux locales** *après* le
  correctif §2.1 — il y en avait 5 côté EN.
- **`openGraph` sans `images`** : 8 fichiers en émettent un sans `images`, et
  **les 8 ont un `opengraph-image.tsx` voisin**, donc aucun défaut — vérifié
  fichier par fichier, ce qui confirme la garde `integrity` par un chemin
  indépendant.
- **`app/robots.ts`** : `/api/`, `/admin/`, `/auth` en `Disallow`, chunks dérivés de
  `SITEMAP_CHUNK_COUNT`. `noindex` vérifié **en rendant** les métadonnées :
  `/dashboard`, `/favoris`, `/mes-villes`, `/connexion`, `/auth/callback` côté FR,
  `/my-account`, `/sign-in`, `/auth/callback` côté EN portent tous `index: false`.
  ⚠️ Rappel : le `robots.txt` servi en production n'est pas celui du dépôt
  (Cloudflare y injecte ses règles anti-crawler IA) — un écart n'est pas un bug.
- **Marque dans les titres** : FR 7 fichiers, EN 21 fichiers, **0 au-dessus de 60
  caractères** des deux côtés. Le correctif du 13/09 sur les 114 pages de tag EN
  tient. Aucune occurrence de `MaVilleIdeal` sans accent nulle part — la seule
  correspondance du dépôt est le commentaire de `lib/brand.ts` qui l'interdit.
- **`alt`** : 0 `<img>` sans `alt` dans `app/` et `components/`.

### Intégrité des données (étape 4 — sondage)
- **540 villes**, **0 violation de bornes** (`global ∈ [2,8 – 8,6]`, les 8 axes dans
  `[0, 10]`, latitude/longitude présentes et plausibles), **0 slug dupliqué**.
- **3 villes tirées** — Bayonne (5,9), Yerres (5,5), Aurillac (5,6) : scores
  numériques, dans les bornes, `computeNicheScores()` cohérent et lu **à travers le
  module**, jamais par un `grep` du seed.
- **Le contrôle FR/EN, fait en grand.** C'est celui qui a attrapé les deux vrais
  bugs du projet. `generateMetadata()` rendue des deux arbres pour **les 540 villes
  × les 39 paires de `FR_TO_EN_CITY_SUB`** — 42 120 rendus. Sur les **3 241**
  descriptions citant une **note sur 10 des deux côtés** : **0 divergence.**
  ⚠️ Les trois pièges notés le 13/09 sont respectés : on ne compare que les motifs
  « x/10 » / « x sur 10 » / « x out of 10 » (le séparateur de milliers anglais est
  une virgule), une jumelle qui ne cite aucun chiffre n'est pas une contradiction,
  et le défaut à chercher est la note, pas le multiensemble des nombres.
- **Corpus de guides** : **0 `relatedGuides` mort, 0 `relatedCities` mort,
  0 collision de millésime** (le détecteur `même base, deux années` de `CLAUDE.md`)
  — sur les 1 151 guides FR et les 948 EN. `assertUniqueSlugs` rejouée pour de vrai
  par `npm run integrity`.
- **Résolution guide ↔ page ville** (la classe de bug des batches 32 et 44), passée
  sur les **540 villes** avec le vrai résolveur (`citySlugElisions` + formes
  contractées `au-`/`aux-`) : **série tourisme FR 268/268 et EN 268/268
  atteignables, 0 orphelin, 0 collision, 0 ville réclamant deux guides, 0 guide
  omettant sa propre ville dans `relatedCities`.**
- **Unités ascii-strippées** : **0 `m2`, 0 `deg`, 0 `€`→`EUR`** dans les deux
  corpus, contre **2 591** `m²` corrects côté FR et **1 975** côté EN. Le correctif
  du 13/09 tient et aucun des 32 guides FR / 40 guides EN livrés cette semaine ne
  rouvre la régression. ⚠️ Les 3 `EUR` restants de `data/guides-en.ts` sont le
  **code de devise** (« holds GBP, EUR, USD in the same account ») — relus un à un,
  **ne pas les « corriger »**.

### Perf (étape 5)
- **Graphe d'imports client tracé** depuis les **84** composants `"use client"`,
  imports transitifs suivis, `import type` et `{ type X }` écartés : **181 modules
  atteignables** (180 la semaine dernière). Sur les JSON de plus de 50 Ko, **4
  seulement** sont atteignables et ce sont exactement les quatre documentés —
  `search-index.json` / `.en.json` (la projection faite pour ça, une seule des deux
  part au build), `city-population.json` (140 Ko, le levier connu réservé à une
  passe locale) et `city-cards.json` (63 Ko). Les gros fichiers
  (`city-parks` 2,5 Mo, `city-biodiversity`, `city-news`, `city-protected-areas`)
  restent **hors du graphe client**.
- **0 import en valeur** de `data/guides`, `data/guides-en`, `lib/guide-tags`,
  `lib/guide-tags-en`, `lib/rankings`, `lib/expat-return` ou `data/cities-seed`
  depuis un composant client. La discipline du 04/08, du 27/08 et du 27/08 (quiz
  expat) tient. Seul `data/housing.ts` est atteint, via `components/CityCard.tsx` —
  c'est le cas légitime documenté (les loyers servent au filtrage côté client).
- `framer-motion` : **0 import réel**.
- **Index de recherche** : FR 297 737 o brut / **45 709 o gzip** (+77 o de gzip en
  sept jours pour +32 guides), EN 238 905 / **39 367** (+558 o pour +40 guides). La
  croissance gzip reste marginale, et `SearchPaletteLauncher` charge la palette en
  `next/dynamic` — toujours pas un défaut.

### Sécurité (étape 6)
- **Aucun secret commité.** Le regex du prompt et un balayage de préfixes
  (`xkeysib-`, `sk-ant-`, `ghp_`, `github_pat_`, `AKIA…`, `BEGIN PRIVATE KEY`) ne
  remontent rien hors citations dans d'anciens rapports d'audit. Seul
  `.env.example` est versionné.
- **`worker/index.ts`, `lib/spam-filter.ts` et `lib/rate-limit.ts` n'ont pas bougé**
  depuis l'audit précédent (0 commit les touchant) : la revue handler par handler du
  30/08, reconduite le 13/09, reste valide. Inventaire inchangé : **21 routes
  `/api/*` littérales**, plus `/api/cities/<slug>/summary` (route regex) et
  `/widget/embed`.
- **Balayage mécanique des 20 handlers** : tout POST public porte un `rateLimit`, et
  toute lecture privée est scopée sur l'utilisateur issu de `authedUser`.
  ⚠️ Piège de méthode : `/api/quiz`, `/api/copilot` et `/api/cities/*/summary` sont
  limités **au routeur** et non dans le corps du handler — un balayage qui ne lit
  que les fonctions `handle*` les déclare à tort sans garde. Ils portent en réalité
  une double limite (minute en mémoire + jour en D1), explicitement pour plafonner
  la dépense Anthropic.
- **Entropie des jetons, contrôle neuf** : `lib/auth-tokens.ts` génère un jeton de
  connexion **256 bits** via Web Crypto et ne stocke que son **SHA-256** en D1
  (une fuite de base n'est pas rejouable) ; le JWT de session est HS256 signé par
  `AUTH_SECRET`, et **les endpoints d'auth refusent de tourner sans le secret**
  plutôt que de signer avec une clé faible. Les jetons de désinscription
  (`alertes`, `newsletter`) sont des `crypto.randomUUID()` — CSPRNG, 122 bits,
  suffisant pour un lien de désabonnement.

---

## 2. Cassé — trouvé cette semaine

### 2.1 🟠 Cinq pages EN appellent le helper hreflang puis jettent sa table

`app/[locale]/{legal-notice,press,privacy-policy,reviews,terms}/page.tsx`
écrivaient toutes la même chose :

```tsx
alternates: {
  ...pathAlternatesEn("/cgu", "/terms"),   // rend { canonical, languages } complet
  languages: {                              // …puis écrase `languages`
    fr: "https://www.mavilleideale.fr/cgu",
    en: `${EN_BASE}/terms`,
  },
},
```

Le spread est mort : seul le `canonical` du helper survit. Ce que le littéral
perd, `langPair()` (`lib/i18n.ts:298`) l'explique dans son propre commentaire :

| déclaré | par `pathAlternatesEn()` | par le littéral |
|---|---|---|
| `fr` | ✅ | ✅ |
| `fr-FR` | ✅ | ❌ |
| `en` | ✅ | ✅ |
| `en-US` | ✅ | ❌ |
| **`x-default`** | ✅ | **❌** |

Et le `x-default` du layout racine ne rattrape rien : `CLAUDE.md` § hreflang pose
que « returning `alternates` at page level **replaces the layout's object
wholesale** ». C'est le même piège, **descendu d'un cran** — ici ce n'est pas le
layout qui est écrasé par la page, c'est le helper qui est écrasé par la page qui
vient de l'appeler, dans la même expression.

L'asymétrie est nette, et c'est elle qui rend le défaut sûr à corriger : **les 5
jumelles FR** (`app/{mentions-legales,presse,confidentialite,avis,cgu}/page.tsx`)
appellent `pathAlternates(...)` **sans le contredire** et déclarent donc les cinq
entrées. Une paire hreflang où un côté annonce `x-default` et l'autre non est
exactement ce que `hreflang:check` ne peut pas voir : il contrôle que chaque
hreflang annoncé a une route en face, pas que les deux côtés annoncent la même
chose.

Mesuré sur les 412 rendus EN : **5 pages sans `x-default`** avant, **0 après**.

### 2.2 🟡 `app/leaderboard/page.tsx` cache deux imports au milieu du fichier

```tsx
const sorted = [...CITIES_SEED].sort(...);   // ligne 26

import { scoreColor as scoreClass } from "@/lib/utils";   // ligne 28
import { pathAlternates } from "@/lib/i18n";              // ligne 29
```

…alors que `export const metadata` appelle `pathAlternates(...)` **à la ligne 15**.
En ESM c'est correct — les liaisons d'import sont hoistées et initialisées avant
l'exécution du corps — donc la page fonctionne en production et `tsc` ne dit rien.

Le coût est ailleurs : **le chargeur de modules du dépôt transpile en CommonJS**,
où les `require` suivent l'ordre des instructions. `scripts/check-sitemap.mjs`,
`scripts/check-integrity.mjs` et tous les balayages d'audit partagent ce chargeur,
et échouaient donc sur ce seul fichier (`Cannot access 'i18n_1' before
initialization`). C'est **un angle mort de l'outillage** : la page était la seule
des 873 à n'être contrôlée ni sur son canonical, ni sur son titre, ni sur son
`openGraph`. Une fois chargée, elle est conforme (titre 50 caractères, canonical
`/leaderboard`, `opengraph-image.tsx` voisin) — mais ça, on ne pouvait pas le
savoir avant de la charger.

---

## 3. Corrigé

6 fichiers. Aucun score déplacé, aucun refactor structurel, aucune migration D1,
**aucun déploiement**.

| # | Correction | Fichier |
|---|---|---|
| 1-5 | Littéral `languages` mort supprimé : la table complète du helper (avec `x-default`, `fr-FR`, `en-US`) survit, alignement exact sur la jumelle FR. `EN_BASE` et l'import `ORIGIN_BY_LOCALE` devenus inutiles retirés avec. | `app/[locale]/{legal-notice,press,privacy-policy,reviews,terms}/page.tsx` |
| 6 | Deux imports égarés en milieu de fichier remontés en tête — aucun changement de comportement, le fichier redevient chargeable par l'outillage du dépôt | `app/leaderboard/page.tsx` |

**Portée vérifiée avant application** : les 5 blocs ont été rapprochés un à un de
leur jumelle FR ; le correctif 6 est un **déplacement** de deux lignes, contrôlé au
`git diff` (2 insertions, 3 suppressions, aucun autre jeton touché).

Vérifications après coup : `tsc` **0 erreur**, `integrity` (15 gardes),
`hreflang:check`, `parity`, `search-index:check`, `sitemap:check` tous verts et
**inchangés** — FR 29 257 / EN 28 840, aucune route neuve, aucune URL déplacée, ce
qui est bien le résultat attendu d'un correctif qui ne touche que des en-têtes.
Le rendu réel confirme les deux : **0 page EN sans `x-default`** (5 avant), et
**0 erreur de chargement sur 873 rendus** (1 avant).

---

## 4. À arbitrer

### 4.1 🟠 Les 19 classements balisent des rangs sur des ex æquo — mesure affinée, arbitrage inchangé

`docs/integrite-2026-08-28.md` l'a signalé sans correction, et le commentaire de
`app/[locale]/rankings/[slug]/page.tsx:55` dit que le fond « reste à trancher ».
**Je ne rouvre pas l'arbitrage** — c'est un changement de données structurées
publiées sur 38 pages, donc hors de ce que je corrige seul. Mais je l'ai mesuré
plus finement que le « 19/19 ont au moins un ex æquo » de fin août, et le chiffre
change l'ordre de grandeur du problème :

| | FR (`position` sur le top 10) | EN (`position` sur le top 25) |
|---|---|---|
| classements concernés | **19 / 19** | **19 / 19** |
| positions balisées **à égalité** | **5 à 10** sur 10 | **13 à 25** sur 25 |

`teletravail`, `retraite` et `sante` balisent **10 positions sur 10 en ex æquo** :
les dix `ListItem` de leur JSON-LD portent des rangs que le score ne départage
pas. Et **chaque** classement coupe son palier en son milieu au rang 10 — de 2
villes partageant la note du 10ᵉ (`ecologie`) à **9** (`famille`).

Le contraste interne du dépôt est ce qui rend l'arbitrage mûr : la famille sœur,
`lib/owner-rankings.ts` rendue par `components/OwnerRankingPage.tsx`, **applique
déjà la convention du 19/08 correctement** — `itemListOrder` bascule sur
`ItemListUnordered` et le `position` est **omis** dès que la tête est à égalité
(vérifié ligne à ligne ce run). Le remède pour les 19 autres est donc écrit et
tourne à côté ; il ne manque que la décision de l'y appliquer.

### 4.2 🟠 Le séparateur décimal français — chiffré cette fois sur les pages rendues

Constat ouvert depuis le 06/09 §4.2 et reconduit le 13/09 : `formatScore()` est un
`toFixed(1)` nu (53 appels dans 17 fichiers), donc le site français écrit « 6.8 ».
**Je n'ai rien corrigé** — c'est le refactor identifié (helper conscient de la
locale, ~500 sites d'appel, `formatScore` étant partagé avec les pages EN où le
point est correct).

Ce que j'apporte est une mesure de l'ampleur, prise sur le **texte réellement rendu**
et non sur le code : dans les descriptions des 540 villes × 39 sous-pages FR,
**9 520 décimales sont écrites avec un point** contre **2 044 avec une virgule**,
et **21 des 39 sous-pages** sont concernées (`bruit`, `climat`, `climat-2040`,
`commerces`, `connexion-internet`, `cout-de-la-vie`, `demographie`, `eau`,
`ecoles`, `emploi`, `empreinte`, `louer-ou-acheter`…). Autrement dit le dépôt est
en désaccord avec lui-même sur **plus de quatre cinquièmes** des décimales qu'il
publie en français, jusque dans ce que Google affiche en SERP.

### 4.3 🟠 `npm audit` — 14 avis, 1 critique, et la production n'y est pas exposée

Inventaire **inchangé** depuis le 13/09 : 14 vulnérabilités (1 critique, 10 hautes)
sur `next`, `sharp`, `wrangler`, `miniflare`, `undici`, `ws`, `postcss`,
`browserslist`, `nanoid`, `brace-expansion`, `js-yaml`, `@babel/core`, `esbuild`,
`baseline-browser-mapping`.

L'arbitrage du 13/09 tient et je le reconduis sans le réécrire : `next.config.ts`
porte `output: "export"` et `images: { unoptimized: true }`, les pages sont servies
par Cloudflare Workers Static Assets, et les avis `next` visent tous un **runtime
serveur Next** (Image Optimization API, middleware, Server Actions, rewrites, cache
serveur) qui n'existe pas ici. Le reste (`sharp`, `wrangler`, `miniflare`,
`undici`, `ws`, `postcss`, `esbuild`, `@babel/core`) ne tourne qu'au **build et au
déploiement**, sur la machine du propriétaire — jamais dans le Worker, que
Cloudflare exécute sur son propre runtime.

Toujours pas bougé : `package-lock.json` est modifié par ~15 agents en semaine et un
bump de `next` demande un `npm run build` pour être validé, ce qui ne tient pas dans
le quota d'une session cloud. **À faire dans la passe locale qui porte déjà le
build**, en même temps que le retrait de `framer-motion` (§4.4).

### 4.4 Rappels d'arbitrages déjà ouverts — état au 20/09

- **`framer-motion` toujours déclaré dans `package.json`** (`^12.38.0`), importé
  nulle part, zéro octet livré. **Dixième report consécutif** — à joindre à la passe
  locale du §4.3, qui touchera de toute façon `package-lock.json`.
- **Vesoul n'a pas de photo** (13/09 §4.3) : `data/city-images.json` compte toujours
  **538 entrées pour 540 villes**, et les deux absentes sont `vesoul` et
  `pierrefitte-sur-seine`. Pierrefitte est attendu (fusionnée dans Saint-Denis en
  2025) ; Vesoul est un vrai trou, qui laisse `10-choses-a-faire-a-vesoul-2026` et sa
  jumelle EN sans bandeau. Rien n'est cassé (les deux locales se comportent
  identiquement, le pipeline prévoit l'absence). Combler demande un crawl
  Wikidata/Commons, donc de l'egress : **ligne pour la prochaine passe locale**,
  `npm run photos:update` suffit si le `P18` existe désormais.
  ⚠️ Note de méthode : mon premier contrôle a **raté** ce trou parce que le
  `catch` autour de `guideCityPhoto()` renvoyait « a une photo ». Un `catch` qui
  retourne la valeur « tout va bien » transforme une exception en conformité.
- **`app/quiz/page.tsx`** : page complète, canonique de `/city-match`, absente du
  sitemap, générée à chaque build. Ce run précise **pourquoi** elle est
  inatteignable : `public/_redirects` porte `/quiz /city-match 301`. C'est donc une
  page générée puis systématiquement redirigée — du poids de build mort, pas un
  défaut visible. Signalée les 23/08, 30/08, 06/09, 13/09 ; toujours là.
- **La préséance de `NEXT_PUBLIC_BASE_URL`** (06/09 §4.1) : toujours ouverte, les
  cinq modules lisent encore `process.env.NEXT_PUBLIC_BASE_URL ?? (locale…)`. La
  garde au déploiement (`check-deploy-locale.mjs`) tient. Le geste de vérification
  reste une ligne sur la machine de publication :
  `grep -n NEXT_PUBLIC_BASE_URL …/.env.local`.
- **`data/city-population.json` (140 Ko)** sur les 1 080 pages ville via
  `CityProfile → DemographyCard`. Remède connu (calculer dans
  `lib/city-profile-data.ts`, descendre en props), mais il touche le rendu des pages
  ville : passe locale avec build.
- **`?limit=abc` sur `/api/cities/search`** rend `{results: []}` au lieu des 8 par
  défaut (`parseInt` → `NaN` → `slice(0, NaN)`). Toujours là, toujours sans portée
  sécurité (entrée bornée par le haut, endpoint rate-limité).
- **Classement biodiversité / espaces verts** : ne pas recréer
  `/classements/biodiversite`, ne pas remettre `RICHNESS_RANKING_PUBLISHED` ni
  `GREEN_SPACE_RANKING_PUBLISHED` à `true`.
- **Les 27 scores en dur de `n8n/workflows/social-media-daily.json`** restent en
  écart avec le pipeline. Décision inchangée depuis le 09/08.
- **Titres > 60 et descriptions > 160** : arbitrage des 09/08 §4.6, 16/08 §4.2,
  30/08 §4.2, 06/09 §4.3 et 13/09 §4.4 reconduit sans le rouvrir. Sur mon
  échantillon (qui inclut toujours le pire cas) : FR 163 rendus sur 93 fichiers et
  106 descriptions sur 88 fichiers ; EN 121 sur 66 et 76 sur 56. L'essentiel vient
  du `metaTitle` des guides, qui **est** le titre de la page — donc une passe de
  réécriture de contenu, pas un correctif d'audit.

---

## 5. Écart avec le prompt de la routine

Les deux mêmes que les six semaines précédentes, tous deux inchangés.

**L'étape 1 demande `npm run build`**, que `CLAUDE.md` interdit depuis une session
cloud (§ Commands, note du 2026-08-08 : > 4 h 30 sans finalisation, `.next` à 25 Go,
`ENOSPC`). J'ai suivi `CLAUDE.md`. Le substitut exécuté en entier : `npx tsc
--noEmit`, `npm run integrity` (qui rejoue les vraies gardes de chargement en 2 s),
`hreflang:check`, `parity`, `search-index:check`, `sitemap:check`, les quatre
selftests hors ligne, plus **873 rendus réels de `generateMetadata()`** sur les deux
arbres, **42 120 rendus** pour le contrôle FR/EN, le traçage du graphe d'imports
client, le contrôle de liens littéraux, celui des 85 règles de `_redirects`, celui
du routage de locale du Worker et celui de la résolution guide ↔ ville sur les
540 villes. **Septième semaine que je le signale** : je recommande que l'étape 1 du
prompt remplace `npm run build` par cette combinaison.

**Les étapes 2 et 3 supposent qu'on peut interroger les sites.** L'egress est refusé
depuis la routine. Tout ce qui touche au comportement d'edge — redirections
réellement servies, canonicalisation d'hôte, `robots.txt` en production, propagation
d'un déploiement — n'est vérifiable qu'en **lisant** `worker/index.ts` et l'export.
Ce run a poussé cette lecture plus loin que les précédents (§1, routage de locale :
les deux tables du Worker croisées avec les deux arbres de routes), mais la question
ouverte au §4.1 de l'audit du 06/09 — l'export EN publie-t-il aujourd'hui l'origine
FR ? — se trancherait toujours d'un seul `curl https://bestcitiesinfrance.com/robots.txt`.
Deux pistes, inchangées : autoriser l'egress vers les deux domaines de production
depuis cette routine, ou déclarer le comportement d'edge hors périmètre.

**Notes de méthode pour le prochain run**, tirées des fausses pistes de celui-ci :
- Les **canonicals FR sont relatifs** (`/city-match`) et les **cibles hreflang
  absolues** : les comparer sans normaliser l'origine fabrique 373 fausses
  asymétries.
- Un **`catch` qui retourne la valeur « conforme »** transforme une exception en
  succès — c'est ce qui m'a fait manquer le trou photo de Vesoul au premier passage.
- Un balayage de sécurité qui **ne lit que les corps des fonctions `handle*`** rate
  les trois endpoints limités au routeur (`quiz`, `copilot`, `summary`).
- Compter les entrées d'un objet TypeScript **au `grep`** compte aussi les champs de
  son interface : `EN_PROFILES` paraissait porter 14 profils, `generateStaticParams()`
  en rend **13**, et la prose qui annonce 13 est juste.
