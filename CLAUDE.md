# MeilleurVille — Project briefing

French city ranking & relocation guide site. 593 cities, 524 FR guides + 261 EN guides, 19 ranking
categories, 18 regions (13 metropolitan + 5 DROM). Copy is **French**.
(Counts derived at build — see `lib/site-stats.ts`; figures here are indicative.)

A parallel **English version** (bestcitiesinfrance.com) is built from
the same repo / same build. See [§ Bilingual setup](#bilingual-setup-bestcitiesinfrancecom)
below. The FR domain remains unchanged.

> **Ce fichier est un index de règles, pas un journal.** Plafond : 60 Ko, contrôlé par
> `npm run integrity` (garde `claude-md`). Les journaux de batches, états de collecte et
> historiques vivent dans `docs/claude/` — voir § Où trouver le reste. Une routine qui veut
> consigner un run écrit **là-bas**, jamais ici.

## Stack

- **Next.js 16.2.x** (App Router, Turbopack) + **TypeScript** (strict). Note:
  there is NO `proxy.ts`/middleware — `output: "export"` can't run one; host
  canonicalization + EN locale routing live in `worker/index.ts`.
- Tailwind v4 with custom CSS variables (`--accent`, `--bg-canvas`, etc.)
- **lucide-react** for icons
- Static-first: pages SSG via `generateStaticParams` exported to `out/`
  (Cloudflare Workers Static Assets). Runtime user data (comments, contact,
  alertes, newsletter, accounts) lives in **D1** behind the API Worker
  (`worker/index.ts`); the `lib/*-store.ts` modules are D1-backed.

## Project layout (high-level)

```
app/
  page.tsx                       # Homepage (hero, SectionNav, FranceHeatmap, TopFiveCities, bento)
  villes/
    page.tsx                     # Browse + filter all cities
    [slug]/
      page.tsx                   # SSR entry → CityProfile.tsx
      CityProfile.tsx            # Tabs: overview / score / discussion
      quartiers/page.tsx         # Per-city neighbourhoods
      climat/page.tsx            # Per-city climate deep-dive
  classements/                   # 13 ranking categories
    page.tsx                     # Index of all categories
    [slug]/page.tsx              # Each category leaderboard
  regions/                       # 18 regions
    [region]/page.tsx
  departements/                  # Per-département pages
  guides/                        # 195 long-form editorial guides
    [slug]/page.tsx
  comparer/                      # /comparer/<a>-vs-<b>
  carte/                         # Interactive France map
  leaderboard/                   # Global top-N table
  quiz/                          # Lifestyle → city match
  red-flags/                     # Pitfalls per city archetype
data/
  cities-seed.ts                 # 561 cities, raw seed (calibrated + normalized at module load)
  guides.ts                      # 195 long-form guides
  neighborhoods.ts               # Quartier-level data (subset of cities)
  housing.ts                     # Rent/price benchmarks per city
lib/
  types.ts                       # City, CityScore, Review, QuizAnswers
  score-calibration.ts           # Editorial overrides (Marseille safety, etc.)
  score-distribution.ts          # z-score rescaling so spread looks honest
  niche-scores.ts                # Lifestyle-specific recombinations
  rankings.ts                    # RANKING_META + sort logic per category
  city-narrative.ts              # Auto pros/cons/notable narrative
  comments-store.ts              # D1-backed comment persistence (via worker)
  contact-store.ts               # D1-backed contact form persistence
  spam-filter.ts, rate-limit.ts  # Abuse mitigation (rate-limit: in-memory burst + D1 fixed-window)
components/
  SectionNav.tsx                 # Sticky homepage section quick-nav (scrollspy, appears post-hero)
  Navbar.tsx                     # Nav links visible at lg (1024px+) to avoid overflow at md
  # + standard components (Footer, FranceHeatmap, CityCard, etc.)
```

## Score pipeline

`CITIES_SEED = normalizeDistribution(RAW_CITIES_SEED.map(calibrateScores))`

1. **Raw seed** in `data/cities-seed.ts` — global + 8 axes (life, transport,
   nature, cost, safety, culture, remoteWork, schools) on 0–10.
2. **`calibrateScores`** (`lib/score-calibration.ts`) — editorial overrides
   anchored in real data (SSMSI crime, Insee rents, observatoires loyers).
3. **`normalizeDistribution`** (`lib/score-distribution.ts`) — per-axis
   z-score rescaling (target mean ≈ 5.7, std ≈ 1.5). Global is a weighted
   mean **minus a worst-axis penalty**, so a city weak on one axis can't hide
   behind strengths elsewhere. Final clamp `[2.8, 8.6]`.

**Cohorte de référence (2026-10-06)** : les moments du z-score (moyenne, écart-type par axe) se
calculent sur les 540 villes d'origine seulement. Une ville ajoutée par l'extension du seed porte
`scoreCohort: "extension"` : elle est notée sur la même échelle mais n'entre pas dans le calcul,
donc **ajouter une ville ne déplace la note rendue d'aucune autre**. Sans ça, 4 communes de petite
couronne changeaient la note de 522 villes et rendaient 1 018 citations de guides candidates à être
fausses (mesure `scripts/seed-drift.ts`). Ne pas retirer le champ d'une ville d'extension, et ne
pas le poser sur une ville d'origine. Procédure complète : `docs/extension-villes.md`.

**Editing a score**: change the seed value or add an override in
`score-calibration.ts`. Don't touch `score-distribution.ts` for a single
city — the rescaler is designed to keep relative ranking stable.

⚠️ **Never quote a seed literal in copy — quote what the page renders.**
`data/cities-seed.ts` holds the *raw* values (Rennes `safety: 7.8`); every
surface renders `CITIES_SEED`, i.e. the calibrated + normalized value (Rennes
5,9). Writing « sécurité 7,8/10 (source : `data/cities-seed.ts`) » is therefore
true of the *file* and contradicted by `/villes/rennes` in one click. That is
exactly how 1 026 figures drifted across the guide corpus and the seed's own EN
meta fields before the 2026-08-10 fix (gaps up to 2,3 points; ROADMAP § Shipped
2026-08-10 has the full account). Read the value through the module — a scratch
`npx tsx` that imports `@/data/cities-seed` — never by grepping the seed source.
`npm run integrity` now fails when a figure sitting next to an axis name equals a
city's raw literal while the page shows something else. It is a narrow guard by
design (no false positives, and it cannot see an invented number), so it is a net,
not a substitute for reading. Niche scores have the same trap: `Score retraite` /
`Score étudiant` come from `computeNicheScores()` (`lib/niche-scores.ts`), not
from any seed field.

⚠️ **Cite a source the reader can open, never a repo path** (2026-10-11). Guide copy carried
2 389 « (source : data/cities-seed.ts) » / « per data/housing.ts » shown verbatim to readers.
Write « (source : notre fiche ville) », « notre estimation des loyers », « Insee, recensements »,
« notre fiche quartiers », « OpenStreetMap » (EN: « our city profile », « our rent estimate »,
« INSEE census », « our district data »). Full table in `scripts/humanize-guide-sources.mjs`,
which also rewrites a batch in place; `npm run integrity` (garde `sources`) fails on any
`data/…`, `lib/…` path left in a guide string. Paths stay fine in ROADMAP/CLAUDE.md and comments.

## Design identity — « Couleurs » (2026-10-22)

Le 2026-10-22 le propriétaire a rejeté « Carte & plaque » (papier crème + bleu marine, 2026-10-16) :
« trop blanc et moche, je veux quelque chose de moderne mais coloré, et un fond distinct pour chaque
section ». Tokens dans `app/globals.css` ; s'y tenir.

- **Palette** : fond `--bg-canvas #F5F7FF`, cartes `--bg-surface #FFFFFF`, texte `--text-primary #141B2D`,
  accent **indigo `--accent #4F46E5`**, rose `--accent-pink #DB2777` (nom de variable conservé), cyan
  `--accent-cyan #0891B2`, `--plaque-frame #EC4899`. Vert / lime / ambre / orange / rouge / violet restent
  **réservés aux 6 paliers de score** : les accents décoratifs restent dans les familles indigo / rose / cyan.
- **Une bande de couleur par section** : `.band .band-indigo | -pink | -sky | -aqua | -lilac | -white` (fond
  uni peint pleine largeur même autour d'une colonne étroite, par box-shadow + clip-path), `.band-bold`
  (dégradé indigo → violet → rose, texte blanc, variables de texte redéfinies) pour un seul appel à l'action.
  Les sections de premier niveau de `<main>` tournent automatiquement entre les cinq bandes
  (`:where(main > section)`, spécificité nulle : une classe de fond posée sur la section l'emporte).
  L'accueil pose ses bandes explicitement, deux sections voisines n'ont jamais la même.
- Hero en aurore colorée (`.bg-aurora`), titres en `.gradient-text` (indigo → rose → cyan), pied de page
  en dégradé indigo nuit → prune.
- **Logo** (2026-10-22) : carré dégradé indigo → violet → rose, épingle blanche avec une maison, sans filet fin
  (illisible à 16 px, la taille du logo dans les résultats Google). Source unique `app/icon.svg` ; `app/favicon.ico`
  (16/32/48), `app/apple-icon.png` (180), `public/icon-192.png` et `public/icon-512.png` (logo du JSON-LD
  Organization) en sont rendus par sharp ; `components/BrandMark.tsx` recopie la même géométrie. Changer l'un =
  regénérer tous les autres. `#4F46E5` remplace `#1E3A6E` partout (images OG, theme-color).
- **Illustrations** : `components/EmojiBadge.tsx` (emoji dans une pastille dégradée, 6 teintes pastel, `toneFor()`
  pour une rotation stable). En tête des sections de l'accueil, sur les 43 vignettes et l'en-tête des pages Red
  Flags (champ `emoji` de `lib/red-flag-themes.ts`), sur le teaser guides (champ `emoji` des guides). Le
  propriétaire veut des sections illustrées : ne retire plus les emojis au nom de la sobriété.
- **Barre du bas sur téléphone** : Villes · Top · Red Flags · Politique · Menu. City Match en a été retiré
  à la demande du propriétaire (2026-10-22) ; il reste dans la barre du haut et le menu.
- **Les photos de villes restent** (demande du 2026-10-18) : une carte qui représente une ville garde sa
  photo Commons + crédit.
- Ne réintroduis jamais le papier crème `#F6F2E9`, le marine `#1E3A6E` ni la brique `#C2410C`.
  `components/AmbientBackground.tsx` reste un composant serveur sans JS : pas de fond WebGL/canvas.
- **Plus aucun motif à lignes** (demande du 2026-10-22 : « je n'aime pas le design à lignes, plus coloré,
  partout ») : `.topo-bg` ne peint plus les courbes de niveau de `public/textures/topo.svg` mais un maillage
  coloré doux (indigo, rose, cyan) ; `.plaque` n'a plus de filet ni de liseré, c'est une pastille en dégradé.
  Les barres de tête de carte utilisent `.grad-head-0` … `.grad-head-5` (dégradés vifs, texte blanc), en
  rotation par index. Les libellés « Feuille NN / 19 » sont devenus « Classement NN ». Ne réintroduis ni
  hachures, ni filets doubles, ni pointillés décoratifs.

## Score colour scale (6 tiers — applied in lib/utils.ts, CityCard, FranceHeatmap, DromStrip, CarteClient, ScoreBar, all opengraph-image.tsx)

Effectifs mesurés en exécutant `CITIES_SEED` (après calibrage et normalisation), jamais en lisant le
seed source. **Recompter après tout ajout de villes**; l'historique des recomptes par lot est dans
`docs/extension-villes.md`. Les 540 villes d'origine ne bougent pas (§ Score pipeline, cohorte).

| Range  | Colour  | Count (593 cities) | Meaning        |
|--------|---------|-------------------|----------------|
| ≥ 7.5  | Violet (`#A855F7`) | 19 (3.2%) | Exceptionnel   |
| ≥ 7.0  | Green   | 50 (8.4%)         | Excellent      |
| ≥ 6.0  | Lime    | 151 (25.5%)       | Bon            |
| ≥ 5.0  | Amber   | 158 (26.6%)       | Moyen          |
| ≥ 4.0  | Orange  | 121 (20.4%)       | En dessous     |
| < 4.0  | Red     | 94 (15.9%)        | Mauvais        |

Distribution mean ≈ 5.35. Penalties:
- `worstPenalty = max(0, 4.5 − worst_axis) × 0.35` — fires when any axis < 4.5
- `safetyPenalty = (4.5 − safety) × 0.25` when safety < 4.5
- `standoutBonus = max(0, top3_mean − 7.5) × 0.35` — only truly exceptional top-3
- `TARGET_STD = 1.7` for per-axis z-score spread


## Conventions

- Copy is **French**. Use the existing voice ("sans bullshit", direct, data-led).
- All pages must work **without JavaScript** for SEO. Client components only
  where interactivity demands it (filters, tabs, maps).
- Prefer SSG (`generateStaticParams`) over dynamic routes.
- Sitemap (`app/sitemap.ts`) must include any new content route — guides,
  city sub-pages, classements, comparer pairs.
- OG images: each public page has an `opengraph-image.tsx` next to its `page.tsx`.
- **Never use `ref` as a custom prop name** — React reserves it; passing a
  number through `ref` breaks SSR with a refs-in-server-components error.
- The map components (`components/FranceHeatmap.tsx`, `app/carte/CarteClient.tsx`)
  use a metropolitan bounding box `lng ∈ [-6, 10]` × `lat ∈ [40, 52]`, so DROM
  cities are excluded from the **SVG plot** (they'd render off-canvas). DROM is
  **not invisible**, though: both maps render `<DromStrip />` below the SVG —
  a card per territory (Guadeloupe/Martinique/Guyane/Réunion/Mayotte) with its
  top cities as score-coloured, clickable links + region link, locale-aware.
  This is the chosen treatment over geographic "inset cartouches": territories
  here have 1–8 cities each (Mayotte 1, Guyane 2), so mini-map insets would mean
  tiny, overlapping, hard-to-click dots — the card strip is clearer. (Done; the
  old "inset cartouches follow-up" note is superseded.)
- "Pro" / paywall references are being removed (commit `bed2367`). If you see
  a stale Premium teaser, prefer removing it over reinforcing it.
- **setState-in-effect pattern**: initialise localStorage-backed state with lazy
  initialisers (`useState(() => readFavorites()...)`) not `useEffect`. Derive
  computed state with `useMemo` instead of effect + setState.
- **Canonicals**: every dynamic route `generateMetadata` must return
  `alternates: { canonical: "/<route>/<slug>" }`. Root layout provides the
  global default via `metadataBase`; page-level canonical overrides are needed
  for villes, classements, guides, regions, departements, comparer, quartiers, climat.
- **hreflang**: returning `alternates` at page level **replaces the layout's
  object wholesale**, so a page that sets only `canonical` silently drops the
  `languages` map — that is how 94 % of the site lost its hreflang (audit
  2026-08-02 §2.1). A route with an exact twin in the other locale must return
  `languages` too. City sub-pages don't hand-roll it: they call
  `cityAlternates(frSub, slug)` / `cityAlternatesEn(enSub, slug)` from
  `lib/i18n.ts`, which carry canonical **and** hreflang. A new city sub-page
  therefore means one entry in `FR_TO_EN_CITY_SUB` and a run of
  `npm run hreflang:check` (it fails if the twin route is missing, is in a
  different activation state, or the file skipped the helper). Sub-slugs are
  **not** shared across locales (`sante` ↔ `healthcare`): never derive the EN
  URL by translating the head segment alone — a hreflang pointing at a 404 is
  worse than none.
  Hors sous-pages ville, la paire s'écrit **à la main** avec
  `pathAlternates(frPath, enPath)` / `pathAlternatesEn(...)` — c'est la seule
  façon de déclarer une paire dont la **queue** est traduite
  (`/vacances/mois/février` ↔ `/vacations/month/february`). Depuis le
  2026-09-02, `npm run hreflang:check` relit aussi ces **195 appels** : les deux
  chemins doivent correspondre à une route réelle (littéral face à littéral,
  dynamique face à dynamique), le canonical doit être celui de la page qui
  l'émet, et la variante FR ne doit pas être appelée depuis une page EN.
  ⚠️ **Un `npm run parity` vert ne prouve pas qu'une URL existe** : son
  `coveredByDynamic` accepte n'importe quelle route EN dynamique de même
  profondeur, donc `/vacations/quiz` y passe pour couvert par
  `/vacations/[city]` alors que c'est un 404. Vérifier sur le
  `generateStaticParams` d'en face, jamais sur la ressemblance des slugs.
- **`openGraph` has the exact same trap as `alternates`** (found 2026-08-03):
  a page-level `openGraph` object **replaces the inherited one wholesale**, so
  declaring `openGraph: { title, description }` without `images` doesn't fall
  back to the root `opengraph-image.tsx` — it emits **no `og:image` at all**.
  237 pages shipped with no social card because of this (78 EN incl. the EN
  homepage, 159 FR), which is why shared links rendered without the logo. Every
  page-level `openGraph` must carry `images: ["/opengraph-image"]` unless the
  route has its own `opengraph-image.tsx` sibling (which does inherit
  correctly). Sweep for regressions with: for each `page.tsx` containing
  `openGraph`, flag it when it has no `images:` and no sibling
  `opengraph-image.tsx`.
- **Brand name**: **`MaVilleIdéale`** (FR) / `BestCitiesInFrance` (EN) — with the
  final `e` and the accent, matching the domain and the transactional emails.
  The accent-less `MaVilleIdeal` was purged 2026-07-27 across 148 occurrences;
  don't reintroduce it. Uppercase wordmark (badge SVGs): `MAVILLEIDÉALE`.
- **Title length**: the root layout's `title.template` is a bare **`%s`** — no
  brand suffix. It used to be `%s | <brand>`, which applied to all ~52 000 pages
  and pushed the median title to 83 chars when Google renders ~60, so the part
  that got truncated was the city or guide name. A page may append the brand
  **only if the result stays ≤ 60 chars**; use `hubTitle()` from `lib/brand.ts`
  rather than hardcoding the suffix. `openGraph`/`twitter` titles keep the brand
  — those are social cards, not search results.
- **Meta descriptions ≤ ~160 chars.** Don't pad with generic tails
  ("Comparez avec d'autres villes.", "Estimation déterministe dérivée des
  scores…") — they push the figures a searcher actually scans out of the
  rendered snippet. Where a `description` field doubles as on-page editorial
  copy (the `/classements` hubs), wrap the metadata use in `clampMeta()` so the
  tag is cut on a sentence or clause boundary and the page keeps the full text.
- **Score convention**: **the name of the metric must match the direction of the
  number, and hreflang twins must show the same number.**
  - Named for a **quality** (Sécurité, Qualité de l'air, Services publics,
    Démographie, Emploi, Santé) → `10 = bon`. Libs that score the hazard
    (`10 = pire`) are inverted **at the display site**, never in the engine —
    sorts, levels and rankings keep the raw value.
  - Named for a **nuisance** (Bruit, Stress hydrique, Risques naturels, Tension
    locative) → raw `10 = pire` is correct; the name already says which way is
    bad. Don't invert these.
  - Every surface states what 10 means in its legend.
  - A FR page and its EN counterpart are hreflang alternates: they must never
    show different numbers for the same city. This is the check that catches the
    bug — it's how safety (FR 6,8 vs EN 3,2) and the env quartet were found.
  - Careful with colour: `scoreColor`/`scoreHex` is the global `10 = vert`
    palette. A surface displaying a raw nuisance score must feed it the inverse
    (see `hazardColor` in the EN noise/water/natural-risks pages), or use a
    level-keyed palette (`NOISE_LEVEL_COLOR` & co, as the FR pages do).

  Each hazard lib has a `**Convention**` comment block. `lib/environment-index.ts`
  is the reference shape: it exposes both `healthScore` (10 = sain) and
  `stressComposite` (10 = pire) so each surface picks the one matching its name.

- **Un classement ne publie un rang que là où le score départage** (convention
  posée 2026-08-19, `lib/owner-rankings.ts`). Un `sort` suivi d'un `slice(0, N)`
  sur un score à une décimale **fabrique** la fin de sa liste : `/classements/qualite-air`
  remplissait 18 de ses 50 lignes en piochant dans une égalité à **411 villes**, et
  `/classements/calme-sonore` ses 50 lignes dans une égalité à **170** — dans l'ordre
  d'insertion du seed, présenté comme des rangs. Deux règles, à appliquer à tout nouveau
  classement : ① une ville dont le score est un **repli constant** (même valeur pour tout
  le monde faute de donnée propre) sort du barème, elle n'est pas triée à égalité — c'est
  le précédent du rang de richesse biodiversité, retiré le 10/08 ; ② une **égalité ne se
  coupe jamais en son milieu** : on groupe par valeur, on s'arrête avant le palier qui
  déborde, et la page dit combien de villes suivaient et à quelle note. Corollaire JSON-LD :
  `itemListOrder: ItemListUnordered` (sans `position`) dès qu'une des premières villes est
  ex æquo — sinon l'ordre fabriqué repart en données structurées, où personne ne le relit.
  Un tri par nom à l'intérieur d'un palier est un ordre **stable**, pas un départage, et
  doit être annoncé comme tel.
  ⚠️ Piège voisin, trouvé le même jour : les chaînes `methodology` / `intro` de ces
  classements vivent **loin** de la fonction qu'elles décrivent (définition d'un côté,
  calcul de l'autre, version EN dans une troisième file), et **7 sur 20 décrivaient un autre
  calcul** — dont deux pages EN qui citaient les pondérations de `lib/niche-scores.ts` alors
  qu'elles classent `lib/owner-scores.ts`. Ni `tsc` ni `npm run integrity` ne peuvent voir
  l'écart entre une phrase et une formule : relire les deux locales dès qu'un barème bouge.

## Adding a new city

1. Append a record to `RAW_CITIES_SEED` in `data/cities-seed.ts` with all
   required fields (slug, name, region, department, lat/lng, scores). Real
   metropolitan-bbox cities show up on maps automatically; outside-bbox
   cities (DROM) skip the maps but appear everywhere else.
2. If introducing a **new region**, add the emoji + description in:
   - `app/regions/page.tsx` — `REGION_EMOJIS`
   - `app/regions/[region]/page.tsx` — `REGION_EMOJIS` and
     `REGION_DESCRIPTIONS`
3. Build (`npm run build`) — region/department/city/climat/quartiers pages
   regenerate via `generateStaticParams`.

## Phone/desktop conventions (audit 2026-10-16)

- **Top bar hides on scroll down below `lg`** (`components/Navbar.tsx` sets `html[data-nav-hidden]`).
  Any new sticky sub-nav must use `top-[var(--nav-h)]` (defined in `app/globals.css`), never
  `top-14`, or it will float under an empty strip / be covered by the bar.
- Bottom tab bar (phone): Villes · Top · City Match · Red Flags · Politique · Menu (VS moved to
  the menu at the owner's request). Menu is the highlighted control; « Se connecter » is a
  discreet icon on purpose.
- `.grid > * { min-width: 0 }` is global: one `truncate`d line in a grid without explicit
  columns used to push cards off the phone screen. Don't remove it.
- Places get Google Maps links (`lib/maps-link.ts`, `components/MapsQuickSearch.tsx`); OSM stays
  as the source credit. The 👍/👎 `FeedbackWidget` rides inside `DiscussionCTA` (every city
  sub-page) and sits before the footer on hubs — add it to new hub pages.
- **Présidentielle 2027 projection** (`lib/presidential-2027.ts`, polls in
  `data/presidential-2027-polls.ts`): shown FIRST on `/orientation-politique`, `/political-leaning`
  and the city politics card. Proportional national swing per bloc applied to each commune's 2022
  result — always labelled as a mechanical projection. Refresh the 6 polls monthly (latest
  published, hypothesis with the RN candidate every institute tests) and bump `POLLS_2027_AS_OF`.


## Adding a new content sub-page (per city)

Pattern to follow: `app/villes/[slug]/climat/page.tsx`.

- `generateStaticParams` over `CITIES_SEED`.
- Compute everything from existing seed fields — don't introduce a new
  per-city dataset unless you commit to populating all 352 entries.
- Add a card link from `app/villes/[slug]/CityProfile.tsx` (the right-hand
  rail under "Quartiers" / "Climat").
- Add the route to `app/sitemap.ts` (`cityRoutes`).
- Generate JSON-LD where it makes sense (Article, ItemList).
- Add `alternates: { canonical: "/villes/${slug}/your-sub-page" }` to `generateMetadata`.

## Commands

```bash
npm install
npm run dev           # http://localhost:3000 (Turbopack)
npx tsc --noEmit      # strict TS pass (clean)
npm run integrity     # gardes de données + scores cités dans les guides, 2 s. À LANCER AVANT TOUT PUSH DE CONTENU.
npm run search-index  # régénère data/search-index(.en).json — obligatoire après un guide FR ou EN (search-index:check échoue sinon)
npm run sitemap:check # sitemap ↔ routes, deux sens, deux locales, 22 s. À LANCER APRÈS TOUTE NOUVELLE ROUTE.
npm run parity        # routes FR sans jumelle EN (⚠️ vert ne prouve pas qu'une URL EN existe)
npm run hreflang:check
npm run build         # SSG complet ~58 000 pages — PAS en routine cloud (ENOSPC, 4 h+)
npm run lint          # ~230 erreurs historiques, aucune runtime
```

- **Jamais `npm run build` depuis une routine cloud** : la génération dépasse le disque de la session
  (`.next` > 25 Go, 4 h 30 sans finir). Le substitut qui suffit : `npx tsc --noEmit` + `npm run integrity`
  (qui charge les vrais modules, donc les gardes `assertUniqueSlugs` / `assertKnownSlugs`) +
  `search-index` / `sitemap:check` selon ce qui a changé. Le build réel tourne dans GitHub Actions.
- `tsc` ne remplace pas `integrity` : un `relatedGuides` vers un slug inexistant est bien typé.
- Conteneur de routine : souvent **HEAD détaché et sans `node_modules`** → `git checkout main && npm install`
  avant de conclure quoi que ce soit d'un `tsc` massivement rouge. Brouillons **hors du dépôt**.
- Egress routine : la recherche web marche ; `WebFetch` vers wikipedia, legifrance, service-public,
  inpn, gbif, data.gouv… répond 403. Recouper sur plusieurs résultats de recherche.
- Détails, chiffres de build et runbook manuel : `docs/claude/deploiement.md`.

## Déploiement — automatique (GitHub Actions)

- **`.github/workflows/deploy.yml`** publie `main` deux fois par jour (05h30 et 17h30 UTC) : tsc +
  integrity bloquants, build FR → `cf:deploy` (www.mavilleideale.fr), build EN → `cf:deploy:en`
  (bestcitiesinfrance.com), contrôle 200 en prod. Ne part pas si `main` n'a pas bougé. Manuel :
  `gh workflow run deploy.yml` ; état : `gh run list --workflow deploy.yml`.
- **`.github/workflows/data-runner.yml`** (02h20 / 14h20 UTC) exécute `scripts/local-data-runner.sh`
  (biodiversité, actualité locale, zones protégées, sport…) et pousse `data(pipelines)`.
- **Les routines ne déploient pas** : elles poussent sur `main`, Actions publie. Une routine qui casse
  `tsc` ou `integrity` bloque la publication de tout le monde — c'est pour ça que les deux sont obligatoires.
- Piège gardé par `scripts/check-deploy-locale.mjs` : les deux workers lisent le même `out/` ; un export FR
  ne part jamais sur le domaine EN.
- Le site Luxembourg **meilleurville.lu** est un autre dépôt (`luxmeilleurville`), publié à chaque push.

@AGENTS.md

## Performance constraints

Pages are static and edge-cached (TTFB 90–300 ms); what costs the user is the
payload the browser must parse.

- **Never render a full collection in a client grid.** `/guides` shipped 2.5 MB of
  HTML by rendering all 654 cards at once. `GuidesGrid` and `VillesSearch` both
  cap the first render (`INITIAL_VISIBLE`) and reveal the rest on click. When you
  cap a hub page, keep the links crawlable — `/guides` emits a compact `<details>`
  link index of all guides (≈100 bytes a link vs ≈2.4 kB a card).
- **Projections, not entities.** A client component's props are serialized twice
  (DOM + RSC flight payload). `/guides` passes card fields only, with `intro` cut
  to a 200-char excerpt.
- **Never import `@/data/guides` (or `@/data/guides-en`) from a client component.**
  A `"use client"` module that touches the corpus ships all ~6 MB of it: an array
  of object literals is not tree-shakable, so asking for `slug`/`title`/`emoji`
  hands the browser the body of every section of every guide — plus `CITIES_SEED`,
  which `data/guides.ts` imports for its integrity asserts. That is how
  `SearchPalette` shipped a **5.9 MB chunk (1.79 MB gzip)**, one order of magnitude
  above every other chunk (fixed 2026-08-04 → 668 kB / 0.13 MB gzip). The same trap
  hides behind `@/lib/guide-tags`, which reads the same module. Client code reads
  **`lib/search-index.ts`** instead — a lean projection generated by
  `scripts/build-search-index.mjs` (`npm run search-index`, replayed by `prebuild`
  so production can't go stale; `npm run search-index:check` fails on a stale
  commit). `GUIDE_CATEGORIES` already lives in `lib/guide-categories.ts` for the
  same reason. If you need a new field client-side, add it to the projection —
  don't import the corpus. **La projection est par locale** (2026-08-06) :
  `data/search-index.json` (FR, depuis `data/guides.ts` + `lib/guide-tags.ts`) et
  `data/search-index.en.json` (EN, depuis `data/guides-en.ts` +
  `lib/guide-tags-en.ts`) sont générés par le même script et commités tous les
  deux ; `lib/search-index.ts` choisit sur `NEXT_PUBLIC_DEFAULT_LOCALE`, valeur
  inlinée au build, donc un seul des deux JSON part dans le bundle (mesuré :
  187 Ko côté FR, 98 Ko côté EN). Ajouter un guide EN sans relancer
  `npm run search-index` fait échouer `search-index:check`, comme côté FR.
- **Le même piège vaut pour `@/data/cities-seed`, et il a tenu plus longtemps** (corrigé
  2026-08-27) : `SearchPalette` importait le seed pour en lire **quatre champs**, et `RANKING_META`
  depuis `@/lib/rankings`, qui tire le seed *et* `data/housing.ts` pour ses fonctions de tri. La
  palette étant montée par la `Navbar`, ces 588 Ko partaient sur **toutes** les pages. Deux
  frontières neuves : **`lib/rankings-meta.ts`** (la table éditoriale des 19 classements, **zéro
  import** ; `lib/rankings.ts` la réexporte, les appelants historiques n'ont rien à changer) et
  **`SEARCH_CITIES`** dans les index générés (slug/nom/région/score, émis par
  `scripts/build-search-index.mjs`, qui **évalue le vrai module** donc porte le score *rendu* et
  jamais le littéral). Mesuré : 741 182 → 266 235 o minifiés, 154 557 → 61 263 o gzip. Un composant
  client qui a besoin d'un champ de ville l'ajoute **à la projection** ; il n'importe pas le seed.
- **Un graphe d'imports dit ce qui est *atteignable*, pas ce qui est *livré*.** Le même audit
  donnait `data/political-lean.json` (289 Ko) pour passager de `PoliticalLeanTail` ; à la mesure, le
  bundler l'élimine déjà (3 584 o avant comme après), les fonctions qui touchent le JSON n'étant pas
  appelées là. Avant d'annoncer un gain, le mesurer — un `esbuild --bundle --minify` sur le composant,
  mêmes externals des deux côtés, suffit et coûte deux secondes, là où `npm run build` est interdit.
- **No framer-motion.** It was pulled in by `ScrollReveal` alone (~110 kB) and has
  been rebuilt on IntersectionObserver + a CSS transition. Don't reintroduce it
  for an effect the compositor can run. Note `ScrollReveal` renders its children
  at `opacity: 0`; the `@media (scripting: none)` rule in `globals.css` is what
  keeps them visible without JS.
- **`CityProfile` est un composant serveur (2026-10-31).** Les ~30 cartes rendent du HTML
  sans JS ; l'interactif vit dans `app/villes/[slug]/CityProfileIslands.tsx` (onglets, sélecteur
  de profil de vie, modale d'avis via un contexte). Mesuré à l'esbuild : 371 → 115 Ko minifiés,
  101 → 34 Ko gzip. **Ne remets pas `"use client"` sur `CityProfile`** : une carte qui a besoin
  d'un hook devient sa propre île, et une valeur passée à une île doit être sérialisable (pas
  d'icône lucide, pas de fonction). Avant : un seul composant client de 1 580 lignes. ✅ **Le plus gros passager
  est sorti (2026-10-10)** : `data/city-population.json` atteignait le bundle par
  `DemographyCard → lib/demography → lib/city-population`. La démographie se
  calcule désormais dans `lib/city-profile-data.ts` (`data.demography`) et les
  libellés vivent dans `lib/demography-labels.ts` (zéro import). Mesuré à
  l'esbuild sur `CityProfile` : 443 → 351 Ko minifiés. **Un composant client
  n'importe jamais une valeur de `lib/demography`.** Les autres passagers relevés sont
  légitimes : `city-synthesis` dans `PersonalSynthesisQuiz` (le quiz recalcule
  dans le navigateur), `data/housing.ts` et `data/city-cards.json` dans les six
  quiz et grilles (loyers et photos servent au filtrage côté client).


## Bilingual setup (bestcitiesinfrance.com)

Same repo, same build, two Vercel projects, two domains.

- `mavilleideale.fr` (env: `NEXT_PUBLIC_DEFAULT_LOCALE=fr`, default) — unchanged.
  All FR routes stay at their existing paths (no URL prefix).
- `bestcitiesinfrance.com` (env: `NEXT_PUBLIC_DEFAULT_LOCALE=en`) — the API
  Worker (`worker/index.ts`) maps bare URLs to the `/en/*` asset tree, so the
  URL bar stays clean (e.g. `bestcitiesinfrance.com/cities/lyon` → serves the
  exported `app/[locale]/cities/[slug]` page). There is no `proxy.ts`; with
  `output: "export"` it could never run, and the EN rewrite only exists in the
  deployed Worker (not in `next dev`).

### Key files

- `worker/index.ts` — host canonicalization (apex↔www 301) + EN locale asset
  routing + `/api/*` + crons. Replaces the deleted `proxy.ts`.
- `lib/i18n.ts` — minimal `t(key, locale)` accessor. **No external i18n lib.**
- `locales/fr.ts`, `locales/en.ts` — flat key→string maps for UI copy.
- `app/[locale]/` — parallel route tree for EN. Only `locale = "en"` is generated
  (the FR pages live at root, not under `[locale]`).
- `data/cities-seed.ts` — added optional `descriptionEn`, `seoTitleEn`,
  `seoDescriptionEn` fields. Populated on the first 10 cities as a pattern;
  extend to the remaining 342 via a side translation file when ready.
- `app/sitemap.ts` — emits a FR or EN sitemap depending on
  `NEXT_PUBLIC_DEFAULT_LOCALE` (each Vercel project gets its own).
- `app/layout.tsx` — emits `hreflang fr / en / x-default` on every page.

### Rules

- **Never break FR routes.** Existing `app/villes/[slug]/page.tsx` etc. stay as-is.
- **No new npm dependency.** The translation system is two flat TypeScript objects
  + a typed accessor.
- **Stay SSG.** EN pages use the same `generateStaticParams` pattern (540 cities at build).
- **Cross-domain canonical.** FR canonical → `mavilleideale.fr/...`,
  EN canonical → `bestcitiesinfrance.com/...`. `hreflang` cross-links the two.
- **EN n'indexe que ≈ 3 700 URL (2026-10-31).** Les pages gabarit par ville / par paire (42 sous-pages
  ville, household-cost, gentrification, calculator, red-flags et vacations par ville, tags, synthèses…)
  restent en ligne en `noindex, follow` (en-tête posé par le Worker) et sortent du sitemap EN. Liste unique :
  `lib/en-index-policy.ts`, lue par le Worker, `app/sitemap.ts` et `sitemap:check`. Cause : 90 % du sitemap EN
  était du gabarit à 70-97 % identique, sur un domaine sans lien externe → Google a lâché le domaine entier.
  Une nouvelle famille EN programmatique entre dans cette liste par défaut.
- **Adding EN content for a 11th city.** Add `descriptionEn`, `seoTitleEn`,
  `seoDescriptionEn` to the seed record. No other change required.


### Conventions for adding an EN route

1. Create `app/[locale]/<route>/page.tsx`. Generate static params with `{ locale: "en", ... }` only.
2. Add `metadata.alternates.canonical` pointing at `${ORIGIN_BY_LOCALE.en}/<route>`.
3. If FR and EN share a slug, ensure it is NOT in `FR_ONLY_SEGMENTS` in `proxy.ts`.
4. Add the new URL(s) to a `SITEMAP_CHUNKS_EN` chunk in `app/sitemap.ts`.
5. Keep English native, not translated-from-French. Direct, slightly dry, factual. No "discover the charming…".
6. **Reused FR client components leak French.** If an EN page renders a client/component built for the FR site (e.g. `CityProfile` sub-cards, the interactive tools), that component MUST accept a `locale?: "fr" | "en"` prop (default `"fr"`, FR output byte-identical) and branch every visible string via a `t(fr, en)` helper — plus emit `/cities/`, `/rankings/`, `/compare/` paths under EN. When strings originate in a shared lib, add a local English label map at the display site (don't edit the lib). Audited & fixed 2026-05-31: the 6 interactive tools (`people-like-you`, `copilot`, `city-match`, `future-you`, `projection-5ans`, `climate-2040-timelapse`) + 7 `CityProfile` sub-components. Navbar/Footer/calculators were already locale-aware. 2026-06-01 round: `BookingCTA` + `StickyBookingBar` (EN copy + `.en-gb` booking host, wired across the 6 EN `/vacations` + calculator pages), `CityProfileCta` (EN copy, `/cities/` link, EN score-tier label map), and pass-through `locale="en"` for `CityFingerprint`/`DiscussionCTA` on the EN `fingerprint`/`seasons`/`neighbourhoods` sub-pages. The EN homepage already passes `locale="en"` to its full section tree.

## Où trouver le reste (`docs/claude/`)

Ces fichiers gardent les sections d'origine **mot pour mot** (mêmes titres, donc un `grep` sur un titre
de section marche toujours, sur `docs/claude/` au lieu de `CLAUDE.md`).

| Fichier | Contenu |
|---|---|
| `docs/claude/guides.md` | Content roadmap guides : séries per-city, batches tourisme 1-60 (table des slugs `au-`/`aux-`, gisements), palmarès mensuel, dédups FR/EN |
| `docs/claude/glossaire.md` | Glossaire : sections, compteurs, chiffres omis volontairement |
| `docs/claude/expat-retour.md` | Fiches pays expat-retour, article de pays, méthodes |
| `docs/claude/pour-qui.md` | Profils `/pour-qui`, contrôle des ex æquo, axes continus |
| `docs/claude/red-flags.md` | Thèmes Red Flag Radar |
| `docs/claude/politique-agenda-sport.md` | Présidentielle 2027 + fil politique, agenda daté (`data/city-events.ts`), sport |
| `docs/claude/donnees-vague7.md` | F62 biodiversité, F63 qualité de l'air, F64 actualité locale (états de collecte) |
| `docs/claude/roadmap.md` | Roadmap technique/produit (R7-R13), EN translation roadmap, v11, vague 6, pipeline photos |
| `docs/claude/deploiement.md` | Historique du build et du déploiement, runbook manuel complet |
| `docs/extension-villes.md` | Extension du seed (lots, recomptes de paliers) |

## Règles pour les routines planifiées

- Un run = un commit poussé sur `main` (ou aucun si rien de vérifiable). `git pull --rebase` au début
  et avant de pousser ; jamais de force-push.
- `npx tsc --noEmit` **et** `npm run integrity` verts avant de pousser, sinon tu bloques la prod.
- Ton journal de run va dans le fichier `docs/claude/*.md` de ton sujet (ou `docs/…-log.md`), en
  **5 lignes maximum** : date, ce qui est livré, compteurs mesurés, prochain lot. Pas de récit.
- Ne lis pas tout `docs/claude/guides.md` (240 Ko) : `grep` la section ou le dernier batch.

## Index des titres déplacés

Chaque titre ci-dessous existe mot pour mot dans le fichier indiqué : un `grep` qui cherchait la section dans `CLAUDE.md` tombe ici, puis va lire ce fichier.

- Déploiement — automatique la nuit, manuel si tu es pressé → `docs/claude/deploiement.md`
- Vague 7 (2026-07-29) — Score Biodiversité → `docs/claude/donnees-vague7.md`
- Expat retour (`lib/expat-return.ts`) → `docs/claude/expat-retour.md`
- Glossaire (`app/glossaire/page.tsx`) → `docs/claude/glossaire.md`
- Content roadmap — guides (`data/guides.ts`) → `docs/claude/guides.md`
- Pending guide work → `docs/claude/guides.md`
- Politique, présidentielle 2027 et fil d'actualité (2026-10-17) → `docs/claude/politique-agenda-sport.md`
- Agenda daté par ville (`data/city-events.ts`, 2026-10-16) → `docs/claude/politique-agenda-sport.md`
- Sport : salles, street workout, CrossFit, escalade + agenda sportif (2026-10-22) → `docs/claude/politique-agenda-sport.md`
- Pour qui (`lib/profile-pages.ts`) → `docs/claude/pour-qui.md`
- Red Flag Radar (`lib/red-flag-themes.ts`) → `docs/claude/red-flags.md`
- Technical roadmap — pending → `docs/claude/roadmap.md`
- Audit-derived roadmap (2026-06-02) → `docs/claude/roadmap.md`
- Photo pipeline (Wikidata P18 → Wikimedia Commons) → `docs/claude/roadmap.md`
- Guide landmarks (`scripts/guide-pois.mjs`) → `docs/claude/roadmap.md`
- Pending work → `docs/claude/roadmap.md`
- UX polish → `docs/claude/roadmap.md`
- Product — City Match + vraie vie → `docs/claude/roadmap.md`
- Plateforme communautaire (R9) → `docs/claude/roadmap.md`
- Data-visualisation (R10) → `docs/claude/roadmap.md`
- Features IA (R11) → `docs/claude/roadmap.md`
- Tourisme & activités (R12) → `docs/claude/roadmap.md`
- Distribution & backlinks (R13) → `docs/claude/roadmap.md`
- Vacances `/vacances` — architecture (shipped, monétisation pending) → `docs/claude/roadmap.md`
- EN routes shipped (as of 2026-05-21) → `docs/claude/roadmap.md`
- EN translation roadmap — pending → `docs/claude/roadmap.md`
- Roadmap v11 — Data depth, guide series & per-city enrichissement → `docs/claude/roadmap.md`
- Doublons filtrés (déjà livré — ne pas re-créer) → `docs/claude/roadmap.md`
- Nouvelles sous-pages ville — ✅ toutes livrées → `docs/claude/roadmap.md`
- Enrichissement seed — champs à ajouter (toujours ouvert) → `docs/claude/roadmap.md`
- Bloc FAQ structuré sur CityProfile — ✅ livré → `docs/claude/roadmap.md`
- Nouvelles séries de guides per-city (FR) → `docs/claude/roadmap.md`
- Pages comparatives éditoriales → `docs/claude/roadmap.md`
- Hors périmètre (nécessitent des assets ou APIs externes) → `docs/claude/roadmap.md`
- Vague 6 (2026-07-22) — parents solo, parcs, navigation départements → `docs/claude/roadmap.md`
