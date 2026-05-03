/**
 * Distribution rescaling pass — runs once over all calibrated cities.
 *
 * Problem: many cities cluster at 7.5+ on every axis, which hides differentiation.
 * Solution: per-axis z-score normalization to a target distribution
 * (mean ≈ 5.9, std ≈ 1.25) clamped to [2.5, 8.7]. Top cities reach ~8.0–8.5,
 * average sits around 6.0, weak performers go to 4–5.
 *
 * Applied AFTER calibrateScores so editorial overrides still anchor the ordering;
 * we keep relative ordering and only stretch/compress the spread.
 */

import type { CityScore } from "@/lib/types";

type Axis = keyof Omit<CityScore, "global">;
const AXES: Axis[] = ["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"];

interface City {
  slug: string;
  scores: CityScore;
}

const TARGET_MEAN = 5.9;
const TARGET_STD = 1.25;
const MIN = 2.5;
const MAX = 8.7;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function recomputeGlobal(s: CityScore): number {
  const w = {
    life: 0.18,
    safety: 0.18,
    cost: 0.16,
    nature: 0.12,
    transport: 0.10,
    culture: 0.10,
    schools: 0.08,
    remoteWork: 0.08,
  };
  const total =
    s.life * w.life +
    s.safety * w.safety +
    s.cost * w.cost +
    s.nature * w.nature +
    s.transport * w.transport +
    s.culture * w.culture +
    s.schools * w.schools +
    s.remoteWork * w.remoteWork;
  return Math.round(total * 10) / 10;
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
    next.global = recomputeGlobal(next);
    return { ...city, scores: next };
  });
}
