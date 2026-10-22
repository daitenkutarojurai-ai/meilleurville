import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CommentSection } from "@/components/CommentSection";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
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

  // Même numérotation « Feuille NN » que les vignettes du hub /red-flags.
  const sheetIndex = RED_FLAG_THEMES.findIndex((t) => t.slug === theme.slug) + 1;

  return (
    <main id="main-content" className="min-h-screen">
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
      <Navbar />

      {/* Header — papier topo voilé, même grammaire que le hub /red-flags. */}
      <section className="band band-pink border-b border-[var(--border)]">
        <div className="pt-20 pb-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono-data text-xs font-semibold uppercase tracking-widest">
              <Link
                href="/red-flags"
                className="inline-flex items-center gap-1.5 border-b border-[var(--accent-pink)]/40 pb-1 text-[var(--accent-pink)] hover:border-[var(--accent-pink)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Red Flags
              </Link>
              {sheetIndex > 0 && (
                <span className="text-[var(--text-tertiary)]">
                  Feuille {String(sheetIndex).padStart(2, "0")} / {RED_FLAG_THEMES.length}
                </span>
              )}
            </div>
            <EmojiBadge emoji={theme.emoji} tone={toneFor(Math.max(sheetIndex - 1, 0))} size="xl" className="mb-5" />
            <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.08]">
              {theme.title}
            </h1>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl">
              {theme.intro}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-10">
        {/* La réalité — encart de légende, filet brique. */}
        <section className="rounded-md border border-[var(--border)] border-l-4 border-l-[var(--accent-pink)] bg-[var(--bg-surface)] p-5">
          <h2 className="mb-2 font-mono-data text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-pink)]">
            Ce que disent les chiffres
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {theme.reality}
          </p>
        </section>

        {/* Classement */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            {rows.length === 0
              ? "Les villes les plus concernées"
              : `Les ${rows.length} villes les plus concernées`}
          </h2>
          {/* Deux nombres sur /10 se côtoient dans chaque ligne, en sens
              opposés : la gravité (10 = pire, palette rouge par niveau) et le
              score global de la ville (10 = bon, palette scoreColor). Sans
              cette légende, rien ne dit au lecteur lequel se lit dans quel
              sens. Cf. CLAUDE.md § Score convention, règle 3. */}
          {rows.length > 0 && (
            <p className="text-xs text-[var(--text-tertiary)] mb-4">
              Gravité sur ce thème : <strong>10 = le plus grave</strong>, 0 =
              non concerné. Le score global affiché à côté suit la convention
              inverse du site — 10 = meilleure ville.
            </p>
          )}
          {rows.length === 0 ? (
            <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <p className="text-sm text-[var(--text-secondary)]">
                Aucune ville ne dépasse les seuils sur ce thème dans le dataset
                actuel. Si vous pensez qu&apos;une ville devrait y figurer, signalez-le
                via la page contact.
              </p>
            </div>
          ) : (
            /* Registre à filets : une ligne par ville, numéro en mono. */
            <ol className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] divide-y divide-dashed divide-[var(--border)]">
              {rows.map((row, i) => (
                <li key={row.city.slug} className="flex items-start gap-3 sm:gap-4 p-4">
                  <span
                    className="flex-shrink-0 w-10 pt-1 text-right font-mono-data text-xs font-semibold tracking-wider text-[var(--text-tertiary)]"
                    aria-label={`Rang ${i + 1}`}
                  >
                    N°&nbsp;{String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
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
                        className={`ml-auto inline-flex items-center rounded-sm border px-2 py-0.5 font-mono-data text-[11px] font-bold ${severityColor(row.severity)}`}
                        aria-label={`Gravité ${row.severity} sur 10, 10 étant le plus grave`}
                      >
                        {row.severity.toFixed(1)}/10
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{row.reason}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <Link
                        href={`/villes/${row.city.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] underline decoration-[var(--accent-pink)]/50 underline-offset-2 hover:decoration-[var(--accent-pink)]"
                      >
                        Fiche {row.city.name} <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        Score global : <span className={scoreColor(row.city.scores.global)}>{row.city.scores.global.toFixed(1)}/10</span>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Methodology — note de bas de carte, cadre pointillé. */}
        <section className="rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-canvas)] p-5">
          <h3 className="mb-2 font-mono-data text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
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
        </section>

        {/* Other themes — vignettes « Feuille NN », comme sur le hub. */}
        <section>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Autres red flags thématiques
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:auto-rows-fr">
            {RED_FLAG_THEMES.map((t, i) =>
              t.slug === theme.slug ? null : (
                <Link
                  key={t.slug}
                  href={`/red-flags/${t.slug}`}
                  className="group h-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--accent-pink)] transition-all p-4 flex flex-col gap-2"
                >
                  <span className="flex items-center gap-3">
                    <EmojiBadge emoji={t.emoji} tone={toneFor(i)} size="sm" />
                    <span className="font-mono-data text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-pink)]">
                      N° {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-pink)] transition-colors">
                    {t.title}
                  </span>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {t.intro.slice(0, 110)}…
                  </p>
                </Link>
              ),
            )}
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
