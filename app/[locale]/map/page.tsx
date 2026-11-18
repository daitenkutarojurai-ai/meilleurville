import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { MAP_CITIES } from "@/lib/cities-light";
import { scoreColor, scoreHex } from "@/lib/utils";
import { FranceHeatmap, type DeptBubble } from "@/components/FranceHeatmap";
import { deptToSlug } from "@/lib/dept-slug";
import { pathAlternatesEn } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";
import { EmojiBadge } from "@/components/EmojiBadge";

export const metadata: Metadata = {
  title: "Map of French cities — quality of life visualised",
  description: `Interactive-style map of ${CITIES_COUNT}+ French cities. Each dot is coloured by its quality-of-life score, from red (weak) to emerald (exceptional).`,
  alternates: pathAlternatesEn("/carte", "/map"),
};

// Metropolitan bounding box — same as components/FranceHeatmap.tsx.
// DROM cities fall outside this box and are listed separately below.
const LNG_MIN = -6, LNG_MAX = 10, LAT_MIN = 40, LAT_MAX = 52;

// Per-department centroid + per-axis average scores (metropolitan only) —
// computed at build so the client bundle stays seed-free.
const DEPT_BUBBLES: DeptBubble[] = (() => {
  const groups: Record<string, { sumLng: number; sumLat: number; sums: Record<string, number>; n: number }> = {};
  for (const c of CITIES_SEED) {
    if (!(c.longitude >= LNG_MIN && c.longitude <= LNG_MAX && c.latitude >= LAT_MIN && c.latitude <= LAT_MAX)) continue;
    const g = (groups[c.department] ??= { sumLng: 0, sumLat: 0, sums: {}, n: 0 });
    g.sumLng += c.longitude;
    g.sumLat += c.latitude;
    for (const [k, v] of Object.entries(c.scores)) g.sums[k] = (g.sums[k] ?? 0) + v;
    g.n += 1;
  }
  return Object.entries(groups).map(([dept, g]) => ({
    dept,
    slug: deptToSlug(dept),
    longitude: g.sumLng / g.n,
    latitude: g.sumLat / g.n,
    n: g.n,
    scores: Object.fromEntries(
      Object.entries(g.sums).map(([k, v]) => [k, Math.round((v / g.n) * 100) / 100])
    ) as DeptBubble["scores"],
  }));
})();

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
      <section className="relative overflow-hidden bg-aurora py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <EmojiBadge emoji="📍" tone="indigo" size="lg" className="shrink-0 shadow-[0_12px_28px_-12px_rgba(79,70,229,0.6)]" />
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight gradient-text mb-3">
                Map of French cities
              </h1>
              <p className="text-[var(--text-secondary)] max-w-2xl">
                {CITIES_COUNT} cities placed by geographic position. Each dot is coloured by its overall quality-of-life score. Hover a dot to see the city; click to open its profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band band-sky">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          {/* Full locale-aware heatmap: France mainland + Corsica outline, aurora
              backdrop, score legend and per-axis filters, EN /cities links. */}
          <FranceHeatmap locale="en" showRegionToggle cities={MAP_CITIES} departments={DEPT_BUBBLES} />
        </div>
      </section>

      {drom.length > 0 && (
        <section className="band band-pink">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
            <div className="flex items-center gap-3 mb-3">
              <EmojiBadge emoji="🏝️" tone="pink" size="sm" />
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Overseas departments (DROM)</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              These cities sit outside the mainland bounding box, so they are listed rather than plotted.
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {drom.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/cities/${c.slug}`}
                    className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2.5 text-sm shadow-[0_6px_18px_-12px_rgba(219,39,119,0.55)] ring-1 ring-[#FBCFE8] transition hover:ring-[var(--accent-pink)]/60 hover:-translate-y-0.5"
                  >
                    <span className="text-[var(--text-primary)] font-medium truncate">{c.name}</span>
                    <ScorePill score={c.scores.global} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="band band-aqua">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-5">
            <EmojiBadge emoji="🏆" tone="aqua" size="sm" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Top 10 cities on the map</h2>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {top10.map((c, i) => (
              <li key={c.slug}>
                <Link
                  href={`/cities/${c.slug}`}
                  className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-[0_6px_18px_-12px_rgba(8,145,178,0.6)] ring-1 ring-[#A5F3FC] transition hover:ring-[var(--accent-cyan)]/60 hover:-translate-y-0.5"
                >
                  <span
                    className={`${i < 3 ? "grad-head-1" : "grad-head-0"} flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono-data text-sm font-bold`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[var(--text-primary)] font-medium truncate">{c.name}</span>
                  <ScorePill score={c.scores.global} />
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

/** Score pill: tier dot + one-decimal score, tier colour kept for the number. */
function ScorePill({ score }: { score: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--bg-canvas)] px-2 py-0.5 ring-1 ring-[var(--border)]">
      <span className="h-2 w-2 rounded-full" style={{ background: scoreHex(score) }} aria-hidden />
      <span className={`font-mono-data text-sm font-bold ${scoreColor(score)}`}>{score.toFixed(1)}</span>
    </span>
  );
}
