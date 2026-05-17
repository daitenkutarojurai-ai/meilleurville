// F50 — Emploi & marché du travail par ville
//
// 4 dimensions évaluées depuis le seed (department, population, characterTags).
// Aucune dépendance externe.
//
// Sources de référence (toutes publiques) :
//   - INSEE : taux de chômage trimestriel par département (T4 2024 dernière
//     publication disponible). https://www.insee.fr/fr/statistiques.
//   - DARES (dares.travail-emploi.gouv.fr) : statistiques chômage longue durée,
//     demandes d'emploi par catégorie (A, B, C, D, E).
//   - SIRENE (data.insee.fr/sirene) : flux quotidien de création / cessation
//     d'établissements — agrégeable par département.
//   - INSEE salaires : salaire net mensuel médian par département (DADS).
//
// Tous les scores 0-10. 10 = marché du travail le plus difficile.
// Composite = moyenne pondérée des 4 sous-scores.

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";

export type JobLevel = "facile" | "actif" | "tendu" | "sinistre";

export interface JobDimension {
  /** 0-10, 10 = pire (chômage haut, salaires bas, faible dynamisme) */
  score: number;
  level: JobLevel;
  /** Justification courte */
  reason: string;
}

export interface EmploymentMarket {
  /** Composite 0-10, 10 = marché le plus difficile */
  composite: number;
  level: JobLevel;
  unemployment: JobDimension;  // taux de chômage dept
  dynamism: JobDimension;       // création nette d'entreprises
  sectorMix: JobDimension;      // diversité / résilience du tissu
  salary: JobDimension;         // salaire net médian dept
  /** Signature narrative pour résumé une-ligne */
  signature: string;
}

function levelFromScore(s: number): JobLevel {
  if (s >= 7.5) return "sinistre";
  if (s >= 5.5) return "tendu";
  if (s >= 3.5) return "actif";
  return "facile";
}

// ─── Taux de chômage par département (INSEE T4 2024) ──────────────────────
//
// Moyenne France métropolitaine T4 2024 : ~7,3 %.
//
// Très élevé (score 9)    : > 10 % — Pyrénées-Orientales, Aisne, Pas-de-Calais
//                          Hérault, Aude, Gard, Seine-Saint-Denis, Nord (partie),
//                          DROM (Guadeloupe, Martinique, La Réunion, Mayotte > 15 %).
// Élevé (score 7)         : 8-10 % — Haute-Garonne (autour de Toulouse 8,5 %),
//                          Bouches-du-Rhône, Var, Vaucluse, Drôme, Ardèche,
//                          Lozère, Ariège, Tarn, Charente-Maritime,
//                          Seine-Maritime (parties), Eure, Somme, Oise,
//                          Indre, Cher, Allier, Nièvre, Yonne, Aube.
// Moyen (score 5)         : 7-8 % — beaucoup de dépts médians.
// Bas (score 3)           : 5,5-7 % — Pyrénées-Atlantiques (Bayonne/Pau),
//                          Haute-Savoie, Savoie, Doubs, Bas-Rhin, Maine-et-Loire,
//                          Loire-Atlantique, Ille-et-Vilaine, Finistère,
//                          Côtes-d'Armor, Vendée, Mayenne, Manche, Calvados,
//                          Cantal, Aveyron, Lozère, Ain.
// Très bas (score 1.5)    : < 5,5 % — Lozère, Cantal, Mayenne, Vendée, Aveyron,
//                          Cantal, Pays de la Loire ruraux.

const UNEMP_VERY_HIGH = new Set([
  "Pyrénées-Orientales", "Aisne", "Pas-de-Calais", "Hérault", "Aude", "Gard",
  "Seine-Saint-Denis",
  "Guadeloupe", "Martinique", "Réunion", "La Réunion", "Mayotte", "Guyane",
]);

const UNEMP_HIGH = new Set([
  "Haute-Garonne", "Bouches-du-Rhône", "Var", "Vaucluse", "Drôme", "Ardèche",
  "Lozère", "Ariège", "Tarn", "Charente-Maritime", "Eure", "Somme", "Oise",
  "Indre", "Cher", "Allier", "Nièvre", "Yonne", "Aube", "Nord",
  "Alpes-Maritimes", "Corse-du-Sud", "Haute-Corse",
]);

const UNEMP_LOW = new Set([
  "Pyrénées-Atlantiques", "Haute-Savoie", "Savoie", "Doubs", "Bas-Rhin",
  "Maine-et-Loire", "Loire-Atlantique", "Ille-et-Vilaine", "Finistère",
  "Côtes-d'Armor", "Vendée", "Mayenne", "Manche", "Calvados", "Cantal",
  "Aveyron", "Ain", "Jura", "Haut-Rhin", "Loire", "Rhône",
  "Métropole de Lyon",
]);

const UNEMP_VERY_LOW = new Set([
  "Lozère", "Cantal", "Mayenne", "Aveyron",
]);

function unemploymentRisk(city: CitySeed): JobDimension {
  const d = city.department;
  if (UNEMP_VERY_LOW.has(d)) {
    return {
      score: 1.5,
      level: "facile",
      reason: "Taux de chômage très bas (< 5,5 % INSEE T4 2024) — tension à l'embauche dans de nombreux secteurs (artisans, santé, services).",
    };
  }
  if (UNEMP_LOW.has(d)) {
    return {
      score: 3,
      level: "facile",
      reason: "Taux de chômage bas (5,5-7 % INSEE T4 2024) — marché tendu côté employeurs, opportunités correctes pour les actifs.",
    };
  }
  if (UNEMP_VERY_HIGH.has(d)) {
    return {
      score: 9,
      level: "sinistre",
      reason: "Taux de chômage très élevé (> 10 % INSEE T4 2024 ou DROM en tension chronique). Chômage longue durée surreprésenté.",
    };
  }
  if (UNEMP_HIGH.has(d)) {
    return {
      score: 7,
      level: "tendu",
      reason: "Taux de chômage élevé (8-10 % INSEE T4 2024). Marché de l'emploi local plus difficile que la moyenne nationale.",
    };
  }
  return {
    score: 5,
    level: "actif",
    reason: "Taux de chômage proche de la moyenne nationale (7-8 % INSEE T4 2024). Marché équilibré.",
  };
}

// ─── Dynamisme création d'entreprises (SIRENE) ────────────────────────────
//
// Heuristique : grandes métropoles + littoral attractif + tags dynamiques
// = solde net positif SIRENE (création > cessation). Petites communes
// rurales en déclin = solde négatif.

const DYNAMIC_DEPTS = new Set([
  // Départements à création nette élevée 2023-2024
  "Paris", "Hauts-de-Seine", "Bouches-du-Rhône", "Rhône", "Métropole de Lyon",
  "Haute-Garonne", "Gironde", "Loire-Atlantique", "Ille-et-Vilaine",
  "Hérault", "Alpes-Maritimes", "Var", "Pyrénées-Atlantiques",
  "Bas-Rhin", "Isère", "Vaucluse",
]);

function dynamismRisk(city: CitySeed): JobDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags);
  const isDynamic = /dynamique|étudiant|jeune|start.?up|innovant/.test(tags);
  const isAttractive = DYNAMIC_DEPTS.has(city.department);
  const isRuralDecline = pop < 20_000 && /rural|villageois|tranquille/.test(tags);

  if (isRuralDecline) {
    return {
      score: 7.5,
      level: "tendu",
      reason: "Commune rurale à faible création d'entreprises — solde net SIRENE souvent négatif, peu de renouvellement du tissu local.",
    };
  }
  if (isMetro && (isDynamic || isAttractive)) {
    return {
      score: 1.5,
      level: "facile",
      reason: "Grande métropole dynamique — création nette d'entreprises SIRENE soutenue, écosystème actif (start-ups, services, indépendants).",
    };
  }
  if (isAttractive || (isMetro && pop > 100_000)) {
    return {
      score: 3,
      level: "facile",
      reason: "Département attractif avec solde net SIRENE positif. Création régulière de TPE, présence d'incubateurs et de tiers-lieux.",
    };
  }
  if (pop > 50_000) {
    return {
      score: 5,
      level: "actif",
      reason: "Ville moyenne avec dynamique entrepreneuriale équilibrée. Création nette SIRENE neutre à légèrement positive.",
    };
  }
  return {
    score: 6,
    level: "tendu",
    reason: "Tissu économique limité — faible création nette d'entreprises hors auto-entrepreneurs.",
  };
}

// ─── Mix sectoriel / résilience du tissu économique ───────────────────────
//
// Une économie diversifiée (services, industrie, public) résiste mieux aux
// chocs sectoriels qu'une monoculture (tourisme uniquement, industrie unique,
// agriculture uniquement).

const MONO_TOURISM_DEPTS = new Set([
  "Var", "Alpes-Maritimes", "Corse-du-Sud", "Haute-Corse", "Hautes-Alpes",
  "Pyrénées-Orientales",
]);

const INDUSTRIAL_LEGACY_DEPTS = new Set([
  // Anciens bassins mono-industriels en reconversion
  "Pas-de-Calais", "Nord", "Moselle", "Meurthe-et-Moselle", "Ardennes",
  "Loire", "Aisne",
]);

const PUBLIC_SECTOR_HEAVY_DEPTS = new Set([
  // Préfectures avec poids public important — résiliente mais peu dynamique
  "Lozère", "Creuse", "Cantal", "Indre", "Nièvre", "Meuse", "Haute-Marne",
]);

function sectorMixRisk(city: CitySeed): JobDimension {
  const d = city.department;
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags) || pop > 200_000;
  const isMonoTourism = MONO_TOURISM_DEPTS.has(d) && /tourist|station|balnéaire/.test(tags);
  const isIndustrialLegacy = INDUSTRIAL_LEGACY_DEPTS.has(d);
  const isPublicHeavy = PUBLIC_SECTOR_HEAVY_DEPTS.has(d);

  if (isMetro) {
    return {
      score: 2.5,
      level: "facile",
      reason: "Grande métropole — mix sectoriel diversifié (services, public, industrie, recherche). Résilience élevée face aux chocs sectoriels.",
    };
  }
  if (isMonoTourism) {
    return {
      score: 7,
      level: "tendu",
      reason: "Économie mono-touristique — emplois saisonniers (avril-octobre), peu de stabilité hors saison. Hôtellerie-restauration domine.",
    };
  }
  if (isIndustrialLegacy) {
    return {
      score: 6.5,
      level: "tendu",
      reason: "Ancien bassin mono-industriel en reconversion — héritage chômage longue durée, transition vers services en cours mais lente.",
    };
  }
  if (isPublicHeavy) {
    return {
      score: 5.5,
      level: "actif",
      reason: "Économie portée par l'emploi public (préfecture, hôpital, conseil départemental) — stable mais peu de renouvellement privé.",
    };
  }
  return {
    score: 4,
    level: "actif",
    reason: "Mix sectoriel équilibré (services, commerce, artisanat, un peu de public et d'industrie). Bonne capacité d'absorption.",
  };
}

// ─── Salaire net médian par département (INSEE DADS) ──────────────────────
//
// Moyenne France métropolitaine : ~2 100 € net/mois.
//
// Très bas (score 8)  : DROM, Creuse, Nièvre, Indre, Lozère, Cantal,
//   Haute-Marne, Meuse, Cher, Allier — médian souvent < 1 850 €.
// Bas (score 6)       : Aisne, Ardennes, Vosges, Haute-Saône, Yonne, Aube,
//   Loiret hors agglo, Pas-de-Calais, Somme, Manche, Mayenne — 1 850-1 950 €.
// Moyen (score 4.5)   : la plupart des dépts médians — 1 950-2 100 €.
// Bon (score 2.5)     : Ille-et-Vilaine, Loire-Atlantique, Haute-Savoie,
//   Savoie, Doubs, Rhône, Métropole de Lyon, Bas-Rhin, Pyrénées-Atlantiques,
//   Haute-Garonne, Bouches-du-Rhône — 2 100-2 300 €.
// Élevé (score 1)     : Paris, Hauts-de-Seine, Yvelines, Val-de-Marne,
//   Val-d'Oise, Essonne, Seine-et-Marne — médian > 2 400 €.

const SALARY_VERY_LOW_DEPTS = new Set([
  "Guadeloupe", "Martinique", "Réunion", "La Réunion", "Mayotte", "Guyane",
  "Creuse", "Nièvre", "Indre", "Lozère", "Cantal", "Haute-Marne", "Meuse",
  "Cher", "Allier",
]);

const SALARY_LOW_DEPTS = new Set([
  "Aisne", "Ardennes", "Vosges", "Haute-Saône", "Yonne", "Aube",
  "Pas-de-Calais", "Somme", "Manche", "Mayenne", "Orne", "Sarthe",
  "Loiret", "Ariège", "Hautes-Pyrénées", "Lot", "Tarn-et-Garonne",
]);

const SALARY_GOOD_DEPTS = new Set([
  "Ille-et-Vilaine", "Loire-Atlantique", "Haute-Savoie", "Savoie", "Doubs",
  "Rhône", "Métropole de Lyon", "Bas-Rhin", "Pyrénées-Atlantiques",
  "Haute-Garonne", "Bouches-du-Rhône", "Hérault", "Côte-d'Or",
]);

const SALARY_HIGH_DEPTS = new Set([
  "Paris", "Hauts-de-Seine", "Yvelines", "Val-de-Marne",
  "Val-d'Oise", "Essonne", "Seine-et-Marne", "Seine-Saint-Denis",
]);

function salaryRisk(city: CitySeed): JobDimension {
  const d = city.department;
  if (SALARY_HIGH_DEPTS.has(d)) {
    return {
      score: 1,
      level: "facile",
      reason: "Salaire net médian départemental > 2 400 €/mois (INSEE DADS). Marché parisien et grande couronne — pouvoir d'achat à arbitrer avec le loyer.",
    };
  }
  if (SALARY_GOOD_DEPTS.has(d)) {
    return {
      score: 2.5,
      level: "facile",
      reason: "Salaire net médian départemental 2 100-2 300 €/mois (INSEE DADS). Bon ratio salaire/coût de la vie dans plusieurs métropoles.",
    };
  }
  if (SALARY_VERY_LOW_DEPTS.has(d)) {
    return {
      score: 8,
      level: "sinistre",
      reason: "Salaire net médian départemental < 1 850 €/mois (INSEE DADS). Pouvoir d'achat structurellement limité.",
    };
  }
  if (SALARY_LOW_DEPTS.has(d)) {
    return {
      score: 6,
      level: "tendu",
      reason: "Salaire net médian départemental 1 850-1 950 €/mois (INSEE DADS) — sous la moyenne nationale.",
    };
  }
  return {
    score: 4.5,
    level: "actif",
    reason: "Salaire net médian départemental proche de la moyenne nationale (~2 100 €/mois INSEE DADS).",
  };
}

// ─── Composite ────────────────────────────────────────────────────────────

function composeSignature(e: EmploymentMarket, name: string): string {
  const tops = [
    { k: "chômage", d: e.unemployment },
    { k: "salaires", d: e.salary },
    { k: "dynamisme", d: e.dynamism },
    { k: "mix sectoriel", d: e.sectorMix },
  ]
    .filter((x) => x.d.level === "tendu" || x.d.level === "sinistre")
    .sort((a, b) => b.d.score - a.d.score);

  if (tops.length === 0) {
    return `${name} présente un marché du travail favorable sur les 4 dimensions clés.`;
  }
  if (tops.length === 1) {
    return `${name} est principalement tendue sur le facteur « ${tops[0].k} » (${tops[0].d.level === "sinistre" ? "sinistré" : "tendu"}).`;
  }
  return `${name} cumule plusieurs tensions sur le marché du travail : ${tops.slice(0, 2).map((t) => `${t.k} (${t.d.level === "sinistre" ? "sinistré" : "tendu"})`).join(", ")}.`;
}

export function computeEmploymentMarket(city: CitySeed): EmploymentMarket {
  const unemployment = unemploymentRisk(city);
  const dynamism = dynamismRisk(city);
  const sectorMix = sectorMixRisk(city);
  const salary = salaryRisk(city);
  // Pondération : chômage 35 % (porte d'entrée du diagnostic), salaire 25 %
  // (pouvoir d'achat), dynamisme 20 % (perspectives), mix 20 % (résilience).
  const composite =
    Math.round(
      (unemployment.score * 0.35 + salary.score * 0.25 + dynamism.score * 0.2 + sectorMix.score * 0.2) * 10
    ) / 10;
  const out: EmploymentMarket = {
    composite,
    level: levelFromScore(composite),
    unemployment,
    dynamism,
    sectorMix,
    salary,
    signature: "",
  };
  out.signature = composeSignature(out, city.name);
  return out;
}

// ─── Rankings ─────────────────────────────────────────────────────────────

export interface EmploymentRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  market: EmploymentMarket;
}

let EMP_RANKING_CACHE: EmploymentRanking[] | null = null;

export function getEmploymentRankings(): EmploymentRanking[] {
  if (EMP_RANKING_CACHE) return EMP_RANKING_CACHE;
  EMP_RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    market: computeEmploymentMarket(c),
  }));
  return EMP_RANKING_CACHE;
}

export function topMostFavorable(limit = 30, minPopulation = 0): EmploymentRanking[] {
  return getEmploymentRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.market.composite - b.market.composite)
    .slice(0, limit);
}

export function topMostDifficult(limit = 20, minPopulation = 0): EmploymentRanking[] {
  return getEmploymentRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.market.composite - a.market.composite)
    .slice(0, limit);
}

export const JOB_LEVEL_LABEL: Record<JobLevel, string> = {
  facile: "Facile",
  actif: "Actif",
  tendu: "Tendu",
  sinistre: "Sinistré",
};

export const JOB_LEVEL_COLOR: Record<JobLevel, string> = {
  facile: "text-emerald-600",
  actif: "text-amber-600",
  tendu: "text-orange-600",
  sinistre: "text-red-600",
};

export const JOB_LEVEL_BG: Record<JobLevel, string> = {
  facile: "bg-emerald-50 border-emerald-200",
  actif: "bg-amber-50 border-amber-200",
  tendu: "bg-orange-50 border-orange-200",
  sinistre: "bg-red-50 border-red-200",
};
