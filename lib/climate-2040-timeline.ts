// R10.3 — Climate 2040 timelapse: interpolate the macro-region projection
// linearly from a 2026 baseline to the 2040 ARPEGE horizon, so a year slider
// (2026 → 2040) can recolour a France map in real time.
//
// Pure math on top of lib/climate-2040.ts macro-region deltas. No new dataset.

import type { CitySeed } from "@/data/cities-seed";
import { projectClimate2040 } from "@/lib/climate-2040";

export const CLIMATE_TIMELINE_MIN_YEAR = 2026;
export const CLIMATE_TIMELINE_MAX_YEAR = 2040;

export interface InterpolatedClimate {
  /** Linearly interpolated July temp °C between today and the 2040 horizon. */
  julyC: number | null;
  /** Linearly interpolated count of days > 30 °C per year. */
  days30C: number;
  /** Linearly interpolated tropical-night count (> 20 °C). */
  tropicalNights: number;
  /** Fraction of the 2026 → 2040 trajectory consumed (0–1). */
  progress: number;
}

export function interpolateClimate(city: CitySeed, year: number): InterpolatedClimate {
  const proj = projectClimate2040(city);
  const clampedYear = Math.max(CLIMATE_TIMELINE_MIN_YEAR, Math.min(CLIMATE_TIMELINE_MAX_YEAR, year));
  const progress = (clampedYear - CLIMATE_TIMELINE_MIN_YEAR) / (CLIMATE_TIMELINE_MAX_YEAR - CLIMATE_TIMELINE_MIN_YEAR);

  const julyC =
    proj.currentJulyC != null && proj.projectedJulyC != null
      ? Math.round((proj.currentJulyC + (proj.projectedJulyC - proj.currentJulyC) * progress) * 10) / 10
      : null;

  const days30C = Math.round(
    proj.currentDays30C + (proj.projectedDays30C - proj.currentDays30C) * progress,
  );

  const tropicalNights = Math.round(
    proj.currentTropicalNights + (proj.projectedTropicalNights - proj.currentTropicalNights) * progress,
  );

  return { julyC, days30C, tropicalNights, progress };
}

export type ClimateMetric = "julyC" | "days30C" | "tropicalNights";

export const METRIC_META: Record<ClimateMetric, { label: string; unit: string; description: string }> = {
  julyC:           { label: "Température juillet",  unit: "°C", description: "Moyenne mensuelle de juillet" },
  days30C:         { label: "Jours > 30 °C / an",   unit: "j",  description: "Nombre de journées caniculaires annuelles" },
  tropicalNights:  { label: "Nuits tropicales",     unit: "n",  description: "Nuits restant au-dessus de 20 °C" },
};

/** Colour ramp for a given metric value — colder/safer = blue/green, hotter/dangerous = red. */
export function metricColor(metric: ClimateMetric, value: number): string {
  if (metric === "julyC") {
    // 18 → blue, 30 → red
    if (value <= 19) return "#3B82F6";
    if (value <= 21) return "#22D3EE";
    if (value <= 23) return "#84CC16";
    if (value <= 25) return "#F59E0B";
    if (value <= 27) return "#F97316";
    return "#EF4444";
  }
  if (metric === "days30C") {
    if (value <= 5) return "#3B82F6";
    if (value <= 15) return "#22D3EE";
    if (value <= 25) return "#84CC16";
    if (value <= 40) return "#F59E0B";
    if (value <= 60) return "#F97316";
    return "#EF4444";
  }
  // tropicalNights
  if (value <= 3) return "#3B82F6";
  if (value <= 8) return "#22D3EE";
  if (value <= 18) return "#84CC16";
  if (value <= 35) return "#F59E0B";
  if (value <= 55) return "#F97316";
  return "#EF4444";
}

export function metricValue(c: InterpolatedClimate, metric: ClimateMetric): number {
  if (metric === "julyC") return c.julyC ?? 0;
  if (metric === "days30C") return c.days30C;
  return c.tropicalNights;
}
