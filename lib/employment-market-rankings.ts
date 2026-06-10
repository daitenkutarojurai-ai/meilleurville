// F50 — Emploi & marché du travail : classements (dépendants du seed).
//
// Séparé de lib/employment-market.ts pour que le compute mono-ville + les
// maps LABEL/COLOR/BG restent seed-free (sinon tout import value embarque
// CITIES_SEED dans le bundle client).

import { CITIES_SEED } from "@/data/cities-seed";
import { computeEmploymentMarket, type EmploymentMarket } from "@/lib/employment-market";

// ─── Rankings ─────────────────────────────────────────────────────────────

export interface EmploymentRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  market: EmploymentMarket;
}

let EMP_RANKING_CACHE: EmploymentRanking[] | null = null;

export function getEmploymentRankings(): EmploymentRanking[] {
  if (EMP_RANKING_CACHE) return EMP_RANKING_CACHE;
  EMP_RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    market: computeEmploymentMarket(c),
  }));
  return EMP_RANKING_CACHE;
}

export function topMostFavorable(limit = 30, minPopulation = 0): EmploymentRanking[] {
  return getEmploymentRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.market.composite - b.market.composite)
    .slice(0, limit);
}

export function topMostDifficult(limit = 20, minPopulation = 0): EmploymentRanking[] {
  return getEmploymentRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.market.composite - a.market.composite)
    .slice(0, limit);
}
