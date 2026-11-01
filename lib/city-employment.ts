/**
 * Marché du travail mesuré par commune — chômage, évolution de l'emploi,
 * salaires (Insee : recensement 2023, base tous salariés 2024).
 *
 * Généré par `scripts/city-employment.mjs` (`npm run employment`) dans
 * `data/city-employment.json`.
 *
 * **Convention** :
 * - `unemployment` : taux de chômage des 15-64 ans **au sens du recensement**
 *   (déclaratif), en %, pour les habitants de la commune. Il tourne plus haut
 *   que le taux du BIT publié chaque trimestre par zone d'emploi (France :
 *   11,4 % ici contre ~7,5 % au BIT) : ne jamais comparer les deux.
 * - `jobs` / `jobGrowth` : emplois **situés dans la commune** (lieu de travail)
 *   en 2023, et leur évolution depuis 2017, en %.
 * - `salary` : salaire net mensuel **moyen** en équivalent temps plein des
 *   emplois du **secteur privé situés dans la commune** (lieu de travail, pas
 *   de résidence). C'est une moyenne, tirée vers le haut par les hauts
 *   salaires : pas une médiane.
 *
 * 591 des 593 villes sont couvertes (salaire : 590, Gordes est sous le secret
 * statistique). Absentes : Mamoudzou (hors recensement) et Pierrefitte-sur-Seine
 * (fusionnée dans Saint-Denis en 2025). `lib/employment-market.ts` garde alors
 * ses paliers estimés.
 *
 * ⚠️ Ce module est atteint par des composants client (via `lib/city-synthesis`
 * et `lib/quality-of-life-index`) : le JSON reste compact (≈ 55 Ko).
 */

import RAW from "@/data/city-employment.json";

export interface CityEmploymentMeasure {
  /** Taux de chômage des 15-64 ans au sens du recensement, en %. */
  unemployment?: number;
  /** Actifs de 15-64 ans résidant dans la commune. */
  active?: number;
  /** Emplois situés dans la commune (recensement). */
  jobs?: number;
  /** Évolution des emplois situés dans la commune depuis `JOBS_FROM`, en %. */
  jobGrowth?: number;
  /** Salaire net mensuel moyen EQTP, emplois privés situés dans la commune, en €. */
  salary?: number;
}

const DATA = RAW as {
  meta: {
    rpYear: number;
    unemploymentNational: number;
    jobsFrom: number;
    jobGrowthNational: number;
    salaryYear: number;
    salaryNational: number;
  };
  cities: Record<string, CityEmploymentMeasure>;
};

export const RP_YEAR = DATA.meta.rpYear;
export const JOBS_FROM = DATA.meta.jobsFrom;
export const SALARY_YEAR = DATA.meta.salaryYear;
export const UNEMPLOYMENT_NATIONAL = DATA.meta.unemploymentNational;
export const JOB_GROWTH_NATIONAL = DATA.meta.jobGrowthNational;
export const SALARY_NATIONAL = DATA.meta.salaryNational;

export const EMPLOYMENT_CREDIT = `Insee, recensement ${DATA.meta.rpYear} · base tous salariés ${DATA.meta.salaryYear}`;
export const RP_SOURCE_URL = "https://www.insee.fr/fr/metadonnees/source/serie/s1321";
export const BTS_SOURCE_URL = "https://www.insee.fr/fr/metadonnees/source/serie/s1998";

export function cityEmploymentMeasure(slug: string): CityEmploymentMeasure | null {
  return DATA.cities[slug] ?? null;
}
