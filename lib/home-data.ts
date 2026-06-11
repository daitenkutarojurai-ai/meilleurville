import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import type { MapCity } from "@/lib/cities-light";

// One array for all three homepage city-consumers (hero search, heat map, cost
// calculator). Passing the SAME reference to each lets the RSC flight stream
// serialize the 540 cities ONCE and back-reference them — instead of three
// independent projections each serialized in full (was ~3× the city list in
// the landing-page HTML).
export type HomeCity = MapCity & { avgRentT2: number | null };

export const HOMEPAGE_CITIES: HomeCity[] = CITIES_SEED.map((c) => ({
  slug: c.slug,
  name: c.name,
  region: c.region,
  latitude: c.latitude,
  longitude: c.longitude,
  population: c.population,
  scores: c.scores,
  avgRentT2: HOUSING[c.slug]?.avgRentT2 ?? null,
}));
