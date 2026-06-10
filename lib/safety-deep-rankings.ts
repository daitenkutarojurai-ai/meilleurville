// F58 — Sécurité deep-dive : rankings (seed-dependent).
//
// Séparé de lib/safety-deep.ts pour que ce dernier reste seed-free
// (les composants client n'ont besoin que de computeSafetyDeep +
// constantes LABEL/COLOR/BG sans bundler les 600 KB du seed).

import { CITIES_SEED } from "@/data/cities-seed";
import { computeSafetyDeep, type SafetyDeep } from "@/lib/safety-deep";

export interface SafetyRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  safety: SafetyDeep;
}

let SAFETY_RANKING_CACHE: SafetyRanking[] | null = null;

export function getSafetyDeepRankings(): SafetyRanking[] {
  if (SAFETY_RANKING_CACHE) return SAFETY_RANKING_CACHE;
  SAFETY_RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    safety: computeSafetyDeep(c),
  }));
  return SAFETY_RANKING_CACHE;
}

/** Villes les plus calmes = composite le plus bas (10 = pire). */
export function topSafest(limit = 30, minPopulation = 0): SafetyRanking[] {
  return getSafetyDeepRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.safety.composite - b.safety.composite)
    .slice(0, limit);
}

/** Villes les plus tendues = composite le plus haut. */
export function topMostStressed(limit = 20, minPopulation = 0): SafetyRanking[] {
  return getSafetyDeepRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.safety.composite - a.safety.composite)
    .slice(0, limit);
}
