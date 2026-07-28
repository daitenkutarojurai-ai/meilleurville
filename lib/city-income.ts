/**
 * Niveau de vie médian et taux de pauvreté par commune (Filosofi 2021, Insee).
 *
 * Généré par `scripts/city-income.mjs` dans `data/city-income.json`.
 *
 * **Convention** : `medianIncome` est le **niveau de vie médian annuel**, soit
 * le revenu disponible du ménage (salaires + prestations − impôts) rapporté au
 * nombre d'unités de consommation. Ce n'est PAS un salaire, et ce n'est pas un
 * revenu par personne : les surfaces doivent le nommer « niveau de vie », sinon
 * elles annoncent un chiffre pour un autre. `povertyRate` suit la convention
 * « nuisance » du projet (10 = pire n'a pas de sens ici, c'est un %, mais un
 * taux élevé est mauvais — la couleur doit donc être inversée par rapport à
 * l'échelle de score globale).
 *
 * 533 des 540 villes sont couvertes. Les absentes sont la Guadeloupe, la Guyane
 * et Mayotte (Filosofi ne les couvre pas), plus Pierrefitte-sur-Seine (fusionnée
 * dans Saint-Denis en 2025). `hasIncomeData` permet de ne rien afficher plutôt
 * que d'inventer.
 */

import RAW from "@/data/city-income.json";

export interface CityIncome {
  /** Niveau de vie médian annuel, en euros (revenu disponible par UC). */
  medianIncome: number;
  /** Taux de pauvreté au seuil de 60 % de la médiane nationale, en %. */
  povertyRate?: number;
}

const INCOME = RAW as Record<string, CityIncome>;

export const INCOME_YEAR = 2021;
export const INCOME_CREDIT = "Insee, Filosofi 2021";
export const INCOME_SOURCE_URL = "https://www.insee.fr/fr/statistiques/7756729";

export function cityIncome(slug: string): CityIncome | null {
  return INCOME[slug] ?? null;
}

export function hasIncomeData(slug: string): boolean {
  return INCOME[slug] !== undefined;
}

/** Équivalent mensuel, arrondi à la dizaine — pour lecteurs qui pensent en mois. */
export function monthlyEquivalent(annual: number): number {
  return Math.round(annual / 12 / 10) * 10;
}

/**
 * Rang national du niveau de vie parmi les villes couvertes. Calculé une fois
 * au chargement du module (533 entrées, tri unique).
 */
const RANKED = Object.entries(INCOME)
  .sort((a, b) => b[1].medianIncome - a[1].medianIncome)
  .map(([slug]) => slug);

export function incomeRank(slug: string): { rank: number; total: number } | null {
  const i = RANKED.indexOf(slug);
  return i < 0 ? null : { rank: i + 1, total: RANKED.length };
}

/** Médiane des villes couvertes — repère de lecture affiché à côté du chiffre. */
export const MEDIAN_OF_CITIES = (() => {
  const vals = Object.values(INCOME)
    .map((r) => r.medianIncome)
    .sort((a, b) => a - b);
  const n = vals.length;
  return n % 2 ? vals[(n - 1) / 2] : Math.round((vals[n / 2 - 1] + vals[n / 2]) / 2);
})();
