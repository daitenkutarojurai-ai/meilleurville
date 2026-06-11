// F59 — Démographie & vieillissement par ville.
//
// 4 dimensions évaluées depuis le seed (department, population, region,
// characterTags). Aucune dépendance externe.
//
// Sources de référence (toutes publiques) :
//   - INSEE (insee.fr) : recensement population (RP) annuel, structure par
//     âge par commune et département (séries 1968-2023).
//   - INSEE Bilan démographique : solde naturel + solde migratoire annuels
//     par dept ; projections OMPHALE 2070 par zone d'emploi.
//   - CNAV / Drees : projection senior 75+ par EPCI (à horizon 2030, 2040).
//   - DREES Atlas démographique médecins : utile pour cross-check.
//
// **Convention** : tous les scores 0-10, 10 = tension démographique
// maximale (vieillissement extrême OU décroissance forte). Cohérent
// avec quartet env F40-F43. Score faible = profil équilibré.
// Composite = moyenne pondérée des 4 sous-scores.

import type { CityLight } from "@/lib/cities-light";

export type DemoLevel = "dynamique" | "equilibre" | "vieillissant" | "critique";

export interface DemoDimension {
  /** 0-10, 10 = tension maximale */
  score: number;
  level: DemoLevel;
  reason: string;
}

export interface Demography {
  /** Composite 0-10, 10 = pire (vieillissement + décroissance) */
  composite: number;
  level: DemoLevel;
  ageing: DemoDimension;         // % seniors 60+ / vieillissement
  youngActives: DemoDimension;   // déficit jeunes actifs 25-35
  trajectory: DemoDimension;     // solde démographique (natalité + migratoire)
  renewal: DemoDimension;        // renouvellement naturel (natalité)
  signature: string;
}

function levelFromScore(s: number): DemoLevel {
  if (s >= 7.5) return "critique";
  if (s >= 5.5) return "vieillissant";
  if (s >= 3.5) return "equilibre";
  return "dynamique";
}

// ─── Vieillissement (% seniors 60+) — INSEE RP par dept ──────────────────
//
// Médiane nationale ~28 % en 2024. France projetée à 32 % en 2040.
//
// Très âgé (score 8)   : Creuse, Lot, Cantal, Nièvre, Indre, Aveyron, Lozère,
//   Allier, Haute-Marne, Meuse, Corrèze, Manche, Orne, Vosges, Saône-et-Loire,
//   Yonne, Limousin tout entier. 35-40 % de seniors.
// Âgé (score 6)         : Var, Alpes-Maritimes, PO (PACA + Roussillon),
//   Vendée, Charente-Maritime, Lot-et-Garonne, Dordogne, Gers, Ariège,
//   Hautes-Pyrénées, Pyrénées-Atlantiques, Pyrénées-Orientales. 32-35 %.
// Moyen (score 4)       : la plupart des dépts médians. ~28-30 %.
// Jeune (score 2)        : Paris, Hauts-de-Seine, Val-de-Marne, Val-d'Oise,
//   Seine-Saint-Denis, Essonne, Yvelines, Seine-et-Marne, Rhône, Métropole
//   de Lyon, Haute-Garonne, Ille-et-Vilaine. 22-27 %.
// Très jeune (score 1)  : DROM (Guyane, Mayotte, La Réunion — démographie
//   jeune structurelle, < 20 % de seniors).

const AGEING_VERY_HIGH_DEPTS = new Set([
  "Creuse", "Lot", "Cantal", "Nièvre", "Indre", "Aveyron", "Lozère",
  "Allier", "Haute-Marne", "Meuse", "Corrèze", "Manche", "Orne",
  "Vosges", "Saône-et-Loire", "Yonne", "Haute-Saône", "Cher",
]);

const AGEING_HIGH_DEPTS = new Set([
  "Var", "Alpes-Maritimes", "Pyrénées-Orientales", "Vendée",
  "Charente-Maritime", "Lot-et-Garonne", "Dordogne", "Gers", "Ariège",
  "Hautes-Pyrénées", "Pyrénées-Atlantiques", "Hautes-Alpes",
  "Alpes-de-Haute-Provence", "Tarn", "Tarn-et-Garonne",
]);

const AGEING_LOW_DEPTS = new Set([
  "Paris", "Hauts-de-Seine", "Val-de-Marne", "Val-d'Oise",
  "Seine-Saint-Denis", "Essonne", "Yvelines", "Seine-et-Marne",
  "Rhône", "Métropole de Lyon", "Haute-Garonne", "Ille-et-Vilaine",
]);

const AGEING_VERY_LOW_DEPTS = new Set([
  "Guyane", "Mayotte", "Réunion", "La Réunion", "Guadeloupe", "Martinique",
]);

function ageingRisk(city: CityLight): DemoDimension {
  const d = city.department;
  if (AGEING_VERY_LOW_DEPTS.has(d)) {
    return {
      score: 1,
      level: "dynamique",
      reason: "Démographie très jeune (DROM) — < 20 % de seniors. Pyramide structurellement large à la base.",
    };
  }
  if (AGEING_LOW_DEPTS.has(d)) {
    return {
      score: 2,
      level: "dynamique",
      reason: "Démographie jeune — 22-27 % de seniors. Métropoles et IDF dense attirent les actifs.",
    };
  }
  if (AGEING_VERY_HIGH_DEPTS.has(d)) {
    return {
      score: 8,
      level: "critique",
      reason: "Vieillissement très avancé — 35-40 % de seniors. Pyramide étroite à la base, tensions services à la personne croissantes.",
    };
  }
  if (AGEING_HIGH_DEPTS.has(d)) {
    return {
      score: 6,
      level: "vieillissant",
      reason: "Vieillissement marqué — 32-35 % de seniors. Migrations retraites héliotropiques en couche supérieure de la pyramide.",
    };
  }
  return {
    score: 4,
    level: "equilibre",
    reason: "Pyramide d'âge proche de la médiane nationale (~28 % de seniors).",
  };
}

// ─── Jeunes actifs 25-35 ans (déficit ou attractivité) ────────────────────
//
// Proxy : métropoles + villes étudiantes = élevé ; rural en déclin = faible.

function youngActivesRisk(city: CityLight): DemoDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags);
  const isEtudiant = /étudiant|universitaire/.test(tags);
  const isParis = city.department === "Paris";

  if (isParis || (isMetro && isEtudiant)) {
    return {
      score: 1,
      level: "dynamique",
      reason: "Métropole étudiante / Paris — forte attractivité jeunes actifs 25-35 ans, % > 18 % de la population.",
    };
  }
  if (isMetro || (isEtudiant && pop > 80_000)) {
    return {
      score: 2.5,
      level: "dynamique",
      reason: "Pôle universitaire ou grande agglo — flux entrants soutenus de jeunes actifs.",
    };
  }
  if (pop > 50_000) {
    return {
      score: 4,
      level: "equilibre",
      reason: "Ville moyenne — part de jeunes actifs proche de la moyenne nationale (~12 %).",
    };
  }
  if (AGEING_VERY_HIGH_DEPTS.has(city.department)) {
    return {
      score: 8,
      level: "critique",
      reason: "Déficit marqué de jeunes actifs — départ structurel des 25-35 ans vers les pôles. Vieillissement accéléré par exode.",
    };
  }
  return {
    score: 5.5,
    level: "vieillissant",
    reason: "Sous-représentation des 25-35 ans — vivier d'actifs en érosion lente.",
  };
}

// ─── Trajectoire population (solde démographique annuel) ──────────────────
//
// Décomposé : solde naturel + solde migratoire. Façade atlantique + Sud +
// périurbains métropolitains = positif. Centre / Est rural / DROM Antilles
// (sauf Mayotte/Guyane) = négatif. Sources : Bilan démographique INSEE.

const GROWTH_POSITIVE_DEPTS = new Set([
  // Façade atlantique attractive
  "Loire-Atlantique", "Vendée", "Morbihan", "Ille-et-Vilaine",
  "Charente-Maritime", "Gironde", "Landes", "Pyrénées-Atlantiques",
  // Sud héliotropique
  "Hérault", "Gard", "Var", "Alpes-Maritimes", "Bouches-du-Rhône",
  "Haute-Garonne", "Pyrénées-Orientales",
  // Alpes / Sillon dynamique
  "Haute-Savoie", "Ain", "Isère", "Rhône", "Métropole de Lyon",
  // Périurbains IDF + Nord
  "Seine-et-Marne", "Val-d'Oise", "Essonne",
  // DROM jeunes
  "Guyane", "Mayotte", "Réunion", "La Réunion",
]);

const GROWTH_NEGATIVE_DEPTS = new Set([
  // Centre / Est rural en perte structurelle
  "Creuse", "Cantal", "Nièvre", "Indre", "Allier", "Cher",
  "Haute-Marne", "Meuse", "Vosges", "Ardennes", "Aisne",
  "Lozère", "Aveyron", "Haute-Saône", "Saône-et-Loire",
  // Industriel en décrochage
  "Nord", "Pas-de-Calais", "Somme",
  // Antilles en baisse
  "Guadeloupe", "Martinique",
]);

function trajectoryRisk(city: CityLight): DemoDimension {
  const d = city.department;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags);

  if (GROWTH_POSITIVE_DEPTS.has(d)) {
    if (isMetro) {
      return {
        score: 1.5,
        level: "dynamique",
        reason: "Pôle métropolitain attractif — solde démographique positif soutenu (naturel + migratoire).",
      };
    }
    return {
      score: 3,
      level: "equilibre",
      reason: "Département en croissance démographique — solde migratoire positif, attractivité confirmée.",
    };
  }
  if (GROWTH_NEGATIVE_DEPTS.has(d)) {
    return {
      score: 8,
      level: "critique",
      reason: "Décroissance démographique structurelle — solde négatif depuis plusieurs décennies (naturel + migratoire).",
    };
  }
  return {
    score: 5,
    level: "equilibre",
    reason: "Trajectoire démographique proche de la stabilité — solde annuel faiblement positif ou négatif.",
  };
}

// ─── Renouvellement (taux natalité, proxy familles + jeunes) ─────────────
//
// France 2024 : taux brut natalité ~10,5 ‰. DROM > 14 ‰ (jeunesse).
// Rural âgé < 8 ‰. Métropoles ~10-12 ‰ selon profil.

function renewalRisk(city: CityLight): DemoDimension {
  const d = city.department;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isFamilial = /familial|famille/.test(tags);
  const isDrom = AGEING_VERY_LOW_DEPTS.has(d);

  if (isDrom) {
    return {
      score: 1.5,
      level: "dynamique",
      reason: "Natalité élevée (> 14 ‰) — pyramide démographique large à la base, renouvellement assuré.",
    };
  }
  if (isFamilial && AGEING_LOW_DEPTS.has(d)) {
    return {
      score: 3,
      level: "equilibre",
      reason: "Commune familiale en dept jeune — natalité au-dessus de la moyenne nationale.",
    };
  }
  if (AGEING_VERY_HIGH_DEPTS.has(d)) {
    return {
      score: 8,
      level: "critique",
      reason: "Natalité très faible (< 8 ‰) — peu de familles installées, peu de jeunes adultes en âge de procréer.",
    };
  }
  if (AGEING_HIGH_DEPTS.has(d)) {
    return {
      score: 6,
      level: "vieillissant",
      reason: "Natalité sous la moyenne nationale (~9 ‰) — pyramide d'âge décalée vers les seniors.",
    };
  }
  return {
    score: 4,
    level: "equilibre",
    reason: "Natalité proche de la moyenne nationale (~10,5 ‰).",
  };
}

// ─── Composite ────────────────────────────────────────────────────────────

function composeSignature(d: Demography, name: string): string {
  const tops = [
    { k: "vieillissement", d: d.ageing },
    { k: "déficit jeunes actifs", d: d.youngActives },
    { k: "décroissance", d: d.trajectory },
    { k: "renouvellement", d: d.renewal },
  ]
    .filter((x) => x.d.level === "critique" || x.d.level === "vieillissant")
    .sort((a, b) => b.d.score - a.d.score);

  if (d.composite <= 3) {
    return `${name} affiche un profil démographique dynamique — pyramide équilibrée et trajectoire positive.`;
  }
  if (tops.length === 0) {
    return `${name} présente un profil démographique proche de la médiane nationale.`;
  }
  if (tops.length === 1) {
    return `${name} montre une tension principalement sur « ${tops[0].k} » (${tops[0].d.level}).`;
  }
  return `${name} cumule plusieurs tensions démographiques : ${tops.slice(0, 2).map((t) => `${t.k} (${t.d.level})`).join(", ")}.`;
}

export function computeDemography(city: CityLight): Demography {
  const ageing = ageingRisk(city);
  const youngActives = youngActivesRisk(city);
  const trajectory = trajectoryRisk(city);
  const renewal = renewalRisk(city);
  // Pondération : vieillissement 30 % + trajectoire 30 % (les deux signaux
  // les plus structurants), jeunes actifs 25 %, renouvellement 15 %.
  const composite =
    Math.round(
      (ageing.score * 0.3 + trajectory.score * 0.3 + youngActives.score * 0.25 + renewal.score * 0.15) * 10
    ) / 10;
  const out: Demography = {
    composite,
    level: levelFromScore(composite),
    ageing,
    youngActives,
    trajectory,
    renewal,
    signature: "",
  };
  out.signature = composeSignature(out, city.name);
  return out;
}

export const DEMO_LEVEL_LABEL: Record<DemoLevel, string> = {
  dynamique: "Dynamique",
  equilibre: "Équilibré",
  vieillissant: "Vieillissant",
  critique: "Critique",
};

export const DEMO_LEVEL_COLOR: Record<DemoLevel, string> = {
  dynamique: "text-emerald-600",
  equilibre: "text-amber-600",
  vieillissant: "text-orange-600",
  critique: "text-red-600",
};

export const DEMO_LEVEL_BG: Record<DemoLevel, string> = {
  dynamique: "bg-emerald-50 border-emerald-200",
  equilibre: "bg-amber-50 border-amber-200",
  vieillissant: "bg-orange-50 border-orange-200",
  critique: "bg-red-50 border-red-200",
};
