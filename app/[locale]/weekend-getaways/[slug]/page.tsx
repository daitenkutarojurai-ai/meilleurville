import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ORIGIN_SLUGS,
  getOriginCity,
  cityCommuteAll,
  type CityCommute,
} from "@/lib/city-commute";
import { scoreColor, formatScore } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import type { CitySeed } from "@/data/cities-seed";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return ORIGIN_SLUGS.map((slug) => ({ locale: "en", slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getOriginCity(slug);
  if (!city) return {};
  return {
    title: `Weekend getaways from ${city.name} · Destinations under 5h 2026`,
    description: `Every French city reachable from ${city.name} in under 5 hours (TGV, Intercités or car). Ranked by travel time with a quality-of-life score.`,
    alternates: { canonical: `${EN_BASE}/weekend-getaways/${slug}` },
    openGraph: {
      title: `From ${city.name} · Weekend destinations in France 2026`,
      description: `Weekend destinations from ${city.name} — estimated travel time for 500+ French cities.`,
    },
  };
}

const BUCKETS = [
  { max: 60, label: "Under 1 hour", tone: "text-emerald-700 bg-emerald-100 border-emerald-300" },
  { max: 90, label: "1 h to 1 h 30", tone: "text-lime-700 bg-lime-100 border-lime-300" },
  { max: 120, label: "1 h 30 to 2 h", tone: "text-amber-700 bg-amber-100 border-amber-300" },
  { max: 180, label: "2 h to 3 h", tone: "text-orange-700 bg-orange-100 border-orange-300" },
  { max: 300, label: "3 h to 5 h", tone: "text-red-700 bg-red-100 border-red-300" },
] as const;

const SOURCE_LABEL: Record<CityCommute["source"], string> = {
  "via-paris": "Via Paris",
  "direct-rail": "Direct train",
  road: "Road",
  unavailable: "—",
};

export default async function EnWeekendGetawaysSlugPage({ params }: Props) {
  const { slug } = await params;
  const origin = getOriginCity(slug);
  if (!origin) notFound();

  const all = cityCommuteAll(slug);

  const grouped = BUCKETS.map((b, i) => {
    const prevMax = i === 0 ? 0 : BUCKETS[i - 1].max;
    return {
      bucket: b,
      items: all.filter((x) => x.commute.minutes > prevMax && x.commute.minutes <= b.max),
    };
  });

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Weekend getaways", path: "/weekend-getaways" },
    { name: origin.name, path: `/weekend-getaways/${slug}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-1">›</span>
          <Link href="/weekend-getaways" className="hover:underline">Weekend getaways</Link>
          <span className="mx-1">›</span>
          <span>{origin.name}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          From {origin.name} — destinations ranked by travel time
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          {all.length} cities reachable from {origin.name} in under 5 hours. Fastest estimated time:
          direct TGV, via Paris, or car depending on the available links. BestCitiesInFrance
          quality-of-life score included.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{all.length} destinations</Badge>
          <Badge>SNCF estimates + access</Badge>
          <Badge>
            <Link href={`/cities/${slug}`} className="hover:underline">
              See {origin.name} →
            </Link>
          </Badge>
        </div>

        {grouped.map(({ bucket, items }) =>
          items.length === 0 ? null : (
            <div key={bucket.label} className="mt-10">
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{bucket.label}</h2>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${bucket.tone}`}>
                  {items.length} {items.length > 1 ? "cities" : "city"}
                </span>
              </div>
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-surface)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                    <tr>
                      <th className="px-3 py-2 text-left">City</th>
                      <th className="px-3 py-2 text-left hidden sm:table-cell">Region</th>
                      <th className="px-3 py-2 text-right">Trip</th>
                      <th className="px-3 py-2 text-right hidden md:table-cell">Mode</th>
                      <th className="px-3 py-2 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(({ city, commute }: { city: CitySeed; commute: CityCommute }) => (
                      <tr key={city.slug} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]">
                        <td className="px-3 py-2 text-sm">
                          <Link href={`/cities/${city.slug}`} className="font-medium text-[var(--text-primary)] hover:underline">
                            {city.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-sm text-[var(--text-secondary)] hidden sm:table-cell">
                          {city.region ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-right text-sm font-mono-data font-semibold tabular-nums">
                          {commute.display}
                        </td>
                        <td className="px-3 py-2 text-right text-[11px] text-[var(--text-tertiary)] hidden md:table-cell">
                          {SOURCE_LABEL[commute.source]}
                        </td>
                        <td className={`px-3 py-2 text-right text-sm font-mono-data font-bold ${scoreColor(city.scores.global)}`}>
                          {formatScore(city.scores.global)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          ),
        )}

        <p className="mt-10 text-xs text-[var(--text-tertiary)] max-w-3xl">
          Estimated times. Mode chosen: the fastest of direct TGV (haversine / 220 km/h + 20 min),
          via Paris (Paris time × 2 + 30 min connection), and road (haversine × 1.25 / 85 km/h).
          Source: oui.sncf June 2025 for the main stations. Check SNCF schedules before planning a trip.
        </p>
      </section>

      <Footer />
    </main>
  );
}
