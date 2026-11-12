import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge } from "@/components/EmojiBadge";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { CITIES_SEED } from "@/data/cities-seed";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Leaderboard · Top French cities by quality of life (2026)",
  description:
    "Every French city we cover, ranked by quality of life: a weighted score across life, transport, nature, cost, safety, culture, schools and remote work.",
  alternates: pathAlternatesEn("/leaderboard", "/leaderboard"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Leaderboard · Top French cities by quality of life",
    description:
      "Global score across eight quality-of-life axes. Every French city we cover, ranked from best to worst.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const MEDAL = ["🥇", "🥈", "🥉"];
const PLACE = ["1st", "2nd", "3rd"];

const PODIUM_AXES = [
  { key: "life", label: "Quality of life" },
  { key: "transport", label: "Transport" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Cost of living" },
] as const;

export default function EnLeaderboardPage() {
  // Rows rendered in the table; the remaining ranks go in a compact list below it.
  const TABLE_ROWS = 100;
  const sorted = [...CITIES_SEED].sort((a, b) => b.scores.global - a.scores.global);
  const podium = sorted.slice(0, 3);
  const avg = sorted.reduce((s, c) => s + c.scores.global, 0) / sorted.length;
  const max = Math.max(...sorted.map((c) => c.scores.global));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${EN_BASE}/` },
          { "@type": "ListItem", position: 2, name: "Leaderboard", item: `${EN_BASE}/leaderboard` },
        ],
      },
      {
        "@type": "ItemList",
        name: "French cities ranked by quality of life — 2026",
        description:
          "Global score weighted across eight quality-of-life axes: life, transport, nature, cost, safety, culture, schools and remote work.",
        url: `${EN_BASE}/leaderboard`,
        numberOfItems: sorted.length,
        itemListElement: sorted.slice(0, 20).map((city, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: city.name,
          url: `${EN_BASE}/cities/${city.slug}`,
          description: `Score ${city.scores.global.toFixed(1)}/10 — ${city.region ?? ""}`,
        })),
      },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <EmojiBadge emoji="🏆" tone="indigo" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Global ranking · {sorted.length} cities
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            The French city{" "}
            <span className="font-display gradient-text-anim italic pr-1">leaderboard</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Every French city we cover, ranked by a global score weighted across eight axes
            (life, transport, nature, cost, safety, culture, schools, remote work). Calibrated
            on official open data from Insee and the French Ministry of the Interior. A rank
            only tells you the order;{" "}
            <Link href="/reviews" className="font-medium text-[#4338CA] underline underline-offset-2 hover:text-[#BE185D]">
              what each axis measures, and what residents say about it
            </Link>
            , is set out separately.
          </p>
        </div>
      </section>

      {/* Podium */}
      <section className="band band-pink py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <EmojiBadge emoji="🥇" tone="pink" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Podium 2026</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {podium.map((city, i) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-[0_14px_34px_-22px_rgba(219,39,119,0.55)] ring-1 ring-[#FBCFE8] hover:ring-[#EC4899] hover:-translate-y-0.5 hover:shadow-lg transition-all text-center"
              >
                <div className={`grad-head-${i} px-4 py-2 text-xs font-bold uppercase tracking-widest`}>
                  {MEDAL[i]} {PLACE[i]} place
                </div>
                <div className="p-6 pt-5">
                  <div className={`text-3xl font-black font-mono-data mb-1 ${scoreColor(city.scores.global)}`}>
                    {city.scores.global.toFixed(1)}
                  </div>
                  <div className="text-base font-bold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
                    {city.name}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">{city.region}</div>
                  <div className="mt-4 space-y-1.5 text-left">
                    {PODIUM_AXES.map(({ key, label }) => (
                      <ScoreBar key={key} label={label} score={city.scores[key]} />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Full table */}
      <section className="band band-sky py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <EmojiBadge emoji="📊" tone="sky" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Full ranking <span className="text-[#4338CA]">— {sorted.length} cities</span>
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)] ring-1 ring-[#BAE6FD]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#EEF2FF]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#4338CA]">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#4338CA]">City</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#4338CA]">
                    Region
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#4338CA]">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E7FF]">
                {sorted.slice(0, TABLE_ROWS).map((city, i) => (
                  <tr
                    key={city.slug}
                    className={`transition-colors hover:bg-[#F5F3FF] ${i % 2 === 1 ? "bg-[#FAFBFF]" : "bg-white"}`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-bold font-mono-data ${
                          i < 3 ? `grad-head-${i}` : "bg-[#EEF2FF] text-[#4338CA]"
                        }`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/cities/${city.slug}`}
                        className="inline-block py-1.5 font-medium text-[var(--text-primary)] hover:text-[#4338CA] transition-colors"
                      >
                        {city.name}
                      </Link>
                      <div className="sm:hidden text-xs text-[var(--text-secondary)]">{city.region}</div>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-[var(--text-secondary)]">
                      {city.region}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold font-mono-data ${scoreColor(city.scores.global)}`}>
                        {city.scores.global.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Ranks beyond the table: two tags a row (li + a) instead of ten, no JS.
              The full table used to render every row — the heaviest part of the page. */}
          {sorted.length > TABLE_ROWS && (
            <details className="mt-4 rounded-2xl bg-white shadow-[0_10px_28px_-20px_rgba(8,145,178,0.6)] ring-1 ring-[#BAE6FD]">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[#4338CA]">
                Ranks {TABLE_ROWS + 1} to {sorted.length}
              </summary>
              <ol
                start={TABLE_ROWS + 1}
                className="list-inside list-decimal columns-1 gap-x-6 px-4 pb-4 text-sm text-[var(--text-tertiary)] marker:text-xs sm:columns-2 lg:columns-3 [&_a]:inline-block [&_a]:py-1 [&_a]:text-[var(--text-primary)] [&_a:hover]:text-[#4338CA]"
              >
                {sorted.slice(TABLE_ROWS).map((city) => (
                  <li key={city.slug}>
                    <Link href={`/cities/${city.slug}`}>{city.name}</Link> {city.scores.global.toFixed(1)}
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      </section>

      {/* Stats strip + links */}
      <section className="band band-lilac py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Cities ranked", value: sorted.length.toString() },
              { label: "Average score", value: avg.toFixed(1) },
              { label: "Top score", value: max.toFixed(1) },
              { label: "Axes assessed", value: "8" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl bg-white p-4 text-center shadow-[0_10px_28px_-20px_rgba(109,63,216,0.55)] ring-1 ring-[#DDD6FE]"
              >
                <div className="text-2xl font-black font-mono-data text-[#4338CA]">{value}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/rankings"
              className="inline-flex items-center rounded-full grad-head-0 px-5 py-3 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              Themed rankings →
            </Link>
            <Link
              href="/cities"
              className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE] hover:ring-[#4F46E5] hover:-translate-y-0.5 transition-all"
            >
              Browse all cities →
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE] hover:ring-[#4F46E5] hover:-translate-y-0.5 transition-all"
            >
              How scores are built →
            </Link>
          </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget locale="en" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
