# MeilleurVille — Project briefing

French city ranking & relocation guide site. 352 cities, 144 guides, 13 ranking
categories, 18 regions (13 metropolitan + 5 DROM). Copy is **French**.

## Stack

- **Next.js 15** (App Router, Turbopack) + **TypeScript** (strict)
- Tailwind v4 with custom CSS variables (`--accent`, `--bg-canvas`, etc.)
- **lucide-react** for icons
- Static-first: most pages SSG via `generateStaticParams`, JSON file stores for
  comments / contact, no DB at runtime
- Prisma schema present in `prisma/` but not used at runtime — historical

## Project layout (high-level)

```
app/
  page.tsx                       # Homepage (hero, FranceHeatmap, TopFiveCities, bento)
  villes/
    page.tsx                     # Browse + filter all cities
    [slug]/
      page.tsx                   # SSR entry → CityProfile.tsx
      CityProfile.tsx            # Tabs: overview / score / discussion
      quartiers/page.tsx         # Per-city neighbourhoods
      climat/page.tsx            # Per-city climate deep-dive (NEW)
  classements/                   # 13 ranking categories
    page.tsx                     # Index of all categories
    [slug]/page.tsx              # Each category leaderboard
  regions/                       # 18 regions
    [region]/page.tsx
  departements/                  # Per-département pages
  guides/                        # 144 long-form editorial guides
    [slug]/page.tsx
  comparer/                      # /comparer/<a>-vs-<b>
  carte/                         # Interactive France map
  leaderboard/                   # Global top-N table
  quiz/                          # Lifestyle → city match
  red-flags/                     # Pitfalls per city archetype
data/
  cities-seed.ts                 # 352 cities, raw seed (calibrated + normalized at module load)
  guides.ts                      # 144 long-form guides
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
components/                      # Navbar, Footer, FranceHeatmap, CityCard, etc.
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

## Commands

```bash
npm install
npm run dev          # http://localhost:3000 (Turbopack)
npx tsc --noEmit     # strict TS pass
npm run build        # full SSG build (~2 200 pages)
npm run lint
```

@AGENTS.md

---

## Content roadmap — guides (`data/guides.ts`)

Current count: **182 guides** (target: 250+). Add via the pattern in this file — each guide needs `slug, title, metaTitle, metaDesc, category, emoji, readMinutes, publishedAt, updatedAt, intro, sections[], relatedCities[], relatedGuides[], tags[]`. All copy in **French**, direct voice, data-led. No silent fake figures.

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
| Dijon | `quitter-dijon-guide-2026` | ⬜ todo |
| Rouen | `quitter-rouen-guide-2026` | ⬜ todo |
| Nîmes | `quitter-nimes-guide-2026` | ⬜ todo |
| Toulon | `quitter-toulon-guide-2026` | ⬜ todo |
| Annecy | `quitter-annecy-guide-2026` | ⬜ todo |

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
| Nantes vs Bordeaux | `nantes-vs-bordeaux-comparatif-2026` | ⬜ todo |
| Pau vs Bayonne | `pau-vs-bayonne-comparatif-2026` | ⬜ todo |
| Annecy vs Chambéry | `annecy-vs-chambery-comparatif-2026` | ⬜ todo |
| Reims vs Amiens | `reims-vs-amiens-comparatif-2026` | ⬜ todo |
| La Rochelle vs Bayonne | `la-rochelle-vs-bayonne-comparatif-2026` | ⬜ todo |
| Brest vs Lorient | `brest-vs-lorient-comparatif-2026` | ⬜ todo |

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
| Ain (Pays de Gex, Bresse) | `vivre-dans-l-ain-guide-2026` | ⬜ todo |
| Ariège | `vivre-en-ariege-guide-2026` | ⬜ todo |
| Ardennes / Meuse | `vivre-en-ardennes-meuse-guide-2026` | ⬜ todo |
| Creuse / Corrèze profonde | `vivre-en-creuse-guide-2026` | ⬜ todo |

### Télétravail par région 2026
Category `"teletravail"`.

| Région | Slug | Status |
|--------|------|--------|
| Bretagne | `teletravailler-depuis-bretagne-guide-2026` | ✅ done |
| Normandie | `teletravailler-depuis-normandie-guide-2026` | ✅ done |
| Provence | `teletravailler-depuis-provence-guide-2026` | ✅ done |
| Grand Est | `teletravailler-depuis-grand-est-guide-2026` | ✅ done |
| Bourgogne | `teletravailler-depuis-bourgogne-guide-2026` | ✅ done |
| Pays de la Loire | `teletravailler-depuis-pays-de-la-loire-guide-2026` | ⬜ todo |
| Auvergne / Massif Central | `teletravailler-depuis-auvergne-guide-2026` | ⬜ todo |
| Nouvelle-Aquitaine | `teletravailler-depuis-nouvelle-aquitaine-guide-2026` | ⬜ todo |
| Île-de-France banlieue | `teletravailler-grande-couronne-ile-de-france-2026` | ⬜ todo |

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
| Culture / festivals | `meilleures-villes-culture-festivals-france-2026` | ⬜ todo |
| Zéro déchet / éco | `meilleures-villes-zero-dechet-ecologie-france-2026` | ⬜ todo |
| Animaux / pets | `meilleures-villes-animaux-chiens-france-2026` | ⬜ todo |
| Musique / scène musicale | `meilleures-villes-musique-scene-france-2026` | ⬜ todo |
| Expatriés revenant en France | `expatries-retour-france-quelle-ville-2026` | ⬜ todo |

### Budget 2026
Category `"budget"`.

| Thème | Slug | Status |
|-------|------|--------|
| Primo-accédants | `meilleures-villes-primo-accedants-france-2026` | ✅ done |
| Freelances | `meilleures-villes-freelances-independants-france-2026` | ✅ done |
| Investissement < 100k | `investissement-locatif-moins-100000-euros-france-2026` | ⬜ todo |
| Étudiant budget serré | `survivre-etudiant-province-moins-700-euros-2026` | ⬜ todo |
| Colocation jeunes actifs | `meilleures-villes-colocation-jeunes-actifs-2026` | ⬜ todo |

### Famille 2026
Category `"famille"`.

| Thème | Slug | Status |
|-------|------|--------|
| Scolarisation alternative | `villes-france-ecoles-alternatives-montessori-2026` | ⬜ todo |
| Familles expatriées retour | `familles-expatriees-retour-france-quelle-ville-2026` | ⬜ todo |
