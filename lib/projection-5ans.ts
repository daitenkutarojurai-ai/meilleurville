// R9.5 — Projection 5 ans : où devrais-je vivre dans 5 ans ?
//
// Différent de City Match (affinités présentes) et Future You (budget/temps
// concrets aujourd'hui) : ici on projette une TRAJECTOIRE de vie sur 5 ans,
// applique des modificateurs de style de vie futurs et intègre le risque
// climatique 2040 via lib/climate-2040.ts.
//
// Convention : score 0-100. Axes seeds 0-10, 10 = bon (cohérent avec R7.3).
// Climate 2040 : pénalité appliquée APRÈS les modificateurs de trajectoire.

import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { projectClimate2040 } from "@/lib/climate-2040";

export type LifeStageIn5Years =
  | "same"
  | "with_partner"
  | "with_kids"
  | "kids_growing"
  | "remote_full"
  | "retiring"
  | "freelance";

export type BudgetTrajectory = "stable" | "growing" | "downsizing" | "buying";

export type ProjectionPriority =
  | "cost"
  | "nature"
  | "safety"
  | "culture"
  | "schools"
  | "remote"
  | "transport";

export interface ProjectionInput {
  currentCity: string; // slug ("" = inconnu)
  lifeIn5Years: LifeStageIn5Years;
  budgetTraj: BudgetTrajectory;
  climateSensitivity: "low" | "med" | "high";
  priorities: ProjectionPriority[];
}

export interface ProjectionResult {
  city: CitySeed;
  score: number; // 0-100
  delta: number | null; // score vs currentCity (null if unknown)
  climateRisk: "low" | "med" | "high";
  trajectoryFit: string; // raison courte en français
  topAxes: Array<{ key: string; label: string; score: number }>;
}

// Poids de base par axe (sera multiplié par les modificateurs de trajectoire)
type AxisWeights = {
  cost: number;
  nature: number;
  safety: number;
  culture: number;
  schools: number;
  remoteWork: number;
  transport: number;
};

function defaultWeights(): AxisWeights {
  return {
    cost: 1.0,
    nature: 1.0,
    safety: 1.0,
    culture: 1.0,
    schools: 1.0,
    remoteWork: 1.0,
    transport: 1.0,
  };
}

function applyLifeStageModifiers(w: AxisWeights, stage: LifeStageIn5Years): AxisWeights {
  const r = { ...w };
  switch (stage) {
    case "with_kids":
    case "kids_growing":
      r.safety *= 1.4;
      r.schools *= 1.4;
      r.cost *= 0.8;
      r.culture *= 0.85;
      break;
    case "retiring":
      r.nature *= 1.3;
      r.cost *= 1.3;
      r.safety *= 1.2;
      r.culture *= 0.7;
      r.transport *= 0.8;
      r.schools *= 0.4;
      break;
    case "remote_full":
      r.remoteWork *= 1.5;
      r.cost *= 1.3;
      r.transport *= 0.3;
      r.nature *= 1.1;
      break;
    case "freelance":
      r.remoteWork *= 1.4;
      r.cost *= 1.2;
      r.culture *= 1.1;
      break;
    case "with_partner":
      r.culture *= 1.1;
      r.nature *= 1.05;
      break;
    case "same":
    default:
      break;
  }
  return r;
}

function applyBudgetModifiers(
  w: AxisWeights,
  traj: BudgetTrajectory,
  city: CitySeed,
): AxisWeights {
  const r = { ...w };
  switch (traj) {
    case "downsizing":
      r.cost *= 1.3;
      r.culture *= 0.85;
      break;
    case "growing":
      // Budget croissant — relâche la contrainte coût, valorise la qualité de vie
      r.cost *= 0.85;
      r.culture *= 1.1;
      r.nature *= 1.05;
      break;
    case "buying":
      // Boost si prix d'achat < 3 000 €/m²
      {
        const housing = HOUSING[city.slug];
        if (housing && housing.avgBuyPriceM2 < 3000) r.cost *= 1.25;
      }
      break;
    case "stable":
    default:
      break;
  }
  return r;
}

// Risque climatique dérivé de lib/climate-2040.ts (projectedDays30C à horizon 2040)
function climateRiskFor(
  city: CitySeed,
  sensitivity: ProjectionInput["climateSensitivity"],
): "low" | "med" | "high" {
  const proj = projectClimate2040(city);
  const days = proj.projectedDays30C;
  // Les DROM sont toujours high
  if (city.latitude != null && city.longitude != null) {
    const inMetro =
      city.longitude >= -6 &&
      city.longitude <= 10 &&
      city.latitude >= 40 &&
      city.latitude <= 52;
    if (!inMetro) return "high";
  }
  if (sensitivity === "low") {
    return days >= 50 ? "med" : "low";
  }
  if (sensitivity === "high") {
    if (days >= 30) return "high";
    if (days >= 15) return "med";
    return "low";
  }
  // med
  if (days >= 40) return "high";
  if (days >= 20) return "med";
  return "low";
}

// Pénalité score (0-15 points) selon risque climatique et sensibilité
function climatePenalty(
  risk: "low" | "med" | "high",
  sensitivity: ProjectionInput["climateSensitivity"],
): number {
  if (sensitivity === "low") return risk === "high" ? 5 : 0;
  if (sensitivity === "high") {
    if (risk === "high") return 15;
    if (risk === "med") return 7;
    return 0;
  }
  // med
  if (risk === "high") return 10;
  if (risk === "med") return 4;
  return 0;
}

const PRIORITY_TO_AXIS: Record<ProjectionPriority, keyof CitySeed["scores"]> = {
  cost: "cost",
  nature: "nature",
  safety: "safety",
  culture: "culture",
  schools: "schools",
  remote: "remoteWork",
  transport: "transport",
};

const AXIS_LABELS: Record<string, string> = {
  cost: "Coût de la vie",
  nature: "Nature",
  safety: "Sécurité",
  culture: "Culture",
  schools: "Écoles",
  remoteWork: "Télétravail",
  transport: "Transport",
  life: "Qualité de vie",
};

function trajectoryFitText(
  city: CitySeed,
  stage: LifeStageIn5Years,
  traj: BudgetTrajectory,
  score: number,
): string {
  const name = city.name;
  const s = city.scores;

  const stageTexts: Partial<Record<LifeStageIn5Years, string>> = {
    with_kids: s.schools >= 7 && s.safety >= 7
      ? `${name} combine sécurité (${s.safety.toFixed(1)}/10) et un bon réseau scolaire (${s.schools.toFixed(1)}/10) — un socle solide pour élever des enfants.`
      : s.schools >= 7
      ? `Côté écoles, ${name} marque ${s.schools.toFixed(1)}/10 — bon point pour l'avenir proche.`
      : `${name} offre un cadre de vie équilibré qui peut convenir à une famille.`,
    kids_growing:
      s.culture >= 7
        ? `Pour des ados, ${name} a de quoi faire (culture ${s.culture.toFixed(1)}/10) sans sacrifier le calme.`
        : `${name} est un cadre stable où des enfants grandissant ont de l'espace.`,
    retiring:
      s.cost >= 7 && s.safety >= 7
        ? `${name} est difficile à battre pour la retraite : coût maîtrisé (${s.cost.toFixed(1)}/10) et sécurité (${s.safety.toFixed(1)}/10).`
        : s.nature >= 7.5
        ? `La nature autour de ${name} (${s.nature.toFixed(1)}/10) est un vrai atout pour vivre à un rythme plus doux.`
        : `${name} offre un bon équilibre pour une retraite tranquille.`,
    remote_full:
      s.remoteWork >= 7
        ? `${name} est calibrée pour le télétravail (${s.remoteWork.toFixed(1)}/10) : bonne fibre et coûts de vie raisonnables.`
        : `Le cadre de ${name} convient bien au télétravail — moins de frictions qu'en grande métropole.`,
    freelance:
      s.remoteWork >= 7 && s.cost >= 6.5
        ? `Freelance à ${name} : infrastructure correcte (${s.remoteWork.toFixed(1)}/10) et coûts qui laissent de la marge.`
        : `${name} offre un environnement propice au travail indépendant.`,
    with_partner:
      s.culture >= 7 && s.life >= 7
        ? `À deux à ${name} : qualité de vie (${s.life.toFixed(1)}/10) et vie culturelle (${s.culture.toFixed(1)}/10) au rendez-vous.`
        : `${name} est un bon choix pour un projet à deux.`,
    same: `${name} correspond bien à vos priorités sur l'horizon 5 ans.`,
  };

  const budgetOverride: Partial<Record<BudgetTrajectory, string>> = {
    buying: (() => {
      const h = HOUSING[city.slug];
      return h && h.avgBuyPriceM2 < 3000
        ? ` Marché accessible (≈ ${h.avgBuyPriceM2.toLocaleString("fr-FR")} €/m²) — une fenêtre d'achat à saisir.`
        : "";
    })(),
    downsizing: s.cost >= 7 ? ` Coût de la vie bien maîtrisé (${s.cost.toFixed(1)}/10).` : "",
  };

  const base = stageTexts[stage] ?? `${name} marque ${score}/100 sur votre trajectoire.`;
  const extra = budgetOverride[traj] ?? "";
  return base + extra;
}

function scoreCity(city: CitySeed, input: ProjectionInput): number {
  let weights = defaultWeights();
  weights = applyLifeStageModifiers(weights, input.lifeIn5Years);
  weights = applyBudgetModifiers(weights, input.budgetTraj, city);

  // Boost priorities supplémentaires
  for (const p of input.priorities) {
    const axis = PRIORITY_TO_AXIS[p] as keyof AxisWeights;
    if (axis in weights) {
      (weights as Record<string, number>)[axis] =
        ((weights as Record<string, number>)[axis] ?? 1) * 1.25;
    }
  }

  const s = city.scores;

  // Score pondéré : somme(axe × poids) / somme(poids)
  const axes: Array<{ val: number; w: number }> = [
    { val: s.cost,       w: weights.cost },
    { val: s.nature,     w: weights.nature },
    { val: s.safety,     w: weights.safety },
    { val: s.culture,    w: weights.culture },
    { val: s.schools,    w: weights.schools },
    { val: s.remoteWork, w: weights.remoteWork },
    { val: s.transport,  w: weights.transport },
  ];

  const totalWeight = axes.reduce((sum, a) => sum + a.w, 0);
  const weightedSum = axes.reduce((sum, a) => sum + a.val * a.w, 0);
  const rawScore = totalWeight > 0 ? (weightedSum / totalWeight) * 10 : 0; // 0-100

  return rawScore;
}

function topAxesFor(city: CitySeed, priorities: ProjectionPriority[]): Array<{ key: string; label: string; score: number }> {
  const s = city.scores;
  const all = [
    { key: "cost",       score: s.cost },
    { key: "nature",     score: s.nature },
    { key: "safety",     score: s.safety },
    { key: "culture",    score: s.culture },
    { key: "schools",    score: s.schools },
    { key: "remoteWork", score: s.remoteWork },
    { key: "transport",  score: s.transport },
    { key: "life",       score: s.life },
  ];
  // Prioritize explicitly selected axes, then by score
  const priorityAxisKeys = priorities.map((p) => PRIORITY_TO_AXIS[p] as string);
  const sorted = all
    .map((a) => ({
      ...a,
      label: AXIS_LABELS[a.key] ?? a.key,
      boost: priorityAxisKeys.includes(a.key) ? 100 : 0,
    }))
    .sort((a, b) => (b.boost + b.score) - (a.boost + a.score));
  return sorted.slice(0, 3).map(({ key, label, score }) => ({ key, label, score }));
}

function metroBbox(c: CitySeed): boolean {
  return (
    c.longitude >= -6 &&
    c.longitude <= 10 &&
    c.latitude >= 40 &&
    c.latitude <= 52
  );
}

export function computeProjection(
  input: ProjectionInput,
  n = 10,
): ProjectionResult[] {
  const currentCity = input.currentCity
    ? CITIES_SEED.find((c) => c.slug === input.currentCity) ?? null
    : null;

  const currentScore = currentCity ? scoreCity(currentCity, input) : null;

  const results = CITIES_SEED
    .filter(metroBbox)
    .map((city) => {
      const raw = scoreCity(city, input);
      const risk = climateRiskFor(city, input.climateSensitivity);
      const penalty = climatePenalty(risk, input.climateSensitivity);
      const score = Math.max(0, Math.min(100, Math.round(raw - penalty)));
      const delta = currentScore != null ? score - Math.round(currentScore) : null;

      return {
        city,
        score,
        delta,
        climateRisk: risk,
        trajectoryFit: trajectoryFitText(city, input.lifeIn5Years, input.budgetTraj, score),
        topAxes: topAxesFor(city, input.priorities),
      } satisfies ProjectionResult;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n);

  return results;
}

/** Top 3 + un match surprise (premier hors top 15 avec score >= 55). */
export function projectionWithSurprise(
  input: ProjectionInput,
): { top: ProjectionResult[]; surprise: ProjectionResult | null } {
  const all = (() => {
    const currentCity = input.currentCity
      ? CITIES_SEED.find((c) => c.slug === input.currentCity) ?? null
      : null;
    const currentScore = currentCity ? scoreCity(currentCity, input) : null;

    return CITIES_SEED
      .filter(metroBbox)
      .map((city) => {
        const raw = scoreCity(city, input);
        const risk = climateRiskFor(city, input.climateSensitivity);
        const penalty = climatePenalty(risk, input.climateSensitivity);
        const score = Math.max(0, Math.min(100, Math.round(raw - penalty)));
        const delta = currentScore != null ? score - Math.round(currentScore) : null;

        return {
          city,
          score,
          delta,
          climateRisk: risk,
          trajectoryFit: trajectoryFitText(city, input.lifeIn5Years, input.budgetTraj, score),
          topAxes: topAxesFor(city, input.priorities),
        } satisfies ProjectionResult;
      })
      .sort((a, b) => b.score - a.score);
  })();

  const top = all.slice(0, 3);
  const surprise = all.slice(15, 60).find((r) => r.score >= 55) ?? null;
  return { top, surprise };
}

// --- Permalink encoding -------------------------------------------------------
// Encode/decode inputs as a compact string for URL hash sharing.

export function encodeProjectionInput(input: ProjectionInput): string {
  const parts = [
    input.currentCity || "_",
    input.lifeIn5Years,
    input.budgetTraj,
    input.climateSensitivity,
    input.priorities.join(",") || "_",
  ];
  return parts.join("|");
}

export function decodeProjectionInput(code: string): ProjectionInput | null {
  try {
    const [city, stage, budget, climate, prios] = code.split("|");
    const validStages: LifeStageIn5Years[] = [
      "same", "with_partner", "with_kids", "kids_growing", "remote_full", "retiring", "freelance",
    ];
    const validBudgets: BudgetTrajectory[] = ["stable", "growing", "downsizing", "buying"];
    const validClimate = ["low", "med", "high"] as const;
    const validPrios: ProjectionPriority[] = [
      "cost", "nature", "safety", "culture", "schools", "remote", "transport",
    ];

    if (!validStages.includes(stage as LifeStageIn5Years)) return null;
    if (!validBudgets.includes(budget as BudgetTrajectory)) return null;
    if (!validClimate.includes(climate as "low" | "med" | "high")) return null;

    const priorities = (prios === "_" ? [] : prios.split(","))
      .filter((p): p is ProjectionPriority => validPrios.includes(p as ProjectionPriority));

    return {
      currentCity: city === "_" ? "" : city,
      lifeIn5Years: stage as LifeStageIn5Years,
      budgetTraj: budget as BudgetTrajectory,
      climateSensitivity: climate as "low" | "med" | "high",
      priorities,
    };
  } catch {
    return null;
  }
}

// Meta labels for UI
export const LIFE_STAGE_META: Record<
  LifeStageIn5Years,
  { label: string; emoji: string; desc: string }
> = {
  same:          { label: "Même situation",         emoji: "🙂", desc: "Ma vie reste à peu près la même" },
  with_partner:  { label: "En couple",               emoji: "💑", desc: "Je serai en couple (ou l'étais déjà)" },
  with_kids:     { label: "Famille avec enfants",    emoji: "👨‍👩‍👧", desc: "J'aurai des enfants en bas âge" },
  kids_growing:  { label: "Enfants au collège/lycée",emoji: "🏫", desc: "Mes enfants seront ados" },
  remote_full:   { label: "Télétravail 100 %",       emoji: "🏠", desc: "Je travaillerai full remote" },
  retiring:      { label: "À la retraite (ou proche)",emoji: "🌅", desc: "Je prendrai ma retraite d'ici 5 ans" },
  freelance:     { label: "Freelance / indépendant",  emoji: "💻", desc: "Je serai à mon compte" },
};

export const BUDGET_TRAJ_META: Record<
  BudgetTrajectory,
  { label: string; emoji: string; desc: string }
> = {
  stable:    { label: "Stable",           emoji: "⚖️", desc: "Revenus similaires à aujourd'hui" },
  growing:   { label: "En hausse",        emoji: "📈", desc: "J'anticipe une progression de mes revenus" },
  downsizing:{ label: "Budget réduit",    emoji: "🪙", desc: "Je vais réduire mon train de vie" },
  buying:    { label: "Je veux acheter",  emoji: "🏡", desc: "L'achat immobilier est un projet concret" },
};

export const PROJECTION_PRIORITY_META: Record<
  ProjectionPriority,
  { label: string; emoji: string }
> = {
  cost:      { label: "Coût de la vie",  emoji: "💸" },
  nature:    { label: "Nature",           emoji: "🌳" },
  safety:    { label: "Sécurité",         emoji: "🛡️" },
  culture:   { label: "Culture",          emoji: "🎭" },
  schools:   { label: "Écoles",           emoji: "🏫" },
  remote:    { label: "Télétravail",      emoji: "💻" },
  transport: { label: "Transports",       emoji: "🚊" },
};

export const CLIMATE_RISK_META: Record<
  "low" | "med" | "high",
  { label: string; color: string; emoji: string }
> = {
  low:  { label: "Faible",   color: "#16A34A", emoji: "🟢" },
  med:  { label: "Modéré",   color: "#F59E0B", emoji: "🟡" },
  high: { label: "Élevé",    color: "#EF4444", emoji: "🔴" },
};
