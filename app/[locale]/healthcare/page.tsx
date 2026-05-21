import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topBestAccess,
  topDeserts,
  HEALTH_LEVEL_LABEL,
  HEALTH_LEVEL_COLOR,
  type HealthLevel,
} from "@/lib/healthcare-access";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "Healthcare access in France · best hospitals vs medical deserts 2026",
  description:
    "National ranking of French cities by healthcare access: GPs, specialists, A&E, pharmacies. Top 30 best-served cities vs top 20 medical deserts. Sources: DREES / CNOM / ARS.",
  alternates: { canonical: `${EN_BASE}/healthcare` },
  openGraph: {
    title: "Healthcare access in France · best hospitals vs medical deserts 2026",
    description:
      "Top 30 best-served cities (GPs + specialists + A&E) vs top 20 confirmed medical deserts.",
  },
};

const EN_HEALTH_LABEL: Record<HealthLevel, string> = {
  facile: "Easy",
  correct: "Adequate",
  tendu: "Strained",
  desert: "Medical desert",
};

const MIN_POP = 10_000;

export default function HealthcareHubPage() {
  const best = topBestAccess(30, MIN_POP);
  const deserts = topDeserts(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Healthcare", path: "/healthcare" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities have the best healthcare access?",
      a: `Based on our composite index (GPs, specialists, A&E, pharmacies), the cities ≥ 10,000 residents with the best healthcare access are: ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.access.composite).toFixed(1)}/10)`)
        .join(", ")}. Score 10 = excellent access.`,
    },
    {
      q: "Which cities are medical deserts?",
      a: `The cities ≥ 10,000 residents with the lowest healthcare access composite (most difficult) are: ${deserts
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.access.composite).toFixed(1)}/10)`)
        .join(", ")}. These cities typically combine poor GP density, distant A&E, and rare specialists.`,
    },
    {
      q: "How is this ranking calculated?",
      a: "Composite of 4 dimensions: GPs (35%, DREES departmental density + university hospital overrides), specialists (25%, university hospital > large agglomeration > medium city > rural), A&E (25%, presence in city + mountain/island penalty), pharmacies (15%, population coverage × urban status). Score 0-10, 10 = excellent access. Sources: DREES, CNOM, ARS.",
    },
    {
      q: "What if I cannot find a GP?",
      a: "The ARS (Regional Health Agency) for each department maintains a list of GPs accepting new patients. Ameli (ameli.fr) offers a directory with availability. Doctolib filters by 'new patients accepted'. The CPAM can also assign a GP via the 'médecin traitant' online service.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Healthcare access in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index covering four key dimensions of healthcare access: GPs, specialists,
          A&E/emergency services, and pharmacies. Score 0-10, 10 = excellent access. Filtered to
          cities ≥ 10,000 residents for meaningful departmental indicators.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Educational overview</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} cities</Badge>
          <Badge>GP 35% · specialists 25% · A&E 25% · pharmacies 15%</Badge>
        </div>

        {/* Top 30 best access */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Best healthcare access
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities hosting a university hospital, large agglomerations well-equipped with GPs and
          specialists, dense urban networks. High composite score = easy access.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">GPs</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Spec.</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">A&amp;E</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Pharma.</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/healthcare`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${HEALTH_LEVEL_COLOR[c.access.level]}`}>
                        {(10 - c.access.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_HEALTH_LABEL[c.access.level] ?? HEALTH_LEVEL_LABEL[c.access.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {(10 - c.access.generalistes.score).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {(10 - c.access.specialistes.score).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {(10 - c.access.urgences.score).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {(10 - c.access.pharmacies.score).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Sub-score reading: 10 = excellent access, 0 = medical desert.
        </p>

        {/* Top 20 medical deserts */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Confirmed medical deserts
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities ≥ 10,000 with poor GP density (DREES), saturated specialists, and distant emergency
          services. Low composite score = difficult access.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">GPs</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Spec.</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">A&amp;E</th>
                </tr>
              </thead>
              <tbody>
                {deserts.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/healthcare`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.access.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {(10 - c.access.generalistes.score).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {(10 - c.access.specialistes.score).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {(10 - c.access.urgences.score).toFixed(1)}
                    </td>
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
              <strong className="text-[var(--text-primary)]">GPs (35%)</strong> — DREES
              departmental density 2023-2024, categorised: desert (&lt; 80/100k + &gt; 50% GPs &gt;
              60 years old) / under-served (&lt; 100/100k) / adequate / well-served (&gt; 145/100k
              or metro/university hospital).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Specialists (25%)</strong> — city hosts
              a university hospital (28 cities) &gt; large agglomeration &gt; medium city &gt; rural.
              Wait times for ophthalmology and dermatology increase the further from a university
              hospital.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">A&E (25%)</strong> — presence of an
              emergency department in the city or access time. Penalty for mountain zones (snow) and
              island zones (transport links).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Pharmacies (15%)</strong> — population
              coverage × urban status. French average: 1 pharmacy per 3,000 residents.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            City-level summary. Precise zoning and GP incentive schemes are published by the ARS.
            The situation changes quickly with retirements — check GP availability on Ameli before
            relocating.
          </p>
        </Card>

        {/* Cross-links — no EN macro-region healthcare sub-pages, link to cities hub instead */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">See also</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/cities" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏙️</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">All cities</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Browse all 540 cities by score
              </div>
            </Card>
          </Link>
          <Link href="/red-flags" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚨</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red flags</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Cities with critical warning signals
              </div>
            </Card>
          </Link>
          <Link href="/rankings" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">All rankings</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Life, transport, safety...
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
