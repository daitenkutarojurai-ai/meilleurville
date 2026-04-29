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

export function scoreColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-yellow-400";
  return "text-red-400";
}

export function scoreBg(score: number): string {
  if (score >= 8) return "bg-emerald-500/10 border-emerald-500/30";
  if (score >= 6) return "bg-yellow-500/10 border-yellow-500/30";
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
