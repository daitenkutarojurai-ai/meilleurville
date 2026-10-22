import Link from "@/components/AppLink";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";
import { EN_GUIDES, EN_GUIDE_CATEGORIES } from "@/data/guides-en";

// Guides are reading sheets of the same survey map as the rankings: a topo
// cover with an enamel-plaque book tile and a mono sheet reference. No pastel
// emerald/lime/rose covers (score-tier colours) and no decorative emojis —
// CLAUDE.md « Carte & plaque ».
const pad2 = (n: number) => String(n).padStart(2, "0");

export function GuidesTeaser({ locale = "fr" }: { locale?: "fr" | "en" } = {}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  // La home EN mettait en avant les trois derniers guides FR : titres français
  // et URLs qui n'existent pas sur bestcitiesinfrance.com.
  const corpus: ReadonlyArray<{
    slug: string; title: string; intro: string;
    readMinutes: number; category: string; updatedAt: string;
  }> = locale === "en" ? EN_GUIDES : GUIDES;
  const categoryLabel = (id: string) =>
    locale === "en"
      ? EN_GUIDE_CATEGORIES[id as keyof typeof EN_GUIDE_CATEGORIES] ?? id
      : GUIDE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
  const featured = [...corpus]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  if (featured.length === 0) return null;
  const [hero, ...rest] = featured;

  return (
    <section id="guides" className="band band-sky py-8 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono-data text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              {L(
                `Guides pratiques · ${corpus.length.toLocaleString("fr-FR")} fiches`,
                `Practical guides · ${corpus.length.toLocaleString("en-GB")} sheets`,
              )}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              {locale === "en" ? (
                <>
                  Make the <span className="font-display italic text-[var(--accent)]">smartest</span> call
                </>
              ) : (
                <>
                  Prenez la <span className="font-display italic text-[var(--accent)]">meilleure</span> décision
                </>
              )}
            </h2>
            <p className="text-[var(--text-secondary)] mt-2 max-w-lg">
              {L(
                "Des analyses honnêtes pour choisir où vivre — télétravail, famille, budget, retraite.",
                "Honest breakdowns to decide where to live — remote work, family, budget, retirement.",
              )}
            </p>
          </div>
          <Link
            href="/guides"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            {L("Tous les guides", "All guides")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Hero sheet + two stacked sheets */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Link
            href={`/guides/${hero.slug}`}
            className="group flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--accent)]"
          >
            <div className="topo-bg relative flex h-44 items-end justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg-canvas)] p-5">
              <span className="plaque !p-0 h-14 w-14 shrink-0 justify-center" aria-hidden="true">
                <BookOpen className="h-7 w-7" strokeWidth={1.75} />
              </span>
              <span className="font-mono-data text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                {L("À la une · Fiche 01 / 03", "Featured · Sheet 01 / 03")}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <div className="mb-2 flex items-center gap-2 font-mono-data text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {hero.readMinutes} min
                <span aria-hidden="true">·</span>
                <span>{categoryLabel(hero.category)}</span>
              </div>
              <h3 className="mb-2 text-2xl font-bold leading-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                {hero.title}
              </h3>
              <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">{hero.intro}</p>
              <div className="mt-4 flex items-center gap-1 border-t border-dashed border-[var(--border)] pt-3 text-sm font-semibold text-[var(--accent)]">
                {L("Lire le guide", "Read the guide")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </div>
            </div>
          </Link>

          <div className="grid gap-4">
            {rest.map((guide, i) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--accent)]"
              >
                <div className="topo-bg flex w-24 shrink-0 flex-col items-center justify-center gap-2 border-r border-[var(--border)] bg-[var(--bg-canvas)] sm:w-32">
                  <span className="plaque !p-0 h-10 w-10 justify-center" aria-hidden="true">
                    <BookOpen className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                    {pad2(i + 2)} / 03
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
                  <div>
                    <div className="mb-1.5 flex items-center gap-2 font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                      <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {guide.readMinutes} min
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{categoryLabel(guide.category)}</span>
                    </div>
                    <h3 className="mb-1.5 line-clamp-2 text-base font-bold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                      {guide.title}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">{guide.intro}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                    {L("Lire", "Read")}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
