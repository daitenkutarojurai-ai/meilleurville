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
import { nearestCities, type NearbyCity } from "@/lib/distances-rankings";
import { buildRentVsBuy } from "@/lib/rent-vs-buy-rankings";
import type { RentVsBuyData } from "@/lib/rent-vs-buy";
import { cityParks, nearbyCityParks } from "@/lib/city-parks";
import { biodiversityProfile, BIODIVERSITY_PAGES_LIVE } from "@/lib/biodiversity";
import { comparePairSlug } from "@/lib/comparer-pairs";

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
  /** Curated `/comparer` pair slug, or null when no page exists for this pair.
   *  Resolved here rather than in SimilarCities: that component renders inside
   *  the client tree, and importing lib/comparer-pairs there would ship the
   *  whole seed with it. */
  comparePair: string | null;
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
  compareSuggestions: Array<{ slug: string; name: string; comparePair: string }>;
  citiesCount: number;
  lean: PoliticalLean | null;
  tension: { score: number } & ReturnType<typeof tensionInfo>;
  honestReview: HonestReviewLite;
  geoNeighbors: NearbyCity[];
  rentVsBuy: RentVsBuyData | null;
  /** Named OSM parks known for this city — 0 when the crawl has not run yet.
   *  Gates the /parcs card: no card when there is no page worth opening.
   *  Projected here rather than read in CityProfile: that component is
   *  "use client", and importing data/city-parks.json there would ship the
   *  whole park directory in the city-page bundle. */
  parksCount: number;
  parksWithPlayground: number;
  /** Nearest crawled neighbour, for cities the crawl has not reached yet. */
  nearbyParks: { slug: string; name: string; parksCount: number; distanceKm: number } | null;
  /** F62 — gates the 🦋 biodiversity card. `null` while the sub-page is still
   *  parked as page.pending.tsx (see BIODIVERSITY_PAGES_LIVE), and `null` until
   *  the GBIF crawl covers the city once it ships. `score` is null
   *  on a crawled-but-thinly-surveyed city: the page still exists and says so,
   *  so the card links there with an honest label instead of a number. */
  biodiversity: { score: number | null; species: number } | null;
}

function biodiversityProjection(city: CitySeed) {
  if (!BIODIVERSITY_PAGES_LIVE) return { biodiversity: null };
  const profile = biodiversityProfile(city.slug);
  if (!profile) return { biodiversity: null };
  return {
    biodiversity: {
      score: profile.richness?.score ?? null,
      species: profile.raw.species,
    },
  };
}

function parksProjection(city: CitySeed) {
  const own = cityParks(city.slug);
  if (own && own.parks.length > 0) {
    return {
      parksCount: own.parks.length,
      parksWithPlayground: own.parks.filter((p) => p.playground).length,
      nearbyParks: null,
    };
  }
  const [n] = nearbyCityParks(city, { maxDistanceKm: 30, limit: 1 });
  return {
    parksCount: 0,
    parksWithPlayground: 0,
    nearbyParks: n
      ? { slug: n.city.slug, name: n.city.name, parksCount: n.data.parks.length, distanceKm: n.distanceKm }
      : null,
  };
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
      comparePair: comparePairSlug(city.slug, c.slug),
    }));

  // Only cities this one has a built /comparer page with: the bar used to
  // suggest the nearest six regardless, and every uncurated pair was a 404.
  const compareSuggestions = CITIES_SEED.filter((c) => c.slug !== city.slug)
    .sort((a, b) => {
      const aRegion = a.region === city.region ? 0 : 1;
      const bRegion = b.region === city.region ? 0 : 1;
      return aRegion !== bRegion ? aRegion - bRegion : b.scores.global - a.scores.global;
    })
    .flatMap((c) => {
      const comparePair = comparePairSlug(city.slug, c.slug);
      return comparePair ? [{ slug: c.slug, name: c.name, comparePair }] : [];
    })
    .slice(0, 6);

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
    geoNeighbors: nearestCities(city.slug, 6),
    rentVsBuy: buildRentVsBuy(city.slug),
    ...parksProjection(city),
    ...biodiversityProjection(city),
  };
}
