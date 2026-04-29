import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { CITIES_SEED } from "@/data/cities-seed";

export const metadata: Metadata = {
  title: "Leaderboard — Top villes France par qualité de vie | MeilleurVille",
  description:
    "Le classement global des meilleures villes françaises par qualité de vie, agrégé sur 9 critères : nature, transport, coût, sécurité, culture, écoles.",
};

const MEDAL = ["🥇", "🥈", "🥉"];

const sorted = [...CITIES_SEED].sort((a, b) => b.scores.global - a.scores.global);

const CRITERIA = [
  { key: "life" as const, label: "Qualité de vie" },
  { key: "transport" as const, label: "Transport" },
  { key: "nature" as const, label: "Nature" },
  { key: "cost" as const, label: "Coût de vie" },
  { key: "safety" as const, label: "Sécurité" },
  { key: "culture" as const, label: "Culture" },
  { key: "remoteWork" as const, label: "Télétravail" },
  { key: "schools" as const, label: "Écoles" },
];

function scoreClass(s: number) {
  if (s >= 8) return "text-emerald-400";
  if (s >= 6) return "text-amber-400";
  return "text-red-400";
}

export default function LeaderboardPage() {
  const podium = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <main className="min-h-screen">
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
                  {CRITERIA.slice(0, 4).map(({ key, label }) => (
                    <div key={key} className="flex-1">
                      <ScoreBar label={label} score={city.scores[key]} />
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Full table */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-6">
            Classement complet — {sorted.length} villes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3 pr-4 w-10">#</th>
                  <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3 pr-4">Ville</th>
                  <th className="text-right text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3 pr-4">Global</th>
                  {CRITERIA.map(({ key, label }) => (
                    <th key={key} className="text-right text-xs uppercase tracking-wide text-[var(--text-tertiary)] pb-3 px-2 hidden md:table-cell">
                      {label.split(" ")[0]}
                    </th>
                  ))}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sorted.map((city, i) => (
                  <tr
                    key={city.slug}
                    className="hover:bg-[var(--bg-elevated)] transition-colors group"
                  >
                    <td className="py-3 pr-4 text-[var(--text-tertiary)] font-mono text-xs">
                      {i < 3 ? MEDAL[i] : `${i + 1}`}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-[var(--text-primary)]">{city.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{city.region}</div>
                    </td>
                    <td className={`py-3 pr-4 text-right font-bold font-mono-data ${scoreClass(city.scores.global)}`}>
                      {city.scores.global.toFixed(1)}
                    </td>
                    {CRITERIA.map(({ key }) => (
                      <td key={key} className={`py-3 px-2 text-right font-mono-data text-xs hidden md:table-cell ${scoreClass(city.scores[key])}`}>
                        {city.scores[key].toFixed(1)}
                      </td>
                    ))}
                    <td className="py-3 pl-2">
                      <Link
                        href={`/villes/${city.slug}`}
                        className="text-xs text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                      >
                        Voir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

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
