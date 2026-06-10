// Seed-bound macro-region queries, split out of lib/macro-regions so the base
// module (definitions + findMacroRegionForCity) stays seed-free for client
// components like QolHeroBadge.
import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";
import type { MacroRegionDef } from "@/lib/macro-regions";

export function citiesInMacroRegion(macro: MacroRegionDef): CitySeed[] {
  const deptSet = new Set(macro.departments);
  return CITIES_SEED.filter((c) => c.department && deptSet.has(c.department));
}

export function rankInMacroRegion(macro: MacroRegionDef, limit = 30): CitySeed[] {
  return citiesInMacroRegion(macro)
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, limit);
}
