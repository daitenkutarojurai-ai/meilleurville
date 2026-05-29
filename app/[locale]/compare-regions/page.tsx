import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { METRO_REGIONS, REGION_EMOJIS, regionToSlug } from "@/lib/regions";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Compare French regions · 78 side-by-side comparisons 2026",
  description:
    "Compare any two French regions side by side: cost of living, climate, housing, quality-of-life scores and top cities. All 78 combinations of the 13 mainland regions.",
  alternates: { canonical: `${EN_BASE}/compare-regions` },
};

const PRIORITY_PAIRS: ReadonlyArray<readonly [string, string, string]> = [
  ["Bretagne", "Occitanie", "Coast vs sunshine — the big 2026 relocation trade-off."],
  ["Bretagne", "Normandie", "North-west Atlantic — proximity to Paris or strong regional identity."],
  ["Provence-Alpes-Côte d'Azur", "Nouvelle-Aquitaine", "South-east vs south-west — Mediterranean or Atlantic."],
  ["Île-de-France", "Auvergne-Rhône-Alpes", "Paris or Lyon — leaving the capital without losing the city buzz."],
];

export default function EnCompareRegionsIndex() {
  const allPairs: Array<[string, string]> = [];
  for (let i = 0; i < METRO_REGIONS.length; i++) {
    for (let j = i + 1; j < METRO_REGIONS.length; j++) {
      allPairs.push([METRO_REGIONS[i], METRO_REGIONS[j]]);
    }
  }

  const prioritySlugs = new Set(
    PRIORITY_PAIRS.map(([a, b]) => `${regionToSlug(a)}-vs-${regionToSlug(b)}`),
  );
  const otherPairs = allPairs.filter(
    ([a, b]) => !prioritySlugs.has(`${regionToSlug(a)}-vs-${regionToSlug(b)}`),
  );

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
          🗺️ 78 comparisons · 13 mainland regions
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          Compare French regions
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          Cost of living, climate, housing, average scores and the top 5 cities — every
          combination of the 13 mainland regions, side by side.
        </p>
      </section>

      {/* Priority pairs */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Featured comparisons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRIORITY_PAIRS.map(([a, b, tagline]) => (
            <Link
              key={`${a}-${b}`}
              href={`/compare-regions/${regionToSlug(a)}-vs-${regionToSlug(b)}`}
              className="block"
            >
              <Card className="hover:border-[var(--accent)]/40 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="accent">Featured</Badge>
                  <span className="text-2xl" aria-hidden>{REGION_EMOJIS[a] ?? "📍"}</span>
                  <span className="font-semibold text-[var(--text-primary)]">{a}</span>
                  <span className="text-[var(--text-tertiary)]">vs</span>
                  <span className="text-2xl" aria-hidden>{REGION_EMOJIS[b] ?? "📍"}</span>
                  <span className="font-semibold text-[var(--text-primary)]">{b}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{tagline}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* All pairs */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">All combinations</h2>
        <div className="flex flex-wrap gap-2">
          {otherPairs.map(([a, b]) => (
            <Link
              key={`${a}-${b}`}
              href={`/compare-regions/${regionToSlug(a)}-vs-${regionToSlug(b)}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
            >
              <span className="mr-1" aria-hidden>{REGION_EMOJIS[a] ?? "📍"}</span>
              {a}
              <span className="mx-1 text-[var(--text-tertiary)]">vs</span>
              <span className="mr-1" aria-hidden>{REGION_EMOJIS[b] ?? "📍"}</span>
              {b}
            </Link>
          ))}
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-6">
          Note: only the 13 mainland regions are included in these comparisons. For the
          overseas regions, see the <Link href="/regions" className="underline">regions page</Link>.
        </p>
      </section>

      {/* Cross-link */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <Card>
          <p className="text-sm text-[var(--text-secondary)]">
            Need something more precise than a region? Compare two cities directly with the{" "}
            <Link href="/compare" className="underline text-[var(--accent)]">city comparator</Link>
            , or let the{" "}
            <Link href="/city-match" className="underline text-[var(--accent)]">matching quiz</Link>{" "}
            do the sorting for you.
          </p>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
