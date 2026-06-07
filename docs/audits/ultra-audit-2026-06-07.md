# Weekly Ultra-Audit — 2026-06-07

**Auditor:** scheduled-agent (autonomous, Sunday)
**Stack:** Next.js 16.2.4 (App Router, Turbopack) · Cloudflare Workers + D1 · Tailwind v4
**Commit baseline:** `3d90a68` (main, fresh pull, clean working tree before edits)

> NB: the audit playbook references Vercel + `vercel.json` in places. This repo
> moved to Cloudflare (`wrangler.toml`, Workers Static Assets, D1, native cron
> triggers) per `CLAUDE.md` — the Vercel-shaped checks are translated to their
> Cloudflare equivalents below.

---

## Step 1 — Sync + build

- `git checkout main && git pull origin main` → fast-forwarded 6 commits (`3ead3eb..3d90a68`). Working tree clean before audit.
- `npm install` → 453 packages, no audit issues.
- `npx tsc --noEmit` → **0 errors** (clean strict pass).

## Step 2 — Route completeness

Spot-checks confirmed real pages render for every route group; counts derived from the codebase, not the briefing.

| Group | Page entry | Coverage |
|---|---|---|
| `/villes/[slug]` | `app/villes/[slug]/page.tsx` | 540 cities (`CITIES_SEED`) + 33 sub-pages each (quartiers, climat, climat-2040, transports, sport, vibe, empreinte, s-installer, agenda, profils, etc.) |
| `/classements/[slug]` | `app/classements/[slug]/page.tsx` | 19 ranking categories (covers the briefing's ≥14) |
| `/red-flags/[slug]` | `app/red-flags/[slug]/page.tsx` + 21 sibling theme pages | 21 themes (covers the briefing's ≥15) — new `villes-vols-cambriolages` + `villes-sans-enseignement-superieur` shipped this week |
| `/expat-retour/[pays]` | `app/expat-retour/[pays]/page.tsx` | 11 countries (`lib/expat-return.ts`) — `depuis-italie` shipped this week |
| `/gentrification/[slug]` | `app/gentrification/[slug]/page.tsx` | 540 cities (all) — `generateStaticParams` iterates `CITIES_SEED` |
| `/vacances/[ville]` | `app/vacances/[ville]/page.tsx` | 540 cities + month/profil/activite/region facets |
| `/pour-qui/[profil]` | `app/pour-qui/[profil]/page.tsx` | 18 profiles (`lib/profile-pages.ts`) |
| `/guides/[slug]` | `app/guides/[slug]/page.tsx` | 655 FR guides (`data/guides.ts`) |
| `/[locale]/cities/[slug]` etc. | `app/[locale]/cities/[slug]/page.tsx` | EN tree: 540 cities + 17 sub-pages, 19 rankings, 18 regions, 532 EN guides, compare/compare-regions, weekend-getaways, sport, rental-tension, political-leaning, tags |

**All groups pass.** No dead routes spotted.

## Step 3 — SEO mega-check

- **`generateMetadata` coverage** — every audited `[param]/page.tsx` entry has it (verified: villes, classements, guides, regions, gentrification, expat-retour, red-flags, pour-qui, vacances). Every dynamic route declares `alternates.canonical` as required by CLAUDE.md.
- **Title/description length** — root layout caps with `template: "%s | MaVilleIdeal"` (16 char suffix); leaf titles seen during the spot-check are ≤60 char headers + the suffix. No widespread overflow.
- **Sitemap coverage** — `app/sitemap.ts` chunks include every major content family: `static`, `guides`, `cities`, `city-sub`, `comparer`, `comparer-regions`, `classements`, `regions`, `departements`, `tags`, `red-flags`, `calculator`, `gentrification`, `vacances` (+ EN mirror chunks `en-*`). New ones from the week (`villes-vols-cambriolages`, `villes-sans-enseignement-superieur`, `depuis-italie`, FR/EN `synthesis`) are present in the sitemap diff.
- **`robots.ts`** — disallows `/api/`, `/admin/`, `/favoris`, `/dashboard`, `/mes-villes`, `/connexion`, `/auth`. Covers the briefing's `/dashboard` + `/favoris` requirement. Advertises sitemap-index + every per-chunk URL.
- **Canonical host** — every default URL resolves to `https://www.mavilleideale.fr` (FR) or `https://bestcitiesinfrance.com` (EN). No `vercel.app` / `localhost` leakage in `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`. Worker enforces apex→www (FR) and www→apex (EN) at the edge with 301s.

## Step 4 — Newsletter

- **Cron config** — `wrangler.toml` declares `crons = ["0 7 * * SUN", "0 8 * * MON"]`. `worker/index.ts:scheduled()` dispatches `0 7 * * SUN` → `runCronNewsletter()` (Sunday 07:00 UTC ✅).
- **BREVO missing key** — `lib/brevo.ts` returns `false` (transactional) or `{ ok:false, error:"BREVO_API_KEY not set" }` (campaign) when the key is unset. `worker/crons.ts:runCronNewsletter` then no-ops gracefully. ✅
- **`.env.example`** — documented `BREVO_API_KEY`, `BREVO_LIST_ID_FR/EN`, `NEWSLETTER_FROM_EMAIL_FR/EN`. **Auto-fix applied** (see below).

## Step 5 — Navigation & mobile

- **Horizontal overflow** — `app/globals.css` sets `overflow-x: clip` on both `html` and `body` (the clip rule, not `hidden`, so `position: sticky` still works — explicitly commented).
- **Sticky header** — `components/Navbar.tsx:307` carries `sticky top-0 z-50` + animated background/box-shadow transition. Verified visually stays put during scroll on FR + EN trees.
- **Analytics** — the briefing's "Speed Insights + Analytics" line is a Vercel-era check. This repo runs Cloudflare and emits a consent-aware GTM container (`GTM-MXMF7XFJ`) + GA4 (`G-4X0HKD8LC7`) in `app/layout.tsx` with default-denied consent and a `CookieConsent` flip. No `@vercel/*` analytics packages imported (correct — the repo isn't on Vercel).

## Step 6 — Data integrity

Spot-checked `lyon`, `rennes`, `marseille`:

| Slug | Global | All axes numeric & ∈ [0,10]? |
|---|---|---|
| `lyon` | 7.1 | ✅ |
| `rennes` | 7.4 | ✅ |
| `marseille` | 3.8 | ✅ |

`CITIES_SEED.length === 540`. `lib/data-integrity.ts` enforces `assertUniqueSlugs` over `guides.slug` and `guides-en.slug` at module load (dev + `phase-production-build`) — duplicate-slug regressions are blocked at build.

## Step 7 — Performance

- **Server vs client components** — `app/villes/[slug]/page.tsx`, `app/classements/[slug]/page.tsx`, `app/guides/[slug]/page.tsx`, `app/page.tsx` are all server components (no `"use client"` directive). Pattern: leaf page entries stay server; tabs/maps/filters are extracted into client components only where interactivity demands. No misplaced `"use client"` found in the audited routes.
- **Lazy loading** — heavy interactive surfaces (carte, FranceHeatmap, copilot, future-you) are isolated under their own routes; the homepage hero/SectionNav/TopFive flow ships only the components actually needed for the fold. No oversized eager imports flagged.

## Step 8 — Security

- `git grep -E -nI "(api[_-]?key\s*=\s*['\"][^'\"]{20,}|BREVO_API_KEY\s*=\s*['\"])" -- ':!*.lock' ':!.env*'` → **0 hits** (only prior audit reports match the regex itself).
- Extra scan for real key shapes (`xkeysib-…`, `sk-ant-api…`) outside `node_modules` and `docs/audits/` → **0 hits**.
- Secrets surface (`BREVO_API_KEY`, `ANTHROPIC_API_KEY`, `AUTH_SECRET`) is documented in `.env.example` with strict guidance ("set with `wrangler secret put`"), never inlined.
- `AUTH_SECRET` is required for `/api/auth/*` (worker returns 503 if missing) — no silent fallback.

## Auto-fixes applied this run

1. **`.env.example` — stale Vercel references removed.** The project has been on Cloudflare since the `vercel.json → wrangler.toml` migration, but `.env.example` still referenced Vercel for deployment ("configure on Vercel for prod", "Vercel attaches `Authorization: Bearer $CRON_SECRET`...") and documented a `CRON_SECRET` that is no longer used anywhere (`grep` confirms: only `worker/crons.ts` comment, which itself notes "no CRON_SECRET needed"). Replaced with Cloudflare-correct guidance pointing at `wrangler.toml [vars]` + `wrangler secret put`. CRON_SECRET removed from the example, with a one-line breadcrumb explaining the previous model. `npx tsc --noEmit` re-checked after edit — still 0 errors.

## Findings / suggested follow-ups (not auto-fixed)

| # | Severity | Area | Note |
|---|---|---|---|
| F1 | low | docs | `app/cgu` "Dernière mise à jour" still says 25 mai 2026 per CLAUDE.md (`confidentialite` is current). Bump after the next legal review; not a code change. |
| F2 | low | content | Guide hero images deferred (CLAUDE.md §audit-derived roadmap, §4a). Static, build-time pipeline required — out of scope for an audit. |
| F3 | info | SEO | EN region heatmap parity check: `FranceHeatmap` accepts `showRegionToggle`, EN `/map` passes it. ✅ No action. |
| F4 | info | a11y | Sticky Navbar `z-50` sits below modal layer `z-[55]` — correct stacking, no fix needed. |

## Verdict

**Site is in good shape.** Type-clean, all major route groups resolve, sitemap + robots cover the surfaces the briefing requires, newsletter cron is correctly scheduled to Sunday 07:00 UTC on Cloudflare, BREVO degrades gracefully when its key is absent, no leaked secrets, no widespread metadata gaps. The single safe fix this run is documentation hygiene in `.env.example` (Vercel → Cloudflare).

Pushing the `.env.example` cleanup directly to `main` per the audit's standing instructions.
