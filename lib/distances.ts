// F28 — Distances aux pôles d'attraction
//
// For each city, compute great-circle distances to a set of curated reference
// points (cities, coastlines, mountains, airports, ski hubs) using Haversine.
// 100 % derived from CITIES_SEED lat/long — zero new data source.
//
// The coastline points are the nearest official "porte" on each shore, picked
// so the distance reflects "drivable in N hours" rather than a perfect crow-fly
// metric. Mountain points are the centroid of each massif at low altitude
// (entry, not peak) — same logic.

import type { CitySeed } from "@/data/cities-seed";

import { CITIES_SEED } from "@/data/cities-seed";

interface Point {
  lat: number;
  lon: number;
}

interface NamedPoint extends Point {
  label: string;
  /** Short context (region, transport, …) shown next to the distance */
  meta?: string;
}

// Earth radius in kilometres.
const EARTH_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a: Point, b: Point): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

// Big-city anchors (TGV / metropolitan reference points for relocation)
const ANCHOR_CITIES: NamedPoint[] = [
  { label: "Paris", lat: 48.8566, lon: 2.3522, meta: "Capitale" },
  { label: "Lyon", lat: 45.7640, lon: 4.8357, meta: "Métropole Rhône-Alpes" },
  { label: "Marseille", lat: 43.2965, lon: 5.3698, meta: "Métropole Sud" },
  { label: "Bordeaux", lat: 44.8378, lon: -0.5792, meta: "Sud-Ouest" },
  { label: "Nantes", lat: 47.2184, lon: -1.5536, meta: "Ouest" },
  { label: "Strasbourg", lat: 48.5734, lon: 7.7521, meta: "Grand Est" },
];

// Coastline reference points — nearest "porte" on each French shore.
// Picked so haversine ~= drivable distance for inland cities.
const COASTLINE: NamedPoint[] = [
  // Manche (Channel)
  { label: "Manche", lat: 50.7264, lon: 1.6147, meta: "Calais" },
  { label: "Manche", lat: 49.4938, lon: 0.1078, meta: "Le Havre" },
  { label: "Manche", lat: 49.6536, lon: -1.6191, meta: "Cherbourg" },
  // Atlantique
  { label: "Atlantique", lat: 48.3905, lon: -4.4860, meta: "Brest" },
  { label: "Atlantique", lat: 47.6587, lon: -2.7600, meta: "Vannes" },
  { label: "Atlantique", lat: 46.1591, lon: -1.1518, meta: "La Rochelle" },
  { label: "Atlantique", lat: 44.6604, lon: -1.1660, meta: "Arcachon" },
  { label: "Atlantique", lat: 43.4831, lon: -1.5586, meta: "Biarritz" },
  // Méditerranée
  { label: "Méditerranée", lat: 42.6985, lon: 2.8954, meta: "Perpignan" },
  { label: "Méditerranée", lat: 43.6108, lon: 3.8767, meta: "Montpellier" },
  { label: "Méditerranée", lat: 43.2965, lon: 5.3698, meta: "Marseille" },
  { label: "Méditerranée", lat: 43.7102, lon: 7.2620, meta: "Nice" },
];

// Mountain entry points (massif centroid at moderate altitude, drive-up gateway)
const MOUNTAINS: NamedPoint[] = [
  { label: "Alpes du Nord", lat: 45.5662, lon: 6.4914, meta: "Albertville" },
  { label: "Alpes du Sud", lat: 44.5639, lon: 6.0788, meta: "Gap" },
  { label: "Pyrénées", lat: 43.0959, lon: 0.0700, meta: "Lourdes" },
  { label: "Massif Central", lat: 45.5430, lon: 2.9610, meta: "Clermont-Ferrand" },
  { label: "Vosges", lat: 48.0668, lon: 6.9508, meta: "Gérardmer" },
  { label: "Jura", lat: 46.6741, lon: 5.5560, meta: "Lons-le-Saunier" },
  { label: "Corse — Massif", lat: 42.1503, lon: 9.0467, meta: "Corte" },
];

// Major international airports
const AIRPORTS: NamedPoint[] = [
  { label: "Paris-CDG", lat: 49.0097, lon: 2.5479 },
  { label: "Paris-Orly", lat: 48.7233, lon: 2.3794 },
  { label: "Lyon-Saint-Exupéry", lat: 45.7256, lon: 5.0811 },
  { label: "Marseille-Provence", lat: 43.4393, lon: 5.2214 },
  { label: "Nice-Côte d'Azur", lat: 43.6584, lon: 7.2159 },
  { label: "Toulouse-Blagnac", lat: 43.6293, lon: 1.3638 },
  { label: "Bordeaux-Mérignac", lat: 44.8283, lon: -0.7156 },
  { label: "Nantes-Atlantique", lat: 47.1532, lon: -1.6108 },
  { label: "Strasbourg-Entzheim", lat: 48.5383, lon: 7.6282 },
  { label: "Lille-Lesquin", lat: 50.5614, lon: 3.0894 },
];

// Major ski hubs (winter sports gateway towns, not peak summit)
const SKI_HUBS: NamedPoint[] = [
  { label: "Chamonix", lat: 45.9237, lon: 6.8694, meta: "Mont-Blanc" },
  { label: "Val d'Isère", lat: 45.4488, lon: 6.9799, meta: "Tarentaise" },
  { label: "Les Arcs / La Plagne", lat: 45.5660, lon: 6.7920, meta: "Tarentaise" },
  { label: "Méribel / Courchevel", lat: 45.3950, lon: 6.5660, meta: "3 Vallées" },
  { label: "Chamrousse", lat: 45.1132, lon: 5.8775, meta: "Belledonne (38)" },
  { label: "Serre Chevalier", lat: 44.9450, lon: 6.5520, meta: "Hautes-Alpes" },
  { label: "Saint-Lary", lat: 42.8175, lon: 0.3215, meta: "Pyrénées" },
  { label: "Font-Romeu", lat: 42.5050, lon: 2.0440, meta: "Pyrénées Catalanes" },
  { label: "Le Mont-Dore", lat: 45.5743, lon: 2.8125, meta: "Massif Central" },
  { label: "La Bresse", lat: 48.0001, lon: 6.8810, meta: "Vosges" },
];

export interface NearestRef {
  label: string;
  meta?: string;
  distanceKm: number;
}

function nearest(city: CitySeed, points: NamedPoint[]): NearestRef | null {
  if (city.latitude == null || city.longitude == null) return null;
  const cityPt = { lat: city.latitude, lon: city.longitude };
  let best: NearestRef | null = null;
  for (const p of points) {
    const d = haversineKm(cityPt, p);
    if (!best || d < best.distanceKm) {
      best = { label: p.label, meta: p.meta, distanceKm: d };
    }
  }
  return best;
}

export interface CityDistances {
  paris: number | null;
  nearestMetro: NearestRef | null; // closest of ANCHOR_CITIES (excl. self)
  sea: NearestRef | null;
  mountain: NearestRef | null;
  airport: NearestRef | null;
  ski: NearestRef | null;
}

export function computeCityDistances(city: CitySeed): CityDistances {
  if (city.latitude == null || city.longitude == null) {
    return {
      paris: null,
      nearestMetro: null,
      sea: null,
      mountain: null,
      airport: null,
      ski: null,
    };
  }
  const cityPt = { lat: city.latitude, lon: city.longitude };
  const paris = haversineKm(cityPt, ANCHOR_CITIES[0]);

  // Exclude self for nearestMetro (when the city IS Paris/Lyon/etc.)
  const metroCandidates = ANCHOR_CITIES.filter(
    (p) => Math.abs(p.lat - city.latitude!) > 0.05 || Math.abs(p.lon - city.longitude!) > 0.05,
  );

  return {
    paris: Math.round(paris),
    nearestMetro: nearest(city, metroCandidates),
    sea: nearest(city, COASTLINE),
    mountain: nearest(city, MOUNTAINS),
    airport: nearest(city, AIRPORTS),
    ski: nearest(city, SKI_HUBS),
  };
}

// Drive-time heuristic from crow-fly distance. Roughly 95 km/h on TGV-served
// corridors, 75 km/h national average for car. Used only to display a hint —
// never as authoritative.
export function approxDriveTimeMin(km: number): number {
  return Math.round((km / 75) * 60);
}

// One-liner formatter to surface the "closest" verdict on the city page.
export function formatDistance(km: number): string {
  if (km < 10) return `${Math.round(km)} km`;
  if (km < 100) return `${Math.round(km)} km`;
  return `${Math.round(km / 10) * 10} km`;
}

export interface NearbyCity {
  slug: string;
  name: string;
  region: string | null;
  scoreGlobal: number;
  distanceKm: number;
  sameRegion: boolean;
}

/**
 * F30 — geographic neighbours.
 * Returns the n closest cities (haversine) excluding the city itself.
 * Skips cities outside the metropolitan bbox so DROM-DROM neighbour calls
 * don't pull in metropolitan cities (and vice-versa).
 */
export function nearestCities(citySlug: string, n = 6): NearbyCity[] {
  const me = CITIES_SEED.find((c) => c.slug === citySlug);
  if (!me || me.latitude == null || me.longitude == null) return [];
  const inMetro = me.longitude >= -6 && me.longitude <= 10 && me.latitude >= 40 && me.latitude <= 52;
  const cityPt = { lat: me.latitude, lon: me.longitude };

  return CITIES_SEED
    .filter((c) => c.slug !== me.slug && c.latitude != null && c.longitude != null)
    .filter((c) => {
      const cInMetro = c.longitude! >= -6 && c.longitude! <= 10 && c.latitude! >= 40 && c.latitude! <= 52;
      return cInMetro === inMetro; // same bbox cohort (metropolitan or DROM)
    })
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      region: c.region,
      scoreGlobal: c.scores.global,
      distanceKm: haversineKm(cityPt, { lat: c.latitude!, lon: c.longitude! }),
      sameRegion: c.region === me.region,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, n);
}
