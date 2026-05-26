# MeilleurVille — Project briefing

French city ranking & relocation guide site. 540 cities, 516 FR guides + 261 EN guides, 19 ranking
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
  use a metropolitan bounding box `lng ∈ [-6, 10]` × `lat ∈ [40, 52]`. **DROM
  cities (DOM-TOM) are filtered out** of these maps so they don't render
  off-canvas. Inset cartouches for DROM are a planned follow-up.
- "Pro" / paywall references are being removed (commit `bed2367`). If you see
  a stale Premium teaser, prefer removing it over reinforcing it.
- **setState-in-effect pattern**: initialise localStorage-backed state with lazy
  initialisers (`useState(() => readFavorites()...)`) not `useEffect`. Derive
  computed state with `useMemo` instead of effect + setState.
- **Canonicals**: every dynamic route `generateMetadata` must return
  `alternates: { canonical: "/<route>/<slug>" }`. Root layout provides the
  global default via `metadataBase`; page-level canonical overrides are needed
  for villes, classements, guides, regions, departements, comparer, quartiers, climat.
- **Score convention**: `10 = excellent` for display everywhere. Internal libs that
  use `10 = pire` (safety-deep, healthcare, employment, demography, services, env)
  must invert before displaying. Each such lib has a `**Convention**` comment block.

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

Current count: **453 guides**. Guide spec: `slug, title, metaTitle, metaDesc, category, emoji, readMinutes, publishedAt, updatedAt, intro, sections[], relatedCities[], relatedGuides[], tags[]`. All copy in **French**, direct voice, data-led. No silent fake figures.

All planned series are complete (Climat 2040 ×15, Quitter X ×18, Comparaisons A vs B ×17, Région 2026 ×16, Télétravail 2026 ×11, Lifestyle ×14, Budget ×7, Famille ×4).

**10 choses à faire à [ville] series** — new `category: "tourisme"` (`GUIDE_CATEGORIES` entry: "À faire & voir 🎯"). First batch (8 guides, Paris/Lyon/Bordeaux/Toulouse/Marseille/Nice/Nantes/Rennes) shipped. Second batch (8 guides, Strasbourg/Montpellier/Lille/Grenoble/Rouen/Dijon/Metz/Angers) shipped. Slug pattern: `10-choses-a-faire-a-[slug]-2026`. Planned next: Reims, Aix-en-Provence, Perpignan, Brest, Le Havre, Clermont-Ferrand, Tours, Orléans.

### Pending guide work
- **Editorial rewrite (R7.8)** — all 516 guides: prose/editorial voice, full sentences, light friendly tone. Keep metadata fields untouched, only `intro` and `sections[].body`. Use parallel agents, batch by series. Biggest remaining content task.

Vivre sans voiture +5, Acheter à [ville] +5, and the "Lire ensuite" reading list (via `lib/guide-suggestions.ts` + auto-block on each guide page) are shipped.

---

## Technical roadmap — pending

- [ ] **`NEXT_PUBLIC_BASE_URL`** set on Vercel to the production domain
- [ ] **`app/cgu` + `app/confidentialite`** date: bump "Dernière mise à jour" after legal review

---

## Pending work

### UX polish
- **R7.10** — Em-dash purge across body copy + meta descriptions. Cap at ~1 per 200 words, never two per sentence. Manually review per-file, don't blanket sed. **Status: not done** — 2,000+ em-dashes in `data/guides.ts` alone; needs the R7.8 editorial pass to absorb it.

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
- **R11.3 "Where people like YOU moved"** — Phase A shipped: `/portraits-types` (FR) + `/community-profiles` (EN). 6 fictional labeled archetypes with real niche scores. Phase B (post-R9.1): données réelles anonymisées. (Distinct from `/expat-retour`.)
- **R11.5 Street Reality Score** — Google Street View Static API (~$12 pour 352 villes ×5 images) + Claude Vision (`claude-haiku` pour le coût). 5 axes: végétation, propreté, densité piétonne, luminosité, état bâtiments. Résultats en `data/street-scores.json`. Env vars: `GOOGLE_STREETVIEW_KEY`, `ANTHROPIC_API_KEY`. **Not done — needs budget.**

R11.1 (`/future-you` + `lib/future-you.ts`), R11.2 (`/vibe` + `lib/vibe.ts`), R11.6 (`components/VsBattle.tsx`), R11.7 (`/copilot`) shipped.

### Vacances `/vacances` — architecture (shipped, monétisation pending)
Engines: `lib/vacation-seasons.ts` (climat 12 mois ×352), `lib/vacation-activities.ts` (10 activités), `lib/vacation-fit.ts` (score composite + helpers). 387 routes SSG.
Activation monétisation: créer compte Booking Partners → `NEXT_PUBLIC_BOOKING_AID=XXXXXXX` sur Vercel.
Phase 1.5 shipped: `lib/climate-normals.ts` + `data/climate-normals-raw.json` (29 MF stations, nearest-station snap, fallback sinusoïdale). SVG chart sur `/villes/[slug]/climat` (FR) et `/cities/[slug]/climate` (EN) via `components/ClimateChart.tsx`. Phase 3 shipped: quiz `/vacances/quiz` + email capture (Brevo list 4, `/api/vacances/newsletter`).

---

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
  `seoDescriptionEn` to the seed record. No other change required.

### EN routes shipped (as of 2026-05-21)

FR-equivalent routes covered: home, cities index + 352 city pages, 4 city sub-pages (climate/transport/schools/cost-of-living), 17 total city sub-pages, rankings index + 19 detail pages, 18 regions, all departments, quiz, compare + ~300 pairs, compare-regions (78 pairs), guides index + 6 native EN guides, map, leaderboard, about, contact, faq, methodology, legal, privacy.

### EN translation roadmap — pending

**Phase 1 — content depth**
- [x] `descriptionEn` / `seoTitleEn` / `seoDescriptionEn` — all 541 cities populated (verified 2026-05-26)
- [ ] Keep `REGION_EN_DESCRIPTIONS` and `RANKING_EN` in sync with FR changes

**Phase 2 — missing routes**
- [x] Triplet comparisons `/compare/[a]-vs-[b]-vs-[c]` (shipped via `lib/comparer-triplets.ts` + `app/[locale]/compare/[pair]/page.tsx`)

**Phase 3 — secondary surfaces** (all shipped)
- [x] `/red-flags` + `/red-flags/themes` (EN)
- [x] `/vacations` (EN port)
- [x] `/quiz/compatibility` (EN port)
- [x] `/calculator/real-cost`, `/household-cost`, `/simulator/purchase`
- [x] City sub-pages: `neighbourhoods`, `seasons`, `honest-review`, `climate-2040`, plus `fingerprint`, `vibe`, `get-settled`, `overview`, `synthesis`, `profiles`

**Phase 4 — long tail**
- [ ] EN guides — in progress (252 native EN guides shipped via `data/guides-en.ts`; not 1:1 translations, native expat-angle content)
- [ ] Per-city OG images with EN copy
- [x] EN-specific RSS feed (`/feed.xml` + `/guides/feed.xml` locale-aware via `NEXT_PUBLIC_DEFAULT_LOCALE`)

### Conventions for adding an EN route

1. Create `app/[locale]/<route>/page.tsx`. Generate static params with `{ locale: "en", ... }` only.
2. Add `metadata.alternates.canonical` pointing at `${ORIGIN_BY_LOCALE.en}/<route>`.
3. If FR and EN share a slug, ensure it is NOT in `FR_ONLY_SEGMENTS` in `proxy.ts`.
4. Add the new URL(s) to a `SITEMAP_CHUNKS_EN` chunk in `app/sitemap.ts`.
5. Keep English native, not translated-from-French. Direct, slightly dry, factual. No "discover the charming…".
