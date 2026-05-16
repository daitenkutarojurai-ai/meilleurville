// F31 — Climat 2040 par ville
//
// Projection horizon 2040 pour chaque ville, basée sur les deltas Météo-France
// ARPEGE déjà documentés dans la série "Climat 2040" des guides éditoriaux
// (12 macro-régions). On applique le delta de macro-région au seed actuel
// (avgTempJuly, avgTempJanuary) et on dérive trois indicateurs visibles :
//   - Hausse moyenne juillet attendue (°C)
//   - Jours > 30 °C par an estimés en 2040
//   - Nuits tropicales (> 20 °C) par an estimées en 2040
//
// La projection est INDICATIVE — les modèles climatiques ont une incertitude
// régionale de ±0,5 °C. Tag « Projection ARPEGE » explicite sur l'UI.

import type { CitySeed } from "@/data/cities-seed";

export type MacroRegion =
  | "mediterranean"
  | "atlantic"
  | "iledefrance"
  | "massif-central"
  | "bretagne"
  | "hauts-france"
  | "grand-est"
  | "sud-ouest"
  | "vallee-rhone"
  | "normandie"
  | "centre-val-loire"
  | "bourgogne-franche-comte"
  | "alpes"
  | "corse"
  | "drom";

interface MacroRegionDelta {
  key: MacroRegion;
  label: string;
  /** Hausse moyenne juillet 2040 vs 1991-2020 (°C) — médian ARPEGE RCP4.5/8.5 */
  deltaJulyC: number;
  /** Nombre de jours > 30 °C supplémentaires à horizon 2040 */
  extraDays30C: number;
  /** Nuits tropicales supplémentaires (> 20 °C) à horizon 2040 */
  extraTropicalNights: number;
  /** Signature narrative courte */
  signature: string;
}

const MACRO_REGION_DELTAS: Record<MacroRegion, MacroRegionDelta> = {
  mediterranean: {
    key: "mediterranean",
    label: "Sud-Est méditerranéen",
    deltaJulyC: 2.4,
    extraDays30C: 35,
    extraTropicalNights: 40,
    signature: "Bassin méditerranéen : étés caniculaires multipliés, nuits tropicales fréquentes.",
  },
  atlantic: {
    key: "atlantic",
    label: "Façade Atlantique",
    deltaJulyC: 1.8,
    extraDays30C: 18,
    extraTropicalNights: 12,
    signature: "Façade Atlantique : régulation océanique persistante, hausse modérée mais réelle.",
  },
  iledefrance: {
    key: "iledefrance",
    label: "Île-de-France élargie",
    deltaJulyC: 2.2,
    extraDays30C: 25,
    extraTropicalNights: 22,
    signature: "Bassin parisien : îlot de chaleur urbain amplifié, nuits tropicales en hausse.",
  },
  "massif-central": {
    key: "massif-central",
    label: "Massif Central",
    deltaJulyC: 2.0,
    extraDays30C: 20,
    extraTropicalNights: 14,
    signature: "Massif Central : altitude tempérée mais sécheresses plus longues, neige en baisse.",
  },
  bretagne: {
    key: "bretagne",
    label: "Bretagne",
    deltaJulyC: 1.6,
    extraDays30C: 10,
    extraTropicalNights: 6,
    signature: "Bretagne : la zone la moins exposée — l'océan régule, mais le climat reste à surveiller.",
  },
  "hauts-france": {
    key: "hauts-france",
    label: "Hauts-de-France",
    deltaJulyC: 1.9,
    extraDays30C: 16,
    extraTropicalNights: 10,
    signature: "Hauts-de-France : climat continental adouci, mais épisodes caniculaires plus durs.",
  },
  "grand-est": {
    key: "grand-est",
    label: "Grand Est",
    deltaJulyC: 2.3,
    extraDays30C: 22,
    extraTropicalNights: 18,
    signature: "Grand Est : continentalité accentuée, étés plus secs et plus chauds.",
  },
  "sud-ouest": {
    key: "sud-ouest",
    label: "Sud-Ouest / Pyrénées",
    deltaJulyC: 2.3,
    extraDays30C: 28,
    extraTropicalNights: 24,
    signature: "Sud-Ouest : exposition forte aux dômes de chaleur ibériques.",
  },
  "vallee-rhone": {
    key: "vallee-rhone",
    label: "Vallée du Rhône",
    deltaJulyC: 2.5,
    extraDays30C: 32,
    extraTropicalNights: 30,
    signature: "Couloir rhodanien : couloir thermique entre Alpes et Méditerranée, canicules sévères.",
  },
  normandie: {
    key: "normandie",
    label: "Normandie / Cotentin",
    deltaJulyC: 1.7,
    extraDays30C: 12,
    extraTropicalNights: 8,
    signature: "Normandie : régulation océanique forte, hausse contenue.",
  },
  "centre-val-loire": {
    key: "centre-val-loire",
    label: "Centre-Val de Loire",
    deltaJulyC: 2.0,
    extraDays30C: 20,
    extraTropicalNights: 16,
    signature: "Vallée de Loire : entre océanique et continental, sécheresses estivales en hausse.",
  },
  "bourgogne-franche-comte": {
    key: "bourgogne-franche-comte",
    label: "Bourgogne / Franche-Comté / Jura",
    deltaJulyC: 2.1,
    extraDays30C: 20,
    extraTropicalNights: 16,
    signature: "Bourgogne-Jura : altitudes modérées, étés plus chauds, hivers plus doux.",
  },
  alpes: {
    key: "alpes",
    label: "Alpes / Savoie",
    deltaJulyC: 2.2,
    extraDays30C: 16,
    extraTropicalNights: 10,
    signature: "Alpes : altitude offre un refuge thermique, mais enneigement en chute libre.",
  },
  corse: {
    key: "corse",
    label: "Corse",
    deltaJulyC: 2.4,
    extraDays30C: 32,
    extraTropicalNights: 35,
    signature: "Corse : étés très chauds, risque incendies amplifié, sécheresse marquée.",
  },
  drom: {
    key: "drom",
    label: "Outre-mer / DROM",
    deltaJulyC: 1.5,
    extraDays30C: 25,
    extraTropicalNights: 50,
    signature: "DROM : cyclones plus intenses, élévation de la mer, chaleur amplifiée.",
  },
};

// Region → macro-region mapping. The 13 metropolitan administrative regions
// don't map 1:1 to climatic macro-regions, so a few regions split across
// climate zones (e.g. Auvergne-Rhône-Alpes covers Alpes + Vallée du Rhône +
// Massif Central). We pick the dominant climate zone, then refine on coord.
function inferMacroRegion(city: CitySeed): MacroRegion {
  const r = city.region ?? "";
  const lat = city.latitude;
  const lon = city.longitude;

  // DROM first — anything outside the metropolitan bbox
  if (lat != null && lon != null) {
    const inMetro = lon >= -6 && lon <= 10 && lat >= 40 && lat <= 52;
    if (!inMetro) return "drom";
  }

  // Sharp regions first
  if (r === "Corse") return "corse";
  if (r === "Bretagne") return "bretagne";
  if (r === "Normandie") return "normandie";
  if (r === "Hauts-de-France") return "hauts-france";
  if (r === "Île-de-France") return "iledefrance";
  if (r === "Grand Est") return "grand-est";
  if (r === "Centre-Val de Loire") return "centre-val-loire";
  if (r === "Bourgogne-Franche-Comté") return "bourgogne-franche-comte";

  // Ambiguous regions — refine on latitude / longitude
  if (r === "Provence-Alpes-Côte d'Azur") {
    // PACA = Méditerranée littoral OR Alpes du Sud — split on latitude
    if (lat != null && lat >= 44.2) return "alpes"; // Hautes-Alpes, Alpes-de-Haute-Provence Nord
    return "mediterranean";
  }
  if (r === "Occitanie") {
    // Occitanie = littoral méditerranéen OR Pyrénées/Sud-Ouest
    if (lon != null && lon <= 2.0) return "sud-ouest";
    return "mediterranean";
  }
  if (r === "Nouvelle-Aquitaine") {
    // Nouvelle-Aquitaine = Atlantique littoral OR Pyrénées OR Massif Central
    if (lat != null && lat <= 44.0 && lon != null && lon >= -1.0) return "sud-ouest";
    if (lon != null && lon >= 1.8) return "massif-central"; // Limousin → Massif Central
    return "atlantic";
  }
  if (r === "Pays de la Loire") return "atlantic";
  if (r === "Auvergne-Rhône-Alpes") {
    // ARA = Alpes OR Vallée du Rhône OR Massif Central (Auvergne)
    if (lon != null && lon >= 6.0) return "alpes";
    if (lon != null && lon <= 3.5) return "massif-central"; // Auvergne (Puy-de-Dôme, Cantal, …)
    return "vallee-rhone";
  }

  // Default fallback
  return "centre-val-loire";
}

export interface ClimateProjection {
  macroRegion: MacroRegionDelta;
  currentJulyC: number | null;
  projectedJulyC: number | null;
  /** Jours > 30 °C / an aujourd'hui (estimation depuis avgTempJuly) */
  currentDays30C: number;
  projectedDays30C: number;
  /** Nuits tropicales (>20 °C) / an */
  currentTropicalNights: number;
  projectedTropicalNights: number;
  /** Verdict une-ligne contextualisé */
  verdict: string;
}

/**
 * Crude proxy for current days > 30 °C and tropical nights, derived from
 * avgTempJuly. Doesn't claim to be authoritative — it's a heuristic baseline
 * to which the macro-region delta is added.
 */
function currentDays30CFor(avgTempJuly: number | null): number {
  if (avgTempJuly == null) return 8;
  if (avgTempJuly >= 27) return 35; // Sud très chaud (Avignon, Aix, Béziers)
  if (avgTempJuly >= 25) return 22;
  if (avgTempJuly >= 23) return 14;
  if (avgTempJuly >= 21) return 8;
  if (avgTempJuly >= 19) return 4;
  return 2;
}

function currentTropicalNightsFor(avgTempJuly: number | null): number {
  if (avgTempJuly == null) return 4;
  if (avgTempJuly >= 27) return 35;
  if (avgTempJuly >= 25) return 18;
  if (avgTempJuly >= 23) return 8;
  if (avgTempJuly >= 21) return 4;
  if (avgTempJuly >= 19) return 2;
  return 1;
}

function verdictFor(city: CitySeed, projected: { days30: number; nights: number }): string {
  if (projected.days30 >= 50) {
    return `À ${city.name} en 2040 : ${projected.days30} jours > 30 °C attendus en moyenne — climat estival sévère, à intégrer dans une décision d'installation longue durée.`;
  }
  if (projected.days30 >= 30) {
    return `À ${city.name} en 2040 : ${projected.days30} jours > 30 °C — étés bien plus chauds qu'aujourd'hui, climatisation et adaptation du logement à prévoir.`;
  }
  if (projected.days30 >= 15) {
    return `À ${city.name} en 2040 : ${projected.days30} jours > 30 °C — climat encore tempéré mais hausse perceptible.`;
  }
  return `${city.name} reste relativement épargnée à horizon 2040 : ${projected.days30} jours > 30 °C estimés, dans la moyenne basse française.`;
}

export function projectClimate2040(city: CitySeed): ClimateProjection {
  const mr = MACRO_REGION_DELTAS[inferMacroRegion(city)];
  const currentJulyC = city.avgTempJuly;
  const projectedJulyC = currentJulyC != null ? Math.round((currentJulyC + mr.deltaJulyC) * 10) / 10 : null;
  const currentDays30C = currentDays30CFor(currentJulyC);
  const projectedDays30C = currentDays30C + mr.extraDays30C;
  const currentTropicalNights = currentTropicalNightsFor(currentJulyC);
  const projectedTropicalNights = currentTropicalNights + mr.extraTropicalNights;

  return {
    macroRegion: mr,
    currentJulyC,
    projectedJulyC,
    currentDays30C,
    projectedDays30C,
    currentTropicalNights,
    projectedTropicalNights,
    verdict: verdictFor(city, { days30: projectedDays30C, nights: projectedTropicalNights }),
  };
}
