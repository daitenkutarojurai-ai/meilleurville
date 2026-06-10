import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { JOB_LEVEL_LABEL, JOB_LEVEL_COLOR } from "@/lib/employment-market";
import { topMostFavorable, topMostDifficult } from "@/lib/employment-market-rankings";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { MACRO_REGIONS } from "@/lib/macro-regions";

export const revalidate = false;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

const EN_BASE = ORIGIN_BY_LOCALE.en;

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

const EN_JOB_LABEL: Record<string, string> = {
  facile: "Active",
  actif: "Good",
  tendu: "Tight",
  sinistre: "Depressed",
};

export const metadata: Metadata = {
  title: "Job market in France · best cities for employment 2026",
  description:
    "National ranking of French cities by employment conditions: unemployment rate, job creation, sector diversification. Top 30 most active vs top 20 most difficult job markets.",
  alternates: { canonical: `${EN_BASE}/employment` },
  openGraph: {
    title: "Job market in France · best cities for employment 2026",
    description:
      "Top 30 most active job markets vs top 20 most difficult. INSEE / DARES / SIRENE / DADS.",
  },
};

const MIN_POP = 15_000;

export default function EnEmploymentHubPage() {
  const best = topMostFavorable(30, MIN_POP);
  const worst = topMostDifficult(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: `${EN_BASE}/` },
    { name: "Employment", path: `${EN_BASE}/employment` },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities have the most active job markets?",
      a: `Based on our composite index (unemployment 35% + salary 25% + business dynamism 20% + sector mix 20%), the cities with the most favourable job markets among those with 15,000+ inhabitants are: ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.market.composite).toFixed(1)}/10)`)
        .join(", ")}. A high score means a favourable market.`,
    },
    {
      q: "Which French cities have the most difficult job markets?",
      a: `The cities with the most difficult employment conditions among those with 15,000+ inhabitants are: ${worst
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.market.composite).toFixed(1)}/10)`)
        .join(", ")}. They typically combine high unemployment, below-average wages, and weak entrepreneurial dynamism.`,
    },
    {
      q: "How is the employment ranking calculated?",
      a: "The composite aggregates four dimensions: unemployment rate INSEE Q4 2024 by department (35%), median net salary INSEE DADS (25%), net business creation SIRENE (20%), sector mix and economic resilience (20%). Score 0-10 where 10 = most dynamic labour market.",
    },
    {
      q: "What sectors drive the best job markets in France?",
      a: "Metropolitan areas combining financial services, tech, healthcare, and education consistently rank highest. Coastal and rural mono-tourism economies face seasonal volatility. Former industrial basins in transition (steel, mining, textiles) typically score lowest due to structural unemployment and weak wage recovery.",
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
          <span>Employment</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Job market in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index across four key dimensions of the local labour market:
          unemployment rate (INSEE), business dynamism (SIRENE), sector mix
          (resilience), and median net salary (DADS). Score 0-10 where 10 = most
          dynamic. Filtered to cities of 15,000+ inhabitants for statistical
          relevance of departmental indicators.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Educational synthesis</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} cities</Badge>
          <Badge>Weighting: unemployment 35% · salary 25% · dynamism 20% · sector mix 20%</Badge>
        </div>

        {/* Top most favorable */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Most active job markets
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Dynamic metropolitan areas, low-unemployment departments, above-median
          salaries. A high composite score means wide opportunities and a relatively
          easy job search.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Unemploy.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Salary</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Dynamism</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Sector mix</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/employment`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${JOB_LEVEL_COLOR[c.market.level]}`}>
                        {(10 - c.market.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_JOB_LABEL[c.market.level] ?? JOB_LEVEL_LABEL[c.market.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.unemployment.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.salary.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.market.dynamism.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.market.sectorMix.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Sub-scores: 10 = most favourable (low unemployment, high salary, strong dynamism).
        </p>

        {/* Most difficult */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Most difficult job markets
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ inhabitants combining high INSEE unemployment, below-average
          wages and weak net business creation. Tight market, often in economic transition.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Unemploy.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Salary</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Dynamism</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/employment`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.market.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.unemployment.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.market.salary.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.market.dynamism.score).toFixed(1)}</td>
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
              <strong className="text-[var(--text-primary)]">Unemployment (35%)</strong> —
              quarterly INSEE rate by department (Q4 2024 latest). Metropolitan France
              average ~7.3%. DROM territories chronically above 15%.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Salary (25%)</strong> —
              departmental median net salary, INSEE DADS. France average ~€2,100/month.
              Paris and inner suburbs above €2,400; DROM and rural departments below €1,850.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Business dynamism (20%)</strong> —
              net business creation SIRENE by department, weighted by city size.
              Metropolitan areas and coastal zones lead; rural areas in structural decline trail.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Sector mix (20%)</strong> —
              economic diversification. Penalty for mono-tourism (seasonal volatility) and
              former single-industry basins in transition; bonus for diversified metropolitan economies.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Departmental-scale synthesis. The local market can vary significantly within
            a department (prefecture vs. rural canton). For live job listings: France Travail,
            Apec (management), Hellowork.
          </p>
        </Card>

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">By geographic zone</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          This ranking broken down by macro-region — each view shows only cities in that geographic zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/employment/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Employment market</div>
              </Card>
            </Link>
          ))}
        </div>

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
