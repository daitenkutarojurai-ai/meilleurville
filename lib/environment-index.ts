// F44 — Index environnemental composite
//
// Agrège les 4 dimensions environnementales déterministes :
//   - F40 Risques naturels   (lib/natural-risks.ts)
//   - F41 Stress hydrique    (lib/water-stress.ts)
//   - F42 Qualité de l'air   (lib/air-quality.ts)
//   - F43 Bruit              (lib/noise-exposure.ts)
//
// Chacun retourne un score 0-10 où 10 = pire (exposition maximale).
// On définit un score « santé environnementale » 0-10 où 10 = sain en
// inversant et pondérant.
//
// Pondération de la pondération générale :
//   - Air        30 %   (impact sanitaire OMS le plus quantifié)
//   - Bruit      25 %   (effet sommeil + cardiovasculaire documenté)
//   - Eau        25 %   (restrictions vécues quotidiennement l'été)
//   - Risques    20 %   (probabilité × impact, mais pas quotidien)

import type { CitySeed } from "@/data/cities-seed";
import { computeNaturalRisks } from "@/lib/natural-risks";
import { computeWaterStress } from "@/lib/water-stress";
import { computeAirQuality } from "@/lib/air-quality";
import { computeNoiseExposure } from "@/lib/noise-exposure";

export type EnvLevel = "excellent" | "bon" | "moyen" | "tendu";

export interface EnvironmentIndex {
  /** 0-10, 10 = environnement sain (inversion des stress) */
  healthScore: number;
  level: EnvLevel;
  /** Stress composite 0-10, 10 = pire — utile pour rankings inverses */
  stressComposite: number;
  /** Composants 0-10 (10 = pire), tels que retournés par les libs F40-F43 */
  risques: number;
  eau: number;
  air: number;
  bruit: number;
}

function levelFromHealth(s: number): EnvLevel {
  if (s >= 7.5) return "excellent";
  if (s >= 6) return "bon";
  if (s >= 4.5) return "moyen";
  return "tendu";
}

export function computeEnvironmentIndex(city: CitySeed): EnvironmentIndex {
  const r = computeNaturalRisks(city).composite;
  const e = computeWaterStress(city).composite;
  const a = computeAirQuality(city).composite;
  const b = computeNoiseExposure(city).composite;
  // Composite de stress 0-10 (10 = pire)
  const stress = a * 0.3 + b * 0.25 + e * 0.25 + r * 0.2;
  // Santé environnementale = 10 - stress, arrondi 0.1
  const health = Math.round((10 - stress) * 10) / 10;
  const stressR = Math.round(stress * 10) / 10;
  return {
    healthScore: health,
    level: levelFromHealth(health),
    stressComposite: stressR,
    risques: r,
    eau: e,
    air: a,
    bruit: b,
  };
}

// EnvRanking + getEnvironmentRankings/topHealthiest/topMostStressed moved to
// lib/environment-index-rankings.ts (they map the full seed) so this module —
// reached by QolHeroBadge via quality-of-life-index — stays seed-free.

export const ENV_LEVEL_LABEL: Record<EnvLevel, string> = {
  excellent: "Excellent",
  bon: "Bon",
  moyen: "Moyen",
  tendu: "Tendu",
};

export const ENV_LEVEL_COLOR: Record<EnvLevel, string> = {
  excellent: "text-emerald-600",
  bon: "text-green-600",
  moyen: "text-amber-600",
  tendu: "text-red-600",
};

export const ENV_LEVEL_BG: Record<EnvLevel, string> = {
  excellent: "bg-emerald-50 border-emerald-200",
  bon: "bg-green-50 border-green-200",
  moyen: "bg-amber-50 border-amber-200",
  tendu: "bg-red-50 border-red-200",
};
