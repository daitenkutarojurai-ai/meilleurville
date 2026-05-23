// Empreinte générative par ville (R10.2). Deterministic SVG geometry derived
// from the 8 score axes + the city slug. Same input → identical output, so the
// signature can be cached, exported, and shared like a Spotify Wrapped card.
//
// Structural shape (petal length, petal colour, signature polygon) is driven
// entirely by the scores. The slug seeds only secondary aesthetics (overall
// rotation, orbital dot positions) so visually similar cities still get a
// distinct flourish.

import { SCORE_TIERS } from "@/lib/utils";

type ScoreAxes = {
  global: number;
  life: number;
  transport: number;
  nature: number;
  cost: number;
  safety: number;
  culture: number;
  remoteWork: number;
  schools: number;
};

export const FINGERPRINT_AXES: Array<{ key: keyof Omit<ScoreAxes, "global">; label: string; short: string }> = [
  { key: "life",       label: "Qualité de vie", short: "Vie" },
  { key: "culture",    label: "Culture",         short: "Culture" },
  { key: "transport",  label: "Transport",       short: "Transit" },
  { key: "remoteWork", label: "Télétravail",     short: "Remote" },
  { key: "schools",    label: "Écoles",          short: "Écoles" },
  { key: "safety",     label: "Sécurité",        short: "Sécu" },
  { key: "cost",       label: "Coût",            short: "Coût" },
  { key: "nature",     label: "Nature",          short: "Nature" },
];

function hashSlug(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexFor(score: number): string {
  for (const tier of SCORE_TIERS) {
    if (score >= tier.min) return tier.hex;
  }
  return SCORE_TIERS[SCORE_TIERS.length - 1].hex;
}

export interface Petal {
  key: string;
  label: string;
  short: string;
  score: number;
  /** angle in radians, 0 = right, -PI/2 = up */
  angle: number;
  length: number;
  tipX: number;
  tipY: number;
  /** label anchor, slightly beyond the tip */
  labelX: number;
  labelY: number;
  textAnchor: "start" | "middle" | "end";
  color: string;
}

export interface OrbitalDot {
  x: number;
  y: number;
  r: number;
  alpha: number;
  color: string;
}

export interface FingerprintGeometry {
  cx: number;
  cy: number;
  size: number;
  rotation: number;
  globalScore: number;
  centerColor: string;
  petals: Petal[];
  polygonPoints: string;
  orbitalDots: OrbitalDot[];
}

const SIZE = 400;
const CENTER = SIZE / 2;
const BASE_RADIUS = 56;
const SCORE_SPAN = 116;

export function buildFingerprint(input: { slug: string; scores: ScoreAxes }): FingerprintGeometry {
  const rng = mulberry32(hashSlug(input.slug));
  const rotation = Math.floor(rng() * 360);
  const globalScore = input.scores.global;
  const centerColor = hexFor(globalScore);

  const petals: Petal[] = FINGERPRINT_AXES.map((axis, i) => {
    const raw = input.scores[axis.key];
    const clamped = Math.max(0, Math.min(10, raw));
    const length = BASE_RADIUS + (clamped / 10) * SCORE_SPAN;
    const angle = (i / FINGERPRINT_AXES.length) * Math.PI * 2 - Math.PI / 2;
    const tipX = CENTER + Math.cos(angle) * length;
    const tipY = CENTER + Math.sin(angle) * length;
    const labelOffset = length + 18;
    const labelX = CENTER + Math.cos(angle) * labelOffset;
    const labelY = CENTER + Math.sin(angle) * labelOffset;
    const cosA = Math.cos(angle);
    const textAnchor: Petal["textAnchor"] = cosA > 0.3 ? "start" : cosA < -0.3 ? "end" : "middle";
    return {
      key: axis.key,
      label: axis.label,
      short: axis.short,
      score: raw,
      angle,
      length,
      tipX,
      tipY,
      labelX,
      labelY,
      textAnchor,
      color: hexFor(raw),
    };
  });

  const polygonPoints = petals.map((p) => `${p.tipX.toFixed(2)},${p.tipY.toFixed(2)}`).join(" ");

  const orbitalDots: OrbitalDot[] = Array.from({ length: 16 }, () => {
    const angle = rng() * Math.PI * 2;
    const radius = BASE_RADIUS + SCORE_SPAN + 8 + rng() * 36;
    return {
      x: CENTER + Math.cos(angle) * radius,
      y: CENTER + Math.sin(angle) * radius,
      r: 1.1 + rng() * 2.3,
      alpha: 0.18 + rng() * 0.42,
      color: hexFor(globalScore),
    };
  });

  return {
    cx: CENTER,
    cy: CENTER,
    size: SIZE,
    rotation,
    globalScore,
    centerColor,
    petals,
    polygonPoints,
    orbitalDots,
  };
}
