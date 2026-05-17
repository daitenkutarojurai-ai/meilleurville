// F41 — Stress hydrique & sécheresse par ville
//
// 4 dimensions évaluées depuis le seed (department, climat, characterTags,
// elevation). Aucune dépendance externe.
//
// Sources de référence (toutes publiques) :
//   - Propluvia (propluvia.developpement-durable.gouv.fr) : arrêtés sécheresse
//     2022-2024 — fréquence et sévérité par département (vigilance/alerte/crise).
//   - BRGM bulletin nappes (eaufrance.fr/bulletin-de-situation-des-nappes) :
//     état moyen 2022-2025 par grande nappe (basse / normale / haute).
//   - Météo-France : indicateur SPI (déficit pluviométrique cumulé) + cartes
//     d'humidité des sols (SWI) — agrégés par macro-région.
//   - Ministère Santé / ARS : tensions sur l'eau potable (DROM, Corse, îles,
//     petites communes karstiques en été touristique).
//
// Tous les scores 0-10. Composite = moyenne pondérée des 4.
// Echelle commune avec lib/natural-risks.ts (10 = stress maximal).

import type { CitySeed } from "@/data/cities-seed";

export type WaterLevel = "faible" | "modere" | "eleve" | "fort";

export interface WaterDimension {
  /** 0-10, 10 = stress maximal */
  score: number;
  level: WaterLevel;
  /** Justification courte */
  reason: string;
}

export interface WaterStress {
  /** Composite 0-10 */
  composite: number;
  level: WaterLevel;
  /** Restrictions arrêtés sécheresse (Propluvia 2022-2024) */
  restrictions: WaterDimension;
  /** État des nappes phréatiques (BRGM) */
  aquifer: WaterDimension;
  /** Sécheresse climatique (Météo-France, dérivé du seed) */
  climate: WaterDimension;
  /** Pression sur l'alimentation eau potable (tourisme, karst, île) */
  supply: WaterDimension;
  /** Signature narrative pour résumé une-ligne */
  signature: string;
}

function levelFromScore(s: number): WaterLevel {
  if (s >= 7.5) return "fort";
  if (s >= 5.5) return "eleve";
  if (s >= 3.5) return "modere";
  return "faible";
}

// ─── Restrictions sécheresse (Propluvia 2022-2024) ─────────────────────────
//
// Cumul des arrêtés "alerte renforcée" et "crise" par département sur 2022-2024.
//
// Très fréquent (score 9)  → arrêtés crise quasi-annuels, été quasi-restreint
//   PACA intérieur (Var, Vaucluse, Bouches-du-Rhône, Alpes-Maritimes), Drôme,
//   Ardèche, Gard, Hérault, Aude, Pyrénées-Orientales, Lozère, Corse.
//
// Fréquent (score 7)       → alerte plusieurs étés, crise ponctuelle
//   Charente, Charente-Maritime, Deux-Sèvres, Vienne, Vendée, Maine-et-Loire,
//   Indre-et-Loire, Loir-et-Cher, Cher, Indre, Loiret, Allier, Puy-de-Dôme,
//   Saône-et-Loire, Côte-d'Or, Yonne, Dordogne, Gironde, Lot, Lot-et-Garonne,
//   Tarn-et-Garonne, Tarn, Aveyron, Haute-Garonne, Gers, Ariège, Pyrénées-
//   Atlantiques, Hautes-Pyrénées, Hautes-Alpes, Alpes-de-Haute-Provence.
//
// Modéré (score 5)         → quelques arrêtés alerte sur la période
//   Bretagne (29, 22, 35, 56), Loire-Atlantique, Manche, Calvados, Orne,
//   Eure, Eure-et-Loir, Sarthe, Mayenne, Bas-Rhin, Haut-Rhin, Vosges,
//   Doubs, Jura, Saône, Rhône, Ain, Isère, Loire, Haute-Loire.
//
// Faible (score 2.5)       → restrictions exceptionnelles
//   Nord, Pas-de-Calais, Somme, Aisne, Oise, Seine-Maritime, Seine-et-Marne,
//   Hauts-de-Seine, Val-d'Oise, Val-de-Marne, Yvelines, Essonne, Paris,
//   Seine-Saint-Denis, Marne, Meuse, Moselle, Meurthe-et-Moselle, Ardennes,
//   Aube, Haute-Marne, Haute-Saône, Territoire de Belfort, Savoie,
//   Haute-Savoie, Vienne (87 Haute-V.), Creuse, Cantal, Mayotte, Guyane,
//   Réunion, La Réunion.

const REST_VERY_HIGH = new Set([
  "Var", "Vaucluse", "Bouches-du-Rhône", "Alpes-Maritimes", "Drôme", "Ardèche",
  "Gard", "Hérault", "Aude", "Pyrénées-Orientales", "Lozère",
  "Corse-du-Sud", "Haute-Corse",
]);

const REST_HIGH = new Set([
  "Charente", "Charente-Maritime", "Deux-Sèvres", "Vienne", "Vendée",
  "Maine-et-Loire", "Indre-et-Loire", "Loir-et-Cher", "Cher", "Indre",
  "Loiret", "Allier", "Puy-de-Dôme", "Saône-et-Loire", "Côte-d'Or", "Yonne",
  "Dordogne", "Gironde", "Lot", "Lot-et-Garonne", "Tarn-et-Garonne", "Tarn",
  "Aveyron", "Haute-Garonne", "Gers", "Ariège", "Pyrénées-Atlantiques",
  "Hautes-Pyrénées", "Hautes-Alpes", "Alpes-de-Haute-Provence",
]);

const REST_LOW = new Set([
  "Nord", "Pas-de-Calais", "Somme", "Aisne", "Oise", "Seine-Maritime",
  "Seine-et-Marne", "Hauts-de-Seine", "Val-d'Oise", "Val-de-Marne",
  "Yvelines", "Essonne", "Paris", "Seine-Saint-Denis", "Marne", "Meuse",
  "Moselle", "Meurthe-et-Moselle", "Ardennes", "Aube", "Haute-Marne",
  "Haute-Saône", "Territoire de Belfort", "Savoie", "Haute-Savoie",
  "Creuse", "Cantal", "Mayotte", "Guyane",
]);

function restrictionsRisk(city: CitySeed): WaterDimension {
  const d = city.department;
  if (REST_VERY_HIGH.has(d)) {
    return {
      score: 9,
      level: "fort",
      reason: "Arrêtés sécheresse niveau crise quasi-annuels (2022-2024). Restrictions arrosage, lavage, parfois eau potable plusieurs semaines par an.",
    };
  }
  if (REST_HIGH.has(d)) {
    return {
      score: 7,
      level: "eleve",
      reason: "Arrêtés alerte renforcée fréquents en été, crise ponctuelle. Restrictions usages extérieurs récurrentes entre juin et septembre.",
    };
  }
  if (REST_LOW.has(d)) {
    return {
      score: 2.5,
      level: "faible",
      reason: "Restrictions exceptionnelles. Le département a très rarement franchi le seuil d'alerte sur 2022-2024.",
    };
  }
  // par défaut → modéré
  return {
    score: 5,
    level: "modere",
    reason: "Quelques arrêtés vigilance ou alerte ponctuels sur la période 2022-2024. Restrictions occasionnelles selon les étés.",
  };
}

// ─── État des nappes phréatiques (BRGM, moyenne 2022-2025) ────────────────
//
// Nappes très basses (score 8)    → nappes sud (Roussillon, Crau, miocène
//   Provence), nappes karstiques calcaire jurassique sud (Causses, Vaucluse).
//   Depts : Pyrénées-Orientales, Aude, Hérault, Vaucluse, Bouches-du-Rhône,
//   Var, Drôme, Gard, Ardèche, Lozère, Alpes-de-Haute-Provence, Corse.
//
// Nappes basses (score 6.5)       → bassin parisien sud (Beauce, Sénonais,
//   Sologne), nappes Poitou-Charentes (jurassique), nappes Aquitaine.
//   Depts : Eure-et-Loir, Loiret, Loir-et-Cher, Cher, Indre, Yonne, Aube,
//   Vienne, Deux-Sèvres, Charente, Charente-Maritime, Vendée, Dordogne,
//   Gironde, Lot-et-Garonne, Tarn-et-Garonne, Lot, Gers, Hautes-Pyrénées,
//   Pyrénées-Atlantiques, Hautes-Alpes.
//
// Nappes normales à hautes (score 3) → bassin parisien nord (Aisne, Oise,
//   Seine-et-Marne, 95, 78), Hauts-de-France, Alsace (nappe rhénane forte),
//   Bretagne (nappes peu profondes alimentées toute l'année), Normandie,
//   massifs alpins, Lyonnais nord, Jura, Vosges.

const AQUIFER_VERY_LOW = new Set([
  "Pyrénées-Orientales", "Aude", "Hérault", "Vaucluse", "Bouches-du-Rhône",
  "Var", "Drôme", "Gard", "Ardèche", "Lozère", "Alpes-de-Haute-Provence",
  "Alpes-Maritimes", "Corse-du-Sud", "Haute-Corse",
]);

const AQUIFER_LOW = new Set([
  "Eure-et-Loir", "Loiret", "Loir-et-Cher", "Cher", "Indre", "Yonne", "Aube",
  "Vienne", "Deux-Sèvres", "Charente", "Charente-Maritime", "Vendée",
  "Dordogne", "Gironde", "Lot-et-Garonne", "Tarn-et-Garonne", "Lot", "Gers",
  "Hautes-Pyrénées", "Pyrénées-Atlantiques", "Hautes-Alpes",
  "Haute-Garonne", "Tarn", "Aveyron", "Allier", "Puy-de-Dôme",
]);

function aquiferRisk(city: CitySeed): WaterDimension {
  const d = city.department;
  if (AQUIFER_VERY_LOW.has(d)) {
    return {
      score: 8,
      level: "fort",
      reason: "Nappes très basses (BRGM 2022-2025) — recharge hivernale insuffisante depuis 4 ans. Sols karstiques peu capacitifs.",
    };
  }
  if (AQUIFER_LOW.has(d)) {
    return {
      score: 6.5,
      level: "eleve",
      reason: "Nappes basses sur la dernière période (BRGM). Recharge hivernale partielle, déficit cumulé visible en fin d'été.",
    };
  }
  return {
    score: 3,
    level: "faible",
    reason: "Nappes proches de la normale ou hautes (BRGM). Recharge hivernale satisfaisante grâce aux pluies océaniques ou massifs.",
  };
}

// ─── Sécheresse climatique (dérivée du seed) ──────────────────────────────
//
// Heuristique : avgTempJuly + sunshinedays = stress estival. Pénalise les
// climats méditerranéens chauds et secs, valorise les climats océaniques.

function climateRisk(city: CitySeed): WaterDimension {
  const tj = city.avgTempJuly ?? 21;
  const sun = city.sunshinedays ?? 1900;
  // Normalisations : tj 18-26 °C, sun 1500-2900 h
  const tempScore = Math.max(0, Math.min(10, ((tj - 18) / 8) * 10));
  const sunScore = Math.max(0, Math.min(10, ((sun - 1500) / 1400) * 10));
  const raw = tempScore * 0.55 + sunScore * 0.45;
  const score = Math.round(raw * 10) / 10;
  const level = levelFromScore(score);
  let reason: string;
  if (level === "fort") {
    reason = `Été très chaud (${tj.toFixed(1)} °C en juillet) et très ensoleillé (${sun} h/an). Évaporation et déficit hydrique élevés.`;
  } else if (level === "eleve") {
    reason = `Été chaud (${tj.toFixed(1)} °C en juillet, ${sun} h de soleil/an). Stress estival marqué sur la végétation et les jardins.`;
  } else if (level === "modere") {
    reason = `Été tempéré (${tj.toFixed(1)} °C en juillet, ${sun} h de soleil/an). Stress hydrique limité hors épisodes exceptionnels.`;
  } else {
    reason = `Été doux (${tj.toFixed(1)} °C en juillet, ${sun} h de soleil/an). Climat océanique ou montagnard humide, peu propice au déficit prolongé.`;
  }
  return { score, level, reason };
}

// ─── Pression sur l'alimentation eau potable ──────────────────────────────
//
// Cumule (a) îles et littoral touristique sous tension estivale,
// (b) sols karstiques calcaire à faible capacité de stockage,
// (c) DROM avec réseaux fragiles (Guadeloupe, Mayotte tensions chroniques),
// (d) communes très petites ou en altitude moyenne (massifs).

const KARST_DEPTS = new Set([
  "Vaucluse", "Bouches-du-Rhône", "Var", "Alpes-de-Haute-Provence", "Hérault",
  "Gard", "Ardèche", "Lozère", "Aveyron", "Lot", "Dordogne", "Charente",
  "Pyrénées-Atlantiques", "Hautes-Pyrénées", "Doubs", "Jura",
  "Corse-du-Sud", "Haute-Corse",
]);

const SUPPLY_FRAGILE_DEPTS = new Set([
  // DROM tensions chroniques
  "Guadeloupe", "Mayotte", "Martinique",
]);

function supplyRisk(city: CitySeed): WaterDimension {
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isCoastal = /\b(mer|plage|atlantique|méditerranée|manche|côte|littoral|lagon|presqu'île)\b/.test(tags);
  const isIsland = /\b(île|îles)\b/.test(tags) || ["Corse-du-Sud", "Haute-Corse", "Guadeloupe", "Martinique", "Mayotte", "Réunion", "La Réunion"].includes(city.department);
  const isTouristic = /\b(tourisme|tourist|station|balnéaire)\b/.test(tags);
  const isKarst = KARST_DEPTS.has(city.department);
  const isFragile = SUPPLY_FRAGILE_DEPTS.has(city.department);

  if (isFragile) {
    return {
      score: 9,
      level: "fort",
      reason: "Réseau d'eau potable historiquement fragile (tours d'eau récurrents, fuites importantes). Tensions saisonnières quasi-systématiques.",
    };
  }
  if (isIsland && isTouristic) {
    return {
      score: 8,
      level: "fort",
      reason: "Île à forte fréquentation touristique estivale — ressource limitée, désalinisation parfois nécessaire, tensions en juillet-août.",
    };
  }
  if (isCoastal && isTouristic && isKarst) {
    return {
      score: 7.5,
      level: "eleve",
      reason: "Littoral touristique sur sol karstique — consommation triplée en juillet-août, stockage limité, restrictions fréquentes.",
    };
  }
  if (isKarst) {
    return {
      score: 6,
      level: "eleve",
      reason: "Sols karstiques à faible capacité de stockage — l'eau circule vite, recharge dépendante des pluies d'automne.",
    };
  }
  if (isCoastal && isTouristic) {
    return {
      score: 5.5,
      level: "eleve",
      reason: "Commune littorale à forte saisonnalité touristique. Pression réseau marquée en juillet-août.",
    };
  }
  if (isIsland || isCoastal) {
    return {
      score: 4,
      level: "modere",
      reason: "Commune littorale — saisonnalité estivale modérée, vigilance sur les périodes de pointe.",
    };
  }
  return {
    score: 2.5,
    level: "faible",
    reason: "Alimentation eau potable stable, peu de saisonnalité touristique, ressource locale abondante.",
  };
}

// ─── Composite ────────────────────────────────────────────────────────────

function composeSignature(s: WaterStress, name: string): string {
  const tops = [
    { k: "restrictions sécheresse", d: s.restrictions },
    { k: "nappes basses", d: s.aquifer },
    { k: "stress climatique", d: s.climate },
    { k: "alimentation eau potable", d: s.supply },
  ]
    .filter((x) => x.d.level === "fort" || x.d.level === "eleve")
    .sort((a, b) => b.d.score - a.d.score);

  if (tops.length === 0) {
    return `${name} est peu exposée au stress hydrique — ressource abondante, restrictions rares.`;
  }
  if (tops.length === 1) {
    return `${name} est principalement exposée au facteur « ${tops[0].k} » (${tops[0].d.level}).`;
  }
  return `${name} cumule plusieurs tensions hydriques : ${tops.slice(0, 2).map((t) => `${t.k} (${t.d.level})`).join(", ")}.`;
}

export function computeWaterStress(city: CitySeed): WaterStress {
  const restrictions = restrictionsRisk(city);
  const aquifer = aquiferRisk(city);
  const climate = climateRisk(city);
  const supply = supplyRisk(city);
  // Pondération : restrictions 35 %, nappes 25 %, climat 20 %, alimentation 20 %.
  // Les restrictions sont la traduction concrète vécue par l'habitant.
  const composite =
    Math.round(
      (restrictions.score * 0.35 + aquifer.score * 0.25 + climate.score * 0.2 + supply.score * 0.2) * 10
    ) / 10;
  const out: WaterStress = {
    composite,
    level: levelFromScore(composite),
    restrictions,
    aquifer,
    climate,
    supply,
    signature: "",
  };
  out.signature = composeSignature(out, city.name);
  return out;
}

export const WATER_LEVEL_LABEL: Record<WaterLevel, string> = {
  faible: "Faible",
  modere: "Modéré",
  eleve: "Élevé",
  fort: "Fort",
};

export const WATER_LEVEL_COLOR: Record<WaterLevel, string> = {
  faible: "text-emerald-600",
  modere: "text-amber-600",
  eleve: "text-orange-600",
  fort: "text-red-600",
};

export const WATER_LEVEL_BG: Record<WaterLevel, string> = {
  faible: "bg-emerald-50 border-emerald-200",
  modere: "bg-amber-50 border-amber-200",
  eleve: "bg-orange-50 border-orange-200",
  fort: "bg-red-50 border-red-200",
};
