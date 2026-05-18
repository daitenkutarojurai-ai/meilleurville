// F61 — Synthèse ville.
//
// Agrège les 8 composites des clusters data pour offrir un panorama
// unifié sur une seule sub-page par ville. Zéro nouvelle donnée :
// pur agrégat de F44 (env), F47 (santé), F50 (emploi), F52 (cadre de vie),
// F57 (vélo), F58 (sécurité), F59 (démographie), F60 (services publics).
//
// Convention métriques pour la synthèse : tous les composites sont
// normalisés vers une échelle « 10 = excellent » (orientation positive)
// pour faciliter le radar et le verdict. Les clusters dont la convention
// d'origine est « 10 = pire » (env, sécurité, démo, services) sont
// inversés via `10 - composite`. Vélo (F57) et QoL (F52) sont déjà
// orientés positif, gardés tels quels.

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeEnvironmentIndex } from "@/lib/environment-index";
import { computeHealthcareAccess } from "@/lib/healthcare-access";
import { computeEmploymentMarket } from "@/lib/employment-market";
import { computeQualityOfLife } from "@/lib/quality-of-life-index";
import { computeCyclingMobility } from "@/lib/cycling-mobility";
import { computeSafetyDeep } from "@/lib/safety-deep";
import { computeDemography } from "@/lib/demography";
import { computePublicServices } from "@/lib/public-services";

export type SynthesisLevel = "excellent" | "bon" | "moyen" | "tendu";

export interface SynthesisAxis {
  /** Slug du cluster pour cross-links */
  key: "environnement" | "sante" | "emploi" | "cadre-de-vie" | "velo" | "securite" | "demographie" | "services-publics";
  /** Libellé court (≤ 14 chars idéalement) */
  label: string;
  /** Sous-titre / description courte */
  hint: string;
  /** Score 0-10, 10 = excellent (orientation positive partout) */
  score: number;
  /** Niveau qualitatif */
  level: SynthesisLevel;
  /** URL du sub-page cluster correspondant */
  href: string;
  /** Tag pédagogique pour situer le sous-axe */
  tag: string;
}

export interface CitySynthesis {
  /** Moyenne arithmétique des 8 axes (orientation positive) — 0 à 10 */
  global: number;
  /** Écart-type entre axes — proxy de la « cohérence » du profil */
  spread: number;
  /** Niveau qualitatif sur le global */
  level: SynthesisLevel;
  /** Les 8 axes individuels, triés du meilleur au pire */
  axes: SynthesisAxis[];
  /** Sous-ensemble axes triés par score décroissant (forces) */
  strengths: SynthesisAxis[];
  /** Sous-ensemble axes triés par score croissant (tensions) */
  tensions: SynthesisAxis[];
  /** Signature narrative en 1 phrase */
  signature: string;
}

function levelFromScore(s: number): SynthesisLevel {
  if (s >= 7.5) return "excellent";
  if (s >= 5.5) return "bon";
  if (s >= 4) return "moyen";
  return "tendu";
}

export function computeCitySynthesis(city: CitySeed): CitySynthesis {
  // Reload des composites (les libs ont déjà leur cache module-level)
  const env = computeEnvironmentIndex(city);
  const health = computeHealthcareAccess(city);
  const job = computeEmploymentMarket(city);
  const qol = computeQualityOfLife(city);
  const cycling = computeCyclingMobility(city);
  const safety = computeSafetyDeep(city);
  const demo = computeDemography(city);
  const services = computePublicServices(city);

  // Normalisation : tout vers « 10 = excellent ».
  // - env, santé, emploi, sécurité, démo, services : composite « 10 = pire » → inverser
  // - cadre-de-vie (F52) : déjà « 10 = excellent », gardé tel quel
  // - vélo (F57) : déjà « 10 = excellent », gardé tel quel
  const axes: SynthesisAxis[] = [
    {
      key: "cadre-de-vie",
      label: "Cadre de vie",
      hint: "Méga-index env + santé + emploi",
      score: qol.score,
      level: levelFromScore(qol.score),
      href: `/villes/${city.slug}`, // hero badge F56 déjà sur la fiche, on renvoie là
      tag: "F52",
    },
    {
      key: "environnement",
      label: "Environnement",
      hint: "Air · bruit · eau · risques",
      score: Math.round(env.healthScore * 10) / 10,
      level: levelFromScore(env.healthScore),
      href: `/villes/${city.slug}/air`,
      tag: "F44",
    },
    {
      key: "sante",
      label: "Santé",
      hint: "MG · spé · urgences · pharma",
      score: Math.round((10 - health.composite) * 10) / 10,
      level: levelFromScore(10 - health.composite),
      href: `/villes/${city.slug}/sante`,
      tag: "F47",
    },
    {
      key: "emploi",
      label: "Emploi",
      hint: "Chômage · salaires · dynamisme",
      score: Math.round((10 - job.composite) * 10) / 10,
      level: levelFromScore(10 - job.composite),
      href: `/villes/${city.slug}/emploi`,
      tag: "F50",
    },
    {
      key: "velo",
      label: "Vélo",
      hint: "Réseau · relief · sécurité",
      score: cycling.composite,
      level: levelFromScore(cycling.composite),
      href: `/villes/${city.slug}/velo`,
      tag: "F57",
    },
    {
      key: "securite",
      label: "Sécurité",
      hint: "Biens · personnes · nuit · VFFS",
      score: Math.round((10 - safety.composite) * 10) / 10,
      level: levelFromScore(10 - safety.composite),
      href: `/villes/${city.slug}/securite`,
      tag: "F58",
    },
    {
      key: "demographie",
      label: "Démographie",
      hint: "Vieillis. · jeunes · trajectoire",
      score: Math.round((10 - demo.composite) * 10) / 10,
      level: levelFromScore(10 - demo.composite),
      href: `/villes/${city.slug}/demographie`,
      tag: "F59",
    },
    {
      key: "services-publics",
      label: "Services publics",
      hint: "Écoles · Poste · mairie · médiath.",
      score: Math.round((10 - services.composite) * 10) / 10,
      level: levelFromScore(10 - services.composite),
      href: `/villes/${city.slug}/services-publics`,
      tag: "F60",
    },
  ];

  // Global = moyenne arithmétique des 8 axes (orientation positive).
  const sum = axes.reduce((acc, a) => acc + a.score, 0);
  const global = Math.round((sum / axes.length) * 10) / 10;
  // Écart-type : mesure de la « cohérence » — un profil tendu uniformément
  // est moins inconfortable qu'un profil contrasté (bon sur 4, désastre sur 4).
  const variance = axes.reduce((acc, a) => acc + (a.score - global) ** 2, 0) / axes.length;
  const spread = Math.round(Math.sqrt(variance) * 10) / 10;

  const sorted = [...axes].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 3);
  const tensions = [...axes].sort((a, b) => a.score - b.score).slice(0, 3);

  const signature = composeSignature(city.name, global, spread, strengths, tensions);

  return {
    global,
    spread,
    level: levelFromScore(global),
    axes: sorted,
    strengths,
    tensions,
    signature,
  };
}

function composeSignature(
  name: string,
  global: number,
  spread: number,
  strengths: SynthesisAxis[],
  tensions: SynthesisAxis[],
): string {
  const top = strengths[0]?.label.toLowerCase();
  const bottom = tensions[0]?.label.toLowerCase();
  const profile =
    global >= 7
      ? "panorama très favorable"
      : global >= 5.5
        ? "panorama équilibré"
        : global >= 4
          ? "panorama moyen"
          : "panorama tendu";
  const coherence =
    spread <= 1.2
      ? "profil cohérent sur l'ensemble des dimensions"
      : spread <= 2
        ? "profil contrasté"
        : "profil très contrasté — forces et tensions marquées";

  if (global >= 7 && spread <= 1.2) {
    return `${name} affiche un ${profile} et un ${coherence}. Pas de point faible majeur.`;
  }
  if (global <= 4) {
    return `${name} présente un ${profile} avec tension principale sur ${bottom}. ${coherence.charAt(0).toUpperCase() + coherence.slice(1)}.`;
  }
  return `${name} offre un ${profile} (global ${global}/10), porté par ${top} ; principale tension sur ${bottom}. ${coherence.charAt(0).toUpperCase() + coherence.slice(1)}.`;
}

export const SYNTHESIS_LEVEL_LABEL: Record<SynthesisLevel, string> = {
  excellent: "Excellent",
  bon: "Bon",
  moyen: "Moyen",
  tendu: "Tendu",
};

export const SYNTHESIS_LEVEL_COLOR: Record<SynthesisLevel, string> = {
  excellent: "text-emerald-600",
  bon: "text-lime-600",
  moyen: "text-amber-600",
  tendu: "text-red-600",
};

export const SYNTHESIS_LEVEL_BG: Record<SynthesisLevel, string> = {
  excellent: "bg-emerald-50 border-emerald-200",
  bon: "bg-lime-50 border-lime-200",
  moyen: "bg-amber-50 border-amber-200",
  tendu: "bg-red-50 border-red-200",
};

// ─── Rankings ─────────────────────────────────────────────────────────────

export interface SynthesisRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  synthesis: CitySynthesis;
}

let SYNTHESIS_RANKING_CACHE: SynthesisRanking[] | null = null;

export function getSynthesisRankings(): SynthesisRanking[] {
  if (SYNTHESIS_RANKING_CACHE) return SYNTHESIS_RANKING_CACHE;
  SYNTHESIS_RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    synthesis: computeCitySynthesis(c),
  }));
  return SYNTHESIS_RANKING_CACHE;
}

/** Villes au profil global le plus favorable = global le plus haut. */
export function topSynthesisGlobal(limit = 30, minPopulation = 0): SynthesisRanking[] {
  return getSynthesisRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.synthesis.global - a.synthesis.global)
    .slice(0, limit);
}

/** Villes au profil global le plus tendu = global le plus bas. */
export function bottomSynthesisGlobal(limit = 20, minPopulation = 0): SynthesisRanking[] {
  return getSynthesisRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.synthesis.global - b.synthesis.global)
    .slice(0, limit);
}

// ─── Personalized weighting (F64) ─────────────────────────────────────────

/** 8 axis weights on a 1-5 scale. Normalized internally to sum 100 %. */
export interface SynthesisWeights {
  env: number;
  health: number;
  job: number;
  qol: number;
  cycling: number;
  safety: number;
  demo: number;
  services: number;
}

export const DEFAULT_SYNTHESIS_WEIGHTS: SynthesisWeights = {
  env: 3,
  health: 3,
  job: 3,
  qol: 3,
  cycling: 3,
  safety: 3,
  demo: 3,
  services: 3,
};

export interface PersonalSynthesisRow {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  /** Composite recalculé selon les poids utilisateur, 0-10 (10 = excellent) */
  personalGlobal: number;
  /** Niveau qualitatif basé sur personalGlobal */
  level: SynthesisLevel;
  /** Les 8 axes individuels (réutilisés tels quels) */
  axes: SynthesisAxis[];
}

/**
 * Recompute le palmarès en pondérant chaque axe selon les préférences
 * utilisateur. Pas de recompute des sous-scores — on réutilise le cache
 * `getSynthesisRankings()` (les 8 scores par ville sont déjà déterminés).
 * Renormalisation : Σ weights → 1.0.
 */
export function personalSynthesisRanking(
  weights: SynthesisWeights,
  limit = 10,
  minPopulation = 0,
): PersonalSynthesisRow[] {
  const total =
    weights.env +
    weights.health +
    weights.job +
    weights.qol +
    weights.cycling +
    weights.safety +
    weights.demo +
    weights.services;
  // Avoid division by zero ; fall back to equal weights.
  const safeTotal = total > 0 ? total : 8;
  const wEnv = weights.env / safeTotal;
  const wHealth = weights.health / safeTotal;
  const wJob = weights.job / safeTotal;
  const wQol = weights.qol / safeTotal;
  const wCycling = weights.cycling / safeTotal;
  const wSafety = weights.safety / safeTotal;
  const wDemo = weights.demo / safeTotal;
  const wServices = weights.services / safeTotal;

  return getSynthesisRankings()
    .filter((r) => r.population >= minPopulation)
    .map((r) => {
      // Pull the axis scores by key from the synthesis output.
      const byKey: Record<string, number> = {};
      for (const a of r.synthesis.axes) byKey[a.key] = a.score;
      const personalGlobal =
        Math.round(
          ((byKey["environnement"] ?? 0) * wEnv +
            (byKey["sante"] ?? 0) * wHealth +
            (byKey["emploi"] ?? 0) * wJob +
            (byKey["cadre-de-vie"] ?? 0) * wQol +
            (byKey["velo"] ?? 0) * wCycling +
            (byKey["securite"] ?? 0) * wSafety +
            (byKey["demographie"] ?? 0) * wDemo +
            (byKey["services-publics"] ?? 0) * wServices) * 10,
        ) / 10;
      return {
        slug: r.slug,
        name: r.name,
        region: r.region,
        department: r.department,
        population: r.population,
        personalGlobal,
        level: levelFromScore(personalGlobal),
        axes: r.synthesis.axes,
      };
    })
    .sort((a, b) => b.personalGlobal - a.personalGlobal)
    .slice(0, limit);
}
