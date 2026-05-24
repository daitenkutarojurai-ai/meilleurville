import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topBestServices,
  topServicesDesert,
  SERVICES_LEVEL_LABEL,
  SERVICES_LEVEL_COLOR,
} from "@/lib/public-services";
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

const EN_SERVICES_LABEL: Record<string, string> = {
  excellent: "Excellent",
  correct: "Adequate",
  tendu: "Strained",
  desertique: "Under-served",
};

export const metadata: Metadata = {
  title: "Public services in France · school, post office, town hall access 2026",
  description:
    "National ranking of French cities by public services access: schools, post offices, town halls, libraries. Top 30 best-served vs top 20 under-served.",
  alternates: { canonical: `${EN_BASE}/public-services` },
  openGraph: {
    title: "Public services in France · access ranking 2026",
    description:
      "Top 30 best-served cities vs top 20 under-served — schools, post offices, town halls, libraries.",
  },
};

const MIN_POP = 15_000;

export default function EnPublicServicesHubPage() {
  const best = topBestServices(30, MIN_POP);
  const desert = topServicesDesert(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: `${EN_BASE}/` },
    { name: "Public services", path: `${EN_BASE}/public-services` },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities offer the best access to public services?",
      a: `Based on our composite index (schools 35% + town hall 25% + post office 25% + library 15%), the best-served cities with 15,000+ inhabitants are: ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.services.composite).toFixed(1)}/10)`)
        .join(", ")}. A high score means comprehensive service coverage.`,
    },
    {
      q: "Which French cities are considered public service deserts?",
      a: `The most under-served cities with 15,000+ inhabitants are: ${desert
        .slice(0, 5)
        .map((c) => `${c.name} (${(10 - c.services.composite).toFixed(1)}/10)`)
        .join(", ")}. A low score reflects cumulative strain across schools, post offices, town halls or libraries — often tied to deep rural settings or the most stretched overseas territories.`,
    },
    {
      q: "How is the public services ranking calculated?",
      a: "The composite aggregates four dimensions: schools and early childhood (35%, DEPP directory + CAF nursery pressure), town hall and administrative services (25%, opening hours + CNI/passport processing + France Services presence), post office and France Services (25%, branches + APC + RPC + ~2,800 Maisons France Services), and library (15%, BNF public reading observatory). Score 0-10 where 10 = full coverage.",
    },
    {
      q: "Where can I find official public service locations near me in France?",
      a: "The French public services directory at lannuaire.service-public.fr lists all town halls, CAF/CPAM offices, France Travail, and tax offices. The Maisons France Services map is at france-services.gouv.fr. For post offices, La Poste publishes its official branch map at laposte.fr.",
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
          <span>Public services</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Public services in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index across four everyday pillars: schools and early childhood,
          town hall and administrative services, post office and France Services, and
          library access. Score 0-10 where 10 = full service coverage. Filtered to
          cities of 15,000+ inhabitants.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Educational synthesis</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} cities</Badge>
          <Badge>Weighting: schools 35% · town hall 25% · post office 25% · library 15%</Badge>
        </div>

        {/* Top best */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Best public services
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Large metropolitan areas, dense Ile-de-France, and mid-sized cities above
          30,000 inhabitants. All dimensions operational, France Services present.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Schools</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Library</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Post office</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Town hall</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/public-services`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SERVICES_LEVEL_COLOR[c.services.level]}`}>
                        {(10 - c.services.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_SERVICES_LABEL[c.services.level] ?? SERVICES_LEVEL_LABEL[c.services.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.services.schools.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.services.library.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.services.postOffice.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.services.cityHall.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Reading: 10 = full service coverage. Score below 3 = public service desert.
        </p>

        {/* Desert */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Most under-served cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ inhabitants with cumulative strain across multiple
          dimensions. Often deep rural settings within a department, or the most
          stretched overseas territories (French Guiana, Mayotte in particular).
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Schools</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Post office</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Town hall</th>
                </tr>
              </thead>
              <tbody>
                {desert.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/public-services`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.services.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.services.schools.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.services.postOffice.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.services.cityHall.score).toFixed(1)}</td>
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
              <strong className="text-[var(--text-primary)]">Schools and early childhood (35%)</strong> —
              DEPP directory (schools, collèges, lycées) + CAF nursery pressure by department.
              Cities above 30,000 inhabitants: full coverage. Towns below 5,000: shared
              school groups (RPI) with bus transport.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Town hall and administrative services (25%)</strong> —
              opening hours, on-site ID card and passport processing, and Maison France
              Services presence (~2,800 sites in 2024).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Post office and France Services (25%)</strong> —
              post office branches, APC, RPC. Penalty for departments where La Poste coverage
              is shrinking (Creuse, Cantal, Lozère, Allier) and the most stretched overseas territories.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Library (15%)</strong> —
              BNF public reading observatory. Near-universal presence above 10,000 inhabitants.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Coverage proxied by population tier and department. For point-by-point detail,
            the French public services directory at service-public.fr is the authoritative
            up-to-date reference.
          </p>
        </Card>

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">By geographic zone</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          This ranking broken down by macro-region — each view shows only cities in that geographic zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/public-services/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Public services</div>
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
