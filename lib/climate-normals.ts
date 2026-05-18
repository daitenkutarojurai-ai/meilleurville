// Real Météo-France climatic normals 1991-2020, loaded from
// `data/climate-normals-raw.json` (collected via Wikipedia FR
// "Tableau climatique" sections that mirror official MF data).
//
// 29 reference stations across France métropolitaine + DROM. Cities snap
// to their nearest station by great-circle distance and inherit its
// monthly profile.
//
// Used as the primary source by `lib/vacation-seasons.ts`; the
// sinusoidal interpolation kicks in as a fallback only when a variable
// is `null` at the matched station (sunHours / rainDays sometimes
// missing on DROM and a few mainland stations).

import rawData from "@/data/climate-normals-raw.json";
import type { CitySeed } from "@/data/cities-seed";
import type { MonthIndex } from "@/lib/vacation-seasons";

export interface NormalMonth {
  tempAvg: number | null;
  tempMin: number | null;
  tempMax: number | null;
  precipMm: number | null;
  rainDays: number | null;
  sunHours: number | null;
}

export interface ClimateStation {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  months: NormalMonth[]; // length 12, indexed Jan..Dec
}

interface RawShape {
  source: string;
  generated: string;
  notes?: string[];
  stations: ClimateStation[];
}

const DATA = rawData as RawShape;

export const CLIMATE_SOURCE = DATA.source;
export const CLIMATE_STATIONS: ClimateStation[] = DATA.stations;

// ─── Nearest-station lookup ─────────────────────────────────────────────
//
// Great-circle distance via haversine, cached per city slug.

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const nearestCache = new Map<string, ClimateStation>();

export function nearestStation(city: CitySeed): ClimateStation | null {
  const cached = nearestCache.get(city.slug);
  if (cached) return cached;
  if (city.latitude == null || city.longitude == null) return null;

  let best: ClimateStation | null = null;
  let bestDist = Infinity;
  for (const s of CLIMATE_STATIONS) {
    const d = haversineKm(city.latitude, city.longitude, s.lat, s.lon);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  if (best) nearestCache.set(city.slug, best);
  return best;
}

/** Returns the matched normals for a (city, month), or null if no station / no data. */
export function normalsForCityMonth(
  city: CitySeed,
  month: MonthIndex,
): NormalMonth | null {
  const station = nearestStation(city);
  if (!station) return null;
  const m = station.months[month - 1];
  return m ?? null;
}

/** Distance (km) from a city to its matched station — useful for the UI to
    flag when the station is far (eg > 80 km) and the inference is rough. */
export function distanceToNearestKm(city: CitySeed): number | null {
  if (city.latitude == null || city.longitude == null) return null;
  const station = nearestStation(city);
  if (!station) return null;
  return Math.round(haversineKm(city.latitude, city.longitude, station.lat, station.lon));
}
