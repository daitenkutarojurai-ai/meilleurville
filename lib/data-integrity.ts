/**
 * Build-time data integrity checks.
 *
 * Catches the class of bug where a slug is referenced from one dataset
 * (guides.relatedCities, SEO_PAIRS, etc.) but never declared in
 * CITIES_SEED — producing silent filtering in the UI.
 *
 * Run automatically at module load in dev/build; throws on first
 * problem so the build fails loudly. In production runtime we skip
 * the check (env === 'production' and not at build) to avoid any
 * cold-start tax.
 */

const SHOULD_VALIDATE =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PHASE === "phase-production-build";

/**
 * Validate that every slug in `refs` exists in the canonical `known` set.
 * Throws a single combined error listing all unknowns.
 */
export function assertKnownSlugs(opts: {
  refs: ReadonlyArray<{ slug: string; sourceLabel: string }>;
  known: ReadonlySet<string>;
  contextLabel: string;
}): void {
  if (!SHOULD_VALIDATE) return;
  const missing: Array<{ slug: string; sourceLabel: string }> = [];
  for (const ref of opts.refs) {
    if (!opts.known.has(ref.slug)) missing.push(ref);
  }
  if (missing.length === 0) return;

  const summary = missing
    .slice(0, 25)
    .map((m) => `  - "${m.slug}" referenced by ${m.sourceLabel}`)
    .join("\n");
  const overflow = missing.length > 25 ? `\n  …and ${missing.length - 25} more` : "";
  throw new Error(
    `[data-integrity] ${opts.contextLabel}: ${missing.length} ghost slug${
      missing.length > 1 ? "s" : ""
    } referenced but not declared in CITIES_SEED.\n${summary}${overflow}`
  );
}

/**
 * Validate that no two cities declare the same INSEE code.
 *
 * The code is the join key for every external dataset we pull: parks are
 * crawled from OSM on `ref:INSEE`, revenus come from Filosofi on `GEO`, and
 * `/villes/[slug]/risques` deep-links Géorisques with it. A shared code is
 * therefore not a cosmetic duplicate — it silently attributes one commune's
 * real data to another. Found 2026-07-28 with 5 pairs (Moulins carried
 * Montluçon's code and so displayed Montluçon's parks; same for Saint-Tropez /
 * Saint-Raphaël, Sarrebourg / Sarreguemines, Saint-Benoît / Saint-Denis de La
 * Réunion, Île de Ré / La Rochelle).
 */
export function assertUniqueInseeCodes(opts: {
  cities: ReadonlyArray<{ slug: string; inseeCode?: string }>;
  contextLabel: string;
}): void {
  if (!SHOULD_VALIDATE) return;
  const bySlug = new Map<string, string>();
  for (const c of opts.cities) if (c.inseeCode && !bySlug.has(c.slug)) bySlug.set(c.slug, c.inseeCode);

  const byCode = new Map<string, string[]>();
  for (const [slug, code] of bySlug) {
    const list = byCode.get(code);
    if (list) list.push(slug);
    else byCode.set(code, [slug]);
  }
  const clashes = [...byCode.entries()].filter(([, slugs]) => slugs.length > 1);
  if (clashes.length === 0) return;

  const list = clashes.map(([code, slugs]) => `  - ${code} → ${slugs.join(", ")}`).join("\n");
  throw new Error(
    `[data-integrity] ${opts.contextLabel}: ${clashes.length} INSEE code${
      clashes.length > 1 ? "s" : ""
    } shared by several cities. Each city must carry its own commune code — a shared one attributes another commune's parks, revenus and Géorisques report to it.\n${list}`
  );
}

/**
 * Validate that no slug appears more than once in `slugs`. Throws listing the
 * duplicates. Guards against the class of bug where two records share a slug:
 * the later one becomes dead/shadowed (a `.find()` getter returns the first)
 * and the route/sitemap emits a duplicate URL. Fixed for guides 2026-06-03.
 */
export function assertUniqueSlugs(opts: {
  slugs: ReadonlyArray<string>;
  contextLabel: string;
}): void {
  if (!SHOULD_VALIDATE) return;
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const slug of opts.slugs) {
    if (seen.has(slug)) dups.add(slug);
    seen.add(slug);
  }
  if (dups.size === 0) return;

  const list = [...dups]
    .slice(0, 25)
    .map((s) => `  - "${s}"`)
    .join("\n");
  const overflow = dups.size > 25 ? `\n  …and ${dups.size - 25} more` : "";
  throw new Error(
    `[data-integrity] ${opts.contextLabel}: ${dups.size} duplicate slug${
      dups.size > 1 ? "s" : ""
    } declared more than once (the later one is dead/shadowed).\n${list}${overflow}`
  );
}
