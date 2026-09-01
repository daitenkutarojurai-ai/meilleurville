# MeilleurVille — Project briefing

French city ranking & relocation guide site. 540 cities, 524 FR guides + 261 EN guides, 19 ranking
categories, 18 regions (13 metropolitan + 5 DROM). Copy is **French**.
(Counts derived at build — see `lib/site-stats.ts`; figures here are indicative.)

A parallel **English version** (bestcitiesinfrance.com) is being scaffolded from
the same repo / same build. See [§ Bilingual setup](#bilingual-setup-bestcitiesinfrancecom)
below. The FR domain remains unchanged.

## Stack

- **Next.js 16.2.x** (App Router, Turbopack) + **TypeScript** (strict). Note:
  there is NO `proxy.ts`/middleware — `output: "export"` can't run one; host
  canonicalization + EN locale routing live in `worker/index.ts`.
- Tailwind v4 with custom CSS variables (`--accent`, `--bg-canvas`, etc.)
- **lucide-react** for icons
- Static-first: pages SSG via `generateStaticParams` exported to `out/`
  (Cloudflare Workers Static Assets). Runtime user data (comments, contact,
  alertes, newsletter, accounts) lives in **D1** behind the API Worker
  (`worker/index.ts`); the `lib/*-store.ts` modules are D1-backed.

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
  cities-seed.ts                 # 540 cities, raw seed (calibrated + normalized at module load)
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
  comments-store.ts              # D1-backed comment persistence (via worker)
  contact-store.ts               # D1-backed contact form persistence
  spam-filter.ts, rate-limit.ts  # Abuse mitigation (rate-limit: in-memory burst + D1 fixed-window)
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

⚠️ **Never quote a seed literal in copy — quote what the page renders.**
`data/cities-seed.ts` holds the *raw* values (Rennes `safety: 7.8`); every
surface renders `CITIES_SEED`, i.e. the calibrated + normalized value (Rennes
5,9). Writing « sécurité 7,8/10 (source : `data/cities-seed.ts`) » is therefore
true of the *file* and contradicted by `/villes/rennes` in one click. That is
exactly how 1 026 figures drifted across the guide corpus and the seed's own EN
meta fields before the 2026-08-10 fix (gaps up to 2,3 points; ROADMAP § Shipped
2026-08-10 has the full account). Read the value through the module — a scratch
`npx tsx` that imports `@/data/cities-seed` — never by grepping the seed source.
`npm run integrity` now fails when a figure sitting next to an axis name equals a
city's raw literal while the page shows something else. It is a narrow guard by
design (no false positives, and it cannot see an invented number), so it is a net,
not a substitute for reading. Niche scores have the same trap: `Score retraite` /
`Score étudiant` come from `computeNicheScores()` (`lib/niche-scores.ts`), not
from any seed field.

## Score colour scale (6 tiers — applied in lib/utils.ts, CityCard, FranceHeatmap, DromStrip, CarteClient, ScoreBar, all opengraph-image.tsx)

Effectifs mesurés le 2026-08-30 en exécutant `CITIES_SEED` (donc après calibrage et
normalisation), pas en lisant le seed source. La table d'avant portait les comptes des
**352** villes d'alors et sous-estimait le haut de l'échelle d'un facteur 6 : le violet
n'est plus « très rare », il tient 3,5 % du corpus. Recompter après tout ajout de villes.

| Range  | Colour  | Count (540 cities) | Meaning        |
|--------|---------|-------------------|----------------|
| ≥ 7.5  | Violet (`#A855F7`) | 19 (3.5%) | Exceptionnel   |
| ≥ 7.0  | Green   | 50 (9.3%)         | Excellent      |
| ≥ 6.0  | Lime    | 151 (28.0%)       | Bon            |
| ≥ 5.0  | Amber   | 141 (26.1%)       | Moyen          |
| ≥ 4.0  | Orange  | 100 (18.5%)       | En dessous     |
| < 4.0  | Red     | 79 (14.6%)        | Mauvais        |

Distribution mean ≈ 5.46. Penalties:
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
  use a metropolitan bounding box `lng ∈ [-6, 10]` × `lat ∈ [40, 52]`, so DROM
  cities are excluded from the **SVG plot** (they'd render off-canvas). DROM is
  **not invisible**, though: both maps render `<DromStrip />` below the SVG —
  a card per territory (Guadeloupe/Martinique/Guyane/Réunion/Mayotte) with its
  top cities as score-coloured, clickable links + region link, locale-aware.
  This is the chosen treatment over geographic "inset cartouches": territories
  here have 1–8 cities each (Mayotte 1, Guyane 2), so mini-map insets would mean
  tiny, overlapping, hard-to-click dots — the card strip is clearer. (Done; the
  old "inset cartouches follow-up" note is superseded.)
- "Pro" / paywall references are being removed (commit `bed2367`). If you see
  a stale Premium teaser, prefer removing it over reinforcing it.
- **setState-in-effect pattern**: initialise localStorage-backed state with lazy
  initialisers (`useState(() => readFavorites()...)`) not `useEffect`. Derive
  computed state with `useMemo` instead of effect + setState.
- **Canonicals**: every dynamic route `generateMetadata` must return
  `alternates: { canonical: "/<route>/<slug>" }`. Root layout provides the
  global default via `metadataBase`; page-level canonical overrides are needed
  for villes, classements, guides, regions, departements, comparer, quartiers, climat.
- **hreflang**: returning `alternates` at page level **replaces the layout's
  object wholesale**, so a page that sets only `canonical` silently drops the
  `languages` map — that is how 94 % of the site lost its hreflang (audit
  2026-08-02 §2.1). A route with an exact twin in the other locale must return
  `languages` too. City sub-pages don't hand-roll it: they call
  `cityAlternates(frSub, slug)` / `cityAlternatesEn(enSub, slug)` from
  `lib/i18n.ts`, which carry canonical **and** hreflang. A new city sub-page
  therefore means one entry in `FR_TO_EN_CITY_SUB` and a run of
  `npm run hreflang:check` (it fails if the twin route is missing, is in a
  different activation state, or the file skipped the helper). Sub-slugs are
  **not** shared across locales (`sante` ↔ `healthcare`): never derive the EN
  URL by translating the head segment alone — a hreflang pointing at a 404 is
  worse than none.
- **`openGraph` has the exact same trap as `alternates`** (found 2026-08-03):
  a page-level `openGraph` object **replaces the inherited one wholesale**, so
  declaring `openGraph: { title, description }` without `images` doesn't fall
  back to the root `opengraph-image.tsx` — it emits **no `og:image` at all**.
  237 pages shipped with no social card because of this (78 EN incl. the EN
  homepage, 159 FR), which is why shared links rendered without the logo. Every
  page-level `openGraph` must carry `images: ["/opengraph-image"]` unless the
  route has its own `opengraph-image.tsx` sibling (which does inherit
  correctly). Sweep for regressions with: for each `page.tsx` containing
  `openGraph`, flag it when it has no `images:` and no sibling
  `opengraph-image.tsx`.
- **Brand name**: **`MaVilleIdéale`** (FR) / `BestCitiesInFrance` (EN) — with the
  final `e` and the accent, matching the domain and the transactional emails.
  The accent-less `MaVilleIdeal` was purged 2026-07-27 across 148 occurrences;
  don't reintroduce it. Uppercase wordmark (badge SVGs): `MAVILLEIDÉALE`.
- **Title length**: the root layout's `title.template` is a bare **`%s`** — no
  brand suffix. It used to be `%s | <brand>`, which applied to all ~52 000 pages
  and pushed the median title to 83 chars when Google renders ~60, so the part
  that got truncated was the city or guide name. A page may append the brand
  **only if the result stays ≤ 60 chars**; use `hubTitle()` from `lib/brand.ts`
  rather than hardcoding the suffix. `openGraph`/`twitter` titles keep the brand
  — those are social cards, not search results.
- **Meta descriptions ≤ ~160 chars.** Don't pad with generic tails
  ("Comparez avec d'autres villes.", "Estimation déterministe dérivée des
  scores…") — they push the figures a searcher actually scans out of the
  rendered snippet. Where a `description` field doubles as on-page editorial
  copy (the `/classements` hubs), wrap the metadata use in `clampMeta()` so the
  tag is cut on a sentence or clause boundary and the page keeps the full text.
- **Score convention**: **the name of the metric must match the direction of the
  number, and hreflang twins must show the same number.**
  - Named for a **quality** (Sécurité, Qualité de l'air, Services publics,
    Démographie, Emploi, Santé) → `10 = bon`. Libs that score the hazard
    (`10 = pire`) are inverted **at the display site**, never in the engine —
    sorts, levels and rankings keep the raw value.
  - Named for a **nuisance** (Bruit, Stress hydrique, Risques naturels, Tension
    locative) → raw `10 = pire` is correct; the name already says which way is
    bad. Don't invert these.
  - Every surface states what 10 means in its legend.
  - A FR page and its EN counterpart are hreflang alternates: they must never
    show different numbers for the same city. This is the check that catches the
    bug — it's how safety (FR 6,8 vs EN 3,2) and the env quartet were found.
  - Careful with colour: `scoreColor`/`scoreHex` is the global `10 = vert`
    palette. A surface displaying a raw nuisance score must feed it the inverse
    (see `hazardColor` in the EN noise/water/natural-risks pages), or use a
    level-keyed palette (`NOISE_LEVEL_COLOR` & co, as the FR pages do).

  Each hazard lib has a `**Convention**` comment block. `lib/environment-index.ts`
  is the reference shape: it exposes both `healthScore` (10 = sain) and
  `stressComposite` (10 = pire) so each surface picks the one matching its name.

- **Un classement ne publie un rang que là où le score départage** (convention
  posée 2026-08-19, `lib/owner-rankings.ts`). Un `sort` suivi d'un `slice(0, N)`
  sur un score à une décimale **fabrique** la fin de sa liste : `/classements/qualite-air`
  remplissait 18 de ses 50 lignes en piochant dans une égalité à **411 villes**, et
  `/classements/calme-sonore` ses 50 lignes dans une égalité à **170** — dans l'ordre
  d'insertion du seed, présenté comme des rangs. Deux règles, à appliquer à tout nouveau
  classement : ① une ville dont le score est un **repli constant** (même valeur pour tout
  le monde faute de donnée propre) sort du barème, elle n'est pas triée à égalité — c'est
  le précédent du rang de richesse biodiversité, retiré le 10/08 ; ② une **égalité ne se
  coupe jamais en son milieu** : on groupe par valeur, on s'arrête avant le palier qui
  déborde, et la page dit combien de villes suivaient et à quelle note. Corollaire JSON-LD :
  `itemListOrder: ItemListUnordered` (sans `position`) dès qu'une des premières villes est
  ex æquo — sinon l'ordre fabriqué repart en données structurées, où personne ne le relit.
  Un tri par nom à l'intérieur d'un palier est un ordre **stable**, pas un départage, et
  doit être annoncé comme tel.
  ⚠️ Piège voisin, trouvé le même jour : les chaînes `methodology` / `intro` de ces
  classements vivent **loin** de la fonction qu'elles décrivent (définition d'un côté,
  calcul de l'autre, version EN dans une troisième file), et **7 sur 20 décrivaient un autre
  calcul** — dont deux pages EN qui citaient les pondérations de `lib/niche-scores.ts` alors
  qu'elles classent `lib/owner-scores.ts`. Ni `tsc` ni `npm run integrity` ne peuvent voir
  l'écart entre une phrase et une formule : relire les deux locales dès qu'un barème bouge.

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
npm run integrity    # gardes de lib/data-integrity + contrôle des scores cités dans les guides (bruts vs rendus) hors build — 2 s. **À LANCER AVANT DE POUSSER UN BATCH DE CONTENU.**
npm run sitemap:check # sitemap ↔ arbre de routes, dans les deux sens, les deux locales — 22 s. **À LANCER APRÈS TOUTE NOUVELLE ROUTE.** Exécute app/sitemap.ts et les generateStaticParams() réels : URL déclarée sans page (le défaut biodiversité du 06/08, 604 x 404), page indexable sans URL (F61, expat-retour), doublons, origine, lastModified, chunk > 50 000.
npm run coast        # data/city-coast.json : distance à la mer ouverte des 540 villes (Natural Earth, ~5 s, egress requis)
npm run build        # full SSG build — 56 185 pages, ~15 min (le « ~3 000 » historique est très obsolète)
npm run lint         # 231 errors / 27 warnings (mostly @next/next/no-html-link-for-pages — harmless under output:"export" — plus residual react/no-unescaped-entities; none are runtime bugs). See latest docs/audit-*.md for the rule breakdown.
```

⚠️ **`npm run build` ne tient plus dans le quota disque d'une session cloud** (constaté 2026-08-04,
deux tentatives). Le build compile, passe TypeScript et **génère les 56 185 pages avec succès en
~12,5 min**, puis meurt en `ENOSPC` sur « Finalizing page optimization » : `.next` seul dépasse
l'allocation d'écriture de la session, avant même que `out/` soit écrit. Conséquences pratiques
pour une routine planifiée :
- L'étape qui valide le contenu (rendu de chaque page, `assertUniqueSlugs`, imports) est la
  **génération**, et elle, elle passe. Un run qui atteint `(56185/56185)` a validé son contenu.
- La finalisation qui échoue est du bundling/export, elle ne relit pas les données.
- Nettoyer `.next` et `out` **avant** de relancer quoi que ce soit — sinon les fichiers de sortie
  des outils eux-mêmes deviennent illisibles (ENOSPC silencieux : les logs reviennent vides, ce
  qui se lit à tort comme un plantage sans message).
- Ne pas conclure « build cassé » sur un `EXIT=1` sans avoir lu la ligne d'erreur : ici la cause
  est l'environnement, pas le code. La vérification complète (export `out/`) reste une passe locale.

⚠️ **Mise à jour 2026-08-08 : le « ~12,5 min » ci-dessus ne vaut plus pour une session cloud.**
Constaté sur le batch 27 : la génération tournait encore **après 4 h 30**, `.next` à **25 Go** et
toujours en croissance régulière (~1 Go / 10 min), sans jamais atteindre la finalisation — la
session a été arrêtée à 3 Go d'espace libre pour ne pas figer le conteneur. Deux conséquences
opérationnelles :
- **Ne lance pas `npm run build` pour valider un batch de contenu depuis une routine.** Tu ne verras
  ni `(56185/56185)` ni la moindre erreur, et tu auras brûlé plusieurs heures pour un ENOSPC.
- Quand la sortie est tuyautée (`| tail`), rien ne s'affiche avant la fin : suivre l'avancement par
  `du -sh .next` et `df -h`, pas par le log. Et **nettoyer `.next`/`out` avant de quitter**, sinon le
  `/tmp` des outils sature à son tour et leurs sorties reviennent vides (constaté ce run).
- ⚠️ **Conséquence trouvée le 2026-08-09 : `tsc` ne remplace pas le build.** Les gardes
  `assertUniqueSlugs` / `assertKnownSlugs` ne tournent qu'au **chargement** des modules de données,
  donc au `next build` / `next dev` — et un `relatedGuides` pointant vers un slug inexistant est
  parfaitement bien typé. Le batch `vacances-celibataire` du 08/08 a ainsi laissé `main`
  **non-buildable pendant une nuit** sans qu'aucun contrôle ne parle. D'où **`npm run integrity`**
  (`scripts/check-integrity.mjs`) : il exécute les vrais `cities-seed` / `guides` / `guides-en`,
  donc les vraies gardes, en deux secondes. **Le lancer avant tout push de contenu**, au même titre
  que `npm run search-index` après un guide EN.
- Le substitut qui marche, et qui a validé le batch 27 : `npx tsc --noEmit` (propre), puis un script
  `npx tsx` qui importe `@/data/guides-en` — l'import exécute `assertUniqueSlugs` — et vérifie sur
  les nouveaux slugs longueur de `metaTitle`/`metaDesc`, nombre de sections, `category`, présence
  des `relatedCities` dans `CITIES_SEED` et absence d'unités ascii-strippées. Une minute au lieu de
  cinq heures, et ça couvre ce qu'un batch de guides peut casser. Le rendu réel reste une passe locale.

## Déploiement — automatique la nuit, manuel si tu es pressé

**Depuis le 2026-08-10, `scripts/local-deploy-runner.sh` publie `main` chaque nuit à 04h12 UTC**
(cron de cette machine, à côté du data-runner). Il ne fait rien si `main` n'a pas bougé, ne tourne
pas pendant le crawl du data-runner, passe `tsc` + `npm run integrity` avant de publier, déploie FR
puis EN, vérifie que les deux domaines répondent 200 et n'enregistre le sha publié
(`~/.local/state/meilleurville/deployed-sha`) que si tout est vert — un échec est donc réessayé la
nuit suivante, pas oublié. Journal : `~/.local/state/meilleurville/deploy-runner.log`.
`--dry-run` liste les commits qui partiraient ; `--force` republie même sans changement ;
`--status` dit en trois lignes où en est la prod (sha publié, âge, commits en attente).

⚠️ **Un arbre de travail sale ne bloque plus la publication — c'est le correctif du 2026-08-19.**
Le runner refusait de publier tant que le dépôt portait des fichiers modifiés. Refuser était juste
(on ne publie pas du travail que personne n'a validé), mais le résultat était la panne que ce
script existe pour empêcher : 175 fichiers laissés par une session interrompue ont gardé trois
commits de routine en 404 pendant une journée, et la seule trace était une ligne de journal que
personne ne lit. Désormais, dépôt sale ⇒ la publication passe par un **worktree git détaché calé
sur `origin/main`** (`~/.cache/meilleurville-deploy`, `node_modules` et `.env.local` en liens vers
le dépôt) : on ne publie toujours **que ce qui est commité et poussé**, et l'état du dossier de
travail n'a plus voix au chapitre. Deux gardes ajoutées avec : une passe qui n'aboutit pas alors
que la prod a plus de 36 h de retard **alerte** (fichier d'état, notification bureau, e-mail Brevo
depuis `bonjour@mavilleideale.fr`, au plus un par 24 h), et un `.next`/`out` abandonné depuis plus
de 6 h est effacé au lieu d'affamer le build suivant — les 35 Go d'un build manuel interrompu
suffisaient à faire échouer la passe sur le plancher d'espace libre.

La suite reste vraie pour un déploiement manuel, et explique ce que le runner fait à ta place.

Aucune routine ne déploie : elles poussent sur `main`, et c'est tout. Avant l'automatisation, rien
ne reliait `main` à la production, donc **pousser n'était pas publier**. Vérifié le 2026-08-10 : le site en ligne était
**cinq jours en retard** sur `main` (les sous-pages biodiversité du 06/08, `/pour-qui/navetteurs-hybrides`
du 07/08 et le batch `parent-solo` répondaient 404 en production alors qu'ils étaient dans le dépôt).
C'est le mode de défaillance à surveiller : il ne produit aucune erreur, seulement du travail invisible.

Le runbook complet, dans l'ordre, ~50 min par domaine :

```bash
nvm use 22                 # wrangler exige Node >= 22 ; le node par défaut de la machine est 20
npx tsc --noEmit && npm run integrity && npm run parity
rm -rf .next out           # le build a besoin de ~35 Go libres ; un reste de build précédent les mange
npm run build              # FR — 58 396 pages, ~6,5 min de génération + finalisation/export
npm run cf:deploy          # -> www.mavilleideale.fr (worker `meilleurville`)
rm -rf .next out
npm run build:en           # EN — même arbre, NEXT_PUBLIC_DEFAULT_LOCALE=en
npm run cf:deploy:en       # -> bestcitiesinfrance.com (worker `meilleurville-en`)
```

**Le piège que garde `scripts/check-deploy-locale.mjs`** : les deux `wrangler.toml` pointent vers le
**même** dossier `out/`, et la locale est figée au build. Enchaîner `npm run build` puis
`cf:deploy:en` publierait donc le site **français** sur le domaine anglais, sans qu'aucune commande
n'échoue. Les deux scripts `cf:deploy*` lisent maintenant le `<link rel="canonical">` réellement
inliné dans `out/index.html` et refusent de partir si l'export ne correspond pas au worker visé.

Chiffres réels du 2026-08-10, pour savoir à quoi s'attendre : 58 396 pages générées en 5,8–6,5 min,
`out/` fait ~9 Go et 117 000 fichiers, dont ~57 300 nouveaux ou modifiés à téléverser ; l'upload
prend **11 à 13 min** par domaine (`Uploaded meilleurville (799 s)`, `meilleurville-en (668 s)`).
Compter ~35 min par domaine, build compris.

Puis on vérifie **en ligne**, avec `curl -o /dev/null -w '%{http_code}'`, une page livrée depuis le
dernier déploiement — une 404 sur une page présente dans `out/` veut dire que le déploiement n'est
pas allé au bout, quoi qu'en dise le log. **Mais laisse passer 2 à 5 minutes** : la propagation des
assets n'est pas instantanée, et une page vérifiée dans la minute qui suit le déploiement répond
encore 404 avant de passer à 200 sans que rien n'ait été refait. Vérifier trop tôt, c'est fabriquer
un faux incident.

Une dernière chose sur les URL de contrôle : côté EN, l'arbre servi est `out/en/**` (le Worker
réécrit `/<chemin>` en `/en/<chemin>`), et les départements sont **slugués**, pas numérotés
(`/departments/ain/tax`, pas `/departments/01/tax`). Prends l'URL dans `out/`, ne la devine pas.

@AGENTS.md

---

## Content roadmap — guides (`data/guides.ts`)

Current count: **759 guides** (2026-07-14). Guide spec: `slug, title, metaTitle, metaDesc, category, emoji, readMinutes, publishedAt, updatedAt, intro, sections[], relatedCities[], relatedGuides[], tags[]`. All copy in **French**, direct voice, data-led. No silent fake figures.

All planned series are complete (Climat 2040 ×15, Quitter X ×18, Comparaisons A vs B ×17, Région 2026 ×16, Télétravail 2026 ×11, Lifestyle ×14, Budget ×7, Famille ×4).

**10 choses à faire à [ville] series** — new `category: "tourisme"` (`GUIDE_CATEGORIES` entry: "À faire & voir 🎯"). Batch 1 (Paris/Lyon/Bordeaux/Toulouse/Marseille/Nice/Nantes/Rennes), Batch 2 (Strasbourg/Montpellier/Lille/Grenoble/Rouen/Dijon/Metz/Angers), Batch 3 (Reims/Aix-en-Provence/Brest/Clermont-Ferrand/Tours/Perpignan/Le Havre/Orléans), Batch 4 (Caen/Nancy/Amiens/Limoges/Besançon/Pau/Bayonne/Biarritz), Batch 5 (La Rochelle/Annecy/Chambéry/Toulon/Valence/Poitiers/Troyes/Colmar), Batch 6 (Nîmes/Avignon/Cannes/Saint-Malo/Vannes/Quimper/Dunkerque/Mulhouse), Batch 7 (Arles/Montauban/Albi/Tarbes/Niort/Angoulême/Saintes/Le Mans) shipped. Slug pattern: `10-choses-a-faire-a-[slug]-2026`. 56 guides total. Batch 8 (Lorient/Chartres/Blois/Auxerre/Belfort/Épinal/Roanne/Chalon-sur-Saône) shipped. 64 guides total. Batch 9 (Saint-Étienne/Fréjus/Arras/Lens/Calais/Boulogne-sur-Mer/Mâcon/Bourg-en-Bresse) shipped. 72 guides total. Batch 10 (Montluçon/Vichy/Clermont-l'Hérault*/Sète/Hyères/Draguignan/Laval/Cherbourg) shipped (*Clermont-l'Hérault initially skipped, ajouté en batch 11). 80 guides total. Batch 11 (Saint-Nazaire/Cholet/La-Roche-sur-Yon/Châtellerault/Cognac/Périgueux/Agen/Carcassonne/Clermont-l'Hérault) shipped. 89 guides total. Batch 12 (Aix-les-Bains/Évian-les-Bains/Manosque/Narbonne/Béziers/Castres/Millau/Rodez) shipped. 97 guides total. Batch 13 (Auch/Cahors/Mende/Privas/Aurillac/Le-Puy-en-Velay/Moulins/Bressuire) shipped. 105 guides total. Batch 14 (Bar-le-Duc/Chaumont/Guéret/Saint-Brieuc/Saint-Lô/Évreux/Beauvais/Laon) shipped. 113 guides total. Batch 15 (Charleville-Mézières/Saint-Dié-des-Vosges/Pontarlier/Saint-Omer/Châteauroux/Nevers/Vesoul/Lons-le-Saunier) shipped. 121 guides total. Batch 16 (Foix/Gap/Digne-les-Bains/Mont-de-Marsan/Tulle/Châlons-en-Champagne/Alençon/Bourges/Fontainebleau) shipped. 130 guides total. Batch 17 (Honfleur/Sarlat-la-Canéda/Ajaccio/Bastia/Cassis/Collioure/Saint-Tropez/Menton/Épernay/Provins) shipped — touristic gems. 140 guides total. Batch 18 (Lourdes/Beaune/Concarneau/Saint-Jean-de-Luz/Carnac/Gordes/Saint-Paul-de-Vence/Amboise/Saumur/Chantilly) shipped — pilgrimages, vins, mégalithes, châteaux Loire. 150 guides total. Batch 19 (Grasse/Antibes/Cagnes-sur-Mer/Saint-Raphaël/Chinon/Compiègne/Bayeux/Martigues/Calvi/Porto-Vecchio) shipped — Riviera française, Loire, Normandie, Corse. 160 guides total. Batch 20 (Arcachon/Royan/Libourne/Dinan/Pézenas/Vienne/Riom/Sisteron/Apt/Annonay/Montbéliard) shipped — Atlantique, vignobles, Provence, Auvergne, Franche-Comté. 171 guides total. Batch 21 (Aubagne/Anglet/Autun/Bagnères-de-Bigorre) shipped 2026-07-29 — pays de Pagnol, côte basque surf, Augustodunum romain, Pyrénées thermales. 173 guides total (compteur mesuré `grep 'slug: "10-choses-a-faire-a-.*-2026"'` = 173 ; le fil cumulatif ci-dessus s'écarte de 2 sans que j'aie retrouvé où — le réel prévaut). **Batch 22 (Saint-Denis de La Réunion/Saint-Paul/Saint-Pierre/Fort-de-France/Pointe-à-Pitre/Cayenne) shipped 2026-07-30 — premier batch outre-mer : la série était 100 % métropolitaine alors que 18 villes DROM sont dans le seed et qu'aucune n'avait de guide tourisme. Compteur mesuré = 179.** Villes DROM encore non couvertes, par population : Le Tampon, Mamoudzou, Saint-André, Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph, Saint-Benoît, Baie-Mahault, Le Robert, Le François. Écart FR→EN après ce batch : 10 villes (anglet, aubagne, autun, bagneres-de-bigorre + les 6 DROM) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**.

**Batch 23 — EN, rattrapage de parité, shipped 2026-08-01.** Les 10 jumelles `things-to-do-in-[slug]-2026` manquantes écrites d'un coup (Anglet, Aubagne, Autun, Bagnères-de-Bigorre + les 6 villes DROM du batch 22) dans `data/guides-en.ts`. **Compteurs mesurés : FR 179, EN 180 — écart nul, parité rétablie.** L'EN dépasse d'une unité parce que `things-to-do-in-le-puy-en-velay-2026` existe côté anglais alors que le FR utilise `10-choses-a-faire-**au**-puy-en-velay-2026` (« au Puy », pas « à Le Puy ») : ce n'est pas un trou, c'est le seul slug de la série qui ne suit pas le gabarit `-a-[slug]-`. Ne pas « corriger » le FR, et ne pas compter Le Puy comme manquant au prochain diff — le diff naïf `comm` sur les deux listes de slugs le remonte à chaque run.
Premiers guides EN sur l'outre-mer : nouveaux tags `reunion` / `martinique` / `guadeloupe` / `french guiana`, qui créent autant de pages `/tags/[slug]` côté EN. Rédigés en anglais natif depuis les faits des sources FR (pas de traduction), avec la contrainte de sécurité explicitée pour La Réunion : hors lagon et hors enclos surveillés, la baignade est interdite — un lecteur anglophone ne le devine pas.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Villes DROM encore non couvertes des deux côtés, par population : Le Tampon, Mamoudzou, Saint-André, Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph, Saint-Benoît, Baie-Mahault, Le Robert, Le François.

**Batch 24 — FR, shipped 2026-08-04 : Versailles, Saint-Denis (93), Roubaix, Tourcoing, Boulogne-Billancourt, Villeurbanne, Le Tampon.** Premier batch sur les **grandes communes non-préfectures et les banlieues**, qui étaient le vrai trou de la série : les 10 villes non couvertes les plus peuplées étaient toutes des communes d'Île-de-France, du Nord ou de la métropole de Lyon, et **Versailles — la ville la plus visitée de France après Paris — n'avait aucun guide** parce que la série avait été construite par préfectures et par jolies petites villes. Chacune de ces villes a de la matière réelle et non touristique : nécropole royale et chantier de la flèche à Saint-Denis, La Piscine et la villa Cavrois côté Roubaix, Le Fresnoy et le bunker du message Verlaine à Tourcoing, Albert-Kahn et l'île Seguin à Boulogne, les Gratte-Ciel de 1934 et le TNP à Villeurbanne, le Piton de la Fournaise depuis Le Tampon.
**Compteurs mesurés : `-a-` strict = 185, en incluant `au-` = 187 ; EN = 180.** ⚠️ Le Tampon a le **deuxième slug de la série à échapper au gabarit `-a-[slug]-`** après Le Puy : `10-choses-a-faire-**au**-tampon-2026` (« au Tampon », pas « à Le Tampon »). Le grep historique `grep -c 'slug: "10-choses-a-faire-a-.*-2026"'` **en rate désormais deux** — utiliser `grep -c 'slug: "10-choses-a-faire-a[u]*-.*-2026"'` pour le compte réel. Ne pas « corriger » ces deux slugs, et ne pas les compter comme des trous EN au prochain diff.
Écart FR→EN après ce batch : **7 villes** (versailles, saint-denis 93, roubaix, tourcoing, boulogne-billancourt, villeurbanne, le-tampon) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**. Attention au nommage anglais : `things-to-do-in-saint-denis-2026` doit viser le 93 et se distinguer de `things-to-do-in-saint-denis-reunion-2026`, qui existe déjà.

**Batch 25 — EN, rattrapage de parité, shipped 2026-08-05.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 24 écrites d'un coup dans `data/guides-en.ts`
(Versailles, Saint-Denis 93, Roubaix, Tourcoing, Boulogne-Billancourt, Villeurbanne,
Le Tampon). **Compteurs mesurés : FR 187, EN 187 — écart nul dans les deux sens, parité
rétablie** (`EN_GUIDES` 541 → 548). Le piège de nommage annoncé ci-dessus est tranché :
`things-to-do-in-saint-denis-2026` (93) et `things-to-do-in-saint-denis-reunion-2026`
coexistent, chacune résolue par `getEnGuide('things-to-do-in-' + slug + '-2026')` depuis
le slug de seed correspondant, et l'intro du guide 93 signale l'homonymie dès la première
ligne.
⚠️ **Le diff naïf remonte désormais deux faux trous, pas un.** Aux deux slugs FR hors
gabarit (`au-puy-en-velay`, `au-tampon`) répondent des slugs EN en `le-` :
`things-to-do-in-le-puy-en-velay-2026` et `things-to-do-in-le-tampon-2026`. Le contrôle
de parité doit mapper `puy-en-velay` → `le-puy-en-velay` et `tampon` → `le-tampon` avant
de comparer ; sans ça il annonce deux manques de chaque côté à chaque run. Ne pas
« corriger » ces slugs.
Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit),
`metaTitle` ≤ 60 caractères sur les 7 — plus serré que le reste de la série, qui montait
à 74 et se faisait tronquer en SERP — et `metaDesc` ≤ 160. Aucun tag nouveau : les tags
de région réutilisent `ile-de-france`, `hauts-de-france`, `auvergne-rhone-alpes`,
`reunion`. **Prochain run : batch FR** (l'écart est nul, la série FR reprend la main).
Villes DROM encore non couvertes des deux côtés, par population : Mamoudzou, Saint-André,
Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph,
Saint-Benoît, Baie-Mahault, Le Robert, Le François.

**Batch 26 — FR, shipped 2026-08-06 : Saint-Ouen-sur-Seine, Vitry-sur-Seine, Montreuil,
Argenteuil, Neuilly-sur-Seine, Pantin, Meaux.** Deuxième batch sur les communes de la
petite couronne, dans la continuité du batch 24, mais sélectionnées **par matière
touristique réelle plutôt que par population** — c'est la correction de méthode du run.
Les dix communes non couvertes les plus peuplées sont toutes des banlieues d'Île-de-France
et plusieurs n'ont honnêtement pas dix choses à faire ; à l'inverse Saint-Ouen porte le
**plus grand marché d'antiquités au monde** et n'avait aucun guide, et Meaux (une demi-heure
de la gare de l'Est) aligne cité épiscopale complète, plus grande collection européenne
sur 1914-1918 et une AOP fromagère. Les angles retenus : les Puces et l'écoquartier des
Docks à Saint-Ouen, le MAC VAL et les pochoirs de C215 à Vitry, les murs à pêches et
Méliès à Montreuil, les emplacements de Monet et la Sainte Tunique à Argenteuil, l'île de
la Grande Jatte de Seurat et l'axe historique à Neuilly, les Grands Moulins et le CND de
Kalisz à Pantin.
**Compteurs mesurés : `-a-` strict = 192, en incluant `au-` = 194 ; EN = 187 ; `GUIDES`
909 → 916.** Aucun nouveau slug hors gabarit : les deux exceptions restent `au-puy-en-velay`
et `au-tampon`.
`metaTitle` ≤ 60 caractères sur les 7 (48-55), `metaDesc` ≤ 160, densité d'accents 0,15 —
très au-dessus du seuil de détection ascii-strip (0,09). Aucun horaire, tarif ni hauteur
n'est cité : sur des équipements franciliens qui ouvrent et ferment vite, une phrase sans
chiffre a été préférée à un chiffre invérifiable. Deux points de prudence assumés dans la
copie : le marché aux puces de la porte de Montreuil est annoncé comme susceptible d'être
déplacé par le réaménagement de la porte, et le Jardin d'acclimatation, la Fondation Louis
Vuitton et Bagatelle sont présentés comme **accessibles depuis** Neuilly, pas comme situés
à Neuilly — ils relèvent de Paris 16ᵉ, et l'inverse serait faux.
⚠️ Ne pas repartir de la liste brute des communes les plus peuplées non couvertes pour le
prochain batch FR : le haut de cette liste (Nanterre, Créteil, Colombes, Aubervilliers,
Vitry déjà fait, Courbevoie, Drancy…) est majoritairement pauvre en matière touristique
vérifiable. Les gisements qui restent sont **Cergy** (Axe majeur de Dani Karavan),
**Issy-les-Moulineaux** (île Saint-Germain, tour aux figures de Dubuffet), **Aubervilliers**
(19M, Docks), **Mérignac**, **Pessac** (Cité Frugès de Le Corbusier, UNESCO) et
**Vénissieux** — puis les DROM restants.
Écart FR→EN après ce batch : **7 villes** (saint-ouen-sur-seine, vitry-sur-seine, montreuil,
argenteuil, neuilly-sur-seine, pantin, meaux) — au-dessus du seuil de ~6, donc **le prochain
run doit être un batch EN**. Attention au nommage anglais : `things-to-do-in-saint-ouen-2026`
côtoiera `things-to-do-in-saint-denis-2026` (93) et `things-to-do-in-saint-denis-reunion-2026`
déjà présents — garder le suffixe `-sur-seine` pour Saint-Ouen, Vitry et Neuilly évite toute
ambiguïté avec les homonymes français.

**Batch 27 — EN, rattrapage de parité, shipped 2026-08-08.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 26 écrites d'un coup dans `data/guides-en.ts`
(Saint-Ouen-sur-Seine, Vitry-sur-Seine, Montreuil, Argenteuil, Neuilly-sur-Seine, Pantin,
Meaux). **Compteurs mesurés : FR 194 (`-a-` strict 192 + les 2 slugs en `au-`), EN 194 —
écart nul, parité rétablie** (`EN_GUIDES` 548 → 555). Le conseil de nommage du batch 26 a été
suivi : les slugs gardent `-sur-seine` sur Saint-Ouen, Vitry et Neuilly, donc aucune collision
avec `things-to-do-in-saint-denis-2026` (93) ni `things-to-do-in-saint-denis-reunion-2026`.
Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit),
`metaTitle` 39-51 caractères, `metaDesc` 138-154, 8 sections par guide (la série FR en compte
10, la version EN fusionne les fins de liste — marchés + accès — comme les batches EN
précédents). Deux prudences reprises telles quelles du FR, à ne pas diluer : le marché aux
puces de la porte de Montreuil est annoncé comme susceptible d'être déplacé par le
réaménagement de la porte, et le Jardin d'acclimatation, la Fondation Louis Vuitton et
Bagatelle sont **accessibles depuis** Neuilly sans y être situés. Trois ajouts propres à
l'angle voyageur étranger, absents du FR parce qu'inutiles à un lecteur français : la version
originale sous-titrée du Méliès, la règle d'import du lait cru pour le brie de Meaux, et le
rappel que les Puces ferment le mardi placé dès le premier paragraphe de section.
Aucun tag nouveau : les 7 réutilisent `ile-de-france`. `npm run search-index` relancé
(`data/search-index.en.json` 555 guides) — sans ça `search-index:check` échoue.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Reprendre la liste
de gisements du batch 26 (Cergy, Issy-les-Moulineaux, Aubervilliers, Mérignac, Pessac,
Vénissieux) plutôt que la liste brute des communes les plus peuplées. Villes DROM encore non
couvertes des deux côtés, par population : Mamoudzou, Saint-André, Les Abymes, Saint-Louis
(974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph, Saint-Benoît, Baie-Mahault,
Le Robert, Le François.

**Batch 28 — FR, shipped 2026-08-11 : Cergy, Issy-les-Moulineaux, Aubervilliers, Mérignac,
Pessac, Vénissieux.** La liste de gisements laissée par les batches 26 et 27 a été honorée telle
quelle et est désormais **épuisée** — elle ne peut plus servir de point de départ au prochain
batch FR. Trois banlieues franciliennes et trois communes de métropole régionale (deux
bordelaises, une lyonnaise), c'est-à-dire le premier batch de la série qui sort d'Île-de-France
pour les grandes banlieues : Bordeaux Métropole et la Métropole de Lyon avaient exactement le
même trou que la petite couronne avant le batch 24. Angles retenus : l'Axe majeur de Dani Karavan
et le téléski nautique à Cergy, la Tour aux figures de Dubuffet et le seul musée de France
consacré à la carte à jouer à Issy, la Galerie du 19M et la Maladrerie de Renée Gailhoustet à
Aubervilliers, le parc de Bourran et le vignoble urbain Luchey-Halde à Mérignac, la cité Frugès
de Le Corbusier (UNESCO) et Pessac-Léognan à Pessac, le parc de Parilly et la mémoire de la
Marche de 1983 à Vénissieux.
**Compteurs mesurés : FR 200 (`-a-` strict 198 + les 2 slugs en `au-`), EN 194 ; `GUIDES` 933 →
939.** Aucun nouveau slug hors gabarit : les deux exceptions restent `au-puy-en-velay` et
`au-tampon`. `metaTitle` 44-53 caractères, `metaDesc` 140-153, 10 sections par guide, densité
d'accents 0,141-0,175 (seuil de détection ascii-strip : 0,09). `npm run search-index` relancé
(`data/search-index.json` 939 guides) — le FR a le même piège que l'EN, `search-index:check`
échoue sinon.
⚠️ **Trois faits ont été corrigés en cours de rédaction par vérification en ligne, et se seraient
lus comme des mesures s'ils étaient partis en l'état** : l'**Espace Albert Camus est à Bron**, pas
à Vénissieux (attribution classique, la salle dessert l'est lyonnais) ; il n'existe **pas de fort
de Vénissieux** — le fort de la ceinture lyonnaise voisine est le **fort de Bron** ; et la Marche
pour l'égalité de 1983 est **née aux Minguettes mais partie de Marseille** le 15 octobre, pas
partie de Vénissieux. La nuance origine / départ est le genre d'erreur qu'aucun contrôle
automatique n'attrape. Deux prudences assumées dans la copie, à ne pas diluer : la collection du
**CAEA à Mérignac est sur la base aérienne 106**, donc en zone militaire à accès restreint — elle
est présentée comme telle et non comme un musée ouvert le dimanche ; et la **villa des Brillants**
(second site du musée Rodin) est **accessible depuis** Issy sans y être située, elle relève de
Meudon — même traitement que le Jardin d'acclimatation au batch 26. Sur Vénissieux, les Minguettes
sont décrites en quartier habité et en histoire urbaine, sans verdict de sécurité ni jugement sur
les habitants (cf. la décision d'écarter `quartiers-a-eviter`).
Écart FR→EN après ce batch : **6 villes** (cergy, issy-les-moulineaux, aubervilliers, merignac,
pessac, venissieux) — au seuil de ~6, donc **le prochain run doit être un batch EN**. Attention au
nommage anglais : `things-to-do-in-pessac-2026` et `things-to-do-in-merignac-2026` cohabiteront
avec `things-to-do-in-bordeaux-2026` (les trois communes sont limitrophes et les guides se citent
mutuellement) ; garder `-les-moulineaux` sur Issy. Pour le batch FR **suivant**, la liste de
gisements est à reconstituer : les communes non couvertes les plus peuplées restent pauvres en
matière vérifiable, les pistes ouvertes sont plutôt les grandes banlieues de province (Villenave-d'Ornon,
Talence, Le Bouscat côté Bordeaux ; Vaulx-en-Velin, Saint-Priest, Bron côté Lyon) et les DROM
restants : Mamoudzou, Saint-André, Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni,
Le Lamentin, Saint-Joseph, Saint-Benoît, Baie-Mahault, Le Robert, Le François.

**Batch 29 — EN, rattrapage de parité, shipped 2026-08-12.** Les 6 jumelles
`things-to-do-in-[slug]-2026` du batch 28 écrites d'un coup dans `data/guides-en.ts`
(Cergy, Issy-les-Moulineaux, Aubervilliers, Mérignac, Pessac, Vénissieux). **Compteurs
mesurés : FR 200 (`-a-` strict 198 + les 2 slugs en `au-`), EN 200 — écart nul, parité
rétablie** (`EN_GUIDES` 598 → 604). Le conseil de nommage du batch 28 a été suivi :
`things-to-do-in-pessac-2026` et `things-to-do-in-merignac-2026` cohabitent avec
`things-to-do-in-bordeaux-2026`, et Issy garde `-les-moulineaux`. Aucun tag nouveau — les 6
réutilisent `ile-de-france`, `nouvelle-aquitaine`, `auvergne-rhone-alpes`.
Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit),
`metaTitle` 42-52 caractères, `metaDesc` 136-158, 8 sections par guide (la série FR en compte
10, la version EN fusionne les fins de liste comme les batches EN précédents). Les quatre
prudences du FR sont reprises telles quelles, à ne pas diluer : **CAEA sur la base aérienne
106** (zone militaire, accès restreint), **villa des Brillants accessible depuis Issy sans y
être située** (elle relève de Meudon), **cité Frugès = quartier habité** parcouru depuis la
rue, et sur Vénissieux la Marche de 1983 **née aux Minguettes mais partie de Marseille** le
15 octobre, Minguettes décrites sans verdict de sécurité, **fort de Bron** et non de
Vénissieux. `npm run search-index` relancé (`data/search-index.en.json` 604 guides).
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). La liste de
gisements du batch 26-27 étant épuisée, reprendre les pistes laissées par le batch 28 :
grandes banlieues de province (Villenave-d'Ornon, Talence, Le Bouscat côté Bordeaux ;
Vaulx-en-Velin, Saint-Priest, Bron côté Lyon) et les DROM restants — Mamoudzou, Saint-André,
Les Abymes, Saint-Louis (974), Saint-Laurent-du-Maroni, Le Lamentin, Saint-Joseph,
Saint-Benoît, Baie-Mahault, Le Robert, Le François.

**Batch 30 — FR, shipped 2026-08-13 : Saint-Laurent-du-Maroni, Mamoudzou, Le François,
Le Robert, Saint-Benoît (974), Saint-André (974), Les Abymes.** Deuxième batch outre-mer après
le 22, et le premier à couvrir **les cinq territoires DROM d'un coup** — la Guyane de l'Ouest,
Mayotte (qui n'avait **aucun** guide de la série alors que Mamoudzou est dans le seed depuis le
début), deux communes de la côte atlantique martiniquaise, deux de la côte au vent réunionnaise
et la commune la plus peuplée de Guadeloupe. Le choix est assumé contre les banlieues de province
laissées en piste par le batch 28 (Villenave-d'Ornon, Talence, Le Bouscat, Vaulx-en-Velin,
Saint-Priest, Bron) : à matière vérifiable comparée, ces sept-là en ont nettement plus, et le trou
DROM traînait depuis le batch 22. Angles retenus : le camp de la Transportation et les pirogues du
Maroni à Saint-Laurent, le lagon à double barrière et les baleines à bosse à Mamoudzou, les fonds
blancs et l'Habitation Clément au François, l'îlet Chancel et ses iguanes au Robert, Takamaka et
le Grand Étang à Saint-Benoît, le temple du Colosse et le Dipavali à Saint-André, la mangrove de
Taonaba et les Grands-Fonds aux Abymes.
⚠️ **Trois nouveaux slugs hors gabarit, dont le premier en `aux-`** : `10-choses-a-faire-**au**-francois-2026`,
`10-choses-a-faire-**au**-robert-2026` et `10-choses-a-faire-**aux**-abymes-2026` (« au François »,
« au Robert », « aux Abymes » — même raison grammaticale que `au-puy-en-velay` et `au-tampon`).
Le grep du batch 24 `'10-choses-a-faire-a[u]*-.*-2026'` **en rate désormais un** : le compte réel
se prend avec **`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`**. Ne pas « corriger » ces
cinq slugs, et ne pas les compter comme des trous EN au prochain diff — la table de correspondance
à appliquer avant tout `comm` est désormais : `puy-en-velay`→`le-puy-en-velay`,
`tampon`→`le-tampon`, `francois`→`le-francois`, `robert`→`le-robert`, `abymes`→`les-abymes`.
**Compteurs mesurés : FR 207 (`-a-` strict 202 + 4 en `au-` + 1 en `aux-`), EN 200 ; `GUIDES`
939 → 946.** `metaTitle` 44-48 caractères, `metaDesc` 141-156, 10 sections par guide, densité
d'accents 0,149-0,175 (seuil de détection ascii-strip : 0,09 ; les guides déjà livrés de la série
sont à 0,153-0,181). `npm run search-index` relancé (`data/search-index.json` 946 guides).
⚠️ **Le guide Mamoudzou porte une contrainte que les six autres n'ont pas, à ne pas diluer** : le
cyclone **Chido de décembre 2024** a détruit ou endommagé une part considérable des infrastructures
mahoraises, dont plus des deux tiers de l'offre touristique selon les bilans dressés après coup, et
la reconstruction courait toujours en 2026. L'intro le dit **avant** la première phrase sur le lagon,
et la section pratique renvoie aux sources officielles, à la tension sur la ressource en eau et au
fait que prestataires et hébergements se reconstituaient — présenter Mayotte comme une destination
balnéaire clé en main aurait été faux et potentiellement dangereux pour un lecteur. Quatre autres
prudences assumées : la baignade en mer **interdite hors lagon de la côte ouest et hors bassins
surveillés** à La Réunion (risque requin) est rappelée dans les deux guides réunionnais, **et il n'y
a pas de lagon dans l'est** ; la **baignade est interdite au bassin La Paix** (courants, profondeur)
alors qu'elle est autorisée au bassin La Mer en amont ; la **baignoire de Joséphine** est donnée
comme **tradition orale et non comme fait établi** ; et le raz-de-marée du **cyclone Jenny en 1962**
est la cause documentée de la ruine de l'église de Champ-Borne. Suivant la convention des batches 26
et 28, tout ce qui relève d'une commune voisine est écrit « **accessible depuis** » et non « situé
à » : mont Choungui (Chirongui) depuis Mamoudzou, presqu'île de la Caravelle (La Trinité) depuis
Le Robert, Anse des Cascades et Notre-Dame-des-Laves (Sainte-Rose) depuis Saint-Benoît, cascade
Niagara (Sainte-Suzanne) et vanille (Bras-Panon) depuis Saint-André, Mémorial ACTe (Pointe-à-Pitre)
et cimetière en damier (Morne-à-l'Eau) depuis Les Abymes, Awala-Yalimapo et Javouhey depuis
Saint-Laurent. Aucun horaire, tarif ni hauteur n'est cité : sur des sites ultramarins à petites
équipes et à ouverture mouvante, la copie renvoie à l'office de tourisme.
Écart FR→EN après ce batch : **7 villes** (saint-laurent-du-maroni, mamoudzou, le-francois,
le-robert, saint-benoit-reunion, saint-andre-reunion, les-abymes) — au-dessus du seuil de ~6, donc
**le prochain run doit être un batch EN**. Nommage anglais à surveiller : `things-to-do-in-le-francois-2026`,
`things-to-do-in-le-robert-2026` et `things-to-do-in-les-abymes-2026` (garder l'article, comme
`things-to-do-in-le-tampon-2026`), et **`things-to-do-in-saint-andre-2026` doit être désambiguïsé**
— `saint-andre-reunion` est le slug de seed, et l'EN porte déjà `things-to-do-in-saint-denis-2026`
(93) face à `things-to-do-in-saint-denis-reunion-2026`, donc appliquer le même traitement.
Pour le batch FR **suivant**, restent 4 villes DROM non couvertes des deux côtés : Le Lamentin (972),
Baie-Mahault (971), Saint-Louis (974), Saint-Joseph (974) — trop peu pour un batch entier et les
trois premières sont pauvres en matière touristique vérifiable ; les compléter avec les banlieues de
province laissées par le batch 28.

**Batch 31 — EN, rattrapage de parité, shipped 2026-08-15.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 30 écrites d'un coup dans `data/guides-en.ts`
(Saint-Laurent-du-Maroni, Mamoudzou, Le François, Le Robert, Saint-Benoît 974, Saint-André 974,
Les Abymes). **Compteurs mesurés : FR 207 (`-a-` strict 202 + 4 en `au-` + 1 en `aux-`), EN 207 —
écart nul, parité rétablie** (`EN_GUIDES` 628 → 635). C'est le batch qui **achève la couverture EN
de l'outre-mer** : les cinq territoires DROM ont désormais autant de guides tourisme d'un côté que
de l'autre, et **Mayotte entre dans le corpus anglais** (le tag `mayotte` est le seul tag nouveau,
il crée `/tags/mayotte` côté EN — les six autres réutilisent `reunion`, `martinique`, `guadeloupe`,
`french guiana`). Le nommage annoncé par le batch 30 a été suivi : article conservé sur
`things-to-do-in-le-francois-2026`, `-le-robert-2026` et `-les-abymes-2026` (comme
`things-to-do-in-le-tampon-2026`), et **`things-to-do-in-saint-andre-reunion-2026` est désambiguïsé**
au même titre que `saint-benoit-reunion`, sur le modèle `saint-denis-2026` (93) vs
`saint-denis-reunion-2026`.
Écrit en anglais natif depuis les faits des guides FR (aucun chiffre qui n'y soit), `metaTitle`
41-46 caractères, `metaDesc` 150-157, 8 sections par guide (la série FR en compte 10, la version EN
fusionne les fins de liste comme les batches EN précédents). `npm run search-index` relancé
(`data/search-index.en.json` 635 guides, 83 tags) et `npm run sitemap:check` repassé à cause du tag
neuf — 28 495 URL EN, chaque URL déclarée a une page.
⚠️ **La contrainte Mamoudzou du batch 30 est reprise telle quelle et ne doit pas être diluée** : le
cyclone **Chido de décembre 2024** et la reconstruction toujours en cours en 2026 sont dits dans
l'intro **avant** la première phrase sur le lagon, et la section pratique répète que rien ne se
réserve la veille, que la ressource en eau reste sous tension et qu'il faut vérifier la situation
auprès des sources officielles. Les autres prudences du FR sont conservées : baignade en mer
**interdite hors lagon de la côte ouest et hors bassins surveillés** à La Réunion, **rappelée dans
les deux guides réunionnais avec la précision qu'il n'y a pas de lagon dans l'est** ; **baignade
interdite au bassin La Paix**, autorisée au bassin La Mer en amont ; **baignoire de Joséphine**
donnée comme tradition orale et non comme fait établi ; **cyclone Jenny 1962** comme cause de la
ruine de l'église de Champ-Borne. Et la convention « **accessible depuis** » plutôt que « situé à »
tient sur les sites de communes voisines : mont Choungui, presqu'île de la Caravelle, Anse des
Cascades et Notre-Dame-des-Laves, cascade Niagara et vanille de Bras-Panon, Mémorial ACTe et
cimetière de Morne-à-l'Eau, Awala-Yalimapo et Javouhey.
Trois ajouts propres à l'angle voyageur étranger, absents du FR parce qu'inutiles à un lecteur
français : le fait que le français n'est pas toujours la langue du marché de Mamoudzou (shimaoré et
kibushi), le rappel qu'un aller-retour à Albina est un **franchissement de frontière
internationale** dont les formalités se règlent avant d'embarquer et non sur le quai, et la mise en
garde qu'un opérateur proposant de nager au milieu d'un groupe de baleines vous met **en
infraction**.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Restent 4 villes DROM
non couvertes des deux côtés — Le Lamentin (972), Baie-Mahault (971), Saint-Joseph (974) et
Saint-Louis (974), **dont Saint-Louis n'est pas dans `CITIES_SEED`** (vérifié ce run : le slug
`saint-louis-reunion` n'existe pas, donc la ville ne peut pas avoir de guide tant qu'elle n'est pas
au seed) : cela ne fait que 3 candidats réels, trop peu pour un batch. Les compléter avec les
banlieues de province laissées par le batch 28, toutes vérifiées présentes au seed et sans guide :
**Villenave-d'Ornon, Talence, Le Bouscat** (Bordeaux Métropole) et **Vaulx-en-Velin, Saint-Priest,
Bron** (Métropole de Lyon). Rappel utile pour Bron : le batch 28 a établi que **l'Espace Albert
Camus et le fort de la ceinture lyonnaise sont à Bron**, pas à Vénissieux — le guide Bron doit les
reprendre, et le guide Vénissieux ne doit pas être « corrigé » en sens inverse.

**Batch 32 — FR, shipped 2026-08-18 : Le Lamentin (972), Baie-Mahault (971), Saint-Louis (974),
Saint-Joseph (974), Les Sables-d'Olonne, Vincennes.** Ce batch **clôt la couverture outre-mer côté
FR : les 18 villes DROM du seed ont désormais leur guide tourisme**, et il corrige au passage une
erreur de vérification du batch 31.
⚠️ **Saint-Louis (Réunion) EST dans `CITIES_SEED`** — sous le slug **`saint-louis-reunion-974`**, pas
`saint-louis-reunion`. Le batch 31 avait cherché le second, ne l'avait pas trouvé et en avait conclu
que la ville était absente du seed : elle ne l'a jamais été. Leçon générale, la même qu'ailleurs dans
ce fichier : **une absence se constate en listant, pas en testant un slug deviné** (`CITIES_SEED.find`
sur une liste imprimée, pas un `grep` sur une intuition).
Les deux villes métropolitaines sont un **écart assumé avec la liste de gisements laissée par le
batch 28** (Villenave-d'Ornon, Talence, Le Bouscat, Vaulx-en-Velin, Saint-Priest, Bron), au nom de la
correction de méthode du batch 26 : on choisit par **matière touristique réelle**, pas par inertie de
liste. Les Sables-d'Olonne — port de départ du Vendée Globe, station balnéaire de référence de la
Vendée — et Vincennes — seule résidence royale médiévale conservée d'Île-de-France, au terminus de la
ligne 1 — étaient les deux plus gros trous du corpus, très au-dessus de trois banlieues bordelaises.
Ces six-là restent en piste pour un batch FR ultérieur.
**Compteurs mesurés : FR 213 (`-a-` strict 206 + 5 en `au-` + 2 en `aux-`), EN 207 ; `GUIDES` 967 →
973.** `metaTitle` 37-50 caractères, `metaDesc` 143-159, 10 sections par guide, densité d'accents
0,139-0,174 (seuil de détection ascii-strip : 0,09). `npm run search-index` relancé
(`data/search-index.json` 973 guides, 241 tags) et **`npm run sitemap:check` repassé** — le tag
`que faire en Guadeloupe` a franchi le seuil des 3 guides et crée `/tags/que-faire-en-guadeloupe`.
⚠️ **Deux nouveaux slugs hors gabarit** : `10-choses-a-faire-**au**-lamentin-2026` et
`10-choses-a-faire-**aux**-sables-d-olonne-2026`. Le compte réel se prend toujours avec
**`grep -c 'slug: "10-choses-a-faire-a[ux]*-.*-2026"'`**, et la table de correspondance à appliquer
avant tout `comm` s'allonge : `puy-en-velay`→`le-puy-en-velay`, `tampon`→`le-tampon`,
`francois`→`le-francois`, `robert`→`le-robert`, `abymes`→`les-abymes`, `lamentin`→`le-lamentin`,
`sables-d-olonne`→`les-sables-d-olonne`.
⚠️ **Ces slugs à article rendaient leur propre guide invisible sur la page de la ville — corrigé ce
run.** `app/villes/[slug]/a-faire/page.tsx` ne cherchait que `10-choses-a-faire-a-${slug}-2026`, et
`guideCityPhoto()` (`lib/city-images.ts`) n'acceptait le rapprochement que sur le slug de seed entier :
les **7** guides concernés n'avaient donc ni carte « guide en vedette » ni photo d'en-tête, en silence,
depuis le batch 22. Les deux sites tentent désormais les formes contractées `au-`/`aux-` sur le slug
privé de son article. L'élision **exige la présence de l'article contracté** dans le slug du guide
(`-au-<stem>-` / `-aux-<stem>-`) et non le seul radical : rapprocher sur `-rochelle-` ou `-havre-`
ouvrirait la porte aux faux positifs que le commentaire de `guideCityPhoto` interdit depuis l'origine.
Six faits ont été **vérifiés en ligne avant rédaction** et portent les guides : l'église
Saint-Jean-Baptiste de Baie-Mahault est une **Ali Tur** de 1931 en béton armé, **classée MH en 2017**,
reconstruite après le cyclone de 1928 ; le **temple du Gol** de Saint-Louis est le **plus ancien temple
hindou de La Réunion**, élevé en 1856 par des engagés indiens, **inscrit MH en 1996** ; l'**église
Saint-Louis de Vincennes** (1914-1924, Droz et Marrast, béton armé, **classée MH en 1996**) porte des
fresques de Maurice Denis ; le **MASC** des Sables conserve les plus grandes collections publiques
**Chaissac** et **Brauner** ; le **gecko vert de Manapany** (*Phelsuma inexpectata*) est endémique du
seul littoral sud de La Réunion et en danger critique ; et **La Favorite**, fondée en 1842 et toujours
mue à la vapeur, a bien une **adresse au Lamentin** tout en étant à la limite de Fort-de-France.
Trois prudences assumées dans la copie, à ne pas diluer : ① **le bois de Vincennes n'est pas à
Vincennes** — il appartient à la Ville de Paris et relève du 12ᵉ arrondissement, donc Parc floral,
zoo, hippodrome, arboretum et Cartoucherie sont écrits « **accessibles depuis** », même traitement que
le Jardin d'acclimatation au batch 26 ; la section 7 le dit explicitement plutôt que de laisser le
lecteur le croire ; ② la règle réunionnaise est répétée dans les deux guides 974 avec sa précision
géographique — **pas de lagon devant Saint-Louis, pas de lagon dans le sud** — et les arrêtés de
baignade de la rivière Langevin sont donnés comme **variables et affichés sur place**, jamais résumés
en « c'est autorisé » ; ③ le **chlordécone** est nommé dans le guide Lamentin comme un fait
documenté de la plaine agricole, sans chiffre et sans verdict. Aucun horaire, tarif ni hauteur n'est
cité, à la seule exception des ~52 m du donjon de Vincennes et des ~995 ha du bois, qui sont des
constantes publiées.
Écart FR→EN après ce batch : **6 villes** (le-lamentin, baie-mahault, saint-louis-reunion-974,
saint-joseph-reunion, les-sables-d-olonne, vincennes) — au seuil de ~6, donc **le prochain run doit
être un batch EN**. Nommage anglais à surveiller : garder l'article sur
`things-to-do-in-le-lamentin-2026` et `things-to-do-in-les-sables-d-olonne-2026` (comme
`things-to-do-in-le-tampon-2026`), et **désambiguïser les deux 974** —
`things-to-do-in-saint-louis-reunion-2026` et `things-to-do-in-saint-joseph-reunion-2026`, sur le
modèle déjà en place de `saint-denis-reunion` / `saint-andre-reunion` / `saint-benoit-reunion`.
Attention : le seed écrit `saint-louis-reunion-**974**`, mais le suffixe numérique n'a pas à passer
côté EN, où aucun autre slug ne le porte.
Pour le batch FR **suivant**, l'outre-mer est épuisé : reprendre les six banlieues de province laissées
intactes ici (Villenave-d'Ornon, Talence, Le Bouscat ; Vaulx-en-Velin, Saint-Priest, Bron — rappel du
batch 28 : **l'Espace Albert Camus et le fort de la ceinture lyonnaise sont à Bron**, pas à Vénissieux)
ou continuer sur les trous touristiques réels du corpus, dont les plus nets après ce batch sont
**Salon-de-Provence** (château de l'Empéri, Nostradamus), **Saint-Quentin** (Art déco, pastels de
Quentin de La Tour), **Brive-la-Gaillarde**, **La Seyne-sur-Mer** et **Saint-Herblain**.

**Batch 33 — EN, rattrapage de parité, shipped 2026-08-20.** Les 6 jumelles
`things-to-do-in-[slug]-2026` du batch 32 écrites d'un coup dans `data/guides-en.ts` (Le Lamentin,
Baie-Mahault, Saint-Louis 974, Saint-Joseph 974, Les Sables-d'Olonne, Vincennes). **Compteurs
mesurés : FR 213, EN 213 — écart nul, parité rétablie** (`EN_GUIDES` 701 → 707).
⚠️ **Le conseil de nommage du batch 32 sur le suffixe `-974` a été écarté, et il faut savoir
pourquoi.** Il annonçait que « le suffixe numérique n'a pas à passer côté EN ». C'est vrai du style
et faux du fonctionnement : `app/[locale]/cities/[slug]/things-to-do/page.tsx` résout son guide par
`getEnGuide('things-to-do-in-' + slug + '-2026')` **sur le slug de seed**, donc
`things-to-do-in-saint-louis-reunion-2026` serait resté invisible sur la page de Saint-Louis — le
défaut même que le batch 32 venait de corriger côté FR pour les slugs à article. Le slug livré est
**`things-to-do-in-saint-louis-reunion-974-2026`**. **Règle générale : côté EN, le slug d'un guide
de série se dérive du slug de seed tel quel, jamais d'une version « propre » de celui-ci** ; le
rapprochement photo (`guideCityPhoto`) suit la même clé. Les 6 guides ont été vérifiés retrouvés
par le lookup **et** pourvus de leur photo d'en-tête après écriture.
Écrit en anglais natif depuis les faits des guides FR, `metaTitle` 42-47 caractères, `metaDesc`
147-154, 8 sections par guide (la série FR en compte 10, l'EN fusionne les fins de liste). Aucune
figure en `/10`, aucun horaire, aucun tarif. Les prudences du FR sont reprises telles quelles :
mangrove non baignable, chlordécone nommé sans chiffre ni verdict, La Favorite avec adresse au
Lamentin, baignade en mer interdite hors lagon ouest et bassins surveillés à La Réunion (**pas de
lagon devant Saint-Louis, pas de lagon dans le sud**), arrêtés de la rivière Langevin affichés sur
place et faisant foi, **bois de Vincennes accessible depuis Vincennes sans y être situé**.
Cinq ajouts propres à l'angle voyageur étranger : les **DROM ne sont pas dans Schengen** (un visa
Schengen n'y vaut pas), la Martinique est **hors territoire TVA et accises de l'UE** donc le rhum
relève d'une franchise voyageur renvoyée à la douane sans chiffre imprimé, **La Réunion est à UTC+4
sans heure d'été et ses saisons sont inversées**, la signalétique **vert/jaune/rouge** d'une plage
surveillée est réglementaire, et les **vacances scolaires** commandent la foule (Vendée = académie
de Nantes, **zone B**, dates renvoyées au calendrier officiel, aucune date citée).
**Tags** : aucun tag neuf inventé, mais `guadeloupe` franchit le seuil de 3 guides et **crée
`/tags/guadeloupe` côté EN** (99 → 100), d'où le passage de `npm run sitemap:check` (FR 29 040 URL,
EN 28 584). `npm run search-index` relancé (`data/search-index.en.json` 707 guides, 100 tags).
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). L'outre-mer est épuisé
des deux côtés ; reprendre les six banlieues de province jamais faites (Villenave-d'Ornon, Talence,
Le Bouscat ; Vaulx-en-Velin, Saint-Priest, Bron) ou les trous touristiques listés au batch 32.

**Batch 34 — FR, shipped 2026-08-25 : Salon-de-Provence, Saint-Quentin, Brive-la-Gaillarde,
La Seyne-sur-Mer, Valenciennes, Thionville.** Les cinq trous touristiques listés au batch 32 ont été
honorés (Saint-Herblain écarté, voir plus bas) et **Valenciennes et Thionville s'y ajoutent** : ce
sont les deux plus gros manques restants après eux, et l'un comme l'autre pèsent plus lourd, en
matière vérifiable, que les six banlieues bordelaises et lyonnaises encore en piste — Valenciennes
tient un musée des Beaux-Arts de rang national et deux artistes majeurs nés sur place, Thionville un
millénaire de fortifications frontalières. C'est le même arbitrage qu'au batch 32, et pour la même
raison : **on choisit par matière touristique réelle, pas par inertie de liste.** Les six banlieues
(Villenave-d'Ornon, Talence, Le Bouscat ; Vaulx-en-Velin, Saint-Priest, Bron) **restent en piste** et
n'ont toujours pas été faites — rappel du batch 28 : l'Espace Albert Camus et le fort de la ceinture
lyonnaise sont **à Bron**, pas à Vénissieux.
**Compteurs mesurés : FR 219 (`-a-` strict 212 + 5 en `au-` + 2 en `aux-`), EN 213 ; `GUIDES` 989 →
995.** Aucun nouveau slug hors gabarit : les sept exceptions restent `au-puy-en-velay`, `au-tampon`,
`au-francois`, `au-robert`, `au-lamentin`, `aux-abymes`, `aux-sables-d-olonne`. `metaTitle` 38-46
caractères, `metaDesc` 143-156, 10 sections par guide, densité d'accents 0,150-0,179 (les guides déjà
livrés de la série sont à 0,154-0,179 ; seuil de détection ascii-strip 0,09 — **la densité se mesure
par mot, pas par lettre**, une confusion qui fait sortir 0,035 et croire à une régression).
`npm run search-index` relancé (`data/search-index.json` 995 guides, 245 tags — aucun tag neuf, donc
aucune page `/tags/` créée) et `npm run sitemap:check` repassé (FR 29 067 URL, EN 28 623). Les six
guides ont été vérifiés **retrouvés par le lookup de `app/villes/[slug]/a-faire/page.tsx` et pourvus
de leur photo d'en-tête** (`guideCityPhoto`) après écriture — le contrôle que le batch 32 a dû
ajouter après coup.
⚠️ **Faits vérifiés en ligne avant rédaction, et qui portent les guides** : le château de l'Empéri
(Salon) est un fief des **archevêques d'Arles**, et son musée d'art et d'histoire militaires vient de
la **collection Raoul et Jean Brunon**, entrée dans les collections nationales par l'accord de 1967 et
déposée à Salon ; Nostradamus achète sa maison en **1547** et y meurt en **1566**, mais son tombeau
est à la collégiale Saint-Laurent **par transfert** — il avait d'abord été inhumé au couvent des
Cordeliers, détruit à la Révolution ; le festival **Musique à l'Empéri** a été créé en 1993 par Éric
Le Sage, Paul Meyer et Emmanuel Pahud ; l'hôtel de ville de Saint-Quentin est un chantier **1331-1509**
restauré **en Art déco en 1926** par Louis Guindez, soit gothique flamboyant dehors et années 1920
dedans ; le monument aux morts de Saint-Quentin (inauguré le **31 juillet 1927**) est de **Paul Bigot**
avec **Bouchard et Landowski** ; la crypte de la collégiale de Brive montre les vestiges d'une
basilique du **Ve siècle** dégagés en **1986-1987** ; le pont levant de La Seyne date de **1917**
(société Daydé), est inscrit MH le **3 novembre 1987** et a rouvert au public en **2009** ; les
Sablettes ont été reconstruites **entre 1950 et 1953 par Fernand Pouillon** (label Patrimoine du XXe
siècle en 2004) ; le fronton de Carpeaux de l'hôtel de ville de Valenciennes est **tombé dans
l'incendie de la nuit du 21 au 22 mai 1940** et a été **refait à l'identique par Albert Patrisse** —
ce qu'on regarde depuis la place n'est pas la pierre d'origine ; le Mont-de-Piété de Valenciennes est
de **Wenceslas Cobergher, 1622-1625** ; le fort de **Guentrange** est allemand (chantier ouvert en
**avril 1899**, opérationnel en **1905**) et Guentrange **fait partie de Thionville**, ce n'a jamais
été une commune autonome.
Trois prudences assumées dans la copie, à ne pas diluer : ① la **base aérienne 701** de Salon est une
**emprise militaire** — la Patrouille de France y est stationnée depuis 1964 et l'École de l'air y
forme les officiers, mais on n'y entre pas librement ; le guide le dit avant de parler de la
Patrouille, même traitement que le CAEA sur la base 106 à Mérignac (batch 28) ; ② convention
« **accessible depuis** » plutôt que « situé à » sur tout ce qui relève d'une commune voisine —
**Notre-Dame du Mai** (Six-Fours-les-Plages) depuis La Seyne, **château de La Grange** (Manom) et
**fort du Hackenberg** (Veckring) depuis Thionville, **Collonges-la-Rouge / Turenne / Sarlat** depuis
Brive, l'**aéroport de Brive** étant lui-même sur **Nespouls** ; ③ la **maison espagnole** de
Valenciennes a longtemps abrité l'office de tourisme, dont le **transfert vers le Mont-de-Piété** est
engagé : le guide dit de vérifier l'adresse plutôt que d'affirmer l'une ou l'autre. Aucun horaire,
aucun tarif, aucune hauteur n'est cité, et le seul chiffre non patrimonial est la population Insee
2022 lue dans `data/city-population.json` (Salon 44 553, Saint-Quentin 52 995, Brive 46 769, La Seyne
62 905, Valenciennes 42 979, Thionville 42 778) — pas les `population` approximatives du seed.
⚠️ **`npm run build` n'a pas été lancé, volontairement** : c'est ce que la section Commands interdit
depuis le batch 27 (4 h 30 de génération, `.next` à 25 Go, aucun signal utile). Le substitut prescrit
a été exécuté en entier et passe : `npx tsc --noEmit` **propre**, `npm run integrity`, `search-index`
+ `search-index:check`, `sitemap:check`, plus le contrôle de lookup / photo ci-dessus. Note
d'environnement pour le prochain run : le conteneur de routine démarre **sans `node_modules`**, et
`npx tsc --noEmit` y renvoie alors **43 762 erreurs réparties sur tout le dépôt** (`Property 'key'
does not exist`, `Type 'undefined' is not assignable`, `Cannot find module 'zod'`). Ce n'est pas une
régression, c'est l'installation absente — **lancer `npm install` avant de conclure quoi que ce soit
d'un `tsc` massivement rouge**.
Écart FR→EN après ce batch : **6 villes** (salon-de-provence, saint-quentin, brive-la-gaillarde,
la-seyne-sur-mer, valenciennes, thionville) — au seuil de ~6, donc **le prochain run doit être un
batch EN**. Rappel de la règle tranchée au batch 33 : côté EN, le slug se dérive du **slug de seed
tel quel** (`getEnGuide('things-to-do-in-' + slug + '-2026')`), jamais d'une version « propre » —
donc `things-to-do-in-la-seyne-sur-mer-2026` garde son article et son `-sur-mer`, et
`things-to-do-in-brive-la-gaillarde-2026` garde `-la-gaillarde`. Attention à
`things-to-do-in-saint-quentin-2026` : c'est la ville de l'Aisne, à ne pas confondre avec le
**mont Saint-Quentin** de la Somme, qui revient dans les sources anglophones sur 1918.
Pour le batch FR **suivant**, les gisements restants sont les six banlieues de province ci-dessus et,
côté trous touristiques, **Saint-Herblain** (écarté ici faute de matière : Zénith, ONYX et vallée du
Cens ne font pas dix entrées vérifiables), **Mantes-la-Jolie** (collégiale Notre-Dame, tour
Saint-Maclou), **Istres** (étang de Berre, vieux village) et **Cambrai**, seule ville du Nord de cette
taille encore sans guide.

**Batch 35 — EN, rattrapage de parité, shipped 2026-08-26.** Les 6 jumelles
`things-to-do-in-[slug]-2026` du batch 34 écrites d'un coup dans `data/guides-en.ts`
(Salon-de-Provence, Saint-Quentin, Brive-la-Gaillarde, La Seyne-sur-Mer, Valenciennes, Thionville).
**Compteurs mesurés : FR 219, EN 219 — écart nul dans les deux sens, parité rétablie**
(`EN_GUIDES` 743 → 749). Aucun nouveau slug hors gabarit : les six slugs de seed s'écrivent tels
quels, donc la règle du batch 33 (**côté EN le slug se dérive du slug de seed tel quel**) n'avait
rien à arbitrer. Les 6 guides ont été vérifiés **retrouvés par le lookup de
`app/[locale]/cities/[slug]/things-to-do/page.tsx` et pourvus de leur photo d'en-tête**
(`guideCityPhoto`) après écriture. `metaTitle` 35-52 caractères, `metaDesc` 143-155, 8 sections par
guide (la série FR en compte 10, l'EN fusionne les fins de liste). Aucune figure en `/10`, aucun
horaire, aucun tarif : les seuls chiffres sont ceux des guides FR. Aucun tag neuf — les six
réutilisent `provence-alpes-cote-d-azur`, `hauts-de-france`, `nouvelle-aquitaine`, `grand-est`.
`npm run search-index` relancé (`data/search-index.en.json` 749 guides, 103 tags, inchangé) et
`npm run sitemap:check` repassé (EN 28 623 → 28 629).
Les prudences du FR sont reprises telles quelles, à ne pas diluer : **base aérienne 701 = emprise
militaire**, dite avant la première phrase sur la Patrouille de France ; **fronton de l'hôtel de
ville de Valenciennes = reprise d'Albert Patrisse** après l'incendie du 21-22 mai 1940, pas la
pierre d'origine ; **maison espagnole**, adresse de l'office de tourisme à vérifier ; **savon de
Marseille protégé par aucune appellation** ; et « **accessible depuis** » plutôt que « situé à »
sur Notre-Dame du Mai (Six-Fours), La Grange (Manom), le Hackenberg (Veckring),
Collonges-la-Rouge / Turenne / Sarlat et l'aéroport de Nespouls.
Six ajouts propres à l'angle voyageur étranger, absents du FR : la Patrouille de France présentée
par son équivalent (Red Arrows) et le mistral expliqué en une incise ; « collégiale » et
« basilique » définis comme titres et non comme rangs épiscopaux ; la **désambiguïsation
Saint-Quentin (Aisne) vs mont Saint-Quentin (Somme)** — celui des récits anglophones de 1918 —
posée dès l'intro ; Top 14 et Pro D2 nommés comme les deux divisions professionnelles du rugby
français ; la **fermeture préfectorale du cap Sicié** pour risque incendie donnée comme règle
opposable, et les navettes maritimes de la rade dites transport en commun au tarif d'un ticket ;
et le fait que les frontières belge et luxembourgeoise sont des **passages Schengen intérieurs
sans formalité mais avec pièce d'identité**, Trèves s'appelant **Trier** en allemand.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Gisements inchangés :
les six banlieues de province jamais faites (Villenave-d'Ornon, Talence, Le Bouscat ;
Vaulx-en-Velin, Saint-Priest, Bron — rappel : l'Espace Albert Camus et le fort de la ceinture
lyonnaise sont **à Bron**) et les trous listés au batch 34 (Saint-Herblain, Mantes-la-Jolie,
Istres, Cambrai).

**Batch 38 — FR, shipped 2026-09-01 : Poissy, Rueil-Malmaison, Vernon, Dole, Soissons, Cambrai,
Carpentras.** Sept villes, six régions, prises **dans la liste de gisements laissée par les batches
34 et 36** — pour la première fois depuis longtemps le batch n'a rien eu à arbitrer contre elle :
Cambrai était le trou nommé par le batch 34, Poissy, Rueil-Malmaison, Vernon, Dole, Soissons et
Carpentras étaient six des neuf trous nommés par le batch 36. Il en reste trois de cette liste
(**Bergerac, Agde, Thonon-les-Bains**), plus Saint-Herblain, Mantes-la-Jolie et Istres du batch 34,
plus les six banlieues de province jamais faites (Villenave-d'Ornon, Talence, Le Bouscat ;
Vaulx-en-Velin, Saint-Priest, Bron — rappel du batch 28 : **l'Espace Albert Camus et le fort de la
ceinture lyonnaise sont à Bron**, pas à Vénissieux).
**Compteurs mesurés : FR 233 (`-a-` strict 226 + 5 en `au-` + 2 en `aux-`), EN 226 ; `GUIDES` 1035
→ 1042.** Aucun nouveau slug hors gabarit : les sept villes prennent « à » sans contraction, les
sept exceptions restent `au-puy-en-velay`, `au-tampon`, `au-francois`, `au-robert`, `au-lamentin`,
`aux-abymes`, `aux-sables-d-olonne`. `metaTitle` 32-43 caractères, `metaDesc` 141-155, 10 sections
par guide, densité d'accents 0,131-0,174 **par mot** (seuil ascii-strip 0,09), 0 à 5 em-dashes par
guide pour ~1 050 mots (cible R7.10 : ~1 pour 200 mots). `npm run search-index` relancé
(`data/search-index.json` 1 042 guides, 250 → **251 tags** : « que faire dans le Nord » franchit le
seuil de 3 guides et crée `/tags/que-faire-dans-le-nord`), d'où le passage de
`npm run sitemap:check` (FR 29 123 URL, EN 28 694, chaque URL déclarée a une page et
réciproquement). Les sept guides sont vérifiés **retrouvés par le lookup de
`app/villes/[slug]/a-faire/page.tsx` et pourvus de leur photo d'en-tête** (`guideCityPhoto`).
⚠️ **Le fait le plus utile du batch est une correction de la liste de gisements elle-même : le musée
de Vernon ne s'appelle plus musée Alphonse-Georges-Poulain.** Il a été **rebaptisé musée Blanche
Hoschedé-Monet en 2024**, nom choisi par les habitants pour la belle-fille de Monet, peintre à part
entière ; l'ancien nom lui avait été donné en 1966 pour l'archéologue conservateur en poste depuis
1922. Le batch 36 l'avait inscrit au vivier sous son ancien nom, et une page qui envoie un lecteur
chercher une enseigne qui n'existe plus se lit comme une page périmée. Trois pièges de localisation
écartés de la même façon, convention « **accessible depuis** » plutôt que « situé à » : le **parc du
Peuple de l'herbe est à Carrières-sous-Poissy**, de l'autre côté de la Seine, pas à Poissy ; le char
**Deborah est à Flesquières**, à une dizaine de kilomètres de Cambrai ; **Giverny est une commune à
part entière** à cinq à sept kilomètres de Vernon, pas un quartier de Vernon ; et la **forêt de
Chaux** relève des communes voisines de Dole, dont La Vieille-Loye.
Faits vérifiés en ligne avant rédaction et qui portent les guides : villa Savoye **1928-1931**,
**classée MH le 12 décembre 1965**, quatre mois après la mort de Le Corbusier, **UNESCO juillet
2016** dans la série transnationale de **dix-sept** réalisations, loge du jardinier comprise dans le
bien ; collégiale de Poissy fondée **vers 1016** par Robert le Pieux ; **Louis IX né le 25 avril
1214** à Poissy et baptisé quelques jours plus tard, fonts devenus relique après la canonisation de
**1297**, restaurés en **1630**, grille dessinée par **Viollet-le-Duc** ; prieuré royal décidé par
Philippe le Bel après la canonisation du **11 août 1297**, détruit à la Révolution, **seule la
porterie subsiste**, inscrite MH en **1933**, aujourd'hui musée du Jouet ; **parc Meissonier** 12 ha,
cèdre du Liban centenaire, **Ernest Meissonier (1815-1891)** installé à Poissy en **1846**, parc
propriété de la ville depuis **1952** ; usine **Ford SAF ouverte en 1938**, rachetée par **Simca en
juillet 1954**, nouvelle usine inaugurée en **octobre 1958** (château d'eau de **75 m**, un millier
de véhicules par jour), **Stellantis depuis 2021**, campus en **2025** ; **parc du Peuple de l'herbe
113 ha**, ouvert depuis **2016** ; Malmaison achetée par Joséphine le **21 avril 1799** pour
**325 000 francs**, résidence privée jusqu'en 1814, **divorce en 1809**, **Joséphine y meurt le 29
mai 1814**, domaine racheté par **Daniel Iffla dit Osiris en 1896** et donné à l'État, **musée ouvert
en 1905** ; **parc de Bois-Préau 17 ha**, fermé le mardi ; **monument funéraire de Joséphine élevé en
1825** par Eugène et Hortense dans la chapelle Saint-Nicolas à droite du chœur, **cénotaphe
d'Hortense élevé en 1858** par Napoléon III à gauche, corps en crypte dans un sarcophage antique ;
**orgue Cavaillé-Coll classé MH depuis 1970**, restauré en **2017** ; **Atelier Grognard**, ancienne
usine de plaques de cuivre, zinc et étain pour la gravure, **plus de 650 m²** ; **Vieux-Moulin** de
Vernon sur deux piles du pont du **XIIe siècle**, dernier des **six** moulins, peint par Monet sous
le titre *Vieille maison sur le pont* (musée de La Nouvelle-Orléans) ; **château des Tourelles**
élevé après la prise de Vernon par **Philippe Auguste en 1196**, tour carrée et quatre tourelles
rondes, une vingtaine de mètres, quasi inchangé depuis huit cents ans ; **musée des impressionnismes
de Giverny créé en 2009** ; **Pasteur né à Dole le 27 décembre 1822**, maison devenue musée en
**1923** ; **clocher de la collégiale de Dole 73 m**, achevé en **1596** sur un dessin de **Hugues
Sambin** inspiré de Santa Maria di Carignano à Gênes, **82 m à l'origine**, abaissé de **9 m** après
le siège de **1636** et une tempête ; Dole capitale de la Franche-Comté **jusqu'en 1678** (traité de
Nimègue), **université transférée à Besançon en mai 1691** par lettres patentes de Louis XIV ;
**Hôtel-Dieu de Dole réhabilité entre 1998 et 2000** en médiathèque, bibliothèque patrimoniale et
archives ; **forêt de Chaux 20 493 ha**, deuxième massif feuillu de France après Orléans ; tours de
**Saint-Jean-des-Vignes 75 et 80 m**, site vendu à l'évêque en **1804**, **démontage de 1805 à
1825** pour restaurer la cathédrale, façade sauvée après une campagne à laquelle **Victor Hugo** a
prêté sa voix ; cathédrale de Soissons **nef 110 m**, **30,33 m sous voûte**, **tour 66 m**,
**croisillon sud arrondi construit vers 1176-1190** face à un bras nord à mur plat ; **Adoration des
bergers de Rubens, vers 1618-1620**, bras **nord** du transept, armes de **Simon Le Gras
(1624-1656)** ajoutées, évacuée pendant les deux guerres, restaurée en **1949** et **1993** ; musée
de Soissons **inauguré en 1857**, installé **depuis 1933** dans l'abbaye Saint-Léger ; vase de
Soissons raconté par **Grégoire de Tours, livre II**, bataille de **486** ; **beffroi de Cambrai**,
ancien clocher Saint-Martin **1447-1474**, **62 m**, **UNESCO 2005** ; cathédrale actuelle = ancienne
**abbatiale du Saint-Sépulcre rebâtie 1696-1702** sous **Fénelon**, **cathédrale en 1804** par
**Louis Belmas** ; **cathédrale gothique disparue**, flèche de **110 m**, « merveille des Pays-Bas » ;
**mausolée de Fénelon par David d'Angers, 1826** ; **icône Notre-Dame de Grâce vers 1340** ; **maison
espagnole de 1595**, office de tourisme ; musée de Cambrai dans l'**hôtel de Francqueville (1720)**,
**dépôts de l'État à partir de 1923** ; **bataille de Cambrai du 20 novembre au 7 décembre 1917**,
**476 chars engagés dont 378 au combat**, ligne Hindenburg percée sur **9 à 12 km** sauf à
Flesquières, contre-attaque allemande le **30 novembre** ; **Deborah D51**, Mark IV femelle, **28 t,
8 m, 2,5 m**, retrouvé en **novembre 1998** par **Philippe Gorczynski** sous **3 m** de terre après
**81 ans**, centre d'interprétation **inauguré le 25 novembre 2017**, **4 des 8** membres d'équipage
au cimetière du Commonwealth voisin ; **bêtise de Cambrai vers 1830**, procès conclu en **1889**
(Afchain « seul inventeur », Despinoy « créateur ») ; **synagogue de Carpentras 1367**, la plus
ancienne de France en activité, restaurée au XVIIIe par **Antoine d'Allemand**, bains rituels et deux
fours au rez-de-chaussée ; **expulsion des juifs du royaume de France en 1306** et résidence
autorisée dans **quatre villes** du Comtat (Carpentras, Cavaillon, Avignon, L'Isle-sur-la-Sorgue) ;
**cathédrale Saint-Siffrein commencée en 1404** sur ordre de l'antipape **Benoît XIII**, achevée en
**1519**, façade baroque du XVIIe, **portail sud dit porte Juive** ; **arc romain du Ier siècle** ;
**hôtel-Dieu financé par Malachie d'Inguimbert, chantier 1750-1769**, travaux **2014-2017**,
**Inguimbertine ouverte début novembre 2017** (inauguration le samedi **4 novembre**), **~1 800 m²**,
**~60 000 documents**, une quarantaine de tableaux, plus de cent objets ; **marché aux truffes le
vendredi de novembre à mars** ; **berlingot** au sirop de fruits confits, sorti du statut médicinal
en **1844** par **François Pascal Long** ; **ligne Avignon-Carpentras rouverte aux voyageurs en avril
2015**, une quinzaine de kilomètres, une trentaine de minutes.
⚠️ **Six affirmations écrites au premier jet et corrigées avant commit**, toutes du même genre — un
écart calculé, une comparaison ou une distance qu'aucun contrôle automatique ne voit : ① « les cinq
points qu'il défendait **depuis dix ans** » (ils sont formulés quelques années avant le chantier, pas
dix) ; ② les fonts de Saint Louis « **à huit cents mètres** » de la villa Savoye, alors que le même
guide dit deux sections plus loin que la villa est à l'écart du centre ; ③ Poissy résidence royale
« **bien avant** que Saint-Germain-en-Laye ou Versailles n'existent comme lieux de pouvoir »,
comparaison invérifiable retirée ; ④ Rueil « **à vingt minutes de La Défense** », chiffre non vérifié ;
⑤ Percier et Fontaine crédités de « l'architecture » de Malmaison plutôt que des aménagements qui leur
ont été confiés ; ⑥ musée de Soissons donné « en accès libre » sans source. C'est le même mode de
défaillance qu'au batch 37 (l'écart de sept siècles et demi lu « deux siècles et demi » à Sens) : les
dates prises une à une étaient justes, ce sont les **écarts et les comparaisons** qui dérapent.
Les seuls chiffres de population sont ceux de l'Insee 2022 lus dans `data/city-population.json`
(Poissy 40 792, Rueil-Malmaison 80 842, Vernon 24 841, Dole 23 784, Soissons 28 667, Cambrai 31 568,
Carpentras 30 854) — **pas les `population` approximatives du seed**. Aucun tarif, aucun horaire ;
quatre équipements à ouverture instable sont explicitement renvoyés à une vérification préalable
(musée du Jouet, château de Bois-Préau **resté longtemps fermé et réduit à des expositions
temporaires**, chapelle du Grand Séminaire, apothicairerie de l'hôtel-Dieu). Deux cadrages assumés à
ne pas diluer : la **porte Juive** de Carpentras est nommée pour ce qu'elle était — les convertis y
passaient pour le baptême — et la section « carrières » dit que le refuge pontifical était un régime
juridique contraint, pas une harmonie ; et le **vase de Soissons n'existe pas**, c'est un récit de
Grégoire de Tours écrit un siècle après les faits, le guide le dit plutôt que d'envoyer un lecteur
chercher une vitrine.
⚠️ **`npm run build` n'a pas été lancé, volontairement** (cf. § Commands depuis le batch 27). Le
substitut prescrit passe en entier : `npx tsc --noEmit` **propre**, `npm run integrity`,
`search-index` + `search-index:check`, `sitemap:check`, `npm run parity` (0 route FR sans jumelle),
plus le contrôle de lookup / photo ci-dessus.
Écart FR→EN après ce batch : **7 villes** (poissy, rueil-malmaison, vernon, dole, soissons, cambrai,
carpentras) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**. Rappel de la
règle du batch 33 : côté EN, le slug se dérive du **slug de seed tel quel**
(`getEnGuide('things-to-do-in-' + slug + '-2026')`), et aucun de ces sept ne porte d'article, donc
rien à arbitrer. Trois points de vigilance pour ces jumelles : **`things-to-do-in-vernon-2026` doit
poser Vernon (Eure) dès la première ligne** — les sources anglophones ramènent Vernon (Colombie-
Britannique), Vernon (Texas) et le Mount Vernon de Washington ; le nom du musée de Vernon doit être
le **nouveau** des deux côtés ; et la **bataille de Cambrai est de l'histoire britannique avant
d'être de l'histoire française** (476 chars, Flesquières, cimetières du Commonwealth), donc la
jumelle anglaise a de la matière propre là où le guide FR reste sobre — même arbitrage qu'avec
Jubilee à Dieppe au batch 37.

**Batch 36 — FR, shipped 2026-08-29 : Orange, Saint-Germain-en-Laye, La Ciotat, Rochefort, Dieppe,
Douai, Sens.** Sept villes, sept régions différentes, et le même arbitrage qu'aux batches 26, 32 et
34, assumé une fois de plus contre la liste de gisements : **on choisit par matière touristique
réelle, pas par inertie de liste**. Les six banlieues de province (Villenave-d'Ornon, Talence,
Le Bouscat ; Vaulx-en-Velin, Saint-Priest, Bron) **restent en piste et n'ont toujours pas été
faites** — mais laisser **Orange**, qui porte deux monuments romains inscrits à l'UNESCO depuis
1981, sans guide pour écrire Le Bouscat n'était pas défendable. Le constat qui a décidé du batch :
en listant les 322 villes du seed non couvertes par population, le haut de liste est presque
entièrement francilien et pauvre en matière vérifiable, alors que sept trous **majeurs** dormaient
plus bas — la première cathédrale gothique de la chrétienté (Sens), la plus ancienne salle de cinéma
du monde (La Ciotat), la plus longue manufacture d'Europe à sa construction (Rochefort), la première
station balnéaire de France (Dieppe), le plus important carillon de France (Douai) et le musée
d'archéologie de référence du pays (Saint-Germain-en-Laye).
**Compteurs mesurés : FR 226 (`-a-` strict 219 + 5 en `au-` + 2 en `aux-`), EN 219 ; `GUIDES` 1012 →
1019.** Aucun nouveau slug hors gabarit : les sept villes prennent toutes « à » sans contraction, les
sept exceptions restent `au-puy-en-velay`, `au-tampon`, `au-francois`, `au-robert`, `au-lamentin`,
`aux-abymes`, `aux-sables-d-olonne`. `metaTitle` 32-41 caractères, `metaDesc` 141-155, 10 sections
par guide, densité d'accents 0,135-0,180 (**par mot, pas par lettre** — seuil ascii-strip 0,09).
`npm run search-index` relancé (`data/search-index.json` 1019 guides, 245 → **248 tags**, donc trois
pages `/tags/` neuves) et **`npm run sitemap:check` repassé** à cause d'elles (FR 29 096 URL,
EN 28 666). Les sept guides ont été vérifiés **retrouvés par le lookup de
`app/villes/[slug]/a-faire/page.tsx` et pourvus de leur photo d'en-tête** (`guideCityPhoto`).
⚠️ **Le fait le plus important du batch est une correction : l'Hermione n'est pas à Rochefort.** La
réplique a bien été construite dans l'arsenal à partir de juillet 1997 et mise à l'eau le 7 septembre
2014, mais elle est **immobilisée en cale sèche à Anglet, dans le port de Bayonne, depuis l'automne
2021**, et l'association qui la porte a connu de graves difficultés financières. Un guide qui envoie
un lecteur à Rochefort voir l'Hermione l'envoie à 300 km de la frégate : la section le dit
explicitement et invite à vérifier avant de se déplacer pour elle. Deux autres pièges de calendrier
et d'attribution écartés de la même façon : le **festival de cerf-volant de Dieppe est biennal et
tombe les années impaires** (édition 2025, prochaine attendue en 2027, **donc rien en 2026** — une
page qui promet le contraire recopie une édition précédente) ; et **Louis XIV est né au Château-Neuf
de Saint-Germain-en-Laye, pas dans le château qu'on visite**, lequel abrite le Musée d'Archéologie
nationale — le Château-Neuf est détruit, il n'en reste que le Pavillon Henri IV. La légende des
spectateurs fuyant *L'Arrivée d'un train* est donnée pour ce qu'elle est, **une histoire construite
après coup** : la première projection publique payante des vues Lumière a eu lieu à Paris en décembre
1895, et à l'Eden c'est le 21 mars 1899 qui fait date.
Faits vérifiés en ligne avant rédaction et qui portent les guides : mur de scène d'Orange **103 m ×
37 m, 1,80 m d'épaisseur**, seul mur de scène romain conservé entier en Occident, statue d'Auguste de
**3,55 m**, arc élevé vers **20-25** pour les victoires de Germanicus sur la **via Agrippa**, classé
MH dès **1840** ; **cadastres romains découverts en 1949**, 416 fragments, ordonnés sous **Vespasien
en 77**, les mieux conservés au monde ; Chorégies nées des Fêtes romaines de **1869**, nom adopté en
**1903**, plus ancien festival de France ; MAN créé par décret impérial du **8 mars 1862**, inauguré
le **12 mai 1867**, restauration d'**Eugène Millet**, élève de Viollet-le-Duc ; Grande Terrasse de
Le Nôtre, **2,4 km**, **1669-1673** ; Debussy né le **22 août 1862** au 38 rue au Pain, musée ouvert
en **1990** ; Le Prieuré de Maurice Denis, **ancien hôpital royal voulu par Mme de Montespan**,
acheté en **1914**, donation de **1976** ; Eden Théâtre ouvert le **15 juin 1889** ; **pétanque née
en 1907** (Jules Hugues dit Lenoir, terrain des frères Pitiot, premier concours en **1910**, du
provençal *pèd tanca*) ; **île Verte, seule île boisée des Bouches-du-Rhône**, 13 ha, acquise par le
département en **1963** ; Corderie Royale **374 m** ; **maison de Pierre Loti rouverte le 10 juin
2025** après douze ans de fermeture, **visites guidées uniquement, groupes de dix, ~1 h 30, donc
réservation obligatoire** ; pont transbordeur de Martrou **1898-1900**, Ferdinand Arnodin, **dernier
de France** et huit dans le monde, MH le **30 avril 1976**, restauré 2016-2020, réinauguré le
**29 juillet 2020**, ouvert d'avril à début novembre ; bains de mer de Dieppe en **1824**, bain de la
duchesse de Berry le **3 août 1824**, séjours jusqu'en 1829 ; **plus grande collection d'ivoires
d'Europe** au château-musée ; Estran Cité de la Mer créé le **20 mai 1987** ; opération **Jubilee du
19 août 1942**, un peu plus de 6 000 hommes dont près de 5 000 Canadiens, cinq points sur une
quinzaine de kilomètres, journée la plus meurtrière de la guerre pour le Canada ; beffroi de Douai
commencé en **1391**, UNESCO **2005**, **carillon de 62 cloches**, le plus important de France ;
**Gayant né en 1530** (procession de saint Maurand, *gayant* = géant en picard), M. Gayant **8,50 m
et 370 kg**, Marie Cagenon **6,25 m**, Jacquot, Fillon et Binbin, fêtes le **dimanche suivant le
5 juillet** et les deux jours suivants ; musée de la Chartreuse dans l'**hôtel d'Abancourt (1559)** et
l'**aile Montmorency (1608)**, musée depuis **1958**, plus de 10 000 œuvres ; **Lewarde, plus grand
musée de la mine de France**, ancienne fosse Delloye, plus de 150 000 visiteurs/an, **270 ans**
d'exploitation ; cathédrale de Sens ouverte **vers 1135** sous Henri Sanglier, consacrée en **1164**,
**première cathédrale gothique**, **Guillaume de Sens** appelé ensuite à reconstruire le chœur de
**Cantorbéry après l'incendie de 1174** ; **vêtements liturgiques de Thomas Becket** au trésor (venu à
Sens en **1164** puis **1170**), trésor parmi les plus riches de France avec Conques ; marché couvert
de Sens inauguré en **1882**, style Baltard, MH **1975**, architectes Horace Lefort et Benoni Roblot.
Les seuls chiffres de population sont ceux de l'Insee 2022 lus dans `data/city-population.json`
(Orange 29 357, Saint-Germain-en-Laye 45 286, La Ciotat 37 599, Rochefort 23 188, Dieppe 28 599,
Douai 39 833, Sens 27 275) — **pas les `population` approximatives du seed**. Aucun horaire, aucun
tarif. Convention « **accessible depuis** » plutôt que « situé à » tenue partout : Châteauneuf-du-Pape,
Gigondas et Vacqueyras depuis Orange, la **Maison du Transbordeur qui est à Échillais** et l'île d'Aix
depuis Rochefort, le **cimetière militaire canadien de Hautot-sur-Mer** et Varengeville depuis Dieppe,
le **Centre historique minier qui est à Lewarde** depuis Douai. Deux prudences de sécurité assumées :
la baignade à **Figuerolles se fait sans surveillance permanente**, et les **falaises de craie
s'effondrent par plaques** sur la côte d'Albâtre, donc distance au bord et balisage respectés.
⚠️ **`npm run build` n'a pas été lancé, volontairement** — c'est ce que la section Commands interdit
depuis le batch 27 (4 h 30 de génération, `.next` à 25 Go, aucun signal utile, ENOSPC avant la
finalisation). Le substitut prescrit a été exécuté en entier et passe : `npx tsc --noEmit` **propre**,
`npm run integrity`, `search-index` + `search-index:check`, `sitemap:check`, plus le contrôle de
lookup / photo et un contrôle de charge des vraies gardes (`assertUniqueSlugs` / `assertKnownSlugs`)
par import du module.
Écart FR→EN après ce batch : **7 villes** (orange, saint-germain-en-laye, la-ciotat, rochefort,
dieppe, douai, sens) — au-dessus du seuil de ~6, donc **le prochain run doit être un batch EN**.
Rappel de la règle tranchée au batch 33 : côté EN, le slug se dérive du **slug de seed tel quel**
(`getEnGuide('things-to-do-in-' + slug + '-2026')`), jamais d'une version « propre » — donc
`things-to-do-in-la-ciotat-2026` et `things-to-do-in-saint-germain-en-laye-2026` gardent leur forme
complète. Trois points de vigilance pour ces jumelles : **`things-to-do-in-orange-2026` est un slug
ambigu en anglais** (le mot *orange*, la maison d'Orange-Nassau, le comté d'Orange en Californie) —
l'intro doit poser la ville dès la première ligne ; l'angle voyageur étranger a de la matière propre
sur trois de ces villes (le lien **Orange / Orange-Nassau / maillot néerlandais**, la filiation
**Sens → Cantorbéry** qui parle beaucoup plus à un lecteur britannique qu'à un français, et
**Jubilee**, qui est de l'histoire canadienne avant d'être de l'histoire française — la liaison
transmanche **Dieppe-Newhaven** rend d'ailleurs Dieppe atteignable sans avion depuis l'Angleterre) ;
et l'avertissement **Hermione** doit être repris tel quel, un lecteur étranger étant encore plus
susceptible de faire le détour pour un bateau qui n'est pas là.
Pour le batch FR **suivant**, les gisements restants sont les six banlieues de province ci-dessus et,
côté trous touristiques réels mesurés ce run, **Rueil-Malmaison** (château de Malmaison, Joséphine),
**Poissy** (villa Savoye, Le Corbusier, UNESCO), **Dole** (ville natale de Pasteur), **Soissons**
(abbaye Saint-Jean-des-Vignes), **Bergerac**, **Carpentras** (synagogue, cathédrale Saint-Siffrein),
**Agde**, **Thonon-les-Bains** et **Vernon** (d'où Giverny est accessible) — tous vérifiés présents
au seed et sans guide, et tous plus riches en matière vérifiable que le haut de la liste par
population. Les trous listés au batch 34 (Saint-Herblain, Mantes-la-Jolie, Istres, Cambrai) restent
ouverts.

**Batch 37 — EN, rattrapage de parité, shipped 2026-08-30.** Les 7 jumelles
`things-to-do-in-[slug]-2026` du batch 36 écrites d'un coup dans `data/guides-en.ts` (Orange,
Saint-Germain-en-Laye, La Ciotat, Rochefort, Dieppe, Douai, Sens). **Compteurs mesurés : FR 226,
EN 226 — écart nul, parité rétablie** (`EN_GUIDES` 780 → 787). Aucun slug hors gabarit : les sept
villes prennent « à » sans contraction, donc la règle du batch 33 (**côté EN le slug se dérive du
slug de seed tel quel**) n'avait rien à arbitrer, et les sept exceptions restent `au-puy-en-velay`,
`au-tampon`, `au-francois`, `au-robert`, `au-lamentin`, `aux-abymes`, `aux-sables-d-olonne`.
`metaTitle` 46-53 caractères, `metaDesc` 145-159, 8 sections par guide (la série FR en compte 10,
l'EN fusionne les fins de liste), 0 em-dash. Aucun tag neuf — les 7 réutilisent `provence`,
`ile-de-france`, `atlantic coast`, `normandy`, `hauts-de-france`, `burgundy`, et les tags de ville
restent à 1 occurrence, sous le seuil de 3 qui crée une page `/tags`. `npm run search-index`
relancé (`data/search-index.en.json` 787 guides, **108 tags**, inchangé) et `npm run sitemap:check`
repassé (FR 29 104 URL, EN 28 673). Les 7 guides sont vérifiés **retrouvés par
`getEnGuide()`**, **pourvus de leur photo d'en-tête** (`guideCityPhoto`) et **remontés en 1re
position** par la recherche inverse `relatedCities` de `CityGuidesList` sur leur page ville EN.
⚠️ **Une erreur de fait du guide FR corrigée des deux côtés** : le guide Sens datait le contraste
entre le marché couvert et la cathédrale « à deux siècles et demi de distance » alors que le même
guide ouvre le chantier **vers 1135** et inaugure le marché en **1882** — sept siècles et demi. Les
dates prises une à une étaient justes, c'est **l'écart calculé entre elles** qui dérapait, et aucun
contrôle automatique ne peut le voir. Contrôle mécanique des figures : chaque nombre du texte EN
cherché dans la jumelle FR après normalisation des séparateurs, **112 figures, 112 retrouvées**.
Les prudences du FR sont reprises telles quelles, à ne pas diluer : **l'Hermione n'est pas à
Rochefort** (cale sèche à Anglet depuis l'automne 2021, avertissement appuyé côté EN), **pas
d'édition 2026 du festival de cerf-volant de Dieppe** (biennal, années impaires), **Louis XIV né au
Château-Neuf** détruit et non dans le château visitable, la fuite des spectateurs devant
*L'Arrivée d'un train* donnée comme **histoire construite après coup**, **baignade sans surveillance
permanente à Figuerolles**, **falaises de craie qui s'effondrent par plaques**, et la convention
« accessible depuis » tenue partout. Six ajouts propres à l'angle voyageur étranger : la
**désambiguïsation d'Orange** dès la première ligne (ni le fruit, ni l'opérateur, ni le comté
californien), le **RER A**, la **pétanque** et le **mistral** expliqués en une incise, le
**carillon** et le **beffroi** définis, la filiation **Sens → Cantorbéry** posée pour un lecteur
britannique, et la **liaison transmanche Dieppe-Newhaven** avec Jubilee présentée comme de
l'histoire canadienne.
**Prochain run : batch FR** (l'écart est nul, la série FR reprend la main). Gisements inchangés :
les six banlieues de province jamais faites (Villenave-d'Ornon, Talence, Le Bouscat ;
Vaulx-en-Velin, Saint-Priest, Bron) et les trous listés aux batches 34 et 36 ci-dessus.

### Glossaire (`app/glossaire/page.tsx`)

Page unique, données inline (`SECTIONS: {title, emoji, terms[]}`), `DefinedTermSet` JSON-LD généré
depuis le tableau — ajouter un terme suffit, rien d'autre à câbler. **Compteur mesuré
(`grep -c 'term: "'`) : 155 termes, 15 sections** (2026-08-28). ⚠️ Un terme ajouté oblige à
remonter `GLOSSARY_TERMS_COUNT` (`lib/site-stats.ts`, 142 → 155 ce run) : `npm run integrity`
recompte la page et **échoue** sinon — le nombre est affiché sur `/outils`, `/recherche`, la carte
OG et `StaticPageCrossLink`. Dernière section ajoutée : « Transports, voiture et stationnement » 🚉
— 13 termes (AOM, versement mobilité, prise en charge à 50 % de l'abonnement, forfait mobilités
durables, vignette Crit'Air, FPS, gratuité des réseaux, changement d'adresse sur la carte grise,
CMI stationnement, barème kilométrique, stationnement vélo sécurisé en gare, aides à l'achat d'un
vélo, tarification TER). C'était le trou béant de la page : sur 142 termes, **un seul** parlait de
mobilité (ZFE), alors que le site porte `/villes/[slug]/transports`, `/villes/[slug]/velo`, la
série `vivre-sans-voiture-[ville]` et les profils `cyclistes-urbains`, `sans-voiture` et
`navetteurs-hybrides`. Cinq points de méthode à ne pas diluer : ① **l'entrée ZFE existante a été
réécrite, pas dupliquée** — la nouvelle section pose « Vignette Crit'Air » et renvoie à la
définition d'urbanisme, même précédent que l'homonymie APL et que le quotient familial CAF vs
fiscal ; ② le fait ZFE est daté et à revérifier avant de le durcir : la suppression des ZFE, **votée
le 15 avril 2026** dans la loi de simplification de la vie économique, a été **censurée par le
Conseil constitutionnel le 21 mai 2026 comme cavalier législatif** (article 45), donc sur la
procédure et non sur le fond — le cadre légal tient, mais les calendriers d'exclusion et les
régimes de sanction sont décidés métropole par métropole et bougent, d'où le renvoi au site de la
métropole plutôt qu'une liste qui périmerait ; ③ **il n'existe plus d'aide nationale à l'achat d'un
vélo** — bonus vélo et prime à la conversion ont pris fin le 14 février 2025, ce qui reste est
local, donc c'est devenu un fait *géographique*, exactement le sujet du site ; ④ les seuls chiffres
cités sont réglementaires ou publiés et **tous vérifiés en ligne avant rédaction** (600 €/900 €/300 €
du FMD, 50 % obligatoires et 75 % exonérés jusqu'au 31/12/2026, 135 € et redevance d'acheminement
2,76 € sur la carte grise, majoration FPS de 50 €, 12 h plancher de la CMI, décret n° 2021-741 et
ses 1 133 gares à 4 % / 2 % de la fréquentation entrante, 46 % puis 54 % de gares conformes,
barème kilométrique gelé pour la 4ᵉ année et +20 % électrique, ~40 réseaux gratuits, Montpellier
21/12/2023) — aucun tarif d'opérateur, aucune moyenne de prime, aucun taux de versement mobilité
commune par commune (seul le plafond légal est cité, sans le chiffrer au dixième) ; ⑤ deux entrées
disent explicitement ce qu'un chiffre ne dirait pas : la gratuité d'un réseau **est réservée aux
résidents et ne dit rien de la fréquence**, et l'obligation de stationnement vélo en gare
**n'a pas été tenue**, donc elle se vérifie sur place et ne se déduit pas du texte.
Le titre de la page passe à « Glossaire immobilier, aides, école, santé & mobilité » (52 car.) et sa
`description` reste à 153. Section ajoutée juste avant :
« Santé, médecin traitant et accès aux soins » 🩺 — 15 termes (médecin traitant, parcours de soins
coordonnés, ticket modérateur, participation forfaitaire et franchise médicale, secteur 1/2 et
OPTAM, ALD, contrat responsable et 100 % Santé, CSS, carte Vitale et Mon espace santé, changer de
caisse en déménageant, APL d'accessibilité potentielle localisée, désert médical/ZIP/ZAC,
MSP/centre de santé/CPTS, forfait journalier hospitalier et forfait patient urgences, SAS et
116 117). C'était le trou béant de la page : le site porte `/villes/[slug]/sante`,
`lib/healthcare-access.ts` (F47), le red flag `villes-desert-medical` et le profil
`suivi-medical-regulier` livré le 17/08, sans jamais définir ce que « désert médical » veut dire
administrativement ni ce qu'un arrivant doit faire de sa carte Vitale. Quatre points de méthode à
ne pas diluer : ① **homonymie APL assumée et signalée** — « accessibilité potentielle localisée »
(DREES/IRDES, seuil de sous-densité 2,5 consultations/an/hab., 6,3 M de personnes sous le seuil en
2024, soit ~9 % de la population) porte le même sigle que l'Aide personnalisée au logement, déjà
définie deux sections plus haut ; l'entrée le dit en première ligne plutôt que de créer un doublon
silencieux, même précédent que le quotient familial CAF vs fiscal ; ② **« désert médical » n'est pas
une catégorie administrative** — ce qui existe est le zonage ARS ZIP/ZAC, et c'est lui qui ouvre des
droits ; ③ les personnes **en ALD ne sont pas exonérées** de la participation forfaitaire ni des
franchises (idée reçue très répandue, y compris dans des sources secondaires qui citent encore le
montant de 1 € d'avant mai 2024) — les exonérés sont les moins de 18 ans, les femmes enceintes à
partir du 6ᵉ mois et les bénéficiaires CSS/AME ; ④ le **doublement des plafonds à 100 € chacun**
annoncé le 23/07/2026 est écrit comme une annonce datée, **décret non publié au JO à la rédaction**
et application ~2 mois après parution — à revérifier avant de le durcir en fait acquis. Chiffres
cités, tous réglementaires ou publiés, aucun tarif d'assureur : 2 € de participation forfaitaire
(15/05/2024), franchises 1 €/boîte, 1 €/acte paramédical, 4 €/transport, butoirs 4 € et 8 €/jour,
plafonds 50 € chacun ; consultation généraliste secteur 1 30 € (22/12/2024, ex-26,50 €), base
secteur 2 hors OPTAM 23 € ; hors parcours de soins 30 % au lieu de 70 % ; CSS 868 €/1 303 € (gratuite)
et 1 172 €/1 759 € (payante) du 01/04/2026 au 31/03/2027, participation ≤ 1 €/jour, 8 à 30 €/mois
selon l'âge ; forfait journalier hospitalier 23 €/jour et 17 € en psychiatrie, forfait patient
urgences 23 €, tous deux depuis le 01/03/2026 (ex-20 €, 15 €, 19,61 €) ; 2 644 MSP en 2024 pour un
objectif de 4 000 en 2027. Le montant minoré du FPU en ALD est **volontairement omis** : les sources
consultées divergent (8,49 € et 9,96 €), une phrase sans chiffre valant mieux qu'un chiffre faux.
Avant-dernière section : « Assurance habitation et catastrophes naturelles » 🌊 — 12 termes (MRH et qui doit s'assurer,
garantie cat-nat, arrêté de catastrophe naturelle, franchise légale, surprime, CCR, RGA, fonds
Barnier, taxe GEMAPI, recul du trait de côte, BCT, valeur à neuf). Elle honore exactement le
cadrage laissé en 2026-08-03 ci-dessous : **côté assurance et indemnisation uniquement**, parce
qu'ERP/ERRIAL et PPRI/PPRT sont déjà traités sous « Diagnostics ». Le site portait
`/villes/[slug]/risques`, `/red-flags/villes-risques-naturels`, `villes-erosion-cotiere` et
`villes-sans-eau-ete` sans jamais expliquer ce qui est payé, par qui et sous quelle condition.
Trois points de méthode à ne pas diluer : ① la garantie cat-nat **ne couvre ni la tempête, ni la
grêle, ni le poids de la neige** (garantie distincte du contrat) et **ne couvre pas le recul du
trait de côte**, phénomène lent donc hors du champ « intensité anormale » — c'est l'erreur la plus
répandue, et les deux entrées concernées le disent explicitement ; ② les seuls chiffres cités sont réglementaires et
nationaux (franchise 380 € / 1 520 € sécheresse, surprime 20 % et 9 % au 1ᵉʳ janvier 2025, plafond
GEMAPI 40 €/hab./an, subvention Barnier jusqu'à 80 %) — aucun tarif d'assureur, aucune moyenne de
prime, qui ne seraient pas sourçables ; ③ ce qui relève du contrat et non de la loi (valeur à neuf,
plafonds) est écrit comme tel, avec « le plus souvent » et « délai contractuel ». Section antérieure :
« École, garde d'enfants et scolarité » 🎒 — 15 termes (carte scolaire, dérogation, certificat de
radiation, instruction obligatoire, REP/REP+, IPS, Affelnet, Parcoursup, privé sous contrat,
périscolaire, quotient familial CAF, modes de garde, CMG, PAI/PAP/PPS, transport scolaire) : c'était
le trou de la page, qui ne couvrait que l'immobilier et l'argent alors que le site porte
`/villes/[slug]/ecoles` et la série `famille-a-[ville]`. Deux pièges vérifiés au passage : le
**quotient familial** existait déjà au sens fiscal, l'entrée CAF le nomme explicitement pour ne pas
créer un doublon silencieux ; **ERP/ERRIAL** et **PPRI/PPRT** sont déjà traités sous « Diagnostics »,
donc une future section risques naturels doit se limiter à l'assurance (cat-nat, franchise, RGA,
fonds Barnier) sous peine de recouvrement. Aucun chiffre de loyer, prix ou score n'est cité ici :
les montants réglementaires seulement, et rien qui ne soit sourçable.

### Expat retour (`lib/expat-return.ts`)

Une fiche par pays de départ, données inline (`EXPAT_COUNTRIES`), rendues par
`app/expat-retour/[pays]/page.tsx` (URL `/expat-retour/depuis-<slug>`). Ajouter une entrée au
tableau suffit : `generateStaticParams`, le hub et le sitemap en dérivent tous les trois.
**Compteur mesuré (`grep -c '^    slug: "'`) : 21 pays** (2026-08-26). Dernier ajouté : **Brésil** — la
première fiche d'Amérique latine, région qui n'avait aucun pays sur les vingt précédents. Le fil
conducteur est que **la sortie fiscale brésilienne est un dépôt, pas un départ** : sans la
*Comunicação de Saída Definitiva do País* (à déposer de la date de départ jusqu'au **dernier jour de
février de l'année suivante**), la Receita Federal tient le partant pour résident pendant les **douze
mois d'absence** qui suivent, donc imposable au Brésil sur ses revenus mondiaux, salaire français
compris ; la *Declaração de Saída Definitiva* est un second document, déposé dans la fenêtre annuelle
de l'impôt (**23/03 → 29/05** pour l'exercice 2026). Trois autres faits vérifiés portent la fiche :
① l'accord de sécurité sociale signé le **15/12/2011** (accord d'application 22/04/2013, décret
n° 2014-1013) est **en vigueur depuis le 01/09/2014** et permet la totalisation des périodes INSS —
c'est l'exact inverse du dossier chinois, et son champ territorial vise **expressément les DOM,
Guyane comprise** ; ② le real est librement convertible (aucun quota, contrairement au yuan) mais les
décrets **12.466/2025 et 12.499/2025** ont porté l'**IOF de 1,1 % à 3,5 %** sur les virements vers un
compte de même titularité à l'étranger hors finalité d'investissement ; ③ la loi **15.270/2025**, en
vigueur depuis janvier 2026, exonère d'impôt les revenus jusqu'à **5 000 R$/mois** (réduction
jusqu'à 7 350 R$), le barème progressif à 27,5 % restant par ailleurs.
⚠️ **Quatre réflexes faux, corrigés par vérification avant rédaction.** ① **Partir n'ouvre aucun droit
de retrait du FGTS** : le départ définitif ne figure pas à l'article 20 de la loi 8.036/90 ; les voies
réelles sont le licenciement sans juste cause ou **trois ans consécutifs hors du régime**, déblocage au
mois anniversaire du titulaire. ② **Un expatrié payé en PJ n'a souvent rien cotisé** (ni FGTS ni part
patronale INSS) : l'accord permet de totaliser des périodes, pas d'en inventer — d'où la consigne de
sortir l'extrait **CNIS** avant de rentrer. ③ **L'accord de sécurité sociale ne fabrique pas de
S1** : un rentrant sans emploi retombe sur la PUMa de droit commun (trois mois de résidence + 2-3 mois
d'instruction), alors que l'accord couvre formellement le risque maladie-maternité. ④ La **prova de
vida annuelle** suit le pensionné INSS en France (blocage puis suppression du versement à défaut ;
certificat valable **90 jours**). Autres chiffres cités, tous sourcés : retenue à la source du
non-résident **25 %** sur le travail, **15 %** sur les loyers bruts, plus-values **15 à 22,5 %** ;
FipeZAP juin 2026 **64,98 R$/m²** de loyer à São Paulo, **59,87** à Rio ; EUR/BRL **5,94** de moyenne
en août 2026 (5,81-6,15 dans le mois) ; convention fiscale du **10/09/1971**, en vigueur depuis le
**10/05/1972** ; franchise de déménagement (12 mois de résidence hors UE, biens détenus > 6 mois,
**cerfa n° 10070**) ; frontière franco-brésilienne de **730 km** dont 430 sur l'Oyapock. Les 20
chiffres français viennent de `data/housing.ts` et les deux scores cités (Cayenne 3,9, Lyon 7,1) sont
lus dans `CITIES_SEED`, pas dans le seed source. Aucune page EN : `bresil` n'est pas dans
`EN_EXPAT_COUNTRY_SLUGS`, donc pas de hreflang à câbler.
✅ **Dette de perf soldée le 2026-08-27** (elle était notée ici « trouvée ce run, non corrigée ») :
`components/ExpatQuiz.tsx` importait `EXPAT_COUNTRIES` **en valeur** alors qu'il n'a besoin que de
`slug` / `name` / `flag` / `bestSuitedCities`, et embarquait les 190 Ko de prose de
`lib/expat-return.ts` dans le bundle du quiz. Le remède retenu n'est ni un allègement des fiches ni
un JSON généré : `EXPAT_COUNTRY_OPTIONS` (projection dérivée du tableau, en bas du même fichier)
descend **en prop depuis la page serveur** `app/expat-retour/quiz`, comme `CITIES_LIGHT` juste à
côté — donc rien à maintenir en double, une fiche ajoutée apparaît dans le quiz sans autre geste. Le
composant n'importe plus que des **types**, effacés à la compilation. Mesuré : 280 441 → 88 484 o
minifiés, 74 991 → 22 867 o gzip. **Ne pas réintroduire un import en valeur ici.**
Avant-dernier ajouté : **Chine** —
le seul dossier du site où la difficulté n'est ni fiscale ni culturelle mais **mécanique** : faire
sortir ses droits et son argent. Trois points vérifiés en ligne, et qui portent la fiche : ① **aucune
convention de sécurité sociale n'est en vigueur** entre la France et la Chine — signée le 31/10/2016,
arrangement administratif le 16/09/2019, avenant en 09/2023 après objection du Conseil d'État sur le
champ territorial, **jamais ratifiée** — donc les années chinoises valent **zéro trimestre français**
hors cotisation volontaire à la CFE, et il n'existe **ni S1 ni carte européenne** (d'où le trou de
couverture de 3 mois si le retour se fait sans emploi : PUMa sur critère de résidence, 2-3 mois
d'instruction) ; ② le yuan n'est pas librement convertible — quota annuel d'achat de devises plafonné
à **50 000 USD par personne**, réservé aux dépenses personnelles, contrôle bancaire renforcé au
**1ᵉʳ janvier 2026** au-delà de 5 000 CNY / 1 000 USD — donc l'épargne se rapatrie sur des années ;
③ le régime d'exonération d'IIT sur **huit catégories d'avantages en nature** (logement, scolarité…)
court jusqu'au **31/12/2027** et n'est pas cumulable avec les déductions additionnelles, si bien que
comparer un net chinois à un net français n'a pas de sens tant que le logement et l'école ne sont pas
réintégrés. Autres faits sourcés : règle des six ans (183 j/an, remise à zéro par une absence de plus
de 30 jours consécutifs, 2025 premier exercice où l'imposition mondiale peut se déclencher), accord
fiscal du 26/11/2013 en vigueur depuis le 28/12/2014, remboursement du seul **compte individuel** de
retraite au départ (part patronale mutualisée perdue, 15 ans pour ouvrir un droit).
⚠️ **Deux réflexes à ne pas appliquer ici.** Le permis chinois **s'échange** en France sans examen —
accord de reconnaissance réciproque signé le 23/11/2018, **en vigueur depuis le 17/08/2021**, pour les
permis délivrés à compter du 1ᵉʳ avril 2008 : l'intuition « hors UE donc pas d'échange » est fausse et
avait été écrite avant vérification. Et l'animal demande **quatre mois** et non « presque rien » comme
sur les retours intra-UE : la Chine est un **pays tiers non listé**, donc titrage sérologique ≥ 0,5 UI/ml
en laboratoire agréé UE sur un prélèvement fait ≥ 30 jours après vaccination, **puis 3 mois d'attente**
courant depuis la prise de sang. Les 10 `bestSuitedCities` sont vérifiées dans `CITIES_SEED` et les
20 chiffres français cités (T3 : Grenoble 1 020 € … Paris 2 800 € ; prix/m² : Grenoble 3 200 € …
Paris 10 500 €) sont contrôlés un à un contre `data/housing.ts`. Aucune page EN : `chine` n'est pas
dans `EN_EXPAT_COUNTRY_SLUGS`, donc pas de hreflang à câbler.
⚠️ La **meta description** de `app/expat-retour/[pays]/page.tsx` dépassait 160 caractères sur **les 20
fiches d'alors** (jusqu'à 176 pour « Émirats arabes unis ») : la queue générique « Avec villes recommandées
(frontalières + métropoles). » poussait hors du snippet les postes réellement cherchés. Réécrite,
138-152 caractères sur les 20, 139 pour la fiche Brésil ajoutée depuis — ne pas y remettre de queue générique.
Ajouté avant lui : **Suède** —
premier pays nordique de la liste, et le seul dossier du site où **le retour est fiscalement
neutre** (kommunalskatt à taux plat ~29-35 % + 20 % d'État au-delà d'environ 600-625 k SEK, à peu
près la fourchette effective française). Le choc est ailleurs, et dans les deux sens : gain sur le
locatif (la file d'attente municipale de première main dépasse 9-11 ans à Stockholm centre, donc
tout arrivant passe par la sous-location andrahand), perte sèche sur la petite enfance (480 jours de
congé parental dont 390 à ~80 %, maxtaxa ~1 700 SEK/mois, déjeuner scolaire gratuit → crèche FR
150-400 €/mois et PreParE ~450 €/mois), et angle mort patrimonial (la Suède n'a plus d'ISF depuis
2007 ni de droits de succession depuis 2004-2005 : le retour réactive IFI et barème successoral).
Deux pièges spécifiques portés par les avertissements et à ne pas diluer : la règle de
**väsentlig anknytning** (présomption de résidence fiscale suédoise pendant 5 ans si un lien
essentiel subsiste — la *sommarstuga* en est un, charge de la preuve inversée) et le fait que
l'enveloppe **ISK** n'a pas d'équivalent français et n'est pas reconnue (retour au PFU 30 % +
formulaire 3916). Les loyers et prix français cités viennent de `data/housing.ts` (T3 : Grenoble
1 020 € … Lyon 1 380 €, Paris 2 800 €), les 10 `bestSuitedCities` sont vérifiées dans `CITIES_SEED`.
⚠️ La liste du sitemap **était codée en dur et avait dérivé** : Côte d'Ivoire et Japon avaient une
page mais aucune URL déclarée. Elle est désormais dérivée de `EXPAT_COUNTRIES` (même correctif que
`PROFILE_SLUGS` en F61) — ne pas la re-figer.

### Pour qui (`lib/profile-pages.ts`)

Un profil = une entrée de `PROFILE_PAGES` (slug, emoji, label, meta, intro, `weights`,
`reasonHint`). Ajouter l'entrée suffit : `/pour-qui`, `/pour-qui/[profil]`, le sitemap et le bloc
« parfait pour » de `lib/honest-reviews.ts` en dérivent tous les quatre. **Compteur mesuré
(`grep -c '^    slug: "'`) : 35 profils** (2026-08-31).
⚠️ **Avant d'ajouter un 35ᵉ profil, mesurer son bas de classement — `rankByProfile` trie sur le
score *arrondi* au dixième**, donc un palier d'ex æquo est coupé en son milieu et les rangs
qui suivent sont l'ordre d'insertion du seed, exactement le défaut que `lib/owner-rankings.ts`
interdit ailleurs. Constaté le 2026-08-28 sur un profil candidat « horaires décalés / travail de
nuit », écarté pour cette raison : **24 villes à égalité à 7,6 au rang 20**, les rangs 15 à 25
partageant la même note. La cause est en amont, dans les pondérations : `score_bruit`
(`lib/owner-scores.ts`) est un proxy en **paliers de population** qui rend 9,8 pour à peu près
toute commune sous 60 000 habitants — ce n'est donc pas un critère mais une constante, et un
classement bâti dessus ne départage rien (précédent du rang de richesse biodiversité, retiré le
10/08). Un nouveau profil doit s'appuyer sur un axe **continu** (`metroAccess`, `coastalProximity`,
`healthcareAccess`, `investorYield`…), et le contrôle à faire avant d'écrire une ligne de prose est
un `npx tsx` de scratch qui imprime le nombre d'ex æquo à la note du 20ᵉ. Les mesures publiées
jamais pondérées par un profil, si l'on cherche un cardinal neuf : `lib/city-income.ts` (Filosofi,
533/540), `lib/property-prices.ts` (DVF, 499/507) et la structure d'âge réelle de
`lib/city-population.ts` (538/540).
Dernier ajouté : **`travailleurs-frontaliers`** (2026-08-31) — le seul profil du fichier dont le
critère cardinal pointe **hors de France**. Nouveau composite `borderAccess` / `borderCommute()` :
distance routière estimée au plus proche de **14 pôles d'emploi transfrontaliers sur 5 pays**,
plein score à 20 km, décroissance en puissance 1,4, zéro à 110 km — **89 villes sur 540** sont dans
le champ, 11 à 20 km ou moins. Quatre points de méthode à ne pas défaire : ① la liste des pôles suit
les **flux mesurés par l'Insee** (recensement 2021 : 465 000 frontaliers, Suisse 224 000,
Luxembourg 105 000, Allemagne 50 000, Belgique 46 000, Monaco 33 000), donc **l'Espagne et l'Italie
en sont absentes** — 5 000 chacune, un ordre de grandeur sous le plus petit pôle retenu ; ajouter
Irun mettrait Hendaye en tête d'un classement qui parle d'autre chose, et son 0 est une mesure au
même titre que celui de la Corse et des DROM ; ② le barème publie des **kilomètres, pas des
minutes**, à l'inverse de `metroAccess` : un franchissement de frontière se mesure en files
d'attente (Bardonnex, Huningue, Basse Corniche), et un modèle horaire y mentirait plus qu'ailleurs ;
③ le facteur de détour est **1,3** et la décroissance est plus sévère qu'une droite au milieu de
fourchette, calée sur le fait que l'Insee compte un frontalier sur cinq au-delà de 50 km ;
④ à distance égale, une vallée alpine, un col du Jura et la plaine d'Alsace sont traités pareil, et
Saint-Paul-de-Vence (20ᵉ, 32 km de Monaco, 3 600 hab., T3 1 780 €) est le cas où le modèle est le
plus généreux — l'intro le dit. **Ex æquo mesurés avant écriture** (contrôle prescrit ci-dessus) :
5 villes à 6,5 pour 3 places au rang 20, 1 seule au rang 10, très loin des 24 qui ont fait écarter
le profil « horaires décalés ». Recouvrement maximal avec les 34 autres profils : **4/20**
(`couple-sans-enfant`, `familles-avec-ados`, `amateurs-de-montagne`) — le classement est
réellement neuf. Le résultat éditorial est la **ligne de fracture du loyer sur les 11 villes à
10/10** : frontière chère au sud et au Léman (Nice T3 1 500 €, Menton 1 450 €, Annemasse 1 350 € et
4 800 €/m²) contre frontière bon marché au nord et à l'est (Forbach 670 € et 1 200 €/m²,
Sarreguemines 690 €, Roubaix 700 €, Tourcoing 740 €, Longwy 910 €) — du simple au double sur le
loyer, du simple au quadruple sur le mètre carré, pour le même quart d'heure de trajet. Les règles
fiscales et sociales citées dans l'intro sont **datées et vérifiées ce run**, à revérifier avant de
les durcir : accord suisse de 1983 (8 cantons, imposition en France, 4,5 % de la masse salariale
reversés) contre accord genevois de 1973 (imposition à la source, 3,5 % reversés à l'Ain et à la
Haute-Savoie) ; avenant télétravail signé le 27/06/2023, **en vigueur le 24/07/2025 et applicable
depuis le 01/01/2026**, 40 % du temps annuel dont 10 jours de missions, échange automatique de
données salariales à partir de 2027 sur l'année 2026 ; **34 jours** par an hors du Grand-Duché côté
Luxembourg (compteur de jours, pas un pourcentage) ; **49,9 %** de télétravail côté sécurité sociale
depuis l'accord-cadre européen du 01/07/2023, un troisième plafond indépendant des deux premiers ;
droit d'option LAMal / assurance maladie française à exercer sous **3 mois**, l'assurance privée
française n'étant plus une option depuis le 01/06/2014. Aucun `descriptionEn` ni jumelle EN :
`app/[locale]/for-who/[slug]` est une **sélection de 13 profils** (comme `EN_THEMES` pour les red
flags), un profil FR sans jumelle est normal et ne demande pas de hreflang.
Avant-dernier ajouté : **`suivi-medical-regulier`**
(pathologie chronique imposant des rendez-vous réguliers) — le premier profil du fichier dont le
critère cardinal est l'**accès aux soins**, alors que `lib/healthcare-access.ts` (F47) existait
depuis longtemps sans qu'aucun des 33 profils ne le pondère, `proches-aidants` compris.
⚠️ **Inversion de direction, à ne pas « corriger »** : F47 mesure la *difficulté* (10 = désert,
convention du quartet environnement) ; la clé de poids s'appelle `healthcareAccess`, donc une
qualité, et `getScoreValue()` retourne `10 - composite`. L'inversion est au site d'affichage, jamais
dans le moteur — même traitement que `/villes/[slug]/sante`.
L'indicateur reste une **estimation** (département + taille de commune + statut hospitalier,
calibrée DREES / CNOM / zonage ARS), pas un relevé de cabinets : l'intro le dit avant de citer le
moindre rang, comme `mobilite-reduite` le fait pour l'accessibilité PMR. Deux enseignements portés
par la copie et vérifiés contre le moteur : les 22 villes de niveau « désert » comptent **toutes**
moins de 15 000 habitants et affichent **toutes** un m² sous le prix médian du site (le loyer bas
et l'effondrement de l'accès sont la même carte), et Paris, Marseille et Nice ont beau plafonner à
7,9/10 d'accès, elles sortent 57ᵉ, 163ᵉ et 100ᵉ sur le coût et la chaleur. Distinct de
`mobilite-reduite` (cardinal = transport PMR), `proches-aidants` (accompagne un tiers, cherche du
calme) et `asthmatiques-allergiques` (cardinal = qualité de l'air) ; pendant positif du red flag
`villes-desert-medical`, comme `cyclistes-urbains` l'est de `villes-anti-velo`.
Ajouté avant lui : **`navetteurs-hybrides`**
(actifs en hybride, 2-3 jours au bureau) — le seul profil du site où la *distance* à un bassin
d'emploi est le critère cardinal, là où « télétravailleurs salariés » l'ignore complètement (quand
on ne revient jamais, l'éloignement ne coûte rien) et où « sans voiture » et « cyclistes urbains »
mesurent la mobilité *à l'intérieur* d'une ville.
Nouveau composite `metroAccess` / `metroAccessCommute()` : trajet estimé vers le plus proche des
douze grands pôles d'emploi, barème 30 min = 10 → 150 min = 0. ⚠️ Trois écarts **volontaires** avec
`lib/city-commute`, qui surestime et qu'il ne faut pas « réaligner » :
① la branche rail directe n'est ouverte qu'aux villes ayant leur propre gare dans `TGV_STATIONS`
(sinon le modèle invente une ligne fermée : Saint-Girons sortait à 40 min de Toulouse) ;
② elle tourne à 140 km/h et non 220, la vitesse d'une LGV (Annecy sortait à 43 min de Grenoble, où
le train met près de 2 h) ; ③ la branche routière porte un plancher de 15 min d'approche urbaine
(sans lui : « Lyon en 2 min » depuis Villeurbanne). Corse et DROM valent **0** sur cet axe, et c'est
une mesure, pas une donnée manquante : il n'existe pas de navette hebdomadaire vers un pôle
métropolitain. En relief (Vosges, Cévennes, Alpes) le facteur de détour routier sous-estime encore
le trajet réel — l'intro le dit.
⚠️ `lib/profile-pages.ts` est importé **en valeur** par `app/people-like-you/PeopleLikeYouClient.tsx`
(client) : n'y importer aucune valeur de `CITIES_SEED`. C'est pour ça que les coordonnées des douze
pôles sont en dur et que le modèle de trajet est réimplémenté au lieu d'importer `lib/city-commute`,
qui charge le seed à l'initialisation.

### Red Flag Radar (`lib/red-flag-themes.ts`)

Un thème = une entrée de `RED_FLAG_THEMES` (slug, titre, meta, `intro` / `reality` / `methodology`,
`rank()`) **plus** un dossier `app/red-flags/<slug>/page.tsx` de 20 lignes qui lit
`getRedFlagTheme()` et rend `<RedFlagThemePage>`. Le hub `/red-flags` et le sitemap dérivent tous
les deux de la liste, il n'y a donc rien d'autre à câbler ; l'EN est une **sélection à part**
(`EN_THEMES` dans `app/[locale]/red-flags/themes/[slug]/page.tsx`, qui réutilise le `rank()` FR via
`frSlug`) — un thème FR sans jumelle EN est normal et ne demande pas de hreflang. **Compteurs
mesurés (`grep -c '^    slug: "'` et `ls app/red-flags | grep -c villes-`) : 37 thèmes, 37 dossiers**
(2026-08-24). Dernier ajouté : **`villes-achat-hors-de-portee`** — le premier classement du site à
confronter **deux mesures publiées et aucun score** : la médiane DVF des prix d'appartement
(`lib/property-prices.ts`, millésimes 2024-2025) rapportée au niveau de vie médian communal
(`lib/city-income.ts`, Filosofi 2021). Publié en **années de revenu disponible pour 65 m²** : sur les
430 villes où les deux mesures existent, la médiane est de 5,4 années, 74 villes dépassent 8 années
et 16 dépassent 11 — le seuil de publication. Saint-Tropez ouvre à 18,6 années, Paris suit à 14,1, et
9 des 16 sont en petite couronne. Cinq points de méthode à ne pas défaire : ① le ménage (couple sans
enfant, **1,5 UC**) et la surface (65 m²) entrent comme un **facteur constant** identique partout,
donc les changer déplace le nombre d'années affiché et **jamais** l'ordre — ce qui trie est le seul
rapport prix/revenu ; ne pas « recalibrer » ces constantes en croyant corriger un classement ;
② `medianIncome` est un niveau de vie **par unité de consommation**, le multiplier par les UC du
ménage cité est obligatoire (même piège que le palmarès d'octobre, sans quoi le taux est gonflé de
moitié) ; ③ **plancher de 100 ventes d'appartement** sur la fenêtre, cinq fois le seuil de publication
de DVF : c'est lui qui écarte `ile-de-re` (33 ventes, et un slug qui couvre dix communes) ; ④ prix
2024-2025 contre revenus 2021, donc le nombre d'années est **surestimé en valeur absolue** et seul le
classement tient ; ⑤ la severity démarre à **8/10 au seuil d'entrée** (11 années) et plafonne à 10 à
vingt années, le tri portant sur la valeur non arrondie — deux villes peuvent afficher la même
gravité à la décimale sans être à égalité. Cas de lecture à garder : **Aubervilliers** (3 951 €/m², la
commune la moins chère du classement) et **Levallois-Perret** (8 935 €/m²) sortent au même rapport de
11,2 années par deux mécanismes opposés. Distinct de `villes-regrets-achat` (prix face au score de
qualité de vie, sans revenus), `villes-couts-explosifs` (dépenses mensuelles face à un proxy de
salaire départemental) et `villes-logement-introuvable` (tension locative). Avant-dernier ajouté :
**`villes-qui-se-vident`** — le seul autre thème du fichier dont le
classement repose sur une **mesure publiée** et non sur un score : les populations municipales Insee
2011 / 2016 / 2022 lues via `lib/city-population.ts` (538/540 villes, mêmes millésimes dans un même
fichier, donc immunisé aux fusions de communes). Sur les 538 villes couvertes, 204 comptent moins
d'habitants en 2022 qu'en 2016 et 162 perdent sur les deux fenêtres ; 15 villes passent les seuils.
Trois points de méthode à ne pas diluer : ① le **filtre marché** (loyer T2 ≤ 1,10 × la médiane
nationale, `data/housing.ts`) est ce qui empêche le thème de devenir faux — Paris (−6,1 % depuis
2011), Le Kremlin-Bicêtre (−9,4 %) et l'arc azuréen perdent des habitants dans des marchés à 1,5-2,6
fois la médiane, c'est un rétrécissement des ménages, pas une désertion ; la coupure est posée à 1,10
parce que les ratios réels sautent de 1,07 (Fort-de-France, Apt — recul bien réel) à 1,14 (Grasse,
Beaune, Bondy) ; ② il faut un recul **sur les deux fenêtres** (2011→2022 et 2016→2022), sinon un
millésime accidenté suffit à entrer ; ③ le recensement compte la population **résidente** : en
littoral et en montagne (Berck, Briançon) une part de la baisse est une conversion en résidences
secondaires, et le chiffre communal masque le cas classique du centre qui se vide pendant que l'aire
d'attraction gagne — la méthodologie affichée le dit, ne pas l'alléger. Distinct de
`villes-vieillissement-critique` et `villes-fuite-jeunes-actifs`, qui classent des scores de tension
de `lib/demography.ts` : recouvrement mesuré de 4/15 et 2/15 sur le top 15.

### Pending guide work
- **Editorial rewrite (R7.8) — DONE.** Main pass ran 2026-05-30 (all guides → prose voice). Fragment-tail cleanup ran 2026-06-03: the 23 budget/acheter/investment guides the first pass missed (numbered `(N) **Label** : value` scaffolding, detected via `boldColon>=40`) rewritten into flowing prose, 228 strings, figure-integrity verified. Method: extract verbatim bodies → parallel read-only agents → single-writer exact-match apply (see `[[parallel-agents-single-file]]`). Only `intro`/`sections[].body` touched.
  - *Accent restoration — DONE 2026-06-03.* 58 tourism guides (`10-choses-a-faire-*`, incl. Paris/Bordeaux) had been saved ascii-stripped (`decoupe`, `a 57 m`, `28,30 EUR`, `m2`, `360 deg`); diacritics + `€/°/m²/m³` restored across 638 strings, word-skeleton integrity verified. Detected by accent-density < 0.09 (the earlier "~33" estimate undercounted). Legit currency-code `EUR` (EUR/USD context) left intact.

Vivre sans voiture +5, Acheter à [ville] +5, and the "Lire ensuite" reading list (via `lib/guide-suggestions.ts` + auto-block on each guide page) are shipped.

---

## Technical roadmap — pending

Hosting is **Cloudflare** (Workers + `wrangler.toml`), not Vercel.

- [x] **`NEXT_PUBLIC_BASE_URL`** — set in `wrangler.toml [vars]` (`https://www.mavilleideale.fr`); EN export sets `NEXT_PUBLIC_DEFAULT_LOCALE=en`.
- [x] **Host disclosure** — `mentions-légales` / `legal-notice` / privacy pages corrected Vercel → Cloudflare (Cloudflare, Inc.); dates bumped 31 mai 2026.
- [ ] **`app/cgu`** date: bump "Dernière mise à jour" after legal review (currently 25 mai 2026). `confidentialite` already current (Cloudflare + D1 disclosure).

### Audit-derived roadmap (2026-06-02)

- [x] **Region & Department score pages** (§7) — DONE 2026-06-03 (most parts already existed). Aggregate score = mean of region/dept cities' global score: `app/regions/[region]/page.tsx` (`avgScore`/`avgCriteria` + JSON-LD) and `app/departements/[dept]/page.tsx` both already displayed it. City-listing region+dept filters already present in `components/VillesSearch.tsx`. The one missing piece — a **region heatmap layer on `/carte`** — shipped this session: `CarteClient` now has a Villes/Régions toggle drawing one bubble per metropolitan region at its centroid, coloured by avg score (honours active axis + lean filter), linking to `/regions/[slug]`. **EN parity shipped 2026-06-03:** `FranceHeatmap` gained an opt-in `showRegionToggle` prop (default off → homepages/timelapse byte-identical) and the EN `/map` (`app/[locale]/map`) now passes it, mirroring FR `/carte`. *Remaining follow-up: department-granularity heatmap (96 depts — would need clustering to avoid clutter).*
- [x] **Guide hero images** (§4a — deferred 2026-06-02, **DONE 2026-07-13** via the photo pipeline below) — city-specific guides (`10-choses-a-faire-a-X`, `acheter-a-X`, `things-to-do-in-X`…) now render the city's Commons photo as a hero band. A guide only gets one when the city slug appears in the *guide slug* (`guideCityPhoto`) — a ranking guide listing 12 cities is about none of them, and illustrating it with the first would be a lie. Ranking/thematic guides stay text-only by design.

### Photo pipeline (Wikidata P18 → Wikimedia Commons)

`scripts/commune-images.mjs` — crawls **all 34 969 communes** (geo.api.gouv.fr) →
Wikidata QID + main image (P18, anchored on `P374` = INSEE code, one SPARQL query
per département) → Commons `imageinfo` (author, licence, Commons page, 1600px
source). Every stage is **resumable and cached** in `.cache/commune-images/`
(gitignored, rebuildable); rate-limited to ~1 req/s with `Retry-After`-aware
backoff and a contactable User-Agent, as Wikimedia requires.

```bash
npm run photos          # full chain (communes → wikidata → commons → manifest → assets)
npm run photos:update   # re-query Wikidata; only new communes / changed P18 are refetched
node scripts/commune-images.mjs assets --limit=50   # batch control
```

- **No hotlinking.** Photos are downloaded and re-encoded to webp by sharp at
  1024px (hero) + 480px (card), written to `public/photos/villes/` with a
  **content hash** in the filename → `_headers` caches them `immutable`, and an
  upstream photo change ships under a new URL. Stale files are pruned on rerun.
- **Data**: `data/city-images.json` (rich record, server-side, via
  `lib/city-images.ts`) + `data/city-cards.json` (lean: hash/colour/author/
  licence, via `lib/city-cards.ts`) — the lean one exists because `CityCard`
  renders inside client components, and the full record would ride into the
  client bundle for nothing.
- **Attribution is a licence condition, not decoration.** Most files are CC BY-SA:
  `components/CityPhoto.tsx` renders the credit (author · licence · Commons link)
  with the pixels, and non-free licences are filtered out at crawl time
  (`LICENSE_OK`). Cards show unlinked credit text — the tile is already an `<a>`,
  and nesting anchors is invalid HTML.
- **SEO**: city + guide sitemap entries declare their photo (`images:` →
  `<image:image>`), and city JSON-LD carries an `ImageObject` with
  `license` + `acquireLicensePage` + `creditText` (Google Images "Licensable").
- Surfaces: city hero (FR + EN), `CityCard` cover everywhere, and the
  `quartiers` / `climat` / `a-faire` sub-pages (+ EN `neighbourhoods` /
  `climate` / `things-to-do`), plus city-specific guide heroes.
- The crawl covers all 34 969 communes even though only the 540 seed cities get a
  built asset — the manifest is already there the day the seed grows.

### Guide landmarks (`scripts/guide-pois.mjs`)

Illustrates the FR `10-choses-a-faire-a-*` series: Wikidata landmarks located in
the commune (heritage-listed via P1435, or typed as a visitable place — the class
gate is client-side, since P31/P279* in SPARQL blows the 60s WDQS budget) →
matched against each section heading → Commons photo + Google Maps + Wikipedia.
Data in `data/guide-pois.json`, assets under `public/photos/poi/`.

**The matcher is strict on purpose: 246/1690 sections match.** Most headings are
activities ("prendre le petit-déjeuner dans un bouchon"), not places. Every time
the rules were loosened the result was a *wrong* photo: a hotel on "Monter à
Fourvière", a railway station then a théâtre on "le marché de la Croix-Rousse", a
fountain on "Grimper à Montmartre". A section with no landmark stays text-only —
that is the correct outcome. **EN is excluded**: `things-to-do-in-*` headings are
thematic ("Croix-Rousse and the Presqu'île") and name no single place.

## Performance constraints

Pages are static and edge-cached (TTFB 90–300 ms); what costs the user is the
payload the browser must parse.

- **Never render a full collection in a client grid.** `/guides` shipped 2.5 MB of
  HTML by rendering all 654 cards at once. `GuidesGrid` and `VillesSearch` both
  cap the first render (`INITIAL_VISIBLE`) and reveal the rest on click. When you
  cap a hub page, keep the links crawlable — `/guides` emits a compact `<details>`
  link index of all guides (≈100 bytes a link vs ≈2.4 kB a card).
- **Projections, not entities.** A client component's props are serialized twice
  (DOM + RSC flight payload). `/guides` passes card fields only, with `intro` cut
  to a 200-char excerpt.
- **Never import `@/data/guides` (or `@/data/guides-en`) from a client component.**
  A `"use client"` module that touches the corpus ships all ~6 MB of it: an array
  of object literals is not tree-shakable, so asking for `slug`/`title`/`emoji`
  hands the browser the body of every section of every guide — plus `CITIES_SEED`,
  which `data/guides.ts` imports for its integrity asserts. That is how
  `SearchPalette` shipped a **5.9 MB chunk (1.79 MB gzip)**, one order of magnitude
  above every other chunk (fixed 2026-08-04 → 668 kB / 0.13 MB gzip). The same trap
  hides behind `@/lib/guide-tags`, which reads the same module. Client code reads
  **`lib/search-index.ts`** instead — a lean projection generated by
  `scripts/build-search-index.mjs` (`npm run search-index`, replayed by `prebuild`
  so production can't go stale; `npm run search-index:check` fails on a stale
  commit). `GUIDE_CATEGORIES` already lives in `lib/guide-categories.ts` for the
  same reason. If you need a new field client-side, add it to the projection —
  don't import the corpus. **La projection est par locale** (2026-08-06) :
  `data/search-index.json` (FR, depuis `data/guides.ts` + `lib/guide-tags.ts`) et
  `data/search-index.en.json` (EN, depuis `data/guides-en.ts` +
  `lib/guide-tags-en.ts`) sont générés par le même script et commités tous les
  deux ; `lib/search-index.ts` choisit sur `NEXT_PUBLIC_DEFAULT_LOCALE`, valeur
  inlinée au build, donc un seul des deux JSON part dans le bundle (mesuré :
  187 Ko côté FR, 98 Ko côté EN). Ajouter un guide EN sans relancer
  `npm run search-index` fait échouer `search-index:check`, comme côté FR.
- **Le même piège vaut pour `@/data/cities-seed`, et il a tenu plus longtemps** (corrigé
  2026-08-27) : `SearchPalette` importait le seed pour en lire **quatre champs**, et `RANKING_META`
  depuis `@/lib/rankings`, qui tire le seed *et* `data/housing.ts` pour ses fonctions de tri. La
  palette étant montée par la `Navbar`, ces 588 Ko partaient sur **toutes** les pages. Deux
  frontières neuves : **`lib/rankings-meta.ts`** (la table éditoriale des 19 classements, **zéro
  import** ; `lib/rankings.ts` la réexporte, les appelants historiques n'ont rien à changer) et
  **`SEARCH_CITIES`** dans les index générés (slug/nom/région/score, émis par
  `scripts/build-search-index.mjs`, qui **évalue le vrai module** donc porte le score *rendu* et
  jamais le littéral). Mesuré : 741 182 → 266 235 o minifiés, 154 557 → 61 263 o gzip. Un composant
  client qui a besoin d'un champ de ville l'ajoute **à la projection** ; il n'importe pas le seed.
- **Un graphe d'imports dit ce qui est *atteignable*, pas ce qui est *livré*.** Le même audit
  donnait `data/political-lean.json` (289 Ko) pour passager de `PoliticalLeanTail` ; à la mesure, le
  bundler l'élimine déjà (3 584 o avant comme après), les fonctions qui touchent le JSON n'étant pas
  appelées là. Avant d'annoncer un gain, le mesurer — un `esbuild --bundle --minify` sur le composant,
  mêmes externals des deux côtés, suffit et coûte deux secondes, là où `npm run build` est interdit.
- **No framer-motion.** It was pulled in by `ScrollReveal` alone (~110 kB) and has
  been rebuilt on IntersectionObserver + a CSS transition. Don't reintroduce it
  for an effect the compositor can run. Note `ScrollReveal` renders its children
  at `opacity: 0`; the `@media (scripting: none)` rule in `globals.css` is what
  keeps them visible without JS.
- **Known remaining lever:** city pages still ship ~1 MB of JS because
  `CityProfile` is one client component importing ~30 sub-components, most of
  which render static text. Decoupling it (client only for tabs + action buttons)
  is the next real win, and is a refactor of its own. **Le plus gros passager
  identifié est nommé** (audit 2026-08-27) : `data/city-population.json`, 140 Ko,
  atteint par `DemographyCard → lib/demography → lib/city-population`, donc sur
  les 540 pages ville des deux locales. Le remède est le patron déjà en place à
  côté — calculer dans `lib/city-profile-data.ts` (serveur) et descendre le
  résultat en props — mais il touche le rendu des pages ville : **à faire avec un
  build local, pas depuis une routine**. Les autres passagers relevés sont
  légitimes : `city-synthesis` dans `PersonalSynthesisQuiz` (le quiz recalcule
  dans le navigateur), `data/housing.ts` et `data/city-cards.json` dans les six
  quiz et grilles (loyers et photos servent au filtrage côté client).

---

## Pending work

### UX polish
- **R7.10** — Em-dash purge across body copy + meta descriptions. Cap at ~1 per 200 words, never two per sentence. Manually review per-file, don't blanket sed. **Status: at target.** `data/guides.ts` purged 4017→2977 (combined with R7.8's 6750→4017, a 56% drop from origin); now ≈1 em-dash per 200 words — the residual 2977 are overwhelmingly structural separators (`metaTitle` 621, `title` 215, `"N. Label —"` ranking-list separators ~1062) which are intentionally kept. `data/guides-en.ts` (921 / 240,966 words) was already under target, untouched. Purge done via parallel range-agents + word-skeleton integrity guard (verified byte-identical word sequence vs pre-pass snapshot, zero words altered).

R7.2 (méthodologie section already absent), R7.9 (string + soft-fallback shipped in `components/HonestReviewCard.tsx`), R7.11 (`components/DiscussionCTA.tsx` on all 26 sub-pages), R7.12 (emoji icons present on every "Aller plus loin" card) are shipped.

### Product — City Match + vraie vie
- **R8.2 Vraie vie** — Indicateurs manquants: qualité internet (`/villes/[slug]/connexion-internet` shipped), mentalité locale (`/villes/[slug]/mentalite-locale` shipped), tension locative (`/villes/[slug]/tension-locative` shipped), minutes domicile-travail (section "Trajet domicile-travail estimé" sur `/villes/[slug]/transports` shipped). **R8.2 complet.**
- **R8.3 Verticale S'installer** — `/villes/[slug]/s-installer` shipped, `/villes/[slug]/agenda` shipped, portraits-types fictivement étiquetés ("Personnages fictifs · Illustratif uniquement" + disclaimer en bas de page). **R8.3 complet.**

R8.1 City Match (`/city-match` + `lib/city-match.ts`) shipped.

**Refonte du barème 2026-08-17, sur retour lecteur** — « grandes métropoles » sortait Céret
(7 800 hab.), Le Puy et Limoux. Chaque critère rend désormais un *fit* centré converti par un poids
explicite (`W` en tête de fichier) ; le score global de la ville n'est plus la base mais une ancre
de départage à 1,8. Trois points à ne pas défaire :
- **Ne pas revenir à un test en escalier.** « Chaud » ne primait qu'à 24 °C **et** 2 000 h de
  soleil : Bordeaux (23 °C, 2 065 h) comptait comme Lille. Les barèmes sont continus, et `axisFit`
  est volontairement **non borné** — un plafond mettait Obernai (sécurité 8,6) et Fontainebleau
  (8,1) à égalité et l'ordre entre elles devenait celui du seed.
- **Le littoral se lit dans `lib/city-coast.ts`, jamais dans les tags.** L'ancien `isCoastal`
  comparait par sous-chaîne : « sport » contient « port », donc Grenoble, Clermont-Ferrand,
  Saint-Étienne et Tarbes étaient côtières, comme « côte-d'or » et « porte des alpes » ; le repli
  `elevation <= 15 m` ajoutait les ports fluviaux. `data/city-coast.json` (via `npm run coast`)
  porte la distance à la **mer ouverte** — filtre de largeur d'eau, donc un fleuve de 500 m n'est
  pas la mer : La Rochelle 0,1 km, Bordeaux 19,4 km, Nantes 25,5 km, Rouen 57 km.
- **`caveat` doit rester affiché.** Une combinaison peut être insatisfiable (aucune commune
  française de plus de 200 000 hab. n'est en montagne) ; la fiche dit ce que la ville rate
  (« mais 7 800 habitants ») au lieu de laisser l'arbitrage passer pour un bug.

⚠️ Le permalien voyage en **query** (`/city-match?r=<code>`) et son séparateur est un **point**.
`/city-match/r/<code>` n'a jamais existé — tout lien partagé tombait en 404 — et le tiret cassait
le découpage positionnel dès que `single-parent` était la réponse d'étape de vie. Les libellés
restent français dans la lib et sont traduits par `translateReason()` dans
`app/city-match/CityMatchQuiz.tsx` : **tout nouveau libellé demande sa règle**, sinon il part en
français sur bestcitiesinfrance.com.

### Plateforme communautaire (R9)
R9.1 (`/auth` + `/connexion`, Supabase), R9.2 (`/favoris` + `/dashboard`), R9.3 (alertes: `lib/alertes-store.ts` + `POST /api/alertes/subscribe` + cron Mon 08:00 UTC + `components/AlerteForm.tsx` in CityProfile), R9.4 (`/villes/[slug]/questions` + EN `/cities/[slug]/questions`), R9.5 (`/projection-5ans`) shipped.

### Data-visualisation (R10)
- **R10.1** — 2D/3D toggle sur `/carte` via CSS perspective + SVG ColumnLayer. Toggle ◉ 2D / ▲ 3D. Hauteur = score, couleur = score. DROM strip séparé (DromStrip component). Filtres par axe déjà présents. **Shipped** (CSS perspective, no new deps). Note: deck.gl proper avec tuiles carte de fond reste une upgrade future.

R10.2 (`/villes/[slug]/empreinte` + `lib/city-fingerprint.ts` + `components/CityFingerprint.tsx`), R10.3 (`/climat-2040-timelapse`) shipped.

### Features IA (R11)
- **R11.3 "Where people like YOU moved"** — Phase A: `/portraits-types` (FR) + `/community-profiles` (EN), 6 fictional labeled archetypes with real niche scores. Phase B (shipped): estimation model `lib/people-like-you.ts` (`migrationFor(origin, profile)` → upgrades/laterals by persona score over 17 `lib/profile-pages.ts` profiles). Surfaces: interactive `/people-like-you` (FR) + `/[locale]/people-like-you` (EN), and SSG per-origin landing pages `/ou-vont-les-gens/[ville]` (24 biggest departure cities, no-JS/indexable, same engine). Clearly labelled "modèle estimatif, pas de suivi"; swaps to real anonymized account flows once volume allows. (Distinct from `/depuis/[slug]` = weekend travel, and `/expat-retour`.)
- **R11.5 Street Reality Score** — _removed from roadmap (2026-05-31)._

R11.1 (`/future-you` + `lib/future-you.ts`), R11.2 (`/vibe` + `lib/vibe.ts`), R11.6 (`components/VsBattle.tsx`), R11.7 (`/copilot`) shipped.

### Tourisme & activités (R12)
- **R12.1** — `/villes/[slug]/a-faire` shipped: SSG activity sub-page for all 540 cities. Surfaces activity categories from seed data (nature/culture/transport scores + characterTags), links to the `10-choses-a-faire-a-[slug]-2026` guide when available (24 cities). Card added to CityProfile strip. Sitemap entry added.

### Distribution & backlinks (R13)
- **R13.1 Badge embarcable "1ère/2e/Nème ville de France"** — ✅ shipped 2026-07-10 (`/badge` hub + `/badge/[slug]` × 540 SSG, `lib/city-badge.ts` + `components/BadgeEmbed.tsx`). Three formats (compact 280×80, wide 460×120, square 200×200) — self-contained SVG strings (no external font, no fetch), one-click copy for both the full embed `<a>` snippet and the raw SVG. National rank computed once from the seed global score (cached module-level). Card added to the FR CityProfile sub-page grid; `/badge` chunk added to `SITEMAP_CHUNKS_FR` at the tail (order-stable, existing chunk URLs unchanged; `SITEMAP_CHUNK_COUNT` auto-picks it up so `robots.txt` advertises the new chunk). EN mirror deferred — the backlink pitch is a FR-side motion (mairies, offices de tourisme, agences locales), doesn't translate cleanly to `bestcitiesinfrance.com`'s expat audience.
  - **La motion elle-même tourne** : `npx tsx scripts/outreach-mairies.ts` (dry-run par défaut, `--send` pour tirer), registre des communes déjà contactées dans `scripts/outreach-contacted.json`, journal complet dans **`docs/outreach-log.md`**. Deux règles à ne pas contourner : les adresses se résolvent **par code Insee** via l'annuaire officiel de l'État (chercher par nom renvoie des homonymes ; les annuaires tiers ont produit les 4 seuls bounces de la campagne), et tous les chiffres d'un envoi sont **calculés depuis le seed**, jamais saisis à la main. État au 2026-07-29 : 137 envois, 1 réponse presse (NRCO).
- **R13.2 Palmarès mensuel** — ✅ first edition shipped 2026-07-14 as guide `palmares-juillet-2026-rapport-qualite-vie-loyer` (score global ÷ loyer T2, 540 villes, filtre pop ≥ 20k — ranking computed from seed + housing, no invented figures; méthodo affichée dans le guide). **Cadence: one edition per month, published as a guide** (`palmares-[mois]-2026-…`, category `budget`). Second edition shipped 2026-07-28: `palmares-aout-2026-rapport-qualite-vie-prix-achat` (score global ÷ prix d'achat au m², 363 communes éligibles = pop ≥ 20k avec référence de prix). Third edition shipped 2026-08-02: `palmares-septembre-2026-ecoles-cout-du-logement` (**axe `schools` ÷ loyer T3**, 363 communes éligibles = pop ≥ 20k ; les 540 villes du seed ont toutes une référence de loyer, donc le seul filtre est la population). Le thème annoncé en août a été honoré tel quel. Le T3 remplace le T2 de juillet parce qu'une famille avec enfants ne vit pas dans un deux-pièces, et ça change le classement. Ratio publié en **euros de loyer par point de score écoles** (médiane 184 €, Alençon 94 €, Aubervilliers 550 €) : plus lisible que le quotient brut. ⚠️ Le bas du classement est à 26/30 francilien (une seule ville d'Île-de-France dans les 100 premières sur 115 éligibles, Fontainebleau 93e) — la section correspondante dit explicitement que l'axe mesure l'offre communale, pas le destin des élèves, et ne juge ni eux ni leurs enseignants ; garder ce cadrage si l'édition est reprise. Quatrième édition shipped 2026-08-15 : `palmares-octobre-2026-taux-effort-logement` (**loyer T3 annuel ÷ revenu disponible d'un ménage de référence**, 357 communes éligibles). Le thème annoncé en septembre a été honoré tel quel. **Le dénominateur est la nouveauté et le piège** : `medianIncome` est un **niveau de vie par unité de consommation**, pas un revenu de ménage — le multiplier par les UC du ménage cité est obligatoire, sinon le taux affiché est presque doublé. Ménage retenu : couple + un enfant de moins de 14 ans = **1,8 UC** (échelle OCDE modifiée), qui occupe un T3. Éligibilité : pop ≥ 20k **et** niveau de vie publié — 6 des 363 communes de septembre tombent (Les Abymes, Baie-Mahault, Cayenne, Saint-Laurent-du-Maroni, Mamoudzou hors champ Filosofi ; Pierrefitte-sur-Seine fusionnée). Médiane 31,1 %, Aurillac 17,1 %, Paris 62,8 %. ⚠️ Trois limites portées **dans le guide** et à ne pas diluer si l'édition est reprise : ① les revenus sont au millésime **Filosofi 2021** et les loyers à 2026, donc les taux absolus sont **surestimés** et seul le classement tient ; ② le loyer est un loyer **de marché**, donc un coût d'entrée, pas ce que paient les locataires en place ; ③ le revenu disponible Insee **inclut les prestations, aides au logement comprises**, ce qui joue en sens inverse. Le classement est robuste au choix du ménage (corrélation de rang 0,99 avec une personne seule en T1, > 0,99 avec un couple en T2) — ne pas re-débattre du 1,8 UC. Announced next theme (**novembre 2026**) : **population municipale réelle Insee 2011/2016/2022** (`data/city-population.json` via `lib/city-population.ts`, 538/540 villes) croisée avec nos scores — honour it or update the October guide's last section if the theme changes. Method: compile `data/cities-seed.ts` + `data/housing.ts` with a scratch `tsc -p` (commonjs + `@/` resolve hook) and rank from the real pipeline score, never from a regex read of the seed.

### Vacances `/vacances` — architecture (shipped, monétisation pending)
Engines: `lib/vacation-seasons.ts` (climat 12 mois ×352), `lib/vacation-activities.ts` (10 activités), `lib/vacation-fit.ts` (score composite + helpers). 387 routes SSG.
Activation monétisation: créer compte Booking Partners → `NEXT_PUBLIC_BOOKING_AID=XXXXXXX` sur Vercel.
Phase 1.5 shipped: `lib/climate-normals.ts` + `data/climate-normals-raw.json` (29 MF stations, nearest-station snap, fallback sinusoïdale). SVG chart sur `/villes/[slug]/climat` (FR) et `/cities/[slug]/climate` (EN) via `components/ClimateChart.tsx`. Phase 3 shipped: quiz `/vacances/quiz` + email capture (Brevo list 4, `/api/vacances/newsletter`).

---

## Bilingual setup (bestcitiesinfrance.com)

Same repo, same build, two Vercel projects, two domains.

- `mavilleideale.fr` (env: `NEXT_PUBLIC_DEFAULT_LOCALE=fr`, default) — unchanged.
  All FR routes stay at their existing paths (no URL prefix).
- `bestcitiesinfrance.com` (env: `NEXT_PUBLIC_DEFAULT_LOCALE=en`) — the API
  Worker (`worker/index.ts`) maps bare URLs to the `/en/*` asset tree, so the
  URL bar stays clean (e.g. `bestcitiesinfrance.com/cities/lyon` → serves the
  exported `app/[locale]/cities/[slug]` page). There is no `proxy.ts`; with
  `output: "export"` it could never run, and the EN rewrite only exists in the
  deployed Worker (not in `next dev`).

### Key files

- `worker/index.ts` — host canonicalization (apex↔www 301) + EN locale asset
  routing + `/api/*` + crons. Replaces the deleted `proxy.ts`.
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
- **Stay SSG.** EN pages use the same `generateStaticParams` pattern (540 cities at build).
- **Cross-domain canonical.** FR canonical → `mavilleideale.fr/...`,
  EN canonical → `bestcitiesinfrance.com/...`. `hreflang` cross-links the two.
- **Adding EN content for a 11th city.** Add `descriptionEn`, `seoTitleEn`,
  `seoDescriptionEn` to the seed record. No other change required.

### EN routes shipped (as of 2026-05-21)

FR-equivalent routes covered: home, cities index + 352 city pages, 4 city sub-pages (climate/transport/schools/cost-of-living), 17 total city sub-pages, rankings index + 19 detail pages, 18 regions, all departments, quiz, compare + ~300 pairs, compare-regions (78 pairs), guides index + 6 native EN guides, map, leaderboard, about, contact, faq, methodology, legal, privacy.

### EN translation roadmap — pending

**Phase 1 — content depth**
- [x] `descriptionEn` / `seoTitleEn` / `seoDescriptionEn` — all 541 cities populated (verified 2026-05-26)
- [ ] Keep `REGION_EN_DESCRIPTIONS` and `RANKING_EN` in sync with FR changes — *couverture vérifiée 2026-07-28 : 18/18 régions, 19/19 classements, zéro clé orpheline de part et d'autre.* Item permanent (il se rouvre dès qu'une région ou un classement est ajouté côté FR), pas une tâche en attente.

**Phase 2 — missing routes**
- [x] Triplet comparisons `/compare/[a]-vs-[b]-vs-[c]` (shipped via `lib/comparer-triplets.ts` + `app/[locale]/compare/[pair]/page.tsx`)
- [x] `/cities/[slug]/things-to-do` (EN port of FR `a-faire`, ×540 SSG, 2026-06-01) — EN city sub-pages now fully mirror FR
- [x] `/sport` + `/sport/[macroregion]` ×6 (EN national sport ranking, 2026-06-01) — mirrors the `cycling` hub, reuses `lib/sport-leisure`
- [x] `/rental-tension` + `/rental-tension/[macroregion]` ×6 (EN, 2026-06-01) — port of FR `/tension-locative`, reuses `lib/rental-tension`, links to `/cities/[slug]/rental-market`
- [x] `/political-leaning` (EN, 2026-06-01) — port of FR `/orientation-politique`, reuses `lib/political-lean` (`BLOC_LABEL.en`)
- [x] `/weekend-getaways` + `/weekend-getaways/[slug]` ×26 (EN, 2026-06-01) — port of FR `/depuis`, reuses `lib/city-commute`; Paris card → `/from-paris`
- [x] `/tags` + `/tags/[slug]` (EN, 2026-06-01) — port of FR `/tags` via new `lib/guide-tags-en.ts` (reads `EN_GUIDES`; FR `lib/guide-tags` untouched)
- _Note: FR `/palmares` + `/synthese` are already covered by EN `/overall-ranking` (same `lib/city-synthesis`); FR `/vivre-avec` by EN `/living-on`. EN top-level parity with FR is now effectively complete._

**Phase 3 — secondary surfaces** (all shipped)
- [x] `/red-flags` + `/red-flags/themes` (EN)
- [x] `/vacations` (EN port)
- [x] `/quiz/compatibility` (EN port)
- [x] `/calculator/real-cost`, `/household-cost`, `/simulator/purchase`
- [x] City sub-pages: `neighbourhoods`, `seasons`, `honest-review`, `climate-2040`, plus `fingerprint`, `vibe`, `get-settled`, `overview`, `synthesis`, `profiles`

**Phase 4 — long tail**
- [ ] EN guides — in progress (531 native EN guides via `data/guides-en.ts`; FR has 669; not 1:1 translations, native expat-angle content). **2026-06-03 per-city / per-region batches** (all grounded in the matching FR guide's real figures + `housing.ts`, auto-registered via `EN_GUIDES`):
  - **+10 cost-of-living** `cost-of-living-[city]-2026` (Paris/Lyon/Bordeaux/Toulouse/Montpellier/Nice/Nantes/Rennes/Strasbourg/Lille) — from FR `budget-mensuel-realiste`; filled the EN budget gap (was 16 vs FR 134).
  - **+15 where-to-buy** `where-to-buy-in-[city]-2026` (Paris/Lyon/Marseille/Toulouse/Lille/Bordeaux/Nantes/Strasbourg/Rennes/Montpellier/Nice/Grenoble/Annecy/Aix-en-Provence/Biarritz) — from FR `acheter-a-[ville]-quel-quartier-budget`; per-neighbourhood €/m² + foreign-buyer process.
  - **+13 car-free living** `car-free-living-in-[city]-2026` (Paris/Lyon/Strasbourg/Bordeaux/Nantes/Toulouse/Grenoble/Rennes/Montpellier/Nice/Lille/Annecy/Dijon) — from FR `vivre-sans-voiture`; category `lifestyle`.
  - **+12 living in [region]** `living-in-[region]-2026` (the Dordogne, French Basque Country, French Riviera, the Var, Alsace, Brittany, Normandy, Charente-Maritime, Haute-Savoie, Occitanie, Roussillon, Hauts-de-France) — region-level overviews from FR `vivre-en-[region]`; category `moving`. (`leaving-[city]` is already well-covered in EN, so `quitter` was skipped.)
  - **Discoverability (2026-06-04):** the new guides (and all 482) were only reachable via /guides index, search, tags. Fixed the orphan gap: `CityGuidesList` made locale-aware (`locale="en"` reads `EN_GUIDES` + EN copy; FR output byte-identical) and wired into `app/[locale]/cities/[slug]`; EN region pages (`app/[locale]/regions/[region]`) gained a "Guides about [region]" reverse-lookup block. Every EN city/region page now links up to 12 native guides (newest first). FR pages untouched/unchanged.
  - **2026-06-04 — FR parity reached on two series + all admin regions covered (EN 482→526):** **+34 where-to-buy** `where-to-buy-in-[city]-2026` (all remaining FR `acheter-a-[ville]` cities — Amiens/Angers/Arles/Avignon/Bayonne/Besançon/Brest/Caen/Chambéry/Chartres/Clermont-Ferrand/Colmar/Dijon/La Rochelle/Le Havre/Le Mans/Limoges/Lorient/Metz/Mulhouse/Nancy/Nîmes/Orléans/Pau/Perpignan/Poitiers/Reims/Rouen/Saint-Étienne/Toulon/Tours/Troyes/Valence/Vannes) → **where-to-buy now 49/49 vs FR**; **+2 car-free** (Clermont-Ferrand, Marseille) → **car-free now 15/15 vs FR**; **+8 living-in [region]** (Île-de-France, Auvergne-Rhône-Alpes, Nouvelle-Aquitaine, Provence-Alpes-Côte d'Azur, Grand Est, Pays de la Loire, Bourgogne-Franche-Comté, Centre-Val de Loire) → **all 13 metropolitan admin regions now have a top-level EN overview** (the other 5 already shipped). Region guides set `relatedCities` to real region city slugs so they surface on EN region pages (reverse lookup = relatedCities ∩ region-cities, not tags). Method note: re-serialize agent objects through a canonical serializer before splice (2 agents had drifted to 2-space indent / dropped opening `{` — `new Function('['+frag+']')` parse → field-ordered emit → tsc-gated).
  - **2026-06-04 (b) — +10 `best-french-cities-[theme]` ranking guides (EN 526→536):** ports high-intent `meilleures-villes` themes that had no EN equivalent, for the relocation audience: international-schools (`family`), healthcare, lgbt-friendly, wine-lovers, property-investment (`budget`), surf-watersports, vegan-vegetarian, culture-festivals, wellness-spas, clean-air (all `lifestyle` unless noted). Native EN ranking guides grounded in each FR source's real city ranking + data (CHU counts, GP density, rental yields, €/m², ATMO air indices, thermal towns, festivals, school names). `relatedCities` = top-ranked real slugs → surface on those cities'/regions' EN pages. Deliberately NON-overlapping with the existing EN best-cities cluster (foodies/families/students/seniors/remote/cycling/outdoor/mountain/coastal). Still uncovered in EN best-cities (after the (c) batch): freelancer-ecosystem (overlaps remote/nomad), music-scene (overlaps culture-festivals), naturalist-biodiversity, covered-markets, single-parent/blended families, kids-sport, stable-industrial-jobs — all lower expat intent.
  - **2026-06-04 (c) — +5 medium-intent best-cities (EN 536→541):** affordable-property (`budget`, first-time/budget buyers), entrepreneurs-startups (`remote-work`, French Tech), accessibility (`lifestyle`, disabled/reduced-mobility), sustainability (`lifestyle`, greenest/zero-waste), international-students (`lifestyle`, angled at foreign students — distinct from the existing general best-cities-for-students). Same grounding/validation method.
  - **2026-06-04 (d) — +5 micro-region living-in (EN 541→546):** Ariège, Creuse, Berry, Poitou, Ardennes-Meuse (rural sub-regions, unique long-tail, honest cheap-rural-France framing). `living-in` series now covers all 13 admin regions + the major sub-regions; only Périgord/Bretagne-intérieure/Auvergne-profonde left, and those overlap existing EN (the-dordogne / brittany / auvergne-rhone-alpes) so skipped.
  - Method for all: extract FR figures → parallel read-only agents → validate (schema/€-glyph/figure presence/slug-uniqueness) → single-writer insert (parse-validate + canonical re-serialize before splice). The `assertUniqueSlugs` guard blocks any accidental dup at build.
  - **EN guide coverage is now effectively complete for the well-grounded, distinct topics.** Series at FR parity / full coverage: where-to-buy (49/49), car-free (15/15), cost-of-living, things-to-do (170), living-in (13 admin regions + sub-regions), best-french-cities (≈33 themes). The practical "how to move to France" cluster was already comprehensively covered — and had **content-cannibalisation** (near-identical pages competing for one query, same root cause as the earlier dup-*slug* bug but with distinct slugs). **De-duped 2026-06-04 (EN 546→537):** removed 9 near-identical guides keeping the richest + any distinct angle per cluster — healthcare 7→2 (kept `france-healthcare-guide-expats` + `navigating-cpam-doctolib`), banking 3→2, driving-licence 2→1 (broad `driving-in-france` kept separately), income-tax 2→1 (property-tax kept separately), social-security 2→1. Each removed slug 301s to its canonical in `public/_redirects`. NO dangling refs (EN guides cross-link dynamically via `suggestNextEnGuides`, not hardcoded slugs). **Batch 2 (same day, EN 537→532):** the same pattern existed in the best-cities/moving series — removed 5 more: families 2→1, remote-work/digital-nomad 6→3 (kept the `france-for-remote-workers-complete-guide` pillar + `best-french-cities-remote-workers` ranking + `france-for-digital-nomads`), pets 2→1; all 301'd. **Batch 3 (corpus-wide similarity scan):** ran an automated overlap scan across all EN guides (title+headings token overlap, excluding within-series pairs which legitimately share a template). It surfaced one more true cross-cluster dup — two national "complete guide to buying property in France" guides — removed `french-property-purchase-guide-for-expats` (kept the richer `buying-property-in-france-expat-guide`), 301'd. The scan confirmed everything else flagged was **series structure, not duplication** (per-city `where-to-buy`/`living-in`/`things-to-do`, `leaving-[city]`, `[city]-vs-[city]`, `[city]-living-guide` all share templates by design but cover distinct entities). **Net EN 546→531 across the three dedup batches; corpus now clean of clear near-duplicates.**
- **FR dedup (2026-06-04, `data/guides.ts` 669→657):** the FR primary site had the same problem in a different shape — 12 guides existed as both a stale `…-2025` and a current `…-2026` (6 `vivre-en-` regions, 4 `meilleures-villes-` themes, `teletravailler-depuis-alsace`, `metz-vs-nancy-comparatif`). Removed the 2025 versions, kept 2026, 301'd each in `public/_redirects`. Rewrote all surviving `relatedGuides` cross-refs 2025→2026 (occitanie alone was referenced 31×) and removed the 4 resulting consecutive-duplicate entries (Corsica tourism guides). FR guide-page render already filters `relatedGuides` to existing slugs, so no dead links. Detector: `grep slugs | sed 's/-20[0-9]{2}$//' | uniq -d` (same base, two years). A follow-up FR similarity scan (same method as EN) then found one phrasing-dup cluster: an orphan 3-city `guide-immobilier-[city]-prix-quartiers` series (bordeaux/nantes/rennes) whose guides were literally titled "Acheter à [city]…" — pure dups of the canonical 49-city `acheter-a-[city]-quel-quartier-budget` series. Removed the 3 orphans (0 inbound refs), 301'd to the richer `acheter-` versions. **FR 669→654; both FR & EN corpuses now scanned (year-collision + title/heading similarity) and clean of clear near-dupes.** Genuinely remaining = only low-intent listicles (music-scene, covered-markets, naturalist, single-parent/blended families, kids-sport, stable-industrial-jobs) and comparatifs (covered by `/compare`).
  - ✅ **Duplicate-slug bug FIXED + guarded (2026-06-03):** EN had 3 dup slugs (`strasbourg-/rennes-living-guide-for-expats-2026`, `french-school-system-expat-guide-2026`); FR `GUIDES` had 3 more (`vivre-en-centre-val-de-loire-guide-2026`, `vivre-en-hauts-de-france-guide-2026`, `10-choses-a-faire-a-clermont-l-herault-2026`). The 2nd of each pair was dead (`.find()` returns the first) + a dup sitemap URL. Kept the richer variant of each pair. EN 445→442, FR 672→669. **Regression guard added:** `assertUniqueSlugs()` in `lib/data-integrity.ts` throws at module load (dev + `phase-production-build`); wired into `data/guides.ts` (`guides.slug`) and `data/guides-en.ts` (`guides-en.slug`). A future duplicate now fails the build loudly.
- 2026-06-01/02:
  - **170 EN tourism guides `things-to-do-in-[city]-2026` — FULL PARITY with FR `10-choses-a-faire` reached (2026-06-02).** Every FR tourism city now has a native EN counterpart. Auto-surfaced as the featured card on `/cities/[slug]/things-to-do`; slug + featured-card lookup mirror FR `a-faire`. Shipped across 19 batches (batches 6–19 this session, +120 guides covering all of metropolitan France: heritage cathedrals, Loire/Basque/Brittany/Corsica, Riviera, Champagne, the north coast, Alps, Pyrenees, Auvergne, Jura, Vosges, plus the smaller prefecture towns). NB: EN deploy needs `NODE_OPTIONS=--max-old-space-size=4096` (47k-asset upload OOMs Node's default heap — see [[deploy-manual-no-ci]]).
  - 6 EN itinerary guides (`one-week-in-provence`, `french-riviera-road-trip`, `loire-valley-chateaux`, `alsace-wine-route`, `brittany-coast-road-trip`, `three-days-in-paris`) — `category: "lifestyle"`, distinct travel-intent series.
  - EN guide-page "Read next" now relevance-ranked (`lib/guide-suggestions-en.ts`); guide-page JSON-LD enriched (Article author/publisher/mainEntityOfPage + BreadcrumbList).
- [x] Per-city OG images with EN copy (`app/[locale]/cities/[slug]/opengraph-image.tsx`, EN locale, "BestCitiesInFrance")
- [x] EN-specific RSS feed (`/feed.xml` + `/guides/feed.xml` locale-aware via `NEXT_PUBLIC_DEFAULT_LOCALE`)

---

## Roadmap v11 — Data depth, guide series & per-city enrichissement

### Doublons filtrés (déjà livré — ne pas re-créer)

| Demande | Couverture existante |
|---------|----------------------|
| météo / indice météo | `/villes/[slug]/climat` + `ClimateChart` |
| fibre / 5G / internet | `/villes/[slug]/connexion-internet` |
| prix location / tension locative | `/villes/[slug]/tension-locative` |
| transports / gares / autoroutes / temps de trajet | `/villes/[slug]/transports` |
| écoles | `/villes/[slug]/ecoles` (EN: `schools`) |
| sortir / commerces culturels | `/villes/[slug]/a-faire` + guides `10-choses-a-faire` |
| quartiers | `/villes/[slug]/quartiers` |
| comparaisons A vs B | `/comparer/[a]-vs-[b]` (~300 paires SSG) |
| avis | CityProfile onglet discussion |
| immobilier / acheter | guides `acheter-a-[ville]` (49 villes FR + EN) |
| coût de la vie | guides `budget-mensuel-realiste` (FR) + `cost-of-living-[city]` (EN) |
| expatrié | EN living guides |
| criminalité | score `safety` dans seed (affiché onglet scores) |
| score famille / étudiant / retraité / écologique | `lib/niche-scores.ts` + city-match |
| emploi / télétravail | champ `remoteWork` seed + `/copilot` |

### Nouvelles sous-pages ville — ✅ toutes livrées

`/villes/[slug]/statistiques`, `sante`, `air` (= pollution), `emploi`, `commerces` existent tous
(plus `bruit`, `eau`, `risques`, `fiscalite`, `securite`, `demographie`, `sport`, `velo`… — ~38
sous-pages ville au total). Computed from existing seed axes + characterTags, pas de nouveaux
champs seed. Même pattern que `climat`.

### Enrichissement seed — champs à ajouter (toujours ouvert)

`population` est fait ; le reste n'a jamais été ajouté (les sous-pages ci-dessus s'en passent en
computant depuis les axes existants — l'enrichissement reste utile pour des chiffres réels) :

- ~~`population: number`~~ — ✅ dans le seed (recensement)
- ~~`salaireMédianNet`~~ — ✅ **remplacé par mieux, 2026-07-28** : `data/city-income.json`
  (via `scripts/city-income.mjs` + `lib/city-income.ts`) porte le **niveau de vie médian**
  et le **taux de pauvreté** réels, publiés **à la commune** par Insee Filosofi 2021 —
  533/540 villes. C'est plus fin que le proxy départemental prévu ici. Attention au
  vocabulaire : niveau de vie = revenu disponible par unité de consommation, **pas un
  salaire** ; `lib/city-income.ts` porte la convention. Surfacé sur
  `/villes/[slug]/statistiques` + EN `statistics`. Non couvertes : Guadeloupe, Guyane,
  Mayotte (hors champ Filosofi) et Pierrefitte-sur-Seine (fusionnée dans Saint-Denis
  en 2025) — la page n'affiche alors rien plutôt qu'un chiffre inventé.
- ~~`populationEvolution: number`~~ — ✅ **fait 2026-07-29, en mieux** : `data/city-population.json`
  (via `scripts/city-population.mjs` / `npm run population` + `lib/city-population.ts`) porte la
  **population municipale réelle 2011 / 2016 / 2022** et les **sept tranches d'âge** publiées par
  l'Insee à la commune (base « Évolution et structure de la population en 2022 ») — 538/540 villes.
  `lib/demography.ts` ne devine plus le vieillissement ni la trajectoire depuis le département :
  `ageingRisk` lit la part réelle des 60 ans et plus, `trajectoryRisk` l'évolution réelle 2016→2022,
  le proxy départemental ne servant plus que de repli. Surfacé sur `/villes/[slug]/demographie`
  (pyramide des âges) et `/villes/[slug]/statistiques` (+ jumelles EN). Non couvertes : Mamoudzou
  (hors fichier « France hors Mayotte ») et Pierrefitte-sur-Seine (fusionnée dans Saint-Denis en
  2025). ⚠️ Le seed conserve ses `population` approximatives, utilisées par les tris et les seuils
  (éligibilité palmarès, filtres) : les deux nombres coexistent volontairement.
- ~~`prixM2` appartement / maison~~ — ✅ **fait 2026-08-18** : `data/city-property-prices.json`
  (via `scripts/city-property-prices.mjs` / `npm run property-prices` + `lib/property-prices.ts`)
  porte la **médiane des prix au m² réellement enregistrés**, appartement et maison séparément,
  depuis **DVF géolocalisé** (DGFiP / Etalab, millésimes 2024 + 2025, 624 036 ventes retenues).
  540/540 villes ingérées : **499 avec un prix appartement, 507 avec un prix maison**. Surfacé sur
  `/villes/[slug]/logement` et EN `/cities/[slug]/housing` via `components/PropertyPriceTable.tsx`
  (composant **serveur** — le JSON fait 172 Ko et n'a rien à faire dans le bundle client).
  ⚠️ `HOUSING[slug].avgBuyPriceM2` (`data/housing.ts`) **reste** et ne mesure pas la même chose :
  c'est un repère éditorial unique tous biens confondus, pas une médiane de transactions. Les deux
  nombres coexistent volontairement et peuvent diverger — ne pas « aligner » l'un sur l'autre, et
  toujours dire lequel est mesuré. Cinq points de méthode à ne pas défaire : ① `valeur_fonciere`
  est le prix de la **mutation entière** répété sur chaque ligne, donc on regroupe par
  `id_mutation` et on ne garde que les ventes portant **un seul** logement — sans ça une vente
  d'immeuble rapporte le prix complet à la surface d'un lot ; ② une mutation revient sur plusieurs
  lignes (une par parcelle), d'où la déduplication sur (parcelle, surface, type) ; ③ le prix d'une
  **maison inclut le terrain** et les dépendances comptent au numérateur sans compter au
  dénominateur, donc le €/m² maison n'est pas comparable au €/m² appartement à l'euro près — les
  deux surfaces le disent ; ④ sous **20 ventes** d'un type sur la fenêtre, l'effectif est publié
  mais **pas** la médiane (`pending: "sample"`, 15 villes sans prix appartement, 7 sans prix
  maison) ; ⑤ **26 communes n'ont aucun prix et n'en auront jamais dans cette source** — le
  Bas-Rhin, le Haut-Rhin et la Moselle relèvent du **livre foncier** et sont absents de DVF
  (`coverage: "livre-foncier"` : Strasbourg, Mulhouse, Metz, Colmar…), Mayotte n'y est pas non plus
  (`coverage: "absent"`). Le bloc s'affiche quand même et **dit pourquoi** : un blanc silencieux se
  lit comme un oubli. `npm run property-prices:selftest` (15 contrôles hors ligne) couvre les
  quatre pièges d'agrégation, les bornes et l'éclatement PLM (Paris → 75101-75120, Lyon → 69381-69389,
  Marseille → 13201-13216, qui n'existent pas comme fichier sous leur code communal).
  Egress : `files.data.gouv.fr` répond depuis une session **locale**, pas depuis une routine cloud.
- `tauxChomage: number` — % (proxie zone emploi)
- `densiteMedecins: number` — généralistes / 1 000 hab
- `indiceAtmo: number` — qualité air annuelle 0–10 (1 = très pollué)
- `espacesVerts: number` — % superficie communale (proxie CORINE)

**Egress : les sources ouvertes sont joignables depuis une session locale** (vérifié
2026-07-28) — `insee.fr` (fichiers zip/csv), `geo.api.gouv.fr`, `data.gouv.fr`,
`overpass-api.de`. C'est l'environnement des routines cloud qui les refuse (403 CONNECT),
pas le projet. Un pipeline d'enrichissement se lance donc en local, pattern
`scripts/city-income.mjs` : téléchargement caché dans `.cache/`, parse, JSON commité.
`api.insee.fr` (Melodi) reste injoignable et demande un jeton — passer par les fichiers
publiés sur `insee.fr`, dont l'URL est stable (`/fr/statistiques/fichier/<id>/<nom>.zip`).

### Bloc FAQ structuré sur CityProfile — ✅ livré

Accordéon `<details>` natif (réponses dans le HTML statique, no-JS/crawler-friendly) en bas de
`CityProfile.tsx` + `FAQPage` JSON-LD dans `components/CityJsonLd.tsx`. 100 % computé depuis le seed.

### Nouvelles séries de guides per-city (FR)

État au 2026-07-14 :

| Slug pattern | Catégorie | Cible | Statut |
|---|---|---|---|
| `vivre-a-[ville]-2026` | `moving` | top 50 villes | ✅ 51 guides |
| `etudiant-a-[ville]-2026` | `lifestyle` | top 20 villes | ✅ 20 guides |
| `famille-a-[ville]-2026` | `family` | top 20 villes | ✅ 19 guides |
| `retraite-a-[ville]-2026` | `lifestyle` | top 20 villes | ✅ 20 guides (batch 1 shipped 2026-07-14 : Dinan, Lannion, Les Sables-d'Olonne, Royan, Le Puy-en-Velay, Anglet, Hendaye, Vitré, Fontainebleau, Île de Ré ; batch 2 shipped 2026-07-15 : Challans, Tulle, Pontarlier, Saint-Dié-des-Vosges, Château-Gontier, Albertville, Gaillac, Vendôme, Marmande, Saint-Lô) |
| `demenager-a-[ville]-2026` | `lifestyle` (pas de cat. `moving` en FR) | top 50 villes | ✅ 50 guides — série close 2026-07-18 pm. Batch 1 (Paris, Lyon, Marseille, Toulouse, Nice, Nantes, Montpellier, Strasbourg, Bordeaux, Lille), batch 2 (Rennes, Grenoble, Rouen, Angers, Dijon, Tours, Clermont-Ferrand, Metz, Nancy, Caen), batch 3 (Saint-Étienne, Le Havre, Reims, Toulon, Villeurbanne, Nîmes, Aix-en-Provence, Brest, Le Mans, Amiens), batch 4 (Saint-Denis 93, Perpignan, Boulogne-Billancourt, Argenteuil, Orléans, Mulhouse, Saint-Paul Réunion, Nanterre, Créteil, Vitry-sur-Seine), batch 5 (Saint-Denis Réunion, Le Tampon, Aubervilliers, Colombes, Asnières-sur-Seine, Courbevoie, Rueil-Malmaison, Champigny-sur-Marne, Saint-Maur-des-Fossés, Antibes). Logistique déménagement (≠ sous-page `s-installer`) |
| `quartiers-a-eviter-[ville]-2026` | `moving` | top 30 villes | ⛔ **écartée 2026-07-28 — faute de données, pas faute d'envie** |
| `travail-a-[ville]-2026` | `lifestyle` | top 30 villes | ✅ 30 guides — série close 2026-07-22 (batches 1/2/3) |
| `universites-[ville]-2026` | `lifestyle` | top 15 villes | ✅ 15 guides — série close 2026-07-25 (batch 1 : Paris, Lyon, Toulouse, Lille, Bordeaux, Aix-en-Provence, Montpellier, Rennes, Strasbourg, Nantes ; batch 2 : Grenoble, Nice, Clermont-Ferrand, Nancy, Dijon) |

**Pourquoi `quartiers-a-eviter` est écartée (décision 2026-07-28, ne pas la re-proposer sans nouvelles données).**
`data/neighborhoods.ts` couvre les 540 villes mais à raison de **3 quartiers par ville**, et ce sont les quartiers
centraux les mieux connus. Les quartiers que les gens visent réellement en tapant cette requête n'y sont pas. Écrire
la série reviendrait donc à sourcer une réputation de quartier ailleurs que dans nos données — c'est-à-dire à
inventer des chiffres sur des lieux réels et sur les gens qui y habitent, exactement ce que la ligne éditoriale
interdit, avec un risque diffamatoire en prime. Le pendant honnête de `meilleurs-quartiers` existe déjà : la section
quartiers de `acheter-a-[ville]` et `/villes/[slug]/quartiers`, qui disent sur quel axe un quartier décroche et pour
quel profil, sans verdict global. **Condition de réouverture** : enrichir `neighborhoods.ts` à 8-12 quartiers par
ville sur une source réelle (IRIS Insee, SSMSI infracommunal) — auquel cas la série se justifie, en cadrage par
profil (« bruyant pour une famille » ≠ « mauvais »), jamais en liste noire.

Déjà couverts (skip) : `acheter-a-[ville]` (immobilier), `budget-mensuel-realiste-[ville]` (coût de la vie), `10-choses-a-faire-a-[ville]` (sortir), `quitter-[ville]` (départ), `vivre-sans-voiture-[ville]` (transports).

### Pages comparatives éditoriales

L'engine `/comparer/[a]-vs-[b]` est livré + ~300 paires SSG existent.

- ✅ **Landing `/comparer` enrichie** — 50 paires éditoriales (`POPULAR_PAIRS` dans `app/comparer/page.tsx`).
- [x] **Sitemap haut-trafic** — ✅ clos 2026-07-28. `app/sitemap.ts` et `generateStaticParams` dérivent tous deux de `SEO_PAIRS` : la couverture sitemap **est** la liste des paires, il n'y a rien à synchroniser. Reste le choix éditorial de la liste : carré top-15 fermé le 27/07, rangs 16-20 métropolitains (Grenoble, Dijon, Angers, Nîmes) croisés avec le top-11 le 28/07 → **722 paires**, top-20 × top-20 à 156/190. Les 34 restantes sont exclues volontairement (Reims / Toulon / Le Havre / Saint-Étienne face aux rangs 16-20, et tout ce qui implique Saint-Denis de La Réunion) : pas de demande de recherche. **Ne pas viser 1 225** — le top-50 × top-50 complet est majoritairement du bruit.

### Hors périmètre (nécessitent des assets ou APIs externes)

- **Photos / vidéos** : pipeline assets sous licence requis (même contrainte que guide hero images — cf. §4a audit).
- **Cartes thématiques** (écoles, hôpitaux, commerces, météo) : nécessitent APIs data.gouv.fr / IGN / OpenStreetMap Overpass — scope = projet à part entière, pas intégrable dans un build statique sans étape de pré-fetch. *Exception actée 2026-07-22 : les **parcs** passent dans le périmètre via un pipeline Overpass pré-fetché (F59, cf. ROADMAP.md « Vague 6 ») — le pattern `scripts/commune-images.mjs` (crawl caché + resumable + assets versionnés) prouve que c'est tenable en statique.*

---

## Vague 6 (2026-07-22) — parents solo, parcs, navigation départements

Demande utilisateur. Détail complet dans `ROADMAP.md` § « Vague 6 ».

- [x] **F58 — City Match « parent solo »** — 5ᵉ option de la question `stage` dans
  `lib/city-match.ts`. Pondération distincte de `family` : un seul revenu et un seul
  conducteur, donc `cost` et `transport` pèsent autant que `schools`. L'encodage du
  permalien étant positionnel, les anciens liens restent valides.
- [x] **F59 — Parcs & espaces verts par ville** — ✅ **livré 2026-07-27.**
  Pipeline OSM/Overpass → `data/city-parks.json` → `/villes/[slug]/parcs` ×540 (+ EN
  `/cities/[slug]/parks`). Objectif produit : permettre à un parent de *découvrir* des
  parcs au lieu de retourner au même. Attribution ODbL obligatoire. Spec détaillée
  dans `ROADMAP.md`.
- [x] **F60 — `/departements` trouvable** — la page listait ~102 cartes triées par score
  moyen, sans recherche : retrouver le sien demandait de scroller. Remplacé par
  `components/DepartementFinder.tsx` (grille compacte + recherche par **n°**, par nom,
  **ou par ville** — taper « Bordeaux » remonte la Gironde ; tri n° / A-Z / score).
  Les 540 liens villes restent dans le HTML statique sous un `<details>`, pour ne pas
  perdre le maillage interne.
- [x] **F61 — Vacances : profils `monoparental` et `celibataire`** — ajoutés à
  `VACATION_PROFILES` (`lib/vacation-fit.ts`), ce qui génère automatiquement
  `/vacances/profil/[profil]` FR + `/vacations/profile/[profile]` EN, les cartes des
  hubs et les options du quiz. `monoparental` pondère transport + coût au-dessus de
  `famille` (un seul adulte) ; `celibataire` privilégie la densité de vie sur le
  budget, à la différence de `solo` (voyager seul·e ≠ chercher du monde).
  ⚠️ `PROFILE_SLUGS` dans `app/sitemap.ts` était codé en dur — désormais dérivé de
  `VACATION_PROFILES` pour éviter que ça redérive.

---

## Vague 7 (2026-07-29) — Score Biodiversité

Demande utilisateur. Spec complète dans `ROADMAP.md` § « Vague 7 ».

- [ ] **F62 — Score Biodiversité** — couche « nature » sur les 540 villes : espèces
  recensées à proximité (**GBIF**, libre, sans clé), zones protégées et statuts de
  protection (**INPN/MNHN**, gratuit), espaces verts (réutilise `data/city-parks.json`
  de F59, pas de re-crawl). Pipeline pré-fetché `scripts/city-biodiversity.mjs` →
  `data/city-biodiversity.json` commité par lots → `lib/biodiversity.ts` →
  `/villes/[slug]/biodiversite` (+ EN `biodiversity`) SSG conditionnel + classement.
  - **Pas de Supabase** : la demande d'origine le citait, mais l'auth est Worker-native
    sur D1 depuis R9.1 et l'hébergement est Cloudflare **Workers Static Assets** (pas
    Pages). F62 n'a besoin d'aucune base — pipeline → JSON → SSG.
  - **Le biais d'effort d'observation est le cœur du problème** : les occurrences GBIF
    mesurent d'abord la densité de naturalistes, pas la biodiversité. On compte des
    **espèces distinctes normalisées par l'effort** (observateurs / observations), on
    déclare une ville **non mesurable** sous un seuil d'effort plutôt que de lui coller
    un score, et on fait peser lourd les **zones protégées** — un périmètre Natura 2000
    existe indépendamment de qui l'observe.
  - Convention : « Biodiversité » nomme une qualité → **10 = bon**. Licences à afficher
    (DOI GBIF + licence par jeu, `CC BY-NC` filtré ; MNHN + Licence Ouverte).
  - Egress : supposer le crawl bloqué côté routine cloud (403 CONNECT comme Overpass) —
    **passe locale**. Confirmé le 2026-07-30 : `api.gbif.org`, `inpn.mnhn.fr` et
    `www.data.gouv.fr` répondent tous les trois 403 CONNECT depuis la routine.
  - **État au 2026-07-30** : moteur livré, données non collectées. `scripts/city-biodiversity.mjs`
    (`npm run biodiversity`, + `:probe` / `:stats`) et `lib/biodiversity.ts` sont en place ;
    `data/city-biodiversity.json` vaut `{}` — **0/540 villes**, aucune surface, aucun classement.
    La richesse est mesurée par **raréfaction de Hurlbert** (espèces attendues dans 500
    observations) et non par un volume d'occurrences ; sous 500 observations ou 20 observateurs
    la ville est **non mesurable** et n'a pas de score. `overall` reste `null` tant que les zones
    protégées INPN ne sont pas collectées : repondérer 2 composantes sur 3 donnerait un chiffre
    qui ne mesure pas ce que son nom annonce. `cityProtectedAreas()` renvoie `null` = « on ne
    sait pas », jamais `0`. ⚠️ Les paramètres GBIF sont marqués `@unverified` dans le script —
    lancer `npm run biodiversity:probe` en local avant le premier lot.
  - **État au 2026-08-01** : la composante **zones protégées** a son ingest complet —
    `scripts/city-protected-areas.mjs` (`npm run protected-areas`, + `:sources` / `:selftest` /
    `:stats`), branché sur `data/city-protected-areas.json`, qui vaut `{}` : **0/540 villes**,
    egress toujours 403. Les deux surfaces listent les périmètres (type, distance, surface,
    lien fiche INPN, mention MNHN / Licence Ouverte) mais restent garées en `page.pending.tsx`.
    Deux points de méthode à ne pas défaire : ① la couverture est **rastérisée sur une grille
    de 250 m**, jamais une somme de surfaces — les zonages français s'emboîtent (ZNIEFF I dans
    ZNIEFF II, Natura 2000 par-dessus) et une somme compte le même sol plusieurs fois, jusqu'à
    « 180 % du disque protégé » ; chaque cellule retient le niveau de protection le plus fort.
    ② une ville ingérée **sans aucun périmètre** vaut `areasTotal: 0` et s'affiche comme une
    mesure ; seule une ville non ingérée vaut `null` = « on ne sait pas ». ⚠️ Noms d'attributs
    INPN et gabarits d'URL des fiches sont `@unverified` — l'ingest imprime le champ retenu par
    couche, relire ces lignes au premier run local.
  - **État au 2026-08-02** : toujours **0/540 villes** sur les deux composantes (egress 403
    CONNECT retesté). Le run a durci le pipeline GBIF au lieu de collecter :
    `npm run biodiversity:selftest` (22 contrôles hors ligne, symétrique de
    `protected-areas:selftest`) a trouvé deux bugs silencieux au premier lancement. ① GBIF
    renvoie les facettes en `UPPER_SNAKE_CASE` (`SPECIES_KEY`) alors qu'on les demande en
    camelCase : la comparaison `toLowerCase()` ne tombait jamais en face et **chaque ville
    aurait enregistré zéro espèce** sans lever d'erreur. Normaliser en ne gardant que lettres
    et chiffres ; une facette absente lève désormais. ② La raréfaction se calculait sur le
    vecteur d'abondance **tronqué** par le plafond de pagination, contre sa propre somme —
    ce qui **surestime la richesse des villes les mieux relevées**, donc le haut du classement
    (le score est un rang centile sur cette valeur). Désormais : facette complète → exact ;
    tronquée → encadrement rigoureux (`rarefiedExact`, `rarefiedUpper`), et si l'intervalle
    dépasse `MAX_RAREFIED_UNCERTAINTY` (5 %) la ville passe en `richnessPending: "precision"`
    — non classée, la page disant que le défaut est dans *notre* collecte, pas dans la nature.
    `QUERY_VERSION` = 2 ; `MIN_QUERY_VERSION` écarte du barème toute ligne v1. Ne pas
    « simplifier » l'encadrement en republiant la borne basse comme une valeur exacte.
  - **État au 2026-08-03** : toujours **0/540** sur GBIF et INPN (403 CONNECT retesté sur
    `api.gbif.org`, `inpn.mnhn.fr`, `www.data.gouv.fr`). Le run a corrigé la troisième
    composante, **espaces verts** — la seule qui a ses données (F59, 540/540) et la seule
    qui n'avait jamais été passée au garde-fou du biais d'effort. Deux défauts, tous deux
    dans `lib/biodiversity.ts` : ① une commune relevée **sans aucun parc nommé dans OSM**
    valait une surface de `0` et récoltait **0,1/10**, alors que le docstring annonçait
    déjà `null` — 11 communes concernées, dont Sallanches au fond d'une vallée alpine,
    Noirmoutier, Porto-Vecchio, Calvi et Saint-Paul-de-Vence. OSM est une **carte
    contributive, pas un registre** : « personne n'a cartographié » et « pas de verdure »
    y sont indiscernables, donc `greenSpacePerCapita` renvoie désormais `null` et le profil
    porte `greenSpacePending: "mapping"`. ⚠️ Ne pas « harmoniser » ce cas avec les zones
    protégées, où `areasTotal: 0` **est** une mesure : l'inventaire INPN est un registre
    administratif exhaustif, OSM non — c'est la source qui décide, pas la symétrie.
    ② F59 plafonne à **40 parcs par commune** (`PARKS_PER_CITY`) sans avoir gardé le compte
    d'avant plafonnement : pour les **41 communes** qui atteignent le plafond, la surface
    additionnée est un **plancher**, pas un total. Elles gardent leur score (le tri est par
    superficie décroissante, donc chaque parc omis est plus petit que le 40e conservé, lequel
    pèse en médiane 0,19 % du total de sa ville et 0,73 % au pire — l'erreur est bornée et
    joue *contre* les villes les mieux cartographiées), mais les deux surfaces affichent
    un « au moins / at least ». Nouveaux exports : `PARKS_PER_CITY_CAP`,
    `greenSpaceTruncated()`, `GREEN_SPACE_UNMAPPED_COUNT` (11), `GREEN_SPACE_TRUNCATED_COUNT`
    (41) ; les 11 communes non cartographiées sortent aussi du barème centile, où elles
    tassaient le bas avec des valeurs inconnues. Rien ne change côté F59 : pour un
    **répertoire de destinations**, « aucun parc nommé » reste une réponse juste — c'est
    seulement comme **proxy de surface végétale** que le même zéro devient faux.
  - **État au 2026-08-04 — la collecte est débloquée, et automatisée.** Elle ne partira plus
    d'une « passe locale » à demander : `scripts/local-data-runner.sh` tourne en **cron sur
    la machine du propriétaire** (02h20 et 14h20 UTC), lance `npm run biodiversity` par lots
    de 60 villes (~45 s la ville), commite `data/city-biodiversity.json` et pousse. Couverture
    complète attendue en ~5 jours. **Ne redemande pas de passe manuelle et ne relance pas le
    crawl depuis une routine** — l'egress y est refusé et le restera. Les zones protégées
    restent à `{}` : l'INPN publie des shapefiles derrière une page de téléchargement, donc le
    runner saute l'étape tant que les GeoJSON ne sont pas dans
    `.cache/city-protected-areas/sources/` (`npm run protected-areas:sources` donne la ligne
    `ogr2ogr`). Tant que cette composante manque, `overall` reste `null` — inchangé.
  - **État au 2026-08-06 — les deux sous-pages sont EN LIGNE.** `/villes/[slug]/biodiversite`
    et EN `/cities/[slug]/biodiversity` sont dégarées sur les **302/540 villes collectées**
    (278 mesurables, 24 en `richnessPending: "precision"`), `BIODIVERSITY_PAGES_LIVE = true`.
    Publier maintenant se justifie parce que le barème centile s'est montré **stable** à la
    vérification sur l'historique du JSON : entre l'instantané à 182 villes et celui à 302,
    les rangs ont bougé de 0,2 point en médiane, 0,5 au pire, aucune ville d'un point entier.
    ⚠️ Le crawl est **biaisé en taille** (302 collectées à 45 000 hab. de médiane, 238
    restantes à 14 500) : les pages portent un paragraphe « À quoi la ville est comparée »
    qui le dit. Trois bugs que seules les vraies valeurs pouvaient révéler ont été corrigés
    au passage — la carte 🦋 annonçait « effort d'observation trop faible » à **Paris** et à
    toute la petite couronne (les villes les mieux relevées, en réalité tronquées par *notre*
    collecte) ; le sitemap gatait sur `hasBiodiversityData` **sans** le drapeau et annonçait
    donc 604 URL en 404 pendant que les pages étaient garées ; et les deux pages déclaraient
    un `openGraph` **sans `images`**, le piège documenté plus haut. `overall` reste `null`
    (zones protégées 0/540) et `/classements/biodiversite` **n'existe pas** : 278 mesurables,
    sous le seuil de ~300. Détail complet dans `ROADMAP.md` § point d'étape 2026-08-06.
  - **État au 2026-08-10 — crawl terminé (540/540), et le rang de richesse est RETIRÉ.**
    Le seuil de ~300 villes mesurables était franchi (513) ; le corpus complet a permis de
    contrôler la mesure pour la première fois, et elle n'a pas tenu : corrélation de rang
    **−0,77** avec la concentration des relevés (part des observations tenue par 5 espèces),
    **+0,10** seulement avec le nombre d'espèces réellement recensées, et **56 %** de la
    variance expliquée par le seul département. Le score classait le **type de programme de
    saisie** (détecteurs à ultrasons, comptages de colonies, atlas botaniques), pas la nature :
    Douai et ses 2 588 espèces sortaient à 0,0/10, la Guadeloupe à 0,1 et la Guyane à 1,8 quand
    le Centre-Val de Loire tenait 7,8. Le site classait la Beauce au-dessus de l'Amazonie.
    ⚠️ **`/classements/biodiversite` est abandonné, pas reporté — ne pas le recréer** au motif
    que la couverture est bonne : c'est la mesure qui est en cause, pas le nombre de villes.
    De même, ne pas remettre `RICHNESS_RANKING_PUBLISHED` (`lib/biodiversity.ts`) à `true` sans
    avoir refait les trois contrôles ; le remède est un recrawl GBIF agrégé par `datasetKey`
    (`QUERY_VERSION = 3`), pas un correctif d'affichage. Les effectifs bruts restent publiés,
    ils sont exacts — c'est le classement qui était faux. Nouveau motif
    `richnessPending: "incomparable"`, prioritaire sur `effort` / `precision` / `calibration`.
    Détail complet dans `ROADMAP.md` § point d'étape 2026-08-10.
  - **État au 2026-08-13 — l'ingest des zones protégées télécharge ses propres sources.**
    `npm run protected-areas:fetch` (+ `--dry-run`) résout les sept couches **par slug** sur
    data.gouv.fr (`inpn-donnees-du-programme-espaces-proteges` / `-natura-2000` / `-znieff`),
    télécharge, dépaquette et reprojette. ⚠️ **Ne renvoie plus personne vers `inpn.mnhn.fr` pour
    les fichiers** : le MNHN a subi une cyberattaque le 2025-07-26, l'INPN est resté hors ligne
    ~1 an et la « version zéro » revenue le 2026-07-21 ne porte que les fiches espèces (habitats
    et synthèses territoriales annoncés pour 2027) — les pages de téléchargement d'origine
    n'existent plus. Corollaire : les gabarits d'`inpnUrl()` visent l'ancien site et restent
    `@unverified` ; les vérifier avant d'afficher le premier lien de fiche. Le résolveur **refuse
    de choisir** quand une couche correspond à zéro ou plusieurs ressources. Bug corrigé au
    passage : le motif ZNIEFF I acceptait aussi les fichiers ZNIEFF II (0,4 au lieu de 0,25), et
    « Réserves naturelles » / « Parcs naturels régionaux » / « Parcs nationaux » ne
    correspondaient à rien (accents non repliés) — 16 cas de reconnaissance épinglés dans
    `protected-areas:selftest`. Données toujours **0/540**, `overall` toujours `null`.
  - **État au 2026-08-26 — les zones protégées sont collectées (540/540) et publiées en
    comparaison nationale.** La source INPN est morte pour de bon : les `.zip` que data.gouv.fr
    référence répondent 200 en `text/html` depuis la cyberattaque de 07/2025. L'ingest bascule sur
    la **BD TOPO de l'IGN**, qui redistribue les mêmes tracés du MNHN (`sources: "MNHN 2024"`) —
    `source: "bdtopo"`, `ingestVersion: 3`, périmètres arrêtés au **2026-08-19**, 540/540 villes,
    **même jeu de cinq couches partout** (réserves naturelles, parcs nationaux, parcs naturels
    régionaux, arrêtés de biotope, Natura 2000), DROM compris. **Les deux ZNIEFF sont hors calcul** :
    un inventaire sans portée juridique n'entre pas dans un score de protection, et les pages le
    disent. `PROTECTION_CALIBRATED` est donc vrai et chaque ville publie son /10 ; **`overall` reste
    `null`** — deux composantes sur trois ne font pas un agrégat qui mesure ce que son nom annonce.
    Hub national livré le même jour : **`/espaces-proteges` (FR) + `/protected-areas` (EN)**, moteur
    dans `lib/protected-areas-ranking.ts` (aucune mesure nouvelle, tout vient du JSON), convention
    de paliers d'ex æquo de `lib/owner-rankings.ts` appliquée telle quelle. Repères mesurés :
    médiane **6,8 %** du disque de 15 km, Digne-les-Bains **96,4 %**, Marseille **47,9 %** (seule
    commune > 100 000 hab. du top 40), **14 villes à 0,0 %** dont **5 sans aucun périmètre**
    (Albi, Auch, Fleurance, Longwy, Vitré). ⚠️ **Ce n'est pas la réouverture de
    `/classements/biodiversite`** : aucun rang de richesse n'est publié, `RICHNESS_RANKING_PUBLISHED`
    reste `false`. ⚠️ **Cœur de parc national et aire d'adhésion pèsent pareil** (1,0) faute
    d'attribut qui les distingue dans la source, alors que l'aire d'adhésion est une zone de charte :
    sur **11 villes** (dont Toulon) le seul polygone relevé est une aire d'adhésion, leur couverture
    est un **majorant**, et les tableaux l'affichent ligne par ligne. La détection se fait sur le
    **nom** du périmètre — ne pas la prendre pour une donnée. ⚠️ `inpnUrl()` renvoie `null` par
    construction : toutes les URL de `inpn.mnhn.fr` répondent 200 en HTML de coquille, donc aucun
    lien de fiche n'est affiché. Pour le rebrancher un jour, la BD TOPO porte le code MNHN dans
    `identifiants_sources`.

  - **État au 2026-08-31 — le rang d'espaces verts est retiré à son tour ; il ne reste qu'une note.**
    Aucune collecte (les trois JSON sont pleins). La composante **espaces verts** publiait un /10 sur
    529 villes depuis le 06/08 **sans avoir jamais été contrôlée** : elle ne tient pas. Le mécanisme
    est dans le code de collecte, pas dans une statistique — `scripts/city-parks.mjs` interroge
    Overpass en `(area.a)`, qui retourne tout élément **intersectant** la commune, et `out geom` rend
    la géométrie **entière** : un parc à cheval est porté **en entier** au crédit de chaque commune
    qu'il touche, puis divisé par la population de chacune. **45 polygones** sont enregistrés dans 2 à
    4 communes du seed avec la même surface (bois de Vincennes 979,7 ha à Paris, Saint-Mandé,
    Charenton-le-Pont et Vincennes ; Georges-Valbon 337,9 ha à Stains, Garges, La Courneuve et
    Saint-Denis). Mesures sur les 529 notées : corrélation de rang **+0,86** avec la surface du **seul
    plus grand polygone**, **26 des 53 villes du top 10 %** portant un polygone compté aussi ailleurs,
    **27/53** en Île-de-France, **284/529** dont un seul polygone fait plus de la moitié de la surface.
    Saint-Mandé (1 km²) sortait **10,0/10** avec les 980 ha d'un bois qui est à Paris.
    ⚠️ **Retrait complet et pas correctif ciblé** : le défaut n'est *détectable* que si la commune
    voisine est dans nos 540 — Rambouillet, Le Mans ou Dijon débordent pareil sur des communes absentes
    du seed — donc nettoyer les 78 cas visibles aurait donné le barème pour réparé. Le remède est un
    recrawl découpé sur la limite communale, pas un correctif d'affichage.
    ⚠️ **F59 n'est pas touchée** : pour un répertoire de destinations, lister le bois de Vincennes à
    Saint-Mandé est juste — c'est seulement comme **surface par habitant** que le polygone devient faux
    (symétrie exacte du zéro OSM, vrai pour `/parcs`, faux ici). `/parcs` trie par **nombre** de parcs.
    Livré : `GREEN_SPACE_RANKING_PUBLISHED = false`, motif `greenSpacePending: "incomparable"`
    (⚠️ prioritaire **après** `"mapping"`, à l'inverse de la richesse : 11 communes n'ont aucun parc
    nommé, donc rien à comparer, et le leur cacher serait faux), `greenSpaceCrossBorder()` pour que
    chaque page nomme **son** parc partagé, et un `noScoreLabel` (« rang retiré ») parce que les cartes
    de composante écrivaient **« non mesuré » au-dessus du chiffre mesuré**. **`overall` reste `null`
    sur les 540 et une seule composante porte encore une note : les zones protégées.** Les effectifs
    bruts des deux autres restent publiés, ils sont exacts — c'est le classement qui est retiré.

- [ ] **F63 — Qualité de l'air : du modèle à la mesure** — la section existe
  (`/villes/[slug]/air` ×540 + EN `air-quality`) mais `lib/air-quality.ts` **calcule
  tout par heuristique** depuis le seed (population, département, `characterTags`),
  alors que la légende affiche « ATMO · CITEPA · RNSA ». Remplacer par du mesuré :
  **indice ATMO quotidien publié à la commune** (ATMO France / data.gouv.fr) +
  **Geod'Air** (LCSQA/Ineris) pour les concentrations NO2/PM10/PM2.5/O3, rattachées à
  la station la plus proche **avec la distance affichée** (pattern
  `lib/climate-normals.ts`). Pollens RNSA : vérifier la licence avant intégration,
  sinon la dimension reste modélisée **et la page le dit**.
  - Surfaces manquantes que la demande réclame : **hub `/qualite-de-l-air`** (aucun
    aujourd'hui — l'air n'est qu'une sous-page ville), **classement
    `/classements/qualite-de-l-air`** (absent des 19 slugs de `RANKING_META`, à
    ajouter avec `RANKING_EN`), série `qualite-de-l-air-[ville]-2026` **après** la
    phase données seulement, angles saisonniers pollens et épisodes de pollution.
  - ⚠️ **La direction du score est déjà correcte, ne la « corrige » pas** : le moteur
    mesure l'exposition (10 = pire), l'inversion se fait à l'affichage FR **et** EN
    avec la légende « 10 = air le plus pur ». Vérifié 2026-07-29.
  - Demande de recherche **non chiffrée** : le plan Ahrefs refuse keyword explorer et
    Search Console. Sortir les volumes de la GSC avant d'industrialiser la série.

- [ ] **F64 — Actualité locale par ville** — la seule couche mouvante du site : ce que
  les publications officielles disent d'une commune sur 12 mois glissants. Spec complète
  dans `ROADMAP.md` § « Vague 7 — F64 », **à lire avant d'y toucher** (elle contient les
  arbitrages déjà tranchés).
  - **État au 2026-08-04 (matin)** : moteur livré, **0/540 villes**. `scripts/city-news.mjs`
    (`npm run news`, + `:probe` / `:selftest` / `:prune` / `:stats`), `lib/city-news.ts`,
    `components/CityNewsSection.tsx` câblé sur les deux pages ville.
  - **État au 2026-08-04 (après la première passe réelle)** : l'ingest BODACC **ne pouvait
    pas fonctionner** et personne ne pouvait le voir depuis une routine, faute d'egress.
    Quatre défauts, tous silencieux, corrigés contre l'API réelle :
    ① `api.bodacc.fr` **n'a pas de DNS** — DILA publie sur
    `bodacc-datadila.opendatasoft.com` (l'échec remontait en « fetch failed », qui se lit
    comme un blocage proxy) ; ② la famille des procédures collectives s'appelle
    `collective`, pas `procedure_collective`, donc elles comptaient zéro partout ;
    ③ `group_by` refuse les alias et `date_format` — l'agrégation mensuelle passe par
    `year()`/`month()`, et le filtre de familles est **obligatoire** dans le `where` parce
    que `group_by` plafonne à 100 seaux (12 familles × 12 mois débordent, un mois tomberait
    en silence) ; ④ le plus vicieux — le filtre commune était une **égalité sur le nom mis
    en majuscules**, alors que `ville` est du texte libre saisi par les greffes : le 42 porte
    81 650 lignes « Saint-Étienne » **et** 46 184 « Saint-Etienne », Marseille est éclatée
    entre « Marseille » et « Marseille 8e Arrondissement ». Annecy renvoyait 12 lignes sur
    9 621 — un chiffre qui a l'air d'une mesure et vaut 0,1 % du réel. Remplacé par
    `search()`, insensible à la casse et aux accents. **Leçon générale : un constant écrit
    sans avoir vu l'API répondre est `@unverified`, et ne mérite aucune surface au-dessus.**
  - **État au 2026-08-18 — quatrième défaut du même filtre commune, corrigé.** Le filtre
    cherchait le nom **d'affichage** du seed, parenthèse de désambiguïsation comprise
    (« Saint-Denis (La Réunion) », « Le Robert (Martinique) », « Saint-Louis (Haut-Rhin) »),
    alors que le champ `ville` du BODACC ne porte que le nom de commune. Corrélation
    parfaite dans les deux sens : **les 10 seuls noms de seed à parenthèse sont les 10
    villes sorties à zéro entrée** sur 540 — le site affirmait donc que Saint-Denis de La
    Réunion n'avait rien immatriculé, rien radié et connu aucune procédure en douze mois.
    `communeName()` retire la parenthèse **finale** uniquement ; c'est la moitié
    `numerodepartement` de la clause qui distingue les homonymes, elle l'a toujours fait.
    `QUERY_VERSION` = 2 → recollecte des 540 au prochain lot local. Garde permanente :
    `news:selftest` (49 → **56 contrôles**) fait passer les **540 villes réelles** dans le
    vrai constructeur de requête et refuse toute parenthèse dans le **terme** cherché
    (pas dans la clause — `search(…)` en contient toujours). Et `news:stats` **nomme**
    désormais les villes vides au lieu de les compter : c'est ce comptage muet
    (« 13 with nothing in window ») qui a caché les dix Saint-X pendant quinze jours —
    **un agrégat de zéros doit nommer ses membres**. Restent vides et à ne pas confondre :
    `ile-de-re` (pas une commune : dix communes, ancrée sur Saint-Martin-de-Ré — non-correctif
    assumé), `dinan` et `selestat` (inexpliquées, à sonder en local avec
    `npm run news -- --slug=… --force`, ne rien écrire avant que l'API ait répondu).
  - **La collecte est automatisée, ne la relance pas depuis une routine.**
    `scripts/local-data-runner.sh` (cron local, 02h20 / 14h20 UTC) lance `npm run news` par
    lots de 180 villes (~4 s la ville), commite `data/city-news.json` et pousse.
    `npm run news:prune` (refenêtrage 12 mois) et `:selftest` marchent hors ligne. Le RNA
    reste **désactivé** : `RNA_RESOURCE_ID` vaut `null`, la ressource n'a jamais été résolue,
    et une ville sans cette source l'omet de `sources` plutôt que d'afficher zéro association.
  - **Une section, pas une page.** Pas de `/villes/[slug]/actualites` ×540 : une page
    dont le corps est une liste de titres agrégés est du *scraped content*. Donc pas
    d'URL propre, pas d'entrée sitemap, pas de JSON-LD `NewsArticle` (on n'est pas
    l'éditeur), et la section **disparaît** quand la ville n'a rien dans la fenêtre.
  - **Rendu serveur obligatoire** : `CityProfile` est `"use client"` et déjà à ~1 Mo de
    JS ; le composant est monté *après* lui dans la page serveur (précédent
    `CityGuidesList`), jamais importé depuis un composant client.
  - **BODACC et RNA agrégés en compteurs mensuels, jamais nominatifs** — une grande part
    des annonces vise des entrepreneurs individuels, donc des personnes physiques. Seuls
    les arrêtés CatNat, actes de l'État ne nommant personne, sont listés à l'unité.
  - **La presse quotidienne régionale est gatée** (droit voisin, loi 2019-775) et Google
    News RSS est interdit par ses CGU. Aucun scraping d'article, aucune reformulation IA
    (reformuler ne fait pas disparaître le droit voisin, ça ajoute une erreur factuelle
    signée par nous). Phase 1 = open data officielle uniquement.
  - Convention d'honnêteté : on n'y classe ni ne commente. Une création d'entreprise
    n'est pas une bonne nouvelle en soi, une radiation n'est pas une mauvaise. `licence`
    est portée **par entrée**, pas par fichier.

---

### Conventions for adding an EN route

1. Create `app/[locale]/<route>/page.tsx`. Generate static params with `{ locale: "en", ... }` only.
2. Add `metadata.alternates.canonical` pointing at `${ORIGIN_BY_LOCALE.en}/<route>`.
3. If FR and EN share a slug, ensure it is NOT in `FR_ONLY_SEGMENTS` in `proxy.ts`.
4. Add the new URL(s) to a `SITEMAP_CHUNKS_EN` chunk in `app/sitemap.ts`.
5. Keep English native, not translated-from-French. Direct, slightly dry, factual. No "discover the charming…".
6. **Reused FR client components leak French.** If an EN page renders a client/component built for the FR site (e.g. `CityProfile` sub-cards, the interactive tools), that component MUST accept a `locale?: "fr" | "en"` prop (default `"fr"`, FR output byte-identical) and branch every visible string via a `t(fr, en)` helper — plus emit `/cities/`, `/rankings/`, `/compare/` paths under EN. When strings originate in a shared lib, add a local English label map at the display site (don't edit the lib). Audited & fixed 2026-05-31: the 6 interactive tools (`people-like-you`, `copilot`, `city-match`, `future-you`, `projection-5ans`, `climate-2040-timelapse`) + 7 `CityProfile` sub-components. Navbar/Footer/calculators were already locale-aware. 2026-06-01 round: `BookingCTA` + `StickyBookingBar` (EN copy + `.en-gb` booking host, wired across the 6 EN `/vacations` + calculator pages), `CityProfileCta` (EN copy, `/cities/` link, EN score-tier label map), and pass-through `locale="en"` for `CityFingerprint`/`DiscussionCTA` on the EN `fingerprint`/`seasons`/`neighbourhoods` sub-pages. The EN homepage already passes `locale="en"` to its full section tree.
