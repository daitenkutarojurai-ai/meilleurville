# MeilleurVille — Project briefing

French city ranking & relocation guide site. 352 cities, 210 guides, 13 ranking
categories, 18 regions (13 metropolitan + 5 DROM). Copy is **French**.

## Stack

- **Next.js 15** (App Router, Turbopack) + **TypeScript** (strict)
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
| ≥ 7.5  | Emerald | ~3 (0.9%)         | Exceptionnel — très rare |
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

Current count: **250 guides** (target reached). Add via the pattern in this file — each guide needs `slug, title, metaTitle, metaDesc, category, emoji, readMinutes, publishedAt, updatedAt, intro, sections[], relatedCities[], relatedGuides[], tags[]`. All copy in **French**, direct voice, data-led. No silent fake figures.

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
