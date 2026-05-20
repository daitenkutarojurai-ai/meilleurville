// F42 — Qualité de l'air par ville
//
// 4 dimensions évaluées depuis le seed (department, population, climat,
// characterTags). Aucune dépendance externe.
//
// Sources de référence (toutes publiques) :
//   - ATMO France (atmo-france.org) : indice de qualité de l'air national,
//     échelle 1-6 (bon → extrêmement mauvais), agrégeant NO2 / PM2.5 / O3 / SO2.
//   - Citepa (citepa.org) : inventaire national d'émissions, secteur résidentiel
//     (chauffage bois), transport (NO2 trafic), industrie (PM, SO2).
//   - RNSA (pollens.fr) : bulletin allergo-pollinique national, niveau de risque
//     par espèce et bassin (graminées, cyprès, bouleau, ambroisie, etc.).
//
// Tous les scores 0-10. 10 = exposition maximale.
// Composite = moyenne pondérée des 4 sous-scores.

import type { CitySeed } from "@/data/cities-seed";

export type AirLevel = "faible" | "modere" | "eleve" | "fort";

export interface AirDimension {
  /** 0-10, 10 = pollution maximale */
  score: number;
  level: AirLevel;
  /** Justification courte */
  reason: string;
}

export interface AirQuality {
  /** Composite 0-10 */
  composite: number;
  level: AirLevel;
  no2: AirDimension;       // dioxyde d'azote (trafic)
  pm25: AirDimension;      // particules fines (chauffage + industrie)
  ozone: AirDimension;     // photochimique (chaleur + soleil)
  pollen: AirDimension;    // allergo-pollinique
  /** Signature narrative pour résumé une-ligne */
  signature: string;
}

function levelFromScore(s: number): AirLevel {
  if (s >= 7.5) return "fort";
  if (s >= 5.5) return "eleve";
  if (s >= 3.5) return "modere";
  return "faible";
}

// ─── NO2 — dioxyde d'azote (trafic routier + diesel) ──────────────────────
//
// Heuristique : population × densité urbaine. Les grandes métropoles avec
// périphérique saturé dépassent régulièrement le seuil OMS 10 µg/m³ (annuel).
// Les communes péri-urbaines et rurales restent largement sous le seuil.
//
// Tag "métropole" + population > 200 000     → fort
// Tag "métropole" OU pop > 100 000          → élevé
// Pop > 50 000 OU axe autoroutier majeur    → modéré
// Sinon                                      → faible

const HIGHWAY_AXIS_DEPTS = new Set([
  // Couloirs routiers majeurs (A6, A7, A8, A10, A1, A4, A86)
  "Rhône", "Métropole de Lyon", "Bouches-du-Rhône", "Var",
  "Vaucluse", "Loiret", "Eure-et-Loir", "Oise",
  "Seine-Saint-Denis", "Hauts-de-Seine", "Val-de-Marne", "Val-d'Oise",
]);

function no2Risk(city: CitySeed): AirDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole|métropolitaine/.test(tags);
  const isParis = city.department === "Paris";
  const onMajorAxis = HIGHWAY_AXIS_DEPTS.has(city.department);

  if (isParis || (isMetro && pop > 200_000)) {
    return {
      score: 8.5,
      level: "fort",
      reason: "Grande métropole avec trafic dense — NO2 annuel régulièrement au-dessus du seuil OMS 10 µg/m³, surtout aux abords des axes saturés.",
    };
  }
  if (isMetro || pop > 100_000) {
    return {
      score: 6.5,
      level: "eleve",
      reason: "Ville importante avec circulation soutenue — NO2 régulièrement au-dessus du seuil OMS, pics en heure de pointe et l'hiver.",
    };
  }
  if (pop > 50_000 || onMajorAxis) {
    return {
      score: 4.5,
      level: "modere",
      reason: onMajorAxis
        ? "Trafic urbain modéré + couloir autoroutier majeur dans le département (NO2 ponctuellement élevé près des axes)."
        : "Trafic urbain modéré, NO2 globalement sous le seuil OMS sauf en bordure d'axes.",
    };
  }
  return {
    score: 2,
    level: "faible",
    reason: "Trafic limité, NO2 très en-dessous des seuils OMS. Exposition très faible.",
  };
}

// ─── PM2.5 — particules fines (chauffage bois + industrie + diesel) ───────
//
// Heuristique combinée :
//   - Hiver froid + caractère rural ou semi-rural → chauffage bois domestique
//     est la 1ʳᵉ source de PM2.5 en France (CITEPA : 50 % du total national).
//   - Vallée encaissée (vallée du Rhône, vallée de l'Arve, Chambéry, Grenoble)
//     → inversion thermique hivernale, accumulation des particules.
//   - Industrie lourde (Hauts-de-France, Moselle, Bouches-du-Rhône littoral
//     Fos-sur-Mer, Loire Saint-Étienne) → émissions chroniques.
//   - Grandes villes → diesel + chauffage urbain.

const INDUSTRIAL_DEPTS = new Set([
  "Nord", "Pas-de-Calais", "Moselle", "Meurthe-et-Moselle",
  "Bouches-du-Rhône", "Loire", "Seine-Maritime", "Calvados",
  "Isère", // bassin grenoblois
]);

const VALLEY_INVERSION_DEPTS = new Set([
  // Vallées encaissées sujettes à l'inversion thermique hivernale
  "Haute-Savoie", "Savoie", "Isère", "Rhône", "Métropole de Lyon",
  "Drôme", "Ardèche", "Vaucluse",
]);

function pm25Risk(city: CitySeed): AirDimension {
  const pop = city.population ?? 0;
  const tj = city.avgTempJanuary ?? 5;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isRural = /rural|villageois|campagne/.test(tags);
  const isIndustrial = INDUSTRIAL_DEPTS.has(city.department);
  const isValley = VALLEY_INVERSION_DEPTS.has(city.department);
  const coldWinter = tj < 4;
  const isMetro = /métropole/.test(tags) || pop > 200_000;

  // Vallée encaissée + hiver froid = pire combinaison
  if (isValley && coldWinter) {
    return {
      score: 8.5,
      level: "fort",
      reason: "Vallée encaissée + hiver froid — inversion thermique hivernale piège chauffage bois et diesel. Pics PM2.5 récurrents décembre-février.",
    };
  }
  if (isIndustrial && isMetro) {
    return {
      score: 7.5,
      level: "fort",
      reason: "Département à fort héritage industriel + grande agglomération — sources cumulées (industrie, trafic, chauffage urbain).",
    };
  }
  if (isIndustrial || (isRural && coldWinter)) {
    return {
      score: 6,
      level: "eleve",
      reason: isIndustrial
        ? "Département à fort héritage industriel — émissions chroniques PM2.5, dépassements ponctuels du seuil OMS 5 µg/m³ annuel."
        : "Zone semi-rurale à hiver froid — chauffage bois domestique = 1ʳᵉ source de PM2.5 en France (CITEPA).",
    };
  }
  if (isMetro) {
    return {
      score: 5.5,
      level: "eleve",
      reason: "Grande agglomération — diesel + chauffage urbain, PM2.5 souvent au-dessus du seuil OMS 5 µg/m³.",
    };
  }
  if (coldWinter || pop > 50_000) {
    return {
      score: 4,
      level: "modere",
      reason: "Exposition PM2.5 modérée — chauffage hivernal et trafic urbain contribuent ponctuellement.",
    };
  }
  return {
    score: 2,
    level: "faible",
    reason: "PM2.5 globalement basses — pas d'industrie lourde, hiver doux limitant le chauffage bois, ventilation atmosphérique correcte.",
  };
}

// ─── Ozone — pic photochimique estival ────────────────────────────────────
//
// L'ozone troposphérique se forme par réaction photochimique COV + NOx sous
// soleil chaud. Les pics estivaux sont systématiques sur l'arc méditerranéen,
// la vallée du Rhône, et la plaine bordelaise. Très peu présent en hiver ou
// sous climat océanique humide.

function ozoneRisk(city: CitySeed): AirDimension {
  const tj = city.avgTempJuly ?? 21;
  const sun = city.sunshinedays ?? 1900;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMed = /méditerran|provence|côte d'azur|languedoc/.test(tags) ||
    ["Bouches-du-Rhône", "Var", "Alpes-Maritimes", "Vaucluse", "Hérault", "Gard", "Pyrénées-Orientales", "Aude", "Corse-du-Sud", "Haute-Corse"].includes(city.department);
  const isRhoneCorridor = ["Vaucluse", "Drôme", "Ardèche", "Rhône", "Métropole de Lyon", "Loire", "Isère"].includes(city.department);

  if (isMed && tj >= 22 && sun >= 2400) {
    return {
      score: 8.5,
      level: "fort",
      reason: "Arc méditerranéen chaud et très ensoleillé — pics d'ozone estivaux récurrents (juin-août), seuil information ATMO régulièrement franchi.",
    };
  }
  if (isMed || (isRhoneCorridor && tj >= 21)) {
    return {
      score: 7,
      level: "eleve",
      reason: isMed
        ? "Climat méditerranéen — ozone élevé l'été lors des épisodes anticycloniques."
        : "Vallée du Rhône — corridor classique pour les pics d'ozone estivaux (cumul COV + NOx + chaleur).",
    };
  }
  if (sun >= 2200 && tj >= 21) {
    return {
      score: 5.5,
      level: "eleve",
      reason: `Été chaud (${tj.toFixed(1)} °C) et ensoleillé (${Math.round(sun / 9.5)} j/an) — pics d'ozone ponctuels lors des canicules.`,
    };
  }
  if (sun >= 1900) {
    return {
      score: 3.5,
      level: "modere",
      reason: "Pics d'ozone réservés aux étés exceptionnels, rares dépassements de seuils.",
    };
  }
  return {
    score: 1.5,
    level: "faible",
    reason: "Climat océanique ou océanique dégradé — ozone troposphérique structurellement bas, pics très rares.",
  };
}

// ─── Pollens — risque allergo-pollinique (RNSA) ───────────────────────────
//
// Approche par bassin :
//   - Cyprès            → arc méditerranéen, pic février-avril, très allergisant
//   - Graminées         → toute la France, pic mai-juillet ; plus fort en zones
//                         agricoles ouvertes (Bassin Parisien, Centre, Beauce,
//                         Picardie, plaines du Sud-Ouest)
//   - Bouleau           → moitié nord, pic avril ; régions très boisées feuillus
//   - Ambroisie         → vallée du Rhône (forte), Bourgogne, IDF (en expansion)
//   - Olivier           → Méditerranée (cohabite avec cyprès, niveau modéré)
//
// On scoring : présence d'un grand allergisant → score élevé, cumul → fort.

const CYPRESS_BASIN_DEPTS = new Set([
  "Bouches-du-Rhône", "Var", "Alpes-Maritimes", "Vaucluse", "Hérault",
  "Gard", "Pyrénées-Orientales", "Aude", "Corse-du-Sud", "Haute-Corse",
  "Drôme", "Ardèche",
]);

const AMBROSIA_DEPTS = new Set([
  "Rhône", "Métropole de Lyon", "Drôme", "Ardèche", "Isère", "Loire",
  "Saône-et-Loire", "Allier", "Puy-de-Dôme",
]);

const GRASSES_OPEN_DEPTS = new Set([
  "Eure-et-Loir", "Loiret", "Loir-et-Cher", "Yonne", "Aube", "Marne",
  "Aisne", "Oise", "Somme", "Seine-et-Marne", "Indre", "Cher",
  "Charente", "Charente-Maritime", "Vienne", "Deux-Sèvres", "Gers",
  // Bouleau — façade Nord-Ouest documentée par le RNSA (forêts feuillus)
  "Finistère", "Côtes-d'Armor", "Morbihan", "Ille-et-Vilaine",
  "Calvados", "Manche", "Orne", "Seine-Maritime", "Eure",
]);

function pollenRisk(city: CitySeed): AirDimension {
  const d = city.department;
  const isCypress = CYPRESS_BASIN_DEPTS.has(d);
  const isAmbrosia = AMBROSIA_DEPTS.has(d);
  const isGrass = GRASSES_OPEN_DEPTS.has(d);

  const stacks: string[] = [];
  if (isCypress) stacks.push("cyprès (fév-avr)");
  if (isAmbrosia) stacks.push("ambroisie (août-oct)");
  if (isGrass) stacks.push("graminées (mai-juil)");

  if (stacks.length >= 2) {
    return {
      score: 8,
      level: "fort",
      reason: `Cumul de bassins allergisants : ${stacks.join(", ")}. Plusieurs pics RNSA dans l'année.`,
    };
  }
  if (isCypress || isAmbrosia) {
    return {
      score: 6.5,
      level: "eleve",
      reason: isCypress
        ? "Bassin du cyprès — pic majeur février-avril, l'un des pollens les plus allergisants en France."
        : "Vallée du Rhône — ambroisie en forte expansion, pic août-octobre, déclarée espèce nuisible à la santé.",
    };
  }
  if (isGrass) {
    return {
      score: 5.5,
      level: "eleve",
      reason: "Plaine agricole ouverte — pic graminées mai-juillet soutenu, allergie saisonnière fréquente.",
    };
  }
  return {
    score: 3.5,
    level: "modere",
    reason: "Pas de grand bassin allergisant dominant. Risque pollinique surtout saisonnier (graminées en mai-juin, bouleau en avril).",
  };
}

// ─── Composite ────────────────────────────────────────────────────────────

function composeSignature(a: AirQuality, name: string): string {
  const tops = [
    { k: "NO2 trafic", d: a.no2 },
    { k: "particules fines", d: a.pm25 },
    { k: "ozone estival", d: a.ozone },
    { k: "pollens", d: a.pollen },
  ]
    .filter((x) => x.d.level === "fort" || x.d.level === "eleve")
    .sort((a, b) => b.d.score - a.d.score);

  if (tops.length === 0) {
    return `${name} bénéficie d'un air globalement propre — peu d'expositions majeures sur les 4 dimensions ATMO.`;
  }
  if (tops.length === 1) {
    return `${name} est principalement exposée au facteur « ${tops[0].k} » (${tops[0].d.level}).`;
  }
  return `${name} cumule plusieurs pressions sur la qualité de l'air : ${tops.slice(0, 2).map((t) => `${t.k} (${t.d.level})`).join(", ")}.`;
}

export function computeAirQuality(city: CitySeed): AirQuality {
  const no2 = no2Risk(city);
  const pm25 = pm25Risk(city);
  const ozone = ozoneRisk(city);
  const pollen = pollenRisk(city);
  // Pondération : PM2.5 30 % (impact sanitaire le plus documenté), NO2 25 %,
  // ozone 25 %, pollens 20 %. PM2.5 et NO2 sont les deux indicateurs OMS de
  // référence en mortalité prématurée.
  const composite =
    Math.round(
      (pm25.score * 0.3 + no2.score * 0.25 + ozone.score * 0.25 + pollen.score * 0.2) * 10
    ) / 10;
  const out: AirQuality = {
    composite,
    level: levelFromScore(composite),
    no2,
    pm25,
    ozone,
    pollen,
    signature: "",
  };
  out.signature = composeSignature(out, city.name);
  return out;
}

export const AIR_LEVEL_LABEL: Record<AirLevel, string> = {
  faible: "Faible",
  modere: "Modéré",
  eleve: "Élevé",
  fort: "Fort",
};

export const AIR_LEVEL_COLOR: Record<AirLevel, string> = {
  faible: "text-emerald-600",
  modere: "text-amber-600",
  eleve: "text-orange-600",
  fort: "text-red-600",
};

export const AIR_LEVEL_BG: Record<AirLevel, string> = {
  faible: "bg-emerald-50 border-emerald-200",
  modere: "bg-amber-50 border-amber-200",
  eleve: "bg-orange-50 border-orange-200",
  fort: "bg-red-50 border-red-200",
};
