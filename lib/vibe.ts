// Convention: deterministic vibe score 1-5 derived from city scores × season × day-of-week.
// NOT real-time data. Input = static seed scores + slug-derived pseudo-date offset.
// Clearly labelled ESTIMÉ on all surfaces where this is displayed.
// 10 = bon convention (all city scores use 10=bon; safety same).

import type { CitySeed } from "@/data/cities-seed";

export type VibeTone = "calme" | "animé" | "festif" | "chargé" | "ressourcant";

export const VIBE_META: Record<VibeTone, { label: string; emoji: string; color: string; desc: string }> = {
  calme: {
    label: "Calme",
    emoji: "🌿",
    color: "text-sky-600",
    desc: "Peu de monde, idéal pour se poser",
  },
  animé: {
    label: "Animé",
    emoji: "✨",
    color: "text-amber-600",
    desc: "Bonne énergie, commerces actifs",
  },
  festif: {
    label: "Festif",
    emoji: "🎉",
    color: "text-violet-600",
    desc: "Événements, vie nocturne, terrasses",
  },
  chargé: {
    label: "Chargé",
    emoji: "🌀",
    color: "text-orange-600",
    desc: "Dense, stressant, mouvement constant",
  },
  ressourcant: {
    label: "Ressourcant",
    emoji: "🌄",
    color: "text-green-600",
    desc: "Nature accessible, air respiré",
  },
};

const MEDITERRANEAN_REGIONS = new Set([
  "Provence-Alpes-Côte d'Azur",
  "Occitanie",
  "Corse",
]);

function isMediterranean(city: CitySeed): boolean {
  return MEDITERRANEAN_REGIONS.has(city.region);
}

function deriveTone(city: CitySeed): VibeTone {
  const { nature, culture, life, safety, transport, cost, global } = city.scores;

  if (nature >= 7 && cost <= 6) return "ressourcant";
  if (culture >= 7 || (culture >= 6 && life >= 7)) return "festif";
  if (global >= 7) return "animé";
  if (safety <= 4.5 || (transport <= 4 && cost <= 4.5)) return "chargé";
  return "calme";
}

function deriveBreakdown(city: CitySeed, tone: VibeTone): string[] {
  const { nature, culture, life, safety, transport, cost, global } = city.scores;
  const reasons: string[] = [];

  switch (tone) {
    case "ressourcant":
      if (nature >= 7) reasons.push(`Score nature élevé (${nature.toFixed(1)}/10)`);
      if (cost <= 6) reasons.push("Coût de la vie modéré");
      break;
    case "festif":
      if (culture >= 7) reasons.push(`Score culture élevé (${culture.toFixed(1)}/10)`);
      if (life >= 7) reasons.push("Qualité de vie supérieure");
      break;
    case "animé":
      if (global >= 7) reasons.push(`Score global fort (${global.toFixed(1)}/10)`);
      if (life >= 6) reasons.push("Bonne qualité de vie");
      break;
    case "chargé":
      if (safety <= 4.5) reasons.push(`Sécurité perfectible (${safety.toFixed(1)}/10)`);
      if (transport <= 4) reasons.push("Réseau de transport limité");
      if (cost <= 4.5) reasons.push("Coût de la vie élevé");
      break;
    case "calme":
      if (nature >= 5) reasons.push("Cadre naturel présent");
      if (safety >= 5) reasons.push("Environnement sécurisé");
      break;
  }

  if (reasons.length < 2) {
    if (transport >= 6) reasons.push("Transports corrects");
    if (life >= 5) reasons.push(`Qualité de vie (${life.toFixed(1)}/10)`);
  }

  return reasons.slice(0, 3);
}

function computeScore(city: CitySeed, month: number, dayOfWeek: number): number {
  const { global, culture, nature } = city.scores;

  // Base score from city quality (1-4 range)
  let score = 1 + (global / 10) * 3;

  // Culture boost
  if (culture >= 7) score += 0.3;

  // Nature boost
  if (nature >= 7) score += 0.2;

  // Seasonal boost: April-September in Mediterranean regions
  const isSummer = month >= 4 && month <= 9;
  if (isSummer && isMediterranean(city)) score += 0.5;

  // Weekend energy boost
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (isWeekend) score += 0.3;

  return Math.max(1, Math.min(5, score));
}

export function cityVibe(city: CitySeed, date?: Date): { tone: VibeTone; score: number; breakdown: string[] } {
  // For SSG: derive a stable pseudo-date from the city slug.
  // charCodeAt(0) % 7 gives a 0-6 day-of-week offset, charCodeAt(1) % 12 gives month offset.
  const slugOffset = city.slug.charCodeAt(0) % 7;
  const slugMonthOffset = (city.slug.charCodeAt(1) ?? 0) % 12;

  const d = date ?? new Date();
  // Use the slug-derived offsets to create a stable pseudo-date for SSG
  const month = date ? d.getMonth() : slugMonthOffset;
  const dayOfWeek = date ? d.getDay() : slugOffset;

  const tone = deriveTone(city);
  const score = computeScore(city, month, dayOfWeek);
  const breakdown = deriveBreakdown(city, tone);

  return { tone, score, breakdown };
}

// Module-level cache to avoid re-computing on every import
let _topByVibeCache: Map<VibeTone, CitySeed[]> | null = null;

function buildTopByVibe(cities: CitySeed[]): Map<VibeTone, CitySeed[]> {
  if (_topByVibeCache) return _topByVibeCache;
  const map = new Map<VibeTone, CitySeed[]>();
  const tones: VibeTone[] = ["calme", "animé", "festif", "chargé", "ressourcant"];
  for (const tone of tones) {
    const matches = cities
      .filter((c) => deriveTone(c) === tone)
      .sort((a, b) => b.scores.global - a.scores.global);
    map.set(tone, matches);
  }
  _topByVibeCache = map;
  return map;
}

export function topCitiesByVibe(tone: VibeTone, cities: CitySeed[], limit = 6): CitySeed[] {
  const map = buildTopByVibe(cities);
  return (map.get(tone) ?? []).slice(0, limit);
}
