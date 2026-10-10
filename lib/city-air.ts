// F63 — measured air quality (data/city-air.json, scripts/city-air-quality.mjs).
//
// Server-only: read from page components, never from a "use client" module.
// One record per seed city that has at least one qualifying BACKGROUND station
// within the pipeline's radius; a pollutant is absent when no station
// qualifies, and the page must say so rather than borrow a far station.
//
// Distinct from lib/air-quality.ts, which MODELS exposure from seed fields
// (10 = worst). These are measurements: µg/m³ annual means, and for ozone a
// count of days. Higher is worse for all four; there is no score here.

import raw from "@/data/city-air.json";

export type AirPollutant = "no2" | "pm25" | "pm10" | "o3";

export interface AirMeasure {
  value: number;
  station: string;
  stationCode: string;
  area: string | null;
  distanceKm: number;
  coverage: number;
}

type AirFile = {
  meta: { year: number; stationRule: string; licence: string; generatedAt: string; evaluated: string[]; pollutants: AirPollutant[] };
  cities: Record<string, Partial<Record<AirPollutant, AirMeasure>>>;
};

const data = raw as unknown as AirFile;

export const AIR_MEASURE_YEAR = data.meta.year;
export const AIR_MEASURED_CITY_COUNT = Object.keys(data.cities).length;

const ALL: AirPollutant[] = ["no2", "pm25", "pm10", "o3"];
/** Only the pollutants the last pipeline run processed, in display order. */
export const AIR_POLLUTANTS: AirPollutant[] = ALL.filter((p) => data.meta.pollutants.includes(p));

const EVALUATED = new Set(data.meta.evaluated);
/** False for a city added to the seed after the last run: its card stays
 *  hidden instead of claiming "no station nearby". */
export function cityAirEvaluated(slug: string): boolean {
  return EVALUATED.has(slug);
}

/** Reference values. WHO 2021 air quality guidelines (annual means) and the EU
 *  limit values in force (Directive 2008/50/EC). Directive (EU) 2024/2881
 *  tightens the annual limits to 20 (NO2), 10 (PM2.5) and 20 (PM10) µg/m³ from
 *  2030. Ozone: EU target value = no more than 25 days a year above 120 µg/m³
 *  (max daily 8-hour mean, averaged over 3 years); the WHO has no day count. */
export const AIR_REFERENCES: Record<AirPollutant, { who: number | null; eu: number; eu2030: number | null; unit: "µg/m³" | "days" }> = {
  no2: { who: 10, eu: 40, eu2030: 20, unit: "µg/m³" },
  pm25: { who: 5, eu: 25, eu2030: 10, unit: "µg/m³" },
  pm10: { who: 15, eu: 40, eu2030: 20, unit: "µg/m³" },
  o3: { who: null, eu: 25, eu2030: null, unit: "days" },
};

export function cityAirMeasures(slug: string): Partial<Record<AirPollutant, AirMeasure>> | null {
  return data.cities[slug] ?? null;
}
