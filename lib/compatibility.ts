// F2 — City Compatibility Score.
//
// 10 questions → weighted matching across the 352 cities, returning Top 5
// with a 0-100 score and a per-criterion breakdown explaining why each city
// matched (or didn't).
//
// Distinct from /quiz/ which is a qualitative matching (top reason chip).
// This is quantitative: every answer maps to a contribution on a specific
// scoring axis, and the total is a percentage.

import type { CityLight } from "@/lib/cities-light";
import { HOUSING } from "@/data/housing";
import { computeOwnerScores } from "@/lib/owner-scores";

export type CompatibilityAnswers = {
  budget: number; // monthly housing budget €
  age: "18-30" | "30-45" | "45-60" | "60+";
  climate: "froid" | "tempere" | "chaud" | "indifferent";
  car: "obligatoire" | "preferable" | "non-merci";
  family: "seul" | "couple" | "famille" | "retraite";
  ambiance: "calme" | "dynamique" | "international" | "village";
  workMode: "presentiel" | "hybride" | "remote" | "retraite";
  priority: "budget" | "nature" | "carriere" | "famille" | "culture" | "calme";
  noise: "supporte" | "ne-supporte-pas";
  heat: "supporte" | "ne-supporte-pas";
};

export interface CompatibilityCriterion {
  key: string;
  label: string;
  contribution: number; // 0-100 contribution (signed) — positive = match, negative = mismatch
  reason: string; // displayable explanation
}

export interface CompatibilityMatch {
  city: CityLight;
  score: number; // 0-100
  criteria: CompatibilityCriterion[];
}

// Each question's max contribution. Sum = 100.
const WEIGHTS = {
  budget: 18,
  age: 6,
  climate: 12,
  car: 8,
  family: 8,
  ambiance: 10,
  workMode: 10,
  priority: 14,
  noise: 8,
  heat: 6,
};

// Verify weights sum to 100 at module load (build-time safety).
const _w = Object.values(WEIGHTS).reduce((s, v) => s + v, 0);
if (_w !== 100) {
  throw new Error(`CompatibilityWeights must sum to 100, got ${_w}`);
}

function clamp(n: number, lo = 0, hi = 1): number {
  return Math.max(lo, Math.min(hi, n));
}

function evalBudget(answer: CompatibilityAnswers, city: CityLight): CompatibilityCriterion {
  const rent = HOUSING[city.slug]?.avgRentT2;
  if (rent == null) {
    return {
      key: "budget",
      label: "Budget logement",
      contribution: WEIGHTS.budget * 0.5,
      reason: `Loyer T2 non indexé pour ${city.name} — estimation neutre.`,
    };
  }
  // If rent ≤ budget : full contribution. If rent > budget : penalty proportional.
  const ratio = answer.budget === 0 ? 0 : rent / answer.budget;
  let contrib: number;
  let reason: string;
  if (ratio <= 1) {
    contrib = WEIGHTS.budget * (1 - Math.max(0, ratio - 0.7) * 0.5);
    reason = `Loyer T2 médian ${rent}€/mois — dans votre budget (${answer.budget}€).`;
  } else {
    const overshoot = clamp(ratio - 1, 0, 1);
    contrib = WEIGHTS.budget * (1 - overshoot * 2); // capped at 0
    contrib = Math.max(-WEIGHTS.budget * 0.3, contrib); // negative penalty if way over
    reason = `Loyer T2 médian ${rent}€/mois — au-dessus de votre budget (${answer.budget}€).`;
  }
  return { key: "budget", label: "Budget logement", contribution: Math.round(contrib * 10) / 10, reason };
}

function evalAge(answer: CompatibilityAnswers, city: CityLight): CompatibilityCriterion {
  const owner = computeOwnerScores(city);
  const jeuneActif = owner.find((s) => s.key === "score_jeune_actif")!.value;
  const famille = owner.find((s) => s.key === "score_famille")!.value;

  let target: number;
  let label: string;
  switch (answer.age) {
    case "18-30":
      target = jeuneActif;
      label = `Jeune actif ${jeuneActif.toFixed(1)}/10`;
      break;
    case "30-45":
      target = (jeuneActif + famille) / 2;
      label = `Jeune actif + famille moyenne ${target.toFixed(1)}/10`;
      break;
    case "45-60":
      target = (famille + city.scores.life) / 2;
      label = `Famille + qualité de vie ${target.toFixed(1)}/10`;
      break;
    case "60+":
    default:
      target = (city.scores.life + city.scores.safety) / 2;
      label = `Cadre de vie + sécurité ${target.toFixed(1)}/10`;
      break;
  }
  const contrib = (target / 10) * WEIGHTS.age;
  return { key: "age", label: "Âge", contribution: Math.round(contrib * 10) / 10, reason: label };
}

function evalClimate(answer: CompatibilityAnswers, city: CityLight): CompatibilityCriterion {
  const july = city.avgTempJuly ?? 22;
  const jan = city.avgTempJanuary ?? 5;
  const sun = city.sunshinedays ?? 1900;
  let match = 0.5;
  let reason = "";
  switch (answer.climate) {
    case "froid":
      match = clamp(1 - (july - 21) * 0.15);
      reason = `Été ${july}°C — ${match > 0.7 ? "tempéré" : "chaud"} pour vous.`;
      break;
    case "tempere":
      match = clamp(1 - Math.abs(july - 23) * 0.1);
      reason = `Été ${july}°C — ${match > 0.7 ? "idéal" : "écart au tempéré"}.`;
      break;
    case "chaud":
      match = clamp((july - 21) * 0.18 + (sun - 1700) * 0.0004);
      reason = `Été ${july}°C · ${Math.round(sun / 9.5)} j de soleil — ${match > 0.7 ? "chaud comme vous aimez" : "tempéré"}.`;
      break;
    case "indifferent":
    default:
      match = 0.7;
      reason = `Été ${july}°C · hiver ${jan}°C.`;
      break;
  }
  return {
    key: "climate",
    label: "Climat",
    contribution: Math.round(match * WEIGHTS.climate * 10) / 10,
    reason,
  };
}

function evalCar(answer: CompatibilityAnswers, city: CityLight): CompatibilityCriterion {
  const owner = computeOwnerScores(city);
  const sansVoiture = owner.find((s) => s.key === "score_sans_voiture")!.value;
  let match = 0.5;
  let reason = "";
  switch (answer.car) {
    case "obligatoire":
      // User wants to keep car — any city works, smaller ones even better.
      match = clamp(0.8 + ((city.population ?? 50000) < 100000 ? 0.2 : 0));
      reason = `Voiture obligatoire — toutes les villes conviennent.`;
      break;
    case "preferable":
      match = clamp(0.6 + sansVoiture * 0.04);
      reason = `Score sans-voiture ${sansVoiture.toFixed(1)}/10.`;
      break;
    case "non-merci":
      match = clamp(sansVoiture / 10);
      reason = `Score sans-voiture ${sansVoiture.toFixed(1)}/10 — ${sansVoiture >= 7 ? "réseau dense" : "voiture quasi-obligatoire"}.`;
      break;
  }
  return {
    key: "car",
    label: "Voiture",
    contribution: Math.round(match * WEIGHTS.car * 10) / 10,
    reason,
  };
}

function evalFamily(answer: CompatibilityAnswers, city: CityLight): CompatibilityCriterion {
  const owner = computeOwnerScores(city);
  const famille = owner.find((s) => s.key === "score_famille")!.value;
  const jeuneActif = owner.find((s) => s.key === "score_jeune_actif")!.value;
  let match = 0.5;
  let reason = "";
  switch (answer.family) {
    case "famille":
      match = famille / 10;
      reason = `Score famille ${famille.toFixed(1)}/10 (écoles + sécurité + nature).`;
      break;
    case "couple":
      match = ((famille + city.scores.life) / 2) / 10;
      reason = `Mix famille + qualité de vie.`;
      break;
    case "seul":
      match = jeuneActif / 10;
      reason = `Score jeune actif ${jeuneActif.toFixed(1)}/10.`;
      break;
    case "retraite":
      match = ((city.scores.safety + city.scores.life + city.scores.nature) / 3) / 10;
      reason = `Sécurité + cadre + nature.`;
      break;
  }
  return {
    key: "family",
    label: "Situation familiale",
    contribution: Math.round(match * WEIGHTS.family * 10) / 10,
    reason,
  };
}

function evalAmbiance(answer: CompatibilityAnswers, city: CityLight): CompatibilityCriterion {
  const pop = city.population ?? 50000;
  let match = 0.5;
  let reason = "";
  switch (answer.ambiance) {
    case "calme":
      match = clamp(1 - (pop / 600000));
      reason = `${pop.toLocaleString("fr-FR")} hab. — ${pop < 80000 ? "calme" : "animée"}.`;
      break;
    case "dynamique":
      match = clamp(pop / 400000);
      reason = `${pop.toLocaleString("fr-FR")} hab. — ${pop > 200000 ? "très dynamique" : "modérée"}.`;
      break;
    case "international":
      // Cities with character tags hinting at international vibe.
      const tags = city.characterTags;
      const intl = tags.some((t) => ["international", "européen", "premium", "tourisme"].includes(t));
      match = intl ? 0.85 : 0.4;
      reason = intl ? `Ville à vocation internationale.` : `Ville majoritairement franco-française.`;
      break;
    case "village":
      match = clamp(1 - (pop / 100000));
      reason = `${pop.toLocaleString("fr-FR")} hab. — ${pop < 30000 ? "esprit village" : "trop urbaine"}.`;
      break;
  }
  return {
    key: "ambiance",
    label: "Ambiance",
    contribution: Math.round(match * WEIGHTS.ambiance * 10) / 10,
    reason,
  };
}

function evalWorkMode(answer: CompatibilityAnswers, city: CityLight): CompatibilityCriterion {
  const owner = computeOwnerScores(city);
  const remote = owner.find((s) => s.key === "score_teletravail")!.value;
  let match = 0.5;
  let reason = "";
  switch (answer.workMode) {
    case "presentiel":
      match = (city.scores.life + city.scores.transport) / 20;
      reason = `Qualité de vie + transports.`;
      break;
    case "hybride":
      match = (remote + city.scores.transport) / 20;
      reason = `Score télétravail ${remote.toFixed(1)}/10 + transports.`;
      break;
    case "remote":
      match = remote / 10;
      reason = `Score télétravail ${remote.toFixed(1)}/10 (fibre + cadre).`;
      break;
    case "retraite":
      match = city.scores.life / 10;
      reason = `Score qualité de vie ${city.scores.life.toFixed(1)}/10.`;
      break;
  }
  return {
    key: "workMode",
    label: "Mode de travail",
    contribution: Math.round(match * WEIGHTS.workMode * 10) / 10,
    reason,
  };
}

function evalPriority(answer: CompatibilityAnswers, city: CityLight): CompatibilityCriterion {
  let value = 5;
  let labelHint = "";
  switch (answer.priority) {
    case "budget":
      value = city.scores.cost;
      labelHint = "coût de la vie";
      break;
    case "nature":
      value = city.scores.nature;
      labelHint = "accès nature";
      break;
    case "carriere":
      value = (city.scores.remoteWork + city.scores.culture) / 2;
      labelHint = "carrière (remote + culture)";
      break;
    case "famille":
      value = (city.scores.safety + city.scores.schools) / 2;
      labelHint = "famille (sécurité + écoles)";
      break;
    case "culture":
      value = city.scores.culture;
      labelHint = "culture";
      break;
    case "calme":
      value = (city.scores.safety + city.scores.nature) / 2;
      labelHint = "calme (sécurité + nature)";
      break;
  }
  return {
    key: "priority",
    label: "Priorité principale",
    contribution: Math.round((value / 10) * WEIGHTS.priority * 10) / 10,
    reason: `${labelHint} : ${value.toFixed(1)}/10`,
  };
}

function evalNoise(answer: CompatibilityAnswers, city: CityLight): CompatibilityCriterion {
  const owner = computeOwnerScores(city);
  const bruit = owner.find((s) => s.key === "score_bruit")!.value;
  const match = answer.noise === "ne-supporte-pas" ? bruit / 10 : 0.7;
  return {
    key: "noise",
    label: "Bruit",
    contribution: Math.round(match * WEIGHTS.noise * 10) / 10,
    reason: `Calme sonore ${bruit.toFixed(1)}/10.`,
  };
}

function evalHeat(answer: CompatibilityAnswers, city: CityLight): CompatibilityCriterion {
  const owner = computeOwnerScores(city);
  const canicule = owner.find((s) => s.key === "score_canicule")!.value;
  const match = answer.heat === "ne-supporte-pas" ? canicule / 10 : 0.7;
  return {
    key: "heat",
    label: "Canicule",
    contribution: Math.round(match * WEIGHTS.heat * 10) / 10,
    reason: `Résistance canicule ${canicule.toFixed(1)}/10.`,
  };
}

const EVALUATORS = [
  evalBudget,
  evalAge,
  evalClimate,
  evalCar,
  evalFamily,
  evalAmbiance,
  evalWorkMode,
  evalPriority,
  evalNoise,
  evalHeat,
];

export function rankCompatibility(
  answers: CompatibilityAnswers,
  cities: CityLight[],
  limit = 5,
): CompatibilityMatch[] {
  const matches: CompatibilityMatch[] = cities.map((city) => {
    const criteria = EVALUATORS.map((fn) => fn(answers, city));
    const totalRaw = criteria.reduce((s, c) => s + c.contribution, 0);
    const score = Math.max(0, Math.min(100, Math.round(totalRaw * 10) / 10));
    return { city, score, criteria };
  });
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit);
}

// Top contributing criteria per match — useful for "why this city" chip.
export function topReasons(match: CompatibilityMatch, n = 3): CompatibilityCriterion[] {
  return [...match.criteria]
    .filter((c) => c.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, n);
}
