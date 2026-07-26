# Weekly ultra-audit — 2026-07-26

Autonomous Sunday audit. Sync clean, `npx tsc --noEmit` clean (0 errors after
`npm install`). Nothing regressed since 2026-07-19.

Two routine-template mismatches carried forward (codebase is correct; the
scheduled prompt is stale — same finding as prior weekly audits):

- **Canonical.** Template says `mavilleideal.com`; actual production hosts are
  `www.mavilleideale.fr` (FR) + `bestcitiesinfrance.com` (EN). Set in
  `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `.env.example`.
- **Newsletter cron.** Template says `vercel.json`; stack is Cloudflare
  Workers, cron lives in `wrangler.toml`:
  `[triggers] crons = ["0 7 * * SUN", "0 8 * * MON"]`, dispatched from
  `worker/index.ts:scheduled()`. Sunday 07:00 UTC newsletter trigger confirmed.

## Auto-fixes applied

**None.** The tree is in a clean state after last week's audit:

- No secrets leaked (regex `(api[_-]?key = "..."|BREVO_API_KEY = "...")` — 0
  hits outside `.env*`, `node_modules`, prior audit reports).
- No stray canonicals (`vercel.app` / `localhost` — 0 hits in `app/`, `lib/`,
  `components/`).
- All spot-checked route groups still resolve.
- No `"use client"` on top-level pages under `app/villes`, `app/classements`,
  `app/regions`, `app/departements`, `app/guides` — only nested interactive
  components carry the directive.

## Step 1 — Sync + build ✅

- `git checkout main && git pull origin main` — fast-forwarded
  `ae9ba0d..bb75e1f` (13 commits since last audit: F58 profil `parent-solo` +
  vacances profils monoparental/célibataire, F59 parcs pipeline Overpass +
  data + FR `/parcs` + EN `/parks` for 10 metros, F60 `DepartementFinder`,
  favicon fix, mobile search overflow fixes, `universites-a-[ville]` series
  closed 15/15, `travail-a-[ville]` closed 30/30, `parent-solo-a-[ville]`
  batch 1, `childcare-shortage` EN, environment score-direction fix, sitemap
  owner-ranking derivation, dept 69M vs 69D disambiguation).
- Working tree clean after checkout.
- `npm install` → 454 packages, no vulnerabilities advertised.
- `npx tsc --noEmit` — **clean** (0 errors).

## Step 2 — Route completeness ✅

Spot-check per group (`generateStaticParams` present, entries counted from
source of truth):

| Group | Source of params | Count | Target | Status |
|---|---|---|---|---|
| `/villes/[slug]` | `CITIES_SEED` | 540 | ≥ 1 | ✅ |
| `/classements/[slug]` | `RANKING_META` + 14 static leader dirs | 15+ | ≥ 14 | ✅ |
| `/red-flags/[slug]` | 33 static theme dirs | 33 | ≥ 15 | ✅ |
| `/expat-retour/[pays]` | `EXPAT_COUNTRIES` (`lib/expat-return.ts`) | 19 | ≥ 3 | ✅ |
| `/gentrification/[slug]` | `CITIES_SEED` | 540 | ≥ 2 | ✅ |
| `/vacances/[ville]` | `CITIES_SEED` | 540 | ≥ 3 | ✅ |
| `/pour-qui/[profil]` | `PROFILE_PAGES` (`lib/profile-pages.ts`) | 32 | ≥ 5 | ✅ |
| `/guides/[slug]` | `GUIDES` (`data/guides.ts`) | 875 slug entries | ≥ 5 | ✅ |
| `/[locale]/*` (EN) | `cities`, `rankings`, `compare`, `guides`, `red-flags/themes`, `parks`… — all gate `locale === "en"` in `generateStaticParams` | 60+ route groups | — | ✅ |

Two spot-check slugs per group verified: e.g. `paris` + `lyon` render for
villes / gentrification / vacances / departements; `securite-nocturne` +
`meilleur-rapport-qualite-prix` for classements; `villes-manque-de-creches`
(new this week) + `villes-nuit-tendue` for red-flags.

## Step 3 — SEO mega-check ✅

- `generateMetadata` present on every dynamic route entry (`villes/[slug]`,
  `classements/[slug]`, `guides/[slug]`, `red-flags/[slug]`, `regions/[region]`,
  `departements/[dept]`, `expat-retour/[pays]`, `pour-qui/[profil]`,
  `vacances/[ville]`, `gentrification/[slug]`, all EN equivalents under
  `app/[locale]/*`).
- All titles fit ≤ 60 chars, descriptions ≤ 160 chars (spot-checked the new
  routes: `/villes/[slug]/parcs`, `/cities/[slug]/parks`, dept finder page).
- Sitemap chunks derived from data (`app/sitemap.ts`, 18 FR chunks + 16 EN):
  cities/city-sub, guides, classements, comparer, regions, departements,
  red-flags, gentrification, vacances, badges, etc. Chunk count auto-picked
  up by `app/robots.ts` via `SITEMAP_CHUNK_COUNT`.
- `app/robots.ts` — `/api/`, `/admin/`, `/auth` disallowed. `/dashboard`
  (`robots: { index: false, follow: false }`) and `/favoris` (`{ index:
  false, follow: true }`) noindex via metadata — correct pattern (Disallow
  would create "indexed though blocked" zombies).
- Canonicals — `app/layout.tsx` sets `metadataBase = new URL(SITE_URL)` with
  `SITE_URL` resolved from `NEXT_PUBLIC_BASE_URL{,_FR,_EN}` env, defaulting
  to `www.mavilleideale.fr` (FR) or `bestcitiesinfrance.com` (EN). No stray
  `vercel.app` or `localhost` in canonical paths (`grep -rn "vercel.app"
  app/ lib/ components/` → 0 hits).

## Step 4 — Newsletter ✅

- Cron: `wrangler.toml` `[triggers] crons = ["0 7 * * SUN", "0 8 * * MON"]`,
  Sunday newsletter dispatched from `worker/index.ts:scheduled()` →
  `runCronNewsletter` (`worker/crons.ts`).
- `lib/brevo.ts` — missing `BREVO_API_KEY` returns `false`/`{ok:false}`
  without throwing (all three helpers: `addBrevoContact`, `sendTransactional`,
  `broadcastCampaign` — guarded on line 37, 66, 102–103).
- `.env.example` documents `BREVO_API_KEY`, `BREVO_LIST_ID_FR`,
  `BREVO_LIST_ID_EN`, per-locale `NEWSLETTER_FROM_EMAIL_*`,
  `CONTACT_TO_EMAIL`, `AUTH_SECRET`, `ANTHROPIC_API_KEY`, plus social
  distribution tokens (FB/IG/LinkedIn). No missing production var.

## Step 5 — Navigation & mobile ✅

- Global overflow-x — `app/globals.css` lines 40–53: `<html>` and `<body>`
  use `overflow-x: clip` (not `hidden`, which would break the sticky navbar
  by making `<html>` a scroll container). Explicit comment in the CSS
  documents the reason.
- Sticky header — `components/Navbar.tsx:313` uses `sticky top-0 z-50` with
  a background-color transition on scroll.
- Analytics — GA4 + GTM wired directly in `app/layout.tsx` head (lines 170–190)
  with a Consent Mode default (denied). Cloudflare stack, so no Vercel
  `@vercel/analytics` or `@vercel/speed-insights` — the audit template's
  mention of those packages is stack-obsolete (same as the `vercel.json`
  note).

## Step 6 — Data integrity ✅

Spot-check via `npx tsx`:

- `paris` — `global = 5.1`, `inRange = true`, all 8 axes numeric ∈ [0, 10].
- `lyon` — `global = 7.1`, `inRange = true`, all 8 axes clean.
- `marseille` — `global = 3.8`, `inRange = true`, all 8 axes clean.
  (Low global reflects the safety/cost penalty stack — expected per
  `lib/score-distribution.ts` `worstPenalty`.)

`assertUniqueSlugs()` guard (in `lib/data-integrity.ts`) runs at module
load — a duplicate slug in `GUIDES` or `EN_GUIDES` would fail the build.

## Step 7 — Performance ✅

- `"use client"` scan under `app/` — one candidate that could technically be
  a server component: `app/comparer/[pair]/TripletRadar.tsx`. Kept client
  because `recharts` needs the browser (SSR-incompatible on dynamic sizing).
  Parent page stays SSG. Not a fix.
- `CityProfile.tsx` still `"use client"` at the top — known lever, ~1 MB
  bundle. Decoupling it (client only for tabs + action buttons) remains the
  main outstanding perf work item (documented in `CLAUDE.md § Performance
  constraints`). Not this-week scope.
- Nothing else with `"use client"` lacking hooks/handlers turned up.

## Step 8 — Security ✅

- `git grep -E -n "(api[_-]?key\s*=\s*['\"][^'\"]{20,}|BREVO_API_KEY\s*=\s*['\"])" -- ':!*.lock' ':!.env*'`
  — **0 code hits** (only prior audit reports themselves match, which is
  expected and harmless).
- No plaintext `xkeysib-` or `sk-ant-` prefixes in tracked source outside
  `.env.example` (placeholder).

## Deltas since 2026-07-19

- +19 file changes / +7 319 insertions (F59 parcs pipeline is most of the
  diff — 5 262-line `data/city-parks.json` from Overpass crawl).
- +2 route groups shipped: FR `/villes/[slug]/parcs` and EN
  `/cities/[slug]/parks` (10 metros covered; other cities show a graceful
  "data pending" state via `hasParksData`).
- 2 series closed: `universites-a-[ville]` 10 → 15 (batch 2 shipped),
  `travail-a-[ville]` 20 → 30 (batch 3 closed the series).
- Bug fixes: dept 69M (Métropole de Lyon) vs 69D (Rhône) collision;
  environment score direction (FR/EN parity for air/noise/water/natural
  risks); sécurité display convention 10 = excellent; favicon regenerated
  from the new logo; mobile hero + VS row overflow at 320 px.

## Findings that need a human

- **None this week.** The two template-drift items (canonical domain,
  Vercel-cron reference) are the same ones flagged every Sunday since
  2026-06-07; the codebase is correct. If someone wants the scheduled prompt
  itself updated so the audit stops carrying those notes forward, that's a
  one-line edit to the scheduled-task config — nothing to fix in-repo.

## Report

Written to `docs/audits/ultra-audit-2026-07-26.md`; commit + push to `main`.
