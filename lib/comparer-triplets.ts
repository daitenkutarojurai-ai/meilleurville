// Curated 3-city comparison triplets — used by /comparer/[pair]/page.tsx
// and app/sitemap.ts. Each triplet renders at /comparer/a-vs-b-vs-c.
//
// Same shape and integrity-check pattern as SEO_PAIRS — every slug must
// exist in CITIES_SEED, else the build fails loudly. Keep the list short
// and high-intent: clusters that users genuinely shortlist together
// (regional rivals, lifestyle-equivalent metros, alpine triangle, etc.).

import { CITIES_SEED } from "@/data/cities-seed";
import { assertKnownSlugs } from "@/lib/data-integrity";

export const SEO_TRIPLETS: ReadonlyArray<readonly [string, string, string]> = [
  // Top métropoles
  ["paris", "lyon", "marseille"],
  // Sud-Ouest / Occitanie
  ["bordeaux", "toulouse", "montpellier"],
  // Atlantique
  ["nantes", "rennes", "bordeaux"],
  // Triangle alpin
  ["annecy", "chambery", "grenoble"],
  // Côte PACA
  ["nice", "marseille", "toulon"],
  // Vallée du Rhône
  ["lyon", "grenoble", "valence"],
  // Languedoc-Roussillon
  ["montpellier", "nimes", "perpignan"],
  // Grand Est
  ["strasbourg", "metz", "nancy"],
  // Côte Atlantique sud
  ["la-rochelle", "bordeaux", "biarritz"],
  // Pays Basque
  ["pau", "bayonne", "biarritz"],
  // Hauts-de-France
  ["lille", "amiens", "reims"],
  // Bretagne
  ["brest", "rennes", "nantes"],
  // Côte d'Azur
  ["nice", "cannes", "antibes"],
  // Normandie
  ["caen", "rouen", "le-havre"],
  // Sud-Est métros
  ["aix-en-provence", "marseille", "toulon"],
] as const;

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
