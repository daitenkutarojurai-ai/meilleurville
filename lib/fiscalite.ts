// Department-level fiscal data for the per-city fiscalité sub-page.
// Source: DGFiP cahiers de l'Observatoire des finances locales (OFL) 2024
// + bulletins officiels DGFiP sur les taux d'imposition votés. Per-commune
// granularity exists in DGFiP datasets but varies hugely (a single commune
// inside a department can be 10pp off the department mean); we expose tiered
// estimations and tell the reader explicitly that values vary per commune.

export type FiscaliteTier = "faible" | "moderee" | "elevee" | "tres-elevee" | "particulier";

export interface FiscaliteData {
  tier: FiscaliteTier;
  tierLabel: string;
  // Annual taxe foncière estimate for a typical T3 ancien (base locative
  // cadastrale ~3500-4500 €). Range as a string for honest display.
  taxeFonciereT3: string;
  // Whether the department contains commune(s) in zone tendue (décret 2023,
  // zone tendue THRS majoration disponible jusqu'à +60 %).
  zoneTendue: boolean;
  // DMTO (droits de mutation à titre onéreux) — % of purchase price.
  // The vast majority of departments apply 4.50 % droits département +
  // taxe communale + frais d'assiette ≈ 5.81 % total droits. Frais de
  // notaire ajoutent ~1-2 %.
  dmtoDroitsPercent: number;
  notes: string;
}

const PARTICULIER_PARIS: FiscaliteData = {
  tier: "particulier",
  tierLabel: "Cas particulier — Paris",
  taxeFonciereT3: "1 100-1 600 €/an",
  zoneTendue: true,
  dmtoDroitsPercent: 5.80,
  notes: "Paris a historiquement un taux communal de taxe foncière parmi les plus bas (~13.5 % en 2024 après réforme), mais des bases cadastrales très élevées. THRS majoration jusqu'à +60 % depuis 2023 (Paris en zone tendue).",
};

const PARTICULIER_DROM: FiscaliteData = {
  tier: "particulier",
  tierLabel: "Cas particulier — Outre-mer",
  taxeFonciereT3: "700-1 400 €/an",
  zoneTendue: true,
  dmtoDroitsPercent: 4.50,
  notes: "Régime fiscal spécifique outre-mer : DMTO réduits (4.50 % au lieu de 5.81 % ailleurs), exonérations partielles possibles, mais cotisations communales très variables. Vérifier impérativement avec le notaire local.",
};

const DEFAULT_MODEREE: FiscaliteData = {
  tier: "moderee",
  tierLabel: "Pression fiscale modérée",
  taxeFonciereT3: "900-1 300 €/an",
  zoneTendue: false,
  dmtoDroitsPercent: 5.80,
  notes: "Département dans la moyenne nationale. Taxe foncière communale variable selon la commune (±30 % autour de la moyenne départementale).",
};

// Departments grouped by tier. Values aligned with DGFiP / OFL 2024
// published averages. Where uncertain, we default to 'moderee'.
const DEPT_TIER: Record<string, FiscaliteTier> = {
  // FAIBLE — départements ruraux à faible base cadastrale et taux modérés
  "Yonne": "faible",
  "Haute-Marne": "faible",
  "Meuse": "faible",
  "Vosges": "faible",
  "Ardennes": "faible",
  "Haute-Saône": "faible",
  "Allier": "faible",
  "Creuse": "faible",
  "Corrèze": "faible",
  "Cantal": "faible",
  "Lozère": "faible",
  "Indre": "faible",
  "Cher": "faible",
  "Nièvre": "faible",
  "Aveyron": "faible",
  "Aube": "faible",

  // ÉLEVÉE — départements urbains denses + façade méditerranéenne
  "Bouches-du-Rhône": "elevee",
  "Var": "elevee",
  "Vaucluse": "elevee",
  "Gard": "elevee",
  "Hérault": "elevee",
  "Pyrénées-Orientales": "elevee",
  "Drôme": "elevee",
  "Ardèche": "elevee",
  "Yvelines": "elevee",
  "Essonne": "elevee",
  "Val-d'Oise": "elevee",
  "Seine-et-Marne": "elevee",
  "Eure-et-Loir": "elevee",
  "Loire-Atlantique": "elevee",
  "Ille-et-Vilaine": "elevee",
  "Gironde": "elevee",
  "Haute-Garonne": "elevee",
  "Rhône": "elevee",

  // TRÈS ÉLEVÉE — petite couronne IDF, Alpes-Maritimes, Corse-du-Sud
  "Hauts-de-Seine": "tres-elevee",
  "Seine-Saint-Denis": "tres-elevee",
  "Val-de-Marne": "tres-elevee",
  "Alpes-Maritimes": "tres-elevee",
  "Corse-du-Sud": "tres-elevee",
  "Haute-Corse": "tres-elevee",

  // PARTICULIER (Paris)
  "Paris": "particulier",
};

// DROM regions (mapped via region, not department)
const DROM_REGIONS = new Set([
  "Martinique", "Guadeloupe", "La Réunion", "Mayotte", "Guyane",
]);

// Communes commonly cited in décrets zone tendue 2023+ : we don't have full
// per-commune granularity here, but we flag whole departments where a large
// share of communes are in zone tendue. Used to surface the THRS majoration
// information honestly.
const ZONE_TENDUE_DEPARTMENTS = new Set([
  "Paris", "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne",
  "Yvelines", "Essonne", "Val-d'Oise", "Seine-et-Marne", "Oise",
  "Alpes-Maritimes", "Var", "Bouches-du-Rhône", "Vaucluse",
  "Hérault", "Gard", "Pyrénées-Orientales",
  "Corse-du-Sud", "Haute-Corse",
  "Loire-Atlantique", "Ille-et-Vilaine", "Morbihan", "Finistère",
  "Gironde", "Pyrénées-Atlantiques", "Landes",
  "Haute-Savoie", "Savoie", "Isère", "Rhône",
  "Charente-Maritime", "Vendée",
  "Calvados", "Manche", "Seine-Maritime",
]);

const TIER_DATA: Record<Exclude<FiscaliteTier, "particulier">, Omit<FiscaliteData, "zoneTendue" | "tier" | "tierLabel">> = {
  faible: {
    taxeFonciereT3: "550-900 €/an",
    dmtoDroitsPercent: 5.80,
    notes: "Pression fiscale relativement faible. Taxe foncière communale historiquement modérée, base cadastrale typiquement basse.",
  },
  moderee: {
    taxeFonciereT3: "900-1 300 €/an",
    dmtoDroitsPercent: 5.80,
    notes: "Département dans la moyenne nationale. Taxe foncière communale variable selon la commune (±30 % autour de la moyenne départementale).",
  },
  elevee: {
    taxeFonciereT3: "1 300-1 800 €/an",
    dmtoDroitsPercent: 5.80,
    notes: "Pression fiscale élevée — coût du logement et services urbains tirent les taux à la hausse. Vérifier impérativement la taxe foncière sur le dernier avis du vendeur.",
  },
  "tres-elevee": {
    taxeFonciereT3: "1 700-2 400 €/an",
    dmtoDroitsPercent: 5.80,
    notes: "Pression fiscale parmi les plus fortes de France. Vérifier impérativement la taxe foncière + THRS éventuelle avant achat — peut peser 100-200 €/mois sur la rentabilité ou le budget.",
  },
};

const TIER_LABEL: Record<FiscaliteTier, string> = {
  faible: "Pression fiscale faible",
  moderee: "Pression fiscale modérée",
  elevee: "Pression fiscale élevée",
  "tres-elevee": "Pression fiscale très élevée",
  particulier: "Cas particulier",
};

export function fiscalityForCity(opts: { department: string; region: string }): FiscaliteData {
  // DROM override
  if (DROM_REGIONS.has(opts.region)) return PARTICULIER_DROM;
  if (opts.department === "Paris") return PARTICULIER_PARIS;

  const tier = DEPT_TIER[opts.department] ?? "moderee";
  if (tier === "particulier") return DEFAULT_MODEREE; // fallback shouldn't hit
  const base = TIER_DATA[tier];
  return {
    tier,
    tierLabel: TIER_LABEL[tier],
    taxeFonciereT3: base.taxeFonciereT3,
    zoneTendue: ZONE_TENDUE_DEPARTMENTS.has(opts.department),
    dmtoDroitsPercent: base.dmtoDroitsPercent,
    notes: base.notes,
  };
}

export const TIER_TONE: Record<FiscaliteTier, { text: string; bg: string; border: string }> = {
  faible:        { text: "text-emerald-700", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  moderee:       { text: "text-amber-700",   bg: "bg-amber-400/10",   border: "border-amber-500/30" },
  elevee:        { text: "text-orange-700",  bg: "bg-orange-500/10",  border: "border-orange-500/30" },
  "tres-elevee": { text: "text-red-700",     bg: "bg-red-500/10",     border: "border-red-500/30" },
  particulier:   { text: "text-violet-700",  bg: "bg-violet-500/10",  border: "border-violet-500/30" },
};
