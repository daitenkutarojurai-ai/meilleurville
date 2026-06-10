// F70 — Sport & loisirs sportifs : classements (dépendants du seed).
//
// Séparé de lib/sport-leisure.ts pour que le compute mono-ville + les
// maps LABEL/COLOR/BG restent seed-free (sinon tout import value embarque
// CITIES_SEED dans le bundle client).

import { CITIES_SEED } from "@/data/cities-seed";
import { computeSportLeisure, type SportLeisure } from "@/lib/sport-leisure";

// ─── Rankings (cache module-level) ────────────────────────────────────────

export interface SportRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  sport: SportLeisure;
}

let SPORT_RANKING_CACHE: SportRanking[] | null = null;

export function getSportRankings(): SportRanking[] {
  if (SPORT_RANKING_CACHE) return SPORT_RANKING_CACHE;
  SPORT_RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    sport: computeSportLeisure(c),
  }));
  return SPORT_RANKING_CACHE;
}

/** Top villes sportives = composite le plus haut (10 = excellent) */
export function topSportFriendly(limit = 30, minPopulation = 0): SportRanking[] {
  return getSportRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.sport.composite - a.sport.composite)
    .slice(0, limit);
}

/** Villes les moins propices = composite le plus bas */
export function bottomSportFriendly(limit = 20, minPopulation = 0): SportRanking[] {
  return getSportRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.sport.composite - b.sport.composite)
    .slice(0, limit);
}
