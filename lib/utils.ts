import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function formatScore(score: number | null | undefined): string {
  if (score == null) return "—";
  return score.toFixed(1);
}

/**
 * The seed stores annual sunshine in **hours/year** (Marseille 2 850, Paris 1 630).
 * French readers usually think in **jours d'ensoleillement** (Marseille ≈ 300 j).
 * Météo-France defines a sunny day as ≥4 h direct sun; the empirical conversion
 * is roughly hours / 9.5. We expose both helpers so views stay consistent.
 */
export function sunshineHours(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${formatNumber(value)} h`;
}

export function sunshineDays(value: number | null | undefined): number | null {
  if (value == null) return null;
  return Math.round(value / 9.5);
}

export function formatSunshineDays(value: number | null | undefined): string {
  const d = sunshineDays(value);
  return d == null ? "—" : `${d} j`;
}

/**
 * Single source of truth for the 6-tier score colour scale.
 * Documented in CLAUDE.md — every UI surface that paints a score must
 * route through this function so a change here applies everywhere.
 */
export const SCORE_TIERS = [
  { min: 7.5, text: "text-purple-500", bar: "bg-purple-500", hex: "#A855F7", bg: "bg-purple-500/15 border-purple-500/40", label: "exceptionnel" },
  { min: 7.0, text: "text-green-500",  bar: "bg-green-500",  hex: "#16A34A", bg: "bg-green-500/10 border-green-500/30",   label: "excellent" },
  { min: 6.0, text: "text-lime-500",   bar: "bg-lime-500",   hex: "#84CC16", bg: "bg-lime-500/10 border-lime-500/30",     label: "bon" },
  { min: 5.0, text: "text-amber-400",  bar: "bg-amber-400",  hex: "#F59E0B", bg: "bg-amber-400/10 border-amber-400/30",   label: "moyen" },
  { min: 4.0, text: "text-orange-500", bar: "bg-orange-500", hex: "#F97316", bg: "bg-orange-500/10 border-orange-500/30", label: "en dessous" },
  { min: -Infinity, text: "text-red-500", bar: "bg-red-500", hex: "#EF4444", bg: "bg-red-500/10 border-red-500/30",    label: "mauvais" },
] as const;

function tierFor(score: number) {
  return SCORE_TIERS.find((t) => score >= t.min) ?? SCORE_TIERS[SCORE_TIERS.length - 1];
}

export function scoreColor(score: number): string {
  return tierFor(score).text;
}

export function scoreHex(score: number): string {
  return tierFor(score).hex;
}

export function scoreBg(score: number): string {
  return tierFor(score).bg;
}

export function scoreLabel(score: number): string {
  return tierFor(score).label;
}

export function scoreBarColor(score: number): string {
  return tierFor(score).bar;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function badgeLabel(level: string): string {
  const labels: Record<string, string> = {
    Explorateur: "Explorateur",
    Cartographe: "Cartographe",
    Ambassadeur: "Ambassadeur",
    Legende: "Légende",
  };
  return labels[level] ?? level;
}

export function badgeColor(level: string): string {
  const colors: Record<string, string> = {
    Explorateur: "text-slate-400 border-slate-600",
    Cartographe: "text-blue-400 border-blue-600",
    Ambassadeur: "text-violet-400 border-violet-600",
    Legende: "text-amber-400 border-amber-600",
  };
  return colors[level] ?? "text-slate-400 border-slate-600";
}
