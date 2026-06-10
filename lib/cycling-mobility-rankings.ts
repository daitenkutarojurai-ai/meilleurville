// F57 — Mobilité douce / cyclabilité : classements (dépendants du seed).
//
// Séparé de lib/cycling-mobility.ts pour que le compute mono-ville + les
// maps LABEL/COLOR/BG restent seed-free (sinon tout import value embarque
// CITIES_SEED dans le bundle client).

import { CITIES_SEED } from "@/data/cities-seed";
import { computeCyclingMobility, type CyclingMobility } from "@/lib/cycling-mobility";

// ─── Rankings (cache module-level) ────────────────────────────────────────

export interface CyclingRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  cycling: CyclingMobility;
}

let CYCLING_RANKING_CACHE: CyclingRanking[] | null = null;

export function getCyclingRankings(): CyclingRanking[] {
  if (CYCLING_RANKING_CACHE) return CYCLING_RANKING_CACHE;
  CYCLING_RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    cycling: computeCyclingMobility(c),
  }));
  return CYCLING_RANKING_CACHE;
}

/** Top villes cyclables = composite le plus haut (10 = excellent) */
export function topCyclable(limit = 30, minPopulation = 0): CyclingRanking[] {
  return getCyclingRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.cycling.composite - a.cycling.composite)
    .slice(0, limit);
}

/** Villes non-cyclables = composite le plus bas */
export function topNonCyclable(limit = 20, minPopulation = 0): CyclingRanking[] {
  return getCyclingRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.cycling.composite - b.cycling.composite)
    .slice(0, limit);
}
