import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topMostDynamic,
  topMostAgeing,
  DEMO_LEVEL_LABEL,
  DEMO_LEVEL_COLOR,
} from "@/lib/demography";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

const EN_BASE = ORIGIN_BY_LOCALE.en;

const EN_DEMO_LABEL: Record<string, string> = {
  dynamique: "Dynamic",
  equilibre: "Balanced",
  vieillissant: "Ageing",
  critique: "Declining",
};

export const metadata: Metadata = {
  title: "Demographics in France · dynamic cities vs ageing 2026",
  description:
    "National ranking of French cities by demographic trajectory: population growth, age structure, birth rate. Top 30 most dynamic vs top 20 most ageing.",
  alternates: { canonical: `${EN_BASE}/demographics` },
  openGraph: {
    title: "Demographics in France · dynamic cities vs ageing 2026",
    description:
      "Top 30 cities with the most dynamic demographic profile vs top 20 in critical tension.",
  },
};

const MIN_POP = 15_000;

export default function EnDemographicsHubPage() {
  const dynamic = topMostDynamic(30, MIN_POP);
  const ageing = topMostAgeing(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: `${EN_BASE}/` },
    { name: "Demographics", path: `${EN_BASE}/demographics` },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities have the most dynamic demographic profile?",
      a: `Based on our composite index (ageing 30% + trajectory 30% + young adults 25% + renewal 15%), the most demographically dynamic cities with 15,000+ inhabitants are: ${dynamic
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.demo.composite).toFixed(1)}/10)`)
        .join(", ")}. A high score means a balanced age pyramid and positive trajectory.`,
    },
    {
      q: "Which French cities face the most critical demographic decline?",
      a: `The cities in the deepest demographic tension among those with 15,000+ inhabitants are: ${ageing
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.demo.composite).toFixed(1)}/10)`)
        .join(", ")}. They typically combine marked ageing, outmigration of young adults, and a negative demographic balance over several decades.`,
    },
    {
      q: "How is the demographics ranking calculated?",
      a: "The composite aggregates four INSEE dimensions: ageing (30%, share of 60+ by department), population trajectory (30%, natural + migratory balance), young adults aged 25-35 (25%, share in total population), and renewal (15%, crude birth rate per 1,000). Score 0-10 where 10 = most dynamic.",
    },
    {
      q: "Where can I find official population projections to 2050?",
      a: "INSEE OMPHALE models population projections by employment zone to 2050-2070. The annual Bilan démographique gives the current-year snapshot. CNAV publishes 75+ senior projections by EPCI to 2030 and 2040. Eurostat also provides comparable figures for cross-country benchmarking.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href={`${EN_BASE}/`} className="hover:underline">Home</Link>
          {" / "}
          <span>Demographics</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Demographics in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index across four key dimensions of local demography:
          ageing, young-adult attractiveness, population trajectory, and natural
          renewal. Score 0-10 where 10 = most dynamic. Filtered to cities of
          15,000+ inhabitants.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Educational synthesis</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} cities</Badge>
          <Badge>Weighting: ageing 30% · trajectory 30% · young adults 25% · renewal 15%</Badge>
        </div>

        {/* Top dynamic */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Most dynamic cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Attractive metropolitan areas, dense Ile-de-France, and the growing
          Atlantic coast. A high composite score means a balanced pyramid and
          positive population trajectory.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Ageing</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Young adults</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Trajectory</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Renewal</th>
                </tr>
              </thead>
              <tbody>
                {dynamic.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/demographics`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${DEMO_LEVEL_COLOR[c.demo.level]}`}>
                        {(10 - c.demo.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_DEMO_LABEL[c.demo.level] ?? DEMO_LEVEL_LABEL[c.demo.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.ageing.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.youngActives.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.demo.trajectory.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.demo.renewal.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Reading: 10 = most dynamic. Score below 3 = critical demographic tension.
        </p>

        {/* Ageing */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Most ageing cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ inhabitants combining marked ageing, youth outmigration,
          and a structurally negative demographic balance. Rural central/eastern France
          and former industrial basins in transition.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Ageing</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Young adults</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Trajectory</th>
                </tr>
              </thead>
              <tbody>
                {ageing.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/demographics`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.demo.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.ageing.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.youngActives.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.demo.trajectory.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Methodology */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Methodology</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Ageing (30%)</strong> —
              share of 60+ population by department (INSEE RP). National median ~28%.
              Highest ageing: Limousin, Massif Central, Manche, Orne, Vosges (35-40%).
              Youngest: DROM excluding Antilles (below 20%).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Trajectory (30%)</strong> —
              annual demographic balance (natural + migratory). Atlantic coast, southern
              France and major metropolitan areas: consistently positive. Rural central/eastern
              France and former industrial basins: structural decline.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Young adults 25-35 (25%)</strong> —
              share of 25-35 age group in total population. Long-term attractiveness
              indicator. University cities lead (above 18%); rural towns trail.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Renewal (15%)</strong> —
              crude birth rate (per 1,000). France 2024 ~10.5‰. DROM above 14‰,
              ageing rural areas below 8‰. Proxy for the share of young adults of
              childbearing age.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            City-level synthesis derived from departmental proxies. For precise
            projections to 2050 by employment zone, INSEE OMPHALE remains the
            official reference.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          See also
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/rankings" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">All rankings</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">19 themed leaderboards</div>
            </Card>
          </Link>
          <Link href="/cities" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🗺️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Browse cities</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">All 540 cities with scores</div>
            </Card>
          </Link>
          <Link href="/guides" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">📖</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Guides</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">In-depth relocation articles</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
