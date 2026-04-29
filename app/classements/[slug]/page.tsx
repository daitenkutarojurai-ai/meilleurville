import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RANKING_META, getRankedCities, type RankingSlug } from "@/lib/rankings";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CheckCircle, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(RANKING_META).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!(slug in RANKING_META)) return {};
  const meta = RANKING_META[slug as RankingSlug];
  return {
    title: meta.headline,
    description: meta.description,
    openGraph: { title: meta.headline, description: meta.description },
  };
}

export default async function RankingPage({ params }: Props) {
  const { slug } = await params;
  if (!(slug in RANKING_META)) notFound();

  const meta = RANKING_META[slug as RankingSlug];
  const ranked = getRankedCities(slug as RankingSlug);
  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section
        className={`border-b border-[var(--border)] ${meta.bgColor} py-14`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-3 text-4xl">{meta.emoji}</div>
          <Badge variant="accent" className="mb-3">
            Classement 2025
          </Badge>
          <h1 className="mb-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            {meta.headline}
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            {meta.description}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 lg:grid-cols-3">
        {/* Main list */}
        <div className="lg:col-span-2 space-y-8">
          {/* Podium */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
              Top 3
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {top3.map((entry) => (
                <CityCard
                  key={entry.city.slug}
                  city={entry.city}
                  rank={entry.rank}
                  delta={entry.delta}
                />
              ))}
            </div>
          </div>

          {/* Full table */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
              Classement complet
            </h2>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)]">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)]">
                      Ville
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)]">
                      Score
                    </th>
                    <th className="hidden sm:table-cell px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)]">
                      Global
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--text-secondary)]">
                      Évol.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((entry, i) => (
                    <tr
                      key={entry.city.slug}
                      className={`border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--bg-elevated)] ${
                        i < 3 ? "bg-[var(--bg-surface)]" : "bg-[var(--bg-canvas)]"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-bold font-mono-data text-[var(--text-secondary)]">
                          {entry.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/villes/${entry.city.slug}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                        >
                          {entry.city.name}
                        </a>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {entry.city.region}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-bold font-mono-data ${meta.color}`}
                        >
                          {entry.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-right">
                        <span className="text-xs font-mono-data text-[var(--text-secondary)]">
                          {entry.city.scores.global.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {entry.delta === 0 ? (
                          <Minus className="ml-auto h-3.5 w-3.5 text-[var(--text-secondary)]" />
                        ) : entry.delta > 0 ? (
                          <div className="flex items-center justify-end gap-0.5 text-emerald-400 text-xs">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {entry.delta}
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-0.5 text-red-400 text-xs">
                            <TrendingDown className="h-3.5 w-3.5" />
                            {Math.abs(entry.delta)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Methodology */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Méthodologie
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
              {meta.methodology}
            </p>
            <div className="space-y-2">
              {meta.why.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 text-xs text-[var(--text-secondary)]"
                >
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
          </Card>

          {/* Weights */}
          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
              Poids des critères
            </h3>
            <div className="space-y-3">
              {Object.entries(meta.weights)
                .sort((a, b) => b[1] - a[1])
                .map(([key, w]) => {
                  const maxW = Math.max(...Object.values(meta.weights));
                  const pct = (w / maxW) * 100;
                  const labels: Record<string, string> = {
                    remoteWork: "Télétravail",
                    life: "Qualité vie",
                    cost: "Coût de vie",
                    transport: "Transport",
                    culture: "Culture",
                    schools: "Écoles",
                    safety: "Sécurité",
                    nature: "Nature",
                  };
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-secondary)]">
                          {labels[key] ?? key}
                        </span>
                        <span className="text-[var(--text-secondary)]">
                          ×{w}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${meta.color.replace("text-", "bg-")}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* CTA */}
          <Card className={`${meta.bgColor} border ${meta.borderColor}`}>
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              Vous souhaitez une analyse personnalisée ?
            </p>
            <a
              href="/quiz"
              className={`inline-flex items-center gap-1.5 text-sm font-semibold ${meta.color} hover:underline`}
            >
              Lancer le quiz IA →
            </a>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}
