// Convention: 10 = très tendu (très difficile à louer — fort turn-over,
// délais longs, concurrence élevée). 1 = marché détendu (logements vacants,
// loyers stagnants, délais courts).
//
// Method: (rent_t2 / NATIONAL_MEDIAN_T2 * 5) + regionalTensionBonus.
// National median T2 reference = 750 €/mois (Clameur 2024, hors Paris).
// For cities without housing data, fallback = city.scores.cost * 0.7 + 3.
// (cost score is 10 = cheap → low cost = high rent → high tension; we invert
// so that low cost score → higher fallback tension).
//
// SourceKind: estimation-regionale / données Clameur-Observatoire des loyers.
// No live API — static lookup table + housing seed.

import { HOUSING } from "@/data/housing";
import type { CityLight } from "@/lib/cities-light";

// National median T2 rent (€/month), Clameur 2024 panel, hors Île-de-France.
const NATIONAL_MEDIAN_T2 = 750;

// Per-city and per-zone tension bonuses based on published market tension
// indicators (Clameur tension score, FNAIM vacancy rates, SRU filing data).
// Format: slug → bonus (float).  Cities listed here are the ones with the
// most extreme tension signal; all others get 0.
const SLUG_TENSION_BONUS: Record<string, number> = {
  paris: 4.0,
  "boulogne-billancourt": 3.5,
  "neuilly-sur-seine": 3.5,
  "levallois-perret": 3.5,
  versailles: 3.0,
  lyon: 2.5,
  marseille: 2.5,
  bordeaux: 2.0,
  annecy: 2.5,
  nice: 2.5,
  cannes: 2.5,
  "saint-jean-de-luz": 2.0,
  biarritz: 2.0,
  bayonne: 1.8,
  "la-rochelle": 1.5,
  rennes: 1.5,
  nantes: 1.5,
  montpellier: 1.5,
  toulouse: 1.5,
  "aix-en-provence": 2.0,
  antibes: 2.0,
  "saint-malo": 1.5,
  vannes: 1.5,
  "la-baule-escoublac": 1.8,
  brest: 0.8,
  strasbourg: 1.2,
  grenoble: 1.2,
  chambery: 1.2,
  "le-havre": 0.3,
  rouen: 0.5,
  reims: 0.3,
  amiens: 0.2,
  dijon: 0.5,
  metz: 0.3,
  nancy: 0.3,
  // Deliberately relaxed markets
  limoges: -0.5,
  "saint-etienne": -0.8,
  montlucon: -1.0,
  "charleville-mezieres": -0.8,
  laval: -0.8,
  vichy: -0.8,
};

export function rentalTension(city: CityLight): number {
  const housing = HOUSING[city.slug];

  let raw: number;
  if (housing) {
    const rentRatio = housing.avgRentT2 / NATIONAL_MEDIAN_T2;
    raw = rentRatio * 5 + (SLUG_TENSION_BONUS[city.slug] ?? 0);
  } else {
    // Fallback: cost score 10 = cheap → low tension; 0 = expensive → high.
    // Invert: tension = (10 - cost) * 0.7 + 3
    raw = (10 - city.scores.cost) * 0.7 + 3 + (SLUG_TENSION_BONUS[city.slug] ?? 0);
  }

  return Math.max(1.0, Math.min(9.8, Math.round(raw * 10) / 10));
}

export type TensionLevel = "tendu" | "modere" | "detente";

export function tensionLevel(score: number): TensionLevel {
  if (score >= 7) return "tendu";
  if (score >= 4) return "modere";
  return "detente";
}

export const TENSION_LABEL: Record<
  TensionLevel,
  { label: string; shortLabel: string; color: string }
> = {
  tendu: {
    label: "Marché tendu",
    shortLabel: "Tendu",
    color: "text-red-500",
  },
  modere: {
    label: "Marché modéré",
    shortLabel: "Modéré",
    color: "text-amber-400",
  },
  detente: {
    label: "Marché détendu",
    shortLabel: "Détendu",
    color: "text-green-500",
  },
};

export function tensionInfo(score: number): {
  level: TensionLevel;
  label: string;
  shortLabel: string;
  color: string;
} {
  const level = tensionLevel(score);
  return { level, ...TENSION_LABEL[level] };
}

// ── National ranking helpers (hub /tension-locative) ───────────────────────
// Reuse the same `rentalTension` engine that powers the ×540 sub-pages so the
// hub ranking and the per-city rank are always consistent. Module-level cache.

export interface TensionEntry {
  city: CityLight;
  tension: number;
  info: ReturnType<typeof tensionInfo>;
  /** Loyer T2 de référence (€/mois) si la ville a une fiche logement. */
  rentT2: number | null;
}

let _rankedDesc: TensionEntry[] | null = null;
let _rankedFor: CityLight[] | null = null;

function rankedDesc(cities: CityLight[]): TensionEntry[] {
  if (_rankedDesc && _rankedFor === cities) return _rankedDesc;
  _rankedFor = cities;
  _rankedDesc = cities.map((city) => {
    const tension = rentalTension(city);
    return {
      city,
      tension,
      info: tensionInfo(tension),
      rentT2: HOUSING[city.slug]?.avgRentT2 ?? null,
    };
  }).sort((a, b) => b.tension - a.tension);
  return _rankedDesc;
}

/** Villes au marché le plus tendu (score le plus élevé). */
export function topMostTense(cities: CityLight[], limit = 30, minPop = 0): TensionEntry[] {
  return rankedDesc(cities)
    .filter((e) => (e.city.population ?? 0) >= minPop)
    .slice(0, limit);
}

/** Villes au marché le plus détendu (score le plus bas). */
export function topMostRelaxed(cities: CityLight[], limit = 20, minPop = 0): TensionEntry[] {
  return rankedDesc(cities)
    .filter((e) => (e.city.population ?? 0) >= minPop)
    .slice()
    .reverse()
    .slice(0, limit);
}
