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

// F55 — Personalised QoL: caller provides relative importance (1-5 each) for
// the 3 pillars. We renormalise to sum to 1 and recompute the composite.
// The 3 sub-scores (envScore, healthScore, jobScore — all "10 = good") are
// reused from the cached ranking, so this is cheap (no recompute of F44/F47/F50).

export interface QolWeights {
  env: number;   // 1-5
  health: number;
  job: number;
}

export interface PersonalQolRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  envScore: number;
  healthScore: number;
  jobScore: number;
  /** Score perso 0-10, 10 = match parfait selon les poids fournis */
  score: number;
  level: QolLevel;
}

export function personalQolRanking(
  weights: QolWeights,
  limit = 10,
  minPopulation = 0,
): PersonalQolRanking[] {
  const w = {
    env: Math.max(1, Math.min(5, weights.env)),
    health: Math.max(1, Math.min(5, weights.health)),
    job: Math.max(1, Math.min(5, weights.job)),
  };
  const sum = w.env + w.health + w.job;
  const we = w.env / sum;
  const wh = w.health / sum;
  const wj = w.job / sum;
  return getQualityOfLifeRankings()
    .filter((r) => r.population >= minPopulation)
    .map((r) => {
      const score =
        Math.round((r.qol.envScore * we + r.qol.healthScore * wh + r.qol.jobScore * wj) * 10) / 10;
      const out: PersonalQolRanking = {
        slug: r.slug,
        name: r.name,
        region: r.region,
        department: r.department,
        population: r.population,
        envScore: r.qol.envScore,
        healthScore: r.qol.healthScore,
        jobScore: r.qol.jobScore,
        score,
        level: levelFromScore(score),
      };
      return out;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
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

function levelFromScore(s: number): QolLevel {
  if (s >= 8) return "exceptionnel";
  if (s >= 7) return "excellent";
  if (s >= 5.5) return "bon";
  if (s >= 4) return "moyen";
  return "tendu";
}
