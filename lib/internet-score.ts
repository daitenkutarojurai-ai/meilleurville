// Convention: 10 = bon (fibre disponible, débit élevé). Derived from region/dept
// fibre coverage tiers + remoteWork score proxy. No live API.
//
// Method: weighted blend of city.scores.remoteWork (60%) + a regional fibre
// coverage bonus (ARCEP couverture fibre 2024 par région). Major-city slug
// detection adds a small urban-density bonus. No real ARCEP feed is consumed
// at runtime — the bonus is a static lookup table calibrated on published
// ARCEP coverage percentages.
//
// SourceKind: estimation-regionale. When ARCEP Open Data is wired into the
// build, only this module changes.

import type { CitySeed } from "@/data/cities-seed";

// Regional fibre coverage bonus (calibrated on ARCEP T4 2024 regional rates).
// Positive values = above-average coverage, negative = below-average.
const REGION_FIBRE_BONUS: Record<string, number> = {
  "Île-de-France": 1.5,
  "Provence-Alpes-Côte d'Azur": 1.5,
  Occitanie: 1.2,
  "Auvergne-Rhône-Alpes": 1.0,
  "Nouvelle-Aquitaine": 1.0,
  Bretagne: 0.8,
  "Pays de la Loire": 0.8,
  "Grand Est": 0.5,
  "Hauts-de-France": 0.5,
  Normandie: 0.3,
  "Centre-Val de Loire": 0.2,
  "Bourgogne-Franche-Comté": 0.0,
  Corse: -0.5,
  // DROM: infrastructure varies widely
  "La Réunion": 0.2,
  Guadeloupe: -0.3,
  Martinique: -0.2,
  "Guyane": -1.0,
  Mayotte: -1.5,
};

// Slugs of major cities that systematically benefit from dense urban fibre
// deployment (top 30 by population in the seed).
const MAJOR_CITY_SLUGS = new Set([
  "paris",
  "marseille",
  "lyon",
  "toulouse",
  "nice",
  "nantes",
  "montpellier",
  "strasbourg",
  "bordeaux",
  "lille",
  "rennes",
  "reims",
  "le-havre",
  "saint-etienne",
  "toulon",
  "grenoble",
  "dijon",
  "angers",
  "nimes",
  "villeurbanne",
  "clermont-ferrand",
  "le-mans",
  "aix-en-provence",
  "brest",
  "tours",
  "amiens",
  "limoges",
  "perpignan",
  "metz",
  "nancy",
]);

// Departments known for persistently poor fibre coverage (mostly rural
// departments with dispersed habitat — ARCEP zones "peu denses non rentables").
const LOW_COVERAGE_DEPTS = new Set([
  "Creuse",
  "Corrèze",
  "Ariège",
  "Haute-Loire",
  "Cantal",
  "Gers",
  "Hautes-Alpes",
  "Alpes-de-Haute-Provence",
  "Haute-Marne",
  "Meuse",
  "Vosges",
  "Lozère",
  "Aveyron",
]);

export function internetScore(city: CitySeed): number {
  const remoteWork = city.scores.remoteWork;
  const regionBonus = REGION_FIBRE_BONUS[city.region] ?? 0;
  const majorCityBonus = MAJOR_CITY_SLUGS.has(city.slug) ? 0.3 : 0;
  const lowCoveragePenalty = LOW_COVERAGE_DEPTS.has(city.department) ? -1.0 : 0;

  const raw =
    remoteWork * 0.6 + regionBonus + majorCityBonus + lowCoveragePenalty + 3.5;

  return Math.max(2.0, Math.min(9.5, Math.round(raw * 10) / 10));
}

export type InternetTier = "tres-bonne" | "bonne" | "correcte" | "limitee";

function internetTier(score: number): InternetTier {
  if (score >= 8) return "tres-bonne";
  if (score >= 6) return "bonne";
  if (score >= 4) return "correcte";
  return "limitee";
}

export const INTERNET_LABEL: Record<
  InternetTier,
  { label: string; color: string }
> = {
  "tres-bonne": { label: "Très bonne", color: "text-purple-500" },
  bonne: { label: "Bonne", color: "text-green-500" },
  correcte: { label: "Correcte", color: "text-amber-400" },
  limitee: { label: "Limitée", color: "text-red-500" },
};

export function internetLabel(score: number): {
  tier: InternetTier;
  label: string;
  color: string;
} {
  const tier = internetTier(score);
  return { tier, ...INTERNET_LABEL[tier] };
}
