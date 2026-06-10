// F60 — Services publics : section classement (dépend du seed complet).
// Séparé de lib/public-services.ts pour garder le compute mono-ville seed-free.

import { CITIES_SEED } from "@/data/cities-seed";
import { computePublicServices, type PublicServices } from "@/lib/public-services";

export interface PublicServicesRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  services: PublicServices;
}

let SERVICES_RANKING_CACHE: PublicServicesRanking[] | null = null;

export function getPublicServicesRankings(): PublicServicesRanking[] {
  if (SERVICES_RANKING_CACHE) return SERVICES_RANKING_CACHE;
  SERVICES_RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    services: computePublicServices(c),
  }));
  return SERVICES_RANKING_CACHE;
}

/** Villes au meilleur accès = composite le plus bas. */
export function topBestServices(limit = 30, minPopulation = 0): PublicServicesRanking[] {
  return getPublicServicesRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.services.composite - b.services.composite)
    .slice(0, limit);
}

/** Villes les plus désertées = composite le plus élevé. */
export function topServicesDesert(limit = 20, minPopulation = 0): PublicServicesRanking[] {
  return getPublicServicesRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.services.composite - a.services.composite)
    .slice(0, limit);
}
