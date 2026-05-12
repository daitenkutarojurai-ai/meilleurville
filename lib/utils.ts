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

export function scoreColor(score: number): string {
  if (score >= 7.5) return "text-purple-500";
  if (score >= 7.0) return "text-green-500";
  if (score >= 6.0) return "text-lime-500";
  if (score >= 5.0) return "text-amber-400";
  if (score >= 4.0) return "text-orange-500";
  return "text-red-500";
}

export function scoreHex(score: number): string {
  if (score >= 7.5) return "#A855F7";
  if (score >= 7.0) return "#16A34A";
  if (score >= 6.0) return "#84CC16";
  if (score >= 5.0) return "#F59E0B";
  if (score >= 4.0) return "#F97316";
  return "#EF4444";
}

export function scoreBg(score: number): string {
  if (score >= 7.5) return "bg-purple-500/15 border-purple-500/40";
  if (score >= 7.0) return "bg-green-500/10 border-green-500/30";
  if (score >= 6.0) return "bg-lime-500/10 border-lime-500/30";
  if (score >= 5.0) return "bg-amber-400/10 border-amber-400/30";
  if (score >= 4.0) return "bg-orange-500/10 border-orange-500/30";
  return "bg-red-500/10 border-red-500/30";
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
