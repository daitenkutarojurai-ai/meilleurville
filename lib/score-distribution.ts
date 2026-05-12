/**
 * Distribution rescaling pass — runs once over all calibrated cities.
 *
 * Goal: a realistic spread where "average French city" sits around 5/10,
 * mediocre cities clearly drop into the 3–4 range, and only a handful of
 * cities reach 8+. Negatives bite: a single weak axis (insecurity, prohibitive
 * cost, scolaires faibles) drags the global score down so the user sees the
 * trade-off instead of a uniform "everywhere is great".
 *
 * Mechanics:
 *  1. Per-axis z-score normalization → target mean ≈ 5.0, std ≈ 1.7
 *     clamped to [1.8, 8.8]. Pulls clusters apart and pushes weak cities down.
 *  2. Global is a weighted mean MINUS a "worst-axis penalty":
 *       penalty = max(0, (4.5 - min_axis)) * 0.55
 *     so a city with safety 3.0 loses ~0.8 pts on its global score.
 *  3. Final clamp on global: [2.5, 8.6].
 *
 * Applied AFTER calibrateScores so editorial overrides still anchor ordering.
 * We keep the *ranking* but stretch the *spread*.
 */

import type { CityScore } from "@/lib/types";

type Axis = keyof Omit<CityScore, "global">;
const AXES: Axis[] = ["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"];

interface City {
  slug: string;
  scores: CityScore;
}

const TARGET_MEAN = 5.7;
const TARGET_STD = 1.7;
const MIN = 2.2;
const MAX = 9.0;

const GLOBAL_MIN = 2.8;
const GLOBAL_MAX = 8.6;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Weighted mean + worst-axis penalty + safety/cost double-bite.
 * A city that is unsafe OR unaffordable loses points proportionally; mediocre
 * cities (no axis above 6) cap below 6.5.
 */
function computeGlobal(s: CityScore): number {
  const w = {
    life: 0.18,
    safety: 0.18,
    cost: 0.15,
    nature: 0.12,
    transport: 0.10,
    culture: 0.10,
    schools: 0.09,
    remoteWork: 0.08,
  };
  const weighted =
    s.life * w.life +
    s.safety * w.safety +
    s.cost * w.cost +
    s.nature * w.nature +
    s.transport * w.transport +
    s.culture * w.culture +
    s.schools * w.schools +
    s.remoteWork * w.remoteWork;

  const axes = [s.life, s.safety, s.cost, s.nature, s.transport, s.culture, s.schools, s.remoteWork];

  // Worst-axis penalty: any axis below 4.5 drags the global down.
  // Threshold raised from 3.5 → 4.5 so mediocre axes are punished earlier.
  const worst = Math.min(...axes);
  const worstPenalty = Math.max(0, 4.5 - worst) * 0.35;

  // Safety bite: real insecurity is a deal-breaker.
  const safetyPenalty = s.safety < 4.5 ? (4.5 - s.safety) * 0.25 : 0;

  // Standout bonus: only truly exceptional top-3 earn extra credit.
  // Threshold raised 7.0 → 7.5 and multiplier cut 0.6 → 0.35 so it's rare.
  const top3 = [...axes].sort((a, b) => b - a).slice(0, 3);
  const top3Mean = top3.reduce((a, b) => a + b, 0) / 3;
  const standoutBonus = Math.max(0, top3Mean - 7.5) * 0.35;

  const raw = weighted - worstPenalty - safetyPenalty + standoutBonus;
  return Math.round(clamp(raw, GLOBAL_MIN, GLOBAL_MAX) * 10) / 10;
}

export function normalizeDistribution<T extends City>(cities: T[]): T[] {
  if (cities.length === 0) return cities;

  // Compute per-axis mean & std
  const stats: Record<Axis, { mean: number; std: number }> = {} as never;
  for (const axis of AXES) {
    const values = cities.map((c) => c.scores[axis]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
    const std = Math.sqrt(variance) || 1;
    stats[axis] = { mean, std };
  }

  return cities.map((city) => {
    const next: CityScore = { ...city.scores };
    for (const axis of AXES) {
      const { mean, std } = stats[axis];
      const z = (city.scores[axis] - mean) / std;
      const v = TARGET_MEAN + z * TARGET_STD;
      next[axis] = Math.round(clamp(v, MIN, MAX) * 10) / 10;
    }
    next.global = computeGlobal(next);
    return { ...city, scores: next };
  });
}
