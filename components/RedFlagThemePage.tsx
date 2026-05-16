import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CommentSection } from "@/components/CommentSection";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import type { RedFlagTheme } from "@/lib/red-flag-themes";
import { RED_FLAG_THEMES } from "@/lib/red-flag-themes";

function severityColor(severity: number): string {
  if (severity >= 8) return "text-red-700 bg-red-100 border-red-300";
  if (severity >= 6) return "text-orange-700 bg-orange-100 border-orange-300";
  if (severity >= 4) return "text-amber-700 bg-amber-100 border-amber-300";
  return "text-yellow-700 bg-yellow-100 border-yellow-300";
}

export function RedFlagThemePage({ theme }: { theme: RedFlagTheme }) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
  const rows = theme.rank();
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Red Flags", path: "/red-flags" },
    { name: theme.title, path: `/red-flags/${theme.slug}` },
  ]);

  const otherThemes = RED_FLAG_THEMES.filter((t) => t.slug !== theme.slug);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: theme.title,
            description: theme.metaDescription,
            itemListElement: rows.slice(0, 10).map((row, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: row.city.name,
              url: `${BASE_URL}/villes/${row.city.slug}`,
            })),
          }),
        }}
      />
      <AmbientBackground />
      <Navbar />

      {/* Header */}
      <section className="relative pt-20 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="default" className="mb-3">
            <Link href="/red-flags" className="hover:underline">
              ← Red Flags
            </Link>
          </Badge>
          <div className="text-5xl mb-3" aria-hidden>
            {theme.emoji}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
            {theme.title}
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            {theme.intro}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
        {/* La réalité */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
            Ce que disent les chiffres
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {theme.reality}
          </p>
        </Card>

        {/* Classement */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Les {rows.length} villes les plus concernées
          </h2>
          {rows.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--text-secondary)]">
                Aucune ville ne dépasse les seuils sur ce thème dans le dataset
                actuel. Si vous pensez qu&apos;une ville devrait y figurer, signalez-le
                via la page contact.
              </p>
            </Card>
          ) : (
            <ol className="space-y-3">
              {rows.map((row, i) => (
                <li key={row.city.slug}>
                  <Card>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 text-center">
                        <span className="font-mono-data text-2xl font-bold text-[var(--text-tertiary)]">
                          #{i + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <Link
                            href={`/villes/${row.city.slug}`}
                            className="text-lg font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                          >
                            {row.city.name}
                          </Link>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {row.city.region}
                          </span>
                          <span
                            className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${severityColor(row.severity)}`}
                            aria-label={`Severity ${row.severity} sur 10`}
                          >
                            {row.severity.toFixed(1)}/10
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">{row.reason}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            href={`/villes/${row.city.slug}`}
                            className="text-xs underline text-[var(--accent)] hover:opacity-80"
                          >
                            Fiche {row.city.name} →
                          </Link>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            Score global : <span className={scoreColor(row.city.scores.global)}>{row.city.scores.global.toFixed(1)}/10</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Methodology */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Méthodologie
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {theme.methodology}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Les classements évoluent avec les scores propriétaires (v0 actuellement,
            dérivés du seed officiel — voir{" "}
            <Link href="/methode" className="underline">
              page méthode
            </Link>
            ).
          </p>
        </Card>

        {/* Other themes */}
        <section>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Autres red flags thématiques
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-fr">
            {otherThemes.map((t) => (
              <Link key={t.slug} href={`/red-flags/${t.slug}`} className="block h-full">
                <Card className="h-full hover:border-[var(--accent)]/40 cursor-pointer transition-colors">
                  <div className="flex items-start gap-3 h-full">
                    <span className="text-2xl flex-shrink-0" aria-hidden>
                      {t.emoji}
                    </span>
                    <div className="flex flex-col h-full">
                      <p className="font-semibold text-[var(--text-primary)]">{t.title}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {t.intro.slice(0, 110)}…
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <CommentSection
          topic={`red-flag-theme:${theme.slug}`}
          title="Un témoignage à partager ?"
          emptyHint="Vous avez vécu dans une des villes du classement ? Ajoutez du contexte concret."
        />
      </div>

      <Footer />
    </main>
  );
}
