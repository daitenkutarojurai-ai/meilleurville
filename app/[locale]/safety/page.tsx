import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topSafest,
  topMostStressed,
  SAFETY_LEVEL_LABEL,
  SAFETY_LEVEL_COLOR,
} from "@/lib/safety-deep";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

const EN_BASE = ORIGIN_BY_LOCALE.en;

const EN_SAFETY_LABEL: Record<string, string> = {
  calme: "Calm",
  vigilance: "Watch",
  tendu: "Tense",
  critique: "Critical",
};

export const metadata: Metadata = {
  title: "Safety in France · 2026 ranking — safest cities vs most strained",
  description:
    "National ranking of French cities by safety: crime rates, vandalism, domestic violence. Top 30 safest cities vs top 20 most strained. Sources: SSMSI / Ministry of Interior.",
  alternates: { canonical: `${EN_BASE}/safety` },
  openGraph: {
    title: "Safety in France · 2026 ranking",
    description:
      "Top 30 safest cities vs top 20 most strained — 4 SSMSI sub-scores.",
  },
};

const MIN_POP = 15_000;

export default function EnSafetyHubPage() {
  const calmest = topSafest(30, MIN_POP);
  const stressed = topMostStressed(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: `${EN_BASE}/` },
    { name: "Safety", path: `${EN_BASE}/safety` },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities have the best safety record?",
      a: `Based on our composite index (property crime 35% + personal crime 30% + night safety 20% + domestic violence 15%), the safest cities with 15,000+ inhabitants are: ${calmest
        .slice(0, 5)
        .map((c) => `${c.name} (${c.safety.composite.toFixed(1)}/10)`)
        .join(", ")}. A low score means the city sits below the national SSMSI average.`,
    },
    {
      q: "Which French cities are the most strained on safety?",
      a: `The cities with the highest composite score (worst safety) among those with 15,000+ inhabitants are: ${stressed
        .slice(0, 5)
        .map((c) => `${c.name} (${c.safety.composite.toFixed(1)}/10)`)
        .join(", ")}. They typically combine above-average property crime (burglaries, vehicle theft) with higher personal assault rates.`,
    },
    {
      q: "How is the safety ranking calculated?",
      a: "The composite aggregates four SSMSI dimensions: property crime (35%, burglaries + vehicle theft + non-violent theft, national average ~16.5‰), personal crime (30%, voluntary assault excluding domestic violence, average ~4.3‰), night safety (20%, brawls and nocturnal vandalism), and domestic violence (15%, SSMSI reported incidents). Score 0-10, where 10 = worst.",
    },
    {
      q: "What are the limitations of this data?",
      a: "SSMSI figures cover only reported crimes — under-reporting varies by area and crime type. Within any city, safety differs sharply between a train-station district and a quiet residential suburb. For fine-grained analysis, prefecture état 4001 reports break figures down by police or gendarmerie catchment area.",
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
          <span>Safety</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Safety in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index across four SSMSI dimensions: property crime,
          personal crime, night safety, and domestic violence.
          Score 0-10 where 10 = worst. Filtered to cities of 15,000+ inhabitants
          for statistical relevance.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Educational synthesis</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} cities</Badge>
          <Badge>Weighting: property 35% · personal 30% · night 20% · domestic 15%</Badge>
        </div>

        {/* Top safest */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Safest cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ inhabitants with the lowest SSMSI composite score.
          Typically: quiet sub-prefectures, mid-sized towns outside dense urban zones,
          and structured small cities.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Property</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Personal</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Night</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Dom. viol.</th>
                </tr>
              </thead>
              <tbody>
                {calmest.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/safety`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SAFETY_LEVEL_COLOR[c.safety.level]}`}>
                        {c.safety.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_SAFETY_LABEL[c.safety.level] ?? SAFETY_LEVEL_LABEL[c.safety.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.property.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.persons.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.safety.nocturnal.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.safety.vffs.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Sub-scores: 10 = worst (maximum insecurity).
        </p>

        {/* Most stressed */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Most strained cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ inhabitants combining above-average property and personal
          crime rates. Mostly strained metropolitan areas and former industrial towns
          in economic transition.
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Property</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Personal</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Night</th>
                </tr>
              </thead>
              <tbody>
                {stressed.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/safety`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.safety.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.property.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.persons.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.safety.nocturnal.score.toFixed(1)}</td>
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
              <strong className="text-[var(--text-primary)]">Property crime (35%)</strong> —
              burglaries, vehicle theft, non-violent theft. Concentrated in strained
              metropolitan areas (Paris, PACA, dense Ile-de-France) and tourist destinations.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Personal crime (30%)</strong> —
              voluntary assault and battery, excluding domestic violence. Over-represented
              in former industrial towns and departments with high social inequality.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Night safety (20%)</strong> —
              brawls, night-time assaults, vandalism. Concentrated in entertainment districts,
              student cities, and dense metropolitan night-life areas.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Domestic violence (15%)</strong> —
              SSMSI reported incidents. Interpret with caution: a higher rate may reflect
              better reporting mechanisms rather than a higher absolute occurrence.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            City-level synthesis. Within any single city, perceived safety varies
            sharply between a station district and a quiet residential neighbourhood.
            For fine-grained analysis, prefecture état 4001 reports break figures down
            by police or gendarmerie catchment area.
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
          <Link href="/red-flags" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚩</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red Flags</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">11 themes to watch out for</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
