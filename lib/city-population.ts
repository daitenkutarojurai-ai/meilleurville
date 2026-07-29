// Population réelle et structure par âge, mesurées commune par commune.
//
// Source : recensement Insee, base « Évolution et structure de la population
// en 2022 » (millésimes 2011 / 2016 / 2022 dans le même fichier).
// Pipeline : `node scripts/city-population.mjs` → data/city-population.json.
//
// **Convention** : ce module ne porte que des mesures, jamais des scores. Un
// pourcentage de seniors n'est ni « bon » ni « mauvais » en soi — c'est
// `lib/demography.ts` qui en tire un score de tension (10 = pire), et lui seul.
//
// 538 des 540 villes du seed sont couvertes. Mamoudzou est hors du fichier
// « France hors Mayotte », et Pierrefitte-sur-Seine a fusionné dans
// Saint-Denis en 2025. Pour ces deux-là, les accesseurs renvoient `null` et
// les surfaces doivent le dire plutôt que d'afficher un chiffre inventé.
import RAW from "@/data/city-population.json";

export const INSEE_POP_CREDIT = "Insee, recensement de la population 2022";
export const INSEE_POP_SOURCE_URL = "https://www.insee.fr/fr/statistiques/8581696";
export const INSEE_POP_YEAR = 2022;
export const INSEE_POP_BASE_YEAR = 2016;

/** Effectifs par tranche d'âge Insee. Non entiers : le recensement pondère. */
export interface AgeBrackets {
  a0014: number;
  a1529: number;
  a3044: number;
  a4559: number;
  a6074: number;
  a7589: number;
  a90p: number;
}

export interface CityPopulation {
  pop2022: number;
  pop2016: number | null;
  pop2011: number | null;
  ages: AgeBrackets;
}

const DATA = RAW as Record<string, CityPopulation>;

export function cityPopulation(slug: string): CityPopulation | null {
  return DATA[slug] ?? null;
}

export function hasPopulationData(slug: string): boolean {
  return slug in DATA;
}

export interface PopulationTrend {
  /** Variation totale depuis 2016, en %. */
  changePct: number;
  /** Variation annuelle moyenne depuis 2016, en %. */
  annualPct: number;
  gained: number;
  direction: "hausse" | "baisse" | "stable";
}

/** Évolution 2016 → 2022 (6 ans). `null` si le millésime 2016 manque. */
export function populationTrend(slug: string): PopulationTrend | null {
  const rec = DATA[slug];
  if (!rec?.pop2016) return null;
  const years = INSEE_POP_YEAR - INSEE_POP_BASE_YEAR;
  const changePct = ((rec.pop2022 - rec.pop2016) / rec.pop2016) * 100;
  const annualPct = (Math.pow(rec.pop2022 / rec.pop2016, 1 / years) - 1) * 100;
  return {
    changePct: Number(changePct.toFixed(1)),
    annualPct: Number(annualPct.toFixed(2)),
    gained: rec.pop2022 - rec.pop2016,
    // Sous 0,15 %/an le recensement ne distingue pas un mouvement d'un aléa
    // d'échantillon : annoncer une tendance serait surinterpréter.
    direction: annualPct > 0.15 ? "hausse" : annualPct < -0.15 ? "baisse" : "stable",
  };
}

/** Part des 60 ans et plus, en %. Médiane nationale ≈ 28 %. */
export function seniorShare(slug: string): number | null {
  const rec = DATA[slug];
  if (!rec) return null;
  const { a6074, a7589, a90p } = rec.ages;
  return Number((((a6074 + a7589 + a90p) / rec.pop2022) * 100).toFixed(1));
}

/** Part des moins de 30 ans, en %. Médiane nationale ≈ 34 %. */
export function youthShare(slug: string): number | null {
  const rec = DATA[slug];
  if (!rec) return null;
  return Number((((rec.ages.a0014 + rec.ages.a1529) / rec.pop2022) * 100).toFixed(1));
}

export const AGE_LABELS: Record<keyof AgeBrackets, string> = {
  a0014: "0-14 ans",
  a1529: "15-29 ans",
  a3044: "30-44 ans",
  a4559: "45-59 ans",
  a6074: "60-74 ans",
  a7589: "75-89 ans",
  a90p: "90 ans et plus",
};

export const AGE_LABELS_EN: Record<keyof AgeBrackets, string> = {
  a0014: "0-14",
  a1529: "15-29",
  a3044: "30-44",
  a4559: "45-59",
  a6074: "60-74",
  a7589: "75-89",
  a90p: "90+",
};

/** Tranches en part de la population, dans l'ordre de la pyramide. */
export function ageDistribution(
  slug: string,
): { key: keyof AgeBrackets; count: number; share: number }[] | null {
  const rec = DATA[slug];
  if (!rec) return null;
  return (Object.keys(AGE_LABELS) as (keyof AgeBrackets)[]).map((key) => ({
    key,
    count: Math.round(rec.ages[key]),
    share: Number(((rec.ages[key] / rec.pop2022) * 100).toFixed(1)),
  }));
}

export const POPULATION_CITY_COUNT = Object.keys(DATA).length;
