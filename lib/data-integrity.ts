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
