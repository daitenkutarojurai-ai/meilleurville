// Seed-dependent aggregate, split out of lib/paris-commute so the base module
// (single-city parisCommute) stays seed-free for client components.
import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";
import { parisCommute, type ParisCommute } from "@/lib/paris-commute";

export function parisCommuteAll(): Array<{ city: CitySeed; commute: ParisCommute }> {
  return CITIES_SEED.map((city) => ({ city, commute: parisCommute(city) })).filter(
    (r) => r.commute.source !== "unavailable",
  );
}
