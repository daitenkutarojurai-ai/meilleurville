# MeilleurVille — Project briefing

French city ranking & relocation guide site. 540 cities, 524 FR guides + 261 EN guides, 19 ranking
categories, 18 regions (13 metropolitan + 5 DROM). Copy is **French**.
(Counts derived at build — see `lib/site-stats.ts`; figures here are indicative.)

A parallel **English version** (bestcitiesinfrance.com) is being scaffolded from
the same repo / same build. See [§ Bilingual setup](#bilingual-setup-bestcitiesinfrancecom)
below. The FR domain remains unchanged.

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
  cities-seed.ts                 # 352 cities, raw seed (calibrated + normalized at module load)
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

## Score colour scale (6 tiers — applied in lib/utils.ts, CityCard, FranceHeatmap, DromStrip, CarteClient, ScoreBar, all opengraph-image.tsx)

| Range  | Colour  | Count (352 cities) | Meaning        |
|--------|---------|-------------------|----------------|
| ≥ 7.5  | Violet (`#A855F7`) | ~3 (0.9%) | Exceptionnel — très rare |
| ≥ 7.0  | Green   | ~22 (6.3%)        | Excellent      |
| ≥ 6.0  | Lime    | ~116 (33%)        | Bon            |
| ≥ 5.0  | Amber   | ~116 (33%)        | Moyen          |
| ≥ 4.0  | Orange  | ~63 (18%)         | En dessous     |
| < 4.0  | Red     | ~48 (14%)         | Mauvais        |

Distribution mean ≈ 5.42. Penalties:
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
npm run dev          # http://localhost:3000 (Turbopack)
npx tsc --noEmit     # strict TS pass (currently clean)
npm run integrity    # gardes de lib/data-integrity + contrôle des scores cités dans les guides (bruts vs rendus) hors build — 2 s. **À LANCER AVANT DE POUSSER UN BATCH DE CONTENU.**
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

**Depuis le 2026-08-10, `scripts/local-deploy-runner.sh` publie `main` chaque nuit à 04h12 UTC**
(cron de cette machine, à côté du data-runner). Il ne fait rien si `main` n'a pas bougé, refuse un
arbre sale, ne tourne pas pendant le crawl du data-runner, passe `tsc` + `npm run integrity` avant
de publier, déploie FR puis EN, vérifie que les deux domaines répondent 200 et n'enregistre le sha
publié (`~/.local/state/meilleurville/deployed-sha`) que si tout est vert — un échec est donc
réessayé la nuit suivante, pas oublié. Journal : `~/.local/state/meilleurville/deploy-runner.log`.
`--dry-run` liste les commits qui partiraient ; `--force` republie même sans changement.

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

@AGENTS.md

---

## Content roadmap — guides (`data/guides.ts`)

Current count: **759 guides** (2026-07-14). Guide spec: `slug, title, metaTitle, metaDesc, category, emoji, readMinutes, publishedAt, updatedAt, intro, sections[], relatedCities[], relatedGuides[], tags[]`. All copy in **French**, direct voice, data-led. No silent fake figures.

All planned series are complete (Climat 2040 ×15, Quitter X ×18, Comparaisons A vs B ×17, Région 2026 ×16, Télétravail 2026 ×11, Lifestyle ×14, Budget ×7, Famille ×4).

**10 choses à faire à [ville] series** — new `category: "tourisme"` (`GUIDE_CATEGORIES` entry: "À faire & voir 🎯"). Batch 1 (Paris/Lyon/Bordeaux/Toulouse/Marseille/Nice/Nantes/Rennes), Batch 2 (Strasbourg/Montpellier/Lille/Grenoble/Rouen/Dijon/Metz/Angers), Batch 3 (Reims/Aix-en-Provence/Brest/Clermont-Ferrand/Tours/Perpignan/Le Havre/Orléans), Batch 4 (Caen/Nancy/Amiens/Limoges/Besançon/Pau/Bayonne/Biarritz), Batch 5 (La Rochelle/Annecy/Chambéry/Toulon/Valence/Poitiers/Troyes/Colmar), Batch 6 (Nîmes/Avignon/Cannes/Saint-Malo/Vannes/Quimper/Dunkerque/Mulhouse), Batch 7 (Arles/Montauban/Albi/Tarbes/Niort/Angoulême/Saintes/Le Mans) shipped. Slug pattern: `10-choses-a-faire-a-[slug]-2026`. 56 guides total. Batch 8 (Lorient/Chartres/Blois/Auxerre/Belfort/Épinal/Roanne/Chalon-sur-Saône) shipped. 64 guides total. Batch 9 (Saint-Étienne/Fréjus/Arras/Lens/Calais/Boulogne-sur-Mer/Mâcon/Bourg-en-Bresse) shipped. 72 guides total. Batch 10 (Montluçon/Vichy/Clermont-l'Hérault*/Sète/Hyères/Draguignan/Laval/Cherbourg) shipped (*Clermont-l'Hérault initially skipped, ajouté en batch 11). 80 guides total. Batch 11 (Saint-Nazaire/Cholet/La-Roche-sur-Yon/Châtellerault/Cognac/Périgueux/Agen/Carcassonne/Clermont-l'Hérault) shipped. 89 guides total. Batch 12 (Aix-les-Bains/Évian-les-Bains/Manosque/Narbonne/Béziers/Castres/Millau/Rodez) shipped. 97 guides total. Batch 13 (Auch/Cahors/Mende/Privas/Aurillac/Le-Puy-en-Velay/Moulins/Bressuire) shipped. 105 guides total. Batch 14 (Bar-le-Duc/Chaumont/Guéret/Saint-Brieuc/Saint-Lô/Évreux/Beauvais/Laon) shipped. 113 guides total. Batch 15 (Charleville-Mézières/Saint-Dié-des-Vosges/Pontarlier/Saint-Omer/Châteauroux/Nevers/Vesoul/Lons-le-Saunier) shipped. 121 guides total. Batch 16 (Foix/Gap/Digne-les-Bains/Mont-de-Marsan/Tulle/Châlons-en-Champagne/Alençon/Bourges/Fontainebleau) shipped. 130 guides total. Batch 17 (Honfleur/Sarlat-la-Canéda/Ajaccio/Bastia/Cassis/Collioure/Saint-Tropez/Menton/Épernay/Provins) shipped — touristic gems. 140 guides total. Batch 18 (Lourdes/Beaune/Concarneau/Saint-Jean-de-Luz/Carnac/Gordes/Saint-Paul-de-Vence/Amboise/Saumur/Chantilly) shipped — pilgrimages, vins, mégalithes, châteaux Loire. 150 guides total. Batch 19 (Grasse/Antibes/Cagnes-sur-Mer/Saint-Raphaël/Chinon/Compiègne/Bayeux/Martigues/Calvi/Porto-Vecchio) shipped — Riviera française, Loire, Normandie, Corse. 160 guides total. Batch 20 (Arcachon/Royan/Libourne/Dinan/Pézenas/Vienne/Riom/Sisteron/Apt/Annonay/Montbéliard) shipped — Atlantique, vignobles, Provence, Auvergne, Franche-Comté. 171 guides total. Batch 21 (Aubagne/Anglet/Autun/Bagnères-de-Bigorre) shipped 2026-07-29 — pays de Pagnol, côte basque surf, Augustodunum romain, Pyrénées thermales. 173 guides total (compteur mesuré `grep 'slug: "10-choses-a-faire-a-.*-2026"'` = 173 ; le fil cumulatif ci-dessus s'écarte de 2 sans que j'aie retrouvé où — le réel prévaut). **Batch 22 (Saint-Denis de La Réunion/Saint-Paul/Saint-Pierre/Fort-de-France/Pointe-à-Pitre/Cayenne) shipped 2026-07-30 — premier batch outre-mer : la série était 100 % métropolitaine alors que 18 villes DROM sont dans le seed et qu'aucune n'avait de guide tourisme. Compteur mesuré = 179.** Villes DROM encore non couvertes, par population : Le Tampon, Mamoudzou, Saint-André, Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph, Saint-Benoît, Baie-Mahault, Le Robert, Le François. Écart FR→EN après ce batch : 10 villes (anglet, aubagne, autun, bagneres-de-bigorre + les 6 DROM) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**.

**Batch 23 — EN, rattrapage de parité, shipped 2026-08-01.** Les 10 jumelles `things-to-do-in-[slug]-2026` manquantes écrites d'un coup (Anglet, Aubagne, Autun, Bagnères-de-Bigorre + les 6 villes DROM du batch 22) dans `data/guides-en.ts`. **Compteurs mesurés : FR 179, EN 180 — écart nul, parité rétablie.** L'EN dépasse d'une unité parce que `things-to-do-in-le-puy-en-velay-2026` existe côté anglais alors que le FR utilise `10-choses-a-faire-**au**-puy-en-velay-2026` (« au Puy », pas « à Le Puy ») : ce n'est pas un trou, c'est le seul slug de la série qui ne suit pas le gabarit `-a-[slug]-`. Ne pas « corriger » le FR, et ne pas compter Le Puy comme manquant au prochain diff — le diff naïf `comm` sur les deux listes de slugs le remonte à chaque run.
Premiers guides EN sur l'outre-mer : nouveaux tags `reunion` / `martinique` / `guadeloupe` / `french guiana`, qui créent autant de pages `/tags/[slug]` côté EN. Rédigés en anglais natif depuis les faits des sources FR (pas de traduction), avec la contrainte de sécurité explicitée pour La Réunion : hors lagon et hors enclos surveillés, la baignade est interdite — un lecteur anglophone ne le devine pas.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Villes DROM encore non couvertes des deux côtés, par population : Le Tampon, Mamoudzou, Saint-André, Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph, Saint-Benoît, Baie-Mahault, Le Robert, Le François.

**Batch 24 — FR, shipped 2026-08-04 : Versailles, Saint-Denis (93), Roubaix, Tourcoing, Boulogne-Billancourt, Villeurbanne, Le Tampon.** Premier batch sur les **grandes communes non-préfectures et les banlieues**, qui étaient le vrai trou de la série : les 10 villes non couvertes les plus peuplées étaient toutes des communes d'Île-de-France, du Nord ou de la métropole de Lyon, et **Versailles — la ville la plus visitée de France après Paris — n'avait aucun guide** parce que la série avait été construite par préfectures et par jolies petites villes. Chacune de ces villes a de la matière réelle et non touristique : nécropole royale et chantier de la flèche à Saint-Denis, La Piscine et la villa Cavrois côté Roubaix, Le Fresnoy et le bunker du message Verlaine à Tourcoing, Albert-Kahn et l'île Seguin à Boulogne, les Gratte-Ciel de 1934 et le TNP à Villeurbanne, le Piton de la Fournaise depuis Le Tampon.
**Compteurs mesurés : `-a-` strict = 185, en incluant `au-` = 187 ; EN = 180.** ⚠️ Le Tampon a le **deuxième slug de la série à échapper au gabarit `-a-[slug]-`** après Le Puy : `10-choses-a-faire-**au**-tampon-2026` (« au Tampon », pas « à Le Tampon »). Le grep historique `grep -c 'slug: "10-choses-a-faire-a-.*-2026"'` **en rate désormais deux** — utiliser `grep -c 'slug: "10-choses-a-faire-a[u]*-.*-2026"'` pour le compte réel. Ne pas « corriger » ces deux slugs, et ne pas les compter comme des trous EN au prochain diff.
Écart FR→EN après ce batch : **7 villes** (versailles, saint-denis 93, roubaix, tourcoing, boulogne-billancourt, villeurbanne, le-tampon) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**. Attention au nommage anglais : `things-to-do-in-saint-denis-2026` doit viser le 93 et se distinguer de `things-to-do-in-saint-denis-reunion-2026`, qui existe déjà.

**Batch 25 — EN, rattrapage de parité, shipped 2026-08-05.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 24 écrites d'un coup dans `data/guides-en.ts`
(Versailles, Saint-Denis 93, Roubaix, Tourcoing, Boulogne-Billancourt, Villeurbanne,
Le Tampon). **Compteurs mesurés : FR 187, EN 187 — écart nul dans les deux sens, parité
rétablie** (`EN_GUIDES` 541 → 548). Le piège de nommage annoncé ci-dessus est tranché :
`things-to-do-in-saint-denis-2026` (93) et `things-to-do-in-saint-denis-reunion-2026`
coexistent, chacune résolue par `getEnGuide('things-to-do-in-' + slug + '-2026')` depuis
le slug de seed correspondant, et l'intro du guide 93 signale l'homonymie dès la première
ligne.
⚠️ **Le diff naïf remonte désormais deux faux trous, pas un.** Aux deux slugs FR hors
gabarit (`au-puy-en-velay`, `au-tampon`) répondent des slugs EN en `le-` :
`things-to-do-in-le-puy-en-velay-2026` et `things-to-do-in-le-tampon-2026`. Le contrôle
de parité doit mapper `puy-en-velay` → `le-puy-en-velay` et `tampon` → `le-tampon` avant
de comparer ; sans ça il annonce deux manques de chaque côté à chaque run. Ne pas
« corriger » ces slugs.
Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit),
`metaTitle` ≤ 60 caractères sur les 7 — plus serré que le reste de la série, qui montait
à 74 et se faisait tronquer en SERP — et `metaDesc` ≤ 160. Aucun tag nouveau : les tags
de région réutilisent `ile-de-france`, `hauts-de-france`, `auvergne-rhone-alpes`,
`reunion`. **Prochain run : batch FR** (l'écart est nul, la série FR reprend la main).
Villes DROM encore non couvertes des deux côtés, par population : Mamoudzou, Saint-André,
Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph,
Saint-Benoît, Baie-Mahault, Le Robert, Le François.

**Batch 26 — FR, shipped 2026-08-06 : Saint-Ouen-sur-Seine, Vitry-sur-Seine, Montreuil,
Argenteuil, Neuilly-sur-Seine, Pantin, Meaux.** Deuxième batch sur les communes de la
petite couronne, dans la continuité du batch 24, mais sélectionnées **par matière
touristique réelle plutôt que par population** — c'est la correction de méthode du run.
Les dix communes non couvertes les plus peuplées sont toutes des banlieues d'Île-de-France
et plusieurs n'ont honnêtement pas dix choses à faire ; à l'inverse Saint-Ouen porte le
**plus grand marché d'antiquités au monde** et n'avait aucun guide, et Meaux (une demi-heure
de la gare de l'Est) aligne cité épiscopale complète, plus grande collection européenne
sur 1914-1918 et une AOP fromagère. Les angles retenus : les Puces et l'écoquartier des
Docks à Saint-Ouen, le MAC VAL et les pochoirs de C215 à Vitry, les murs à pêches et
Méliès à Montreuil, les emplacements de Monet et la Sainte Tunique à Argenteuil, l'île de
la Grande Jatte de Seurat et l'axe historique à Neuilly, les Grands Moulins et le CND de
Kalisz à Pantin.
**Compteurs mesurés : `-a-` strict = 192, en incluant `au-` = 194 ; EN = 187 ; `GUIDES`
909 → 916.** Aucun nouveau slug hors gabarit : les deux exceptions restent `au-puy-en-velay`
et `au-tampon`.
`metaTitle` ≤ 60 caractères sur les 7 (48-55), `metaDesc` ≤ 160, densité d'accents 0,15 —
très au-dessus du seuil de détection ascii-strip (0,09). Aucun horaire, tarif ni hauteur
n'est cité : sur des équipements franciliens qui ouvrent et ferment vite, une phrase sans
chiffre a été préférée à un chiffre invérifiable. Deux points de prudence assumés dans la
copie : le marché aux puces de la porte de Montreuil est annoncé comme susceptible d'être
déplacé par le réaménagement de la porte, et le Jardin d'acclimatation, la Fondation Louis
Vuitton et Bagatelle sont présentés comme **accessibles depuis** Neuilly, pas comme situés
à Neuilly — ils relèvent de Paris 16ᵉ, et l'inverse serait faux.
⚠️ Ne pas repartir de la liste brute des communes les plus peuplées non couvertes pour le
prochain batch FR : le haut de cette liste (Nanterre, Créteil, Colombes, Aubervilliers,
Vitry déjà fait, Courbevoie, Drancy…) est majoritairement pauvre en matière touristique
vérifiable. Les gisements qui restent sont **Cergy** (Axe majeur de Dani Karavan),
**Issy-les-Moulineaux** (île Saint-Germain, tour aux figures de Dubuffet), **Aubervilliers**
(19M, Docks), **Mérignac**, **Pessac** (Cité Frugès de Le Corbusier, UNESCO) et
**Vénissieux** — puis les DROM restants.
Écart FR→EN après ce batch : **7 villes** (saint-ouen-sur-seine, vitry-sur-seine, montreuil,
argenteuil, neuilly-sur-seine, pantin, meaux) — au-dessus du seuil de ~6, donc **le prochain
run doit être un batch EN**. Attention au nommage anglais : `things-to-do-in-saint-ouen-2026`
côtoiera `things-to-do-in-saint-denis-2026` (93) et `things-to-do-in-saint-denis-reunion-2026`
déjà présents — garder le suffixe `-sur-seine` pour Saint-Ouen, Vitry et Neuilly évite toute
ambiguïté avec les homonymes français.

**Batch 27 — EN, rattrapage de parité, shipped 2026-08-08.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 26 écrites d'un coup dans `data/guides-en.ts`
(Saint-Ouen-sur-Seine, Vitry-sur-Seine, Montreuil, Argenteuil, Neuilly-sur-Seine, Pantin,
Meaux). **Compteurs mesurés : FR 194 (`-a-` strict 192 + les 2 slugs en `au-`), EN 194 —
écart nul, parité rétablie** (`EN_GUIDES` 548 → 555). Le conseil de nommage du batch 26 a été
suivi : les slugs gardent `-sur-seine` sur Saint-Ouen, Vitry et Neuilly, donc aucune collision
avec `things-to-do-in-saint-denis-2026` (93) ni `things-to-do-in-saint-denis-reunion-2026`.
Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit),
`metaTitle` 39-51 caractères, `metaDesc` 138-154, 8 sections par guide (la série FR en compte
10, la version EN fusionne les fins de liste — marchés + accès — comme les batches EN
précédents). Deux prudences reprises telles quelles du FR, à ne pas diluer : le marché aux
puces de la porte de Montreuil est annoncé comme susceptible d'être déplacé par le
réaménagement de la porte, et le Jardin d'acclimatation, la Fondation Louis Vuitton et
Bagatelle sont **accessibles depuis** Neuilly sans y être situés. Trois ajouts propres à
l'angle voyageur étranger, absents du FR parce qu'inutiles à un lecteur français : la version
originale sous-titrée du Méliès, la règle d'import du lait cru pour le brie de Meaux, et le
rappel que les Puces ferment le mardi placé dès le premier paragraphe de section.
Aucun tag nouveau : les 7 réutilisent `ile-de-france`. `npm run search-index` relancé
(`data/search-index.en.json` 555 guides) — sans ça `search-index:check` échoue.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Reprendre la liste
de gisements du batch 26 (Cergy, Issy-les-Moulineaux, Aubervilliers, Mérignac, Pessac,
Vénissieux) plutôt que la liste brute des communes les plus peuplées. Villes DROM encore non
couvertes des deux côtés, par population : Mamoudzou, Saint-André, Les Abymes, Saint-Louis
(974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph, Saint-Benoît, Baie-Mahault,
Le Robert, Le François.

### Glossaire (`app/glossaire/page.tsx`)

Page unique, données inline (`SECTIONS: {title, emoji, terms[]}`), `DefinedTermSet` JSON-LD généré
depuis le tableau — ajouter un terme suffit, rien d'autre à câbler. **Compteur mesuré
(`grep -c 'term: "'`) : 127 termes, 13 sections** (2026-08-10). Dernière section ajoutée :
« Assurance habitation et catastrophes naturelles » 🌊 — 12 termes (MRH et qui doit s'assurer,
garantie cat-nat, arrêté de catastrophe naturelle, franchise légale, surprime, CCR, RGA, fonds
Barnier, taxe GEMAPI, recul du trait de côte, BCT, valeur à neuf). Elle honore exactement le
cadrage laissé en 2026-08-03 ci-dessous : **côté assurance et indemnisation uniquement**, parce
qu'ERP/ERRIAL et PPRI/PPRT sont déjà traités sous « Diagnostics ». Le site portait
`/villes/[slug]/risques`, `/red-flags/villes-risques-naturels`, `villes-erosion-cotiere` et
`villes-sans-eau-ete` sans jamais expliquer ce qui est payé, par qui et sous quelle condition.
Trois points de méthode à ne pas diluer : ① la garantie cat-nat **ne couvre ni la tempête, ni la
grêle, ni le poids de la neige** (garantie distincte du contrat) et **ne couvre pas le recul du
trait de côte**, phénomène lent donc hors du champ « intensité anormale » — c'est l'erreur la plus
répandue, et les deux entrées concernées le disent explicitement ; ② les seuls chiffres cités sont réglementaires et
nationaux (franchise 380 € / 1 520 € sécheresse, surprime 20 % et 9 % au 1ᵉʳ janvier 2025, plafond
GEMAPI 40 €/hab./an, subvention Barnier jusqu'à 80 %) — aucun tarif d'assureur, aucune moyenne de
prime, qui ne seraient pas sourçables ; ③ ce qui relève du contrat et non de la loi (valeur à neuf,
plafonds) est écrit comme tel, avec « le plus souvent » et « délai contractuel ». Avant-dernière section :
« École, garde d'enfants et scolarité » 🎒 — 15 termes (carte scolaire, dérogation, certificat de
radiation, instruction obligatoire, REP/REP+, IPS, Affelnet, Parcoursup, privé sous contrat,
périscolaire, quotient familial CAF, modes de garde, CMG, PAI/PAP/PPS, transport scolaire) : c'était
le trou de la page, qui ne couvrait que l'immobilier et l'argent alors que le site porte
`/villes/[slug]/ecoles` et la série `famille-a-[ville]`. Deux pièges vérifiés au passage : le
**quotient familial** existait déjà au sens fiscal, l'entrée CAF le nomme explicitement pour ne pas
créer un doublon silencieux ; **ERP/ERRIAL** et **PPRI/PPRT** sont déjà traités sous « Diagnostics »,
donc une future section risques naturels doit se limiter à l'assurance (cat-nat, franchise, RGA,
fonds Barnier) sous peine de recouvrement. Aucun chiffre de loyer, prix ou score n'est cité ici :
les montants réglementaires seulement, et rien qui ne soit sourçable.

### Expat retour (`lib/expat-return.ts`)

Une fiche par pays de départ, données inline (`EXPAT_COUNTRIES`), rendues par
`app/expat-retour/[pays]/page.tsx` (URL `/expat-retour/depuis-<slug>`). Ajouter une entrée au
tableau suffit : `generateStaticParams`, le hub et le sitemap en dérivent tous les trois.
**Compteur mesuré (`grep -c '^    slug: "'`) : 19 pays** (2026-08-05). Dernier ajouté : **Suède** —
premier pays nordique de la liste, et le seul dossier du site où **le retour est fiscalement
neutre** (kommunalskatt à taux plat ~29-35 % + 20 % d'État au-delà d'environ 600-625 k SEK, à peu
près la fourchette effective française). Le choc est ailleurs, et dans les deux sens : gain sur le
locatif (la file d'attente municipale de première main dépasse 9-11 ans à Stockholm centre, donc
tout arrivant passe par la sous-location andrahand), perte sèche sur la petite enfance (480 jours de
congé parental dont 390 à ~80 %, maxtaxa ~1 700 SEK/mois, déjeuner scolaire gratuit → crèche FR
150-400 €/mois et PreParE ~450 €/mois), et angle mort patrimonial (la Suède n'a plus d'ISF depuis
2007 ni de droits de succession depuis 2004-2005 : le retour réactive IFI et barème successoral).
Deux pièges spécifiques portés par les avertissements et à ne pas diluer : la règle de
**väsentlig anknytning** (présomption de résidence fiscale suédoise pendant 5 ans si un lien
essentiel subsiste — la *sommarstuga* en est un, charge de la preuve inversée) et le fait que
l'enveloppe **ISK** n'a pas d'équivalent français et n'est pas reconnue (retour au PFU 30 % +
formulaire 3916). Les loyers et prix français cités viennent de `data/housing.ts` (T3 : Grenoble
1 020 € … Lyon 1 380 €, Paris 2 800 €), les 10 `bestSuitedCities` sont vérifiées dans `CITIES_SEED`.
⚠️ La liste du sitemap **était codée en dur et avait dérivé** : Côte d'Ivoire et Japon avaient une
page mais aucune URL déclarée. Elle est désormais dérivée de `EXPAT_COUNTRIES` (même correctif que
`PROFILE_SLUGS` en F61) — ne pas la re-figer.

### Pour qui (`lib/profile-pages.ts`)

Un profil = une entrée de `PROFILE_PAGES` (slug, emoji, label, meta, intro, `weights`,
`reasonHint`). Ajouter l'entrée suffit : `/pour-qui`, `/pour-qui/[profil]`, le sitemap et le bloc
« parfait pour » de `lib/honest-reviews.ts` en dérivent tous les quatre. **Compteur mesuré
(`grep -c '^    slug: "'`) : 33 profils** (2026-08-07). Dernier ajouté : **`navetteurs-hybrides`**
(actifs en hybride, 2-3 jours au bureau) — le seul profil du site où la *distance* à un bassin
d'emploi est le critère cardinal, là où « télétravailleurs salariés » l'ignore complètement (quand
on ne revient jamais, l'éloignement ne coûte rien) et où « sans voiture » et « cyclistes urbains »
mesurent la mobilité *à l'intérieur* d'une ville.
Nouveau composite `metroAccess` / `metroAccessCommute()` : trajet estimé vers le plus proche des
douze grands pôles d'emploi, barème 30 min = 10 → 150 min = 0. ⚠️ Trois écarts **volontaires** avec
`lib/city-commute`, qui surestime et qu'il ne faut pas « réaligner » :
① la branche rail directe n'est ouverte qu'aux villes ayant leur propre gare dans `TGV_STATIONS`
(sinon le modèle invente une ligne fermée : Saint-Girons sortait à 40 min de Toulouse) ;
② elle tourne à 140 km/h et non 220, la vitesse d'une LGV (Annecy sortait à 43 min de Grenoble, où
le train met près de 2 h) ; ③ la branche routière porte un plancher de 15 min d'approche urbaine
(sans lui : « Lyon en 2 min » depuis Villeurbanne). Corse et DROM valent **0** sur cet axe, et c'est
une mesure, pas une donnée manquante : il n'existe pas de navette hebdomadaire vers un pôle
métropolitain. En relief (Vosges, Cévennes, Alpes) le facteur de détour routier sous-estime encore
le trajet réel — l'intro le dit.
⚠️ `lib/profile-pages.ts` est importé **en valeur** par `app/people-like-you/PeopleLikeYouClient.tsx`
(client) : n'y importer aucune valeur de `CITIES_SEED`. C'est pour ça que les coordonnées des douze
pôles sont en dur et que le modèle de trajet est réimplémenté au lieu d'importer `lib/city-commute`,
qui charge le seed à l'initialisation.

### Pending guide work
- **Editorial rewrite (R7.8) — DONE.** Main pass ran 2026-05-30 (all guides → prose voice). Fragment-tail cleanup ran 2026-06-03: the 23 budget/acheter/investment guides the first pass missed (numbered `(N) **Label** : value` scaffolding, detected via `boldColon>=40`) rewritten into flowing prose, 228 strings, figure-integrity verified. Method: extract verbatim bodies → parallel read-only agents → single-writer exact-match apply (see `[[parallel-agents-single-file]]`). Only `intro`/`sections[].body` touched.
  - *Accent restoration — DONE 2026-06-03.* 58 tourism guides (`10-choses-a-faire-*`, incl. Paris/Bordeaux) had been saved ascii-stripped (`decoupe`, `a 57 m`, `28,30 EUR`, `m2`, `360 deg`); diacritics + `€/°/m²/m³` restored across 638 strings, word-skeleton integrity verified. Detected by accent-density < 0.09 (the earlier "~33" estimate undercounted). Legit currency-code `EUR` (EUR/USD context) left intact.

Vivre sans voiture +5, Acheter à [ville] +5, and the "Lire ensuite" reading list (via `lib/guide-suggestions.ts` + auto-block on each guide page) are shipped.

---

## Technical roadmap — pending

Hosting is **Cloudflare** (Workers + `wrangler.toml`), not Vercel.

- [x] **`NEXT_PUBLIC_BASE_URL`** — set in `wrangler.toml [vars]` (`https://www.mavilleideale.fr`); EN export sets `NEXT_PUBLIC_DEFAULT_LOCALE=en`.
- [x] **Host disclosure** — `mentions-légales` / `legal-notice` / privacy pages corrected Vercel → Cloudflare (Cloudflare, Inc.); dates bumped 31 mai 2026.
- [ ] **`app/cgu`** date: bump "Dernière mise à jour" after legal review (currently 25 mai 2026). `confidentialite` already current (Cloudflare + D1 disclosure).

### Audit-derived roadmap (2026-06-02)

- [x] **Region & Department score pages** (§7) — DONE 2026-06-03 (most parts already existed). Aggregate score = mean of region/dept cities' global score: `app/regions/[region]/page.tsx` (`avgScore`/`avgCriteria` + JSON-LD) and `app/departements/[dept]/page.tsx` both already displayed it. City-listing region+dept filters already present in `components/VillesSearch.tsx`. The one missing piece — a **region heatmap layer on `/carte`** — shipped this session: `CarteClient` now has a Villes/Régions toggle drawing one bubble per metropolitan region at its centroid, coloured by avg score (honours active axis + lean filter), linking to `/regions/[slug]`. **EN parity shipped 2026-06-03:** `FranceHeatmap` gained an opt-in `showRegionToggle` prop (default off → homepages/timelapse byte-identical) and the EN `/map` (`app/[locale]/map`) now passes it, mirroring FR `/carte`. *Remaining follow-up: department-granularity heatmap (96 depts — would need clustering to avoid clutter).*
- [x] **Guide hero images** (§4a — deferred 2026-06-02, **DONE 2026-07-13** via the photo pipeline below) — city-specific guides (`10-choses-a-faire-a-X`, `acheter-a-X`, `things-to-do-in-X`…) now render the city's Commons photo as a hero band. A guide only gets one when the city slug appears in the *guide slug* (`guideCityPhoto`) — a ranking guide listing 12 cities is about none of them, and illustrating it with the first would be a lie. Ranking/thematic guides stay text-only by design.

### Photo pipeline (Wikidata P18 → Wikimedia Commons)

`scripts/commune-images.mjs` — crawls **all 34 969 communes** (geo.api.gouv.fr) →
Wikidata QID + main image (P18, anchored on `P374` = INSEE code, one SPARQL query
per département) → Commons `imageinfo` (author, licence, Commons page, 1600px
source). Every stage is **resumable and cached** in `.cache/commune-images/`
(gitignored, rebuildable); rate-limited to ~1 req/s with `Retry-After`-aware
backoff and a contactable User-Agent, as Wikimedia requires.

```bash
npm run photos          # full chain (communes → wikidata → commons → manifest → assets)
npm run photos:update   # re-query Wikidata; only new communes / changed P18 are refetched
node scripts/commune-images.mjs assets --limit=50   # batch control
```

- **No hotlinking.** Photos are downloaded and re-encoded to webp by sharp at
  1024px (hero) + 480px (card), written to `public/photos/villes/` with a
  **content hash** in the filename → `_headers` caches them `immutable`, and an
  upstream photo change ships under a new URL. Stale files are pruned on rerun.
- **Data**: `data/city-images.json` (rich record, server-side, via
  `lib/city-images.ts`) + `data/city-cards.json` (lean: hash/colour/author/
  licence, via `lib/city-cards.ts`) — the lean one exists because `CityCard`
  renders inside client components, and the full record would ride into the
  client bundle for nothing.
- **Attribution is a licence condition, not decoration.** Most files are CC BY-SA:
  `components/CityPhoto.tsx` renders the credit (author · licence · Commons link)
  with the pixels, and non-free licences are filtered out at crawl time
  (`LICENSE_OK`). Cards show unlinked credit text — the tile is already an `<a>`,
  and nesting anchors is invalid HTML.
- **SEO**: city + guide sitemap entries declare their photo (`images:` →
  `<image:image>`), and city JSON-LD carries an `ImageObject` with
  `license` + `acquireLicensePage` + `creditText` (Google Images "Licensable").
- Surfaces: city hero (FR + EN), `CityCard` cover everywhere, and the
  `quartiers` / `climat` / `a-faire` sub-pages (+ EN `neighbourhoods` /
  `climate` / `things-to-do`), plus city-specific guide heroes.
- The crawl covers all 34 969 communes even though only the 540 seed cities get a
  built asset — the manifest is already there the day the seed grows.

### Guide landmarks (`scripts/guide-pois.mjs`)

Illustrates the FR `10-choses-a-faire-a-*` series: Wikidata landmarks located in
the commune (heritage-listed via P1435, or typed as a visitable place — the class
gate is client-side, since P31/P279* in SPARQL blows the 60s WDQS budget) →
matched against each section heading → Commons photo + Google Maps + Wikipedia.
Data in `data/guide-pois.json`, assets under `public/photos/poi/`.

**The matcher is strict on purpose: 246/1690 sections match.** Most headings are
activities ("prendre le petit-déjeuner dans un bouchon"), not places. Every time
the rules were loosened the result was a *wrong* photo: a hotel on "Monter à
Fourvière", a railway station then a théâtre on "le marché de la Croix-Rousse", a
fountain on "Grimper à Montmartre". A section with no landmark stays text-only —
that is the correct outcome. **EN is excluded**: `things-to-do-in-*` headings are
thematic ("Croix-Rousse and the Presqu'île") and name no single place.

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
- **No framer-motion.** It was pulled in by `ScrollReveal` alone (~110 kB) and has
  been rebuilt on IntersectionObserver + a CSS transition. Don't reintroduce it
  for an effect the compositor can run. Note `ScrollReveal` renders its children
  at `opacity: 0`; the `@media (scripting: none)` rule in `globals.css` is what
  keeps them visible without JS.
- **Known remaining lever:** city pages still ship ~1 MB of JS because
  `CityProfile` is one client component importing ~30 sub-components, most of
  which render static text. Decoupling it (client only for tabs + action buttons)
  is the next real win, and is a refactor of its own.

---

## Pending work

### UX polish
- **R7.10** — Em-dash purge across body copy + meta descriptions. Cap at ~1 per 200 words, never two per sentence. Manually review per-file, don't blanket sed. **Status: at target.** `data/guides.ts` purged 4017→2977 (combined with R7.8's 6750→4017, a 56% drop from origin); now ≈1 em-dash per 200 words — the residual 2977 are overwhelmingly structural separators (`metaTitle` 621, `title` 215, `"N. Label —"` ranking-list separators ~1062) which are intentionally kept. `data/guides-en.ts` (921 / 240,966 words) was already under target, untouched. Purge done via parallel range-agents + word-skeleton integrity guard (verified byte-identical word sequence vs pre-pass snapshot, zero words altered).

R7.2 (méthodologie section already absent), R7.9 (string + soft-fallback shipped in `components/HonestReviewCard.tsx`), R7.11 (`components/DiscussionCTA.tsx` on all 26 sub-pages), R7.12 (emoji icons present on every "Aller plus loin" card) are shipped.

### Product — City Match + vraie vie
- **R8.2 Vraie vie** — Indicateurs manquants: qualité internet (`/villes/[slug]/connexion-internet` shipped), mentalité locale (`/villes/[slug]/mentalite-locale` shipped), tension locative (`/villes/[slug]/tension-locative` shipped), minutes domicile-travail (section "Trajet domicile-travail estimé" sur `/villes/[slug]/transports` shipped). **R8.2 complet.**
- **R8.3 Verticale S'installer** — `/villes/[slug]/s-installer` shipped, `/villes/[slug]/agenda` shipped, portraits-types fictivement étiquetés ("Personnages fictifs · Illustratif uniquement" + disclaimer en bas de page). **R8.3 complet.**

R8.1 City Match (`/city-match` + `lib/city-match.ts`) shipped.

### Plateforme communautaire (R9)
R9.1 (`/auth` + `/connexion`, Supabase), R9.2 (`/favoris` + `/dashboard`), R9.3 (alertes: `lib/alertes-store.ts` + `POST /api/alertes/subscribe` + cron Mon 08:00 UTC + `components/AlerteForm.tsx` in CityProfile), R9.4 (`/villes/[slug]/questions` + EN `/cities/[slug]/questions`), R9.5 (`/projection-5ans`) shipped.

### Data-visualisation (R10)
- **R10.1** — 2D/3D toggle sur `/carte` via CSS perspective + SVG ColumnLayer. Toggle ◉ 2D / ▲ 3D. Hauteur = score, couleur = score. DROM strip séparé (DromStrip component). Filtres par axe déjà présents. **Shipped** (CSS perspective, no new deps). Note: deck.gl proper avec tuiles carte de fond reste une upgrade future.

R10.2 (`/villes/[slug]/empreinte` + `lib/city-fingerprint.ts` + `components/CityFingerprint.tsx`), R10.3 (`/climat-2040-timelapse`) shipped.

### Features IA (R11)
- **R11.3 "Where people like YOU moved"** — Phase A: `/portraits-types` (FR) + `/community-profiles` (EN), 6 fictional labeled archetypes with real niche scores. Phase B (shipped): estimation model `lib/people-like-you.ts` (`migrationFor(origin, profile)` → upgrades/laterals by persona score over 17 `lib/profile-pages.ts` profiles). Surfaces: interactive `/people-like-you` (FR) + `/[locale]/people-like-you` (EN), and SSG per-origin landing pages `/ou-vont-les-gens/[ville]` (24 biggest departure cities, no-JS/indexable, same engine). Clearly labelled "modèle estimatif, pas de suivi"; swaps to real anonymized account flows once volume allows. (Distinct from `/depuis/[slug]` = weekend travel, and `/expat-retour`.)
- **R11.5 Street Reality Score** — _removed from roadmap (2026-05-31)._

R11.1 (`/future-you` + `lib/future-you.ts`), R11.2 (`/vibe` + `lib/vibe.ts`), R11.6 (`components/VsBattle.tsx`), R11.7 (`/copilot`) shipped.

### Tourisme & activités (R12)
- **R12.1** — `/villes/[slug]/a-faire` shipped: SSG activity sub-page for all 540 cities. Surfaces activity categories from seed data (nature/culture/transport scores + characterTags), links to the `10-choses-a-faire-a-[slug]-2026` guide when available (24 cities). Card added to CityProfile strip. Sitemap entry added.

### Distribution & backlinks (R13)
- **R13.1 Badge embarcable "1ère/2e/Nème ville de France"** — ✅ shipped 2026-07-10 (`/badge` hub + `/badge/[slug]` × 540 SSG, `lib/city-badge.ts` + `components/BadgeEmbed.tsx`). Three formats (compact 280×80, wide 460×120, square 200×200) — self-contained SVG strings (no external font, no fetch), one-click copy for both the full embed `<a>` snippet and the raw SVG. National rank computed once from the seed global score (cached module-level). Card added to the FR CityProfile sub-page grid; `/badge` chunk added to `SITEMAP_CHUNKS_FR` at the tail (order-stable, existing chunk URLs unchanged; `SITEMAP_CHUNK_COUNT` auto-picks it up so `robots.txt` advertises the new chunk). EN mirror deferred — the backlink pitch is a FR-side motion (mairies, offices de tourisme, agences locales), doesn't translate cleanly to `bestcitiesinfrance.com`'s expat audience.
  - **La motion elle-même tourne** : `npx tsx scripts/outreach-mairies.ts` (dry-run par défaut, `--send` pour tirer), registre des communes déjà contactées dans `scripts/outreach-contacted.json`, journal complet dans **`docs/outreach-log.md`**. Deux règles à ne pas contourner : les adresses se résolvent **par code Insee** via l'annuaire officiel de l'État (chercher par nom renvoie des homonymes ; les annuaires tiers ont produit les 4 seuls bounces de la campagne), et tous les chiffres d'un envoi sont **calculés depuis le seed**, jamais saisis à la main. État au 2026-07-29 : 137 envois, 1 réponse presse (NRCO).
- **R13.2 Palmarès mensuel** — ✅ first edition shipped 2026-07-14 as guide `palmares-juillet-2026-rapport-qualite-vie-loyer` (score global ÷ loyer T2, 540 villes, filtre pop ≥ 20k — ranking computed from seed + housing, no invented figures; méthodo affichée dans le guide). **Cadence: one edition per month, published as a guide** (`palmares-[mois]-2026-…`, category `budget`). Second edition shipped 2026-07-28: `palmares-aout-2026-rapport-qualite-vie-prix-achat` (score global ÷ prix d'achat au m², 363 communes éligibles = pop ≥ 20k avec référence de prix). Third edition shipped 2026-08-02: `palmares-septembre-2026-ecoles-cout-du-logement` (**axe `schools` ÷ loyer T3**, 363 communes éligibles = pop ≥ 20k ; les 540 villes du seed ont toutes une référence de loyer, donc le seul filtre est la population). Le thème annoncé en août a été honoré tel quel. Le T3 remplace le T2 de juillet parce qu'une famille avec enfants ne vit pas dans un deux-pièces, et ça change le classement. Ratio publié en **euros de loyer par point de score écoles** (médiane 184 €, Alençon 94 €, Aubervilliers 550 €) : plus lisible que le quotient brut. ⚠️ Le bas du classement est à 26/30 francilien (une seule ville d'Île-de-France dans les 100 premières sur 115 éligibles, Fontainebleau 93e) — la section correspondante dit explicitement que l'axe mesure l'offre communale, pas le destin des élèves, et ne juge ni eux ni leurs enseignants ; garder ce cadrage si l'édition est reprise. Announced next theme (**octobre 2026**): **taux d'effort logement réel** = loyer rapporté au **niveau de vie médian Insee Filosofi publié à la commune** (`data/city-income.json` via `lib/city-income.ts`, 533/540 villes) — honour it or update the September guide's last section if the theme changes. Method: compile `data/cities-seed.ts` + `data/housing.ts` with a scratch `tsc -p` (commonjs + `@/` resolve hook) and rank from the real pipeline score, never from a regex read of the seed.

### Vacances `/vacances` — architecture (shipped, monétisation pending)
Engines: `lib/vacation-seasons.ts` (climat 12 mois ×352), `lib/vacation-activities.ts` (10 activités), `lib/vacation-fit.ts` (score composite + helpers). 387 routes SSG.
Activation monétisation: créer compte Booking Partners → `NEXT_PUBLIC_BOOKING_AID=XXXXXXX` sur Vercel.
Phase 1.5 shipped: `lib/climate-normals.ts` + `data/climate-normals-raw.json` (29 MF stations, nearest-station snap, fallback sinusoïdale). SVG chart sur `/villes/[slug]/climat` (FR) et `/cities/[slug]/climate` (EN) via `components/ClimateChart.tsx`. Phase 3 shipped: quiz `/vacances/quiz` + email capture (Brevo list 4, `/api/vacances/newsletter`).

---

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
- **Stay SSG.** EN pages use the same `generateStaticParams` pattern (352 cities at build).
- **Cross-domain canonical.** FR canonical → `mavilleideale.fr/...`,
  EN canonical → `bestcitiesinfrance.com/...`. `hreflang` cross-links the two.
- **Adding EN content for a 11th city.** Add `descriptionEn`, `seoTitleEn`,
  `seoDescriptionEn` to the seed record. No other change required.

### EN routes shipped (as of 2026-05-21)

FR-equivalent routes covered: home, cities index + 352 city pages, 4 city sub-pages (climate/transport/schools/cost-of-living), 17 total city sub-pages, rankings index + 19 detail pages, 18 regions, all departments, quiz, compare + ~300 pairs, compare-regions (78 pairs), guides index + 6 native EN guides, map, leaderboard, about, contact, faq, methodology, legal, privacy.

### EN translation roadmap — pending

**Phase 1 — content depth**
- [x] `descriptionEn` / `seoTitleEn` / `seoDescriptionEn` — all 541 cities populated (verified 2026-05-26)
- [ ] Keep `REGION_EN_DESCRIPTIONS` and `RANKING_EN` in sync with FR changes — *couverture vérifiée 2026-07-28 : 18/18 régions, 19/19 classements, zéro clé orpheline de part et d'autre.* Item permanent (il se rouvre dès qu'une région ou un classement est ajouté côté FR), pas une tâche en attente.

**Phase 2 — missing routes**
- [x] Triplet comparisons `/compare/[a]-vs-[b]-vs-[c]` (shipped via `lib/comparer-triplets.ts` + `app/[locale]/compare/[pair]/page.tsx`)
- [x] `/cities/[slug]/things-to-do` (EN port of FR `a-faire`, ×540 SSG, 2026-06-01) — EN city sub-pages now fully mirror FR
- [x] `/sport` + `/sport/[macroregion]` ×6 (EN national sport ranking, 2026-06-01) — mirrors the `cycling` hub, reuses `lib/sport-leisure`
- [x] `/rental-tension` + `/rental-tension/[macroregion]` ×6 (EN, 2026-06-01) — port of FR `/tension-locative`, reuses `lib/rental-tension`, links to `/cities/[slug]/rental-market`
- [x] `/political-leaning` (EN, 2026-06-01) — port of FR `/orientation-politique`, reuses `lib/political-lean` (`BLOC_LABEL.en`)
- [x] `/weekend-getaways` + `/weekend-getaways/[slug]` ×26 (EN, 2026-06-01) — port of FR `/depuis`, reuses `lib/city-commute`; Paris card → `/from-paris`
- [x] `/tags` + `/tags/[slug]` (EN, 2026-06-01) — port of FR `/tags` via new `lib/guide-tags-en.ts` (reads `EN_GUIDES`; FR `lib/guide-tags` untouched)
- _Note: FR `/palmares` + `/synthese` are already covered by EN `/overall-ranking` (same `lib/city-synthesis`); FR `/vivre-avec` by EN `/living-on`. EN top-level parity with FR is now effectively complete._

**Phase 3 — secondary surfaces** (all shipped)
- [x] `/red-flags` + `/red-flags/themes` (EN)
- [x] `/vacations` (EN port)
- [x] `/quiz/compatibility` (EN port)
- [x] `/calculator/real-cost`, `/household-cost`, `/simulator/purchase`
- [x] City sub-pages: `neighbourhoods`, `seasons`, `honest-review`, `climate-2040`, plus `fingerprint`, `vibe`, `get-settled`, `overview`, `synthesis`, `profiles`

**Phase 4 — long tail**
- [ ] EN guides — in progress (531 native EN guides via `data/guides-en.ts`; FR has 669; not 1:1 translations, native expat-angle content). **2026-06-03 per-city / per-region batches** (all grounded in the matching FR guide's real figures + `housing.ts`, auto-registered via `EN_GUIDES`):
  - **+10 cost-of-living** `cost-of-living-[city]-2026` (Paris/Lyon/Bordeaux/Toulouse/Montpellier/Nice/Nantes/Rennes/Strasbourg/Lille) — from FR `budget-mensuel-realiste`; filled the EN budget gap (was 16 vs FR 134).
  - **+15 where-to-buy** `where-to-buy-in-[city]-2026` (Paris/Lyon/Marseille/Toulouse/Lille/Bordeaux/Nantes/Strasbourg/Rennes/Montpellier/Nice/Grenoble/Annecy/Aix-en-Provence/Biarritz) — from FR `acheter-a-[ville]-quel-quartier-budget`; per-neighbourhood €/m² + foreign-buyer process.
  - **+13 car-free living** `car-free-living-in-[city]-2026` (Paris/Lyon/Strasbourg/Bordeaux/Nantes/Toulouse/Grenoble/Rennes/Montpellier/Nice/Lille/Annecy/Dijon) — from FR `vivre-sans-voiture`; category `lifestyle`.
  - **+12 living in [region]** `living-in-[region]-2026` (the Dordogne, French Basque Country, French Riviera, the Var, Alsace, Brittany, Normandy, Charente-Maritime, Haute-Savoie, Occitanie, Roussillon, Hauts-de-France) — region-level overviews from FR `vivre-en-[region]`; category `moving`. (`leaving-[city]` is already well-covered in EN, so `quitter` was skipped.)
  - **Discoverability (2026-06-04):** the new guides (and all 482) were only reachable via /guides index, search, tags. Fixed the orphan gap: `CityGuidesList` made locale-aware (`locale="en"` reads `EN_GUIDES` + EN copy; FR output byte-identical) and wired into `app/[locale]/cities/[slug]`; EN region pages (`app/[locale]/regions/[region]`) gained a "Guides about [region]" reverse-lookup block. Every EN city/region page now links up to 12 native guides (newest first). FR pages untouched/unchanged.
  - **2026-06-04 — FR parity reached on two series + all admin regions covered (EN 482→526):** **+34 where-to-buy** `where-to-buy-in-[city]-2026` (all remaining FR `acheter-a-[ville]` cities — Amiens/Angers/Arles/Avignon/Bayonne/Besançon/Brest/Caen/Chambéry/Chartres/Clermont-Ferrand/Colmar/Dijon/La Rochelle/Le Havre/Le Mans/Limoges/Lorient/Metz/Mulhouse/Nancy/Nîmes/Orléans/Pau/Perpignan/Poitiers/Reims/Rouen/Saint-Étienne/Toulon/Tours/Troyes/Valence/Vannes) → **where-to-buy now 49/49 vs FR**; **+2 car-free** (Clermont-Ferrand, Marseille) → **car-free now 15/15 vs FR**; **+8 living-in [region]** (Île-de-France, Auvergne-Rhône-Alpes, Nouvelle-Aquitaine, Provence-Alpes-Côte d'Azur, Grand Est, Pays de la Loire, Bourgogne-Franche-Comté, Centre-Val de Loire) → **all 13 metropolitan admin regions now have a top-level EN overview** (the other 5 already shipped). Region guides set `relatedCities` to real region city slugs so they surface on EN region pages (reverse lookup = relatedCities ∩ region-cities, not tags). Method note: re-serialize agent objects through a canonical serializer before splice (2 agents had drifted to 2-space indent / dropped opening `{` — `new Function('['+frag+']')` parse → field-ordered emit → tsc-gated).
  - **2026-06-04 (b) — +10 `best-french-cities-[theme]` ranking guides (EN 526→536):** ports high-intent `meilleures-villes` themes that had no EN equivalent, for the relocation audience: international-schools (`family`), healthcare, lgbt-friendly, wine-lovers, property-investment (`budget`), surf-watersports, vegan-vegetarian, culture-festivals, wellness-spas, clean-air (all `lifestyle` unless noted). Native EN ranking guides grounded in each FR source's real city ranking + data (CHU counts, GP density, rental yields, €/m², ATMO air indices, thermal towns, festivals, school names). `relatedCities` = top-ranked real slugs → surface on those cities'/regions' EN pages. Deliberately NON-overlapping with the existing EN best-cities cluster (foodies/families/students/seniors/remote/cycling/outdoor/mountain/coastal). Still uncovered in EN best-cities (after the (c) batch): freelancer-ecosystem (overlaps remote/nomad), music-scene (overlaps culture-festivals), naturalist-biodiversity, covered-markets, single-parent/blended families, kids-sport, stable-industrial-jobs — all lower expat intent.
  - **2026-06-04 (c) — +5 medium-intent best-cities (EN 536→541):** affordable-property (`budget`, first-time/budget buyers), entrepreneurs-startups (`remote-work`, French Tech), accessibility (`lifestyle`, disabled/reduced-mobility), sustainability (`lifestyle`, greenest/zero-waste), international-students (`lifestyle`, angled at foreign students — distinct from the existing general best-cities-for-students). Same grounding/validation method.
  - **2026-06-04 (d) — +5 micro-region living-in (EN 541→546):** Ariège, Creuse, Berry, Poitou, Ardennes-Meuse (rural sub-regions, unique long-tail, honest cheap-rural-France framing). `living-in` series now covers all 13 admin regions + the major sub-regions; only Périgord/Bretagne-intérieure/Auvergne-profonde left, and those overlap existing EN (the-dordogne / brittany / auvergne-rhone-alpes) so skipped.
  - Method for all: extract FR figures → parallel read-only agents → validate (schema/€-glyph/figure presence/slug-uniqueness) → single-writer insert (parse-validate + canonical re-serialize before splice). The `assertUniqueSlugs` guard blocks any accidental dup at build.
  - **EN guide coverage is now effectively complete for the well-grounded, distinct topics.** Series at FR parity / full coverage: where-to-buy (49/49), car-free (15/15), cost-of-living, things-to-do (170), living-in (13 admin regions + sub-regions), best-french-cities (≈33 themes). The practical "how to move to France" cluster was already comprehensively covered — and had **content-cannibalisation** (near-identical pages competing for one query, same root cause as the earlier dup-*slug* bug but with distinct slugs). **De-duped 2026-06-04 (EN 546→537):** removed 9 near-identical guides keeping the richest + any distinct angle per cluster — healthcare 7→2 (kept `france-healthcare-guide-expats` + `navigating-cpam-doctolib`), banking 3→2, driving-licence 2→1 (broad `driving-in-france` kept separately), income-tax 2→1 (property-tax kept separately), social-security 2→1. Each removed slug 301s to its canonical in `public/_redirects`. NO dangling refs (EN guides cross-link dynamically via `suggestNextEnGuides`, not hardcoded slugs). **Batch 2 (same day, EN 537→532):** the same pattern existed in the best-cities/moving series — removed 5 more: families 2→1, remote-work/digital-nomad 6→3 (kept the `france-for-remote-workers-complete-guide` pillar + `best-french-cities-remote-workers` ranking + `france-for-digital-nomads`), pets 2→1; all 301'd. **Batch 3 (corpus-wide similarity scan):** ran an automated overlap scan across all EN guides (title+headings token overlap, excluding within-series pairs which legitimately share a template). It surfaced one more true cross-cluster dup — two national "complete guide to buying property in France" guides — removed `french-property-purchase-guide-for-expats` (kept the richer `buying-property-in-france-expat-guide`), 301'd. The scan confirmed everything else flagged was **series structure, not duplication** (per-city `where-to-buy`/`living-in`/`things-to-do`, `leaving-[city]`, `[city]-vs-[city]`, `[city]-living-guide` all share templates by design but cover distinct entities). **Net EN 546→531 across the three dedup batches; corpus now clean of clear near-duplicates.**
- **FR dedup (2026-06-04, `data/guides.ts` 669→657):** the FR primary site had the same problem in a different shape — 12 guides existed as both a stale `…-2025` and a current `…-2026` (6 `vivre-en-` regions, 4 `meilleures-villes-` themes, `teletravailler-depuis-alsace`, `metz-vs-nancy-comparatif`). Removed the 2025 versions, kept 2026, 301'd each in `public/_redirects`. Rewrote all surviving `relatedGuides` cross-refs 2025→2026 (occitanie alone was referenced 31×) and removed the 4 resulting consecutive-duplicate entries (Corsica tourism guides). FR guide-page render already filters `relatedGuides` to existing slugs, so no dead links. Detector: `grep slugs | sed 's/-20[0-9]{2}$//' | uniq -d` (same base, two years). A follow-up FR similarity scan (same method as EN) then found one phrasing-dup cluster: an orphan 3-city `guide-immobilier-[city]-prix-quartiers` series (bordeaux/nantes/rennes) whose guides were literally titled "Acheter à [city]…" — pure dups of the canonical 49-city `acheter-a-[city]-quel-quartier-budget` series. Removed the 3 orphans (0 inbound refs), 301'd to the richer `acheter-` versions. **FR 669→654; both FR & EN corpuses now scanned (year-collision + title/heading similarity) and clean of clear near-dupes.** Genuinely remaining = only low-intent listicles (music-scene, covered-markets, naturalist, single-parent/blended families, kids-sport, stable-industrial-jobs) and comparatifs (covered by `/compare`).
  - ✅ **Duplicate-slug bug FIXED + guarded (2026-06-03):** EN had 3 dup slugs (`strasbourg-/rennes-living-guide-for-expats-2026`, `french-school-system-expat-guide-2026`); FR `GUIDES` had 3 more (`vivre-en-centre-val-de-loire-guide-2026`, `vivre-en-hauts-de-france-guide-2026`, `10-choses-a-faire-a-clermont-l-herault-2026`). The 2nd of each pair was dead (`.find()` returns the first) + a dup sitemap URL. Kept the richer variant of each pair. EN 445→442, FR 672→669. **Regression guard added:** `assertUniqueSlugs()` in `lib/data-integrity.ts` throws at module load (dev + `phase-production-build`); wired into `data/guides.ts` (`guides.slug`) and `data/guides-en.ts` (`guides-en.slug`). A future duplicate now fails the build loudly.
- 2026-06-01/02:
  - **170 EN tourism guides `things-to-do-in-[city]-2026` — FULL PARITY with FR `10-choses-a-faire` reached (2026-06-02).** Every FR tourism city now has a native EN counterpart. Auto-surfaced as the featured card on `/cities/[slug]/things-to-do`; slug + featured-card lookup mirror FR `a-faire`. Shipped across 19 batches (batches 6–19 this session, +120 guides covering all of metropolitan France: heritage cathedrals, Loire/Basque/Brittany/Corsica, Riviera, Champagne, the north coast, Alps, Pyrenees, Auvergne, Jura, Vosges, plus the smaller prefecture towns). NB: EN deploy needs `NODE_OPTIONS=--max-old-space-size=4096` (47k-asset upload OOMs Node's default heap — see [[deploy-manual-no-ci]]).
  - 6 EN itinerary guides (`one-week-in-provence`, `french-riviera-road-trip`, `loire-valley-chateaux`, `alsace-wine-route`, `brittany-coast-road-trip`, `three-days-in-paris`) — `category: "lifestyle"`, distinct travel-intent series.
  - EN guide-page "Read next" now relevance-ranked (`lib/guide-suggestions-en.ts`); guide-page JSON-LD enriched (Article author/publisher/mainEntityOfPage + BreadcrumbList).
- [x] Per-city OG images with EN copy (`app/[locale]/cities/[slug]/opengraph-image.tsx`, EN locale, "BestCitiesInFrance")
- [x] EN-specific RSS feed (`/feed.xml` + `/guides/feed.xml` locale-aware via `NEXT_PUBLIC_DEFAULT_LOCALE`)

---

## Roadmap v11 — Data depth, guide series & per-city enrichissement

### Doublons filtrés (déjà livré — ne pas re-créer)

| Demande | Couverture existante |
|---------|----------------------|
| météo / indice météo | `/villes/[slug]/climat` + `ClimateChart` |
| fibre / 5G / internet | `/villes/[slug]/connexion-internet` |
| prix location / tension locative | `/villes/[slug]/tension-locative` |
| transports / gares / autoroutes / temps de trajet | `/villes/[slug]/transports` |
| écoles | `/villes/[slug]/ecoles` (EN: `schools`) |
| sortir / commerces culturels | `/villes/[slug]/a-faire` + guides `10-choses-a-faire` |
| quartiers | `/villes/[slug]/quartiers` |
| comparaisons A vs B | `/comparer/[a]-vs-[b]` (~300 paires SSG) |
| avis | CityProfile onglet discussion |
| immobilier / acheter | guides `acheter-a-[ville]` (49 villes FR + EN) |
| coût de la vie | guides `budget-mensuel-realiste` (FR) + `cost-of-living-[city]` (EN) |
| expatrié | EN living guides |
| criminalité | score `safety` dans seed (affiché onglet scores) |
| score famille / étudiant / retraité / écologique | `lib/niche-scores.ts` + city-match |
| emploi / télétravail | champ `remoteWork` seed + `/copilot` |

### Nouvelles sous-pages ville — ✅ toutes livrées

`/villes/[slug]/statistiques`, `sante`, `air` (= pollution), `emploi`, `commerces` existent tous
(plus `bruit`, `eau`, `risques`, `fiscalite`, `securite`, `demographie`, `sport`, `velo`… — ~38
sous-pages ville au total). Computed from existing seed axes + characterTags, pas de nouveaux
champs seed. Même pattern que `climat`.

### Enrichissement seed — champs à ajouter (toujours ouvert)

`population` est fait ; le reste n'a jamais été ajouté (les sous-pages ci-dessus s'en passent en
computant depuis les axes existants — l'enrichissement reste utile pour des chiffres réels) :

- ~~`population: number`~~ — ✅ dans le seed (recensement)
- ~~`salaireMédianNet`~~ — ✅ **remplacé par mieux, 2026-07-28** : `data/city-income.json`
  (via `scripts/city-income.mjs` + `lib/city-income.ts`) porte le **niveau de vie médian**
  et le **taux de pauvreté** réels, publiés **à la commune** par Insee Filosofi 2021 —
  533/540 villes. C'est plus fin que le proxy départemental prévu ici. Attention au
  vocabulaire : niveau de vie = revenu disponible par unité de consommation, **pas un
  salaire** ; `lib/city-income.ts` porte la convention. Surfacé sur
  `/villes/[slug]/statistiques` + EN `statistics`. Non couvertes : Guadeloupe, Guyane,
  Mayotte (hors champ Filosofi) et Pierrefitte-sur-Seine (fusionnée dans Saint-Denis
  en 2025) — la page n'affiche alors rien plutôt qu'un chiffre inventé.
- ~~`populationEvolution: number`~~ — ✅ **fait 2026-07-29, en mieux** : `data/city-population.json`
  (via `scripts/city-population.mjs` / `npm run population` + `lib/city-population.ts`) porte la
  **population municipale réelle 2011 / 2016 / 2022** et les **sept tranches d'âge** publiées par
  l'Insee à la commune (base « Évolution et structure de la population en 2022 ») — 538/540 villes.
  `lib/demography.ts` ne devine plus le vieillissement ni la trajectoire depuis le département :
  `ageingRisk` lit la part réelle des 60 ans et plus, `trajectoryRisk` l'évolution réelle 2016→2022,
  le proxy départemental ne servant plus que de repli. Surfacé sur `/villes/[slug]/demographie`
  (pyramide des âges) et `/villes/[slug]/statistiques` (+ jumelles EN). Non couvertes : Mamoudzou
  (hors fichier « France hors Mayotte ») et Pierrefitte-sur-Seine (fusionnée dans Saint-Denis en
  2025). ⚠️ Le seed conserve ses `population` approximatives, utilisées par les tris et les seuils
  (éligibilité palmarès, filtres) : les deux nombres coexistent volontairement.
- `tauxChomage: number` — % (proxie zone emploi)
- `densiteMedecins: number` — généralistes / 1 000 hab
- `indiceAtmo: number` — qualité air annuelle 0–10 (1 = très pollué)
- `espacesVerts: number` — % superficie communale (proxie CORINE)

**Egress : les sources ouvertes sont joignables depuis une session locale** (vérifié
2026-07-28) — `insee.fr` (fichiers zip/csv), `geo.api.gouv.fr`, `data.gouv.fr`,
`overpass-api.de`. C'est l'environnement des routines cloud qui les refuse (403 CONNECT),
pas le projet. Un pipeline d'enrichissement se lance donc en local, pattern
`scripts/city-income.mjs` : téléchargement caché dans `.cache/`, parse, JSON commité.
`api.insee.fr` (Melodi) reste injoignable et demande un jeton — passer par les fichiers
publiés sur `insee.fr`, dont l'URL est stable (`/fr/statistiques/fichier/<id>/<nom>.zip`).

### Bloc FAQ structuré sur CityProfile — ✅ livré

Accordéon `<details>` natif (réponses dans le HTML statique, no-JS/crawler-friendly) en bas de
`CityProfile.tsx` + `FAQPage` JSON-LD dans `components/CityJsonLd.tsx`. 100 % computé depuis le seed.

### Nouvelles séries de guides per-city (FR)

État au 2026-07-14 :

| Slug pattern | Catégorie | Cible | Statut |
|---|---|---|---|
| `vivre-a-[ville]-2026` | `moving` | top 50 villes | ✅ 51 guides |
| `etudiant-a-[ville]-2026` | `lifestyle` | top 20 villes | ✅ 20 guides |
| `famille-a-[ville]-2026` | `family` | top 20 villes | ✅ 19 guides |
| `retraite-a-[ville]-2026` | `lifestyle` | top 20 villes | ✅ 20 guides (batch 1 shipped 2026-07-14 : Dinan, Lannion, Les Sables-d'Olonne, Royan, Le Puy-en-Velay, Anglet, Hendaye, Vitré, Fontainebleau, Île de Ré ; batch 2 shipped 2026-07-15 : Challans, Tulle, Pontarlier, Saint-Dié-des-Vosges, Château-Gontier, Albertville, Gaillac, Vendôme, Marmande, Saint-Lô) |
| `demenager-a-[ville]-2026` | `lifestyle` (pas de cat. `moving` en FR) | top 50 villes | ✅ 50 guides — série close 2026-07-18 pm. Batch 1 (Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Montpellier, Strasbourg, Bordeaux, Lille), batch 2 (Rennes, Grenoble, Rouen, Angers, Dijon, Tours, Clermont-Ferrand, Metz, Nancy, Caen), batch 3 (Saint-Étienne, Le Havre, Reims, Toulon, Villeurbanne, Nîmes, Aix-en-Provence, Brest, Le Mans, Amiens), batch 4 (Saint-Denis 93, Perpignan, Boulogne-Billancourt, Argenteuil, Orléans, Mulhouse, Saint-Paul Réunion, Nanterre, Créteil, Vitry-sur-Seine), batch 5 (Saint-Denis Réunion, Le Tampon, Aubervilliers, Colombes, Asnières-sur-Seine, Courbevoie, Rueil-Malmaison, Champigny-sur-Marne, Saint-Maur-des-Fossés, Antibes). Logistique déménagement (≠ sous-page `s-installer`) |
| `quartiers-a-eviter-[ville]-2026` | `moving` | top 30 villes | ⛔ **écartée 2026-07-28 — faute de données, pas faute d'envie** |
| `travail-a-[ville]-2026` | `lifestyle` | top 30 villes | ✅ 30 guides — série close 2026-07-22 (batches 1/2/3) |
| `universites-[ville]-2026` | `lifestyle` | top 15 villes | ✅ 15 guides — série close 2026-07-25 (batch 1 : Paris, Lyon, Toulouse, Lille, Bordeaux, Aix-en-Provence, Montpellier, Rennes, Strasbourg, Nantes ; batch 2 : Grenoble, Nice, Clermont-Ferrand, Nancy, Dijon) |

**Pourquoi `quartiers-a-eviter` est écartée (décision 2026-07-28, ne pas la re-proposer sans nouvelles données).**
`data/neighborhoods.ts` couvre les 540 villes mais à raison de **3 quartiers par ville**, et ce sont les quartiers
centraux les mieux connus. Les quartiers que les gens visent réellement en tapant cette requête n'y sont pas. Écrire
la série reviendrait donc à sourcer une réputation de quartier ailleurs que dans nos données — c'est-à-dire à
inventer des chiffres sur des lieux réels et sur les gens qui y habitent, exactement ce que la ligne éditoriale
interdit, avec un risque diffamatoire en prime. Le pendant honnête de `meilleurs-quartiers` existe déjà : la section
quartiers de `acheter-a-[ville]` et `/villes/[slug]/quartiers`, qui disent sur quel axe un quartier décroche et pour
quel profil, sans verdict global. **Condition de réouverture** : enrichir `neighborhoods.ts` à 8-12 quartiers par
ville sur une source réelle (IRIS Insee, SSMSI infracommunal) — auquel cas la série se justifie, en cadrage par
profil (« bruyant pour une famille » ≠ « mauvais »), jamais en liste noire.

Déjà couverts (skip) : `acheter-a-[ville]` (immobilier), `budget-mensuel-realiste-[ville]` (coût de la vie), `10-choses-a-faire-a-[ville]` (sortir), `quitter-[ville]` (départ), `vivre-sans-voiture-[ville]` (transports).

### Pages comparatives éditoriales

L'engine `/comparer/[a]-vs-[b]` est livré + ~300 paires SSG existent.

- ✅ **Landing `/comparer` enrichie** — 50 paires éditoriales (`POPULAR_PAIRS` dans `app/comparer/page.tsx`).
- [x] **Sitemap haut-trafic** — ✅ clos 2026-07-28. `app/sitemap.ts` et `generateStaticParams` dérivent tous deux de `SEO_PAIRS` : la couverture sitemap **est** la liste des paires, il n'y a rien à synchroniser. Reste le choix éditorial de la liste : carré top-15 fermé le 27/07, rangs 16-20 métropolitains (Grenoble, Dijon, Angers, Nîmes) croisés avec le top-11 le 28/07 → **722 paires**, top-20 × top-20 à 156/190. Les 34 restantes sont exclues volontairement (Reims / Toulon / Le Havre / Saint-Étienne face aux rangs 16-20, et tout ce qui implique Saint-Denis de La Réunion) : pas de demande de recherche. **Ne pas viser 1 225** — le top-50 × top-50 complet est majoritairement du bruit.

### Hors périmètre (nécessitent des assets ou APIs externes)

- **Photos / vidéos** : pipeline assets sous licence requis (même contrainte que guide hero images — cf. §4a audit).
- **Cartes thématiques** (écoles, hôpitaux, commerces, météo) : nécessitent APIs data.gouv.fr / IGN / OpenStreetMap Overpass — scope = projet à part entière, pas intégrable dans un build statique sans étape de pré-fetch. *Exception actée 2026-07-22 : les **parcs** passent dans le périmètre via un pipeline Overpass pré-fetché (F59, cf. ROADMAP.md « Vague 6 ») — le pattern `scripts/commune-images.mjs` (crawl caché + resumable + assets versionnés) prouve que c'est tenable en statique.*

---

## Vague 6 (2026-07-22) — parents solo, parcs, navigation départements

Demande utilisateur. Détail complet dans `ROADMAP.md` § « Vague 6 ».

- [x] **F58 — City Match « parent solo »** — 5ᵉ option de la question `stage` dans
  `lib/city-match.ts`. Pondération distincte de `family` : un seul revenu et un seul
  conducteur, donc `cost` et `transport` pèsent autant que `schools`. L'encodage du
  permalien étant positionnel, les anciens liens restent valides.
- [x] **F59 — Parcs & espaces verts par ville** — ✅ **livré 2026-07-27.**
  Pipeline OSM/Overpass → `data/city-parks.json` → `/villes/[slug]/parcs` ×540 (+ EN
  `/cities/[slug]/parks`). Objectif produit : permettre à un parent de *découvrir* des
  parcs au lieu de retourner au même. Attribution ODbL obligatoire. Spec détaillée
  dans `ROADMAP.md`.
- [x] **F60 — `/departements` trouvable** — la page listait ~102 cartes triées par score
  moyen, sans recherche : retrouver le sien demandait de scroller. Remplacé par
  `components/DepartementFinder.tsx` (grille compacte + recherche par **n°**, par nom,
  **ou par ville** — taper « Bordeaux » remonte la Gironde ; tri n° / A-Z / score).
  Les 540 liens villes restent dans le HTML statique sous un `<details>`, pour ne pas
  perdre le maillage interne.
- [x] **F61 — Vacances : profils `monoparental` et `celibataire`** — ajoutés à
  `VACATION_PROFILES` (`lib/vacation-fit.ts`), ce qui génère automatiquement
  `/vacances/profil/[profil]` FR + `/vacations/profile/[profile]` EN, les cartes des
  hubs et les options du quiz. `monoparental` pondère transport + coût au-dessus de
  `famille` (un seul adulte) ; `celibataire` privilégie la densité de vie sur le
  budget, à la différence de `solo` (voyager seul·e ≠ chercher du monde).
  ⚠️ `PROFILE_SLUGS` dans `app/sitemap.ts` était codé en dur — désormais dérivé de
  `VACATION_PROFILES` pour éviter que ça redérive.

---

## Vague 7 (2026-07-29) — Score Biodiversité

Demande utilisateur. Spec complète dans `ROADMAP.md` § « Vague 7 ».

- [ ] **F62 — Score Biodiversité** — couche « nature » sur les 540 villes : espèces
  recensées à proximité (**GBIF**, libre, sans clé), zones protégées et statuts de
  protection (**INPN/MNHN**, gratuit), espaces verts (réutilise `data/city-parks.json`
  de F59, pas de re-crawl). Pipeline pré-fetché `scripts/city-biodiversity.mjs` →
  `data/city-biodiversity.json` commité par lots → `lib/biodiversity.ts` →
  `/villes/[slug]/biodiversite` (+ EN `biodiversity`) SSG conditionnel + classement.
  - **Pas de Supabase** : la demande d'origine le citait, mais l'auth est Worker-native
    sur D1 depuis R9.1 et l'hébergement est Cloudflare **Workers Static Assets** (pas
    Pages). F62 n'a besoin d'aucune base — pipeline → JSON → SSG.
  - **Le biais d'effort d'observation est le cœur du problème** : les occurrences GBIF
    mesurent d'abord la densité de naturalistes, pas la biodiversité. On compte des
    **espèces distinctes normalisées par l'effort** (observateurs / observations), on
    déclare une ville **non mesurable** sous un seuil d'effort plutôt que de lui coller
    un score, et on fait peser lourd les **zones protégées** — un périmètre Natura 2000
    existe indépendamment de qui l'observe.
  - Convention : « Biodiversité » nomme une qualité → **10 = bon**. Licences à afficher
    (DOI GBIF + licence par jeu, `CC BY-NC` filtré ; MNHN + Licence Ouverte).
  - Egress : supposer le crawl bloqué côté routine cloud (403 CONNECT comme Overpass) —
    **passe locale**. Confirmé le 2026-07-30 : `api.gbif.org`, `inpn.mnhn.fr` et
    `www.data.gouv.fr` répondent tous les trois 403 CONNECT depuis la routine.
  - **État au 2026-07-30** : moteur livré, données non collectées. `scripts/city-biodiversity.mjs`
    (`npm run biodiversity`, + `:probe` / `:stats`) et `lib/biodiversity.ts` sont en place ;
    `data/city-biodiversity.json` vaut `{}` — **0/540 villes**, aucune surface, aucun classement.
    La richesse est mesurée par **raréfaction de Hurlbert** (espèces attendues dans 500
    observations) et non par un volume d'occurrences ; sous 500 observations ou 20 observateurs
    la ville est **non mesurable** et n'a pas de score. `overall` reste `null` tant que les zones
    protégées INPN ne sont pas collectées : repondérer 2 composantes sur 3 donnerait un chiffre
    qui ne mesure pas ce que son nom annonce. `cityProtectedAreas()` renvoie `null` = « on ne
    sait pas », jamais `0`. ⚠️ Les paramètres GBIF sont marqués `@unverified` dans le script —
    lancer `npm run biodiversity:probe` en local avant le premier lot.
  - **État au 2026-08-01** : la composante **zones protégées** a son ingest complet —
    `scripts/city-protected-areas.mjs` (`npm run protected-areas`, + `:sources` / `:selftest` /
    `:stats`), branché sur `data/city-protected-areas.json`, qui vaut `{}` : **0/540 villes**,
    egress toujours 403. Les deux surfaces listent les périmètres (type, distance, surface,
    lien fiche INPN, mention MNHN / Licence Ouverte) mais restent garées en `page.pending.tsx`.
    Deux points de méthode à ne pas défaire : ① la couverture est **rastérisée sur une grille
    de 250 m**, jamais une somme de surfaces — les zonages français s'emboîtent (ZNIEFF I dans
    ZNIEFF II, Natura 2000 par-dessus) et une somme compte le même sol plusieurs fois, jusqu'à
    « 180 % du disque protégé » ; chaque cellule retient le niveau de protection le plus fort.
    ② une ville ingérée **sans aucun périmètre** vaut `areasTotal: 0` et s'affiche comme une
    mesure ; seule une ville non ingérée vaut `null` = « on ne sait pas ». ⚠️ Noms d'attributs
    INPN et gabarits d'URL des fiches sont `@unverified` — l'ingest imprime le champ retenu par
    couche, relire ces lignes au premier run local.
  - **État au 2026-08-02** : toujours **0/540 villes** sur les deux composantes (egress 403
    CONNECT retesté). Le run a durci le pipeline GBIF au lieu de collecter :
    `npm run biodiversity:selftest` (22 contrôles hors ligne, symétrique de
    `protected-areas:selftest`) a trouvé deux bugs silencieux au premier lancement. ① GBIF
    renvoie les facettes en `UPPER_SNAKE_CASE` (`SPECIES_KEY`) alors qu'on les demande en
    camelCase : la comparaison `toLowerCase()` ne tombait jamais en face et **chaque ville
    aurait enregistré zéro espèce** sans lever d'erreur. Normaliser en ne gardant que lettres
    et chiffres ; une facette absente lève désormais. ② La raréfaction se calculait sur le
    vecteur d'abondance **tronqué** par le plafond de pagination, contre sa propre somme —
    ce qui **surestime la richesse des villes les mieux relevées**, donc le haut du classement
    (le score est un rang centile sur cette valeur). Désormais : facette complète → exact ;
    tronquée → encadrement rigoureux (`rarefiedExact`, `rarefiedUpper`), et si l'intervalle
    dépasse `MAX_RAREFIED_UNCERTAINTY` (5 %) la ville passe en `richnessPending: "precision"`
    — non classée, la page disant que le défaut est dans *notre* collecte, pas dans la nature.
    `QUERY_VERSION` = 2 ; `MIN_QUERY_VERSION` écarte du barème toute ligne v1. Ne pas
    « simplifier » l'encadrement en republiant la borne basse comme une valeur exacte.
  - **État au 2026-08-03** : toujours **0/540** sur GBIF et INPN (403 CONNECT retesté sur
    `api.gbif.org`, `inpn.mnhn.fr`, `www.data.gouv.fr`). Le run a corrigé la troisième
    composante, **espaces verts** — la seule qui a ses données (F59, 540/540) et la seule
    qui n'avait jamais été passée au garde-fou du biais d'effort. Deux défauts, tous deux
    dans `lib/biodiversity.ts` : ① une commune relevée **sans aucun parc nommé dans OSM**
    valait une surface de `0` et récoltait **0,1/10**, alors que le docstring annonçait
    déjà `null` — 11 communes concernées, dont Sallanches au fond d'une vallée alpine,
    Noirmoutier, Porto-Vecchio, Calvi et Saint-Paul-de-Vence. OSM est une **carte
    contributive, pas un registre** : « personne n'a cartographié » et « pas de verdure »
    y sont indiscernables, donc `greenSpacePerCapita` renvoie désormais `null` et le profil
    porte `greenSpacePending: "mapping"`. ⚠️ Ne pas « harmoniser » ce cas avec les zones
    protégées, où `areasTotal: 0` **est** une mesure : l'inventaire INPN est un registre
    administratif exhaustif, OSM non — c'est la source qui décide, pas la symétrie.
    ② F59 plafonne à **40 parcs par commune** (`PARKS_PER_CITY`) sans avoir gardé le compte
    d'avant plafonnement : pour les **41 communes** qui atteignent le plafond, la surface
    additionnée est un **plancher**, pas un total. Elles gardent leur score (le tri est par
    superficie décroissante, donc chaque parc omis est plus petit que le 40e conservé, lequel
    pèse en médiane 0,19 % du total de sa ville et 0,73 % au pire — l'erreur est bornée et
    joue *contre* les villes les mieux cartographiées), mais les deux surfaces affichent
    un « au moins / at least ». Nouveaux exports : `PARKS_PER_CITY_CAP`,
    `greenSpaceTruncated()`, `GREEN_SPACE_UNMAPPED_COUNT` (11), `GREEN_SPACE_TRUNCATED_COUNT`
    (41) ; les 11 communes non cartographiées sortent aussi du barème centile, où elles
    tassaient le bas avec des valeurs inconnues. Rien ne change côté F59 : pour un
    **répertoire de destinations**, « aucun parc nommé » reste une réponse juste — c'est
    seulement comme **proxy de surface végétale** que le même zéro devient faux.
  - **État au 2026-08-04 — la collecte est débloquée, et automatisée.** Elle ne partira plus
    d'une « passe locale » à demander : `scripts/local-data-runner.sh` tourne en **cron sur
    la machine du propriétaire** (02h20 et 14h20 UTC), lance `npm run biodiversity` par lots
    de 60 villes (~45 s la ville), commite `data/city-biodiversity.json` et pousse. Couverture
    complète attendue en ~5 jours. **Ne redemande pas de passe manuelle et ne relance pas le
    crawl depuis une routine** — l'egress y est refusé et le restera. Les zones protégées
    restent à `{}` : l'INPN publie des shapefiles derrière une page de téléchargement, donc le
    runner saute l'étape tant que les GeoJSON ne sont pas dans
    `.cache/city-protected-areas/sources/` (`npm run protected-areas:sources` donne la ligne
    `ogr2ogr`). Tant que cette composante manque, `overall` reste `null` — inchangé.
  - **État au 2026-08-06 — les deux sous-pages sont EN LIGNE.** `/villes/[slug]/biodiversite`
    et EN `/cities/[slug]/biodiversity` sont dégarées sur les **302/540 villes collectées**
    (278 mesurables, 24 en `richnessPending: "precision"`), `BIODIVERSITY_PAGES_LIVE = true`.
    Publier maintenant se justifie parce que le barème centile s'est montré **stable** à la
    vérification sur l'historique du JSON : entre l'instantané à 182 villes et celui à 302,
    les rangs ont bougé de 0,2 point en médiane, 0,5 au pire, aucune ville d'un point entier.
    ⚠️ Le crawl est **biaisé en taille** (302 collectées à 45 000 hab. de médiane, 238
    restantes à 14 500) : les pages portent un paragraphe « À quoi la ville est comparée »
    qui le dit. Trois bugs que seules les vraies valeurs pouvaient révéler ont été corrigés
    au passage — la carte 🦋 annonçait « effort d'observation trop faible » à **Paris** et à
    toute la petite couronne (les villes les mieux relevées, en réalité tronquées par *notre*
    collecte) ; le sitemap gatait sur `hasBiodiversityData` **sans** le drapeau et annonçait
    donc 604 URL en 404 pendant que les pages étaient garées ; et les deux pages déclaraient
    un `openGraph` **sans `images`**, le piège documenté plus haut. `overall` reste `null`
    (zones protégées 0/540) et `/classements/biodiversite` **n'existe pas** : 278 mesurables,
    sous le seuil de ~300. Détail complet dans `ROADMAP.md` § point d'étape 2026-08-06.
  - **État au 2026-08-10 — crawl terminé (540/540), et le rang de richesse est RETIRÉ.**
    Le seuil de ~300 villes mesurables était franchi (513) ; le corpus complet a permis de
    contrôler la mesure pour la première fois, et elle n'a pas tenu : corrélation de rang
    **−0,77** avec la concentration des relevés (part des observations tenue par 5 espèces),
    **+0,10** seulement avec le nombre d'espèces réellement recensées, et **56 %** de la
    variance expliquée par le seul département. Le score classait le **type de programme de
    saisie** (détecteurs à ultrasons, comptages de colonies, atlas botaniques), pas la nature :
    Douai et ses 2 588 espèces sortaient à 0,0/10, la Guadeloupe à 0,1 et la Guyane à 1,8 quand
    le Centre-Val de Loire tenait 7,8. Le site classait la Beauce au-dessus de l'Amazonie.
    ⚠️ **`/classements/biodiversite` est abandonné, pas reporté — ne pas le recréer** au motif
    que la couverture est bonne : c'est la mesure qui est en cause, pas le nombre de villes.
    De même, ne pas remettre `RICHNESS_RANKING_PUBLISHED` (`lib/biodiversity.ts`) à `true` sans
    avoir refait les trois contrôles ; le remède est un recrawl GBIF agrégé par `datasetKey`
    (`QUERY_VERSION = 3`), pas un correctif d'affichage. Les effectifs bruts restent publiés,
    ils sont exacts — c'est le classement qui était faux. Nouveau motif
    `richnessPending: "incomparable"`, prioritaire sur `effort` / `precision` / `calibration`.
    Détail complet dans `ROADMAP.md` § point d'étape 2026-08-10.

- [ ] **F63 — Qualité de l'air : du modèle à la mesure** — la section existe
  (`/villes/[slug]/air` ×540 + EN `air-quality`) mais `lib/air-quality.ts` **calcule
  tout par heuristique** depuis le seed (population, département, `characterTags`),
  alors que la légende affiche « ATMO · CITEPA · RNSA ». Remplacer par du mesuré :
  **indice ATMO quotidien publié à la commune** (ATMO France / data.gouv.fr) +
  **Geod'Air** (LCSQA/Ineris) pour les concentrations NO2/PM10/PM2.5/O3, rattachées à
  la station la plus proche **avec la distance affichée** (pattern
  `lib/climate-normals.ts`). Pollens RNSA : vérifier la licence avant intégration,
  sinon la dimension reste modélisée **et la page le dit**.
  - Surfaces manquantes que la demande réclame : **hub `/qualite-de-l-air`** (aucun
    aujourd'hui — l'air n'est qu'une sous-page ville), **classement
    `/classements/qualite-de-l-air`** (absent des 19 slugs de `RANKING_META`, à
    ajouter avec `RANKING_EN`), série `qualite-de-l-air-[ville]-2026` **après** la
    phase données seulement, angles saisonniers pollens et épisodes de pollution.
  - ⚠️ **La direction du score est déjà correcte, ne la « corrige » pas** : le moteur
    mesure l'exposition (10 = pire), l'inversion se fait à l'affichage FR **et** EN
    avec la légende « 10 = air le plus pur ». Vérifié 2026-07-29.
  - Demande de recherche **non chiffrée** : le plan Ahrefs refuse keyword explorer et
    Search Console. Sortir les volumes de la GSC avant d'industrialiser la série.

- [ ] **F64 — Actualité locale par ville** — la seule couche mouvante du site : ce que
  les publications officielles disent d'une commune sur 12 mois glissants. Spec complète
  dans `ROADMAP.md` § « Vague 7 — F64 », **à lire avant d'y toucher** (elle contient les
  arbitrages déjà tranchés).
  - **État au 2026-08-04 (matin)** : moteur livré, **0/540 villes**. `scripts/city-news.mjs`
    (`npm run news`, + `:probe` / `:selftest` / `:prune` / `:stats`), `lib/city-news.ts`,
    `components/CityNewsSection.tsx` câblé sur les deux pages ville.
  - **État au 2026-08-04 (après la première passe réelle)** : l'ingest BODACC **ne pouvait
    pas fonctionner** et personne ne pouvait le voir depuis une routine, faute d'egress.
    Quatre défauts, tous silencieux, corrigés contre l'API réelle :
    ① `api.bodacc.fr` **n'a pas de DNS** — DILA publie sur
    `bodacc-datadila.opendatasoft.com` (l'échec remontait en « fetch failed », qui se lit
    comme un blocage proxy) ; ② la famille des procédures collectives s'appelle
    `collective`, pas `procedure_collective`, donc elles comptaient zéro partout ;
    ③ `group_by` refuse les alias et `date_format` — l'agrégation mensuelle passe par
    `year()`/`month()`, et le filtre de familles est **obligatoire** dans le `where` parce
    que `group_by` plafonne à 100 seaux (12 familles × 12 mois débordent, un mois tomberait
    en silence) ; ④ le plus vicieux — le filtre commune était une **égalité sur le nom mis
    en majuscules**, alors que `ville` est du texte libre saisi par les greffes : le 42 porte
    81 650 lignes « Saint-Étienne » **et** 46 184 « Saint-Etienne », Marseille est éclatée
    entre « Marseille » et « Marseille 8e Arrondissement ». Annecy renvoyait 12 lignes sur
    9 621 — un chiffre qui a l'air d'une mesure et vaut 0,1 % du réel. Remplacé par
    `search()`, insensible à la casse et aux accents. **Leçon générale : un constant écrit
    sans avoir vu l'API répondre est `@unverified`, et ne mérite aucune surface au-dessus.**
  - **La collecte est automatisée, ne la relance pas depuis une routine.**
    `scripts/local-data-runner.sh` (cron local, 02h20 / 14h20 UTC) lance `npm run news` par
    lots de 180 villes (~4 s la ville), commite `data/city-news.json` et pousse.
    `npm run news:prune` (refenêtrage 12 mois) et `:selftest` marchent hors ligne. Le RNA
    reste **désactivé** : `RNA_RESOURCE_ID` vaut `null`, la ressource n'a jamais été résolue,
    et une ville sans cette source l'omet de `sources` plutôt que d'afficher zéro association.
  - **Une section, pas une page.** Pas de `/villes/[slug]/actualites` ×540 : une page
    dont le corps est une liste de titres agrégés est du *scraped content*. Donc pas
    d'URL propre, pas d'entrée sitemap, pas de JSON-LD `NewsArticle` (on n'est pas
    l'éditeur), et la section **disparaît** quand la ville n'a rien dans la fenêtre.
  - **Rendu serveur obligatoire** : `CityProfile` est `"use client"` et déjà à ~1 Mo de
    JS ; le composant est monté *après* lui dans la page serveur (précédent
    `CityGuidesList`), jamais importé depuis un composant client.
  - **BODACC et RNA agrégés en compteurs mensuels, jamais nominatifs** — une grande part
    des annonces vise des entrepreneurs individuels, donc des personnes physiques. Seuls
    les arrêtés CatNat, actes de l'État ne nommant personne, sont listés à l'unité.
  - **La presse quotidienne régionale est gatée** (droit voisin, loi 2019-775) et Google
    News RSS est interdit par ses CGU. Aucun scraping d'article, aucune reformulation IA
    (reformuler ne fait pas disparaître le droit voisin, ça ajoute une erreur factuelle
    signée par nous). Phase 1 = open data officielle uniquement.
  - Convention d'honnêteté : on n'y classe ni ne commente. Une création d'entreprise
    n'est pas une bonne nouvelle en soi, une radiation n'est pas une mauvaise. `licence`
    est portée **par entrée**, pas par fichier.

---

### Conventions for adding an EN route

1. Create `app/[locale]/<route>/page.tsx`. Generate static params with `{ locale: "en", ... }` only.
2. Add `metadata.alternates.canonical` pointing at `${ORIGIN_BY_LOCALE.en}/<route>`.
3. If FR and EN share a slug, ensure it is NOT in `FR_ONLY_SEGMENTS` in `proxy.ts`.
4. Add the new URL(s) to a `SITEMAP_CHUNKS_EN` chunk in `app/sitemap.ts`.
5. Keep English native, not translated-from-French. Direct, slightly dry, factual. No "discover the charming…".
6. **Reused FR client components leak French.** If an EN page renders a client/component built for the FR site (e.g. `CityProfile` sub-cards, the interactive tools), that component MUST accept a `locale?: "fr" | "en"` prop (default `"fr"`, FR output byte-identical) and branch every visible string via a `t(fr, en)` helper — plus emit `/cities/`, `/rankings/`, `/compare/` paths under EN. When strings originate in a shared lib, add a local English label map at the display site (don't edit the lib). Audited & fixed 2026-05-31: the 6 interactive tools (`people-like-you`, `copilot`, `city-match`, `future-you`, `projection-5ans`, `climate-2040-timelapse`) + 7 `CityProfile` sub-components. Navbar/Footer/calculators were already locale-aware. 2026-06-01 round: `BookingCTA` + `StickyBookingBar` (EN copy + `.en-gb` booking host, wired across the 6 EN `/vacations` + calculator pages), `CityProfileCta` (EN copy, `/cities/` link, EN score-tier label map), and pass-through `locale="en"` for `CityFingerprint`/`DiscussionCTA` on the EN `fingerprint`/`seasons`/`neighbourhoods` sub-pages. The EN homepage already passes `locale="en"` to its full section tree.
