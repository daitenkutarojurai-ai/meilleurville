import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { scoreColor } from "@/lib/utils";
import { FranceHeatmap } from "@/components/FranceHeatmap";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Map of French cities — quality of life visualised",
  description: `Interactive-style map of ${CITIES_COUNT}+ French cities. Each dot is coloured by its quality-of-life score, from red (weak) to emerald (exceptional).`,
  alternates: { canonical: `${EN_BASE}/map` },
};

// Metropolitan bounding box — same as components/FranceHeatmap.tsx.
// DROM cities fall outside this box and are listed separately below.
const LNG_MIN = -6, LNG_MAX = 10, LAT_MIN = 40, LAT_MAX = 52;

export default function EnMapPage() {
  const metro = CITIES_SEED.filter(
    (c) =>
      c.longitude != null && c.latitude != null &&
      c.longitude >= LNG_MIN && c.longitude <= LNG_MAX &&
      c.latitude >= LAT_MIN && c.latitude <= LAT_MAX
  );
  const drom = CITIES_SEED.filter((c) => !metro.includes(c));
  const top10 = [...CITIES_SEED].sort((a, b) => b.scores.global - a.scores.global).slice(0, 10);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Map of French cities
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            {CITIES_COUNT} cities placed by geographic position. Each dot is coloured by its overall quality-of-life score. Hover a dot to see the city; click to open its profile.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {/* Full locale-aware heatmap: France mainland + Corsica outline, aurora
            backdrop, score legend and per-axis filters, EN /cities links. */}
        <FranceHeatmap locale="en" showRegionToggle cities={CITIES_LIGHT} />

        {drom.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">Overseas departments (DROM)</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              These cities sit outside the mainland bounding box, so they are listed rather than plotted.
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {drom.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/cities/${c.slug}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/40"
                  >
                    <span className="text-[var(--text-primary)] truncate">{c.name}</span>
                    <span className={`font-mono-data font-bold ${scoreColor(c.scores.global)}`}>{c.scores.global.toFixed(1)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">Top 10 cities on the map</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {top10.map((c, i) => (
              <li key={c.slug}>
                <Link
                  href={`/cities/${c.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 hover:border-[var(--accent)]/40"
                >
                  <span className="font-mono-data font-bold text-[var(--text-tertiary)] w-7">#{i + 1}</span>
                  <span className="flex-1 text-[var(--text-primary)] font-medium truncate">{c.name}</span>
                  <span className={`font-mono-data font-bold ${scoreColor(c.scores.global)}`}>{c.scores.global.toFixed(1)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Footer />
    </main>
  );
}
