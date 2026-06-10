// 50 curated 3-city comparisons. Same shape as SEO_PAIRS — order in the slug
// matters (it becomes the URL: /comparer/a-vs-b-vs-c) but the page itself
// renders in slug order, so put the "anchor" city first.
//
// Selection heuristic for v1: high-search-intent triplets that don't already
// exist as 2-city pages, mixing intra-regional (metropolises in the same
// region), cross-regional (same-archetype cities), and contrasts (south vs
// west). Build-time integrity check at the bottom fails the build loudly if
// a slug is missing from CITIES_SEED.

import { CITIES_SEED } from "@/data/cities-seed";
import { assertKnownSlugs } from "@/lib/data-integrity";

export const SEO_TRIPLETS: ReadonlyArray<readonly [string, string, string]> = [
  // Top-tier metropolises
  ["lyon", "marseille", "toulouse"],
  ["bordeaux", "nantes", "rennes"],
  ["lyon", "bordeaux", "toulouse"],
  ["montpellier", "nice", "marseille"],
  ["lille", "strasbourg", "lyon"],
  ["lyon", "marseille", "nice"],
  // Atlantic vs Mediterranean (relocation classic)
  ["nantes", "bordeaux", "montpellier"],
  ["la-rochelle", "nantes", "bordeaux"],
  ["la-rochelle", "biarritz", "bayonne"],
  // Brittany trio
  ["rennes", "brest", "vannes"],
  ["rennes", "saint-malo", "vannes"],
  ["rennes", "nantes", "vannes"],
  // South-west wine + sun
  ["bordeaux", "toulouse", "biarritz"],
  ["bordeaux", "biarritz", "bayonne"],
  ["pau", "biarritz", "bayonne"],
  // Mediterranean trio
  ["nice", "marseille", "toulon"],
  ["montpellier", "nimes", "marseille"],
  ["aix-en-provence", "marseille", "toulon"],
  ["nice", "aix-en-provence", "toulon"],
  // Alpine arc
  ["annecy", "chambery", "grenoble"],
  ["grenoble", "lyon", "annecy"],
  ["annecy", "chambery", "thonon-les-bains"],
  // Étudiant trio (large student cities, mid-size)
  ["rennes", "nantes", "montpellier"],
  ["montpellier", "toulouse", "bordeaux"],
  ["grenoble", "lyon", "strasbourg"],
  // Northern alternatives to Paris
  ["lille", "amiens", "rouen"],
  ["lille", "rouen", "reims"],
  ["amiens", "reims", "rouen"],
  // Eastern France
  ["strasbourg", "metz", "nancy"],
  ["strasbourg", "colmar", "metz"],
  ["dijon", "besancon", "metz"],
  // Centre / Loire valley
  ["tours", "orleans", "angers"],
  ["tours", "angers", "le-mans"],
  ["orleans", "tours", "bourges"],
  // Auvergne / Massif Central
  ["clermont-ferrand", "limoges", "saint-etienne"],
  ["clermont-ferrand", "lyon", "saint-etienne"],
  ["limoges", "poitiers", "tours"],
  // Affordable south
  ["nimes", "perpignan", "carcassonne"],
  ["perpignan", "carcassonne", "narbonne"],
  // Family-friendly mid-size, atlantic
  ["la-rochelle", "vannes", "rennes"],
  ["caen", "rennes", "le-havre"],
  ["caen", "le-havre", "rouen"],
  // Premium small (lake / mountain / coast)
  ["annecy", "biarritz", "la-rochelle"],
  ["biarritz", "saint-jean-de-luz", "bayonne"],
  // Cross-regional contrasts
  ["lyon", "bordeaux", "nice"],
  ["rennes", "lyon", "bordeaux"],
  ["nantes", "lyon", "marseille"],
  ["toulouse", "nantes", "rennes"],
  // Underdog / value picks
  ["limoges", "clermont-ferrand", "bourges"],
] as const;

// Build-time guard — fails the build if a triplet references a slug that
// isn't in CITIES_SEED, exactly like SEO_PAIRS does.
const KNOWN_CITY_SLUGS = new Set(CITIES_SEED.map((c) => c.slug));
assertKnownSlugs({
  contextLabel: "SEO_TRIPLETS",
  known: KNOWN_CITY_SLUGS,
  refs: SEO_TRIPLETS.flatMap(([a, b, c]) => [
    { slug: a, sourceLabel: `triplet "${a}-vs-${b}-vs-${c}"` },
    { slug: b, sourceLabel: `triplet "${a}-vs-${b}-vs-${c}"` },
    { slug: c, sourceLabel: `triplet "${a}-vs-${b}-vs-${c}"` },
  ]),
});
