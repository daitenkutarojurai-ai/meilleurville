import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RegionDuelsHub, type RegionDuel } from "@/components/AreaDuelsHub";
import { METRO_REGIONS, REGION_EMOJIS, regionToSlug } from "@/lib/regions";
import { pathAlternatesEn } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Compare French regions · 78 side-by-side comparisons 2026",
  description:
    "Compare any two French regions side by side: cost of living, climate, housing, quality-of-life scores and top cities. All 78 combinations of the 13 mainland regions.",
  alternates: pathAlternatesEn("/comparer-regions", "/compare-regions"),
};

const PRIORITY_PAIRS: ReadonlyArray<readonly [string, string, string]> = [
  ["Bretagne", "Occitanie", "Coast vs sunshine — the big 2026 relocation trade-off."],
  ["Bretagne", "Normandie", "North-west Atlantic — proximity to Paris or strong regional identity."],
  ["Provence-Alpes-Côte d'Azur", "Nouvelle-Aquitaine", "South-east vs south-west — Mediterranean or Atlantic."],
  ["Île-de-France", "Auvergne-Rhône-Alpes", "Paris or Lyon — leaving the capital without losing the city buzz."],
];

// The pair route is generated in METRO_REGIONS order (i < j): an editorial pair
// written the other way round links to a 404 and escapes the dedup below, so the
// pair also rendered twice.
const regionPairSlug = (a: string, b: string) =>
  METRO_REGIONS.indexOf(a) <= METRO_REGIONS.indexOf(b)
    ? `${regionToSlug(a)}-vs-${regionToSlug(b)}`
    : `${regionToSlug(b)}-vs-${regionToSlug(a)}`;

export default function EnCompareRegionsIndex() {
  const allPairs: Array<[string, string]> = [];
  for (let i = 0; i < METRO_REGIONS.length; i++) {
    for (let j = i + 1; j < METRO_REGIONS.length; j++) {
      allPairs.push([METRO_REGIONS[i], METRO_REGIONS[j]]);
    }
  }

  const prioritySlugs = new Set(
    PRIORITY_PAIRS.map(([a, b]) => regionPairSlug(a, b)),
  );
  const toDuel = (a: string, b: string, tagline?: string): RegionDuel => ({
    a,
    b,
    emojiA: REGION_EMOJIS[a] ?? "📍",
    emojiB: REGION_EMOJIS[b] ?? "📍",
    href: `/compare-regions/${regionPairSlug(a, b)}`,
    tagline,
  });
  const featured = PRIORITY_PAIRS.map(([a, b, tagline]) => toDuel(a, b, tagline));
  const others = allPairs
    .filter(([a, b]) => !prioritySlugs.has(regionPairSlug(a, b)))
    .map(([a, b]) => toDuel(a, b));

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <RegionDuelsHub
        featured={featured}
        others={others}
        eyebrow="78 comparisons · 13 mainland regions"
        titleLead="Compare French"
        titleAccent="regions"
        intro={
          <p className="text-lg">
            Cost of living, climate, housing, average scores and the top 5 cities — every
            combination of the 13 mainland regions, side by side.
          </p>
        }
        featuredTitle="Featured comparisons"
        featuredBadge="Featured"
        othersTitle="All combinations"
        othersNote={
          <>
            Note: only the 13 mainland regions are included in these comparisons. For the
            overseas regions, see the{" "}
            <Link href="/regions" className="font-semibold text-[#4338CA] underline">
              regions page
            </Link>
            .
          </>
        }
        crossLink={
          <>
            Need something more precise than a region? Compare two{" "}
            <Link href="/compare-departments">departments</Link> of the same region, compare
            two cities directly with the <Link href="/compare">city comparator</Link>, or let
            the <Link href="/city-match">matching quiz</Link> do the sorting for you.
          </>
        }
      />

      <Footer />
    </main>
  );
}
