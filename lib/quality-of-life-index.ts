// F52 — Méga-index « Cadre de Vie »
//
// Combine en un score unique 0-10 (10 = excellent cadre de vie) :
//   - F44 environnement (santé environnementale 10 = sain)
//   - F47/F49 santé (composite 10 = désert) → on inverse en healthScore
//   - F50/F51 emploi (composite 10 = sinistré) → on inverse en marketScore
//
// Pondération « tous publics » :
//   - Environnement   35 %  (impact santé long-terme + qualité quotidienne)
//   - Santé           30 %  (vital + porte d'entrée du système de soins)
//   - Emploi          35 %  (raison principale de relocation pour 25-55 ans)

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeEnvironmentIndex } from "@/lib/environment-index";
import { computeHealthcareAccess } from "@/lib/healthcare-access";
import { computeEmploymentMarket } from "@/lib/employment-market";

export type QolLevel = "exceptionnel" | "excellent" | "bon" | "moyen" | "tendu";

export interface QualityOfLife {
  /** 0-10, 10 = cadre de vie exceptionnel */
  score: number;
  level: QolLevel;
  /** Composantes 0-10 où 10 = bon (déjà inversées) */
  envScore: number;
  healthScore: number;
  jobScore: number;
}

function levelFromScore(s: number): QolLevel {
  if (s >= 8) return "exceptionnel";
  if (s >= 7) return "excellent";
  if (s >= 5.5) return "bon";
  if (s >= 4) return "moyen";
  return "tendu";
}

export function computeQualityOfLife(city: CitySeed): QualityOfLife {
  const env = computeEnvironmentIndex(city);
  const health = computeHealthcareAccess(city);
  const job = computeEmploymentMarket(city);
  // Inversions : healthcare et employment retournent 10 = pire.
  const healthScore = Math.round((10 - health.composite) * 10) / 10;
  const jobScore = Math.round((10 - job.composite) * 10) / 10;
  const envScore = env.healthScore; // déjà inversé
  const score =
    Math.round((envScore * 0.35 + healthScore * 0.3 + jobScore * 0.35) * 10) / 10;
  return {
    score,
    level: levelFromScore(score),
    envScore,
    healthScore,
    jobScore,
  };
}

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

export const QOL_LEVEL_LABEL: Record<QolLevel, string> = {
  exceptionnel: "Exceptionnel",
  excellent: "Excellent",
  bon: "Bon",
  moyen: "Moyen",
  tendu: "Tendu",
};

export const QOL_LEVEL_COLOR: Record<QolLevel, string> = {
  exceptionnel: "text-emerald-700",
  excellent: "text-emerald-600",
  bon: "text-green-600",
  moyen: "text-amber-600",
  tendu: "text-red-600",
};

export const QOL_LEVEL_BG: Record<QolLevel, string> = {
  exceptionnel: "bg-emerald-50 border-emerald-300",
  excellent: "bg-emerald-50 border-emerald-200",
  bon: "bg-green-50 border-green-200",
  moyen: "bg-amber-50 border-amber-200",
  tendu: "bg-red-50 border-red-200",
};
