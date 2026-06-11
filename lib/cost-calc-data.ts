import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";

// Slim, server-computed projection for the homepage CostCalculator — only the
// cities with housing data and only the six axes it ranks on, so the client
// component never imports the full seed + housing datasets.
export interface CostCalcCity {
  slug: string;
  name: string;
  region: string;
  avgRentT2: number;
  scores: {
    cost: number;
    remoteWork: number;
    nature: number;
    culture: number;
    life: number;
    safety: number;
  };
}

export const COST_CALC_CITIES: CostCalcCity[] = CITIES_SEED.filter((c) => HOUSING[c.slug]).map((c) => ({
  slug: c.slug,
  name: c.name,
  region: c.region,
  avgRentT2: HOUSING[c.slug].avgRentT2,
  scores: {
    cost: c.scores.cost,
    remoteWork: c.scores.remoteWork,
    nature: c.scores.nature,
    culture: c.scores.culture,
    life: c.scores.life,
    safety: c.scores.safety,
  },
}));
