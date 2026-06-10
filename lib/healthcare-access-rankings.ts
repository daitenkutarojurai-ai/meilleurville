// F47 — Accès aux soins : rankings (seed-dependent).
//
// Séparé de lib/healthcare-access.ts pour que ce dernier reste seed-free
// (les composants client n'ont besoin que de computeHealthcareAccess +
// constantes LABEL/COLOR/BG sans bundler les 600 KB du seed).

import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeHealthcareAccess,
  type HealthcareAccess,
} from "@/lib/healthcare-access";

export interface HealthRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  access: HealthcareAccess;
}

let HEALTH_RANKING_CACHE: HealthRanking[] | null = null;

export function getHealthcareRankings(): HealthRanking[] {
  if (HEALTH_RANKING_CACHE) return HEALTH_RANKING_CACHE;
  HEALTH_RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    access: computeHealthcareAccess(c),
  }));
  return HEALTH_RANKING_CACHE;
}

/** Meilleur accès = composite le plus bas (10 = pire) */
export function topBestAccess(limit = 30, minPopulation = 0): HealthRanking[] {
  return getHealthcareRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.access.composite - b.access.composite)
    .slice(0, limit);
}

/** Désert médical = composite le plus haut */
export function topDeserts(limit = 20, minPopulation = 0): HealthRanking[] {
  return getHealthcareRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.access.composite - a.access.composite)
    .slice(0, limit);
}
