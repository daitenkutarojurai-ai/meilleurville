// R11.1 — Future You Simulator engine.
//
// Given a profile (salary, household, mobility, priorities, climate preference),
// compute for every French city a concrete picture of life there: monthly
// money left after fixed costs, weekly free hours, estimated commute, climate
// match, stress proxy, plus a fit score that blends priorities × axis scores.
//
// Pure derivations from existing seed (CITIES_SEED + HOUSING + household-cost).
// No external API, no inventions — every number has a transparent source.

import type { CitySeed } from "@/data/cities-seed";
import type { CityLight } from "@/lib/cities-light";
import { HOUSING } from "@/data/housing";
import { householdBreakdownFor, type HouseholdProfile } from "@/lib/household-cost";

export type MobilityMode = "remote" | "transit" | "car" | "bike";
export type ClimatePref = "warm" | "mild" | "cold";
export type Priority =
  | "budget"
  | "nature"
  | "culture"
  | "safety"
  | "family"
  | "remote"
  | "transport";

export interface FutureYouInput {
  salary: number; // € net / month
  household: HouseholdProfile;
  mobility: MobilityMode;
  priorities: Priority[];
  climatePref: ClimatePref;
  commuteMaxMin: number; // max acceptable one-way commute, minutes
}

export interface FutureYouResult {
  city: CityLight;
  rent: number | null; // €/mo, null if housing data missing
  fixedCost: number; // €/mo (rent + heating + mobility + taxes + TEOM)
  monthlyLeftover: number; // salary - fixedCost
  affordability: "ok" | "tight" | "negative"; // > 600 / 200-600 / < 200
  commuteMinutes: number; // estimated one-way commute
  commuteOk: boolean; // within user's max
  freeHoursPerWeek: number; // 168 - sleep - work - chores - commute*5
  stressIndex: number; // 0-10, higher = more stressful
  climateMatch: number; // 0-10, how well climate matches preference
  fitScore: number; // 0-100, priority-weighted blend
  priorityBreakdown: Array<{ priority: Priority; axisScore: number; contribution: number }>;
}

const PRIORITY_TO_AXIS: Record<Priority, keyof CitySeed["scores"]> = {
  budget: "cost",
  nature: "nature",
  culture: "culture",
  safety: "safety",
  family: "schools",
  remote: "remoteWork",
  transport: "transport",
};

export const PRIORITY_META: Record<Priority, { label: string; emoji: string; desc: string }> = {
  budget:    { label: "Budget",      emoji: "💸", desc: "loyer, taxes, mobilité" },
  nature:    { label: "Nature",      emoji: "🌳", desc: "parcs, accès plein air" },
  culture:   { label: "Culture",     emoji: "🎭", desc: "musées, scène, festivals" },
  safety:    { label: "Sécurité",    emoji: "🛡️", desc: "tranquillité au quotidien" },
  family:    { label: "Famille",     emoji: "👨‍👩‍👧", desc: "écoles, équipements enfants" },
  remote:    { label: "Télétravail", emoji: "💻", desc: "fibre, coworking" },
  transport: { label: "Transport",   emoji: "🚊", desc: "métro, tram, TGV" },
};

export const MOBILITY_META: Record<MobilityMode, { label: string; emoji: string }> = {
  remote:  { label: "Télétravail 100 %", emoji: "🏠" },
  transit: { label: "Transports en commun", emoji: "🚊" },
  car:     { label: "Voiture", emoji: "🚗" },
  bike:    { label: "Vélo", emoji: "🚴" },
};

export const CLIMATE_META: Record<ClimatePref, { label: string; emoji: string }> = {
  warm: { label: "Chaud / méditerranéen", emoji: "☀️" },
  mild: { label: "Tempéré / océanique",    emoji: "🌤️" },
  cold: { label: "Frais / continental",    emoji: "❄️" },
};

// Estimate one-way commute minutes from the transport score, mobility mode,
// city population and remote-work score. Pure proxy — not GPS data. Documented
// so the user knows what they're looking at.
function estimateCommute(city: CityLight, mobility: MobilityMode): number {
  if (mobility === "remote") return 0;
  const transport = city.scores.transport ?? 5;
  // High transport score → shorter commute even in big cities.
  // Big cities (>200k) get a +8 base; small towns get a -2.
  const popPenalty = (city.population ?? 0) > 200000 ? 8 : (city.population ?? 0) < 30000 ? -2 : 2;
  const transitFactor = mobility === "bike" ? 1.1 : mobility === "transit" ? 1.0 : 0.85;
  const base = 22 - (transport - 5) * 4; // 5 → 22 min, 10 → 2 min, 0 → 42 min
  return Math.max(3, Math.round((base + popPenalty) * transitFactor));
}

// Free hours per week: 168 − sleep (56) − work (40, 0 if remote-only? still 40
// because remote workers also work) − chores/admin (21) − commute (5×commute/60×2 round-trip).
function freeHoursPerWeek(commuteMin: number, mobility: MobilityMode): number {
  const work = 40;
  const sleep = 56;
  const chores = 21;
  const commuteHours = mobility === "remote" ? 0 : (commuteMin * 2 * 5) / 60;
  return Math.max(0, Math.round(168 - work - sleep - chores - commuteHours));
}

// Stress proxy 0-10. Higher safety/life lower stress, longer commute / lower
// remote score raise stress.
function stressIndex(city: CityLight, commuteMin: number): number {
  const safetyPenalty = (10 - (city.scores.safety ?? 5)) * 0.35;
  const lifePenalty = (10 - (city.scores.life ?? 5)) * 0.2;
  const commutePenalty = Math.min(3, commuteMin / 15);
  const remoteRelief = ((city.scores.remoteWork ?? 5) - 5) * -0.1; // higher remoteWork = lower stress
  const raw = 3.5 + safetyPenalty + lifePenalty + commutePenalty + remoteRelief;
  return Math.max(0, Math.min(10, Math.round(raw * 10) / 10));
}

// Climate match 0-10 based on user preference vs July temp + sunshine.
function climateMatch(city: CityLight, pref: ClimatePref): number {
  const july = city.avgTempJuly ?? 22;
  const sun = city.sunshinedays ?? 1900; // raw hours
  if (pref === "warm") {
    // Reward >24°C July + >2000 h sun
    const tempScore = Math.max(0, Math.min(10, (july - 18) * 1.4));
    const sunScore = Math.max(0, Math.min(10, (sun - 1500) / 150));
    return Math.round(((tempScore + sunScore) / 2) * 10) / 10;
  }
  if (pref === "cold") {
    // Reward <22°C July + winters with snow proxy via avgTempJanuary
    const jan = city.avgTempJanuary ?? 4;
    const tempScore = Math.max(0, Math.min(10, (24 - july) * 1.5));
    const winterScore = Math.max(0, Math.min(10, (5 - jan) * 1.4));
    return Math.round(((tempScore + winterScore) / 2) * 10) / 10;
  }
  // mild — sweet spot around 21°C, 1800-2200 h sun
  const tempDist = Math.abs(july - 21);
  const tempScore = Math.max(0, 10 - tempDist * 1.6);
  const sunDist = Math.abs(sun - 2000);
  const sunScore = Math.max(0, 10 - sunDist / 100);
  return Math.round(((tempScore + sunScore) / 2) * 10) / 10;
}

function affordability(leftover: number): FutureYouResult["affordability"] {
  if (leftover < 200) return "negative";
  if (leftover < 600) return "tight";
  return "ok";
}

export function simulateCity(city: CityLight, input: FutureYouInput): FutureYouResult {
  const housing = HOUSING[city.slug];
  const breakdown = householdBreakdownFor(city, input.household);
  const rent = breakdown.rent ?? housing?.avgRentT2 ?? null;
  // Bike or remote modes still pay heating, taxes, TEOM but mobility cost
  // shrinks (bike: maintenance, remote: occasional pass / fuel).
  const mobilityAdj =
    input.mobility === "bike" ? 25
    : input.mobility === "remote" ? 10
    : breakdown.mobility;
  const fixedCost = Math.round(
    (rent ?? 0) +
    breakdown.heating +
    mobilityAdj +
    breakdown.taxeFonciere +
    breakdown.teom +
    breakdown.schoolExtra,
  );
  const monthlyLeftover = input.salary - fixedCost;
  const commuteMin = estimateCommute(city, input.mobility);
  const commuteOk = commuteMin <= input.commuteMaxMin;
  const free = freeHoursPerWeek(commuteMin, input.mobility);
  const stress = stressIndex(city, commuteMin);
  const climate = climateMatch(city, input.climatePref);

  // Fit score: priority-weighted average of relevant axis scores + bonus for
  // affordability + climate. Scaled to 0-100.
  const weight = 1 / Math.max(1, input.priorities.length);
  const priorityBreakdown = input.priorities.map((p) => {
    const axisKey = PRIORITY_TO_AXIS[p];
    const axisScore = city.scores[axisKey];
    return { priority: p, axisScore, contribution: Math.round(axisScore * weight * 10) / 10 };
  });
  const priorityAvg = priorityBreakdown.length
    ? priorityBreakdown.reduce((s, p) => s + p.axisScore, 0) / priorityBreakdown.length
    : city.scores.global;
  const affordBonus = affordability(monthlyLeftover) === "ok" ? 1.2 : affordability(monthlyLeftover) === "tight" ? 0 : -2.5;
  const climateBonus = climate >= 7 ? 0.8 : climate >= 5 ? 0.2 : -0.4;
  const commutePenalty = commuteOk ? 0 : -1.5;
  const fitRaw = priorityAvg + affordBonus + climateBonus + commutePenalty;
  const fitScore = Math.round(Math.max(0, Math.min(10, fitRaw)) * 10);

  return {
    city,
    rent,
    fixedCost,
    monthlyLeftover,
    affordability: affordability(monthlyLeftover),
    commuteMinutes: commuteMin,
    commuteOk,
    freeHoursPerWeek: free,
    stressIndex: stress,
    climateMatch: climate,
    fitScore,
    priorityBreakdown,
  };
}

/** Returns the top N cities for the given input, ranked by fit score. */
export function simulateTopCities(input: FutureYouInput, cities: CityLight[], n = 3): FutureYouResult[] {
  return cities
    .filter((c) => c.longitude >= -6 && c.longitude <= 10 && c.latitude >= 40 && c.latitude <= 52)
    .map((c) => simulateCity(c, input))
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, n);
}

/** Paris baseline for the input — useful as the "you today" reference card. */
export function simulateReference(input: FutureYouInput, cities: CityLight[], refSlug = "paris"): FutureYouResult | null {
  const ref = cities.find((c) => c.slug === refSlug);
  if (!ref) return null;
  return simulateCity(ref, input);
}
