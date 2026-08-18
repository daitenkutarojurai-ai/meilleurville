/**
 * Prix de vente au m², appartement et maison séparément (DVF, DGFiP/Etalab).
 *
 * Généré par `scripts/city-property-prices.mjs` dans
 * `data/city-property-prices.json`.
 *
 * **Convention** : ce sont des **médianes de transactions réellement
 * enregistrées** sur la fenêtre `PRICE_YEARS`, pas une estimation. Elles ne
 * remplacent pas `HOUSING[slug].avgBuyPriceM2` (`data/housing.ts`), qui est un
 * repère éditorial unique tous biens confondus : les deux nombres coexistent et
 * peuvent diverger sans que l'un soit faux. Une surface qui affiche les deux
 * doit dire lequel est mesuré.
 *
 * Deux précisions à reprendre partout où le chiffre maison est affiché :
 * `valeur_fonciere` inclut le **terrain** alors que la surface est la seule
 * surface bâtie, et les dépendances (garage, cave) sont comprises dans le prix
 * sans l'être dans la surface. Le €/m² maison n'est donc pas comparable au
 * €/m² appartement à l'euro près — c'est la convention des notaires, elle a
 * juste besoin d'être dite.
 *
 * Trois cas de « pas de chiffre », qui ne veulent pas dire la même chose :
 *  - `coverage: "livre-foncier"` — Bas-Rhin, Haut-Rhin et Moselle relèvent du
 *    livre foncier et ne sont **pas** publiés dans DVF. Rien ne viendra.
 *  - `coverage: "absent"` — Mayotte, et toute commune sans fichier DVF.
 *  - `pending: "sample"` — la commune est couverte mais compte moins de
 *    `MIN_SALES` ventes du type sur la fenêtre : l'effectif est connu, la
 *    médiane serait un accident d'échantillon. On publie l'effectif, pas le prix.
 */

import RAW from "@/data/city-property-prices.json";

export interface PropertyPriceStat {
  /** Ventes retenues après filtrage (mono-lot, bornes de vraisemblance). */
  sales: number;
  medianM2?: number;
  p25M2?: number;
  p75M2?: number;
  /** Présent seulement quand l'effectif est sous le seuil de publication. */
  pending?: "sample";
}

export interface CityPropertyPrices {
  coverage: "dvf" | "livre-foncier" | "absent";
  apartment?: PropertyPriceStat;
  house?: PropertyPriceStat;
  years: number[];
  queryVersion: number;
}

const PRICES = RAW as Record<string, CityPropertyPrices>;

export const PRICE_YEARS = [2024, 2025];
export const PRICE_MIN_SALES = 20;
export const DVF_CREDIT = "DGFiP, Demandes de valeurs foncières (DVF géolocalisé, Etalab)";
export const DVF_SOURCE_URL = "https://files.data.gouv.fr/geo-dvf/latest/csv/";
export const DVF_LICENCE = "Licence Ouverte / Open Licence 2.0";

export function cityPropertyPrices(slug: string): CityPropertyPrices | null {
  return PRICES[slug] ?? null;
}

/** Vrai seulement si au moins un des deux types a un prix publiable. */
export function hasPropertyPrices(slug: string): boolean {
  const r = PRICES[slug];
  return Boolean(r && (r.apartment?.medianM2 || r.house?.medianM2));
}

/** Écart maison − appartement en %, quand les deux sont publiés. */
export function houseApartmentGap(slug: string): number | null {
  const r = PRICES[slug];
  if (!r?.apartment?.medianM2 || !r.house?.medianM2) return null;
  return Math.round(((r.house.medianM2 - r.apartment.medianM2) / r.apartment.medianM2) * 100);
}

function ranked(kind: "apartment" | "house"): string[] {
  return Object.entries(PRICES)
    .filter(([, r]) => r[kind]?.medianM2)
    .sort((a, b) => (b[1][kind]!.medianM2 ?? 0) - (a[1][kind]!.medianM2 ?? 0))
    .map(([slug]) => slug);
}

const RANKED_APARTMENT = ranked("apartment");
const RANKED_HOUSE = ranked("house");

/** Rang national du prix (1 = le plus cher) parmi les villes publiées. */
export function priceRank(
  slug: string,
  kind: "apartment" | "house",
): { rank: number; total: number } | null {
  const list = kind === "apartment" ? RANKED_APARTMENT : RANKED_HOUSE;
  const i = list.indexOf(slug);
  return i < 0 ? null : { rank: i + 1, total: list.length };
}

function medianOf(kind: "apartment" | "house"): number {
  const vals = Object.values(PRICES)
    .map((r) => r[kind]?.medianM2)
    .filter((v): v is number => typeof v === "number")
    .sort((a, b) => a - b);
  const n = vals.length;
  if (!n) return 0;
  return n % 2 ? vals[(n - 1) / 2] : Math.round((vals[n / 2 - 1] + vals[n / 2]) / 2);
}

/** Repères de lecture affichés à côté du chiffre d'une ville. */
export const MEDIAN_APARTMENT_M2 = medianOf("apartment");
export const MEDIAN_HOUSE_M2 = medianOf("house");
