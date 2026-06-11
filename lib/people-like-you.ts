// R11.3 — People-like-you (Phase A: persona-driven, not real migration data).
//
// Reuses lib/profile-pages.ts PROFILE_PAGES weights to compute the persona's
// score for every city, then sorts destinations by their UPGRADE over an
// origin city. Labelled honestly: "synthèse de profils similaires, pas un
// suivi GPS" — there is no actual movement dataset behind this yet. Phase B
// (post-R9.1 accounts) will progressively replace these synthetic patterns
// with anonymised user-declared moves.

import type { CitySeed } from "@/data/cities-seed";
import type { CityLight } from "@/lib/cities-light";
import { PROFILE_PAGES, type ProfileDef, type ProfileMatch } from "@/lib/profile-pages";
import { computeOwnerScores } from "@/lib/owner-scores";

function ownerVal(city: CityLight, key: string): number {
  const s = computeOwnerScores(city as CitySeed);
  switch (key) {
    case "canicule": return s.find((x) => x.key === "score_canicule")!.value;
    case "solitude": return s.find((x) => x.key === "score_solitude")!.value;
    case "bruit": return s.find((x) => x.key === "score_bruit")!.value;
    case "securiteNocturne": return s.find((x) => x.key === "score_securite_nocturne")!.value;
    case "sansVoiture": return s.find((x) => x.key === "score_sans_voiture")!.value;
    case "teletravail": return s.find((x) => x.key === "score_teletravail")!.value;
    case "qualiteAir": return s.find((x) => x.key === "score_qualite_air")!.value;
    case "securiteFemmeSeule": return s.find((x) => x.key === "score_securite_femme_seule")!.value;
    case "jeuneActif": return s.find((x) => x.key === "score_jeune_actif")!.value;
    case "famille": return s.find((x) => x.key === "score_famille")!.value;
  }
  return 5;
}

function getScoreValue(city: CityLight, key: string): number {
  if (["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"].includes(key)) {
    return city.scores[key as keyof typeof city.scores];
  }
  return ownerVal(city, key);
}

function personaScore(city: CityLight, profile: ProfileDef): number {
  const totalWeight = Object.values(profile.weights).reduce<number>((s, v) => s + (v ?? 0), 0);
  let weightedSum = 0;
  for (const [key, weight] of Object.entries(profile.weights)) {
    if (weight == null) continue;
    weightedSum += getScoreValue(city, key) * weight;
  }
  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 10 : 0;
}

export interface MigrationCandidate extends ProfileMatch {
  delta: number; // destination - origin persona score (negative = downgrade)
}

export interface MigrationResult {
  profile: ProfileDef;
  origin: { city: CityLight; score: number };
  upgrades: MigrationCandidate[]; // destinations where persona score > origin
  laterals: MigrationCandidate[]; // destinations within ±0.3 of origin (similar)
}

const METRO_BBOX = (c: CityLight) =>
  c.longitude >= -6 && c.longitude <= 10 && c.latitude >= 40 && c.latitude <= 52;

export function migrationFor(originSlug: string, profileSlug: string, cities: CityLight[], limit = 5): MigrationResult | null {
  const origin = cities.find((c) => c.slug === originSlug);
  if (!origin) return null;
  const profile = PROFILE_PAGES.find((p) => p.slug === profileSlug);
  if (!profile) return null;
  const originScore = personaScore(origin, profile);

  const candidates: MigrationCandidate[] = cities
    .filter((c) => c.slug !== origin.slug)
    .filter(METRO_BBOX)
    .map((c) => {
      const score = personaScore(c, profile);
      return {
        city: c,
        score,
        delta: Math.round((score - originScore) * 10) / 10,
        reason: profile.reasonHint(c),
      };
    });

  const upgrades = candidates
    .filter((m) => m.delta > 0.5)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, limit);

  const laterals = candidates
    .filter((m) => Math.abs(m.delta) <= 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    profile,
    origin: { city: origin, score: originScore },
    upgrades,
    laterals,
  };
}

/** Reasonable origin candidates: top 50 biggest cities (the most common starting points). */
export function commonOriginSlugs(cities: CityLight[], limit = 50): string[] {
  return [...cities]
    .filter(METRO_BBOX)
    .filter((c) => (c.population ?? 0) >= 30000)
    .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
    .slice(0, limit)
    .map((c) => c.slug);
}
