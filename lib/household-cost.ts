// F26 — Coût réel × profil ménage
//
// Extends lib/cost-living.ts with 4 household profiles. Each profile changes
// the housing typology (T1/T2/T3), heating surface ratio, and mobility mode.
// No new dataset — only multipliers + a different rent column from HOUSING.

import { HOUSING, type HousingData } from "@/data/housing";
import { fiscalityForCity } from "@/lib/fiscalite";
import {
  climateZoneFor,
  computeBreakdown,
  type CostBreakdown,
  type CostCalcInput,
} from "@/lib/cost-living";
import { CITIES_SEED } from "@/data/cities-seed";

export type HouseholdProfile = "solo" | "couple" | "famille" | "retraite";

export interface HouseholdProfileMeta {
  key: HouseholdProfile;
  label: string;
  tagline: string;
  surface: string;
}

export const HOUSEHOLD_PROFILES: readonly HouseholdProfileMeta[] = [
  { key: "solo", label: "Solo / 1 personne", tagline: "Jeune actif, T1, mobilité transit prioritaire", surface: "T1 (~25 m²)" },
  { key: "couple", label: "Couple sans enfant", tagline: "T2, base de référence du site", surface: "T2 (~45 m²)" },
  { key: "famille", label: "Famille 2 enfants", tagline: "T3, voiture quasi-obligatoire, surcoût scolaire", surface: "T3 (~70 m²)" },
  { key: "retraite", label: "Retraité·e", tagline: "T2, plus de chauffage (jour), pas de trajet domicile-travail", surface: "T2 (~45 m²)" },
] as const;

// Per-profile multipliers applied on top of computeBreakdown.
const HEATING_RATIO: Record<HouseholdProfile, number> = {
  solo: 0.65, // T1 surface ratio
  couple: 1.0, // T2 baseline
  famille: 1.45, // T3 surface ratio
  retraite: 1.1, // T2 surface but présent toute la journée → +10 %
};

const TAXE_FONCIERE_RATIO: Record<HouseholdProfile, number> = {
  solo: 0.75, // T1
  couple: 1.0,
  famille: 1.4, // T3
  retraite: 1.0,
};

// Indicative monthly extra for school-aged children (cantine + fournitures +
// activités péri, 2 enfants × ~75 €/mois). Conservative — fees vary by city.
const FAMILLE_SCHOOL_EXTRA = 150;

function parseFonciereMidpoint(range: string): number | null {
  const cleaned = range.replace(/ /g, " ").replace(/[€/an\s]/g, "");
  const m = cleaned.match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  const lo = Number(m[1]);
  const hi = Number(m[2]);
  if (Number.isNaN(lo) || Number.isNaN(hi)) return null;
  return Math.round((lo + hi) / 2);
}

function rentForProfile(housing: HousingData | null, profile: HouseholdProfile): number | null {
  if (!housing) return null;
  switch (profile) {
    case "solo": return housing.avgRentT1 ?? null;
    case "couple": return housing.avgRentT2 ?? null;
    case "famille": return housing.avgRentT3 ?? null;
    case "retraite": return housing.avgRentT2 ?? null;
  }
}

export interface HouseholdBreakdown {
  profile: HouseholdProfile;
  base: CostBreakdown | null;
  rent: number | null;
  heating: number;
  mobility: number;
  taxeFonciere: number;
  teom: number;
  schoolExtra: number;
  // For retraite : no commute fuel — we strip FUEL_COMMUTE from car-mode mobility.
  total: number | null;
}

export function householdBreakdownFor(
  citySlug: string,
  profile: HouseholdProfile,
): HouseholdBreakdown {
  const city = CITIES_SEED.find((c) => c.slug === citySlug);
  if (!city) {
    return { profile, base: null, rent: null, heating: 0, mobility: 0, taxeFonciere: 0, teom: 0, schoolExtra: 0, total: null };
  }
  const housing = HOUSING[citySlug] ?? null;
  const fisc =
    city.department && city.region
      ? fiscalityForCity({ department: city.department, region: city.region })
      : null;
  const taxeFonciereAnnualMidpoint = fisc ? parseFonciereMidpoint(fisc.taxeFonciereT3) : null;
  void climateZoneFor(city.department);

  const baseInput: CostCalcInput = {
    citySlug: city.slug,
    cityName: city.name,
    department: city.department,
    region: city.region,
    population: city.population,
    avgRentT2: housing?.avgRentT2 ?? null,
    taxeFonciereAnnualMidpoint,
    // Famille = voiture quasi-obligatoire (école run); les autres respectent le défaut.
    mobilityMode: profile === "famille" ? "car" : undefined,
  };
  const base = computeBreakdown(baseInput);

  const rent = rentForProfile(housing, profile);
  const heating = Math.round(base.heating * HEATING_RATIO[profile]);
  const taxeFonciere = Math.round(base.taxeFonciere * TAXE_FONCIERE_RATIO[profile]);
  const teom = base.teom;
  const schoolExtra = profile === "famille" ? FAMILLE_SCHOOL_EXTRA : 0;

  // Retraite : pas de trajet domicile-travail → enlève le carburant commute.
  // Si l'utilisateur prend les transports en commun en ville, le pass reste utile.
  let mobility = base.mobilityCost;
  if (profile === "retraite") {
    if (base.transitPass != null) {
      mobility = base.transitPass; // garde le pass
    } else {
      // car mode : enlève le fuel commute
      mobility = Math.max(0, base.mobilityCost - base.fuelCommute);
    }
  }

  const total = rent != null
    ? rent + heating + mobility + taxeFonciere + teom + schoolExtra
    : null;

  return { profile, base, rent, heating, mobility, taxeFonciere, teom, schoolExtra, total };
}

export function householdBreakdownsAllProfiles(citySlug: string): HouseholdBreakdown[] {
  return HOUSEHOLD_PROFILES.map((p) => householdBreakdownFor(citySlug, p.key));
}
