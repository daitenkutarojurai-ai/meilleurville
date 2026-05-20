import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { CITIES_SEED } from "@/data/cities-seed";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Leaderboard · Top French cities by quality of life (2026)",
  description:
    "The global ranking of every French city we cover, by quality of life. A weighted score across eight axes: life, transport, nature, cost, safety, culture, schools and remote work.",
  alternates: { canonical: `${EN_BASE}/leaderboard` },
  openGraph: {
    title: "Leaderboard · Top French cities by quality of life",
    description:
      "Global score across eight quality-of-life axes. Every French city we cover, ranked from best to worst.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const MEDAL = ["🥇", "🥈", "🥉"];

const PODIUM_AXES = [
  { key: "life", label: "Quality of life" },
  { key: "transport", label: "Transport" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Cost of living" },
] as const;

export default function EnLeaderboardPage() {
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

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-10 text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
          Global ranking · {sorted.length} cities
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          The French city leaderboard
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          Every French city we cover, ranked by a global score weighted across eight axes
          (life, transport, nature, cost, safety, culture, schools, remote work). Calibrated
          on official open data from Insee and the French Ministry of the Interior.
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-12">
        {/* Podium */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-5">
            Podium 2026
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {podium.map((city, i) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-lg transition-all p-6 text-center"
              >
                <div className="text-4xl mb-2">{MEDAL[i]}</div>
                <div className={`text-3xl font-black font-mono-data mb-1 ${scoreColor(city.scores.global)}`}>
                  {city.scores.global.toFixed(1)}
                </div>
                <div className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {city.name}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">{city.region}</div>
                <div className="mt-4 space-y-1.5 text-left">
                  {PODIUM_AXES.map(({ key, label }) => (
                    <ScoreBar key={key} label={label} score={city.scores[key]} />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Full table */}
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Full ranking — {sorted.length} cities
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)]">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)]">City</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)]">
                    Region
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)]">Score</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((city, i) => (
                  <tr
                    key={city.slug}
                    className={`border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--bg-elevated)] ${
                      i < 3 ? "bg-[var(--bg-surface)]" : "bg-[var(--bg-canvas)]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-bold font-mono-data text-[var(--text-secondary)]">{i + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/cities/${city.slug}`}
                        className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
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
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Cities ranked", value: sorted.length.toString() },
            { label: "Average score", value: avg.toFixed(1) },
            { label: "Top score", value: max.toFixed(1) },
            { label: "Axes assessed", value: "8" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-center"
            >
              <div className="text-2xl font-black font-mono-data text-[var(--accent)]">{value}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/rankings"
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/30 transition-colors"
          >
            Themed rankings →
          </Link>
          <Link
            href="/cities"
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/30 transition-colors"
          >
            Browse all cities →
          </Link>
          <Link
            href="/methodology"
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/30 transition-colors"
          >
            How scores are built →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
