// F42 — Qualité de l'air par ville
//
// 4 dimensions. Depuis le 2026-11-04, trois sont MESURÉES quand la commune a
// une station de fond urbaine ou périurbaine à moins de AIR_MEASURED_MAX_KM
// (data/city-air-light.json, projection de data/city-air.json — F63) :
//   - NO2 : moyenne annuelle en µg/m³ ;
//   - PM2.5 : moyenne annuelle en µg/m³ ;
//   - ozone : jours où la moyenne glissante sur 8 h a dépassé 120 µg/m³.
// Mêmes stations et même règle que le classement mesuré
// (lib/air-measured-ranking.ts, RANK_MAX_KM) : une station rurale mesure la
// campagne, pas la ville. Les barèmes (`*_SCALE`) sont calés sur le seuil OMS
// 2021 et les limites européennes 2030. Les pollens restent ESTIMÉS (bassins
// RNSA), et sans station éligible une dimension retombe sur son palier estimé
// (`*Model`) — ce qui dit la page, dimension par dimension (`measured`).
//
// ⚠️ Ce module est tiré dans le bundle client (PersonalSynthesisQuiz,
// PersonalQolQuiz via lib/city-synthesis et lib/quality-of-life-index) : il lit
// la projection de 28 Ko, jamais data/city-air.json (340 Ko, noms de stations).
//
// Cadres de référence des paliers estimés (toutes publiques) :
//   - ATMO France (atmo-france.org) : indice de qualité de l'air national,
//     échelle 1-6 (bon → extrêmement mauvais), agrégeant NO2 / PM2.5 / O3 / SO2.
//   - Citepa (citepa.org) : inventaire national d'émissions, secteur résidentiel
//     (chauffage bois), transport (NO2 trafic), industrie (PM, SO2).
//   - RNSA (pollens.fr) : bulletin allergo-pollinique national, niveau de risque
//     par espèce et bassin (graminées, cyprès, bouleau, ambroisie, etc.).
//
// **Convention** : tous les scores 0-10, 10 = exposition maximale (le moteur
// mesure la pollution). Mais les surfaces s'appellent « Qualité de l'air »,
// c'est-à-dire une QUALITÉ : elles affichent donc `10 - score` et annoncent
// « 10 = air le plus pur ». L'inversion se fait au site d'affichage seulement —
// tris, niveaux et classements gardent la valeur brute.
// Composite = moyenne pondérée des 4 sous-scores. Les mesures sont des
// valeurs brutes (µg/m³, jours) affichées telles quelles ; seul le sous-score
// qui en dérive suit la convention ci-dessus.

import type { CityLight } from "@/lib/cities-light";
import airLight from "@/data/city-air-light.json";

export type AirLevel = "faible" | "modere" | "eleve" | "fort";

export interface AirMeasuredValue {
  /** Moyenne annuelle (µg/m³) ou, pour l'ozone, nombre de jours. */
  value: number;
  unit: "µg/m³" | "jours";
  /** Distance à la station de fond, km. */
  distanceKm: number;
  year: number;
}

export interface AirDimension {
  /** 0-10, 10 = pollution maximale */
  score: number;
  level: AirLevel;
  /** Justification courte */
  reason: string;
  /** Relevé en station dont le score dérive ; null = palier estimé. */
  measured: AirMeasuredValue | null;
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
  /** Dimensions tirées d'une mesure en station (0 à 3 ; les pollens jamais). */
  measuredCount: number;
}

/** Palier estimé, avant qu'on lui adjoigne `measured: null`. */
type ModelDim = Omit<AirDimension, "measured">;

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

function no2Model(city: CityLight): ModelDim {
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

function pm25Model(city: CityLight): ModelDim {
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

function ozoneModel(city: CityLight): ModelDim {
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

function pollenRisk(city: CityLight): ModelDim {
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

// ─── Mesures en station (F63) ────────────────────────────────────────────
//
// Barèmes linéaires par morceaux, valeur mesurée → sous-score 0-10 (10 = pire),
// calés sur les repères réglementaires et lus sur les niveaux ci-dessus
// (faible < 3,5 ≤ modéré < 5,5 ≤ élevé < 7,5 ≤ fort) :
//   NO2   : OMS 10 µg/m³ → 3,5 (début « modéré ») ; limite UE 2030 20 → 7,5 (« fort »).
//   PM2.5 : OMS 5 → 1,5 ; limite UE 2030 10 → 5,5 (« élevé ») ; 15 → 9.
//           Presque toute la France dépasse l'OMS : le barème départage au-dessus.
//   Ozone : 10 jours → 3,5 ; valeur cible UE 25 jours → 7,5 (« fort »).
// Corpus 2025 (stations éligibles) : NO2 1,6-23,4 µg/m³, PM2.5 4,0-13,1, ozone
// 0-46 jours. Une seule année : l'ozone dépend de l'été (la valeur cible UE est
// une moyenne sur trois ans), ce que dit la justification.

/** Même seuil que RANK_MAX_KM (lib/air-measured-ranking.ts) — garde integrity. */
export const AIR_MEASURED_MAX_KM = 10;
export const AIR_MEASURED_YEAR: number = airLight.year;

type LightRow = Partial<Record<"no2" | "pm25" | "o3", [number, number]>>;
const LIGHT = airLight.cities as unknown as Record<string, LightRow>;

const NO2_SCALE: Array<[number, number]> = [[0, 0], [5, 1.5], [10, 3.5], [20, 7.5], [30, 10]];
const PM25_SCALE: Array<[number, number]> = [[0, 0], [5, 1.5], [10, 5.5], [15, 9], [20, 10]];
const O3_SCALE: Array<[number, number]> = [[0, 0.5], [10, 3.5], [25, 7.5], [40, 10]];

function onScale(x: number, pts: Array<[number, number]>): number {
  let y = pts[pts.length - 1][1];
  if (x <= pts[0][0]) y = pts[0][1];
  else {
    for (let i = 1; i < pts.length; i++) {
      if (x <= pts[i][0]) {
        const [x0, y0] = pts[i - 1];
        const [x1, y1] = pts[i];
        y = y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
        break;
      }
    }
  }
  return Math.round(y * 10) / 10;
}

const fr1 = (n: number) => n.toFixed(1).replace(".", ",");
const km = (d: number) => (d < 1 ? `${fr1(d)} km` : `${Math.round(d)} km`);

function measure(slug: string, p: "no2" | "pm25" | "o3"): AirMeasuredValue | null {
  const m = LIGHT[slug]?.[p];
  if (!m || m[1] > AIR_MEASURED_MAX_KM) return null;
  return { value: m[0], unit: p === "o3" ? "jours" : "µg/m³", distanceKm: m[1], year: AIR_MEASURED_YEAR };
}

function station(m: AirMeasuredValue): string {
  return `station de fond la plus proche, à ${km(m.distanceKm)}`;
}

function no2Measured(m: AirMeasuredValue): AirDimension {
  const score = onScale(m.value, NO2_SCALE);
  const vs =
    m.value <= 10 ? "sous le seuil OMS de 10 µg/m³"
    : m.value <= 20 ? "au-dessus du seuil OMS (10 µg/m³), sous la limite européenne 2030 (20 µg/m³)"
    : "au-dessus de la limite européenne 2030 (20 µg/m³)";
  return {
    score,
    level: levelFromScore(score),
    reason: `Mesuré : ${fr1(m.value)} µg/m³ en moyenne ${m.year} (${station(m)}), ${vs}. Le long des grands axes, la valeur est plus forte.`,
    measured: m,
  };
}

function pm25Measured(m: AirMeasuredValue): AirDimension {
  const score = onScale(m.value, PM25_SCALE);
  const vs =
    m.value <= 5 ? "au niveau du seuil OMS de 5 µg/m³"
    : m.value <= 10 ? "au-dessus du seuil OMS (5 µg/m³), sous la limite européenne 2030 (10 µg/m³)"
    : "au-dessus de la limite européenne 2030 (10 µg/m³)";
  return {
    score,
    level: levelFromScore(score),
    reason: `Mesuré : ${fr1(m.value)} µg/m³ en moyenne ${m.year} (${station(m)}), ${vs}.`,
    measured: m,
  };
}

function ozoneMeasured(m: AirMeasuredValue): AirDimension {
  const score = onScale(m.value, O3_SCALE);
  const n = Math.round(m.value);
  const days = n === 0 ? "aucun jour" : n === 1 ? "1 jour" : `${n} jours`;
  return {
    score,
    level: levelFromScore(score),
    reason: `Mesuré : ${days} en ${m.year} au-dessus de 120 µg/m³ sur 8 heures (${station(m)}). La valeur cible européenne en tolère 25 par an, en moyenne sur trois ans : une seule année dépend beaucoup de l'été.`,
    measured: m,
  };
}

const estimated = (d: ModelDim): AirDimension => ({ ...d, measured: null });

// ─── Composite ────────────────────────────────────────────────────────────

const SIGNATURE_LEVEL: Record<AirLevel, string> = {
  faible: "faible",
  modere: "modéré",
  eleve: "élevé",
  fort: "fort",
};

function composeSignature(a: AirQuality, name: string): string {
  const tops = [
    { k: "NO2", d: a.no2 },
    { k: "particules fines", d: a.pm25 },
    { k: "ozone estival", d: a.ozone },
    { k: "pollens", d: a.pollen },
  ]
    .filter((x) => x.d.level === "fort" || x.d.level === "eleve")
    .sort((a, b) => b.d.score - a.d.score);

  if (tops.length === 0) {
    return `${name} bénéficie d'un air globalement propre — pas d'exposition élevée sur les quatre dimensions suivies.`;
  }
  if (tops.length === 1) {
    return `${name} est principalement exposée au facteur « ${tops[0].k} » (niveau ${SIGNATURE_LEVEL[tops[0].d.level]}).`;
  }
  return `${name} cumule plusieurs pressions sur la qualité de l'air : ${tops.slice(0, 2).map((t) => `${t.k} (${SIGNATURE_LEVEL[t.d.level]})`).join(", ")}.`;
}

export function computeAirQuality(city: CityLight): AirQuality {
  const mNo2 = measure(city.slug, "no2");
  const mPm25 = measure(city.slug, "pm25");
  const mO3 = measure(city.slug, "o3");
  const no2 = mNo2 ? no2Measured(mNo2) : estimated(no2Model(city));
  const pm25 = mPm25 ? pm25Measured(mPm25) : estimated(pm25Model(city));
  const ozone = mO3 ? ozoneMeasured(mO3) : estimated(ozoneModel(city));
  const pollen = estimated(pollenRisk(city));
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
    measuredCount: [no2, pm25, ozone].filter((d) => d.measured).length,
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
