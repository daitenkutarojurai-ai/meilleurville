import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  OWNER_RANKINGS,
  rankByOwnerScore,
  type OwnerRankingDef,
} from "@/lib/owner-rankings";
import { ownerScoreColor } from "@/lib/owner-scores";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export function OwnerRankingPage({ ranking }: { ranking: OwnerRankingDef }) {
  const top = rankByOwnerScore(ranking.scoreKey, 50);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Classements", path: "/classements" },
    { name: ranking.label, path: `/classements/${ranking.slug}` },
  ]);
  const otherRankings = OWNER_RANKINGS.filter((r) => r.slug !== ranking.slug);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: ranking.metaTitle,
            description: ranking.metaDescription,
            itemListElement: top.slice(0, 10).map((row, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: row.city.name,
              url: `${BASE_URL}/villes/${row.city.slug}`,
            })),
          }),
        }}
      />
      <Navbar />

      {/* Header */}
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/classements" className="hover:underline">
              ← Classements
            </Link>
          </Badge>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl" aria-hidden>
              {ranking.emoji}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              {ranking.label}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">{ranking.intro}</p>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
            <span className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wider mr-2">
              Estimation
            </span>
            Score calculé à partir des 352 villes du site — voir la{" "}
            <Link href="/methode" className="underline">
              méthodologie détaillée
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {/* Top 50 */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Top 50 villes — {ranking.label}
          </h2>
          <ol className="space-y-1.5">
            {top.map((row, i) => (
              <li key={row.city.slug}>
                <Link
                  href={`/villes/${row.city.slug}`}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 hover:border-[var(--accent)]/40 hover:shadow-sm transition-all"
                >
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                      #{i + 1}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)] truncate">
                      {row.city.name}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] truncate">
                      {row.city.region}
                    </span>
                  </span>
                  <span
                    className={`font-mono-data font-bold ${ownerScoreColor(row.score)} flex-shrink-0`}
                  >
                    {row.score.toFixed(1)}
                    <span className="text-xs text-[var(--text-tertiary)]"> /10</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Methodology */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Méthodologie
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {ranking.methodology}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Quand la source réelle (feeds officiels) remplacera le proxy v0, ce classement
            se recalcule automatiquement — seul `lib/owner-scores.ts` change.
          </p>
        </Card>

        {/* Other owner rankings */}
        <section>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Autres classements propriétaires
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {otherRankings.map((r) => (
              <Link
                key={r.slug}
                href={`/classements/${r.slug}`}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/40 transition-colors"
              >
                <span className="text-xl" aria-hidden>
                  {r.emoji}
                </span>
                <span className="text-[var(--text-primary)]">{r.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Voir aussi les{" "}
          <Link href="/classements" className="underline">
            classements officiels du site
          </Link>{" "}
          (basés sur les 8 axes du seed) ou le{" "}
          <Link href="/quiz-compatibilite" className="underline">
            quiz de compatibilité
          </Link>{" "}
          qui combine tous les scores.
        </p>
      </div>

      <Footer />
    </main>
  );
}
