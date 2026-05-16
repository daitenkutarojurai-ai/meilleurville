// Shared region utilities — slug↔name conversion, emojis, descriptions, and
// the canonical METRO_REGIONS list. Used by /regions/ pages and /comparer-regions/.
//
// The 13 metropolitan regions (Île-de-France + 12 mainland) drive the region
// comparator. DROM regions are kept in REGION_EMOJIS / REGION_DESCRIPTIONS
// for the /regions/ pages but excluded from comparator combinations.

export const METRO_REGIONS: readonly string[] = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
];

export const REGION_EMOJIS: Record<string, string> = {
  "Auvergne-Rhône-Alpes": "⛰️",
  "Pays de la Loire": "🌊",
  Bretagne: "⚓",
  "Nouvelle-Aquitaine": "🍷",
  Occitanie: "☀️",
  Normandie: "🏰",
  "Bourgogne-Franche-Comté": "🍇",
  "Centre-Val de Loire": "🏰",
  "Hauts-de-France": "🌾",
  "Provence-Alpes-Côte d'Azur": "🌺",
  "Grand Est": "🥨",
  "Île-de-France": "🗼",
  Corse: "🏝️",
  "La Réunion": "🌋",
  Martinique: "🌺",
  Guadeloupe: "🌴",
  Guyane: "🌿",
  Mayotte: "🐢",
};

export const REGION_TAGLINES: Record<string, string> = {
  "Auvergne-Rhône-Alpes": "Lyon, les Alpes et l'Auvergne — diversité maximale.",
  Bretagne: "Côte sauvage + scène tech à Rennes.",
  Bourgogne: "Patrimoine viticole, gastronomie, immobilier abordable.",
  "Bourgogne-Franche-Comté": "Patrimoine viticole, gastronomie, immobilier abordable.",
  "Centre-Val de Loire": "Châteaux de la Loire, immobilier dispo à 1h de Paris.",
  Corse: "L'île de beauté — soleil, mer, montagne, insularité.",
  "Grand Est": "Frontières ouvertes — Strasbourg européenne + travail frontalier.",
  "Hauts-de-France": "Lille internationale, immobilier ultra-abordable.",
  "Île-de-France": "Paris + banlieue chic + villes tech + nouvelles abordables.",
  Normandie: "Patrimoine, agriculture, accès TGV à Paris.",
  "Nouvelle-Aquitaine": "Bordeaux, Pays Basque, Périgord — la grande région du sud-ouest.",
  Occitanie: "Le plus de soleil en métropole. Toulouse + Montpellier.",
  "Pays de la Loire": "Nantes dynamique + littoral atlantique accessible.",
  "Provence-Alpes-Côte d'Azur": "Mer + soleil + qualité de vie premium.",
};

export function regionToSlug(region: string): string {
  return region
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToRegion(slug: string, candidates: readonly string[] = METRO_REGIONS): string | undefined {
  return candidates.find((r) => regionToSlug(r) === slug);
}
