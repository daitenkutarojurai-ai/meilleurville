import { CITIES_SEED } from "@/data/cities-seed";

// Slim projection for the homepage hero search. Server-only: importing the
// full seed from a "use client" component ships the whole dataset (hundreds
// of KB) in the JS bundle; passing this projection as props costs ~30 KB of
// flight payload instead.
export interface HeroCity {
  slug: string;
  name: string;
  region: string;
  score: number;
}

export const HERO_CITIES: HeroCity[] = CITIES_SEED.map((c) => ({
  slug: c.slug,
  name: c.name,
  region: c.region,
  score: c.scores.global,
}));
