// EN port of FR F68 — Synthesis hub.
//
// Landing page that surfaces the whole 8-axis synthesis pyramid (F61, F62, F65,
// F66) on a single screen for the English site. Mirror of `app/synthese/page.tsx`,
// adapted to the EN URL structure (`/cities/`, `/regions/`, `/overall-ranking/`,
// `/compare/`, `/compare-regions/`, `/quality-of-life/`, `/rankings/`,
// `/city-match/`). The FR personalisation card (F64 — `/palmares/personnaliser`)
// has no EN equivalent, so the EN hub keeps the pyramid at 5 cards instead of 6.
//
// English labels for the SYNTHESIS_LEVEL_LABEL map are applied locally at the
// display site per CLAUDE.md convention #6 — `lib/city-synthesis.ts` stays
// FR-only.

import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { METRO_REGIONS, REGION_EMOJIS, regionToSlug } from "@/lib/regions";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import {
  topSynthesisGlobal,
  computeRegionAverageSynthesis,
  SYNTHESIS_LEVEL_COLOR,
} from "@/lib/city-synthesis";
import type { SynthesisLevel } from "@/lib/city-synthesis";
import { CITIES_COUNT } from "@/lib/site-stats";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

const EN_SYNTHESIS_LABEL: Record<SynthesisLevel, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Moderate",
  tendu: "Strained",
};

export const metadata: Metadata = {
  title: "8-axis synthesis · French city rankings | BestCitiesInFrance",
  description: `8-dimension data synthesis (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services) across ${CITIES_COUNT} cities, 102 departments, 18 regions, 6 macro-regions and a national leaderboard. Compare two cities or two regions side by side.`,
  alternates: { canonical: `${EN_BASE}/synthesis` },
  openGraph: {
    title: "8-axis synthesis · BestCitiesInFrance",
    description: "One system, eight dimensions, five geographic levels. Everything you need to compare a French city, department, region or the country as a whole.",
  },
};

function getDeptCount(): number {
  return new Set(CITIES_SEED.map((c) => c.department)).size;
}

export default function EnSynthesisHubPage() {
  const top5Cities = topSynthesisGlobal(5, 15000);
  const top5Regions = METRO_REGIONS.map((r) => computeRegionAverageSynthesis(r))
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.global - a.global)
    .slice(0, 5);

  const deptCount = getDeptCount();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "8-axis synthesis", path: "/synthesis" },
  ]);

  const faq = faqJsonLd([
    {
      q: "What is the 8-axis synthesis?",
      a: `A unified system aggregating eight data-cluster composites (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services) on a single "10 = excellent" scale. It enables a fast, comparable read of any city, department, region, macro-region or the country as a whole.`,
    },
    {
      q: "Which geographic levels are covered?",
      a: `Five levels: (1) city (${CITIES_COUNT} pages at /cities/[slug]/synthesis), (2) department (${deptCount} pages — see /departments), (3) administrative region (${METRO_REGIONS.length} pages at /regions/[r]/synthesis, metropolitan + overseas), (4) macro-region (${MACRO_REGIONS.length} editorial zones at /overall-ranking/[macro]), (5) national (/overall-ranking).`,
    },
    {
      q: "How do I compare two cities or two regions?",
      a: `City ↔ city: /compare/[a]-vs-[b]/synthesis (curated pairs). Region ↔ region: /compare-regions/[a]-vs-[b]/synthesis (78 pairs). Automatic verdict axis by axis with a ±0.3-point threshold.`,
    },
    {
      q: "How does this differ from the Quality of Life mega-index?",
      a: `The Quality of Life index (/quality-of-life) aggregates three pillars (environment, healthcare, employment). The 8-axis synthesis covers all eight data clusters on the site, with a uniform "10 = excellent" convention. Same raw data, different granularity.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
        </nav>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
          8-axis synthesis
        </h1>
        <p className="mt-4 text-base text-[var(--text-secondary)] max-w-3xl">
          One system, eight data dimensions, five geographic levels. Environment,
          healthcare, employment, quality of life, cycling, safety, demographics,
          public services — all normalised on the same scale (10 = excellent) so
          you can compare a city, a department, a region or the country as a
          whole without surprises.
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <Badge>{CITIES_COUNT} cities</Badge>
          <Badge>{deptCount} departments</Badge>
          <Badge>{METRO_REGIONS.length} regions</Badge>
          <Badge>{MACRO_REGIONS.length} macro-regions</Badge>
          <Badge>8 data axes</Badge>
        </div>

        {/* The pyramid */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Five geographic levels
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          The same score, aggregated at different granularities. The lower you go,
          the more precise; the higher you go, the more comparative.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/cities" className="block">
            <Card className="hover:shadow-md transition-shadow h-full border-[var(--accent)]/30 bg-[var(--accent)]/5">
              <div className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold">
                Level 1 · Highest granularity
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Synthesis by city
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                {CITIES_COUNT} pages at /cities/[slug]/synthesis. Overall score,
                consistency ±, strengths, tensions, narrative signature.
              </div>
            </Card>
          </Link>
          <Link href="/departments" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                Level 2 · INSEE
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Synthesis by department
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                {deptCount} department pages at /departments. Average profile across
                the eight axes for each French département.
              </div>
            </Card>
          </Link>
          <Link href="/regions" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                Level 3 · Administrative
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Synthesis by region
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                18 pages at /regions/[r]/synthesis (mainland + overseas). Average
                profile, top 20 cities, department zoom.
              </div>
            </Card>
          </Link>
          <Link href="/overall-ranking" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                Level 4 · Editorial
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Macro-regions
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                {MACRO_REGIONS.length} cross-regional zones at /overall-ranking/[macro]
                (Atlantic Coast, Mediterranean Arc, Alpine Arc, South-West Gascony,
                Rhône Valley, Greater Île-de-France).
              </div>
            </Card>
          </Link>
          <Link href="/overall-ranking" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                Level 5 · National
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                France overall ranking
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                /overall-ranking. Top 30 most favourable profiles + top 20 most
                strained, population filter 15,000+.
              </div>
            </Card>
          </Link>
        </div>

        {/* Compare */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Side-by-side comparisons
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Automatic verdict axis by axis, significance threshold fixed at ±0.3
          point. No conventions to reconcile across sub-scores — everything is
          already normalised.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/compare" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                Curated pairs
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Compare two cities (synthesis)
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                /compare/[a]-vs-[b]/synthesis. Two-card hero with overall scores,
                axis-by-axis table, cross-links to the detailed city pages.
              </div>
            </Card>
          </Link>
          <Link href="/compare-regions" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
                78 pairs
              </div>
              <div className="text-base font-bold text-[var(--text-primary)] mt-1">
                Compare two regions (synthesis)
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                /compare-regions/[a]-vs-[b]/synthesis. Average regional profiles
                head to head, verdict by delta.
              </div>
            </Card>
          </Link>
        </div>

        {/* Live preview: top 5 cities + top 5 regions */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Preview — top 5
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Computed at build time on the overall synthesis. Full ranking on{" "}
          <Link href="/overall-ranking" className="text-[var(--accent)] hover:underline">
            /overall-ranking
          </Link>
          .
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Top 5 cities */}
          <Card className="overflow-hidden p-0">
            <div className="px-4 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Top 5 cities (pop. ≥ 15,000)
              </h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {top5Cities.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)] first:border-t-0">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums w-8">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/synthesis`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                      <div className="text-[10px] text-[var(--text-tertiary)]">{c.region}</div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.synthesis.level]}`}
                      >
                        {c.synthesis.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_SYNTHESIS_LABEL[c.synthesis.level]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Top 5 regions */}
          <Card className="overflow-hidden p-0">
            <div className="px-4 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Top 5 regions (average profile)
              </h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {top5Regions.map((r, i) => (
                  <tr key={r.region} className="border-t border-[var(--border)] first:border-t-0">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums w-8">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/regions/${regionToSlug(r.region)}/synthesis`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        <span className="mr-1">{REGION_EMOJIS[r.region] ?? "📍"}</span>
                        {r.region}
                      </Link>
                      <div className="text-[10px] text-[var(--text-tertiary)]">
                        {r.cityCount} cities
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[r.level]}`}
                      >
                        {r.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        ±{r.spread.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Methodology */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Methodology</h2>
        <Card className="mt-3">
          <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-disc pl-5">
            <li>
              <strong className="text-[var(--text-primary)]">Unified convention</strong>:
              all axes are normalised to &quot;10 = excellent&quot;, even the clusters whose
              native convention is inverted (healthcare, employment, safety,
              demographics, public services).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Overall score</strong>:
              simple arithmetic mean of the 8 axes per city. At department or
              region level, we compute the mean across cities of the seed in that
              territory, then average the 8 axes.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Consistency ±</strong>:
              standard deviation between the 8 axes — proxy for profile uniformity.
              An overall 7/10 with ±0.5 consistency (even profile) is not the same
              as 7/10 with ±2.5 (marked strengths and tensions).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Comparative verdict</strong>:
              significance threshold fixed at ±0.3 point per axis. Below that
              threshold, the axis is considered equivalent.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Sources</strong>:
              see the{" "}
              <Link href="/methodology" className="text-[var(--accent)] hover:underline">
                methodology
              </Link>{" "}
              and{" "}
              <Link href="/data-sources" className="text-[var(--accent)] hover:underline">
                data sources
              </Link>{" "}
              pages for the per-cluster details.
            </li>
          </ul>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Go further</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/quality-of-life" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Quality of life mega-index
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                3-pillar synthesis (env / health / jobs)
              </div>
            </Card>
          </Link>
          <Link href="/rankings" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                All rankings
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Owner scores, niches, undervalued cities
              </div>
            </Card>
          </Link>
          <Link href="/city-match" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Find my city (quiz)
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Qualitative match on your profile
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
