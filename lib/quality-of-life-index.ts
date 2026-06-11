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

import type { CityLight } from "@/lib/cities-light";
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

export function computeQualityOfLife(city: CityLight): QualityOfLife {
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

// F55 — Personalised QoL: caller provides relative importance (1-5 each) for
// the 3 pillars, plus the city list (CITIES_LIGHT from a server page — this
// lib stays seed-free so "use client" quizzes can import it). Sub-scores are
// cached per cities array so slider moves don't recompute F44/F47/F50.

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

type PersonalQolRow = Omit<PersonalQolRanking, "score" | "level">;

const PERSONAL_QOL_CACHE = new WeakMap<readonly CityLight[], PersonalQolRow[]>();

function personalQolRows(cities: CityLight[]): PersonalQolRow[] {
  let rows = PERSONAL_QOL_CACHE.get(cities);
  if (!rows) {
    rows = cities.map((c) => {
      const qol = computeQualityOfLife(c);
      return {
        slug: c.slug,
        name: c.name,
        region: c.region,
        department: c.department,
        population: c.population ?? 0,
        envScore: qol.envScore,
        healthScore: qol.healthScore,
        jobScore: qol.jobScore,
      };
    });
    PERSONAL_QOL_CACHE.set(cities, rows);
  }
  return rows;
}

export function personalQolRanking(
  weights: QolWeights,
  cities: CityLight[],
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
  return personalQolRows(cities)
    .filter((r) => r.population >= minPopulation)
    .map((r) => {
      const score =
        Math.round((r.envScore * we + r.healthScore * wh + r.jobScore * wj) * 10) / 10;
      return { ...r, score, level: personalQolLevel(score) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function personalQolLevel(s: number): QolLevel {
  if (s >= 8) return "exceptionnel";
  if (s >= 7) return "excellent";
  if (s >= 5.5) return "bon";
  if (s >= 4) return "moyen";
  return "tendu";
}
