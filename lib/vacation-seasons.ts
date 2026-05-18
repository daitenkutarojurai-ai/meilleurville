// V1.5 — Climat mensuel par ville (signaux mois × ville pour le moteur vacances).
//
// **Stratégie hybride** :
//   1. Source primaire : **normales Météo-France 1991-2020** (29 stations
//      de référence en métropole + DROM), chargées via
//      `lib/climate-normals.ts`. Chaque ville snape à sa station la plus
//      proche (haversine).
//   2. Fallback : interpolation sinusoïdale à partir des deux ancres
//      du seed (avgTempJuly, avgTempJanuary) + biais régional pour
//      précipitations et ensoleillement, **uniquement** quand la
//      station de référence n'expose pas la variable (rare — sunHours
//      sur quelques stations DROM, rainDays partiels sur certaines
//      stations métropolitaines).
//
// L'affluence touristique reste calculée séparément (1-5) à partir des
// characterTags et de la saison — c'est un signal qualitatif, pas un
// signal climatique.

import type { CitySeed } from "@/data/cities-seed";
import { normalsForCityMonth } from "@/lib/climate-normals";

export const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
] as const;

export const MONTHS_SHORT = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
] as const;

export type MonthSlug = (typeof MONTHS)[number];
export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface MonthSignal {
  month: MonthIndex;
  /** Température moyenne du mois (°C) */
  tempAvg: number;
  /** Min/max indicatifs */
  tempMin: number;
  tempMax: number;
  /** Jours de pluie estimés sur le mois (0-25) */
  rainDays: number;
  /** Heures de soleil moyennes par jour */
  sunHoursPerDay: number;
  /** Affluence touristique : 1 = très calme, 5 = saturé */
  crowded: 1 | 2 | 3 | 4 | 5;
}

// ─── Biais régionaux : précipitations et ensoleillement saisonniers ──────
//
// On classe chaque dept en un "régime climatique" v1. Sources :
//   - Météo-France "Atlas climatique 1991-2020"
//   - Carte des régions climatiques (Joly et al. 2010)
// Catégories grossières :
//   - "mediterranean"   : été sec, automne pluvieux, hiver doux
//   - "oceanic"         : précipitations régulières toute l'année
//   - "oceanic-dry"     : façade atlantique sud (Aquitaine)
//   - "semi-continental": étés chauds orageux, hivers froids
//   - "continental"     : Est, hivers très froids, étés chauds
//   - "mountain"        : alt > 600m ou massif majeur
//   - "drom"            : tropical, traité à part

type ClimateRegime =
  | "mediterranean"
  | "oceanic"
  | "oceanic-dry"
  | "semi-continental"
  | "continental"
  | "mountain"
  | "drom";

const MEDITERRANEAN_DEPTS = new Set([
  "Pyrénées-Orientales", "Aude", "Hérault", "Gard", "Bouches-du-Rhône",
  "Var", "Alpes-Maritimes", "Vaucluse", "Corse-du-Sud", "Haute-Corse",
]);

const OCEANIC_DRY_DEPTS = new Set([
  // Aquitaine intérieure et côte landaise : sec en été comparé à l'ouest
  "Gironde", "Landes", "Lot-et-Garonne", "Pyrénées-Atlantiques",
  "Tarn-et-Garonne", "Gers", "Charente-Maritime",
]);

const CONTINENTAL_DEPTS = new Set([
  "Bas-Rhin", "Haut-Rhin", "Moselle", "Meurthe-et-Moselle",
  "Vosges", "Doubs", "Jura", "Haute-Saône", "Territoire de Belfort",
  "Aube", "Marne", "Haute-Marne", "Ardennes",
]);

const SEMI_CONTINENTAL_DEPTS = new Set([
  "Côte-d'Or", "Saône-et-Loire", "Nièvre", "Yonne", "Allier", "Cher",
  "Loiret", "Loir-et-Cher", "Indre", "Indre-et-Loire", "Maine-et-Loire",
  "Sarthe", "Mayenne", "Orne",
  "Puy-de-Dôme", "Haute-Loire", "Loire",
]);

const DROM_REGIONS = new Set([
  "Guadeloupe", "Martinique", "La Réunion", "Mayotte", "Guyane",
]);

function climateRegime(city: CitySeed): ClimateRegime {
  if (DROM_REGIONS.has(city.region ?? "")) return "drom";
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMountainTag = /alpes|pyrénées|massif|montagne|altitude|station/.test(tags);
  if ((city.elevation ?? 0) >= 600 || isMountainTag) return "mountain";
  if (MEDITERRANEAN_DEPTS.has(city.department)) return "mediterranean";
  if (CONTINENTAL_DEPTS.has(city.department)) return "continental";
  if (OCEANIC_DRY_DEPTS.has(city.department)) return "oceanic-dry";
  if (SEMI_CONTINENTAL_DEPTS.has(city.department)) return "semi-continental";
  return "oceanic";
}

// Précipitations indicatives : jours de pluie par mois (1-12) par régime.
// Source : moyennes 1991-2020 des stations représentatives (Marseille,
// Brest, Strasbourg, Bordeaux, Lyon, Chamonix, Pointe-à-Pitre).
const RAIN_DAYS_BY_REGIME: Record<ClimateRegime, number[]> = {
  // J  F  M  A  M  J  J  A  S  O  N  D
  mediterranean:      [ 6,  5,  6,  7,  6,  4,  2,  3,  6,  8,  9,  7],
  oceanic:            [13, 11, 11, 10, 10,  9,  8,  9, 10, 12, 13, 14],
  "oceanic-dry":      [12, 10, 10,  9,  9,  7,  6,  7,  8, 11, 12, 13],
  "semi-continental": [11, 10, 11, 11, 12, 10,  9,  9, 10, 11, 12, 12],
  continental:        [11, 10, 10, 10, 12, 11, 10, 10,  9, 10, 11, 12],
  mountain:           [10, 10, 11, 11, 13, 12, 10, 11, 10, 11, 12, 11],
  drom:               [12, 10,  8,  7,  9, 11, 14, 16, 17, 14, 13, 13],
};

// Heures de soleil/jour indicatives par régime (moyennes annuelles équiv.)
const SUN_HOURS_BY_REGIME: Record<ClimateRegime, number[]> = {
  mediterranean:      [5.0, 5.5, 6.5, 7.5, 8.5, 10.0, 11.0, 10.0, 8.0, 6.0, 4.5, 4.0],
  oceanic:            [2.0, 3.0, 4.5, 5.5, 6.5,  7.5,  7.5,  7.0, 6.0, 3.5, 2.5, 2.0],
  "oceanic-dry":      [3.0, 4.0, 5.5, 6.5, 7.5,  8.5,  9.0,  8.0, 7.0, 4.5, 3.5, 2.5],
  "semi-continental": [2.5, 3.5, 5.0, 5.5, 6.5,  7.5,  8.0,  7.5, 6.0, 4.0, 2.5, 2.0],
  continental:        [2.0, 3.0, 4.5, 5.5, 6.5,  7.5,  8.0,  7.5, 5.5, 3.5, 2.0, 1.5],
  mountain:           [3.0, 4.0, 5.5, 6.0, 6.5,  7.0,  7.5,  7.0, 6.0, 4.5, 3.0, 2.5],
  drom:               [7.5, 8.0, 8.5, 8.5, 7.5,  6.5,  7.0,  7.5, 7.0, 7.0, 7.0, 7.0],
};

// ─── Interpolation température sinusoïdale ────────────────────────────────
//
// La courbe annuelle est un sinus dont le minimum est mi-janvier et le
// maximum mi-juillet : c'est une approximation honnête pour la France
// métropolitaine à ±0.7 °C près sur les mois équinoxiaux.

function tempAvgForMonth(city: CitySeed, month: MonthIndex): number {
  const j = city.avgTempJuly ?? 22;
  const w = city.avgTempJanuary ?? 4;
  const mean = (j + w) / 2;
  const amplitude = (j - w) / 2;
  // Mois 7 (juillet) → maximum ; mois 1 (janvier) → minimum.
  // (month - 7) * π/6 : phase 0 en juillet, ±π en janvier.
  const phase = ((month - 7) * Math.PI) / 6;
  return Math.round((mean + amplitude * Math.cos(phase)) * 10) / 10;
}

// ─── Affluence touristique ────────────────────────────────────────────────

function crowdednessForMonth(city: CitySeed, month: MonthIndex): 1 | 2 | 3 | 4 | 5 {
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const regime = climateRegime(city);
  const pop = city.population ?? 0;
  const isCoastalTag = /mer|plage|côte|atlantique|méditerranée|balnéaire|littoral/.test(tags);
  const isMountainTouristic = regime === "mountain" && /station|ski|tourisme/.test(tags);
  const isWineCountry = /vignoble|vin/.test(tags);
  const isCityBreak = pop > 200_000 || /métropole/.test(tags);

  // Base annuelle selon le type de destination
  let base: number;
  if (isCoastalTag && regime === "mediterranean") base = 3;
  else if (isCoastalTag) base = 2;
  else if (isMountainTouristic) base = 3;
  else if (isCityBreak) base = 3;
  else if (isWineCountry) base = 2;
  else base = 1;

  // Modulation mensuelle
  let mod = 0;
  if (month === 8) mod += 2; // août, pic absolu partout
  else if (month === 7) mod += 1.5; // juillet
  else if (month === 6 || month === 9) mod += 0.5;
  else if (month === 12 || month === 2 || month === 1) {
    // Ski pic en hiver, autres destinations creuses
    mod += isMountainTouristic ? 1.5 : -0.5;
  } else if (month === 4 || month === 5 || month === 10) {
    mod += 0; // mi-saison neutre
  } else {
    mod -= 0.5;
  }
  const val = Math.round(base + mod);
  return Math.max(1, Math.min(5, val)) as 1 | 2 | 3 | 4 | 5;
}

// ─── API publique ─────────────────────────────────────────────────────────

export function monthSignal(city: CitySeed, month: MonthIndex): MonthSignal {
  const regime = climateRegime(city);
  // Source primaire : station Météo-France la plus proche.
  const normals = normalsForCityMonth(city, month);

  // Température (priorité : station, sinon interpolation)
  const interpolatedTemp = tempAvgForMonth(city, month);
  const amplitude = ((city.avgTempJuly ?? 22) - (city.avgTempJanuary ?? 4)) / 2;
  const tempAvg = normals?.tempAvg ?? interpolatedTemp;
  const tempMin =
    normals?.tempMin ?? Math.round((tempAvg - Math.max(3, amplitude * 0.35)) * 10) / 10;
  const tempMax =
    normals?.tempMax ?? Math.round((tempAvg + Math.max(3, amplitude * 0.35)) * 10) / 10;

  // Jours de pluie (priorité : station, sinon table régionale)
  const rainDays =
    normals?.rainDays != null
      ? Math.round(normals.rainDays)
      : RAIN_DAYS_BY_REGIME[regime][month - 1];

  // Heures de soleil par jour (priorité : station mensuelles / jours-du-mois,
  // sinon table régionale)
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  const sunHoursPerDay =
    normals?.sunHours != null
      ? Math.round((normals.sunHours / daysInMonth) * 10) / 10
      : SUN_HOURS_BY_REGIME[regime][month - 1];

  return {
    month,
    tempAvg: Math.round(tempAvg * 10) / 10,
    tempMin,
    tempMax,
    rainDays,
    sunHoursPerDay,
    crowded: crowdednessForMonth(city, month),
  };
}

export function allMonthSignals(city: CitySeed): MonthSignal[] {
  const out: MonthSignal[] = [];
  for (let m = 1 as MonthIndex; m <= 12; m++) {
    out.push(monthSignal(city, m as MonthIndex));
  }
  return out;
}

export function monthSlugToIndex(slug: string): MonthIndex | null {
  const idx = MONTHS.indexOf(slug as MonthSlug);
  return idx >= 0 ? ((idx + 1) as MonthIndex) : null;
}

export function indexToMonthSlug(month: MonthIndex): MonthSlug {
  return MONTHS[month - 1];
}

export function formatMonthLabel(month: MonthIndex): string {
  const s = MONTHS[month - 1];
  return s.charAt(0).toUpperCase() + s.slice(1);
}
