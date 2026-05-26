// Estimates travel time from any major French city to all others.
// Model (takes the minimum of three options):
//   1. Via Paris (rail): parisMin(A) + parisMin(B) + 30 min connection
//   2. Direct rail estimate: haversine / 220 km/h * 60 + 20 min terminals
//   3. Road estimate: haversine * 1.25 / 85 km/h * 60
// Labeled clearly as estimates. Accuracy ±30 min for most pairs.

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";
import { haversineKm } from "@/lib/distances";
import { TGV_STATIONS, parisCommute } from "@/lib/paris-commute";

// Major cities for which we generate /depuis/[slug] pages.
// Subset of TGV hubs that are meaningful weekend-trip starting points.
export const ORIGIN_SLUGS = [
  "lyon",
  "marseille",
  "bordeaux",
  "toulouse",
  "nice",
  "nantes",
  "strasbourg",
  "montpellier",
  "lille",
  "grenoble",
  "rennes",
  "reims",
  "dijon",
  "metz",
  "nancy",
  "rouen",
  "caen",
  "angers",
  "tours",
  "le-havre",
  "brest",
  "annecy",
  "pau",
  "bayonne",
  "clermont-ferrand",
  "besancon",
] as const;

export type OriginSlug = (typeof ORIGIN_SLUGS)[number];

export interface CityCommute {
  minutes: number;
  display: string;
  source: "via-paris" | "direct-rail" | "road" | "unavailable";
}

function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h === 0) return `${min}min`;
  if (min === 0) return `${h}h`;
  return `${h}h${min.toString().padStart(2, "0")}`;
}

function nearestStationParisMin(city: CitySeed): number {
  const direct = TGV_STATIONS.find((s) => s.slug === city.slug);
  if (direct) return direct.parisMin;
  const pc = parisCommute(city);
  return pc.source === "unavailable" ? 9999 : pc.minutes;
}

export function cityCommute(origin: CitySeed, dest: CitySeed): CityCommute {
  if (origin.slug === dest.slug) {
    return { minutes: 0, display: "0min", source: "road" };
  }

  // Metropolitan France only
  const inMetro = (c: CitySeed) =>
    c.longitude >= -6 && c.longitude <= 10 && c.latitude >= 40 && c.latitude <= 52;
  if (!inMetro(origin) || !inMetro(dest)) {
    return { minutes: 9999, display: "—", source: "unavailable" };
  }

  const km = haversineKm(
    { lat: origin.latitude, lon: origin.longitude },
    { lat: dest.latitude, lon: dest.longitude },
  );

  // Via Paris rail
  const originParis = nearestStationParisMin(origin);
  const destParis = nearestStationParisMin(dest);
  const viaParis = originParis + destParis + 30;

  // Direct rail estimate
  const directRail = Math.round((km / 220) * 60 + 20);

  // Road estimate (road factor 1.25, avg 85 km/h including urban approach)
  const road = Math.round((km * 1.25 / 85) * 60);

  const options = [
    { minutes: viaParis, source: "via-paris" as const },
    { minutes: directRail, source: "direct-rail" as const },
    { minutes: road, source: "road" as const },
  ];

  const best = options.reduce((a, b) => (a.minutes <= b.minutes ? a : b));
  return { minutes: best.minutes, display: formatMinutes(best.minutes), source: best.source };
}

export function cityCommuteAll(
  originSlug: string,
): Array<{ city: CitySeed; commute: CityCommute }> {
  const origin = CITIES_SEED.find((c) => c.slug === originSlug);
  if (!origin) return [];
  return CITIES_SEED.filter((c) => c.slug !== originSlug)
    .map((city) => ({ city, commute: cityCommute(origin, city) }))
    .filter((r) => r.commute.source !== "unavailable" && r.commute.minutes < 600)
    .sort((a, b) => a.commute.minutes - b.commute.minutes);
}

export function getOriginCity(slug: string): CitySeed | undefined {
  return CITIES_SEED.find((c) => c.slug === slug);
}
