// English copy for the people-like-you tool on bestcitiesinfrance.com.
// The engine (lib/people-like-you.ts) and profile defs (lib/profile-pages.ts)
// are French-first; this module supplies native English labels + a generic
// English "why" line so the EN page never leaks French text.

import type { CityLight } from "@/lib/cities-light";

export const EN_PROFILE_LABELS: Record<string, string> = {
  "familles-avec-enfants": "Families with kids",
  "jeunes-actifs": "Young professionals",
  retraites: "Retirees",
  freelances: "Freelancers & self-employed",
  teletravailleurs: "Salaried remote workers",
  etudiants: "Students",
  "sans-voiture": "Car-free living",
  premium: "Premium lifestyle",
  "solo-femme": "Women living solo",
  "couple-sans-enfant": "Couples, no kids",
  "expat-retour": "Returning expats",
  "primo-accedants": "First-time buyers",
  "familles-monoparentales": "Single-parent families",
  "familles-nombreuses": "Large families",
  "amateurs-de-plein-air": "Outdoor lovers",
};

export function enProfileLabel(slug: string, fallback: string): string {
  return EN_PROFILE_LABELS[slug] ?? fallback;
}

const AXIS_EN: Record<string, string> = {
  life: "quality of life",
  transport: "transport",
  nature: "nature & green space",
  cost: "affordability",
  safety: "safety",
  culture: "culture",
  remoteWork: "remote-work setup",
  schools: "schools",
};

/**
 * Generic English "why move here" line built from the destination's two
 * strongest axes plus an affordability note — accurate, native English, and
 * independent of the French reasonHint closures.
 */
export function enMigrationReason(city: CityLight): string {
  const entries = (Object.keys(AXIS_EN) as Array<keyof typeof city.scores>)
    .map((k) => ({ k, v: city.scores[k] }))
    .sort((a, b) => b.v - a.v);
  const [a, b] = entries;
  const parts = [`Strong ${AXIS_EN[a.k]} and ${AXIS_EN[b.k]}`];
  if (city.scores.cost >= 7 && a.k !== "cost" && b.k !== "cost") {
    parts.push("and noticeably more affordable");
  }
  return parts.join(", ") + ".";
}
