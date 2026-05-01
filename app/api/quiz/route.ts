import { NextRequest, NextResponse } from "next/server";
import { CITIES_SEED } from "@/data/cities-seed";
import type { QuizAnswers, MatchResult, City } from "@/lib/types";

export const runtime = "edge";

function seedToCity(s: (typeof CITIES_SEED)[number]): City {
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    region: s.region,
    department: s.department,
    population: s.population,
    latitude: s.latitude,
    longitude: s.longitude,
    scores: s.scores,
    characterTags: s.characterTags,
    reviewCount: 180 + Math.floor(s.scores.global * 30),
    sunshinedays: s.sunshinedays,
    avgTempJuly: s.avgTempJuly,
    avgTempJanuary: s.avgTempJanuary,
  };
}

function matchScore(answers: QuizAnswers, city: (typeof CITIES_SEED)[number]): { score: number; topReason: string } {
  const weights: Record<string, number> = {};
  let total = 0;
  let weighted = 0;

  // Environment preference
  if (answers.environment === "montagne" || answers.environment === "campagne") {
    weights.nature = 2.5;
  } else if (answers.environment === "mer") {
    weights.nature = 2.0;
  } else if (answers.environment === "ville") {
    weights.culture = 2.0;
    weights.transport = 1.5;
  } else {
    weights.nature = 1.5;
    weights.cost = 1.5;
  }

  // Work style
  if (answers.workStyle === "remote" || answers.workStyle === "independant") {
    weights.remoteWork = 2.5;
    weights.cost = (weights.cost ?? 1) + 0.5;
  } else if (answers.workStyle === "presentiel") {
    weights.transport = (weights.transport ?? 1) + 1.5;
  }

  // Family situation
  if (answers.situation === "famille") {
    weights.schools = 2.5;
    weights.safety = 2.0;
    weights.nature = (weights.nature ?? 1) + 0.5;
  } else if (answers.situation === "retraite") {
    weights.safety = 2.0;
    weights.nature = (weights.nature ?? 1) + 1.0;
    weights.cost = (weights.cost ?? 1) + 1.0;
  } else if (answers.situation === "seul") {
    weights.culture = (weights.culture ?? 1) + 1.0;
    weights.transport = (weights.transport ?? 1) + 0.5;
  }

  // User priorities
  const priorityMap: Record<string, keyof typeof city.scores> = {
    transport: "transport",
    nature: "nature",
    culture: "culture",
    ecoles: "schools",
    prix: "cost",
    emploi: "remoteWork",
  };
  for (const p of answers.priorities ?? []) {
    const scoreKey = priorityMap[p];
    if (scoreKey) weights[scoreKey] = (weights[scoreKey] ?? 1) + 1.5;
  }

  // Climate preference
  if (answers.climate === "soleil") {
    // sunshinedays stores hours/year (e.g., Marseille 2850, Paris 1630).
    const sunScore = city.sunshinedays ? Math.min(10, city.sunshinedays / 270) : 7;
    weighted += sunScore * 2.0;
    total += 10 * 2.0;
  } else if (answers.climate === "montagne") {
    // Prefer cities with elevation
    const elevScore = city.elevation ? Math.min(10, city.elevation / 100) : 4;
    weighted += elevScore * 1.5;
    total += 10 * 1.5;
    weights.nature = (weights.nature ?? 1) + 1.0;
  } else if (answers.climate === "ocean") {
    // Prefer western coastal regions
    const oceanRegions = ["Bretagne", "Pays de la Loire", "Nouvelle-Aquitaine", "Normandie"];
    const oceanScore = oceanRegions.includes(city.region) ? 9 : 5;
    weighted += oceanScore * 1.5;
    total += 10 * 1.5;
  }

  // Budget affordability score
  const budgetScore = answers.budget >= 1500 ? 10 : answers.budget >= 1000 ? city.scores.cost : Math.max(0, city.scores.cost - (1000 - answers.budget) / 100);

  const scoreMap: Record<string, number> = {
    life: city.scores.life,
    transport: city.scores.transport,
    nature: city.scores.nature,
    cost: budgetScore,
    safety: city.scores.safety,
    culture: city.scores.culture,
    remoteWork: city.scores.remoteWork,
    schools: city.scores.schools,
  };

  for (const [key, w] of Object.entries(weights)) {
    const val = scoreMap[key] ?? 7;
    weighted += val * w;
    total += 10 * w;
  }

  // Base score without specific weights
  const baseScore = city.scores.global;
  const matchPct = total > 0 ? (weighted / total) * 100 : baseScore * 10;
  const finalPct = matchPct * 0.7 + baseScore * 3;

  // Top reason
  const topKey = Object.entries(weights).sort((a, b) => b[1] - a[1])[0]?.[0];
  const reasonMap: Record<string, string> = {
    nature: "Cadre naturel exceptionnel",
    transport: "Excellent réseau de transport",
    culture: "Vie culturelle riche",
    schools: "Écoles et éducation",
    cost: "Coût de la vie attractif",
    safety: "Sécurité et qualité de vie",
    remoteWork: "Idéal pour le télétravail",
    life: "Qualité de vie globale",
  };

  return {
    score: Math.min(98, Math.max(40, finalPct)),
    topReason: reasonMap[topKey ?? "life"] ?? "Qualité de vie globale",
  };
}

export async function POST(req: NextRequest) {
  try {
    const answers = (await req.json()) as QuizAnswers;

    const scored = CITIES_SEED.map((city) => {
      const { score, topReason } = matchScore(answers, city);
      return { city: seedToCity(city), score, topReason };
    });

    const results: MatchResult[] = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r) => ({ city: r.city, score: r.score, breakdown: {}, topReason: r.topReason }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Quiz error:", err);
    return NextResponse.json({ error: "Erreur quiz" }, { status: 500 });
  }
}
