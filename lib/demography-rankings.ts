// F59 — Démographie & vieillissement : rankings (seed-dependent).
//
// Séparé de lib/demography.ts pour que ce dernier reste seed-free
// (les composants client n'ont besoin que de computeDemography +
// constantes LABEL/COLOR/BG sans bundler les 600 KB du seed).

import { CITIES_SEED } from "@/data/cities-seed";
import { computeDemography, type Demography } from "@/lib/demography";

export interface DemographyRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  demo: Demography;
}

let DEMO_RANKING_CACHE: DemographyRanking[] | null = null;

export function getDemographyRankings(): DemographyRanking[] {
  if (DEMO_RANKING_CACHE) return DEMO_RANKING_CACHE;
  DEMO_RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    demo: computeDemography(c),
  }));
  return DEMO_RANKING_CACHE;
}

/** Villes les plus dynamiques = composite le plus bas (10 = pire). */
export function topMostDynamic(limit = 30, minPopulation = 0): DemographyRanking[] {
  return getDemographyRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.demo.composite - b.demo.composite)
    .slice(0, limit);
}

/** Villes les plus vieillissantes / en décroissance = composite le plus haut. */
export function topMostAgeing(limit = 20, minPopulation = 0): DemographyRanking[] {
  return getDemographyRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.demo.composite - a.demo.composite)
    .slice(0, limit);
}
