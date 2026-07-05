# Weekly ultra-audit — 2026-07-05

Autonomous Sunday audit. Sync clean, `npx tsc --noEmit` clean pre- and post-fix.
Note on canonical: the audit routine template says `mavilleideal.com`; the
actual production canonical is `www.mavilleideale.fr` (FR) +
`bestcitiesinfrance.com` (EN). Codebase is correct; template is stale.

## Auto-fixes applied

1. **Removed unnecessary `"use client"` on 3 pure-JSX components** — strict
   client-bundle-size win, zero behavior change (no client-only APIs used, no
   event handlers, no hooks):
   - `components/effects/GrainOverlay.tsx` — pure SVG grain, no JS.
   - `components/effects/Marquee.tsx` — CSS animation only; importer
     `components/CityMarquee.tsx` is a server component, so the client
     boundary was gratuitous.
   - `components/effects/WordsReveal.tsx` — CSS-driven word stagger, no
     hooks, no event listeners.
   - Re-verified `npx tsc --noEmit`: still clean.

## Step 1 — Sync + build ✅

- `git checkout main && git pull origin main` — up to date.
- Working tree clean before/after.
- `npx tsc --noEmit` — clean.

## Step 2 — Route completeness ✅

| Group | Entry | Status |
|---|---|---|
| `/villes/[slug]` | `app/villes/[slug]/page.tsx` | ✅ SSG from CITIES_SEED (352 metro + DROM) |
| `/classements/[slug]` | `app/classements/[slug]/page.tsx` | ✅ from `RANKING_META` |
| `/red-flags/[slug]` | 32 subdirs incl. `[slug]` (SSG) + 30 static curated topics | ✅ well past 15 target |
| `/expat-retour/[pays]` | 17 countries in `EXPAT_COUNTRIES` (past target 3) | ✅ |
| `/gentrification/[slug]` | Maps over all `CITIES_SEED` slugs (past target 2) | ✅ |
| `/vacances/[ville]` | Maps over all `CITIES_SEED` slugs (past target 3) | ✅ |
| `/pour-qui/[profil]` | 28 entries in `PROFILE_PAGES` (past target 5) | ✅ |
| `/guides/[slug]` | 654 FR guides in `data/guides.ts` (past target 5) | ✅ |
| `/[locale]/*` (EN) | `cities`, `rankings`, `compare`, `guides` all gate `locale === "en"` in `generateStaticParams` | ✅ |

## Step 3 — SEO mega-check ✅

- **`generateMetadata`** present on every one of 342 `page.tsx` files (grep sweep, 0 misses).
- **Sitemap**: `app/sitemap.ts` chunks cover cities, sub-pages, rankings, guides, regions,
  departments, red-flags, expat-retour, gentrification, vacances, pour-qui, comparer.
  Advertised in `robots.ts` as sitemap-index + per-chunk URLs.
- **`robots.ts`**: `/api`, `/admin`, `/auth` in `disallow`; `/dashboard`, `/favoris`
  intentionally noindexed **at the page level** via `metadata.robots: { index: false }`
  (documented rationale in `robots.ts`: a top-level Disallow would create
  "indexed though blocked" zombies from external links). Verified both files
  have `robots: { index: false }`. ✅
- **Canonical origin**: root `layout.tsx` uses `metadataBase = new URL(SITE_URL)` where
  `SITE_URL` is env-driven (`NEXT_PUBLIC_BASE_URL`). Deployed values in
  `wrangler.toml` (`www.mavilleideale.fr`) and `wrangler.en.toml`
  (`bestcitiesinfrance.com`). No `vercel.app` / `localhost` leakage.
- **Title/desc length nit-picks** (Google truncates at ~60/~160):
  - `gentrification/[slug]` title exceeds 60 after interpolation (~80c).
  - `expat-retour/[pays]` description ~166c after interpolation.
  - `vacances/[ville]` description ~167c after interpolation.
  - `villes/[slug]` title ~74c after interpolation.
  Trimming needs editorial judgment — not auto-fixed. Cosmetic; SERP display
  will truncate but the metadata itself is valid.

## Step 4 — Newsletter ✅

- **Cron**: `wrangler.toml [triggers] crons = ["0 7 * * SUN", "0 8 * * MON"]`.
  Dispatched in `worker/index.ts` `scheduled()` — Sunday 07:00 UTC →
  `runCronNewsletter()`, Monday 08:00 UTC → `runCronAlertes()`. ✅
  (Repo has NO `vercel.json`; audit template's Vercel-cron check does not apply
  — this project runs on Cloudflare Workers.)
- **BREVO_API_KEY missing → graceful degradation**: `lib/brevo.ts:102-103`
  returns `{ ok: false, error: "BREVO_API_KEY not set" }`; `lib/newsletter-store.ts`
  keeps subscribers in D1 whether or not Brevo is reachable. ✅
- **`.env.example`**: comprehensive — documents `NEXT_PUBLIC_DEFAULT_LOCALE`,
  base URLs (both locales), `BREVO_API_KEY`, `BREVO_LIST_ID_FR/EN`, sender
  identity. ✅

## Step 5 — Navigation & mobile ✅

- **Mobile overflow**: `app/globals.css` sets `overflow-x: clip` on both `html`
  and `body` (line 43 + line 53), with a comment explaining why `clip` (not
  `hidden`) preserves `position: sticky`. ✅
- **Sticky header**: `components/Navbar.tsx:307` — `sticky top-0 z-50` with
  background/shadow transition. ✅
- **Speed Insights + Analytics**: this project is on **Cloudflare Workers**,
  not Vercel — the audit template's Vercel-specific imports don't apply.
  Analytics IS wired: Google GA4 + GTM in `app/layout.tsx` (script tags in
  `<head>` with Consent Mode default-denied for GDPR). Cloudflare's own
  Web Analytics is available at the platform level. No action needed.

## Step 6 — Data integrity ✅

Spot-checked scores for 3 cities:

| slug | global | life | transport | nature | cost | safety | culture | remoteWork | schools |
|---|---|---|---|---|---|---|---|---|---|
| lyon | 8.0 | 8.1 | 8.4 | 7.0 | 6.3 | 7.2 | 8.9 | 8.2 | 8.2 |
| marseille | 7.0 | 7.2 | 7.5 | 7.8 | 6.8 | 5.9 | 7.6 | 7.0 | 6.5 |
| nice | 7.8 | 8.0 | 7.0 | 8.6 | 5.8 | 7.0 | 8.1 | 7.2 | 7.3 |

All 27 values numeric, all in [0, 10]. ✅

## Step 7 — Performance

- **`use client` audit**: 6 flagged as unnecessary; 3 clearly-safe auto-fixed
  above (GrainOverlay, Marquee, WordsReveal). The remaining 3 are judgment
  calls, left alone:
  - `components/effects/ScrollReveal.tsx` — imports `framer-motion` +
    `useReducedMotion` (hook). Client boundary is correct.
  - `components/ui/Button.tsx` — uses `forwardRef` and spreads
    `ButtonHTMLAttributes` including potential `onClick`. Safer as client so
    any importer can pass event handlers without a boundary change.
  - `app/comparer/[pair]/TripletRadar.tsx` — imports `recharts` which needs
    the browser DOM. Correct as client.
- **Lazy-load candidates**: no obvious wins. `framer-motion` is used only inside
  `ScrollReveal` which is already a boundary. `recharts` is boundary-isolated
  in `TripletRadar` (only loaded on comparer/[pair] triplet views).

## Step 8 — Security ✅

- `git grep -E -n "(api[_-]?key\s*=\s*['\"][^'\"]{20,}|BREVO_API_KEY\s*=\s*['\"])"`:
  **0 hits.**
- `git grep -n "xkeysib-[a-zA-Z0-9]"` (Brevo v3 key prefix): **0 hits.**
- Broad sweep for `sk_live_*`, `pk_live_*`, SendGrid, AWS keys: **0 hits.**
- No hardcoded secrets in the tree.

## Step 9 — Report

This file. Committing and pushing to `main`.

## Follow-ups (not urgent)

1. Trim template lengths for `gentrification/[slug]` title, `expat-retour/[pays]`
   description, `vacances/[ville]` description, `villes/[slug]` title so they
   stay under Google's SERP truncation thresholds. Editorial task.
2. Update the audit routine's canonical target (`mavilleideal.com`) to the
   real domains (`www.mavilleideale.fr` + `bestcitiesinfrance.com`) — the
   template drifted.
3. Audit routine mentions `vercel.json` and Vercel Speed Insights; project runs
   on Cloudflare Workers, so those items are permanently N/A. Update template.
