import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { parisCommuteAll } from "@/lib/paris-commute";
import { scoreColor, formatScore } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "French cities by train from Paris · Travel time ranking 2026",
  description:
    "Rail travel time Paris ↔ every French city. Top cities under 1h, 2h, 3h from Paris. Essential tool for remote workers and weekend commuters.",
  alternates: { canonical: `${EN_BASE}/from-paris` },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "From Paris by train", path: "/from-paris" },
]);

const BUCKETS = [
  { max: 60, label: "Under 1 hour", tone: "text-emerald-700 bg-emerald-100 border-emerald-300" },
  { max: 90, label: "1h to 1h30", tone: "text-lime-700 bg-lime-100 border-lime-300" },
  { max: 120, label: "1h30 to 2h", tone: "text-amber-700 bg-amber-100 border-amber-300" },
  { max: 180, label: "2h to 3h", tone: "text-orange-700 bg-orange-100 border-orange-300" },
  { max: 300, label: "3h to 5h", tone: "text-red-700 bg-red-100 border-red-300" },
] as const;

export default function FromParisPage() {
  const all = parisCommuteAll().sort((a, b) => a.commute.minutes - b.commute.minutes);
  const grouped = BUCKETS.map((b, i) => {
    const prevMax = i === 0 ? 0 : BUCKETS[i - 1].max;
    return {
      bucket: b,
      items: all.filter((x) => x.commute.minutes > prevMax && x.commute.minutes <= b.max),
    };
  });

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          From Paris by train — ranked by journey time
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          {all.length} cities sorted by estimated rail travel time to Paris (SNCF schedules June 2025 for direct-station cities + TER/local access estimate for others). Essential for remote workers and weekend commuters.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Badge>{all.length} cities</Badge>
          <Badge>SNCF schedules</Badge>
          <Badge>+ local access estimate</Badge>
        </div>

        {grouped.map(({ bucket, items }) =>
          items.length === 0 ? null : (
            <div key={bucket.label} className="mt-10">
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{bucket.label}</h2>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${bucket.tone}`}
                >
                  {items.length} {items.length === 1 ? "city" : "cities"}
                </span>
              </div>
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-surface)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                    <tr>
                      <th className="px-3 py-2 text-left">City</th>
                      <th className="px-3 py-2 text-left hidden sm:table-cell">Region</th>
                      <th className="px-3 py-2 text-right">Journey</th>
                      <th className="px-3 py-2 text-right hidden md:table-cell">Via</th>
                      <th className="px-3 py-2 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(({ city, commute }) => (
                      <tr
                        key={city.slug}
                        className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]"
                      >
                        <td className="px-3 py-2 text-sm">
                          <Link
                            href={`/cities/${city.slug}`}
                            className="font-medium text-[var(--text-primary)] hover:underline"
                          >
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
                          {commute.source === "direct-station"
                            ? "Direct"
                            : commute.viaStation
                              ? `${commute.viaStation} (+${commute.accessKm} km)`
                              : "—"}
                        </td>
                        <td
                          className={`px-3 py-2 text-right text-sm font-mono-data font-bold ${scoreColor(city.scores.global)}`}
                        >
                          {formatScore(city.scores.global)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )
        )}

        <div className="mt-10 text-xs text-[var(--text-tertiary)]">
          Methodology: for cities with a direct Paris rail connection, journey time is the fastest
          published SNCF schedule (Oui.sncf, June 2025). For other cities, the time to the nearest
          TGV/TER hub is used, plus 0.5 min/km of local access (TER or car). Overseas territories
          and Corsica are excluded (no mainland rail link).
        </div>
      </section>
      <Footer />
    </main>
  );
}
