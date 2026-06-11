// F52 — Cadre de Vie : section classement (dépend du seed complet).
// Séparé de lib/quality-of-life-index.ts pour garder computeQualityOfLife(city) seed-free.

import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeQualityOfLife,
  type QualityOfLife,
  type QolLevel,
} from "@/lib/quality-of-life-index";

// ─── Rankings (cache module-level) ────────────────────────────────────────

export interface QolRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  qol: QualityOfLife;
}

let QOL_CACHE: QolRanking[] | null = null;

export function getQualityOfLifeRankings(): QolRanking[] {
  if (QOL_CACHE) return QOL_CACHE;
  QOL_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    qol: computeQualityOfLife(c),
  }));
  return QOL_CACHE;
}

export function topBestQol(limit = 30, minPopulation = 0): QolRanking[] {
  return getQualityOfLifeRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.qol.score - a.qol.score)
    .slice(0, limit);
}

export function topWorstQol(limit = 20, minPopulation = 0): QolRanking[] {
  return getQualityOfLifeRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.qol.score - b.qol.score)
    .slice(0, limit);
}
