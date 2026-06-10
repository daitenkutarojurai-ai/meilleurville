// Server-only bundle of everything CityProfile (a "use client" component)
// needs beyond the city itself. Computing these here keeps the full seed,
// housing, neighborhoods, rankings and political-lean datasets out of the
// city-page client chunk — only the per-city results travel as props.
import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";
import { getNeighborhoods } from "@/data/neighborhoods";
import { getHousing, HOUSING } from "@/data/housing";
import { RANKING_META, getRankedCities, type RankingSlug } from "@/lib/rankings";
import { getPoliticalLean } from "@/lib/political-lean";
import type { PoliticalLean } from "@/lib/political-lean-meta";
import { rentalTension, tensionInfo } from "@/lib/rental-tension";
import { buildHonestReview, type HonestReviewBullet } from "@/lib/honest-reviews";

export interface CityRankingPosition {
  slug: string;
  emoji: string;
  label: string;
  color: string;
  rank: number;
}

export interface SimilarCityItem {
  slug: string;
  name: string;
  region: string;
  rentT2: number | null;
  scoreGlobal: number;
  sim: number;
}

// Serializable subset of HonestReview: the full ProfileDef carries a
// reasonHint FUNCTION, which can't cross the server→client prop boundary.
export interface HonestReviewLite {
  oneLine: string;
  strengths: HonestReviewBullet[];
  weaknesses: HonestReviewBullet[];
  perfectFor: Array<{
    profile: { slug: string; emoji: string; label: string };
    rank: number;
    soft?: boolean;
  }>;
}

export interface CityProfileData {
  neighborhoods: ReturnType<typeof getNeighborhoods>;
  housing: ReturnType<typeof getHousing>;
  rankingPositions: CityRankingPosition[];
  similar: SimilarCityItem[];
  compareSuggestions: Array<{ slug: string; name: string }>;
  citiesCount: number;
  lean: PoliticalLean | null;
  tension: { score: number } & ReturnType<typeof tensionInfo>;
  honestReview: HonestReviewLite;
}

function cosineSimilarity(a: CitySeed["scores"], b: CitySeed["scores"]): number {
  const keys: Array<keyof CitySeed["scores"]> = [
    "life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools",
  ];
  let dot = 0, normA = 0, normB = 0;
  for (const k of keys) {
    dot += a[k] * b[k];
    normA += a[k] * a[k];
    normB += b[k] * b[k];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function buildCityProfileData(city: CitySeed): CityProfileData {
  const rankingPositions: CityRankingPosition[] = [];
  for (const slug of Object.keys(RANKING_META) as RankingSlug[]) {
    const meta = RANKING_META[slug];
    const entry = getRankedCities(slug).find((e) => e.city.slug === city.slug);
    if (entry) rankingPositions.push({ slug, emoji: meta.emoji, label: meta.label, color: meta.color, rank: entry.rank });
  }

  const similar: SimilarCityItem[] = CITIES_SEED.filter((c) => c.slug !== city.slug)
    .map((c) => ({ city: c, sim: cosineSimilarity(city.scores, c.scores) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 4)
    .map(({ city: c, sim }) => ({
      slug: c.slug,
      name: c.name,
      region: c.region,
      rentT2: HOUSING[c.slug]?.avgRentT2 ?? null,
      scoreGlobal: c.scores.global,
      sim,
    }));

  const compareSuggestions = CITIES_SEED.filter((c) => c.slug !== city.slug)
    .sort((a, b) => {
      const aRegion = a.region === city.region ? 0 : 1;
      const bRegion = b.region === city.region ? 0 : 1;
      return aRegion !== bRegion ? aRegion - bRegion : b.scores.global - a.scores.global;
    })
    .slice(0, 6)
    .map((c) => ({ slug: c.slug, name: c.name }));

  const tensionScore = rentalTension(city);

  const hr = buildHonestReview(city);
  const honestReview: HonestReviewLite = {
    oneLine: hr.oneLine,
    strengths: hr.strengths,
    weaknesses: hr.weaknesses,
    perfectFor: hr.perfectFor.map((f) => ({
      profile: { slug: f.profile.slug, emoji: f.profile.emoji, label: f.profile.label },
      rank: f.rank,
      soft: f.soft,
    })),
  };

  return {
    neighborhoods: getNeighborhoods(city.slug),
    housing: getHousing(city.slug),
    rankingPositions,
    similar,
    compareSuggestions,
    citiesCount: CITIES_SEED.length,
    lean: getPoliticalLean(city.slug),
    tension: { score: tensionScore, ...tensionInfo(tensionScore) },
    honestReview,
  };
}
