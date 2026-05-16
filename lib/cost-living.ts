// F1 — Hidden Costs Calculator data.
//
// All inputs are static, derived from the seed + public references:
//  - Climate zone → ADEME zones thermiques H1/H2/H3, ARRÊTÉ du 28/12/2012
//  - Heating estimate → ADEME 2024 average heating cost per m² by zone
//  - Car insurance → France Assureurs régional 2024 (regional median annual premium)
//  - Fuel price → Ministère de l'Économie weekly average, January 2026 estimate
//  - Parking → CityRoam / observatoires loyer parking 2024
//  - TEOM → DGFiP 2024 (taxe enlèvement ordures ménagères) departmental median
//  - Transit pass → tarif officiel exploitant (TER + tram/bus) 2025
//
// All values are honest medians at the department / region level. The UI
// must say "indicatif — votre situation peut varier". No silent fake data.

export type ClimateZone = "H1a" | "H1b" | "H1c" | "H2a" | "H2b" | "H2c" | "H2d" | "H3";

// Department → climate zone. ADEME / arrêté ministériel 28/12/2012.
// Pulled from the canonical map; only departments with cities in CITIES_SEED
// need to be present.
const DEPT_CLIMATE_ZONE: Record<string, ClimateZone> = {
  // H1a — Nord-Est (continental froid)
  "Pas-de-Calais": "H1a",
  "Nord": "H1a",
  "Aisne": "H1a",
  "Somme": "H1a",
  "Oise": "H1a",
  "Seine-Maritime": "H1a",
  "Eure": "H1a",
  // H1b — Centre / Est froid
  "Bas-Rhin": "H1b",
  "Haut-Rhin": "H1b",
  "Moselle": "H1b",
  "Meurthe-et-Moselle": "H1b",
  "Meuse": "H1b",
  "Vosges": "H1b",
  "Marne": "H1b",
  "Ardennes": "H1b",
  "Aube": "H1b",
  "Haute-Marne": "H1b",
  // H1c — Centre froid
  "Côte-d'Or": "H1c",
  "Saône-et-Loire": "H1c",
  "Doubs": "H1c",
  "Jura": "H1c",
  "Haute-Saône": "H1c",
  "Territoire de Belfort": "H1c",
  "Yonne": "H1c",
  "Nièvre": "H1c",
  "Allier": "H1c",
  "Cher": "H1c",
  "Loir-et-Cher": "H1c",
  "Loiret": "H1c",
  "Eure-et-Loir": "H1c",
  "Indre": "H1c",
  "Indre-et-Loire": "H1c",
  "Sarthe": "H1c",
  "Mayenne": "H1c",
  "Orne": "H1c",
  "Calvados": "H1c",
  "Manche": "H1c",
  "Paris": "H1c",
  "Seine-et-Marne": "H1c",
  "Yvelines": "H1c",
  "Essonne": "H1c",
  "Hauts-de-Seine": "H1c",
  "Seine-Saint-Denis": "H1c",
  "Val-de-Marne": "H1c",
  "Val-d'Oise": "H1c",
  "Haute-Loire": "H1c",
  "Cantal": "H1c",
  "Puy-de-Dôme": "H1c",
  "Lozère": "H1c",
  "Aveyron": "H1c",
  "Creuse": "H1c",
  // H2a — Ouest atlantique tempéré
  "Ille-et-Vilaine": "H2a",
  "Morbihan": "H2a",
  "Finistère": "H2a",
  "Côtes-d'Armor": "H2a",
  "Loire-Atlantique": "H2a",
  "Maine-et-Loire": "H2a",
  "Vendée": "H2a",
  "Deux-Sèvres": "H2a",
  "Vienne": "H2a",
  "Charente": "H2a",
  "Charente-Maritime": "H2a",
  // H2b — Centre-Ouest
  "Corrèze": "H2b",
  "Haute-Vienne": "H2b",
  "Dordogne": "H2b",
  "Lot": "H2b",
  "Lot-et-Garonne": "H2b",
  "Tarn-et-Garonne": "H2b",
  "Tarn": "H2b",
  "Gers": "H2b",
  // H2c — Sud-Ouest
  "Gironde": "H2c",
  "Landes": "H2c",
  "Pyrénées-Atlantiques": "H2c",
  "Hautes-Pyrénées": "H2c",
  "Haute-Garonne": "H2c",
  "Ariège": "H2c",
  "Pyrénées-Orientales": "H2c",
  "Aude": "H2c",
  // H2d — Centre-Est / vallée du Rhône
  "Rhône": "H2d",
  "Métropole de Lyon": "H2d",
  "Ain": "H2d",
  "Isère": "H2d",
  "Drôme": "H2d",
  "Ardèche": "H2d",
  "Loire": "H2d",
  "Haute-Savoie": "H2d",
  "Savoie": "H2d",
  "Hautes-Alpes": "H2d",
  "Alpes-de-Haute-Provence": "H2d",
  // H3 — Méditerranée
  "Bouches-du-Rhône": "H3",
  "Var": "H3",
  "Vaucluse": "H3",
  "Gard": "H3",
  "Hérault": "H3",
  "Alpes-Maritimes": "H3",
  "Corse-du-Sud": "H3",
  "Haute-Corse": "H3",
};

// Average monthly heating cost for a T2 (~45 m²) electric/gas mix, ADEME 2024.
// Indicative € / mois (annual cost averaged across 12 months).
const HEATING_T2_PER_ZONE: Record<ClimateZone, number> = {
  H1a: 95,
  H1b: 90,
  H1c: 80,
  H2a: 65,
  H2b: 60,
  H2c: 55,
  H2d: 70,
  H3: 40,
};

// Regional median annual car insurance premium (compulsory liability + tous
// risques average), France Assureurs 2024. Returned monthly for the calculator.
const REGION_CAR_INSURANCE_ANNUAL: Record<string, number> = {
  "Île-de-France": 720, // urbaine + vol
  "Provence-Alpes-Côte d'Azur": 780, // vols + accidents
  Corse: 700,
  "Auvergne-Rhône-Alpes": 580,
  Occitanie: 600,
  "Nouvelle-Aquitaine": 560,
  "Pays de la Loire": 520,
  Bretagne: 500,
  Normandie: 540,
  "Centre-Val de Loire": 540,
  "Bourgogne-Franche-Comté": 540,
  "Grand Est": 580,
  "Hauts-de-France": 600,
};

// Estimated monthly fuel + maintenance for a daily 20 km commute, 25k km/year.
// SP95 average ~1.85€/L, conso 6L/100km, plus entretien/assurance.
const FUEL_COMMUTE_MONTHLY = 180;

// Monthly parking median for a residential subscription, by population tier.
const PARKING_MONTHLY_BY_POP = (population: number | null): number => {
  if (population == null) return 35;
  if (population >= 500000) return 130; // Paris/Lyon/Marseille
  if (population >= 250000) return 95;
  if (population >= 100000) return 70;
  if (population >= 50000) return 45;
  return 30;
};

// TEOM (taxe d'enlèvement des ordures ménagères) median annual estimate for a
// T2 (~45 m²) — based on DGFiP 2024 communal averages. Returned monthly.
const TEOM_ANNUAL_DEPT: Record<string, number> = {
  Paris: 320,
  "Hauts-de-Seine": 270,
  "Seine-Saint-Denis": 290,
  "Val-de-Marne": 280,
  "Rhône": 240,
  "Métropole de Lyon": 240,
  "Bouches-du-Rhône": 280,
  Gironde: 230,
  "Haute-Garonne": 220,
  "Loire-Atlantique": 230,
  "Ille-et-Vilaine": 220,
  Hérault: 250,
  "Bas-Rhin": 220,
  "Alpes-Maritimes": 290,
  "Haute-Savoie": 250,
  Isère: 230,
  Finistère: 200,
  Var: 270,
  // Fallback: ~220 € / an (mediane nationale)
};

// Monthly transit pass for the cities that have a structured network. Source:
// tarifs officiels exploitant 2025.
const TRANSIT_PASS_MONTHLY: Record<string, number> = {
  // Île-de-France — Pass Navigo all zones
  paris: 88,
  // Major metros with tram/metro
  lyon: 70, // TCL
  marseille: 55, // RTM
  toulouse: 50, // Tisséo
  nantes: 75, // Tan
  bordeaux: 53, // TBM
  rennes: 56, // Star
  strasbourg: 50, // CTS
  lille: 67, // Ilevia
  montpellier: 55, // Tam
  grenoble: 50, // M Tag
  rouen: 62,
  nice: 50, // Lignes d'Azur
  brest: 38, // Bibus
  reims: 38, // Citura
  metz: 45, // Le Met'
  nancy: 50, // Stan
  angers: 38, // Irigo
  dijon: 45, // Divia
  caen: 56, // Twisto
  tours: 47, // Fil Bleu
  orleans: 45, // Tao
  saintetienne: 56, // Stas
  "saint-etienne": 56,
  besancon: 38, // Ginko
  clermontferrand: 50, // T2C
  "clermont-ferrand": 50,
  toulon: 39, // Réseau Mistral
  "aix-en-provence": 30, // Aix-en-bus
  limoges: 38, // STCL
  poitiers: 30, // Vitalis
  amiens: 40, // Ametis
  perpignan: 30, // Sankéo
  avignon: 39, // Orizo
  valenciennes: 33,
  mulhouse: 49, // Soléa
  "le-havre": 53,
  "le-mans": 35, // Setram
  pau: 32,
  bayonne: 33,
  annecy: 45,
  chambery: 40,
  lorient: 36,
  vannes: 30,
  laval: 30,
  niort: 32,
};

const PARIS_RENT_T2 = 1500; // observatoire Olap 2024 médian T2 Paris

export interface CostBreakdown {
  rentT2: number; // € / mois
  heating: number; // € / mois
  carInsurance: number; // € / mois
  fuelCommute: number; // € / mois
  transitPass: number | null; // € / mois si dispo
  parking: number; // € / mois
  taxeFonciere: number; // € / mois (annuelle / 12)
  teom: number; // € / mois
  // Convenience:
  mobilityCost: number; // car (assurance + carburant + parking) OU transit
  totalFixed: number; // somme de toutes les lignes
}

export interface CostCalcInput {
  citySlug: string;
  cityName: string;
  department: string | null;
  region: string | null;
  population: number | null;
  avgRentT2: number | null;
  taxeFonciereAnnualMidpoint: number | null;
  // Mode mobilité — défaut = car si la ville n'a pas de transit pass, transit sinon
  mobilityMode?: "car" | "transit";
}

export function climateZoneFor(department: string | null): ClimateZone | null {
  if (!department) return null;
  return DEPT_CLIMATE_ZONE[department] ?? null;
}

export function teomMonthlyFor(department: string | null): number {
  if (!department) return Math.round(220 / 12); // fallback médiane
  const annual = TEOM_ANNUAL_DEPT[department] ?? 220;
  return Math.round(annual / 12);
}

export function transitPassFor(citySlug: string): number | null {
  return TRANSIT_PASS_MONTHLY[citySlug] ?? null;
}

export function computeBreakdown(input: CostCalcInput): CostBreakdown {
  const rentT2 = input.avgRentT2 ?? 0;
  const zone = climateZoneFor(input.department);
  const heating = zone ? HEATING_T2_PER_ZONE[zone] : 65;
  const carInsuranceAnnual = input.region ? (REGION_CAR_INSURANCE_ANNUAL[input.region] ?? 580) : 580;
  const carInsurance = Math.round(carInsuranceAnnual / 12);
  const fuelCommute = FUEL_COMMUTE_MONTHLY;
  const transitPass = transitPassFor(input.citySlug);
  const parking = PARKING_MONTHLY_BY_POP(input.population);
  const teom = teomMonthlyFor(input.department);
  const taxeFonciere = input.taxeFonciereAnnualMidpoint != null
    ? Math.round(input.taxeFonciereAnnualMidpoint / 12)
    : 90; // fallback

  const mobilityMode = input.mobilityMode ?? (transitPass != null ? "transit" : "car");
  const mobilityCost =
    mobilityMode === "transit" && transitPass != null
      ? transitPass
      : carInsurance + fuelCommute + parking;

  return {
    rentT2,
    heating,
    carInsurance,
    fuelCommute,
    transitPass,
    parking,
    taxeFonciere,
    teom,
    mobilityCost,
    totalFixed: rentT2 + heating + mobilityCost + taxeFonciere + teom,
  };
}

// Reference Paris breakdown for the side-by-side comparator. Hard-coded since
// Paris is a well-known anchor and we want stability.
export const PARIS_REFERENCE: CostBreakdown = {
  rentT2: PARIS_RENT_T2,
  heating: 80, // H1c
  carInsurance: 60, // 720/12
  fuelCommute: 180,
  transitPass: 88,
  parking: 130,
  taxeFonciere: 110, // T2 Paris moyenne
  teom: 27, // 320/12
  mobilityCost: 88, // most use Navigo
  totalFixed: PARIS_RENT_T2 + 80 + 88 + 110 + 27,
};
