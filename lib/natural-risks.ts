// F40 — Risques naturels par ville
//
// 4 dimensions de risque évaluées de manière déterministe depuis le seed
// (lat/lon, dept, elevation, characterTags). Aucune donnée externe.
//
// Sources de référence (toutes documentées, accessibles publiquement) :
//   - Sismicité   : zonage réglementaire BCSF/MTE (zones 1 à 5 par commune,
//                   en pratique stable par département). Décret 2010-1255.
//   - Argile      : aléa retrait-gonflement BRGM (faible/moyen/fort par dept).
//                   Carte aléa argile.gouv.fr/donnees.
//   - Feux        : massifs forestiers à risque (entente ECASC + ONF).
//                   PACA, Corse, Languedoc, Aquitaine landes.
//   - Inondation  : proxy depuis (1) seed.characterTags contenant un fleuve
//                   majeur (Seine, Rhône, Loire, Garonne, Marne, Saône, Adour,
//                   Charente, Dordogne, Var, Aude…) + (2) elevation < 50m +
//                   (3) littoral (lat/lon en bord de mer).
//
// Tous les scores sont sur 0-10. Composite = moyenne pondérée des 4.
// La page reste TAGGÉE comme synthèse pédagogique — pour un PPRI précis
// l'utilisateur doit consulter Géorisques (lien sortant).

import type { CityLight } from "@/lib/cities-light";

export type RiskLevel = "faible" | "modere" | "eleve" | "fort";

export interface RiskDimension {
  /** 0-10, 10 = risque maximal */
  score: number;
  level: RiskLevel;
  /** Justification courte */
  reason: string;
}

export interface NaturalRisks {
  /** Composite 0-10 */
  composite: number;
  level: RiskLevel;
  flood: RiskDimension;
  seismic: RiskDimension;
  clay: RiskDimension;
  wildfire: RiskDimension;
  /** Signature narrative pour résumé une-ligne */
  signature: string;
}

function levelFromScore(s: number): RiskLevel {
  if (s >= 7.5) return "fort";
  if (s >= 5.5) return "eleve";
  if (s >= 3.5) return "modere";
  return "faible";
}

// ─── Sismicité (zonage 2011, stable depuis) ───────────────────────────────
//
// Zone 5 (forte)        → Antilles uniquement
// Zone 4 (moyenne)      → Alpes-Maritimes (06), Pyrénées-Orientales (66)*,
//                         Hautes-Pyrénées (65)*, Pyrénées-Atlantiques (64)*,
//                         partiellement Hautes-Alpes (05)
//   * sud du département seulement
// Zone 3 (modérée)      → arc alpin (Savoie, Haute-Savoie, Isère, Drôme),
//                         arc pyrénéen, Alsace, Var, partie sud-est Vaucluse
// Zone 2 (faible)       → Bourgogne-Franche-Comté est, Rhône-Alpes ouest,
//                         Provence intérieure, Languedoc, Pays Basque, etc.
// Zone 1 (très faible)  → reste de la France (bassin parisien, Bretagne,
//                         Normandie, Hauts-de-France, Centre, Aquitaine
//                         centrale, Massif Central, etc.)

const SEISMIC_ZONE: Record<string, number> = {
  // Zone 5 — DROM Antilles
  Guadeloupe: 5,
  Martinique: 5,
  // Zone 4 — Pyrénées-Atlantique sud + Alpes-Maritimes
  "Alpes-Maritimes": 4,
  "Pyrénées-Atlantiques": 4,
  "Hautes-Pyrénées": 4,
  // Zone 3 — arc alpin + arc pyrénéen + Alsace + Var
  "Haute-Savoie": 3,
  Savoie: 3,
  Isère: 3,
  "Hautes-Alpes": 3,
  "Alpes-de-Haute-Provence": 3,
  Drôme: 3,
  Ardèche: 3,
  Var: 3,
  Vaucluse: 3,
  "Pyrénées-Orientales": 3,
  Ariège: 3,
  "Haute-Garonne": 3,
  Gers: 3,
  Landes: 3,
  "Bas-Rhin": 3,
  "Haut-Rhin": 3,
  // Zone 2 — extérieur arcs sismiques
  Ain: 2,
  Rhône: 2,
  "Métropole de Lyon": 2,
  Doubs: 2,
  Jura: 2,
  "Bouches-du-Rhône": 2,
  Hérault: 2,
  Aude: 2,
  Tarn: 2,
  "Tarn-et-Garonne": 2,
  "Lot-et-Garonne": 2,
  Dordogne: 2,
  "Haute-Saône": 2,
  "Territoire de Belfort": 2,
  Moselle: 2,
  "Meurthe-et-Moselle": 2,
  Vosges: 2,
  "Corse-du-Sud": 2,
  "Haute-Corse": 2,
  "Haute-Loire": 2,
  // DROM Réunion + Mayotte + Guyane (Mayotte zone 3 depuis 2018)
  Réunion: 2,
  "La Réunion": 2,
  Mayotte: 3,
  Guyane: 1,
  // Tout le reste → zone 1 (très faible) par défaut
};

const SEISMIC_SCORE: Record<number, number> = { 1: 1.5, 2: 3.5, 3: 6, 4: 8, 5: 9.5 };
const SEISMIC_LABEL: Record<number, string> = {
  1: "Zone 1 — très faible (bassin parisien, Bretagne, Normandie, etc.)",
  2: "Zone 2 — faible (Provence intérieure, Languedoc, etc.)",
  3: "Zone 3 — modérée (arcs alpin et pyrénéen, Alsace, Var)",
  4: "Zone 4 — moyenne (Pyrénées-Atlantiques, Alpes-Maritimes)",
  5: "Zone 5 — forte (Antilles)",
};

function seismicRisk(city: CityLight): RiskDimension {
  const zone = SEISMIC_ZONE[city.department] ?? 1;
  const score = SEISMIC_SCORE[zone];
  return { score, level: levelFromScore(score), reason: SEISMIC_LABEL[zone] };
}

// ─── Retrait-gonflement des argiles (BRGM) ────────────────────────────────
//
// Aléa fort   → Bassin parisien sud (77, 91, 78), Loiret, Yonne, Cher, Indre,
//               Charente, Charente-Maritime, Lot-et-Garonne, Tarn-et-Garonne,
//               Gers, Lot, Dordogne, Vaucluse, Drôme sud
// Aléa moyen  → reste du bassin parisien, Picardie, Beauce, Touraine, Anjou,
//               Bordelais, Languedoc intérieur, Provence
// Aléa faible → massifs (Alpes, Pyrénées, Massif Central, Vosges, Jura),
//               Bretagne, Cotentin, Lorraine plateau, Ardennes

const CLAY_HIGH_DEPTS = new Set([
  "Seine-et-Marne", "Essonne", "Yvelines", "Val-d'Oise", "Val-de-Marne",
  "Loiret", "Eure-et-Loir", "Yonne", "Cher", "Indre", "Loir-et-Cher",
  "Charente", "Charente-Maritime", "Lot-et-Garonne", "Tarn-et-Garonne",
  "Gers", "Lot", "Dordogne", "Vaucluse", "Aude",
]);

const CLAY_MED_DEPTS = new Set([
  "Paris", "Hauts-de-Seine", "Seine-Saint-Denis", "Oise", "Aisne", "Somme",
  "Eure", "Calvados", "Sarthe", "Maine-et-Loire", "Indre-et-Loire",
  "Deux-Sèvres", "Vienne", "Haute-Vienne", "Corrèze", "Allier",
  "Gironde", "Landes", "Bouches-du-Rhône", "Var", "Hérault", "Gard", "Drôme",
  "Tarn", "Haute-Garonne", "Ariège",
]);

function clayRisk(city: CityLight): RiskDimension {
  const d = city.department;
  if (CLAY_HIGH_DEPTS.has(d)) {
    return {
      score: 8,
      level: "fort",
      reason: "Aléa fort (BRGM) — argiles gonflantes répandues. Fissures sur maisons sans fondations adaptées après sécheresse.",
    };
  }
  if (CLAY_MED_DEPTS.has(d)) {
    return {
      score: 5.5,
      level: "eleve",
      reason: "Aléa moyen (BRGM) — argiles ponctuelles. Sécheresses récentes ont aggravé les sinistres.",
    };
  }
  return {
    score: 2,
    level: "faible",
    reason: "Aléa faible (BRGM) — sols majoritairement non argileux (massif, granit, calcaire).",
  };
}

// ─── Feux de forêt (zone défense ECASC + statistiques ONF) ────────────────
//
// Risque fort    → Corse, Var, Alpes-Maritimes, Bouches-du-Rhône, Vaucluse,
//                  Aude, Hérault, Pyrénées-Orientales, Gard, Lozère,
//                  Alpes-de-Haute-Provence, Hautes-Alpes
// Risque élevé   → Drôme, Ardèche, Hautes-Pyrénées, Pyrénées-Atlantiques sud,
//                  Landes (massif forestier des Landes de Gascogne)
// Risque modéré  → Tarn, Aveyron, Lot, Dordogne, Gironde (massifs forestiers),
//                  Charente sud
// Risque faible  → reste de la France (climat humide, sols)

const FIRE_HIGH = new Set([
  "Corse-du-Sud", "Haute-Corse", "Var", "Alpes-Maritimes", "Bouches-du-Rhône",
  "Vaucluse", "Aude", "Hérault", "Pyrénées-Orientales", "Gard", "Lozère",
  "Alpes-de-Haute-Provence", "Hautes-Alpes",
]);
const FIRE_MED = new Set([
  "Drôme", "Ardèche", "Hautes-Pyrénées", "Pyrénées-Atlantiques",
  "Landes", "Gironde", "Dordogne", "Lot", "Aveyron", "Tarn",
]);

function wildfireRisk(city: CityLight): RiskDimension {
  const d = city.department;
  if (FIRE_HIGH.has(d)) {
    return {
      score: 8.5,
      level: "fort",
      reason: "Massif méditerranéen sec — feux de forêt fréquents l'été. Débroussaillement obligatoire (OLD) dans 50 m.",
    };
  }
  if (FIRE_MED.has(d)) {
    return {
      score: 5.5,
      level: "eleve",
      reason: "Massif forestier exposé en été. Vigilance feu de forêt activée régulièrement entre juillet et septembre.",
    };
  }
  return {
    score: 1.5,
    level: "faible",
    reason: "Climat humide ou océanique — risque feu de forêt limité aux étés exceptionnels.",
  };
}

// ─── Inondation (proxy PPRI) ──────────────────────────────────────────────
//
// Pas de Géorisques en ligne ; on infère à partir de characterTags du seed :
// présence d'un fleuve/rivière majeure + elevation basse.

const RIVER_TAGS = new Set([
  "Seine", "Rhône", "Loire", "Garonne", "Marne", "Saône", "Adour", "Charente",
  "Dordogne", "Lot", "Tarn", "Aude", "Allier", "Cher", "Doubs", "Yonne",
  "Oise", "Aisne", "Somme", "Meuse", "Moselle", "Sambre", "Ill", "Var",
  "Drac", "Arve", "Hérault", "Isère", "Ardèche", "Durance", "Ariège", "Orne",
  "Eure", "Vienne", "Creuse",
]);

// Match exact-word against each tag, not substring on the joined string —
// sinon "Var" matche "Vars", "Cher" matche "Cherbourg", "Aude" matche
// "Audenge", "Lot" matche "Lot-et-Garonne", etc.
function tagsMatchAny(tags: string[], terms: Set<string>): boolean {
  for (const tag of tags) {
    for (const word of tag.split(/[\s,/'-]+/)) {
      if (terms.has(word)) return true;
    }
  }
  return false;
}

const COASTAL_LAT_LON_TAGS = ["mer", "plage", "atlantique", "méditerranée", "manche", "lagon", "côte", "littoral", "estuaire", "bord de mer", "îles", "presqu'île"];

function floodRisk(city: CityLight): RiskDimension {
  const tags = city.characterTags ?? [];
  const lc = tags.join(" ").toLowerCase();
  const hasRiver = tagsMatchAny(tags, RIVER_TAGS);
  const coastal = COASTAL_LAT_LON_TAGS.some((t) => lc.includes(t));
  const low = (city.elevation ?? 100) < 30;
  const veryLow = (city.elevation ?? 100) < 10;

  // PPRI fort : grand fleuve + basse altitude OU littoral très bas
  if ((hasRiver && veryLow) || (coastal && veryLow)) {
    return {
      score: 8,
      level: "fort",
      reason: `PPRI probable — ${hasRiver ? "fleuve majeur dans la commune" : "littoral bas"}, altitude ${city.elevation} m. Submersion ou crue centennale documentée.`,
    };
  }
  if (hasRiver && low) {
    return {
      score: 6,
      level: "eleve",
      reason: `Fleuve majeur dans la commune (${city.elevation} m d'altitude). Zones inondables probables ; consulter le PPRI sur Géorisques.`,
    };
  }
  if (hasRiver || coastal) {
    return {
      score: 4,
      level: "modere",
      reason: hasRiver
        ? "Présence d'un cours d'eau notable. Zones inondables limitées aux abords directs ; consulter le PPRI."
        : "Commune littorale — vigilance submersion marine sur les bas terrains.",
    };
  }
  if (low) {
    return {
      score: 3,
      level: "modere",
      reason: `Altitude basse (${city.elevation} m). Pas de fleuve majeur identifié dans la fiche, mais vérifier le ruissellement local.`,
    };
  }
  return {
    score: 1,
    level: "faible",
    reason: "Pas de fleuve majeur dans la fiche, altitude correcte. Risque inondation très limité.",
  };
}

// ─── Composite ────────────────────────────────────────────────────────────

function composeSignature(r: NaturalRisks, name: string): string {
  const tops = [
    { k: "inondation", d: r.flood },
    { k: "sismicité", d: r.seismic },
    { k: "argile", d: r.clay },
    { k: "feu de forêt", d: r.wildfire },
  ]
    .filter((x) => x.d.level === "fort" || x.d.level === "eleve")
    .sort((a, b) => b.d.score - a.d.score);

  if (tops.length === 0) {
    return `${name} cumule peu de risques naturels majeurs — profil tranquille sur les 4 grands aléas.`;
  }
  if (tops.length === 1) {
    return `${name} est principalement exposée au risque ${tops[0].k} (${tops[0].d.level}).`;
  }
  return `${name} cumule plusieurs risques notables : ${tops.slice(0, 2).map((t) => `${t.k} (${t.d.level})`).join(", ")}.`;
}

export function computeNaturalRisks(city: CityLight): NaturalRisks {
  const flood = floodRisk(city);
  const seismic = seismicRisk(city);
  const clay = clayRisk(city);
  const wildfire = wildfireRisk(city);
  // Pondération : inondation 35 %, argile 25 %, feu 20 %, sismicité 20 %
  // L'inondation est la plus fréquemment matérialisée en sinistre habitation.
  const composite =
    Math.round(
      (flood.score * 0.35 + clay.score * 0.25 + wildfire.score * 0.2 + seismic.score * 0.2) * 10
    ) / 10;
  const out: NaturalRisks = {
    composite,
    level: levelFromScore(composite),
    flood,
    seismic,
    clay,
    wildfire,
    signature: "",
  };
  out.signature = composeSignature(out, city.name);
  return out;
}

export const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
  faible: "Faible",
  modere: "Modéré",
  eleve: "Élevé",
  fort: "Fort",
};

export const RISK_LEVEL_COLOR: Record<RiskLevel, string> = {
  faible: "text-emerald-600",
  modere: "text-amber-600",
  eleve: "text-orange-600",
  fort: "text-red-600",
};

export const RISK_LEVEL_BG: Record<RiskLevel, string> = {
  faible: "bg-emerald-50 border-emerald-200",
  modere: "bg-amber-50 border-amber-200",
  eleve: "bg-orange-50 border-orange-200",
  fort: "bg-red-50 border-red-200",
};
