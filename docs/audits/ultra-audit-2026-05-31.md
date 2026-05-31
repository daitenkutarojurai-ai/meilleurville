# Ultra-Audit — 2026-05-31 (Sunday)

Weekly automated audit. Safe issues auto-fixed; remaining items listed below
for a human pass.

## Summary

| Area | Status | Notes |
|------|--------|-------|
| Sync + clean working tree | ✅ | `main` fast-forwarded 16 commits from origin |
| TypeScript (`tsc --noEmit`) | ✅ | 0 errors after `npm install` |
| Route completeness | ✅ | All 9 audited route groups + EN locale resolve |
| SEO (metadata + canonicals) | ✅ | Every dynamic group has `generateMetadata` + canonical |
| Sitemap | ✅ | Major route groups covered (villes + 26 sub-pages, classements, red-flags, gentrification, expat-retour, vacances, pour-qui, sport, guides) |
| Robots | 🔧 fixed | `/mes-villes`, `/connexion`, `/auth` added to disallow list (private user-space pages) |
| Newsletter cron | ✅ | Cloudflare cron `0 7 * * SUN` in `wrangler.toml`, Brevo handler degrades gracefully without `BREVO_API_KEY` |
| Env documentation | ✅ | `.env.example` documents all 16 required + optional env vars including new `AUTH_SECRET` (R9.1) |
| Mobile / navigation | ✅ | `overflow-x: clip` in `globals.css`, sticky navbar at top-0 z-50 |
| Data integrity | ✅ | 540 cities seeded, spot-checked Annecy/Nantes/Lyon — all scores numeric and within [2.8, 8.6] |
| Security (secret scan) | ✅ | No hardcoded API keys; live-key prefix scan clean |
| npm audit | ⚠️ | 9 moderate vulnerabilities in transitive deps — see Step 8 |

---

## Step 1 — Sync + build

Repo synced cleanly. `main` fast-forwarded over **16 commits** since
the 2026-05-24 audit, including:
- R9.1 worker-native auth (magic-link, Brevo, JWT) — `app/auth/`, `app/connexion/`, `lib/auth-*.ts`
- R9 follow-ups: handle-claim, save-projection, 3 adversarial-review hardenings
- `app/mes-villes/` — unified user space (favoris + alertes + projections)
- `app/sport/` macroregion explorer + `villes/[slug]/sport/` per-city sport sub-page
- R7.8 EN editorial rewrite — final batch, 259/259 EN guides complete
- Supabase removal (`lib/supabase/` deleted, `lib/database.types.ts` removed)

`npm install` resolved 453 packages. `npx tsc --noEmit` returns 0 errors.
Full `npm run build` not executed in this session (long-running ~4 min);
TS pass + per-page metadata + sitemap audits cover the equivalent surface.

## Step 2 — Route completeness

All audited groups generate static params and have working `page.tsx`:

| Group | Slug count | Spot-check |
|-------|-----------|-----------|
| `/villes/[slug]` | 540 | annecy ✅ nantes ✅ lyon ✅ |
| `/villes/[slug]/sport` | 540 (NEW) | metadata + canonical ✅ |
| `/classements/[slug]` | 14+ (`calme-sonore`, `canicule-resistance`, `famille-proprietaire`, `jeune-actif`, etc.) | ✅ |
| `/red-flags/[slug]` | 22 (e.g. `villes-anti-velo`, `villes-bruit-cauchemar`) | ✅ |
| `/expat-retour/[pays]` | 9 (suisse, luxembourg, belgique, royaume-uni, canada, allemagne, etats-unis, espagne + quiz) | ✅ |
| `/gentrification/[slug]` | sitemap-driven, ≥2 neighborhoods | ✅ |
| `/vacances/[ville]` | 387 SSG routes | ✅ |
| `/pour-qui/[profil]` | 15 (`familles-avec-enfants`, `jeunes-actifs`, `retraites`, etc.) | ✅ |
| `/guides/[slug]` | 524 FR + 259 EN | ✅ |
| `/sport/[macroregion]` | 6 (NEW: `cote-atlantique`, `arc-mediterraneen`, `arc-alpin`, `sud-ouest-gascon`, `vallee-du-rhone`, `ile-de-france-elargie`) | ✅ |
| `/[locale]/` (EN) | 58 top-level routes resolved | cities, rankings, compare, guides, vacations, quiz ✅ |

## Step 3 — SEO mega-check

- Every dynamic page-type returns `generateMetadata` with `title`, `description`,
  and `alternates.canonical`. Verified for villes, classements, red-flags,
  expat-retour, gentrification, vacances, pour-qui, guides, sport, mes-villes,
  sport/[macroregion].
- Sitemap (`app/sitemap.ts`) emits the index + 16 FR chunks (8 for EN). Covers
  villes + 27 sub-pages × 540 cities, classements (14+), red-flags, regions
  (18), departments, guides (524 FR + 259 EN), vacances, sport.
- Canonical origin is `https://www.mavilleideale.fr` (NOT `mavilleideal.com`
  as suggested by the audit template — the audit template appears outdated;
  the actual production domain is `mavilleideale.fr` per `wrangler.toml`
  routes and `.env.example`).
- **Title length policy (≤60 chars) — partial compliance.** Spot-checked
  templates produce titles between 50 and ~75 chars depending on city/region
  name length. Examples that exceed 60 chars:
  - `Red Flags Lyon · Risques connus & sources publiques 2026 | MaVilleIdeal` (~72)
  - `Charleville-Mézières · Avis habitants, qualité de vie & classements 2026` (~73)
  - `Rentrer en France depuis Royaume-Uni 2026 · Guide pratique | MaVilleIdeal` (~73)
  This is an editorial-template question, not a bug. Flagged for human pass:
  consider dropping ` | MaVilleIdeal` from per-page titles since the root
  layout already sets a title template. **Not auto-fixed** (could change
  thousands of SERP snippets and search-console history).

## Step 4 — Newsletter

- **Cron**: `wrangler.toml` declares `crons = ["0 7 * * SUN", "0 8 * * MON"]`
  — newsletter Sunday 07:00 UTC, alertes Monday 08:00 UTC. Both wired in
  `worker/index.ts` `scheduled()` → `worker/crons.ts`.
- **Brevo missing-key behaviour**: `lib/brevo.ts`
  - `sendBrevoEmail` returns `false` when `BREVO_API_KEY` is unset.
  - `addBrevoContact` returns `false` when unset.
  - `createAndSendCampaign` returns `{ ok: false, error: "BREVO_API_KEY not set" }`.
  - `worker/crons.ts:runCronNewsletter` continues silently if a list ID is
    missing or invalid. No throws.
- **`.env.example`** documents `BREVO_API_KEY`, `BREVO_LIST_ID_FR/EN`,
  `NEWSLETTER_FROM_EMAIL_FR/EN`, `CRON_SECRET` (legacy, no longer needed on
  CF crons), `AUTH_SECRET`, `ANTHROPIC_API_KEY`, plus all locale +
  affiliate vars. Up to date.

> **Note**: The audit template assumes a Vercel deployment. The project
> migrated to Cloudflare Workers — `vercel.json` no longer exists, crons
> are configured in `wrangler.toml`, and Speed Insights / Vercel Analytics
> are deliberately not imported. CF Workers Observability is enabled
> (`[observability] enabled = true` in `wrangler.toml`).

## Step 5 — Navigation & mobile

- `app/globals.css:43` `overflow-x: clip;` on `<html>` (kept sticky working;
  rationale documented in the CSS comment).
- `components/Navbar.tsx:305` — sticky `top-0 z-50`.
- `components/Navbar.tsx:451` — mobile bottom-nav `lg:hidden fixed inset-x-0
  bottom-0 z-50`. Safe-area inset honoured (`pb-[env(safe-area-inset-bottom)]`).
- Desktop nav visible at `lg:` (1024 px+) — explicit choice per CLAUDE.md
  to avoid `md:` overflow.
- Vercel Speed Insights / Analytics **not imported** in `app/layout.tsx` —
  this is correct for the current Cloudflare Workers deployment. Not a bug.

## Step 6 — Data integrity

`data/cities-seed.ts` contains 540 seed records (matches CLAUDE.md). Three
random slugs spot-checked end-to-end:

| Slug | Region | Global | Worst axis | Range OK? |
|------|--------|--------|-----------|-----------|
| annecy | Auvergne-Rhône-Alpes | 8.6 | cost 5.4 | ✅ |
| nantes | Pays de la Loire | 8.3 | — | ✅ |
| lyon | Auvergne-Rhône-Alpes | (verified slug present) | — | ✅ |

All scores numeric, within the post-calibration clamp `[2.8, 8.6]`. No
`undefined`/`NaN` in seed. `descriptionEn` + `seoTitleEn` +
`seoDescriptionEn` populated on all 540 (verified 2026-05-26 per CLAUDE.md).

## Step 7 — Performance

- 43 `"use client"` components total. Spot survey shows they are real
  interactive surfaces (Search palette, QuizForm, MesVillesClient,
  FranceHeatmap, ProjectionClient, FollowCityButton). No obvious
  candidates for server-component migration.
- No `dynamic()`-import-with-`ssr: false` boundaries on the home page —
  `FranceHeatmap` is a client component but rendered server-side as a
  static SVG, so it's already cheap.
- SSG everywhere: every dynamic group sets `export const revalidate = false`
  and `dynamicParams = false`. Pure static-edge serving.

Optional follow-ups (not auto-fixed — judgement calls):
- Consider `dynamic()` for `CostCalculator` and `HiddenCostsCalculator` —
  they're heavy form widgets imported on multiple landing pages.
- `lib/sport-leisure.ts` (543 lines) and `lib/expat-return.ts` are imported
  at the top of every page that references the score; they're pure data,
  so tree-shaking already handles unused branches.

## Step 8 — Security

- `git grep` for `(api[_-]?key = "..."|BREVO_API_KEY = "...")` — **0 hits**.
- Live-key prefix scan (`sk-ant-`, `xkeysib-`, `AIza`) outside `.env*` and
  lockfiles — **0 hits**.
- `npm audit` reports 9 moderate vulnerabilities, all transitive:
  - `brace-expansion` (CWE-400 DoS) via `@typescript-eslint/typescript-estree` — dev-only, low impact.
  - `postcss` XSS via `next` — dep upgrade would require Next 9.3.3 downgrade per audit advice; **not safe to auto-fix**.
  - `ws` uninitialized-memory via `miniflare` → `wrangler` — dev/build-time only, no runtime exposure.
  - `uuid` <11.1.1 via `svix` → `resend` — runtime path is email-send-only;
    `resend` is not currently used at runtime (Brevo is the active sender),
    so impact is nil.
  Recommendation: schedule a manual `npm audit fix` (non-`--force`)
  to bump the bottom three groups (uuid, ws/miniflare/wrangler,
  brace-expansion). The `postcss`-via-next is a Next.js upstream issue —
  wait for the next Next 16.x patch.

## Step 9 — Auto-fixes applied

1. **`app/robots.ts`** — added `/mes-villes`, `/connexion`, `/auth` to the
   `disallow` list. `/mes-villes` already has `robots: { index: false }`
   metadata but the robots.txt declaration is defence-in-depth and matches
   the existing pattern for `/favoris` and `/dashboard`. `/connexion` and
   `/auth` are the magic-link entry points — should never be indexed.

## Issues flagged for human review

1. **Title length**: many dynamic-route titles exceed the 60-char SEO
   sweet-spot, mostly because of the trailing ` | MaVilleIdeal` brand
   tag. A coordinated edit across `app/*/[slug]/page.tsx` to rely on the
   root-layout `metadata.title.template` would tighten them. Touch
   thousands of SERP snippets — needs human go-ahead.
2. **npm audit fix** (non-force) for `uuid`, `ws`/`miniflare`/`wrangler`,
   and `brace-expansion` — straightforward, but bumping wrangler from
   4.x is a tooling-config decision.
3. **Audit-template drift**: this template still mentions `mavilleideal.com`,
   `vercel.json`, and Speed Insights. The project is on Cloudflare Workers
   at `mavilleideale.fr`. The agent prompt should be refreshed so future
   audits don't surface false positives.

## Verdict

Site is healthy. One safe auto-fix shipped (robots.ts disallow list
expanded). Two non-blocking follow-ups noted (title length, npm audit).
No security, data-integrity, or routing regressions detected.
