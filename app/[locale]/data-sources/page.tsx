import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Data & Sources · BestCitiesInFrance",
  description:
    "Full transparency on BestCitiesInFrance data sources: INSEE, Open Data, resident reviews. Everything is documented and verifiable.",
  alternates: { canonical: `${EN_BASE}/data-sources` },
};

const SOURCES = [
  {
    name: "INSEE · Census",
    category: "Demographics",
    description: "Population, age structure, socio-professional categories, unemployment rates.",
    update: "Annual",
    format: "CSV / API",
    status: "live" as const,
    url: "https://www.insee.fr",
  },
  {
    name: "data.gouv.fr · DVF",
    category: "Property",
    description: "Property transaction database: sale prices by municipality.",
    update: "Bi-annual",
    format: "CSV",
    status: "live" as const,
    url: "https://data.gouv.fr",
  },
  {
    name: "OpenStreetMap",
    category: "Geography & Amenities",
    description: "Density of shops, cafés, coworking spaces, parks, cycle paths, transport access.",
    update: "Continuous",
    format: "OSM / Overpass API",
    status: "live" as const,
    url: "https://openstreetmap.org",
  },
  {
    name: "data.education.gouv.fr",
    category: "Schools",
    description: "Baccalauréat results by school, pass rates, available subjects.",
    update: "Annual",
    format: "CSV",
    status: "live" as const,
    url: "https://data.education.gouv.fr",
  },
  {
    name: "Open-Meteo",
    category: "Weather & Climate",
    description: "Historical average temperatures, precipitation, sunshine by municipality (hours and days).",
    update: "Daily",
    format: "JSON API",
    status: "live" as const,
    url: "https://open-meteo.com",
  },
  {
    name: "Police / gendarmerie · État 4001",
    category: "Safety",
    description: "Crime statistics by offence type and municipality (recorded crimes and misdemeanours).",
    update: "Annual",
    format: "XLSX / data.gouv.fr",
    status: "live" as const,
    url: "https://data.gouv.fr",
  },
  {
    name: "RPPS · Medical practitioners register",
    category: "Healthcare",
    description: "Density of GPs and specialists by municipality.",
    update: "Monthly",
    format: "API / CSV",
    status: "partial" as const,
    url: "https://esante.gouv.fr",
  },
  {
    name: "BestCitiesInFrance resident reviews",
    category: "Lived experience",
    description: "Verified reviews from current and former residents. Human + AI spam moderation.",
    update: "Real-time",
    format: "Internal",
    status: "live" as const,
    url: "/cities",
  },
  {
    name: "Airparif / ATMO",
    category: "Air quality",
    description: "Air quality index, PM2.5, PM10, NO2 by geographic zone.",
    update: "Daily",
    format: "API",
    status: "coming" as const,
    url: "https://www.airparif.fr",
  },
];

const STATUS_CONFIG = {
  live: { label: "Active", color: "text-emerald-600 bg-emerald-500/10 border-emerald-400/20" },
  partial: { label: "Partial", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  coming: { label: "Coming soon", color: "text-blue-600 bg-blue-400/10 border-blue-400/20" },
};

const SCORE_CRITERIA = [
  { key: "life", label: "Quality of life", description: "Composite: resident satisfaction, density of shops and services.", weight: 15 },
  { key: "transport", label: "Transport", description: "GTFS public transport, cycle paths, TGV station access, median commute time.", weight: 12 },
  { key: "nature", label: "Nature", description: "Green space access, annual sunshine, air quality, proximity to sea or mountains.", weight: 14 },
  { key: "cost", label: "Cost of living", description: "Median rent, price per m², local consumer price index vs median income.", weight: 15 },
  { key: "safety", label: "Safety", description: "Police/gendarmerie crime statistics, resident safety perception, disorder.", weight: 14 },
  { key: "culture", label: "Culture", description: "Theatres, museums, festivals, restaurants, nightlife, university offering.", weight: 10 },
  { key: "remoteWork", label: "Remote work", description: "Fibre coverage, coworking density, WiFi cafés, tech community, cost/fibre ratio.", weight: 10 },
  { key: "schools", label: "Schools", description: "Bac pass rate, public/private school offering, local PISA-style results, school dropout rate.", weight: 10 },
];

export default function EnDataSourcesPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            {" / "}
            <span>Data &amp; Sources</span>
          </nav>
          <Badge variant="accent" className="mb-3">Full transparency</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Our data &amp; sources
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Everything you see on BestCitiesInFrance is built on verifiable, public data.
            No &quot;magic scores&quot;, no paid placements.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Cities analysed", value: `${CITIES_SEED.length}` },
            { label: "Data sources", value: `${SOURCES.length}` },
            { label: "Score criteria", value: "8" },
            { label: "Update frequency", value: "Weekly" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-center">
              <div className="text-2xl font-black font-mono-data text-[var(--accent)]">{value}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Score criteria */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">
            How scores are calculated
          </h2>
          <div className="space-y-3">
            {SCORE_CRITERIA.map((c) => (
              <div key={c.key} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className="font-semibold text-[var(--text-primary)]">{c.label}</span>
                  <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">Weight: {c.weight}%</span>
                </div>
                <div className="h-1 bg-[var(--bg-elevated)] rounded-full mb-2">
                  <div
                    className="h-1 bg-[var(--accent)] rounded-full"
                    style={{ width: `${c.weight * 4}%` }}
                  />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{c.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sources table */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">Data sources used</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3 pr-4">Source</th>
                    <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3 pr-4 hidden sm:table-cell">Category</th>
                    <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3 pr-4 hidden md:table-cell">Update</th>
                    <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {SOURCES.map((s) => {
                    const st = STATUS_CONFIG[s.status];
                    return (
                      <tr key={s.name} className="hover:bg-[var(--bg-elevated)] transition-colors">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-[var(--text-primary)]">{s.name}</div>
                          <div className="text-xs text-[var(--text-tertiary)] mt-0.5 hidden sm:block">{s.description}</div>
                        </td>
                        <td className="py-3 pr-4 text-sm text-[var(--text-secondary)] hidden sm:table-cell">{s.category}</td>
                        <td className="py-3 pr-4 text-sm text-[var(--text-secondary)] hidden md:table-cell">{s.update}</td>
                        <td className="py-3">
                          <span className={`inline-flex text-xs font-medium border rounded-full px-2.5 py-0.5 ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Download / contact CTA */}
        <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-8">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Data export</h2>
          <p className="text-[var(--text-secondary)] mb-5">
            Journalists, researchers, local authorities: contact us for access to the full
            dataset (CSV / JSON), including the calibration grid and per-field source documentation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-[var(--accent)] text-white font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              ✉️ Request access
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium px-5 py-2.5 text-sm hover:text-[var(--text-primary)] transition-colors"
            >
              Academic / press enquiry
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/methodology" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Detailed methodology →
          </Link>
          <Link href="/leaderboard" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Leaderboard →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
