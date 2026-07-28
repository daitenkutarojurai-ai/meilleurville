// F59 — accessor over the OpenStreetMap-sourced park directory.
//
// The data comes from `scripts/city-parks.mjs`, which crawls Overpass one
// commune at a time (anchored on `ref:INSEE`) and writes the JSON below in
// batches of ~60 cities per run. Rows go in with `source: "openstreetmap"`
// as soon as the crawl covers a slug; until then, the accessor returns null
// and the surface prints an honest "aucun parc nommé référencé — contribuez
// sur OpenStreetMap" message. Never invent a park.
//
// ODbL: OpenStreetMap data is licensed under the Open Database License.
// Any page rendering entries returned here MUST display the attribution
// "© les contributeurs OpenStreetMap" alongside the data. Attribution is a
// licence condition, not decoration — same rule as the Commons credits in
// components/CityPhoto.tsx.
import RAW from "@/data/city-parks.json";
import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";

export type ParkKind = "park" | "garden" | "playground";

export interface Park {
  /** OSM element id, e.g. "w123456" or "r7890" — stable, human-readable. */
  osmId: string;
  name: string;
  kind: ParkKind;
  lat: number;
  lng: number;
  /** Surface computed by shoelace on the "out geom" ring, m². 0 if unknown. */
  areaM2: number;
  playground: boolean;
  wheelchair: boolean | null;
  dog: boolean | null;
  drinkingWater: boolean;
  /** Public toilets inside the perimeter. Optional: rows crawled before the
   *  amenity-node pass (query v1) never carry it. */
  toilets?: boolean;
  /** Raw OSM `access` tag — typically "public"; anything closed is filtered. */
  access: string;
}

export interface CityParks {
  crawledAt: string;
  source: "openstreetmap";
  /** Query shape the row was produced by. Absent on rows crawled before the
   *  stamp existed; `merge` uses it to refuse rows from an older query. */
  queryVersion?: number;
  parks: Park[];
}

const PARKS = RAW as unknown as Record<string, CityParks>;

/** Full park record for a city, or null if OSM has not been crawled for it yet. */
export function cityParks(slug: string): CityParks | null {
  return PARKS[slug] ?? null;
}

/** True the moment the crawl has run for a slug — even if it returned zero
 *  named parks. Distinguishes "no data yet" from "data says no parks". */
export function hasParksData(slug: string): boolean {
  return slug in PARKS;
}

/** Slugs the crawl has covered — the exact set the /parcs pages are built for. */
export const PARKS_CRAWLED_SLUGS = Object.keys(PARKS);
export const PARKS_CITY_COUNT = PARKS_CRAWLED_SLUGS.length;
export const PARKS_TOTAL = Object.values(PARKS).reduce(
  (s, c) => s + (c.parks?.length ?? 0),
  0,
);
/** Cities the crawl has covered that actually have at least one named park.
 *  Distinct from PARKS_CITY_COUNT: a commune with no named park in OSM is
 *  still "crawled", it just returned zero destinations. Surfaces that talk
 *  about "villes couvertes / cities with parks" should use this. */
export const PARKS_CITY_WITH_PARKS_COUNT = Object.values(PARKS).filter(
  (c) => (c.parks?.length ?? 0) > 0,
).length;
export const PARKS_CITY_WITHOUT_PARKS_COUNT =
  PARKS_CITY_COUNT - PARKS_CITY_WITH_PARKS_COUNT;

/** ODbL attribution string — displayed on every surface that shows the data. */
export const OSM_CREDIT = "© les contributeurs OpenStreetMap";
export const OSM_CREDIT_EN = "© OpenStreetMap contributors";
export const OSM_LICENSE_URL = "https://www.openstreetmap.org/copyright";

/** Equirectangular haversine — good to ~0.5 % over 30 km. */
function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Straight-line km from the city centre to the park centroid. Not a walk
 *  time — the surface is welcome to divide by ~5 km/h to display an estimate,
 *  but the raw metric is distance so the user can judge for themselves. */
export function parkDistanceKm(city: CitySeed, park: Park): number | null {
  if (city.latitude == null || city.longitude == null) return null;
  return +distanceKm({ lat: city.latitude, lng: city.longitude }, park).toFixed(2);
}

export interface NearbyCityWithParks {
  city: CitySeed;
  distanceKm: number;
  data: CityParks;
}

/**
 * "Changer d'air" — parks in neighbouring cities within ~30 min by car
 * (≈ 30 km straight-line, generous over a rural drive, tight over a metro).
 * Skips cities that have no crawled data yet, and cities that returned zero
 * named parks. Returns the N closest cities that actually have destinations
 * to visit.
 */
export function nearbyCityParks(
  city: CitySeed,
  opts: { maxDistanceKm?: number; limit?: number } = {},
): NearbyCityWithParks[] {
  if (city.latitude == null || city.longitude == null) return [];
  const maxDist = opts.maxDistanceKm ?? 30;
  const limit = opts.limit ?? 6;
  const here = { lat: city.latitude, lng: city.longitude };
  const out: NearbyCityWithParks[] = [];
  for (const c of CITIES_SEED) {
    if (c.slug === city.slug) continue;
    if (c.latitude == null || c.longitude == null) continue;
    const d = distanceKm(here, { lat: c.latitude, lng: c.longitude });
    if (d > maxDist) continue;
    const data = PARKS[c.slug];
    if (!data || data.parks.length === 0) continue;
    out.push({ city: c, distanceKm: +d.toFixed(1), data });
  }
  out.sort((a, b) => a.distanceKm - b.distanceKm);
  return out.slice(0, limit);
}

/** Sorted parks, biggest first — the useful default order for a listing. */
export function sortedParks(data: CityParks): Park[] {
  return [...data.parks].sort((a, b) => b.areaM2 - a.areaM2);
}

/** Human-readable hectares label. Below 1 ha we drop to m² for honesty. */
export function areaLabel(park: Park): string {
  if (!park.areaM2) return "";
  const ha = park.areaM2 / 10_000;
  if (ha >= 10) return `${Math.round(ha)} ha`;
  if (ha >= 1) return `${ha.toFixed(1)} ha`;
  return `${Math.round(park.areaM2)} m²`;
}

const KIND_LABEL_FR: Record<ParkKind, string> = {
  park: "Parc",
  garden: "Jardin",
  playground: "Aire de jeux",
};
const KIND_LABEL_EN: Record<ParkKind, string> = {
  park: "Park",
  garden: "Garden",
  playground: "Playground",
};

export function kindLabel(kind: ParkKind, locale: "fr" | "en" = "fr"): string {
  return (locale === "en" ? KIND_LABEL_EN : KIND_LABEL_FR)[kind];
}
