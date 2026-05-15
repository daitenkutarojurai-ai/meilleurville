import type { CITIES_SEED } from "@/data/cities-seed";

type City = (typeof CITIES_SEED)[number];

export type VigilanceLevel = "élevée" | "modérée" | "mesurée" | "faible";

export interface VigilanceSummary {
  score: number;
  level: VigilanceLevel;
  label: string;
  tone: string;
  ring: string;
  criticalCount: number;
}

// Lightweight per-axis severity used to drive the index page card chips.
// Returns 0 (faible) → 4 (critique) per axis. Aligned with the verbose
// per-flag logic in app/red-flags/[slug]/page.tsx so the index reads
// consistently with the detail page — without duplicating every paragraph.
function axisSeverity(score: number): number {
  if (score < 4.0) return 4;
  if (score < 5.0) return 3;
  if (score < 6.0) return 2;
  if (score < 7.0) return 1;
  return 0;
}

function caniculeSeverity(c: City): number {
  const t = c.avgTempJuly;
  if (t == null) return 0;
  if (t >= 28) return 4;
  if (t >= 26) return 3;
  if (t >= 24) return 2;
  if (t >= 22) return 1;
  return 0;
}

function inondationSeverity(c: City): number {
  const el = c.elevation ?? null;
  const lng = c.longitude ?? null;
  const lat = c.latitude ?? null;
  const dromCoast = ["Martinique", "Guadeloupe", "La Réunion", "Mayotte", "Guyane"].includes(c.region ?? "");
  const mediterranean = lat != null && lat < 44 && lng != null && lng > 2;
  const atlantic = lng != null && lng < -1 && lat != null && lat < 49;
  const channel = lat != null && lat > 49 && lng != null && lng < 3;
  const coastalLow = el != null && el < 20 && (atlantic || channel || mediterranean || dromCoast);
  const riverLow = el != null && el < 35;
  if (mediterranean && el != null && el < 50) return 3;
  if (dromCoast) return 3;
  if (coastalLow) return 2;
  if (riverLow) return 1;
  return 0;
}

function pollutionSeverity(c: City): number {
  const region = c.region ?? "";
  const dept = c.department ?? "";
  if (region === "Île-de-France") return 3;
  if (["Haute-Savoie", "Savoie", "Isère"].includes(dept) && (c.elevation ?? 0) < 700) return 3;
  if (region === "Auvergne-Rhône-Alpes" && (c.population ?? 0) > 150000) return 2;
  if (["Bouches-du-Rhône", "Var"].includes(dept) && (c.population ?? 0) > 80000) return 2;
  if ((c.population ?? 0) > 200000) return 1;
  return 0;
}

function sismiqueSeverity(c: City): number {
  const dept = c.department ?? "";
  const region = c.region ?? "";
  const antilles = ["Martinique", "Guadeloupe"].includes(region);
  const pyrenees = ["Pyrénées-Atlantiques", "Hautes-Pyrénées", "Haute-Garonne", "Pyrénées-Orientales", "Ariège", "Aude"].includes(dept);
  const alpsHigh = ["Haute-Savoie", "Savoie", "Hautes-Alpes", "Alpes-Maritimes", "Alpes-de-Haute-Provence"].includes(dept);
  const provence = dept === "Bouches-du-Rhône" || dept === "Var" || dept === "Vaucluse";
  if (antilles) return 3;
  if (pyrenees || alpsHigh) return 2;
  if (provence) return 1;
  return 0;
}

function tourismeSeverity(c: City): number {
  const tags = c.characterTags ?? [];
  const region = c.region ?? "";
  const dept = c.department ?? "";
  const dromCoast = ["Martinique", "Guadeloupe", "La Réunion"].includes(region);
  const high = tags.some((t) => ["mer", "tourisme", "soleil"].includes(t)) ||
    dromCoast ||
    ["Alpes-Maritimes", "Var", "Corse-du-Sud", "Haute-Corse", "Vaucluse"].includes(dept);
  if (tags.includes("premium") && (c.population ?? 0) < 80000) return 3;
  if (high) return 2;
  return 0;
}

export function vigilanceSummary(c: City): VigilanceSummary {
  const severities = [
    axisSeverity(c.scores.safety),
    axisSeverity(c.scores.cost),
    axisSeverity(c.scores.transport),
    axisSeverity(c.scores.schools),
    caniculeSeverity(c),
    inondationSeverity(c),
    pollutionSeverity(c),
    sismiqueSeverity(c),
    tourismeSeverity(c),
  ];
  const score = severities.reduce((a, b) => a + b, 0);
  const criticalCount = severities.filter((s) => s >= 3).length;
  // 9 axes × max 4 = 36, same scale as the detail page's vigilance()
  const ratio = score / 36;
  let level: VigilanceLevel;
  let label: string;
  let tone: string;
  let ring: string;
  if (ratio >= 0.45) {
    level = "élevée";
    label = "Vigilance élevée";
    tone = "text-red-600";
    ring = "border-red-500/40 bg-red-500/5";
  } else if (ratio >= 0.28) {
    level = "modérée";
    label = "Vigilance modérée";
    tone = "text-orange-600";
    ring = "border-orange-500/30 bg-orange-500/5";
  } else if (ratio >= 0.14) {
    level = "mesurée";
    label = "Vigilance mesurée";
    tone = "text-amber-600";
    ring = "border-amber-500/30 bg-amber-400/5";
  } else {
    level = "faible";
    label = "Vigilance faible";
    tone = "text-emerald-600";
    ring = "border-emerald-500/30 bg-emerald-500/5";
  }
  return { score, level, label, tone, ring, criticalCount };
}
