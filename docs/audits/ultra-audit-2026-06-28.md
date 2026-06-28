# Ultra-audit — 2026-06-28 (Sunday)

Weekly scheduled audit. Auto-fix what is safe; report the rest.

## TL;DR

Repository is healthy. `tsc --noEmit` is **clean** (0 errors). All audited
route groups have populated `generateStaticParams`. Robots/sitemap/canonical
correctly wired across both locales. Newsletter cron + Brevo fallback intact.
No secrets in tracked source. **No code changes required this run.**

## Step 1 — Sync + build

- `git pull origin main`: local branch had drifted (a previous run left a
  detached HEAD that had since been force-replaced by origin). Reset
  `main` to `origin/main` (no local commits lost — the abandoned tip was
  the prior session's WIP, already superseded by `445d01a`).
- `npm install`: fresh dependency tree restored (441 packages).
- `npx tsc --noEmit`: **clean, 0 errors**. (First run failed only because
  `node_modules/` was missing — resolved after install; expected behavior
  for a freshly-cloned ephemeral container.)

## Step 2 — Route completeness

All audited route groups are populated by their respective seed/list module:

| Route group | Source | Count / note |
|---|---|---|
| `/villes/[slug]` | `CITIES_SEED` | 540 cities |
| `/classements/[slug]` | `RANKING_META` | 14 ranking categories present as static dirs (+ `[slug]` dynamic) |
| `/red-flags/[slug]` | RED_FLAG list | 8+ static + `[slug]` dynamic |
| `/expat-retour/[pays]` | `EXPAT_COUNTRIES` | 17 countries (well above the 3-country bar) |
| `/gentrification/[slug]` | `CITIES_SEED` | All 540 cities (well above the 2-neighborhood bar) |
| `/vacances/[ville]` | `CITIES_SEED` | All 540 cities |
| `/pour-qui/[profil]` | `PROFILE_PAGES` | 29 profiles |
| `/guides/[slug]` | `GUIDES` | ~657 FR guides |
| `/[locale]/...` (EN) | parallel `app/[locale]/...` tree | ~35 city sub-page kinds + full EN parity for cities/rankings/compare/guides |

No missing route groups detected.

## Step 3 — SEO mega-check

- **`generateMetadata()`**: present on city profile + every sub-page; each
  returns route-specific `title`, `description`, and `alternates.canonical`.
- **Title length**: the city-page title template
  `"{name} · Avis habitants, qualité de vie & classements 2026"` is 51 chars
  for "Paris" but **76 chars for "Charleville-Mézières"** (longest city
  name). This is a structural template choice (consistent across all 540
  city pages, not a regression introduced this week) — left as-is.
  Trimming would require a coordinated rewrite across 540 titles + every
  city sub-page that mirrors the same suffix; not in scope for an audit
  pass.
- **Sitemap** (`app/sitemap.ts`): emits chunked sitemaps per locale, covers
  static / guides / cities / city-sub / comparer / classements / regions /
  departements / tags / red-flags / calculator / gentrification / quitter /
  cout-menage / vacances (FR), and the EN equivalents. Honest
  per-family `lastModified`.
- **Robots** (`app/robots.ts`): `/api/`, `/admin/`, `/auth` disallowed;
  dashboard/favoris use page-level `robots: { index: false }` (correct —
  `disallow` would prevent crawl-and-read of the noindex tag and create
  zombie entries). Sitemap index + per-chunk URLs advertised.
- **Canonical**: `metadataBase` resolves to
  `https://www.mavilleideale.fr` (FR build) or
  `https://bestcitiesinfrance.com` (EN build) via
  `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_DEFAULT_LOCALE`. No `vercel.app`
  or `localhost` references in metadata. Cross-locale hreflang shipped
  on city pages.

## Step 4 — Newsletter + env

- **Cron config**: the audit script asks for `vercel.json`, but hosting
  moved to Cloudflare Workers (Static Assets). Cron lives in
  `wrangler.toml`:

  ```toml
  [triggers]
  crons = ["0 7 * * SUN", "0 8 * * MON"]
  ```

  Sunday 07:00 UTC dispatches `runCronNewsletter` (Brevo). Monday 08:00 UTC
  dispatches `runCronAlertes`. (The audit prompt's `vercel.json` reference
  is stale — should be retired or rewritten against `wrangler.toml`.)
- **Graceful BREVO fallback**: `lib/brevo.ts` returns `false` /
  `{ ok: false, error: "BREVO_API_KEY not set" }` when the secret is
  missing. No throws, no 500s.
- **`.env.example`**: documents every required var
  (`NEXT_PUBLIC_DEFAULT_LOCALE`, `NEXT_PUBLIC_BASE_URL`,
  `BREVO_API_KEY`, `BREVO_LIST_ID_FR/EN`, `AUTH_SECRET`,
  `ANTHROPIC_API_KEY`, contact + booking + social vars).

## Step 5 — Nav, mobile, analytics

- **Mobile horizontal overflow**: `app/globals.css` sets
  `overflow-x: clip` on both `html` and `body` (line 43, 53) — keeps
  sticky working while clipping accidental overflow. Correct.
- **Sticky header**: `Navbar` lives outside any `transform`/`overflow`
  ancestor; sticky behavior confirmed by the explicit `overflow-x: clip`
  (not `hidden`) choice with the comment explaining why.
- **Analytics**: GA4 (`G-4X0HKD8LC7`) + GTM (`GTM-MXMF7XFJ`) loaded in
  `app/layout.tsx` with consent-mode default. Vercel Speed Insights /
  Analytics not applicable (Cloudflare host).

## Step 6 — Data integrity

Spot-checked Paris, Lyon, Marseille via `npx tsx`:

```
paris g: 5.1 ok: true
lyon  g: 7.1 ok: true
marseille g: 3.8 ok: true
total: 540
```

All scores numeric, in `[0, 10]`.

## Step 7 — Performance

- **Server vs client**: no `page.tsx` in the entire `app/` tree opens
  with `"use client"`. All pages are server components by default; client
  interactivity is isolated to specific components (filters, maps, tabs).
- **Large imports**: no new heavy imports introduced this week (week diff
  is 8 commits, all content/feature additions with their own bounded
  bundles).

## Step 8 — Security

- `git grep -nE "(api[_-]?key\\s*=\\s*['\\\"][^'\\\"]{20,}|BREVO_API_KEY\\s*=\\s*['\\\"])"`:
  **0 hits in tracked source** (one match in a prior audit doc, quoting
  the regex itself — not a leak).
- `npm audit`: 9 advisories (2 low / 3 moderate / 4 high), all in
  **dev-time / build-time** dependencies (`esbuild`, `miniflare`,
  `undici` via `wrangler`, `ws`). None reach production-served code
  (the Worker runtime ships its own `undici`). Fix available via
  `npm audit fix` — left for a future maintenance commit to avoid
  unrelated breakage in this audit run.

## Step 9 — Diff context

8 commits since 2026-06-21 (previous weekly):
- 1 audit doc, 7 content/feature additions (internet hubs FR + EN,
  3 red-flag pages, 1 expat-return country, 2 `pour-qui` profiles).
- No infrastructure churn.

## Verdict

**Healthy — no auto-fix required this week.** The single advisory worth
queueing is the `npm audit fix` on dev dependencies, and the audit script
itself should be rewritten against Cloudflare/`wrangler.toml` (its
`vercel.json` lookup has been stale since the migration).
