// F17 — Vivre avec X €/mois.
//
// Programmatic landing pages pour les salaires nets ronds (6 valeurs).
// Réutilise lib/compatibility.ts (matching) et lib/cost-living.ts (breakdown
// par ville) — zéro nouvelle donnée à fetcher.

import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { fiscalityForCity } from "@/lib/fiscalite";
import { computeBreakdown, type CostCalcInput } from "@/lib/cost-living";
import { rankCompatibility, type CompatibilityAnswers, type CompatibilityMatch } from "@/lib/compatibility";

export const SALARY_BRACKETS = [1500, 2000, 2500, 3000, 4000, 5000] as const;
export type SalaryBracket = (typeof SALARY_BRACKETS)[number];

export function parseSalaryFromSlug(slug: string): SalaryBracket | null {
  // slug = "1500-euros" → 1500
  const m = slug.match(/^(\d+)-euros$/);
  if (!m) return null;
  const n = Number(m[1]);
  return SALARY_BRACKETS.includes(n as SalaryBracket) ? (n as SalaryBracket) : null;
}

export function slugForSalary(s: SalaryBracket): string {
  return `${s}-euros`;
}

// Reasonable defaults for the compatibility quiz when the only input is salary.
// Budget = 33% of salary capped at affordable T2 levels. Other answers reflect
// a "middle-of-the-road" lifestyle so the top-10 reflects salary, not preferences.
function defaultAnswers(salary: number): CompatibilityAnswers {
  return {
    budget: Math.round(salary * 0.33),
    age: "30-45",
    climate: "indifferent",
    car: "preferable",
    family: "couple",
    ambiance: "dynamique",
    workMode: "hybride",
    priority: "budget",
    noise: "supporte",
    heat: "supporte",
  };
}

function parseFonciereMidpoint(range: string): number | null {
  const cleaned = range.replace(/ /g, " ").replace(/[€/an\s]/g, "");
  const m = cleaned.match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  return Math.round((Number(m[1]) + Number(m[2])) / 2);
}

export interface SalaryLanding {
  salary: SalaryBracket;
  budget: number;
  topMatches: CompatibilityMatch[];
  // Cost breakdown for the #1 match (used for the budget illustration block)
  topCity: {
    slug: string;
    name: string;
    region: string | null;
    breakdown: ReturnType<typeof computeBreakdown>;
    remaining: number;
    parisRemaining: number;
  } | null;
}

export function buildSalaryLanding(salary: SalaryBracket): SalaryLanding {
  const answers = defaultAnswers(salary);
  const matches = rankCompatibility(answers, 10);

  let topCity: SalaryLanding["topCity"] = null;
  const top = matches[0];
  if (top) {
    const housing = HOUSING[top.city.slug];
    const fisc =
      top.city.department && top.city.region
        ? fiscalityForCity({ department: top.city.department, region: top.city.region })
        : null;
    const taxeFonciereMidpoint = fisc ? parseFonciereMidpoint(fisc.taxeFonciereT3) : null;
    const input: CostCalcInput = {
      citySlug: top.city.slug,
      cityName: top.city.name,
      department: top.city.department,
      region: top.city.region,
      population: top.city.population,
      avgRentT2: housing?.avgRentT2 ?? null,
      taxeFonciereAnnualMidpoint: taxeFonciereMidpoint,
    };
    const breakdown = computeBreakdown(input);
    // Paris reference, computed inline to avoid a circular import.
    const PARIS_FIXED = 1500 + 80 + 88 + 110 + 27; // see lib/cost-living.ts PARIS_REFERENCE
    topCity = {
      slug: top.city.slug,
      name: top.city.name,
      region: top.city.region,
      breakdown,
      remaining: salary - breakdown.totalFixed,
      parisRemaining: salary - PARIS_FIXED,
    };
  }

  return {
    salary,
    budget: answers.budget,
    topMatches: matches,
    topCity,
  };
}
