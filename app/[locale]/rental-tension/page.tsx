import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { topMostTense, topMostRelaxed, type TensionLevel } from "@/lib/rental-tension";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Rental market pressure in France · 2026 ranking by city",
  description:
    "Where is it hard or easy to find a rental in France? Top 30 tightest rental markets vs top 20 most relaxed, with reference 1-bed rents.",
  alternates: { canonical: `${EN_BASE}/rental-tension` },
  openGraph: {
    title: "Rental market pressure in France · 2026 ranking",
    description:
      "Top 30 cities where finding a flat is hardest vs top 20 where the market stays accessible.",
  },
};

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

const EN_TENSION_SHORT: Record<TensionLevel, string> = {
  tendu: "Tight",
  modere: "Moderate",
  detente: "Relaxed",
};

const MIN_POP = 15_000;

export default function EnRentalTensionPage() {
  const tense = topMostTense(CITIES_LIGHT, 30, MIN_POP);
  const relaxed = topMostRelaxed(CITIES_LIGHT, 20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Rental market pressure", path: "/rental-tension" },
  ]);

  const faq = faqJsonLd([
    {
      q: "In which French cities is it hardest to find a rental?",
      a: `Cities of 15,000+ residents with the tightest rental market are: ${tense
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.tension.toFixed(1)}/10)`)
        .join(", ")}. A high score signals scarce listings, many applicants and long waits.`,
    },
    {
      q: "Where is the rental market most relaxed?",
      a: `Cities of 15,000+ residents with the most accessible market are: ${relaxed
        .slice(0, 5)
        .map((e) => `${e.city.name} (${e.tension.toFixed(1)}/10)`)
        .join(", ")}. Enough supply, room to negotiate, short waits.`,
    },
    {
      q: "How is this pressure score calculated?",
      a: "Score 0-10 (10 = very tight) derived from the city's 1-bed (T2) rent relative to the national median (~€750/month, Clameur 2024 panel excluding Île-de-France), adjusted by a per-commune market-pressure indicator (FNAIM, rent observatories, DGALN zoning). For cities without a housing record, it falls back to the cost-of-living score.",
    },
    {
      q: "Why a 15,000-resident filter?",
      a: "Rental-market indicators are more reliable in cities of meaningful size, so the national ranking is restricted to cities above 15,000 residents; the per-city pages cover all " + CITIES_COUNT + " cities in the dataset.",
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
          Rental market pressure in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Where renting a place is an obstacle course, and where the market stays accessible.
          Score 0-10 (10 = very tight) built from the 1-bed rent relative to the national median
          and a per-commune market-pressure indicator. Filtered to cities ≥ 15,000 residents for
          reliable indicators.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Honest proxy · no invented figures</Badge>
          <Badge>{CITIES_COUNT} cities referenced</Badge>
          <Badge>Clameur 2024 reference: median 1-bed ~€750/month</Badge>
        </div>

        {/* Most tense */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Tightest markets
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the highest pressure score. Often: Paris and its inner
          suburbs, attractive metros, desirable coastline (French Riviera, Basque Country, Atlantic
          coast).
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Pressure</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Level</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">1-bed rent</th>
                </tr>
              </thead>
              <tbody>
                {tense.map((e, i) => (
                  <tr key={e.city.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${e.city.slug}/rental-market`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {e.city.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{e.city.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {e.tension.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${e.info.color}`}>{EN_TENSION_SHORT[e.info.level]}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {e.rentT2 != null ? `€${e.rentT2}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Most relaxed */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Most relaxed markets
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the lowest score: mid-size cities of the centre and east,
          former industrial basins, places where supply outstrips demand. Searching is comfortable
          and negotiation is on the table.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Pressure</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Level</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">1-bed rent</th>
                </tr>
              </thead>
              <tbody>
                {relaxed.map((e, i) => (
                  <tr key={e.city.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${e.city.slug}/rental-market`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {e.city.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{e.city.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-emerald-600">
                        {e.tension.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${e.info.color}`}>{EN_TENSION_SHORT[e.info.level]}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {e.rentT2 != null ? `€${e.rentT2}` : "—"}
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
              <strong className="text-[var(--text-primary)]">Relative rent</strong> — the city's
              1-bed (T2) rent relative to the national median (~€750/month, Clameur 2024 panel
              excluding Île-de-France). A high rent signals strong demand and scarce supply.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Market pressure</strong> — a
              per-commune correction calibrated on published indicators (Clameur pressure, FNAIM
              vacancy rate, DGALN "tight zone" zoning). Paris and its inner suburbs, the Riviera and
              the Basque Country stack up the signals.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Fallback</strong> — for cities without
              a detailed housing record, the score is estimated from the cost-of-living score (a
              cheap market is rarely tight).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Documented as an estimate: no observatory publishes an average search time at commune
            level. Within a single city, pressure varies by neighbourhood and season (the September
            back-to-school period is the demand peak).
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          By geographic zone
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Rental pressure sharply divides the desirable coasts (Atlantic, Mediterranean, Alpine)
          from inland territories. View restricted to each large zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/rental-tension/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Tight + relaxed</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          See also
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/own-vs-rent" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🔑</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Rent or buy</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">The break-even point by city</div>
            </Card>
          </Link>
          <Link href="/red-flags" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚩</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red flags</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Rent vs local median wage</div>
            </Card>
          </Link>
          <Link href="/calculator/real-cost" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🧮</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Real cost</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Simulate your housing budget</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
