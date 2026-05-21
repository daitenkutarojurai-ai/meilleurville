# MeilleurVille — Project briefing

French city ranking & relocation guide site. 540 cities, 361 guides, 19 ranking
categories, 18 regions (13 metropolitan + 5 DROM). Copy is **French**.
(Counts derived at build — see `lib/site-stats.ts`; figures here are indicative.)

A parallel **English version** (bestcitiesinfrance.com) is being scaffolded from
the same repo / same build. See [§ Bilingual setup](#bilingual-setup-bestcitiesinfrancecom)
below. The FR domain remains unchanged.

## Stack

- **Next.js 16.2.4** (App Router, Turbopack) + **TypeScript** (strict). Note:
  Next 16 deprecates the `middleware` file convention in favour of `proxy.ts`
  (renamed for clarity; same purpose). Use `proxy.ts` in this repo.
- Tailwind v4 with custom CSS variables (`--accent`, `--bg-canvas`, etc.)
- **lucide-react** for icons
- Static-first: most pages SSG via `generateStaticParams`, JSON file stores for
  comments / contact, no DB at runtime
- Prisma schema present in `prisma/` but not used at runtime — historical (candidate for removal)

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
  comments-store.ts              # JSON-file comment persistence
  contact-store.ts               # JSON-file contact form persistence
  spam-filter.ts, rate-limit.ts  # Abuse mitigation on user-generated content
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

## Score colour scale (6 tiers — applied in lib/utils.ts, CityCard, FranceHeatmap, DromStrip, CarteClient, ScoreBar, all opengraph-image.tsx)

| Range  | Colour  | Count (352 cities) | Meaning        |
|--------|---------|-------------------|----------------|
| ≥ 7.5  | Violet (`#A855F7`) | ~3 (0.9%) | Exceptionnel — très rare |
| ≥ 7.0  | Green   | ~22 (6.3%)        | Excellent      |
| ≥ 6.0  | Lime    | ~100 (28%)        | Bon            |
| ≥ 5.0  | Amber   | ~116 (33%)        | Moyen          |
| ≥ 4.0  | Orange  | ~63 (18%)         | En dessous     |
| < 4.0  | Red     | ~48 (14%)         | Mauvais        |

Distribution mean ≈ 5.42 (down from 5.81 with tightened algo). Penalties now:
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
  use a metropolitan bounding box `lng ∈ [-6, 10]` × `lat ∈ [40, 52]`. **DROM
  cities (DOM-TOM) are filtered out** of these maps so they don't render
  off-canvas. Inset cartouches for DROM are a planned follow-up.
- "Pro" / paywall references are being removed (commit `bed2367`). If you see
  a stale Premium teaser, prefer removing it over reinforcing it.
- **setState-in-effect pattern**: initialise localStorage-backed state with lazy
  initialisers (`useState(() => readFavorites()...)`) not `useEffect`. Derive
  computed state with `useMemo` instead of effect + setState. Keeps lint clean
  and avoids the mount-flash.
- **Canonicals**: every dynamic route `generateMetadata` must return
  `alternates: { canonical: "/<route>/<slug>" }`. Root layout provides the
  global default via `metadataBase`; page-level canonical overrides are needed
  for villes, classements, guides, regions, departements, comparer, quartiers, climat.

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
npm run build        # full SSG build (~3 000 pages)
npm run lint         # 25 errors remaining (all react/no-unescaped-entities, cosmetic)
```

@AGENTS.md

---

## Content roadmap — guides (`data/guides.ts`)

Current count: **359 guides**. Add via the pattern in this file — each guide needs `slug, title, metaTitle, metaDesc, category, emoji, readMinutes, publishedAt, updatedAt, intro, sections[], relatedCities[], relatedGuides[], tags[]`. All copy in **French**, direct voice, data-led. No silent fake figures.

### Série "Climat 2040" 2026
Category `"lifestyle"`. Macro-régionales, forward-looking, données Météo-France ARPEGE + Cerema + GIEC.

| Macro-région | Slug | Status |
|--------------|------|--------|
| Sud-Est méditerranéen | `climat-2040-sud-est-mediterraneen-france` | ✅ done |
| Façade Atlantique | `climat-2040-facade-atlantique-france` | ✅ done |
| Île-de-France / Paris | `climat-2040-ile-de-france-paris` | ✅ done |
| Massif Central / montagne | `climat-2040-massif-central-montagne-refuge` | ✅ done |
| Bretagne | `climat-2040-bretagne-cote-interieure` | ✅ done |
| Hauts-de-France / Nord | `climat-2040-nord-hauts-de-france` | ✅ done |
| Grand Est | `climat-2040-grand-est-alsace-lorraine` | ✅ done |
| Sud-Ouest / Pyrénées | `climat-2040-sud-ouest-pyrenees-bassin-aquitain` | ✅ done |
| Vallée du Rhône | `climat-2040-vallee-du-rhone-axe-lyon-avignon` | ✅ done |
| Normandie / Côte / Cotentin | `climat-2040-normandie-cotentin-cote` | ✅ done |
| Centre-Val de Loire / Loire | `climat-2040-centre-val-de-loire-vallee` | ✅ done |
| Bourgogne-Franche-Comté / Jura | `climat-2040-bourgogne-franche-comte-jura` | ✅ done |
| Outre-mer / DROM | `climat-2040-outre-mer-drom-cyclones-mer` | ✅ done |
| Corse | `climat-2040-corse-incendies-secheresse` | ✅ done |
| Alpes / Savoie | `climat-2040-alpes-savoie-refuge-altitude` | ✅ done |

**Série Climat 2040 : 12/12 macro-régions livrées.** Prochains angles climatiques possibles : qualité de l'air par bassin urbain, eau et nappes phréatiques par grande région, scoring climatique par ville.

### Série "Quitter X" 2026
Track big cities — one guide per city, category `"comparaison"`.

| Ville | Slug | Status |
|-------|------|--------|
| Paris | `quitter-paris-guide-2025` | ✅ done (2025) |
| Lyon | `quitter-lyon-guide-2026` | ✅ done |
| Marseille | `quitter-marseille-guide-2026` | ✅ done |
| Lille | `quitter-lille-guide-2026` | ✅ done |
| Toulouse | `quitter-toulouse-guide-2026` | ✅ done |
| Bordeaux | `quitter-bordeaux-guide-2026` | ✅ done |
| Nantes | `quitter-nantes-guide-2026` | ✅ done |
| Rennes | `quitter-rennes-guide-2026` | ✅ done |
| Montpellier | `quitter-montpellier-guide-2026` | ✅ done |
| Strasbourg | `quitter-strasbourg-guide-2026` | ✅ done |
| Nice | `quitter-nice-guide-2026` | ✅ done |
| Grenoble | `quitter-grenoble-guide-2026` | ✅ done |
| Clermont-Ferrand | `quitter-clermont-ferrand-guide-2026` | ✅ done |
| Dijon | `quitter-dijon-guide-2026` | ✅ done |
| Rouen | `quitter-rouen-guide-2026` | ✅ done |
| Nîmes | `quitter-nimes-guide-2026` | ✅ done |
| Toulon | `quitter-toulon-guide-2026` | ✅ done |
| Annecy | `quitter-annecy-guide-2026` | ✅ done |

### Comparaisons A vs B 2026
Category `"comparaison"`. Prefer pairs not yet covered and high-search-intent.

| Paire | Slug | Status |
|-------|------|--------|
| Lyon vs Bordeaux | `lyon-vs-bordeaux-comparatif-2025` | ✅ done |
| Nantes vs Rennes | `nantes-vs-rennes-comparatif-2025` | ✅ done |
| Marseille vs Toulouse | `marseille-vs-toulouse-comparatif-2025` | ✅ done |
| Bordeaux vs Rennes | `bordeaux-vs-rennes-comparatif-2026` | ✅ done |
| Nice vs Montpellier | `nice-vs-montpellier-comparatif-2026` | ✅ done |
| Toulon vs Marseille | `toulon-vs-marseille-comparatif-2026` | ✅ done |
| Dijon vs Lyon | `dijon-vs-lyon-comparatif-2026` | ✅ done |
| Caen vs Rouen | `caen-vs-rouen-comparatif-2026` | ✅ done |
| Nantes vs Bordeaux | `nantes-vs-bordeaux-comparatif-2026` | ✅ done |
| Pau vs Bayonne | `pau-vs-bayonne-comparatif-2026` | ✅ done |
| Annecy vs Chambéry | `annecy-vs-chambery-comparatif-2026` | ✅ done |
| Reims vs Amiens | `reims-vs-amiens-comparatif-2026` | ✅ done |
| La Rochelle vs Bayonne | `la-rochelle-vs-bayonne-comparatif-2026` | ✅ done |
| Brest vs Lorient | `brest-vs-lorient-comparatif-2026` | ✅ done |
| Le Mans vs Tours | `le-mans-vs-tours-comparatif-2026` | ✅ done |
| Perpignan vs Montpellier | `perpignan-vs-montpellier-comparatif-2026` | ✅ done |
| Metz vs Nancy | `metz-vs-nancy-comparatif-2026` | ✅ done |

### Région 2026
Category `"region"`. Prefer departments/zones with no 2026 guide yet.

| Zone | Slug | Status |
|------|------|--------|
| Hauts-de-France | `vivre-en-hauts-de-france-guide-2026` | ✅ done |
| Centre-Val de Loire | `vivre-en-centre-val-de-loire-guide-2026` | ✅ done |
| Pays Basque | `vivre-en-pays-basque-guide-2026` | ✅ done |
| Lorraine | `vivre-en-lorraine-metz-nancy-thionville-2026` | ✅ done |
| Corse | `vivre-en-corse-guide-2026` | ✅ done |
| Outre-mer | `vivre-en-outre-mer-guide-2026` | ✅ done |
| Auvergne profonde | `vivre-en-auvergne-profonde-guide-2026` | ✅ done |
| Landes | `vivre-dans-les-landes-guide-2026` | ✅ done |
| Roussillon | `vivre-en-roussillon-guide-2026` | ✅ done |
| Ain (Pays de Gex, Bresse) | `vivre-dans-l-ain-guide-2026` | ✅ done |
| Ariège | `vivre-en-ariege-guide-2026` | ✅ done |
| Ardennes / Meuse | `vivre-en-ardennes-meuse-guide-2026` | ✅ done |
| Creuse / Corrèze profonde | `vivre-en-creuse-guide-2026` | ✅ done |
| Périgord / Dordogne | `vivre-en-perigord-dordogne-guide-2026` | ✅ done |
| Alsace | `vivre-en-alsace-guide-2026` | ✅ done |
| Charente-Maritime | `vivre-en-charente-maritime-guide-2026` | ✅ done |

### Télétravail par région 2026
Category `"teletravail"`.

| Région | Slug | Status |
|--------|------|--------|
| Bretagne | `teletravailler-depuis-bretagne-guide-2026` | ✅ done |
| Normandie | `teletravailler-depuis-normandie-guide-2026` | ✅ done |
| Provence | `teletravailler-depuis-provence-guide-2026` | ✅ done |
| Grand Est | `teletravailler-depuis-grand-est-guide-2026` | ✅ done |
| Bourgogne | `teletravailler-depuis-bourgogne-guide-2026` | ✅ done |
| Pays de la Loire | `teletravailler-depuis-pays-de-la-loire-guide-2026` | ✅ done |
| Auvergne / Massif Central | `teletravailler-depuis-auvergne-guide-2026` | ✅ done |
| Nouvelle-Aquitaine | `teletravailler-depuis-nouvelle-aquitaine-guide-2026` | ✅ done |
| Île-de-France banlieue | `teletravailler-grande-couronne-ile-de-france-2026` | ✅ done |
| Occitanie | `teletravailler-depuis-occitanie-guide-2026` | ✅ done |
| Hauts-de-France | `teletravailler-depuis-hauts-de-france-guide-2026` | ✅ done |

### Lifestyle / thématiques 2026
Category `"lifestyle"`.

| Thème | Slug | Status |
|-------|------|--------|
| Seniors actifs | `meilleures-villes-seniors-actifs-france-2026` | ✅ done |
| Artistes / créatifs | `meilleures-villes-artistes-creatifs-france-2026` | ✅ done |
| Gastronomie | `meilleures-villes-gastronomie-france-2026` | ✅ done |
| Cyclistes | `meilleures-villes-cyclistes-france-2026` | ✅ done |
| Surf / sports nautiques | `meilleures-villes-surf-sports-nautiques-france-2026` | ✅ done |
| Randonnée / trail | `meilleures-villes-randonnee-trail-france-2026` | ✅ done |
| FIRE / retraite anticipée | `villes-france-retraite-anticipee-fire-2026` | ✅ done |
| Culture / festivals | `meilleures-villes-culture-festivals-france-2026` | ✅ done |
| Zéro déchet / éco | `meilleures-villes-zero-dechet-ecologie-france-2026` | ✅ done |
| Animaux / pets | `meilleures-villes-animaux-chiens-france-2026` | ✅ done |
| Musique / scène musicale | `meilleures-villes-musique-scene-france-2026` | ✅ done |
| Expatriés revenant en France | `expatries-retour-france-quelle-ville-2026` | ✅ done |
| Bien-être / spas | `meilleures-villes-bien-etre-spas-france-2026` | ✅ done |
| Entrepreneurs / startups | `meilleures-villes-entrepreneurs-startups-france-2026` | ✅ done |

### Budget 2026
Category `"budget"`.

| Thème | Slug | Status |
|-------|------|--------|
| Primo-accédants | `meilleures-villes-primo-accedants-france-2026` | ✅ done |
| Freelances | `meilleures-villes-freelances-independants-france-2026` | ✅ done |
| Investissement < 100k | `investissement-locatif-moins-100000-euros-france-2026` | ✅ done |
| Étudiant budget serré | `survivre-etudiant-province-moins-700-euros-2026` | ✅ done |
| Colocation jeunes actifs | `meilleures-villes-colocation-jeunes-actifs-2026` | ✅ done |
| Retraite 1 500€/mois | `vivre-retraite-1500-euros-mois-france-2026` | ✅ done |
| Salaire SMIC, quelle ville ? | `vivre-smic-quelle-ville-france-2026` | ✅ done |

### Famille 2026
Category `"famille"`.

| Thème | Slug | Status |
|-------|------|--------|
| Scolarisation alternative | `villes-france-ecoles-alternatives-montessori-2026` | ✅ done |
| Familles expatriées retour | `familles-expatriees-retour-france-quelle-ville-2026` | ✅ done |
| Familles monoparentales | `meilleures-villes-familles-monoparentales-france-2026` | ✅ done |
| Handicap / accessibilité | `meilleures-villes-accessibilite-handicap-france-2026` | ✅ done |

---

## Technical roadmap

### Done ✅
- [x] Score colour scale: 6-tier red→green, thresholds calibrated to distribution mean ~5.7
- [x] Navbar: nav links at `lg` breakpoint (1024px) to prevent overflow at `md`
- [x] Horizontal overflow: `overflow-x: hidden` on body
- [x] Homepage `SectionNav`: sticky scrollspy pill-nav (Top 5, Classements, Explorer, Quiz, Simulateur, Guides)
- [x] Tab icon: green MapPin matching `--accent` (#16A34A), manifest + theme-color aligned
- [x] Canonicals: `alternates.canonical` on all 8 dynamic route families
- [x] `setState-in-effect` lint: lazy initialisers in FavoriteButton, FavoriteCount, FavoritesGrid, CommentSection; useMemo in HeroSection search
- [x] Guides: +27 new guides (224 total)

### Done ✅ (continued)
- [x] Prisma dep removal — `@prisma/client` + `prisma` removed from package.json, `prisma/` folder deleted
- [x] Aria-labels: `id`/`htmlFor` linkage on CostCalculator sliders, `aria-label` on CompareTool city search, QuizFlow slider, CommentSection textarea
- [x] Comparer pairs: `["le-mans", "tours"]` added to `SEO_PAIRS` (perpignan/montpellier + metz/nancy were already present)
- [x] PWA icons: `public/icon-192.png` and `public/icon-512.png` generated from `app/icon.svg` via rsvg-convert

### Next priorities (human-blocked)
- [ ] **`NEXT_PUBLIC_BASE_URL`** set on Vercel to the production domain
- [ ] **`app/cgu` + `app/confidentialite`** date: bump "Dernière mise à jour" after legal review

## Roadmap v5 — UX & data-truth audit (2026-05-15)

**Status: shipped 2026-05-15.** All five items merged on `main`.

UX issues + data accuracy. Higher leverage than more guides at this point — retention and trust depend on these.

### R5.1 — City page layout (`/villes/[slug]`) ✅
**Shipped.** Moved the 4 sub-page link cards (Quartiers / Climat / Transports / Écoles) out of the right rail into a full-width 4-column strip below the two columns. Right rail went 11 → 7 items, height matches main column.

**Problem:** Right-rail panel is dense (favoris, score breakdown, sub-page links, related cities, sources…), main column has shorter content, so when scrolling the rail keeps going while the centre column ends — leaves a large empty band in the middle. Bad reading experience.

**Goal:** Rebalance the two-column reading axis.
- Audit `app/villes/[slug]/CityProfile.tsx` for content split.
- Move secondary rail blocks (related cities, sources, sub-page links) below the main column on desktop OR make rail `position: sticky` only for the score card and let the rest scroll inline.
- Verify mobile: rail blocks should stack cleanly below the main column without duplication.

### R5.2 — Carte de France: DROM box overlap ✅
**Shipped.** Split `FranceHeatmap` SVG into metropolitan map (`y ∈ [0, MAP_H=700]`) + dedicated DROM strip below (`y ∈ [MAP_H, MAP_H+70]`) with a faint dashed separator. Cartouches no longer collide with Provence / Corse.

**Problem:** On `/carte` (and probably `FranceHeatmap` on homepage), the inset cartouche for DROM (Outre-mer) overlaps the metropolitan map card.

**Goal:** Reorganise so DROM inset is properly positioned, never overlapping. Likely fixes:
- Inset positioned in the SE corner of the metropolitan card (Mayotte/Réunion in one row, Antilles+Guyane in another).
- Add proper white padding/border around inset so it reads as a distinct box.
- Or move DROM to a separate strip *below* the metropolitan map (`DromStrip` already exists in lib/utils — may just be a styling fix).
- Files: `components/FranceHeatmap.tsx`, `app/carte/CarteClient.tsx`, possibly `DromStrip` usage.

### R5.3 — Simulateur not actually responding to inputs ✅
**Shipped.** `CostCalculator` ranking was driven by `rentSavings = parisRent - rent`, which preserved order regardless of input → top cities were always the same. Added a "Priorité" chip selector (Budget / Télétravail / Nature / Culture / Qualité de vie / Sécurité) that drives the actual ranking via the corresponding score axis. Each result shows a "Pourquoi" reason chip tied to the priority + a "Hors budget" badge when the rent T2 exceeds the user's affordability threshold (33 % salary or current Paris rent).

**Problem:** First few results in the city simulator are always the same regardless of user inputs (budget, lifestyle, preferences). Looks like a dead feature — kills trust and reuse.

**Goal:** Make the simulator's ranking honestly depend on the inputs.
- Locate the simulator component (likely `app/page.tsx` "simulateur" section + a `CostCalculator` or `CitySimulator` component).
- Audit how inputs feed into city scoring — they probably don't, or feed a constant.
- Use existing `lib/niche-scores.ts` weights and re-rank `CITIES_SEED` per user inputs (budget → cost axis, télétravail → remoteWork, nature priority → nature axis, etc.).
- Add a visible "Pourquoi cette ville ?" reason chip on each result tying back to the inputs.
- Edge case: when user changes only one input, ranking should visibly shift.

### R5.4 — Red Flags: working report button + city-first ordering ✅
**Shipped.** "Signaler un point noir" button (previously a dead `<button>`) → `<Link href="/contact?topic=red-flag">`. ContactForm pre-selects the new "Signaler un point noir" topic via `?topic=` URL param (wrapped in Suspense). Per-city fiches section now appears FIRST on `/red-flags` (above the categories), sorted worst-vigilance-first, with vigilance level chips + critical-signal counts via the new `lib/red-flags-summary.ts`.

**Problem A:** On `/red-flags`, "Signaler un point noir" button either doesn't navigate or loops to the same page.

**Problem B:** Section ordering puts archetypal red-flag patterns first; user research says city-specific red-flag fiches are what users actually want to land on. Need to flip the order + polish those fiches.

**Goals:**
- Wire "Signaler un point noir" to `/contact?sujet=red-flag` (existing contact form) OR to a dedicated `/red-flags/signaler` page. Pick the simpler one.
- Reorder `/red-flags` page: "Fiches red-flag par ville" block first (above the fold), archetypal patterns block second.
- Polish the city fiches: real intro per city, 3-5 concrete red flags per city sourced from `lib/city-narrative.ts` "cons" array OR a new dedicated field, link to the city page.

### R5.5 — Data-truth audit ✅
**Shipped.** New `lib/site-stats.ts` exposes derived counts (`CITIES_COUNT`, `GUIDES_COUNT`, `RANKINGS_COUNT`, `TAGS_COUNT`, `REGIONS_COUNT`, `DEPARTMENTS_COUNT`, `GLOSSARY_TERMS_COUNT`). Hardcoded numbers replaced across StatsBar, ContributionStats, /red-flags, /quiz, /sommaire, /recherche, /outils, /faq, /tags, /classements, and the matching OG images. Surrounding copy untouched per instruction.

**Problem:** Numbers on the site (e.g. "340 villes couvertes") may not reflect actual data (currently 352 cities, 295+ guides). Some figures may be stale or invented.

**Goal:** Audit every numeric claim displayed on the site and replace with derived-at-runtime values from the canonical data sources.
- Don't change the surrounding copy/comments, only the numbers.
- Audit targets:
  - Homepage hero/stats strip ("X villes couvertes", "Y guides", "Z classements")
  - `/villes` count, `/classements` count, `/guides` count
  - `/sommaire` summary numbers
  - Stats components: `StatsBar.tsx`, `TopFiveCities.tsx` headers, footer mentions
  - OG images that hardcode counts
- Replace hardcoded literals with `CITIES_SEED.length`, `GUIDES.length`, `RANKING_META.length` etc.
- Verify counts that include sub-content (climat, ecoles, quartiers, transports per-city pages = `CITIES_SEED.length × N`).

### R5 priority order (suggested)
1. **R5.4** (Red Flags button is a broken-link bug — 5-min fix, immediately visible)
2. **R5.5** (Data-truth audit — trust foundation, mostly find-and-replace)
3. **R5.2** (Carte DROM overlap — visible bug, small fix)
4. **R5.1** (City page layout — bigger refactor, real UX win)
5. **R5.3** (Simulateur — needs scoring rework, biggest scope)

## Roadmap v4 — post-265 guides (2026-05-13)

### R4.1 — Extend "Vivre sans voiture" series (+5 cities)
Toulouse, Grenoble, Rennes, Montpellier, Nice — all have strong tram/vélo networks and clear no-car ROI to communicate. Same 6-section pattern as the first batch.

### R4.2 — Extend "Acheter à X" series (+5 cities)
Bordeaux, Nantes, Strasbourg, Rennes, Montpellier — all in active price-discovery zone post-2024 dip. Same pattern: prix m² par quartier → budget brackets → quartiers en hausse → calcul honnête.

### R4.3 — Add 10 more comparer pairs to `SEO_PAIRS` ✅
**Shipped 2026-05-15.** Added 10 high-volume pairs: lyon-marseille, angers-le-mans, caen-le-havre, grenoble-chambery, clermont-limoges, poitiers-limoges, reims-strasbourg, lille-valenciennes, valence-lyon, thonon-annemasse.

### R4.4 — Reading-list at end of each guide
Below relatedGuides, add a "Lire ensuite" auto-suggest based on category overlap + city overlap (not just hardcoded). Improves session duration and PageRank distribution.

### R6.2 — JSON-LD broadening ✅
**Shipped 2026-05-15.** New `faqJsonLd` helper in `lib/jsonld.ts`. FAQPage emitted on both fiscalité pages (per-city + dept hub), each with 4 Q&A derived from the actual page content. BreadcrumbList JSON-LD now on all city sub-pages (quartiers, climat, transports, ecoles, fiscalite) + dept fiscalité hub. AI search engines (Perplexity, AI Overviews) get explicit structured signals to cite.

### R6.1 — Department fiscalité hub (`/departements/[slug]/fiscalite`) ✅
**Shipped 2026-05-15.** Mirror of the per-city fiscalité page at the department level. 46 hub pages generated, each lists every city in the department with a link to its detailed fiche. Cross-links from per-city fiche back to the hub. New `lib/dept-slug.ts` shared between dept index and the hub. Added to sitemap `departements` chunk. Refactored `app/departements/[dept]/page.tsx` to import the shared helpers (replaces a broken regex literal `[̀-ͯ]` with the proper `\\p{Diacritic}` pattern).

### R4.5 — Department-level fiscalité page (`/villes/[slug]/fiscalite`) ✅
**Shipped 2026-05-15.** Combined with R3.3 (per-city sub-page). `lib/fiscalite.ts` exposes `fiscalityForCity({ department, region })` returning DGFiP-aligned tiered estimates (taxe foncière T3 ancien fourchette, THRS zone-tendue flag, DMTO standard). 352 `app/villes/[slug]/fiscalite/page.tsx` pages generated via `generateStaticParams`, added to sitemap `city-sub` chunk, surfaced in the CityProfile sub-pages strip (now 5 cards). Disclaimer "estimation départementale" appears before any number.

## Roadmap v3 — post-250 guides (2026-05-13)

Now that guide count target is met and lint/build/TS are clean, next-leverage moves are SEO depth, in-page UX, and content niche expansion.

### R3.1 — FAQ JSON-LD on guide pages
Each guide has 6 `sections[]` with `heading` + `body`. Emit a second `<script type="application/ld+json">` with `@type: "FAQPage"` deriving Q&A from those sections. High AI-search payoff (Perplexity, Google AI Overviews citation surface), low risk. File: `app/guides/[slug]/page.tsx`.

### R3.2 — Internal city auto-linking inside guide bodies
Guide `sections[].body` mentions city names in plain text. Render a client-safe component that wraps known city names with `<Link href="/villes/${slug}">`. Boost internal PageRank flow, improve discovery. File: new `components/CityLinker.tsx` + integration in guide page.

### R3.3 — New city sub-page: `/villes/[slug]/fiscalite`
Pattern matches existing `climat/`, `quartiers/`, `ecoles/`, `transports/`. Compute from existing seed (no new dataset). Show approximate taxe foncière, taxe d'habitation résidence secondaire (only relevant where applicable), DMTO. Cross-link from CityProfile rail. Add to sitemap.

### R3.4 — RSS feed `/feed.xml`
Surface the 250 guides as a chronological RSS feed for syndication and AI discovery (Perplexity, AI search crawlers preserve RSS as a signal). Source: `GUIDES` sorted by `updatedAt desc`. Standard RSS 2.0 + Atom alternate.

### R3.5 — Guides batch v3 (+15 niche angles)
Beyond "Quitter X", target high-search-intent niches not yet covered:
- "Vivre sans voiture en [grande ville]" (5 guides)
- "Acheter à [ville] en 2026 — quel quartier et quel budget" (5 guides)
- "Météo, climat et qualité de l'air — où vivre en France 2026"
- "Villes où l'on peut élever une famille bilingue (FR/EN, FR/ES, FR/DE)"
- "Villes universitaires avec coût de vie raisonnable"
- "Villes étapes pour expatriés revenant en France"
- "Villes-côtières en télétravail : qualité connexion + cadre"

---

## Roadmap v6 — 15 features (2026-05-15)

See `ROADMAP.md` for the full breakdown. Priority order (P0):
1. F3 — Scores propriétaires (canicule, solitude, bruit, sécurité nocturne, etc.)
2. F4 — Red Flag pages virales
3. F12 — Comparaison 3 villes ✅
4. F9 — Comparateur de régions
5. F1 — Hidden Costs Calculator
6. F5 — RealityCheck

P1: F2, F13, F14, F15, F6, F11 — P2: F7, F8, F10.

### F12 — Comparaison 3 villes ✅
**Shipped.** `/comparer/<a>-vs-<b>-vs-<c>` renders the same `[pair]` segment via length-based dispatch in `page.tsx`. New `lib/comparer-triplets.ts` lists 15 curated triplets (clusters régionaux : Big 3 métros, triangle alpin, côte PACA, Pays Basque, Grand Est, Nord, Atlantique…) and is integrity-checked at build like `SEO_PAIRS`. New `app/comparer/[pair]/TripletView.tsx` renders 3-column cards, per-axis winner bars, climate/loyer tableau, profile picks (Famille/Télétravail/Retraite/Étudiant) et liens pair-à-pair. JSON-LD : BreadcrumbList + ItemList + FAQPage à 4 Q/R. Routes pré-rendues et ajoutées au sitemap (priority 0.55).

---

## F70 — Vacances en France (sous-section /vacances) ✅ Phases 1 + 2

Nouvelle verticale du site dédiée au **vacancier** (vs. le relocant qui est la
cible historique). Sous-domaine `/vacances` de `mavilleideale.fr`, monétisation
via lien partenaire **Booking.com** (`NEXT_PUBLIC_BOOKING_AID` à définir
côté Vercel pour activer le tracking).

### Architecture engine

- `lib/vacation-seasons.ts` — climat mensuel par ville (12 mois × 352 villes).
  Interpolation sinusoïdale depuis `avgTempJuly` / `avgTempJanuary`, biais
  régional pour précipitations et ensoleillement (méditerranéen / océanique /
  oceanic-dry / semi-continental / continental / mountain / drom), affluence
  touristique 1-5 dérivée des tags × mois. Précision ±1.5 °C. À enrichir
  Phase 1.5 via normales Météo-France 1991-2020.
- `lib/vacation-activities.ts` — 10 activités (`plage`, `montagne`, `ski`,
  `citytrip`, `vignobles`, `surf`, `thermal`, `road-trip`, `gastro`,
  `famille`). Chaque activité : détection fitness (0-10) par ville à partir
  des tags + dept + élévation + scores, plus une fonction `seasonFit` qui
  pondère par les signaux climatiques du mois cible.
- `lib/vacation-fit.ts` — `vacationFit(city, opts)` composite avec mix
  configurable selon les paramètres passés (activité, mois, profil, budget).
  Cache module-level pour les classements (`topCitiesForMonth`,
  `topCitiesForActivity`, `topCitiesForProfile`). Helpers : `bestMonthsFor`,
  `BUDGET_TIER_LABEL`/`DESC`, `VACATION_PROFILES`.

### Routes (387 nouvelles)

| Route                                    | Pages | Notes                                            |
|------------------------------------------|-------|--------------------------------------------------|
| `/vacances`                              | 1     | Hub : top du mois courant + grilles mois/act/profil |
| `/vacances/mois/<mois>`                  | 12    | Hook éditorial + warning par mois + top 10       |
| `/vacances/activite/<activite>`          | 10    | Top 30 par activité avec filtre fitness ≥ 4      |
| `/vacances/profil/<profil>`              | 5     | famille/couple/solo/amis/seniors                 |
| `/vacances/region/<region>`              | 18    | 13 métro + 5 DROM. Activités phares par région.  |
| `/vacances/<ville>`                      | 352   | Fiche vacance : calendrier 12 mois + quoi y faire|

Toutes en SSG (`generateStaticParams` + `dynamicParams = false` sauf hub).
JSON-LD : BreadcrumbList + ItemList partout, FAQPage sur les fiches ville.

### UX / ton

- **Ton éditorial honnête** : chaque mois a un *hook* (« Septembre est
  mathématiquement le meilleur mois de l'année ») ET un *warning* (« évitez
  les côtes en janvier »). Pas de listicle de magazine.
- **Climat affiché** : temp, jours pluie, heures soleil/jour, affluence
  qualitative (Calme / Modéré / Très fréquenté).
- **Affiliation transparente** : `rel="sponsored noopener"`, mention
  partenariat explicite. Pas de pop-up.
- **Maillage interne** : chaque fiche ville classique gagne un tile
  « 🌴 Vacances ici » dans son sub-pages strip.

### Activation monétisation

1. Créer compte Booking Partners (booking.com/affiliate-program)
2. Mettre l'Affiliate ID dans Vercel : `NEXT_PUBLIC_BOOKING_AID=XXXXXXX`
3. Sans cet env var, les liens fonctionnent toujours mais sans tracking.

### Phases futures (non shipped)

- **Phase 1.5** — Scrape normales mensuelles Météo-France pour remplacer
  l'interpolation sinusoïdale.
- **Phase 3** — Quiz interactif `/vacances/quiz` (5 questions → 3 destinations),
  sticky widget Booking, email-capture « Plan vacances PDF ».
- **Étendre l'affiliation** — camping (Yelloh/Capfun), train (Trainline),
  Gîtes de France.

---

## Roadmap v7 — UX polish + data-integrity sweep (2026-05-18)

User-reported batch from a full walkthrough. Treated as **priority queue** —
all items listed are unshipped. Group together where they share a touchpoint.

### R7.1 — Top navigation audit + restructure (P0) ✅
**Shipped.** Red Flags promoted to a 5th primary pill (visible `lg+`);
Carte became a dedicated map icon next to the search pill (reachable at
every desktop breakpoint instead of buried at `xl`, still in the burger
menu on mobile). Cadre de vie left the bar entirely — now in the Footer
Explorer column + a full-width capstone card on the homepage
(`ProfileQuickAccess`). FR bar holds 5 primary entries + 1 `xl` secondary
(Vacances), no `lg` overflow. EN nav untouched.

**Problem:** Top bar currently shows Explorer / Classements / Comparer /
Guides on desktop. User reports Red Flags and Carte are missing while Cadre
de vie is over-prioritised.

**Goal:**
- **Before changing anything**, dump the full sitemap of accessible hubs
  (Footer + SectionNav + `/sommaire`) and audit which are reachable in ≤ 1
  click from the top bar. Output: a one-pager listing "Top bar (4 slots) vs.
  rest of site" so no important section gets dropped silently.
- Replace one of the 4 primary slots with **Red Flags** AND surface **Carte**
  (either as a 5th slot if it fits, or as a prominent search-pill neighbour).
- Remove **Cadre de vie** from the top bar (move to Footer + a card on home).
- Final cut: ≤ 5 primary entries, no overflow at lg, no "important" hub more
  than 1 click away. Test against `/sommaire` page list.

Files: `components/Navbar.tsx`, `components/Footer.tsx`, `components/SectionNav.tsx`.

### R7.2 — Remove "Méthodologie" subsection from /cadre-de-vie (P1)
Subsection feels like a duplicate of `/methode` global page. Delete the
methodology block on `/cadre-de-vie` (or trim to a one-line link to
`/methode`). Same audit for `/cadre-de-vie/[macroregion]` if present.

Files: `app/cadre-de-vie/page.tsx`, possibly `app/cadre-de-vie/[macroregion]/page.tsx`.

### R7.3 — Score-vs-analysis alignment audit (P0) ✅
**Shipped.** Services publics, marché du travail, démographie and accès
aux soins use an internal engine convention where `10 = pire`. The
city-profile cards and per-city sub-pages already invert this for display
(`10 = bon`), but the national hub pages and `[macroregion]` pages showed
the raw score — so the same city read e.g. 7.5 on its profile and 2.5 on
the ranking. Flipped every displayed composite + sub-score on the 8
hub/macro-region pages (`app/{services-publics,emploi,demographie,sante}`)
to `(10 - score)`, with reading notes + FAQ JSON-LD copy updated to
`10 = bon` wording. Sort logic, level colours and the engine libs are
unchanged (still `10 = pire` internally — see the `**Convention**` block
at the top of each `lib/*.ts`). Sécurité is self-consistent (`10 = pire`
on card, sub-page and hub alike) so it was left as-is.

**Problem:** Services Publics shows scores in reverse order; Marché du
Travail score doesn't match its written analysis; Démographie &
Vieillissement same issue.

These cards likely use the same antipattern as F47 (healthcare): internal
scale "10 = pire" while display reads as "10 = bon", or `level` literal
hardcoded instead of derived from score (cf. R5 fix for `public-services.ts`
schoolsRisk).

**Goal:** systematic sweep of EVERY display of a numeric score on the site:
- `components/HealthcareCard.tsx` (done) — confirm green-tier numbers also
  cross-tier-correct.
- `components/PublicServicesCard.tsx`, `app/villes/[slug]/services-publics/page.tsx`
- `components/EmploymentCard.tsx`, `app/villes/[slug]/emploi/page.tsx`
- `components/DemographyCard.tsx`, `app/villes/[slug]/demographie/page.tsx`
- All `lib/*-risk.ts` / `lib/*-score.ts` files: confirm one consistent
  convention ("10 = bon" everywhere) and that `level` is derived from
  `levelFromScore(score)` not a literal.

Output: a "score convention" comment block at the top of each lib file +
flip displays so the score number, the label colour, and the prose analysis
all tell the same story.

### R7.4 — Ensoleillement: hours → days everywhere (P1) ✅
**Shipped.** Most surfaces already converted hours → jours via
`lib/utils:sunshineDays`; flipped the stragglers that still printed raw
hours: the climat ranking sentence + Mediterranean one-liner, the
comparer-regions climate table + FAQ, `city-narrative` climateLine
strings, the `water-stress` / `air-quality` engine reason strings, the
`rankings` methodology figures, the méditerranéen macro-region blurb and
the city-summary API text. Per-day sunshine (saisons, vacances) stays in
h/jour — a distinct metric. Days-primary-with-hours-in-parens kept on the
city profile + OG cards.

**Problem:** Some surfaces show "1 800 h de soleil" and others "X jours".
User wants days everywhere (more intuitive for non-specialists).

**Goal:** find every surface displaying `city.sunshinedays` (hours) and
convert to days via `lib/utils.ts:sunshineDays`. Keep hours as a small
secondary inside parentheses where space allows (already the pattern in
the homepage hero); on cards and lists, days only.

Files to grep: `sunshinedays`, `sunshineHours`, `sunshineDays`. Cover at
least: city profile hero, climate sub-page, /classements/soleil, OG images.

### R7.5 — Broken DGFiP link (P0, 5-min) ✅
**Shipped.** The fiscalité taxe-foncière link pointed at
`impots.gouv.fr/particulier/taxe-fonciere` (404) → now
`service-public.gouv.fr` F59 (taxe foncière TFPB). The THRS link F42117
(404) → F42 (taxe d'habitation résidence secondaire). The site-wide link
sweep also caught `expat-retour` + `lib/expat-return.ts` using F33899
(reassigned to an unrelated page) → R43251 (radiation du registre) for the
consular step and F32824 (assurance maladie au retour) for the sécu steps.
All service-public links moved to the current `.gouv.fr` host.

### R7.6 — Louer ou Acheter: self-explanatory scores (P1) ✅
**Shipped.** The per-city page already carried a full "Comment lire ce
ratio" legend box + the ratio's "années de loyer pour acheter" sub-label,
and every surface pairs the number with a labelled verdict chip
(`VERDICT_META`). The remaining gap was the national `/louer-ou-acheter`
ranking: its two tables showed a bare "Ratio" column. Added a one-line
"Lecture du ratio" legend under each table (< 13 achat fortement gagnant
… > 30 marché tendu). No naked numbers remain in the rent-vs-buy system.

**Problem:** `/villes/[slug]/louer-ou-acheter` shows raw numbers without
context — users don't know what "score 6.2" means.

**Goal:** every score on the page must have a one-line legend ("plus le
score est élevé, plus l'achat est avantageux" or similar) OR be replaced by
a labelled verdict chip ("acheter rentable dès 7 ans", "louer reste plus
malin"). No naked numbers.

Files: `app/villes/[slug]/louer-ou-acheter/page.tsx`, `components/RentVsBuyCard.tsx`,
`lib/rent-vs-buy.ts`.

### R7.7 — Score → colour audit (P0) ✅
**Shipped (corrected).** The ≥7.5 top tier was first flipped purple →
emerald, trusting a stale "Emerald" line in this file. That was wrong:
commit `ceb91dc` deliberately set the top tier to **violet `#A855F7`**
"across the entire codebase", and the emerald `#10B981` in the
`opengraph-image.tsx` files was the actual drift. Reverted to violet and
brought the 14 OG images + the FranceHeatmap/EN-map legends in line, so
the top tier is now genuinely violet everywhere (`lib/utils.ts`
`SCORE_TIERS`, hand-rolled ladders, OG cards, legends). The 6-tier
thresholds (7.5/7/6/5/4) were always correct; only the top-tier hue had
drifted across surfaces.

**Problem:** On `/classements/retraite` (and likely others), scores 8.0
display orange — violates the 6-tier scale defined in CLAUDE.md (8.0 should
be green).

**Goal:** site-wide audit of every place a score colour is applied. The
canonical helper is `lib/utils.ts:scoreColor`. Find:
- All call sites of `scoreColor` and verify they pass the right value
  (some pages may pass `10 - score` or a rank instead of the score).
- Any hand-rolled `if score >= …` ladders that don't match the 6 tiers.
- OG images that bake in colours — ensure they use the same threshold table.

Output: a single ranking-page screenshot where every numeric pill matches
its background tier; same on city profile, classements, leaderboard, niche
cards.

### R7.8 — Editorial rewrite of ALL guides (P1, big)
**Problem:** Guides currently read like raw notes — bullet points, naked
numbers, no flow. User wants editorial tutorials: full sentences, light
friendly tone, occasional dry humour. Feel like a magazine article, not a
spreadsheet.

**Goal:** rewrite `data/guides.ts` entry by entry. Keep the data points but
fold them into prose. Add an intro paragraph that hooks. Use the "sans
bullshit" voice from CLAUDE.md but more warmth. ~360 guides → likely
multi-PR effort, batched by series (Climat 2040 → Quitter X → Comparaisons
→ etc.).

Worth doing in **parallel agents** (e.g. one batch per series). Each PR
should keep the metadata fields untouched, only `intro` and `sections[].body`
edited.

### R7.9 — Polish "Cette ville selon votre profil" + AvoidIf wording (P2)
- The component title is now French (renamed in earlier turn) — but verify
  no other "Life Stage Lens" string remains anywhere (search the repo, OG
  images, sitemap labels).
- "Pas dans le top 30 d'un profil spécifique — choix généraliste" should
  never appear empty. Fall back to softer alternative copy (similar
  treatment to the "À éviter si" soft-fallback we shipped).
- Strip the em-dash `—` from this string + audit globally.

### R7.10 — Em-dash purge (P2)
Em-dashes (`—`) feel AI-generated when over-used. Replace with: comma,
period, colon, parentheses, or " - " depending on context. Don't blanket
sed — manually review per-file with judgement. Cap at: roughly 1 em-dash
per 200 words of body copy, and never two em-dashes in the same sentence.

Targets in priority: card titles + body copy + meta descriptions. Lower
priority: code comments, CLAUDE.md (these readers expect technical density).

### R7.11 — Comment section everywhere relevant (P1)
**Problem:** Comment section currently only on city profile. Users want it
on sub-pages too (climat, transports, fiscalité, etc.), OR — fallback — an
anchor link "Discuter de {city} →" pointing to the city profile's
`#discussions` anchor.

**Goal:** decide policy:
- Option A: actually embed `CommentSection` on every sub-page with its own
  topic (`city:{slug}:climat`, etc.) — more granular community feedback.
- Option B: just add a stickier "Discuter →" CTA at the bottom of each
  sub-page that scrolls to the parent profile's `#discussions`.

**Recommend Option B** to start (no fragmentation of conversations). Files:
the 21 sub-pages under `app/villes/[slug]/*`.

### R7.12 — "Aller plus loin" — add icons to each box (P2)
Currently 4 cards (Air, Bruit, Écoles, Quartiers) without iconography in
`/villes/[slug]/sante` and similar. Add a lucide icon per card matching the
sub-page strip on the main profile (already iconified via emoji).

Files: every sub-page's "Aller plus loin" block — `app/villes/[slug]/*/page.tsx`.

### R7.13 — Calculateur cout-reel: CTA card upgrade (P2) ✅
**Shipped.** New shared `components/CityProfileCta.tsx` — a styled link card
with MapPin icon, city name, 6-tier score badge (`scoreBg`/`scoreColor`/
`scoreLabel`) and a "Voir la fiche" button. Added to the end of
`/calculateur-cout-reel/[ville]` (which had no profile link at all) and to
the "Aller plus loin" block of `/cout-menage/[ville]` (replaced the flat
"Fiche ville" tile; remaining grid trimmed to 3 cards). `/quiz-compatibilite`
and `/simulateur-achat` are not per-city, so nothing to do there.

### R7.14 — /villes filters: visual lift (P2) ✅
**Shipped 2026-05-21.** `VillesSearch` filter panel: the 5 section labels
(Trier par / Ambiance / Profils de vie / Terrain / Région / Département)
gained lucide icons (`ArrowUpDown`, `Tag`, `Users`, `Mountain`, `MapPin`)
matching the `/classements` visual style. The sort / ambiance / niche chips
already carried emoji; the terrain chips (mer/montagne/plaine/vallée) gained
emoji too, so every chip group is now iconified.

### R7.15 — Red Flags Thématiques: strip Fxx refs (P0, 5-min) ✅
**Shipped.** Codes Fxx retirés des surfaces user-facing : badge `tag` supprimé du rendu synthèse, FAQ JSON-LD comparer/synthèse réécrite sans F44/F47/F50/F52/F57/F58/F59/F60/F61, champ `tag` retiré de `SynthesisAxis` (source unique du leak).

### R7 — Suggested execution order

1. **R7.15** (5-min, removes embarrassing internal codes)
2. **R7.5** (broken link, 5-min)
3. **R7.3** (score-vs-analysis — trust foundation, sweeps multiple cards)
4. **R7.7** (score colours — trust foundation, mostly find-and-replace)
5. **R7.1** (top nav — small but high visibility)
6. **R7.4** (sunshine hours → days)
7. **R7.6** (louer ou acheter clarity)
8. **R7.9 + R7.10** (em-dash purge + ghost copy)
9. **R7.2** (drop Méthodologie subsection)
10. **R7.11 → R7.14** (UI polish layer)
11. **R7.8** (guide rewrite — biggest scope, parallelisable)

## Bilingual setup (bestcitiesinfrance.com)

Same repo, same build, two Vercel projects, two domains.

- `mavilleideale.fr` (env: `NEXT_PUBLIC_DEFAULT_LOCALE=fr`, default) — unchanged.
  All FR routes stay at their existing paths (no URL prefix).
- `bestcitiesinfrance.com` (env: `NEXT_PUBLIC_DEFAULT_LOCALE=en`) — `proxy.ts`
  rewrites bare URLs to `/en/*` internally, so the URL bar stays clean
  (e.g. `bestcitiesinfrance.com/cities/lyon` → renders `app/[locale]/cities/[slug]/page.tsx`
  with `locale = "en"`).

### Key files

- `proxy.ts` — Next 16 rewrite. Detects locale via `NEXT_PUBLIC_DEFAULT_LOCALE`,
  rewrites unprefixed paths to `/en/*` on the EN project, 404s `/en/*` on the FR project.
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
  `seoDescriptionEn` to the seed record. No other change required — the EN
  build picks it up automatically. Cities missing EN copy fall back to a
  generic English template generated from city stats.

### EN routes shipped (2026-05-19)

Done in this sweep. Logo + nav now locale-aware; the EN build covers:

| Route | File | Notes |
|-------|------|-------|
| `/` | `app/[locale]/page.tsx` | Top cities + CTAs |
| `/cities` | `app/[locale]/cities/page.tsx` | Index |
| `/cities/[slug]` | `app/[locale]/cities/[slug]/page.tsx` | 352 cities |
| `/cities/[slug]/climate` | new | 352 pages, sun + temps + climate type |
| `/cities/[slug]/transport` | new | 352 pages, transport-score verdict |
| `/cities/[slug]/schools` | new | 352 pages, FR school-system primer |
| `/cities/[slug]/cost-of-living` | new | 352 pages, rent + buy + budget |
| `/rankings` | existing | 19 categories index |
| `/rankings/[slug]` | new | 19 detail pages, top 30 cities + methodology |
| `/regions` | new | All 18 regions, sorted by avg score |
| `/regions/[region]` | new | Per-region listing + native EN tagline |
| `/departments` | new | All depts |
| `/departments/[dept]` | new | Per-department city list |
| `/quiz` | existing | Lifestyle matcher |
| `/about` | new | Independent, what we do/don't do |
| `/contact` | new | Contact form (topic picker) |
| `/faq` | new | 9 Q/A + JSON-LD `FAQPage` |
| `/methodology` | new | 8-axis pipeline explainer |
| `/legal-notice` | existing | Required |
| `/privacy-policy` | existing | Required |

Phase 2 added (2026-05-20):

| Route | File | Notes |
|-------|------|-------|
| `/compare` | `app/[locale]/compare/page.tsx` | Popular-pairs index |
| `/compare/[pair]` | new | ~300 SEO pairs, score table + per-profile verdict |
| `/guides` | `app/[locale]/guides/page.tsx` | Curated EN guide index |
| `/guides/[slug]` | new | 6 native-EN guides (`data/guides-en.ts`) + Article/FAQ JSON-LD |
| `/map` | `app/[locale]/map/page.tsx` | Server-rendered SVG dot-map, no-JS, score-coloured |

Sitemap chunks for EN: `en-static`, `en-cities`, `en-rankings`, `en-regions`,
`en-departments`, `en-city-sub` (4×352), `en-compare` (~300), `en-guides` (6).

### EN translation roadmap (post-2026-05-19)

What's *not* shipped yet, in rough priority. Treat as a phased plan.

**Phase 1 — content depth on shipped pages**

- [ ] Translate the body / descriptionEn / seoTitleEn for the remaining
      ~342 cities (only 10 are populated). Generate via a one-shot data
      script that takes the FR `description` and produces a native-EN
      rewrite, then human-review the top-50-by-traffic.
- [ ] Per-region taglines (`REGION_EN_DESCRIPTIONS` in
      `app/[locale]/regions/[region]/page.tsx`) — already covers all 18
      regions; keep in sync when FR taglines change.
- [ ] Per-ranking detail (`RANKING_EN` in
      `app/[locale]/rankings/[slug]/page.tsx`) — already covers 19; refresh
      copy as the FR `description`/`methodology` evolves.

**Phase 2 — high-value missing routes**

- [x] `/guides` + `/guides/[slug]` (EN). Shipped 2026-05-20 as 6 natively
      written English guides in `data/guides-en.ts` (not translations of
      the 359 FR guides). Topics: moving to France, remote work, families,
      cost of living, leaving Paris, retirement. **Next:** expand the
      curated set — add "Quitter X" → "Leaving X" city guides, climate
      guides. Each new entry in `data/guides-en.ts` auto-generates a route.
- [x] `/compare` + `/compare/[pair]` (EN). Shipped 2026-05-20 — reuses
      `SEO_PAIRS` (~300 pairs), score table + housing + per-profile verdict.
      2-city only; triplets not ported.
- [x] `/map` (EN equivalent of `/carte`). Shipped 2026-05-20 as a
      server-rendered SVG dot-map (no client JS — the FR `CarteClient` has
      hardcoded FR strings and wasn't reused). DROM cities listed separately.
- [x] `/compare-regions` + `/compare-regions/[pair]` (EN). Shipped 2026-05-21 —
      78 region pairs (C(13,2)) in SSG, mirrors `/comparer-regions`. Score
      bars + climate + housing tables + top-5 per region + BreadcrumbList /
      FAQPage JSON-LD. Sitemap chunk `en-compare-regions`. Cross-linked from
      the EN regions hub and EN compare index.
- [ ] Triplet comparisons (`/compare/[a]-vs-[b]-vs-[c]`).

**Phase 3 — secondary surfaces**

- [ ] City sub-pages: `/cities/[slug]/healthcare`, `/safety`,
      `/neighbourhoods`, `/employment`, `/air-quality`, `/noise`,
      `/risks`, `/seasons`, `/water`, `/remote-work`, `/honest-review`,
      `/own-vs-rent`. The FR site has 24 sub-pages per city; only 4 are
      mirrored in EN today. Pick the next 4 by intent: healthcare, safety,
      neighbourhoods, own-vs-rent.
- [ ] `/red-flags` and `/red-flags/[theme]` (EN).
- [x] `/leaderboard` (EN). Shipped: static global ranking, 352 cities, podium + table.
- [ ] `/vacations` (EN port of `/vacances`, ~387 pages).
- [ ] `/quiz/compatibility` (EN port of `/quiz-compatibilite`).
- [ ] `/calculator/real-cost` (EN port of `/calculateur-cout-reel`).
- [ ] `/household-cost` (EN port of `/cout-menage`).
- [ ] `/simulator/purchase` (EN port of `/simulateur-achat`).

**Phase 4 — long tail**

- [ ] All 360+ guides translated.
- [ ] All 24 city sub-pages per city.
- [ ] Per-city OG images regenerated with EN copy.
- [ ] EN-specific RSS feed at `/feed.xml` on the EN domain.

### Conventions for adding an EN route

1. Create `app/[locale]/<route>/page.tsx`. Generate `static params` with
   `{ locale: "en", ... }` only — the FR project never builds this tree.
2. Add a `metadata.alternates.canonical` pointing at
   `${ORIGIN_BY_LOCALE.en}/<route>`.
3. If the FR equivalent uses a different top-level slug (e.g. `villes`
   vs `cities`), do nothing. If they share the slug (e.g. `regions`),
   make sure the slug is **not** in `FR_ONLY_SEGMENTS` in `proxy.ts`.
4. Add the new URL(s) to a `SITEMAP_CHUNKS_EN` chunk in `app/sitemap.ts`.
5. Keep English native, not translated-from-French. The voice is direct,
   slightly dry, factual. No "discover the charming…".
