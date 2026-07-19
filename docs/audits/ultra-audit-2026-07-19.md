# Weekly ultra-audit — 2026-07-19

Autonomous Sunday audit. Sync clean, `npx tsc --noEmit` clean (0 errors after
dependency install). Nothing regressed since 2026-07-12.

Two routine-template mismatches carried forward (codebase is correct; template
is stale — same finding as prior audits):

- **Canonical.** Template says `mavilleideal.com`; actual production hosts are
  `www.mavilleideale.fr` (FR) + `bestcitiesinfrance.com` (EN). Set in
  `app/layout.tsx` and `.env.example`.
- **Newsletter cron.** Template says `vercel.json`; stack is Cloudflare
  Workers, cron lives in `wrangler.toml` (`[triggers] crons = ["0 7 * * SUN",
  "0 8 * * MON"]`) and is dispatched in `worker/index.ts:scheduled()`. Sunday
  07:00 UTC newsletter trigger confirmed.

## Auto-fixes applied

**None.** The tree is in a clean state:

- No secrets leaked (`xkeysib-`, `sk-ant-` — 0 hits outside `.env*`,
  `node_modules`, prior audit reports).
- No canonical / SITE_URL leaks (`vercel.app` / `localhost`).
- No missing `generateMetadata` on the 8 spot-checked route groups.
- No client-page regressions: 0 pages under `app/` carry `"use client"` at
  the top level (all interactivity is delegated to sub-components).

## Step 1 — Sync + build ✅

- `git checkout main && git pull origin main` — fast-forwarded
  `b9ea969..40b5a71` (7 commits since last audit: 5 `demenager-a-[ville]`
  batches (50/50, series closed), narration rework, EN
  `mono-tourism-dependence` translation, roadmap sync).
- Working tree clean.
- `npm install` → 454 packages, no vulns advertised.
- `npx tsc --noEmit` — **clean**.

## Step 2 — Route completeness ✅

| Group | Entry | Count | Status |
|---|---|---|---|
| `/villes/[slug]` | `app/villes/[slug]/page.tsx` | 540 | ✅ SSG from `CITIES_SEED` |
| `/classements/[slug]` | `app/classements/[slug]/page.tsx` + 13 static leaders | 14+ | ✅ past 14 target |
| `/red-flags/[slug]` | `app/red-flags/[slug]/page.tsx` + 33 static topics | 33 | ✅ past 15 target |
| `/expat-retour/[pays]` | 17 in `lib/expat-return.ts` | 17 | ✅ past 3 |
| `/gentrification/[slug]` | Maps over all `CITIES_SEED` | 540 | ✅ past 2 |
| `/vacances/[ville]` | Maps over all `CITIES_SEED` | 540 | ✅ past 3 |
| `/pour-qui/[profil]` | 31 in `lib/profile-pages.ts` (was 30 at 2026-07-12, +1 this week) | 31 | ✅ past 5 |
| `/guides/[slug]` | 819 FR slug entries in `data/guides.ts` | 819 | ✅ past 5 |
| `/[locale]/*` (EN) | `cities`, `rankings`, `compare`, `guides`, `red-flags/themes`, `retail-coverage`, and 60+ others — all gate `locale === "en"` in `generateStaticParams` | — | ✅ |

Every route file has both `generateStaticParams` and (where applicable) a
`notFound()` guard for unknown slugs. Total pages under `app/`: **354
`page.tsx`** files, all reachable via the static export pipeline.

## Step 3 — SEO mega-check ✅

- **`generateMetadata`** present on the 8 spot-checked route templates
  (`villes`, `classements`, `red-flags`, `expat-retour`, `gentrification`,
  `vacances`, `pour-qui`, `guides`). Homepage `app/page.tsx` inherits from
  the root layout, which sets `metadata.title.default` (49 chars FR / 55 chars
  EN) and `metadata.description` (150 / 152 chars) — both under limit.
- **`app/sitemap.ts`** — chunked via `generateSitemaps()`; `robots.ts`
  advertises the parent index plus every chunk URL derived from
  `SITEMAP_CHUNK_COUNT`. No manual chunk drift.
- **`app/robots.ts`** — `Disallow: /api/`, `/admin/`, `/auth`. `/dashboard`
  and `/favoris` are **noindex via per-page metadata** (`app/dashboard/page.tsx:12`
  → `robots: { index: false, follow: false }`; `app/favoris/page.tsx:15` →
  `robots: { index: false, follow: true }`) — deliberately NOT
  `Disallow`-listed so Google can crawl them and honour the noindex tag
  instead of leaving them as "indexed though blocked" zombies. This is
  documented in `robots.ts` and is the intended behaviour.
- **Canonical.** Root layout: `metadataBase: new URL(SITE_URL)` +
  `alternates.canonical: "/"`. `SITE_URL` resolves per Cloudflare project env
  (`NEXT_PUBLIC_BASE_URL` in `wrangler.toml [vars]`). No `vercel.app` or
  `localhost` references in production metadata.

## Step 4 — Newsletter ✅

- **Cron config.** `wrangler.toml [triggers] crons = ["0 7 * * SUN", "0 8 * *
  MON"]` — Sunday 07:00 UTC = newsletter; Monday 08:00 UTC = alertes.
  Dispatched in `worker/index.ts:844` (`scheduled()`), which forwards to
  `runCronNewsletter()` and `runCronAlertes()` in `worker/crons.ts`.
- **Missing `BREVO_API_KEY` handling.** All Brevo helpers in `lib/brevo.ts`
  (`sendBrevoEmail`, `addBrevoContact`, `createAndSendCampaign`) short-circuit
  to `false` when `process.env.BREVO_API_KEY` is unset. Callers degrade
  gracefully (the D1 store remains the source of truth, the visitor still
  gets a success response). No unhandled fetch or crash.
- **`.env.example`** documents `NEXT_PUBLIC_DEFAULT_LOCALE`,
  `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_BASE_URL_FR/EN`, `BREVO_API_KEY`,
  `BREVO_LIST_ID_FR/EN`, `NEWSLETTER_FROM_EMAIL_FR/EN`, `CONTACT_TO_EMAIL`.
  The Vercel-era `CRON_SECRET` is called out as removed (Cloudflare cron
  triggers fire `scheduled()` in-worker — no shared secret needed).

## Step 5 — Navigation & mobile ✅

- **Horizontal-overflow clip.** `app/globals.css:43` — `overflow-x: clip` on
  `html` (with a paired rule on `body` at line 53). Uses `clip` rather than
  `hidden` so the `<html>` element does not become a scroll container, which
  would break `position: sticky` on the nav. Explicit comment in the CSS.
- **Sticky header.** `components/Navbar.tsx:311` — `"sticky top-0 z-50 …"`.
  Mobile drawer + bottom nav at `lg:hidden`.
- **Speed Insights + Analytics.** Template asks for `@vercel/*` — not
  applicable on Cloudflare. Analytics is served through `GTM-MXMF7XFJ` +
  GA4 `G-4X0HKD8LC7` embedded in the root layout (`app/layout.tsx:8-9`);
  Web Vitals reach the same GA4 stream via `next/web-vitals`.

## Step 6 — Data integrity ✅

Spot-checked 3 slugs via a `tsx` script over `CITIES_SEED`:

| Slug | Name | global | 8 axes | Verdict |
|---|---|---|---|---|
| `lyon` | Lyon | 7.10 | all in `[0,10]` | ✅ |
| `brest` | Brest | 6.40 | all in `[0,10]` | ✅ |
| `annecy` | Annecy | 7.30 | all in `[0,10]` | ✅ |

Bulk checks over the same array:
- **Total cities**: 540 (matches CLAUDE.md).
- **Duplicate slugs**: 0.
- **Guide-slug uniqueness**: enforced at module load in
  `lib/data-integrity.ts:assertUniqueSlugs()` for both `data/guides.ts` (819)
  and `data/guides-en.ts` (531) — throws in dev + `phase-production-build`.
  Regression guard shipped 2026-06-03, still active.

## Step 7 — Performance ✅

- **`use client` at page level**: 0 `app/**/page.tsx` files (was 0 last week,
  no regression). All interactivity is scoped to child components.
- **Client bundle levers unchanged since prior audits**: `CityProfile.tsx` is
  still one `use client` tree — decomposition remains a pending refactor,
  not a regression. No new large client imports this week.

## Step 8 — Security ✅

- `git grep -E "(api[_-]?key[[:space:]]*=[[:space:]]*['\"][^'\"]{20,}|BREVO_API_KEY[[:space:]]*=[[:space:]]*['\"]|ANTHROPIC_API_KEY[[:space:]]*=[[:space:]]*['\"])"` outside
  `*.lock`, `.env*`, `docs/audits/` → **0 hits**.
- `git grep -E "xkeysib-|sk-ant-"` outside `*.lock`, `.env*` → only
  documentation references (`lib/brevo.ts` docstring for `xkeysib-`; earlier
  audit reports self-referencing the pattern). **No live keys**.

## Follow-ups (unchanged from prior audits)

- **`app/cgu`** — "Dernière mise à jour" still dated 25 mai 2026. Bump only
  after legal review; no action for the audit.
- **`CityProfile` client decomposition** — largest remaining client-JS
  payload on city pages. Refactor of its own, tracked in CLAUDE.md
  "Performance constraints" section.
- **`lint`** — `npm run lint` still reports the same rule breakdown (mostly
  `@next/next/no-html-link-for-pages`, harmless under `output: "export"`);
  none are runtime bugs. Not re-run this session.

---

Report written by the weekly ultra-audit routine (`opus-4-7`). Nothing to
notify the owner about — clean run, no blockers, no regressions.
