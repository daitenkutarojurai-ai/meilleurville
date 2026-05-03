/**
 * Niche scores derived from base axes + tags + geography.
 * Pure functions — no extra data layer needed; keeps everything client-friendly.
 */

import type { CitySeed } from "@/data/cities-seed";

export type Terrain = "mer" | "montagne" | "plaine" | "vallee";

export interface NicheScores {
  expat: number;        // 0-10
  remote: number;       // 0-10
  petFriendly: number;  // 0-10
  retirement: number;   // 0-10
  studentLife: number;  // 0-10
  terrain: Terrain;
}

const COASTAL_KEYWORDS = ["port", "mer", "littoral", "côte", "balnéaire", "atlantique", "méditerranée", "manche"];
const MOUNTAIN_KEYWORDS = ["montagne", "alpin", "pyrénées", "ski", "altitude"];
const VALLEY_KEYWORDS = ["vallée", "valley", "vignoble", "loire", "rhône", "vaucluse"];

function clamp(n: number, lo = 0, hi = 10): number {
  return Math.max(lo, Math.min(hi, n));
}

function hasTag(city: CitySeed, words: string[]): boolean {
  const tags = city.characterTags.map((t) => t.toLowerCase());
  return tags.some((t) => words.some((w) => t.includes(w)));
}

function inferTerrain(city: CitySeed): Terrain {
  if (hasTag(city, MOUNTAIN_KEYWORDS) || (city.elevation ?? 0) >= 500) return "montagne";
  if (hasTag(city, COASTAL_KEYWORDS) || (city.elevation ?? 999) <= 15) return "mer";
  if (hasTag(city, VALLEY_KEYWORDS)) return "vallee";
  return "plaine";
}

export function computeNicheScores(city: CitySeed): NicheScores {
  const s = city.scores;
  const pop = city.population ?? 20000;

  // Expat-friendliness: bigger cosmopolitan cities + transport + culture
  const expatBoost =
    (pop > 200_000 ? 1.2 : pop > 80_000 ? 0.4 : -0.6) +
    (hasTag(city, ["international", "erasmus", "tech", "métropole", "tourisme"]) ? 0.8 : 0);
  const expat = clamp(0.4 * s.transport + 0.3 * s.culture + 0.2 * s.remoteWork + 0.1 * s.life + expatBoost);

  // Remote work: existing axis dominates, boost for affordable cities
  const costBoost = s.cost >= 7 ? 0.5 : 0;
  const remote = clamp(0.7 * s.remoteWork + 0.15 * s.life + 0.15 * s.culture + costBoost);

  // Pet-friendly: nature dominates + low-density bonus
  const lowDensityBoost = pop < 80_000 ? 0.6 : pop > 400_000 ? -0.6 : 0;
  const petFriendly = clamp(0.6 * s.nature + 0.2 * s.safety + 0.2 * s.life + lowDensityBoost);

  // Retirement: safety + cost + nature + calm (small/mid pop)
  const calmBoost = pop < 50_000 ? 0.6 : pop > 300_000 ? -0.8 : 0;
  const climateBoost = (city.avgTempJanuary ?? 5) >= 6 ? 0.4 : 0;
  const retirement = clamp(0.3 * s.safety + 0.25 * s.cost + 0.2 * s.nature + 0.15 * s.life + 0.1 * s.transport + calmBoost + climateBoost);

  // Student life: culture + cost + tag boost
  const studentBoost = hasTag(city, ["étudiant", "universit"]) ? 1.0 : pop > 100_000 ? 0.3 : -0.4;
  const studentLife = clamp(0.4 * s.culture + 0.25 * s.cost + 0.2 * s.transport + 0.15 * s.life + studentBoost);

  return {
    expat: Math.round(expat * 10) / 10,
    remote: Math.round(remote * 10) / 10,
    petFriendly: Math.round(petFriendly * 10) / 10,
    retirement: Math.round(retirement * 10) / 10,
    studentLife: Math.round(studentLife * 10) / 10,
    terrain: inferTerrain(city),
  };
}

export const TERRAIN_LABELS: Record<Terrain, string> = {
  mer: "🌊 Mer / côte",
  montagne: "⛰️ Montagne",
  plaine: "🌾 Plaine",
  vallee: "🍇 Vallée",
};
