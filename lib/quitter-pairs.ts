// F25 — Pages duo « Quitter X pour Y »
//
// Curated origin → destination pairs with high search intent. Each pair must
// reference two existing city slugs in CITIES_SEED, otherwise build fails.
//
// The pair is encoded in the URL as `<origin>-pour-<destination>` to stay
// distinct from `/comparer/<a>-vs-<b>` (neutral comparison) and from the
// editorial long-form guides `quitter-<city>-guide-2026` (single-origin essay).
//
// No new data source: every figure is derived from CITIES_SEED + HOUSING +
// lib/cost-living + lib/owner-scores. Stays honest by design.

import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { fiscalityForCity } from "@/lib/fiscalite";
import {
  climateZoneFor,
  computeBreakdown,
  type CostBreakdown,
  type CostCalcInput,
} from "@/lib/cost-living";
import { computeOwnerScores, type OwnerScore } from "@/lib/owner-scores";

export type QuitterPair = readonly [origin: string, destination: string];

// Curated pairs. Order matters for the index page (Paris-origin first since
// it captures the dominant exode pattern, then regional metropoles).
//
// Selection rules:
// - Origin must be a metropolitan city users actively leave (Paris, Lyon,
//   Marseille, Lille, big-3 banlieue, southern over-priced metros).
// - Destination must be a city with credible draw — milder climate, lower
//   rents, better remote-work fit, or family-friendly profile.
// - Avoid intra-region trivia (e.g. Lyon → Villeurbanne) — must be a real
//   life decision, not a 5 km move.
export const QUITTER_PAIRS: readonly QuitterPair[] = [
  // Paris → grande métropole (le cas le plus cherché)
  ["paris", "lyon"],
  ["paris", "bordeaux"],
  ["paris", "nantes"],
  ["paris", "rennes"],
  ["paris", "toulouse"],
  ["paris", "marseille"],
  ["paris", "lille"],
  ["paris", "montpellier"],
  ["paris", "nice"],
  ["paris", "strasbourg"],
  ["paris", "grenoble"],
  ["paris", "aix-en-provence"],
  // Paris → ville moyenne (l'autre grand bassin d'intent)
  ["paris", "annecy"],
  ["paris", "la-rochelle"],
  ["paris", "pau"],
  ["paris", "reims"],
  ["paris", "tours"],
  ["paris", "le-mans"],
  ["paris", "angers"],
  ["paris", "caen"],
  ["paris", "rouen"],
  ["paris", "dijon"],
  ["paris", "bayonne"],
  ["paris", "brest"],
  ["paris", "clermont-ferrand"],
  ["paris", "biarritz"],
  ["paris", "perpignan"],
  ["paris", "limoges"],
  ["paris", "poitiers"],
  ["paris", "metz"],
  // Lyon → autour
  ["lyon", "annecy"],
  ["lyon", "grenoble"],
  ["lyon", "saint-etienne"],
  ["lyon", "valence"],
  ["lyon", "chambery"],
  ["lyon", "dijon"],
  ["lyon", "clermont-ferrand"],
  // Marseille → autour
  ["marseille", "aix-en-provence"],
  ["marseille", "toulon"],
  ["marseille", "avignon"],
  ["marseille", "montpellier"],
  ["marseille", "nimes"],
  // Lille → autour
  ["lille", "arras"],
  ["lille", "valenciennes"],
  ["lille", "amiens"],
  // Toulouse → autour
  ["toulouse", "albi"],
  ["toulouse", "montauban"],
  ["toulouse", "pau"],
  ["toulouse", "tarbes"],
  // Bordeaux → autour
  ["bordeaux", "la-rochelle"],
  ["bordeaux", "bayonne"],
  ["bordeaux", "pau"],
  ["bordeaux", "perigueux"],
  ["bordeaux", "agen"],
  // Nantes → autour
  ["nantes", "rennes"],
  ["nantes", "angers"],
  ["nantes", "la-roche-sur-yon"],
  // Nice → autour
  ["nice", "antibes"],
  ["nice", "cannes"],
  // Strasbourg → autour
  ["strasbourg", "metz"],
  ["strasbourg", "colmar"],
  ["strasbourg", "mulhouse"],
  // Montpellier → autour
  ["montpellier", "nimes"],
  ["montpellier", "beziers"],
  ["montpellier", "perpignan"],
  // Rennes → autour
  ["rennes", "brest"],
  ["rennes", "saint-malo"],
  ["rennes", "quimper"],
  // Mouvement inverse / atypique (couvre les recherches "quitter province pour Paris/Lyon")
  ["nice", "lyon"],
  ["marseille", "lyon"],
  ["lille", "lyon"],
  ["lille", "paris"],
  ["bordeaux", "paris"],
  ["lyon", "paris"],
] as const;

export interface QuitterPairData {
  origin: (typeof CITIES_SEED)[number];
  destination: (typeof CITIES_SEED)[number];
  originBreakdown: CostBreakdown | null;
  destinationBreakdown: CostBreakdown | null;
  monthlySavings: number | null; // destination − origin (negative if origin already cheaper)
  rentSavings: number | null;
  // Ratio of destination cost to origin cost. < 1 = cheaper destination.
  costRatio: number | null;
  // Wins/losses: scores where destination outperforms origin by ≥ 0.4 / underperforms by ≥ 0.4.
  ownerWins: OwnerScore[]; // best destination scores vs origin
  ownerLosses: OwnerScore[]; // worst destination scores vs origin
  globalDelta: number; // destination.scores.global − origin.scores.global
}

function parseFonciereMidpoint(range: string): number | null {
  const cleaned = range.replace(/ /g, " ").replace(/[€/an\s]/g, "");
  const m = cleaned.match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  const lo = Number(m[1]);
  const hi = Number(m[2]);
  if (Number.isNaN(lo) || Number.isNaN(hi)) return null;
  return Math.round((lo + hi) / 2);
}

function breakdownFor(city: (typeof CITIES_SEED)[number]): CostBreakdown | null {
  const housing = getHousing(city.slug);
  if (!housing?.avgRentT2) return null;
  const fisc =
    city.department && city.region
      ? fiscalityForCity({ department: city.department, region: city.region })
      : null;
  const taxeFonciereAnnualMidpoint = fisc ? parseFonciereMidpoint(fisc.taxeFonciereT3) : null;
  // Touch climateZone to ensure dept covered (computeBreakdown handles unknown gracefully)
  void climateZoneFor(city.department);
  const input: CostCalcInput = {
    citySlug: city.slug,
    cityName: city.name,
    department: city.department,
    region: city.region,
    population: city.population,
    avgRentT2: housing.avgRentT2,
    taxeFonciereAnnualMidpoint,
  };
  return computeBreakdown(input);
}

export function buildQuitterPairData(originSlug: string, destinationSlug: string): QuitterPairData | null {
  const origin = CITIES_SEED.find((c) => c.slug === originSlug);
  const destination = CITIES_SEED.find((c) => c.slug === destinationSlug);
  if (!origin || !destination) return null;

  const originBreakdown = breakdownFor(origin);
  const destinationBreakdown = breakdownFor(destination);

  const monthlySavings =
    originBreakdown && destinationBreakdown
      ? originBreakdown.totalFixed - destinationBreakdown.totalFixed
      : null;
  const rentSavings =
    originBreakdown && destinationBreakdown
      ? originBreakdown.rentT2 - destinationBreakdown.rentT2
      : null;
  const costRatio =
    originBreakdown && destinationBreakdown && originBreakdown.totalFixed > 0
      ? destinationBreakdown.totalFixed / originBreakdown.totalFixed
      : null;

  const originScores = computeOwnerScores(origin);
  const destinationScores = computeOwnerScores(destination);

  type ScorePair = { key: string; destination: OwnerScore; delta: number };
  const pairs: ScorePair[] = destinationScores.map((d) => {
    const o = originScores.find((s) => s.key === d.key);
    return { key: d.key, destination: d, delta: o ? d.value - o.value : 0 };
  });

  const ownerWins = pairs
    .filter((p) => p.delta >= 0.4)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3)
    .map((p) => p.destination);

  const ownerLosses = pairs
    .filter((p) => p.delta <= -0.4)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 3)
    .map((p) => p.destination);

  return {
    origin,
    destination,
    originBreakdown,
    destinationBreakdown,
    monthlySavings,
    rentSavings,
    costRatio,
    ownerWins,
    ownerLosses,
    globalDelta: Number((destination.scores.global - origin.scores.global).toFixed(1)),
  };
}

export function pairToSlug([a, b]: QuitterPair): string {
  return `${a}-pour-${b}`;
}

export function slugToPair(slug: string): QuitterPair | null {
  const parts = slug.split("-pour-");
  if (parts.length !== 2) return null;
  return [parts[0], parts[1]] as const;
}

// Build-time integrity check: every pair must resolve to two real cities.
// Throws at module load if a slug is broken — catches typos before deploy.
for (const [a, b] of QUITTER_PAIRS) {
  if (!CITIES_SEED.some((c) => c.slug === a)) {
    throw new Error(`QUITTER_PAIRS: unknown origin slug "${a}"`);
  }
  if (!CITIES_SEED.some((c) => c.slug === b)) {
    throw new Error(`QUITTER_PAIRS: unknown destination slug "${b}"`);
  }
  if (a === b) {
    throw new Error(`QUITTER_PAIRS: pair must differ ("${a}" === "${b}")`);
  }
}
