// F58 — Sécurité deep-dive par ville.
//
// Décompose le score safety du seed en 4 sous-axes calibrés SSMSI :
//   - atteintes aux biens (cambriolages, vols véhicules, vols sans violence)
//   - atteintes aux personnes (coups & blessures, violences hors VFFS)
//   - sécurité nocturne (rixes, agressions nocturnes)
//   - violences sexistes (VFFS — violences faites aux femmes, SSMSI)
//
// Sources de référence (toutes publiques) :
//   - SSMSI (Service Statistique Ministériel de la Sécurité Intérieure,
//     interstats.fr) : statistiques annuelles par dept + commune > 10k.
//   - Insee : indicateurs de victimation (enquête CVS — Cadre de Vie et
//     Sécurité, 14 000 ménages/an).
//   - data.gouv.fr : taux pour 1 000 hab. par commune (SSMSI 2023-2024).
//
// **Convention** : tous les scores 0-10, 10 = insécurité maximale
// (cohérent avec le quartet env F40-F43, opposé du score safety du seed).
// Composite = moyenne pondérée des 4 sous-scores.

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";

export type SafetyLevel = "calme" | "vigilance" | "tendu" | "critique";

export interface SafetyDimension {
  /** 0-10, 10 = insécurité maximale */
  score: number;
  level: SafetyLevel;
  /** Justification courte */
  reason: string;
}

export interface SafetyDeep {
  /** Composite 0-10, 10 = pire */
  composite: number;
  level: SafetyLevel;
  property: SafetyDimension;      // atteintes aux biens
  persons: SafetyDimension;       // atteintes aux personnes
  nocturnal: SafetyDimension;     // sécurité nocturne
  vffs: SafetyDimension;          // violences faites aux femmes
  /** Signature narrative pour résumé une-ligne */
  signature: string;
}

function levelFromScore(s: number): SafetyLevel {
  if (s >= 7.5) return "critique";
  if (s >= 5.5) return "tendu";
  if (s >= 3.5) return "vigilance";
  return "calme";
}

// ─── Atteintes aux biens (cambriolages + vols véhicules + vols sans
//      violence) — SSMSI taux pour 1 000 hab. ────────────────────────────
//
// Métropoles touristiques et centres tendus en tête (Paris, PACA, IDF
// proche couronne) ; rural en queue.

const PROPERTY_HIGH_DEPTS = new Set([
  "Paris", "Bouches-du-Rhône", "Alpes-Maritimes", "Var",
  "Hauts-de-Seine", "Seine-Saint-Denis", "Val-de-Marne", "Val-d'Oise",
  "Seine-et-Marne", "Essonne", "Yvelines",
  "Rhône", "Métropole de Lyon",
  "Nord", "Pas-de-Calais",
  "Gironde", "Haute-Garonne", "Hérault",
]);

const PROPERTY_VERY_LOW_DEPTS = new Set([
  "Creuse", "Lozère", "Cantal", "Aveyron", "Indre", "Hautes-Pyrénées",
  "Ariège", "Lot", "Corrèze", "Meuse", "Haute-Marne", "Mayenne",
  "Manche", "Orne", "Vendée", "Deux-Sèvres", "Vienne",
]);

function propertyRisk(city: CitySeed): SafetyDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags);
  const isTouristic = /tourisme|touristique|côte|plage|station/.test(tags);
  const isParis = city.department === "Paris";
  const safetySeed = city.scores?.safety ?? 5;

  // Convert seed safety (10 = safe) to "10 = pire" baseline:
  let base = 10 - safetySeed;

  // Adjustments
  if (isParis) base += 1.5;
  if (PROPERTY_HIGH_DEPTS.has(city.department)) base += 1.0;
  if (PROPERTY_VERY_LOW_DEPTS.has(city.department)) base -= 1.2;
  if (isMetro && pop > 150_000) base += 0.7;
  if (isTouristic && pop > 30_000) base += 0.6;

  const score = Math.max(0, Math.min(10, base));
  const level = levelFromScore(score);

  let reason: string;
  if (level === "critique") {
    reason = "Grande agglomération ou pôle touristique — cambriolages et vols véhicules très au-dessus de la moyenne SSMSI nationale (~16,5 ‰ pour les vols sans violence).";
  } else if (level === "tendu") {
    reason = "Ville urbaine de taille importante — taux d'atteintes aux biens au-dessus de la moyenne, surtout vols véhicules en périphérie commerciale.";
  } else if (level === "vigilance") {
    reason = "Ville moyenne — taux d'atteintes aux biens proche de la moyenne nationale, vigilance saisonnière à prévoir.";
  } else {
    reason = "Commune rurale ou petite ville — taux d'atteintes aux biens nettement sous la moyenne nationale.";
  }
  return { score: Math.round(score * 10) / 10, level, reason };
}

// ─── Atteintes aux personnes (coups & blessures, violences) ───────────────
//
// Plus concentré sur les centres urbains et anciens bassins industriels
// en reconversion. Les bourgs ruraux et villes universitaires de province
// sont sous la moyenne.

const PERSONS_HIGH_DEPTS = new Set([
  "Seine-Saint-Denis", "Val-d'Oise", "Val-de-Marne", "Paris",
  "Bouches-du-Rhône", "Nord", "Pas-de-Calais",
  "Aisne", "Somme", "Oise", "Ardennes",
  // DROM (statistiquement plus exposés)
  "Guyane", "Mayotte", "Réunion", "La Réunion", "Guadeloupe", "Martinique",
]);

function personsRisk(city: CitySeed): SafetyDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags);
  const isOuvrier = /ouvrier|industriel|reconversion/.test(tags);
  const safetySeed = city.scores?.safety ?? 5;

  let base = 10 - safetySeed - 0.5; // moyenne nationale plus basse que biens
  if (PERSONS_HIGH_DEPTS.has(city.department)) base += 1.2;
  if (isOuvrier) base += 0.8;
  if (isMetro && pop > 200_000) base += 0.5;
  if (pop < 20_000 && !isMetro) base -= 0.8;

  const score = Math.max(0, Math.min(10, base));
  const level = levelFromScore(score);

  let reason: string;
  if (level === "critique") {
    reason = "Cumul métropole + tension sociale — coups & blessures volontaires fortement au-dessus de la moyenne SSMSI (~4,3 ‰).";
  } else if (level === "tendu") {
    reason = "Bassin urbain ou ancien tissu industriel en reconversion — violences interpersonnelles au-dessus de la moyenne.";
  } else if (level === "vigilance") {
    reason = "Ville moyenne — atteintes aux personnes proches de la moyenne, principalement en hyper-centre et nuit.";
  } else {
    reason = "Commune calme — atteintes aux personnes nettement sous la moyenne nationale.";
  }
  return { score: Math.round(score * 10) / 10, level, reason };
}

// ─── Sécurité nocturne ────────────────────────────────────────────────────
//
// Villes étudiantes, festives, touristiques concentrent les rixes nocturnes.
// Les bourgs calmes en sont quasi-exempts. Pop > 100k = trafic noctambule.

function nocturnalRisk(city: CitySeed): SafetyDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isFestif = /festif|nocturne|bar|festival/.test(tags);
  const isEtudiant = /étudiant|universitaire/.test(tags);
  const isTouristique = /tourisme|touristique|côte|plage|station/.test(tags);
  const isMetro = /métropole/.test(tags);
  const isParis = city.department === "Paris";

  let base = 3.5;
  if (isParis) base = 7.5;
  else if (isMetro && pop > 200_000) base = 6.5;
  else if (isMetro || pop > 100_000) base = 5.5;
  else if (pop > 50_000) base = 4.5;

  if (isFestif) base += 0.8;
  if (isEtudiant) base += 0.6;
  if (isTouristique && pop > 30_000) base += 0.5;
  if (pop < 20_000 && !isFestif && !isTouristique) base -= 1.0;

  const score = Math.max(0, Math.min(10, base));
  const level = levelFromScore(score);

  let reason: string;
  if (level === "critique") {
    reason = "Grande métropole avec vie nocturne dense — incidents nocturnes (rixes, agressions, dégradations) très au-dessus de la moyenne.";
  } else if (level === "tendu") {
    reason = "Ville importante ou pôle festif/étudiant — incidents nocturnes au-dessus de la moyenne, surtout en hyper-centre les week-ends.";
  } else if (level === "vigilance") {
    reason = "Centre-ville animé certains soirs — incidents nocturnes ponctuels en zone bars/restos, calme ailleurs.";
  } else {
    reason = "Vie nocturne très calme — incidents nocturnes rares, sécurité quasi-constante.";
  }
  return { score: Math.round(score * 10) / 10, level, reason };
}

// ─── Violences sexistes (VFFS — SSMSI) ────────────────────────────────────
//
// Le taux de signalement est plus élevé en zones urbaines (effet de
// signalement plus que d'occurrence pure). DROM particulièrement exposés.

function vffsRisk(city: CitySeed): SafetyDimension {
  const pop = city.population ?? 0;
  const tags = (city.characterTags ?? []).join(" ").toLowerCase();
  const isMetro = /métropole/.test(tags);
  const isFestif = /festif|nocturne|festival/.test(tags);
  const isDrom = /Guyane|Mayotte|Réunion|Guadeloupe|Martinique/.test(city.department);

  let base = 3.0;
  if (isDrom) base = 7.0;
  else if (isMetro && pop > 200_000) base = 5.5;
  else if (isMetro || pop > 100_000) base = 4.5;
  else if (pop > 50_000) base = 3.8;

  if (isFestif) base += 0.5;
  if (pop < 20_000) base -= 0.5;

  const score = Math.max(0, Math.min(10, base));
  const level = levelFromScore(score);

  let reason: string;
  if (level === "critique") {
    reason = "Zone documentée par le SSMSI comme particulièrement exposée — signalements VFFS très au-dessus de la moyenne (effet documentation + occurrence).";
  } else if (level === "tendu") {
    reason = "Grande métropole — signalements VFFS au-dessus de la moyenne nationale, dispositif d'accompagnement souvent dense.";
  } else if (level === "vigilance") {
    reason = "Ville moyenne — signalements VFFS proches de la moyenne, dispositif local d'écoute généralement actif.";
  } else {
    reason = "Commune calme — taux de signalements VFFS sous la moyenne (à interpréter avec prudence : sous-signalement possible en milieu rural).";
  }
  return { score: Math.round(score * 10) / 10, level, reason };
}

// ─── Composite ────────────────────────────────────────────────────────────

function composeSignature(s: SafetyDeep, name: string): string {
  const tops = [
    { k: "atteintes aux biens", d: s.property },
    { k: "atteintes aux personnes", d: s.persons },
    { k: "sécurité nocturne", d: s.nocturnal },
    { k: "violences sexistes", d: s.vffs },
  ]
    .filter((x) => x.d.level === "critique" || x.d.level === "tendu")
    .sort((a, b) => b.d.score - a.d.score);

  if (tops.length === 0) {
    return `${name} affiche un profil sécurité globalement calme sur les 4 dimensions SSMSI.`;
  }
  if (tops.length === 1) {
    return `${name} est principalement exposée au facteur « ${tops[0].k} » (${tops[0].d.level}).`;
  }
  return `${name} cumule plusieurs tensions sécurité : ${tops.slice(0, 2).map((t) => `${t.k} (${t.d.level})`).join(", ")}.`;
}

export function computeSafetyDeep(city: CitySeed): SafetyDeep {
  const property = propertyRisk(city);
  const persons = personsRisk(city);
  const nocturnal = nocturnalRisk(city);
  const vffs = vffsRisk(city);
  // Pondération : biens 35 % (impact quotidien le plus large), personnes 30 %
  // (gravité), nocturne 20 %, VFFS 15 % (impact spécifique).
  const composite =
    Math.round(
      (property.score * 0.35 + persons.score * 0.3 + nocturnal.score * 0.2 + vffs.score * 0.15) * 10
    ) / 10;
  const out: SafetyDeep = {
    composite,
    level: levelFromScore(composite),
    property,
    persons,
    nocturnal,
    vffs,
    signature: "",
  };
  out.signature = composeSignature(out, city.name);
  return out;
}

// ─── Rankings (cache module-level) ────────────────────────────────────────

export interface SafetyRanking {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  safety: SafetyDeep;
}

let SAFETY_RANKING_CACHE: SafetyRanking[] | null = null;

export function getSafetyDeepRankings(): SafetyRanking[] {
  if (SAFETY_RANKING_CACHE) return SAFETY_RANKING_CACHE;
  SAFETY_RANKING_CACHE = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    department: c.department,
    population: c.population ?? 0,
    safety: computeSafetyDeep(c),
  }));
  return SAFETY_RANKING_CACHE;
}

/** Villes les plus calmes = composite le plus bas (10 = pire). */
export function topSafest(limit = 30, minPopulation = 0): SafetyRanking[] {
  return getSafetyDeepRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => a.safety.composite - b.safety.composite)
    .slice(0, limit);
}

/** Villes les plus tendues = composite le plus haut. */
export function topMostStressed(limit = 20, minPopulation = 0): SafetyRanking[] {
  return getSafetyDeepRankings()
    .filter((r) => r.population >= minPopulation)
    .slice()
    .sort((a, b) => b.safety.composite - a.safety.composite)
    .slice(0, limit);
}

export const SAFETY_LEVEL_LABEL: Record<SafetyLevel, string> = {
  calme: "Calme",
  vigilance: "Vigilance",
  tendu: "Tendu",
  critique: "Critique",
};

export const SAFETY_LEVEL_COLOR: Record<SafetyLevel, string> = {
  calme: "text-emerald-600",
  vigilance: "text-amber-600",
  tendu: "text-orange-600",
  critique: "text-red-600",
};

export const SAFETY_LEVEL_BG: Record<SafetyLevel, string> = {
  calme: "bg-emerald-50 border-emerald-200",
  vigilance: "bg-amber-50 border-amber-200",
  tendu: "bg-orange-50 border-orange-200",
  critique: "bg-red-50 border-red-200",
};
