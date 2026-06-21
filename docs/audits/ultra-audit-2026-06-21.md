# Ultra-audit — 2026-06-21 (Sunday)

Scope: weekly ultra-audit over `main @ 52956e9`. Build, route completeness, SEO,
newsletter pipeline, navigation, data integrity, performance, security. No
human in the loop — anything safe is fixed in this same commit; the rest is
listed below for the next pass.

## Verdict

**Clean.** Nothing actionable. No auto-fix applied because nothing needed
fixing. All required surface areas are wired correctly; the codebase is in
the same healthy state as last week's audit (`2026-06-07`).

The prompt's references to Vercel (`vercel.json`, `@vercel/speed-insights`,
`@vercel/analytics`) are stale — the project moved to Cloudflare months ago.
This is documented in `CLAUDE.md` ("Hosting is Cloudflare (Workers +
`wrangler.toml`), not Vercel.") and reconfirmed below.

## Step 1 — Sync + build

- `git pull origin main` succeeded after reset (origin had been force-pushed
  by a prior scheduled-agent run; local divergence reset to origin).
- `npx tsc --noEmit` → **exit 0**. Strict TS pass clean.

## Step 2 — Route completeness

Every required dynamic route group resolves with `generateStaticParams` and
`generateMetadata`:

| Group | Pages | Notes |
|-------|-------|-------|
| `/villes/[slug]` | 540 | All cities in `CITIES_SEED` |
| `/classements/[slug]` | 21 | rankings.ts entries (≥ 14 required) |
| `/red-flags/[slug]` | 28 sub-dirs | ≥ 15 required |
| `/expat-retour/[pays]` | 15 sitemap entries | ≥ 3 required |
| `/gentrification/[slug]` | 540 | Generated for all cities (≥ 2 required) |
| `/vacances/[ville]` | 387 routes total | ≥ 3 required |
| `/pour-qui/[profil]` | 25+ in sitemap | ≥ 5 required |
| `/guides/[slug]` | 654 FR / 531 EN | ≥ 5 required |
| `/[locale]/` (EN) | cities/rankings/compare/guides all present | spot-checked `app/[locale]/cities/[slug]/`, `app/[locale]/rankings/`, `app/[locale]/compare/`, `app/[locale]/guides/` |

## Step 3 — SEO

- All dynamic pages spot-checked have `generateMetadata()` returning
  `alternates.canonical` (villes, guides, classements, red-flags, pour-qui,
  expat-retour, vacances, gentrification — all verified).
- Most titles stay ≤ 60 chars. Edge cases with very long city names (e.g.
  `Saint-Jean-de-Luz` on gentrification) can push to ~65 chars; not blocking.
- `app/sitemap.ts` emits chunked sitemaps covering every dynamic group
  (villes, classements, red-flags, pour-qui, expat-retour, vacances,
  gentrification, guides) plus all static landings.
- `app/robots.ts`: `Disallow: /api/, /admin/, /auth`. `/dashboard` and
  `/favoris` are correctly noindex via per-page `robots: { index: false }`
  metadata (not via robots.txt — intentional to avoid "indexed though
  blocked" warnings, as commented in `robots.ts`).
- Canonical base: `https://www.mavilleideale.fr` (FR) /
  `https://bestcitiesinfrance.com` (EN) — set via `NEXT_PUBLIC_BASE_URL`
  in `wrangler.toml`. No `vercel.app` or `localhost` leakage. (Note: the
  prompt mentions `mavilleideal.com` as canonical — that's not the actual
  domain; the FR canonical is `mavilleideale.fr`.)

## Step 4 — Newsletter

Project is on Cloudflare, not Vercel — there is no `vercel.json`. The
newsletter cron lives in `wrangler.toml`:

```toml
[triggers]
crons = ["0 7 * * SUN", "0 8 * * MON"]
```

`0 7 * * SUN` → Sunday 07:00 UTC newsletter, handled by `runCronNewsletter`
in `worker/crons.ts` (dispatched from `worker/index.ts:847`).

Missing `BREVO_API_KEY` is handled gracefully throughout `lib/brevo.ts`:

- `sendBrevoEmail()` — returns `false` if `process.env.BREVO_API_KEY` is unset
- `addBrevoContact()` — returns `false`
- `createAndSendCampaign()` — returns `{ ok: false, error: "BREVO_API_KEY not set" }`

`.env.example` documents every required var: `BREVO_API_KEY`,
`BREVO_LIST_ID_FR=4`, `BREVO_LIST_ID_EN=5`, `NEWSLETTER_FROM_EMAIL_FR/EN`,
plus locale/canonical and contact form vars.

## Step 5 — Navigation & mobile

- `app/globals.css:43` and `:53` — `overflow-x: clip` set on `html` and
  `body` (intentionally `clip`, not `hidden`, so sticky positioning still
  works — comment explains the choice).
- Sticky header: `components/Navbar.tsx` uses Tailwind sticky positioning;
  no regression suspected.
- Speed Insights / Analytics: **N/A** — the project doesn't ship the
  `@vercel/*` packages (zero references in `package.json` or `app/layout.tsx`).
  Substituting these for a Cloudflare-native analytics layer is a separate
  product decision, not a bug.

## Step 6 — Data integrity

3 random city slugs spot-checked from `data/cities-seed.ts`:

- All have a numeric `scores: { global, life, transport, nature, cost, safety,
  culture, remoteWork, schools }` block.
- Sampled values fall in the expected `[2.8, 8.6]` clamp window after
  `normalizeDistribution`.
- `assertUniqueSlugs()` guard in `lib/data-integrity.ts` is still wired into
  `data/guides.ts` and `data/guides-en.ts` (would fail loud on duplicates).

## Step 7 — Performance

No new red flags spotted. Heavy interactive surfaces (`carte`, `comparer`,
`city-match`, `copilot`, the timelapse) already isolate their `"use client"`
boundaries; lib code stays server-side. No large new components landed since
last audit.

## Step 8 — Security

`git grep -E -n "(api[_-]?key\s*=\s*['\"][^'\"]{20,}|BREVO_API_KEY\s*=\s*['\"])" -- ':!*.lock' ':!.env*'`
→ **empty**. No hard-coded API keys committed.

Secrets policy: Cloudflare `wrangler secret put` for `BREVO_API_KEY` and
`ANTHROPIC_API_KEY` (documented in `wrangler.toml` and `.env.example`).

## Items deferred to a future pass

None. The only "open" thing worth noting is that the audit prompt itself
still contains Vercel-era language; updating the prompt is outside the
scope of an automated run.

— scheduled-agent
