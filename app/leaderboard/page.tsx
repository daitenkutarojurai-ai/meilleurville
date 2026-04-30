import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { CITIES_SEED } from "@/data/cities-seed";

export const metadata: Metadata = {
  title: "Leaderboard — Top villes France par qualité de vie | MeilleurVille",
  description:
    "Le classement global des meilleures villes françaises par qualité de vie, agrégé sur 9 critères : nature, transport, coût, sécurité, culture, écoles.",
  openGraph: {
    title: "Leaderboard — Top villes France par qualité de vie",
    description: "Score global agrégé sur 9 critères de qualité de vie. Classement des meilleures villes françaises.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";

const MEDAL = ["🥇", "🥈", "🥉"];
const sorted = [...CITIES_SEED].sort((a, b) => b.scores.global - a.scores.global);

function scoreClass(s: number) {
  if (s >= 8) return "text-emerald-400";
  if (s >= 6) return "text-amber-400";
  return "text-red-400";
}

export default function LeaderboardPage() {
  const podium = sorted.slice(0, 3);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Classement des meilleures villes françaises par qualité de vie 2025",
    description: "Score global agrégé sur 9 critères : nature, transport, coût de la vie, sécurité, culture, écoles, qualité de vie, télétravail.",
    url: `${BASE_URL}/leaderboard`,
    numberOfItems: sorted.length,
    itemListElement: sorted.slice(0, 20).map((city, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: city.name,
      url: `${BASE_URL}/villes/${city.slug}`,
      description: `Score ${city.scores.global.toFixed(1)}/10 — ${city.region}`,
    })),
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Classement global</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Leaderboard des villes françaises
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Score global agrégé sur 9 critères de qualité de vie, mis à jour trimestriellement.
            Chaque critère est noté sur 10 ; le score global est une moyenne pondérée.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12">
        {/* Podium */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-5">
            Podium 2025
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {podium.map((city, i) => (
              <Link
                key={city.slug}
                href={`/villes/${city.slug}`}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--accent)]/5 transition-all p-6 text-center"
              >
                <div className="text-4xl mb-2">{MEDAL[i]}</div>
                <div className={`text-3xl font-black font-mono-data mb-1 ${scoreClass(city.scores.global)}`}>
                  {city.scores.global.toFixed(1)}
                </div>
                <div className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {city.name}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">{city.region}</div>
                <div className="mt-4 space-y-1.5">
                  {([ { key: "life" as const, label: "Qualité de vie" }, { key: "transport" as const, label: "Transport" }, { key: "nature" as const, label: "Nature" }, { key: "cost" as const, label: "Coût de vie" } ]).map(({ key, label }) => (
                    <div key={key} className="flex-1">
                      <ScoreBar label={label} score={city.scores[key]} />
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Full table — interactive with region filter + sort */}
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Classement complet — {sorted.length} villes
          </h2>
          <LeaderboardTable />
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Villes classées", value: sorted.length.toString() },
            { label: "Score moyen", value: (sorted.reduce((s, c) => s + c.scores.global, 0) / sorted.length).toFixed(1) },
            { label: "Score max", value: Math.max(...sorted.map((c) => c.scores.global)).toFixed(1) },
            { label: "Critères évalués", value: "9" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-center">
              <div className="text-2xl font-black font-mono-data text-[var(--accent)]">{value}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/classements"
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/30 transition-colors"
          >
            Classements thématiques →
          </Link>
          <Link
            href="/comparer"
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/30 transition-colors"
          >
            Comparer des villes →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
