// F63 phase 2 — national ranking on MEASURED air quality (lib/city-air).
//
// Two rules on top of the pipeline's (nearest background station ≤ 25 km):
//   1. Ranked only when that station is ≤ RANK_MAX_KM away and urban or
//      suburban. A rural station 8-25 km out ("Zone Rurale SE" for
//      Fontainebleau) measures the countryside, not the town, and would push
//      it up a clean-air list for the wrong reason. The city page still shows
//      the value with its distance; it just does not enter the ranking.
//   2. Cities that share a station share its value: they form one tier, sorted
//      by name, never split (convention of lib/owner-rankings.ts). A ranking
//      stops before a tier that would overflow its length and says what came
//      next.

import { CITIES_SEED } from "@/data/cities-seed";
import { AIR_POLLUTANTS, cityAirMeasures, type AirMeasure, type AirPollutant } from "@/lib/city-air";

export const RANK_MAX_KM = 10;
const RANKED_AREAS = new Set(["urban", "suburban"]);

export interface AirRankEntry {
  slug: string;
  name: string;
  region: string;
  population: number;
  measure: AirMeasure;
}

export interface AirTier {
  rank: number;
  value: number;
  entries: AirRankEntry[];
}

export interface AirRanking {
  tiers: AirTier[];
  published: number;
  pool: number;
  nextTier: { value: number; count: number } | null;
}

export function airRankEntries(p: AirPollutant): AirRankEntry[] {
  const out: AirRankEntry[] = [];
  for (const c of CITIES_SEED) {
    const m = cityAirMeasures(c.slug)?.[p];
    if (!m || m.distanceKm > RANK_MAX_KM || !m.area || !RANKED_AREAS.has(m.area)) continue;
    out.push({ slug: c.slug, name: c.name, region: c.region, population: c.population ?? 0, measure: m });
  }
  return out;
}

/** `cleanest`: lowest values first. Values are compared at one decimal, the
 *  precision at which they are published. */
export function rankAir(p: AirPollutant, limit: number, order: "cleanest" | "worst"): AirRanking {
  const entries = airRankEntries(p);
  const byValue = new Map<number, AirRankEntry[]>();
  for (const e of entries) {
    const v = Math.round(e.measure.value * 10) / 10;
    const bucket = byValue.get(v);
    if (bucket) bucket.push(e);
    else byValue.set(v, [e]);
  }
  const ordered = [...byValue.entries()].sort((a, b) => (order === "cleanest" ? a[0] - b[0] : b[0] - a[0]));
  const tiers: AirTier[] = [];
  let published = 0;
  let nextTier: AirRanking["nextTier"] = null;
  for (const [value, tierEntries] of ordered) {
    if (tiers.length > 0 && published + tierEntries.length > limit) {
      nextTier = { value, count: tierEntries.length };
      break;
    }
    tierEntries.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    tiers.push({ rank: published + 1, value, entries: tierEntries });
    published += tierEntries.length;
  }
  return { tiers, published, pool: entries.length, nextTier };
}

/** First `count` published cities for JSON-LD; `ordered` is false as soon as
 *  one of them shares its rank, and the markup must then say so. */
export function airRankingHead(r: AirRanking, count = 10): { entries: AirRankEntry[]; ordered: boolean } {
  const entries: AirRankEntry[] = [];
  let ordered = true;
  for (const t of r.tiers) {
    if (entries.length >= count) break;
    if (t.entries.length > 1) ordered = false;
    entries.push(...t.entries.slice(0, count - entries.length));
  }
  return { entries, ordered };
}

export interface AirNationalStats {
  pool: number;
  stations: number;
  median: number;
  overWho: number | null;
  overEu2030: number | null;
  overEu: number;
}

const THRESHOLDS: Record<AirPollutant, { who: number | null; eu2030: number | null; eu: number }> = {
  no2: { who: 10, eu2030: 20, eu: 40 },
  pm25: { who: 5, eu2030: 10, eu: 25 },
  pm10: { who: 15, eu2030: 20, eu: 40 },
  o3: { who: null, eu2030: null, eu: 25 },
};

export function airNationalStats(p: AirPollutant): AirNationalStats {
  const e = airRankEntries(p);
  const v = e.map((x) => x.measure.value).sort((a, b) => a - b);
  const mid = v.length >> 1;
  const median = !v.length ? 0 : v.length % 2 ? v[mid] : Math.round(((v[mid - 1] + v[mid]) / 2) * 10) / 10;
  const t = THRESHOLDS[p];
  return {
    pool: e.length,
    stations: new Set(e.map((x) => x.measure.stationCode)).size,
    median,
    overWho: t.who === null ? null : e.filter((x) => x.measure.value > t.who!).length,
    overEu2030: t.eu2030 === null ? null : e.filter((x) => x.measure.value > t.eu2030!).length,
    overEu: e.filter((x) => x.measure.value > t.eu).length,
  };
}

/** Pollutants with enough ranked cities to publish a list (the pipeline may
 *  still be completing some of them). */
export const RANKED_AIR_POLLUTANTS: AirPollutant[] = AIR_POLLUTANTS.filter((p) => airRankEntries(p).length >= 40);
