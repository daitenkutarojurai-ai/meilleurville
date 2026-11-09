// Seed-dependent ranking section, split out of lib/environment-index so the
// base module (computeEnvironmentIndex + constants) stays seed-free — it's
// reached by QolHeroBadge via lib/quality-of-life-index.
//
// **Convention** : `topHealthiest` trie sur `healthScore` (10 = sain, descendant),
// `topMostStressed` sur `stressComposite` (10 = pire, descendant). Deux champs,
// deux noms : aucune surface n'a à inverser l'un pour obtenir l'autre.
import { CITIES_SEED } from "@/data/cities-seed";
import { computeEnvironmentIndex, type EnvironmentIndex } from "@/lib/environment-index";

export interface EnvRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  index: EnvironmentIndex;
}

// Cache module-level pour éviter de recomputer à chaque appel.
let RANKING_CACHE: EnvRanking[] | null = null;

export function getEnvironmentRankings(): EnvRanking[] {
  if (RANKING_CACHE) return RANKING_CACHE;
  RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    index: computeEnvironmentIndex(c),
  }));
  return RANKING_CACHE;
}

export function topHealthiest(limit = 30, minPopulation = 0): EnvRanking[] {
  return getEnvironmentRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.index.healthScore - a.index.healthScore)
    .slice(0, limit);
}

export function topMostStressed(limit = 20, minPopulation = 0): EnvRanking[] {
  return getEnvironmentRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.index.stressComposite - a.index.stressComposite)
    .slice(0, limit);
}
