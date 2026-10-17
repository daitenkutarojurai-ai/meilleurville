// Points de la carte politique (`components/PoliticalMap.tsx`), calculés côté
// serveur une fois pour toutes les pages qui la montrent. Serveur uniquement :
// lit le JSON des résultats 2022 et le seed.

import { CITIES_SEED } from "@/data/cities-seed";
import { allPoliticalLeans } from "@/lib/political-lean";
import { inMetropolitanBox, project } from "@/lib/france-map-geo";
import type { PoliticalDot } from "@/components/PoliticalMap";

function dotRadius(population: number): number {
  if (population > 500000) return 6.5;
  if (population > 200000) return 5;
  if (population > 80000) return 4;
  if (population > 30000) return 3.2;
  return 2.6;
}

export function politicalMapDots(): PoliticalDot[] {
  const bySlug = new Map(CITIES_SEED.map((c) => [c.slug, c]));
  return allPoliticalLeans().flatMap((c) => {
    const city = bySlug.get(c.slug);
    if (!city || !inMetropolitanBox(city.longitude, city.latitude)) return [];
    const [x, y] = project(city.longitude, city.latitude);
    return [
      {
        slug: c.slug,
        name: city.name,
        lean: c.lean,
        topPct: c.topPct,
        blocs: c.blocs,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        r: dotRadius(city.population),
        topCand: c.topCand,
        topCandPct: c.topCandPct,
      },
    ];
  });
}
