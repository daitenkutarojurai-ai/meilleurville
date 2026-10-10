// Display labels for the F44 demography levels, with ZERO imports.
//
// lib/demography reads lib/city-population, i.e. data/city-population.json
// (140 KB). A client component that imported these constants from there
// shipped the whole JSON in every city-page bundle (85 KB minified, 19 % of
// CityProfile). Client code reads labels here and receives the computed
// Demography as a prop (lib/city-profile-data). lib/demography re-exports
// everything, so server callers are unchanged.

export type DemoLevel = "dynamique" | "equilibre" | "vieillissant" | "critique";

export const DEMO_LEVEL_LABEL: Record<DemoLevel, string> = {
  dynamique: "Dynamique",
  equilibre: "Équilibré",
  vieillissant: "Vieillissant",
  critique: "Critique",
};

export const DEMO_LEVEL_COLOR: Record<DemoLevel, string> = {
  dynamique: "text-emerald-600",
  equilibre: "text-amber-600",
  vieillissant: "text-orange-600",
  critique: "text-red-600",
};

export const DEMO_LEVEL_BG: Record<DemoLevel, string> = {
  dynamique: "bg-emerald-50 border-emerald-200",
  equilibre: "bg-amber-50 border-amber-200",
  vieillissant: "bg-orange-50 border-orange-200",
  critique: "bg-red-50 border-red-200",
};
