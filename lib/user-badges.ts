// R9.4 — Light gamification: badges derived from local user state.
//
// Pure function: takes the user's local state (favorites + diversity signals
// computable from CITIES_SEED) and returns earned + in-progress badges.
// No backend, no auth required — works for anonymous favourites.

import { CITIES_SEED } from "@/data/cities-seed";

export interface Badge {
  key: string;
  emoji: string;
  label: string;
  desc: string;
  earned: boolean;
  progress: number; // 0-1
  progressLabel?: string;
}

const TIER_THRESHOLDS = [1, 3, 5, 10, 20] as const;

export function computeUserBadges(favoriteSlugs: string[]): Badge[] {
  const favs = favoriteSlugs
    .map((s) => CITIES_SEED.find((c) => c.slug === s))
    .filter((c): c is (typeof CITIES_SEED)[number] => Boolean(c));

  const count = favs.length;
  const regions = new Set(favs.map((c) => c.region));
  const climates = new Set(
    favs.map((c) => {
      if (c.avgTempJuly == null || c.avgTempJanuary == null) return "moyen";
      if (c.avgTempJuly >= 26) return "chaud";
      if (c.avgTempJanuary <= 4) return "froid";
      return "tempéré";
    })
  );
  const hasCoastal = favs.some((c) => (c.elevation ?? 100) <= 20);
  const hasMountain = favs.some((c) => (c.elevation ?? 0) >= 400);
  const hasBigCity = favs.some((c) => (c.population ?? 0) >= 300_000);
  const hasSmallTown = favs.some((c) => (c.population ?? 999_999) < 50_000);

  const badges: Badge[] = [];

  // Tier badges by favourites count
  const tierLabels = ["Explorateur", "Sélectionneur", "Chasseur de ville", "Stratège", "Cartographe"];
  const tierEmojis = ["🌱", "🌿", "🌳", "🗺️", "🧭"];
  TIER_THRESHOLDS.forEach((threshold, i) => {
    badges.push({
      key: `tier-${threshold}`,
      emoji: tierEmojis[i],
      label: `${tierLabels[i]} (${threshold})`,
      desc: `Ajoute ${threshold} ville${threshold > 1 ? "s" : ""} en favori.`,
      earned: count >= threshold,
      progress: Math.min(1, count / threshold),
      progressLabel: count >= threshold ? "Obtenu" : `${count}/${threshold}`,
    });
  });

  // Regional diversity
  badges.push({
    key: "diversite-regions",
    emoji: "🇫🇷",
    label: "Le tour de France (5 régions)",
    desc: "Couvre 5 régions françaises différentes avec tes favoris.",
    earned: regions.size >= 5,
    progress: Math.min(1, regions.size / 5),
    progressLabel: regions.size >= 5 ? "Obtenu" : `${regions.size}/5 régions`,
  });

  // Climate spread
  badges.push({
    key: "climats",
    emoji: "🌦️",
    label: "Indécis assumé",
    desc: "Favorise des villes de 3 climats différents (chaud / tempéré / froid).",
    earned: climates.size >= 3,
    progress: Math.min(1, climates.size / 3),
    progressLabel: climates.size >= 3 ? "Obtenu" : `${climates.size}/3 climats`,
  });

  // Coast vs mountain
  badges.push({
    key: "mer-et-montagne",
    emoji: "🏖️",
    label: "Mer ET montagne",
    desc: "Au moins une ville côtière et une ville d'altitude (≥400m).",
    earned: hasCoastal && hasMountain,
    progress: (hasCoastal ? 0.5 : 0) + (hasMountain ? 0.5 : 0),
    progressLabel: hasCoastal && hasMountain ? "Obtenu" : `${[hasCoastal && "côte", hasMountain && "montagne"].filter(Boolean).join(" + ") || "—"}`,
  });

  // Big city + small town
  badges.push({
    key: "metropole-village",
    emoji: "🏙️",
    label: "Métropole ET village",
    desc: "Une grande ville (≥300k hab.) et une petite (<50k hab.) dans les favoris.",
    earned: hasBigCity && hasSmallTown,
    progress: (hasBigCity ? 0.5 : 0) + (hasSmallTown ? 0.5 : 0),
    progressLabel: hasBigCity && hasSmallTown ? "Obtenu" : `${[hasBigCity && "métropole", hasSmallTown && "petite ville"].filter(Boolean).join(" + ") || "—"}`,
  });

  return badges;
}
