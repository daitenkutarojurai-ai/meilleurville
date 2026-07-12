# Weekly ultra-audit — 2026-07-12

Autonomous Sunday audit. Sync clean, `npx tsc --noEmit` clean (0 errors after
dependency install). Nothing regressed since 2026-07-05.

Note on canonical: the audit routine template still says `mavilleideal.com`;
the actual production canonicals are `www.mavilleideale.fr` (FR) +
`bestcitiesinfrance.com` (EN). Codebase is correct; template is stale (same
finding as prior audits — carried forward, not re-diagnosed).

## Auto-fixes applied

**None.** The tree is in a clean state:

- No new `use client` regressions vs. the 2026-07-05 audit (23 app + 55
  components, all with genuine interactivity).
- No secrets in the tree.
- No canonical / SITE_URL leaks (`vercel.app` / `localhost`).
- No missing `generateMetadata` on the 8 spot-checked route groups.

## Step 1 — Sync + build ✅

- `git checkout main && git pull origin main` — fast-forwarded 8563f33..43c1e32
  (13 commits since last audit: EN theft-burglary translation, `pour-qui/mobilite-reduite`,
  32nd red-flag `villes-manque-de-verdure`, badge subsystem, several
  narration re-writes).
- Working tree clean.
- `npm install` → 441 packages, no vulns advertised.
- `npx tsc --noEmit` — **clean**.

## Step 2 — Route completeness ✅

| Group | Entry | Count | Status |
|---|---|---|---|
| `/villes/[slug]` | `app/villes/[slug]/page.tsx` | 540 | ✅ SSG from `CITIES_SEED` |
| `/classements/[slug]` | `app/classements/[slug]/page.tsx` + 13 static leaders | 14+ | ✅ |
| `/red-flags/[slug]` | `app/red-flags/[slug]/page.tsx` + 32 static topics | 32 | ✅ past 15 target |
| `/expat-retour/[pays]` | 17 in `EXPAT_COUNTRIES` | 17 | ✅ past 3 |
| `/gentrification/[slug]` | Maps over all `CITIES_SEED` | 540 | ✅ past 2 |
| `/vacances/[ville]` | Maps over all `CITIES_SEED` | 540 | ✅ past 3 |
| `/pour-qui/[profil]` | 30 in `PROFILE_PAGES` (was 28 at 2026-07-05, +2 this week) | 30 | ✅ past 5 |
| `/guides/[slug]` | 654 FR guides in `data/guides.ts` | 654 | ✅ past 5 |
| `/[locale]/*` (EN) | `cities`, `rankings`, `compare`, `guides`, `red-flags/themes`, `retail-coverage` — all gate `locale === "en"` in `generateStaticParams` | — | ✅ |

Every route file has both `generateStaticParams` and `notFound()` guards.

## Step 3 — SEO mega-check ✅

- **`generateMetadata`** present on the 8 spot-checked route templates
  (`villes`, `classements`, `red-flags`, `expat-retour`, `gentrification`,
  `vacances`, `pour-qui`, `guides`). Every dynamic route has
  `alternates.canonical` returning a path.
- **Sitemap**: `app/sitemap.ts` chunks include `static, guides, cities,
  city-sub, comparer, comparer-regions, comparer-departements, classements,
  regions, departements, tags, red-flags, calculator, gentrification, quitter,
  cout-menage, vacances, badges` (badge chunk added since last audit — R13.1).
  `SITEMAP_CHUNK_COUNT` is exported and consumed by `robots.ts` so new chunks
  auto-advertise.
- **`robots.ts`**: `/api/`, `/admin/`, `/auth` disallow. `/dashboard` +
  `/favoris` intentionally noindexed at the **page level** via
  `metadata.robots.index: false` (verified: both files carry it), because a
  top-level Disallow would create "indexed though blocked" zombies from
  external links (documented in `robots.ts`).
- **Canonical origin**: `metadataBase: new URL(SITE_URL)` in `app/layout.tsx`
  where `SITE_URL` derives from env (`NEXT_PUBLIC_BASE_URL`), with FR/EN
  fallbacks. `wrangler.toml` sets `www.mavilleideale.fr`; `wrangler.en.toml`
  sets `bestcitiesinfrance.com`. **No `vercel.app` / `localhost` leakage** —
  `grep app -rE 'vercel\.app|localhost:3000'` returns 0 hits.
- **Title/desc length**: soft SERP-truncation nits carried over from prior
  audits (`gentrification/[slug]` title ~80c, `expat-retour/[pays]` desc ~166c,
  `vacances/[ville]` desc ~167c, `villes/[slug]` title ~74c). Metadata is
  valid; SERP display truncates — cosmetic, editorial task.
- **Guide metaDesc lengths**: single-line grep of `data/guides.ts` shows 213
  of ~490 single-line metaDescs above 160 chars. Same soft-nit pattern —
  editorial trim, not a bug.

## Step 4 — Newsletter ✅

- **Cron**: `wrangler.toml [triggers] crons = ["0 7 * * SUN", "0 8 * * MON"]`
  dispatched in `worker/index.ts` `scheduled()` — Sunday 07:00 UTC →
  `runCronNewsletter()`, Monday 08:00 UTC → `runCronAlertes()`. ✅
  (Project runs on **Cloudflare Workers**, no `vercel.json`. Audit template's
  Vercel-cron check does not apply — carried forward.)
- **BREVO_API_KEY missing → graceful**: `lib/brevo.ts:37-38` returns `false`
  from `sendBrevoEmail` when key missing; `lib/brevo.ts:102-103` returns
  `{ ok: false, error: "BREVO_API_KEY not set" }` from `subscribeContact`.
  `lib/newsletter-store.ts` keeps rows in D1 regardless. ✅
- **`.env.example`**: documents `NEXT_PUBLIC_DEFAULT_LOCALE`, both base URLs,
  `BREVO_API_KEY`, `BREVO_LIST_ID_FR/EN`, sender identity. ✅

## Step 5 — Navigation & mobile ✅

- **Mobile overflow**: `app/globals.css` line 43 + line 53 — `overflow-x: clip`
  on `<html>` and `<body>`, with a comment explaining `clip` (not `hidden`)
  preserves `position: sticky`. ✅
- **Sticky header**: `components/Navbar.tsx:307` — `sticky top-0 z-50` with
  background/shadow transition. ✅
- **Speed Insights + Analytics**: N/A. Project on Cloudflare (no
  `@vercel/analytics` or `@vercel/speed-insights`). GA4 + GTM script tags live
  in `app/layout.tsx` with Consent Mode default-denied. Cloudflare Web
  Analytics is available platform-side. Audit template drift — no action.

## Step 6 — Data integrity ✅

Programmatically loaded `CITIES_SEED` and validated `scores` for 5 random
slugs (paris, lyon, marseille, nantes, montpellier): 45 score values
verified — all numeric, all in `[0, 10]`. `CITIES_SEED.length === 540` as
expected. ✅

## Step 7 — Performance ✅

- **`use client` audit**: 23 in `app/` + 55 in `components/` = 78 total. All
  23 app-level entries have genuine interactivity (`ContactForm`,
  `CityMatchQuiz`, `CarteClient`, `FavoritesGrid`, `error.tsx` /
  `global-error.tsx`, etc.). No pure-JSX misclassifications found (previous
  3 easy wins — `GrainOverlay`, `Marquee`, `WordsReveal` — were converted at
  2026-07-05 and remain server-side).
- **Lazy-load candidates**: none new. `framer-motion` still boundary-isolated
  in `ScrollReveal`; `recharts` still boundary-isolated in
  `app/comparer/[pair]/TripletRadar.tsx`.

## Step 8 — Security ✅

- `git grep -E "(api[_-]?key\s*=\s*['\"][^'\"]{20,}|BREVO_API_KEY\s*=\s*['\"])" -- ':!*.lock' ':!.env*'`:
  **0 hits** in actual code (1 hit in a prior audit report meta-referencing
  the grep pattern itself — harmless).
- Broad sweep for Brevo v3 key prefix `xkeysib-*` in source: no matches.
- No hardcoded secrets.

## Step 9 — Report

This file. Committing and pushing to `main`.

## Follow-ups (carried forward — none urgent)

1. Trim SERP-truncated title/desc templates (`gentrification/[slug]`,
   `expat-retour/[pays]`, `vacances/[ville]`, `villes/[slug]`). Editorial.
2. Update the audit routine template's canonical (`mavilleideal.com` →
   `www.mavilleideale.fr` + `bestcitiesinfrance.com`), Vercel references
   (project is on Cloudflare), and `vercel.json` check (there is no
   `vercel.json`). Not code — routine spec only.
3. Guide `metaDesc` cluster > 160c: routine editorial trim pass, not a bug.
