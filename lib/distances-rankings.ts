// Seed-dependent neighbour lookup, split out of lib/distances so the base
// module (haversine + curated reference-point distances) stays seed-free and
// doesn't bundle the full seed into client components.
import { CITIES_SEED } from "@/data/cities-seed";
import { haversineKm } from "@/lib/distances";

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
