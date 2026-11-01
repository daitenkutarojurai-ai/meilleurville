/**
 * Accès aux soins mesuré par commune — APL aux médecins généralistes (DREES)
 * et équipements recensés par l'Insee (BPE).
 *
 * Généré par `scripts/city-healthcare.mjs` (`npm run healthcare`) dans
 * `data/city-healthcare.json`.
 *
 * **Convention** :
 * - `apl` est l'**accessibilité potentielle localisée** de la DREES, en
 *   consultations ou visites de médecine générale accessibles **par an et par
 *   habitant** (population standardisée par âge). Elle compte les médecins des
 *   communes voisines, pondérés par la distance : ce n'est PAS une densité de
 *   médecins installés dans la commune. Plus elle est haute, mieux c'est. Le
 *   seuil réglementaire de zone sous-dense est 2,5 ; sous 1,5 l'accès est très
 *   faible.
 * - `gp`, `pharmacies`, `emergency` sont des **nombres d'équipements** recensés
 *   dans la commune elle-même (BPE) : médecins généralistes libéraux,
 *   pharmacies, services d'urgences. Zéro veut dire « aucun dans la commune »,
 *   pas « aucun à proximité ».
 * - `erKm` / `erNearest` : quand la commune n'a pas de service d'urgences,
 *   distance à vol d'oiseau, centre à centre (geo.api.gouv.fr), jusqu'à la
 *   commune la plus proche qui en compte un, et son nom. Ce n'est pas un temps
 *   de trajet.
 * - `pop` : population municipale 2022 (Insee), dénominateur des densités.
 *
 * 591 des 593 villes sont couvertes. Absentes : Mamoudzou (Mayotte, hors champ
 * de l'APL) et Pierrefitte-sur-Seine (fusionnée dans Saint-Denis en 2025).
 * `lib/healthcare-access.ts` garde alors ses paliers estimés.
 *
 * ⚠️ Ce module est atteint par des composants client (quiz, people-like-you,
 * via `lib/city-synthesis`) : le JSON reste compact (≈ 55 Ko).
 */

import RAW from "@/data/city-healthcare.json";

export interface CityHealthcareMeasure {
  /** APL aux médecins généralistes, consultations/an/habitant standardisé. Absent hors champ DREES. */
  apl?: number;
  /** Médecins généralistes libéraux recensés dans la commune (BPE). */
  gp: number;
  /** Pharmacies recensées dans la commune (BPE). */
  pharmacies: number;
  /** Services d'urgences recensés dans la commune (BPE). */
  emergency: number;
  /** Sans service sur place : distance (km, centre à centre, vol d'oiseau) à la commune la plus proche qui en compte un. */
  erKm?: number;
  /** Nom de cette commune. */
  erNearest?: string;
  /** Population municipale 2022. */
  pop: number;
}

const DATA = RAW as {
  meta: { aplYear: number; aplNational: number; bpeYear: number };
  cities: Record<string, CityHealthcareMeasure>;
};

/** Millésime de l'APL (activité des médecins de l'année). */
export const APL_YEAR = DATA.meta.aplYear;
/** APL moyen de la France hors Mayotte, pondéré par la population standardisée. */
export const APL_NATIONAL = DATA.meta.aplNational;
/** Millésime de la BPE (équipements au 1er janvier). */
export const BPE_YEAR = DATA.meta.bpeYear;
/** Seuil réglementaire de zone sous-dense en médecine générale. */
export const APL_UNDERSERVED = 2.5;
/** Sous ce seuil, l'accès est qualifié de très faible. */
export const APL_VERY_LOW = 1.5;

export const HEALTHCARE_CREDIT = `DREES, APL ${DATA.meta.aplYear} · Insee, BPE ${DATA.meta.bpeYear}`;
export const APL_SOURCE_URL =
  "https://data.drees.solidarites-sante.gouv.fr/explore/dataset/530_l-accessibilite-potentielle-localisee-apl/information/";
export const BPE_SOURCE_URL = "https://www.insee.fr/fr/metadonnees/source/serie/s1161";

export function cityHealthcareMeasure(slug: string): CityHealthcareMeasure | null {
  return DATA.cities[slug] ?? null;
}

/** Habitants par pharmacie, arrondi à la centaine ; null sans pharmacie. */
export function residentsPerPharmacy(m: CityHealthcareMeasure): number | null {
  return m.pharmacies > 0 ? Math.round(m.pop / m.pharmacies / 100) * 100 : null;
}
