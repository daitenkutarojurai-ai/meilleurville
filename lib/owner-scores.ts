// F3 — Scores propriétaires v0.
//
// 10 derived scores per city, each tagged with its provenance. v0 is computed
// deterministically from the existing seed (avgTempJuly, population, dept,
// existing axes) — NO live data fetched.
//
// The purpose of v0 is to ship the UX (city profile bloc, ranking surface,
// methode update) immediately so the next iteration is just a data swap, not
// a redesign. Every score's `source` field declares the proxy used; when real
// feeds are wired (Météo-France ARPEGE, INSEE recensement, Bruitparif, SSMSI
// VFFS, ATMO, SIRENE), only this module changes.
//
// CRITICAL: when upgrading a score, keep the SourceKind and `source` string
// honest. A score derived from a real feed must say so; a proxy must say so.
// Per CLAUDE.md: "No silent fake data."

import type { City } from "@/lib/types";
import { CITIES_SEED } from "@/data/cities-seed";
import { scoreColor } from "@/lib/utils";

export type SourceKind = "real" | "proxy-v0" | "estimation-regionale";

export type OwnerScoreKey =
  | "score_canicule"
  | "score_solitude"
  | "score_bruit"
  | "score_securite_nocturne"
  | "score_sans_voiture"
  | "score_teletravail"
  | "score_qualite_air"
  | "score_securite_femme_seule"
  | "score_jeune_actif"
  | "score_famille";

export interface OwnerScore {
  key: OwnerScoreKey;
  label: string;
  value: number; // 0..10 (10 = best / lowest risk / best fit)
  source: string; // human-readable provenance
  kind: SourceKind;
  // Higher-value-is-better semantics. Most scores follow that, but a few
  // (canicule, bruit, solitude) are inverted at compute time so the UI can
  // render them uniformly.
}

// Department-level estimates of the % of single-person households (Insee
// recensement, projection 2025). Used by `score_solitude` as a proxy until
// the real Insee dataset is wired into a build-time import. v0 values are
// regional averages; cities inherit their department's value.
const DEPT_SINGLE_HOUSEHOLD_PCT: Record<string, number> = {
  Paris: 51,
  "Hauts-de-Seine": 42,
  "Seine-Saint-Denis": 38,
  "Val-de-Marne": 39,
  "Rhône": 41,
  "Métropole de Lyon": 41,
  "Bouches-du-Rhône": 39,
  "Gironde": 38,
  "Haute-Garonne": 39,
  "Loire-Atlantique": 37,
  "Ille-et-Vilaine": 38,
  "Hérault": 40,
  "Bas-Rhin": 39,
  "Alpes-Maritimes": 41,
  "Haute-Savoie": 33,
  "Isère": 38,
  "Finistère": 36,
  "Var": 37,
  "Vaucluse": 37,
  "Côte-d'Or": 38,
  "Pyrénées-Atlantiques": 37,
  "Indre-et-Loire": 37,
  "Pas-de-Calais": 33,
  "Nord": 36,
  "Meurthe-et-Moselle": 37,
};

// Department-level FTTH coverage proxy (ARCEP T4 2024 simulation). Used by
// `score_teletravail` until real ARCEP open data is imported.
const DEPT_FTTH_PCT: Record<string, number> = {
  Paris: 99,
  "Hauts-de-Seine": 98,
  "Rhône": 92,
  "Métropole de Lyon": 95,
  "Bouches-du-Rhône": 87,
  "Gironde": 86,
  "Haute-Garonne": 89,
  "Loire-Atlantique": 91,
  "Ille-et-Vilaine": 93,
  "Hérault": 88,
  "Bas-Rhin": 90,
  "Alpes-Maritimes": 84,
  "Haute-Savoie": 80,
  "Isère": 87,
  "Finistère": 88,
  "Côte-d'Or": 84,
  "Pyrénées-Atlantiques": 85,
  "Var": 82,
};

// Department-level PM2.5 annual mean (ATMO 2023, µg/m³). Lower = better.
// Threshold: WHO 2021 says >5 µg/m³ is already harmful; French average is
// around 10. Used by `score_qualite_air` as a v0 proxy.
const DEPT_PM25_AVG: Record<string, number> = {
  Paris: 13,
  "Hauts-de-Seine": 13,
  "Rhône": 13,
  "Métropole de Lyon": 13,
  "Bouches-du-Rhône": 12,
  "Gironde": 9,
  "Haute-Garonne": 10,
  "Loire-Atlantique": 9,
  "Ille-et-Vilaine": 8,
  "Hérault": 10,
  "Bas-Rhin": 11,
  "Alpes-Maritimes": 11,
  "Haute-Savoie": 13, // Arve valley inversion
  "Isère": 13, // Grenoble winter inversion
  "Finistère": 7,
  "Var": 10,
  "Vaucluse": 11,
  "Côte-d'Or": 10,
  "Pyrénées-Atlantiques": 8,
};

function clamp(n: number, lo = 0, hi = 10): number {
  return Math.max(lo, Math.min(hi, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

type SeedCity = (typeof CITIES_SEED)[number];

// --- per-score computations ---

// Higher score = LESS heat stress.
// Anchor: avgTempJuly. 30°C+ → low; ≤22°C → high.
function canicule(city: SeedCity): OwnerScore {
  const t = city.avgTempJuly ?? 23;
  // Linear, anchored on the cool end so northern/Atlantic/mountain cities aren't
  // a flat ~190-way tie at 10: 18→9.7, 20→8.3, 22→6.9, 26→4.1, 30→1.3.
  // Monotonic in temperature, so the ranking order is unchanged — only the
  // previously-clamped top now spreads out (e.g. Brest > Marseille).
  const value = clamp(9.7 - (t - 18) * 0.7);
  return {
    key: "score_canicule",
    label: "Résistance canicule",
    value: round1(value),
    source: "Proxy v0 — dérivé de la température moyenne de juillet (Open-Meteo / climatologie 1991-2020). À remplacer par projection Météo-France ARPEGE 2040 (jours > 30 °C).",
    kind: "proxy-v0",
  };
}

// Higher = less isolation. Anchor: dept-level single-household %.
// 30% → 8.5, 40% → 6.0, 50% → 3.5. Small towns (pop < 30k) get +0.8.
function solitude(city: SeedCity): OwnerScore {
  const pct = DEPT_SINGLE_HOUSEHOLD_PCT[city.department ?? ""];
  if (pct == null) {
    // Regional-average fallback: 35% (median French department).
    return {
      key: "score_solitude",
      label: "Lien social",
      value: 6.5,
      source: "Estimation régionale (médiane Insee). Sera précisé par département au prochain import.",
      kind: "estimation-regionale",
    };
  }
  let value = 8.5 - (pct - 30) * 0.25;
  if ((city.population ?? 100000) < 30000) value += 0.8;
  return {
    key: "score_solitude",
    label: "Lien social",
    value: round1(clamp(value)),
    source: `Proxy v0 — % ménages 1 personne au niveau département (${pct}%, Insee recensement 2020). À remplacer par % ménages 1 personne au niveau commune + % +75 ans.`,
    kind: "proxy-v0",
  };
}

// Higher = quieter. Population + dept "Île-de-France" / dense metros = louder.
// No CBS data yet — proxy on population density.
function bruit(city: SeedCity): OwnerScore {
  const pop = city.population ?? 50000;
  // Base raised so genuinely quiet villages can reach the 9-10 band instead of
  // capping at 8.5; penalties keep dense metros differentiated. Monotonic in
  // population → ranking order unchanged, top end just opens up.
  let value = 9.6;
  if (pop > 300000) value -= 2.8;
  else if (pop > 150000) value -= 1.7;
  else if (pop > 60000) value -= 0.8;
  else if (pop < 20000) value += 0.2;
  // Île-de-France penalty (Bruitparif maps show ≥ 60 dB(A) Lden in most
  // communes around Paris)
  if (city.region === "Île-de-France" && city.slug !== "fontainebleau") value -= 1.2;
  return {
    key: "score_bruit",
    label: "Calme sonore",
    value: round1(clamp(value)),
    source: "Proxy v0 — pénalité population + zone dense IDF. À remplacer par Bruitparif (IDF) + Cartes de Bruit Stratégiques Cerema (zones Lden ≥ 55 dB(A)).",
    kind: "proxy-v0",
  };
}

// Higher = safer at night. Uses existing safety score, slightly steeper
// (nightlife / drunk-related incidents amplify variance).
function securiteNocturne(city: SeedCity): OwnerScore {
  const base = city.scores.safety;
  const value = clamp(base - (10 - base) * 0.15);
  return {
    key: "score_securite_nocturne",
    label: "Sécurité nocturne",
    value: round1(value),
    source: `Proxy v0 — dérivé du score sécurité (calibré sur SSMSI atteintes / 1 000 hab.). À remplacer par SSMSI sous-catégorie "atteintes nuit" + segmentation horaire.`,
    kind: "proxy-v0",
  };
}

// Higher = easier without a car. Uses transport axis directly + bonus for
// large + dense + tram-equipped cities.
function sansVoiture(city: SeedCity): OwnerScore {
  let value = city.scores.transport;
  // Bonus for known tram/metro cities (already reflected in transport, but
  // re-weighted to penalise "car-required" mid-size cities more)
  if ((city.population ?? 0) < 80000 && city.scores.transport < 6.5) {
    value -= 0.8;
  }
  return {
    key: "score_sans_voiture",
    label: "Vie sans voiture",
    value: round1(clamp(value)),
    source: "Proxy v0 — dérivé du score transport (GTFS multimodal + walkability OSM). À enrichir avec Insee Mobilité (% ménages sans voiture) et densité réseau vélo (OSM).",
    kind: "proxy-v0",
  };
}

// Higher = better for remote work. FTTH coverage + existing remoteWork axis.
function teletravail(city: SeedCity): OwnerScore {
  const ftth = DEPT_FTTH_PCT[city.department ?? ""];
  if (ftth == null) {
    return {
      key: "score_teletravail",
      label: "Télétravail",
      value: round1(city.scores.remoteWork),
      source: "Proxy v0 — score télétravail existant (couverture fibre + % cadres dérivé). À remplacer par ARCEP open data FTTH au niveau commune.",
      kind: "proxy-v0",
    };
  }
  // FTTH 95%+ → +1, 80% → 0, 65% → -1
  const ftthAdj = (ftth - 80) * 0.066;
  const value = clamp(city.scores.remoteWork + ftthAdj);
  return {
    key: "score_teletravail",
    label: "Télétravail",
    value: round1(value),
    source: `Proxy v0 — couverture FTTH département (${ftth}%, ARCEP T4 2024 estimé) combinée au score remote-work existant.`,
    kind: "proxy-v0",
  };
}

// Higher = cleaner air. Inverted PM2.5 (lower µg/m³ = better).
function qualiteAir(city: SeedCity): OwnerScore {
  const pm25 = DEPT_PM25_AVG[city.department ?? ""];
  if (pm25 == null) {
    return {
      key: "score_qualite_air",
      label: "Qualité air",
      value: 7.0,
      source: "Estimation régionale — moyenne PM2.5 France métropolitaine (~10 µg/m³). À remplacer par ATMO France station-par-station (au niveau commune).",
      kind: "estimation-regionale",
    };
  }
  // 5 µg/m³ → 9.5, 10 → 7, 15 → 4, 20 → 2
  const value = clamp(9.5 - (pm25 - 5) * 0.5);
  return {
    key: "score_qualite_air",
    label: "Qualité air",
    value: round1(value),
    source: `Proxy v0 — PM2.5 moyen annuel département (${pm25} µg/m³, ATMO France 2023). À précicer par commune.`,
    kind: "proxy-v0",
  };
}

// Higher = safer for solo women. Existing safety + transport-density bonus.
// Reflects the documented pattern: good night transit reduces solo-female
// exposure.
function securiteFemmeSeule(city: SeedCity): OwnerScore {
  const safety = city.scores.safety;
  const transport = city.scores.transport;
  const value = clamp(safety * 0.7 + transport * 0.3 - 0.5);
  return {
    key: "score_securite_femme_seule",
    label: "Sécurité femme seule",
    value: round1(value),
    source: "Proxy v0 — sécurité (SSMSI) pondérée 70% + densité transport (proxy retour soir) 30%. À remplacer par SSMSI VFFS spécifique femmes + indice tramway-tard-le-soir.",
    kind: "proxy-v0",
  };
}

// Higher = more attractive to young professionals. Culture + remoteWork +
// cost + a small "metropolitan magnetism" bonus for cities ≥ 100k.
function jeuneActif(city: SeedCity): OwnerScore {
  const base = (city.scores.culture + city.scores.remoteWork + city.scores.cost) / 3;
  const popBonus = (city.population ?? 0) > 100000 ? 0.8 : 0;
  const value = clamp(base + popBonus);
  return {
    key: "score_jeune_actif",
    label: "Jeune actif",
    value: round1(value),
    source: "Proxy v0 — moyenne culture + remoteWork + cost + bonus métropole. À remplacer par % 25-35 ans (Insee) + ouvertures SIRENE (cafés / bars / coworking / freelances) sur 3 ans.",
    kind: "proxy-v0",
  };
}

// Higher = better for families. Existing schools + safety + nature - cost
// penalty if very expensive.
function famille(city: SeedCity): OwnerScore {
  const base = (city.scores.schools + city.scores.safety + city.scores.nature) / 3;
  const costPenalty = city.scores.cost < 4 ? 0.5 : 0;
  const value = clamp(base - costPenalty);
  return {
    key: "score_famille",
    label: "Famille",
    value: round1(value),
    source: "Proxy v0 — moyenne écoles + sécurité + nature, pénalité si coût très élevé. À enrichir avec DEPP (effectifs écoles, taux de réussite brevet) + CAF (places crèche / 1000 enfants) + densité pédiatres ARS.",
    kind: "proxy-v0",
  };
}

const COMPUTERS: Array<(city: SeedCity) => OwnerScore> = [
  canicule,
  solitude,
  bruit,
  securiteNocturne,
  sansVoiture,
  teletravail,
  qualiteAir,
  securiteFemmeSeule,
  jeuneActif,
  famille,
];

export function computeOwnerScores(city: SeedCity | City): OwnerScore[] {
  // SeedCity and City share the fields we read. Cast for the helpers.
  return COMPUTERS.map((fn) => fn(city as SeedCity));
}

// UI helpers
// Owner scores are on the canonical 0-10 "10 = bon" scale, so they route
// through the single-source 6-tier scale in lib/utils (was a divergent
// 5-tier ladder that mis-coloured values vs the rest of the site).
export function ownerScoreColor(value: number): string {
  return scoreColor(value);
}

export function sourceKindBadge(kind: SourceKind): { label: string; tone: string } {
  switch (kind) {
    case "real":
      return { label: "Source réelle", tone: "bg-emerald-500/10 text-emerald-700 border-emerald-400/30" };
    case "estimation-regionale":
      return { label: "Estim. régionale", tone: "bg-amber-500/10 text-amber-700 border-amber-400/30" };
    case "proxy-v0":
    default:
      return { label: "Estimation", tone: "bg-blue-500/10 text-blue-700 border-blue-400/30" };
  }
}
