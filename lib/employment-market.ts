// F50 — Emploi & marché du travail par ville
//
// 4 dimensions. Depuis le 2026-11-01, trois sont MESURÉES quand la commune est
// couverte (591/593 villes, `lib/city-employment.ts`, Insee) :
//   - chômage : taux des 15-64 ans au sens du recensement 2023, pour les
//     habitants de la commune (plus haut que le taux BIT trimestriel) ;
//   - dynamisme : évolution des emplois situés dans la commune, 2017 → 2023 ;
//   - salaires : salaire net mensuel moyen EQTP des emplois privés situés dans
//     la commune (base tous salariés 2024).
// Le mix sectoriel reste ESTIMÉ. Hors couverture, les dimensions retombent
// sur les paliers estimés ci-dessous (`*Ladder`), calés sur ces repères :
//
// Sources de référence des paliers estimés :
//   - INSEE : taux de chômage trimestriel par département (T4 2024 dernière
//     publication disponible). https://www.insee.fr/fr/statistiques.
//   - DARES (dares.travail-emploi.gouv.fr) : statistiques chômage longue durée,
//     demandes d'emploi par catégorie (A, B, C, D, E).
//   - SIRENE (data.insee.fr/sirene) : flux quotidien de création / cessation
//     d'établissements — agrégeable par département.
//   - INSEE salaires : salaire net mensuel médian par département (DADS).
//
// **Convention** : tous les scores 0-10, 10 = marché du travail le plus
// difficile (chômage haut, salaires bas), cohérent avec le quartet env F40-F43.
// Mais les surfaces s'appellent « Emploi », c'est-à-dire une QUALITÉ : elles
// affichent donc `10 - score` et annoncent « 10 = marché dynamique ».
// L'inversion se fait au site d'affichage seulement — tris, niveaux et
// classements gardent la valeur brute. ⚠️ Vaut aussi pour la COULEUR : une
// tranche de chômage bas doit être verte, pas orange (bug corrigé sur
// /villes/[slug]/statistiques + jumelle EN, 2026-08-07).
// Composite = moyenne pondérée des 4 sous-scores.

import type { CityLight } from "@/lib/cities-light";
import {
  JOB_GROWTH_NATIONAL,
  JOBS_FROM,
  RP_YEAR,
  SALARY_NATIONAL,
  UNEMPLOYMENT_NATIONAL,
  cityEmploymentMeasure,
  type CityEmploymentMeasure,
} from "@/lib/city-employment";

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
  /** Relevés Insee de la commune, null hors couverture (paliers estimés). */
  measured: CityEmploymentMeasure | null;
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
  "Ariège", "Tarn", "Charente-Maritime", "Eure", "Somme", "Oise",
  "Indre", "Cher", "Allier", "Nièvre", "Yonne", "Aube", "Nord",
  "Alpes-Maritimes", "Corse-du-Sud", "Haute-Corse",
]);

const UNEMP_LOW = new Set([
  "Pyrénées-Atlantiques", "Haute-Savoie", "Savoie", "Doubs", "Bas-Rhin",
  "Maine-et-Loire", "Loire-Atlantique", "Ille-et-Vilaine", "Finistère",
  "Côtes-d'Armor", "Vendée", "Manche", "Calvados",
  "Ain", "Jura", "Haut-Rhin", "Loire", "Rhône",
  "Métropole de Lyon",
]);

const UNEMP_VERY_LOW = new Set([
  "Lozère", "Cantal", "Mayenne", "Aveyron",
]);

function unemploymentLadder(city: CityLight): JobDimension {
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

function dynamismLadder(city: CityLight): JobDimension {
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
      reason: "Commune rurale à faible création d'entreprises — solde net d'établissements estimé négatif, dans l'esprit des séries SIRENE, peu de renouvellement du tissu local.",
    };
  }
  if (isMetro && (isDynamic || isAttractive)) {
    return {
      score: 1.5,
      level: "facile",
      reason: "Grande métropole dynamique — création nette d'établissements estimée soutenue (repère SIRENE), écosystème actif (start-ups, services, indépendants).",
    };
  }
  if (isAttractive || (isMetro && pop > 100_000)) {
    return {
      score: 3,
      level: "facile",
      reason: "Département classé attractif par le modèle, solde net d'établissements estimé positif (repère SIRENE). Création régulière de TPE, présence d'incubateurs et de tiers-lieux.",
    };
  }
  if (pop > 50_000) {
    return {
      score: 5,
      level: "actif",
      reason: "Ville moyenne avec dynamique entrepreneuriale équilibrée. Création nette d'établissements estimée neutre à légèrement positive (repère SIRENE).",
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

function sectorMixRisk(city: CityLight): JobDimension {
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
  // Seine-Saint-Denis : médian net ~1 950 €/mois (INSEE DADS 2023) — le
  // plus bas d'Île-de-France. Classer en "élevé" comme le reste de la
  // grande couronne était une erreur.
  "Seine-Saint-Denis",
]);

const SALARY_GOOD_DEPTS = new Set([
  "Ille-et-Vilaine", "Loire-Atlantique", "Haute-Savoie", "Savoie", "Doubs",
  "Rhône", "Métropole de Lyon", "Bas-Rhin", "Pyrénées-Atlantiques",
  "Haute-Garonne", "Bouches-du-Rhône", "Hérault", "Côte-d'Or",
]);

const SALARY_HIGH_DEPTS = new Set([
  "Paris", "Hauts-de-Seine", "Yvelines", "Val-de-Marne",
  "Val-d'Oise", "Essonne", "Seine-et-Marne",
]);

function salaryLadder(city: CityLight): JobDimension {
  const d = city.department;
  if (SALARY_HIGH_DEPTS.has(d)) {
    return {
      score: 1,
      level: "facile",
      reason: "Palier salaire haut : médiane départementale estimée au-delà de 2 400 €/mois, calée sur les ordres de grandeur INSEE DADS. Marché parisien et grande couronne — pouvoir d'achat à arbitrer avec le loyer.",
    };
  }
  if (SALARY_GOOD_DEPTS.has(d)) {
    return {
      score: 2.5,
      level: "facile",
      reason: "Palier salaire correct : médiane départementale estimée entre 2 100 et 2 300 €/mois (repères INSEE DADS). Bon ratio salaire/coût de la vie dans plusieurs métropoles.",
    };
  }
  if (SALARY_VERY_LOW_DEPTS.has(d)) {
    return {
      score: 8,
      level: "sinistre",
      reason: "Palier salaire bas : médiane départementale estimée sous 1 850 €/mois (repères INSEE DADS). Pouvoir d'achat structurellement limité.",
    };
  }
  if (SALARY_LOW_DEPTS.has(d)) {
    return {
      score: 6,
      level: "tendu",
      reason: "Palier salaire modeste : médiane départementale estimée entre 1 850 et 1 950 €/mois (repères INSEE DADS), sous la moyenne nationale.",
    };
  }
  return {
    score: 4.5,
    level: "actif",
    reason: "Palier salaire médian : médiane départementale estimée proche de la moyenne nationale, de l'ordre de 2 100 €/mois (repères INSEE DADS).",
  };
}

/**
 * Palier de salaire départemental ESTIMÉ (1 / 2,5 / 4,5 / 6 / 8), indépendant
 * des relevés. Les thèmes red flags « coûts explosifs » et « chauffage » le
 * convertissent en une médiane départementale approchée (`SALARY_PROXY`) :
 * le salaire mesuré, une moyenne des emplois privés situés dans la commune,
 * n'est pas la même grandeur et aurait recalé leurs seuils en silence.
 */
export function estimatedDeptSalaryTier(city: CityLight): number {
  return salaryLadder(city).score;
}

// ─── Dimensions mesurées (Insee) ──────────────────────────────────────────
//
// Barèmes continus par interpolation linéaire entre ancres, centrés sur la
// valeur France du même relevé.

function interpolate(x: number, anchors: readonly (readonly [number, number])[]): number {
  if (x <= anchors[0][0]) return anchors[0][1];
  for (let i = 1; i < anchors.length; i++) {
    const [x1, y1] = anchors[i];
    if (x <= x1) {
      const [x0, y0] = anchors[i - 1];
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return anchors[anchors.length - 1][1];
}
const round1 = (n: number) => Math.round(n * 10) / 10;
const fr1 = (n: number) => n.toFixed(1).replace(".", ",");
const eur = (n: number) => `${n.toLocaleString("fr-FR")} €`;
const cmp = (v: number, ref: number, tol: number) => (v > ref + tol ? "au-dessus" : v < ref - tol ? "en dessous" : "proche");

// Chômage (recensement, 15-64 ans) → score, 10 = pire. France ≈ 11,4 %.
// « Sinistré » à partir de 18 %, « facile » sous ~9,7 %.
const UNEMP_ANCHORS = [
  [6, 1.0],
  [9, 3.0],
  [11.4, 4.5],
  [14, 6.0],
  [18, 7.5],
  [25, 9.0],
  [35, 9.5],
] as const;

function unemploymentMeasured(rate: number): JobDimension {
  const score = round1(interpolate(rate, UNEMP_ANCHORS));
  const where = cmp(rate, UNEMPLOYMENT_NATIONAL, 0.5);
  return {
    score,
    level: levelFromScore(score),
    reason: `${fr1(rate)} % de chômeurs parmi les actifs de 15 à 64 ans (Insee, recensement ${RP_YEAR}), ${where === "proche" ? "proche de" : where === "au-dessus" ? "au-dessus de" : "en dessous de"} la moyenne française de ${fr1(UNEMPLOYMENT_NATIONAL)} % sur la même mesure. Le recensement compte le chômage déclaré : il tourne plus haut que le taux trimestriel du BIT.`,
  };
}

// Évolution des emplois situés dans la commune, 2017 → 2023 → score.
// France : +6,6 %. Un recul de plus de 3 % est « sinistré ».
const GROWTH_ANCHORS = [
  [-10, 9.0],
  [-3, 7.5],
  [2, 5.5],
  [6.6, 4.0],
  [12, 2.5],
  [20, 1.5],
] as const;

function dynamismMeasured(growth: number, jobs: number): JobDimension {
  const score = round1(interpolate(growth, GROWTH_ANCHORS));
  const sign = growth > 0 ? "+" : growth < 0 ? "−" : "";
  return {
    score,
    level: levelFromScore(score),
    reason: `${jobs.toLocaleString("fr-FR")} emplois situés dans la commune en ${RP_YEAR}, soit ${sign}${fr1(Math.abs(growth))} % depuis ${JOBS_FROM} (Insee, recensement), contre +${fr1(JOB_GROWTH_NATIONAL)} % pour la France.`,
  };
}

// Salaire net mensuel moyen EQTP des emplois privés de la commune → score.
// France : 2 733 € (moyenne tirée par l'Île-de-France) ; médiane des villes
// du site ≈ 2 400 €.
const SALARY_ANCHORS = [
  [1950, 9.0],
  [2150, 7.5],
  [2350, 5.5],
  [2550, 4.0],
  [2900, 2.5],
  [3400, 1.0],
] as const;

function salaryMeasured(salary: number): JobDimension {
  const score = round1(interpolate(salary, SALARY_ANCHORS));
  return {
    score,
    level: levelFromScore(score),
    reason: `${eur(salary)} net par mois en moyenne, en équivalent temps plein, pour les emplois du secteur privé situés dans la commune (Insee, base tous salariés), contre ${eur(SALARY_NATIONAL)} pour la France. C'est une moyenne, tirée vers le haut par les hauts salaires, et le salaire du lieu de travail, pas celui des habitants.`,
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

export function computeEmploymentMarket(city: CityLight): EmploymentMarket {
  const measured = cityEmploymentMeasure(city.slug);
  const unemployment =
    measured?.unemployment !== undefined ? unemploymentMeasured(measured.unemployment) : unemploymentLadder(city);
  const dynamism =
    measured?.jobGrowth !== undefined && measured.jobs !== undefined
      ? dynamismMeasured(measured.jobGrowth, measured.jobs)
      : dynamismLadder(city);
  const sectorMix = sectorMixRisk(city);
  const salary = measured?.salary !== undefined ? salaryMeasured(measured.salary) : salaryLadder(city);
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
    measured,
  };
  out.signature = composeSignature(out, city.name);
  return out;
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
