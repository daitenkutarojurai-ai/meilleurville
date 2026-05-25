// R8.2 — Estimated home-to-work commute minutes per city.
//
// Pure derivation from population + transport score + character tags. Returns
// a one-way trip estimate. Marked as estimate everywhere it's surfaced.
//
// Logic:
//  - Base from population tier (larger = longer commute).
//  - Transport score adjustment: better transport reduces commute; worse adds.
//  - Mountain/coastal corridor tags add penalty (geographically constrained).
//
// Anchors: Insee "Mobilités professionnelles" 2022 (national avg ~22 min one-way,
// Paris metro ~40 min, big metros 25-32 min, mid cities 15-22 min, small <15 min).

import type { CitySeed } from "@/data/cities-seed";

export interface CommuteEstimate {
  oneWayMinutes: number;
  roundTripMinutes: number;
  carShare: number;     // 0-1, share of commuters using car
  publicShare: number;  // 0-1, share using public transport
  activeShare: number;  // 0-1, share walking or cycling
  label: "court" | "modéré" | "long" | "très long";
  labelEn: "short" | "moderate" | "long" | "very long";
}

function baseMinutesByPop(pop: number): number {
  if (pop >= 2_000_000) return 38;
  if (pop >= 800_000)   return 30;
  if (pop >= 300_000)   return 24;
  if (pop >= 120_000)   return 20;
  if (pop >= 50_000)    return 16;
  if (pop >= 20_000)    return 13;
  return 11;
}

function hasGeoConstraint(city: CitySeed): boolean {
  const tags = (city.characterTags ?? []).map((t) => t.toLowerCase()).join(" ");
  return /alpin|montagne|côte|littoral|valléee|vallée|presqu'île|isthme/.test(tags);
}

export function commuteEstimate(city: CitySeed): CommuteEstimate {
  const pop = city.population ?? 30_000;
  const base = baseMinutesByPop(pop);

  // Transport score adjustment: midpoint 5.5, ±20% effect
  const t = city.scores.transport ?? 5;
  const transportAdj = (5.5 - t) * 0.6; // -3 to +3 min approx

  const geoAdj = hasGeoConstraint(city) ? 2.5 : 0;

  const oneWay = Math.max(8, Math.min(55, Math.round(base + transportAdj + geoAdj)));

  // Mode shares: transport score and population both push public/active up.
  const isBigMetro = pop >= 500_000;
  const isMediumCity = pop >= 100_000;
  const publicShare = isBigMetro
    ? Math.min(0.55, 0.18 + (t - 4) * 0.08)
    : isMediumCity
      ? Math.min(0.35, 0.08 + (t - 4) * 0.05)
      : Math.min(0.15, 0.03 + (t - 4) * 0.025);
  const activeShare = Math.min(0.25, 0.06 + (t - 4) * 0.03);
  const carShare = Math.max(0.2, 1 - publicShare - activeShare);

  const label: CommuteEstimate["label"] =
    oneWay <= 14 ? "court" : oneWay <= 22 ? "modéré" : oneWay <= 32 ? "long" : "très long";
  const labelEn: CommuteEstimate["labelEn"] =
    oneWay <= 14 ? "short" : oneWay <= 22 ? "moderate" : oneWay <= 32 ? "long" : "very long";

  return {
    oneWayMinutes: oneWay,
    roundTripMinutes: oneWay * 2,
    carShare: Math.round(carShare * 100) / 100,
    publicShare: Math.round(publicShare * 100) / 100,
    activeShare: Math.round(activeShare * 100) / 100,
    label,
    labelEn,
  };
}
