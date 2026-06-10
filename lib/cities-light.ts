import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { leanBySlug, leanOptions, BLOC_LABEL, BLOC_COLORS, type Bloc } from "@/lib/political-lean";

// Server-only projections for the heavy interactive client components
// (FranceHeatmap, CarteClient, VillesSearch, LeaderboardTable, CompareTool).
// Importing CITIES_SEED from a "use client" file ships the entire seed —
// including the long EN text fields — in the JS bundle of every page that
// mounts the component. Server pages pass these projections as props instead
// (same pattern as lib/hero-data.ts). Client files may import the TYPES below
// (`import type` is erased at build), never the values.

export type CityLight = Omit<CitySeed, "descriptionEn" | "seoTitleEn" | "seoDescriptionEn">;

export const CITIES_LIGHT: CityLight[] = CITIES_SEED.map((c) => {
  const { descriptionEn: _d, seoTitleEn: _t, seoDescriptionEn: _s, ...rest } = c;
  return rest;
});

// Loyer T2 only — the full HOUSING table (T1/T2/T3 + buy price) is not needed
// by the map / leaderboard surfaces.
export const RENT_T2_BY_SLUG: Record<string, number> = Object.fromEntries(
  Object.entries(HOUSING).map(([slug, h]) => [slug, h.avgRentT2])
);

// Political-lean filter data. lib/political-lean imports a ~100 KB JSON at
// module level, so client components must not import it for values — the
// slug→bloc map plus labels/colours travel as props instead.
export interface LeanMeta {
  map: Record<string, Bloc>;
  options: Bloc[];
  labels: Record<"fr" | "en", Record<Bloc, string>>;
  colors: Record<Bloc, string>;
}

export const LEAN_META: LeanMeta = {
  map: leanBySlug(),
  options: leanOptions(),
  labels: BLOC_LABEL,
  colors: BLOC_COLORS,
};
