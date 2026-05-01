import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";

const COVER_GRADIENTS = [
  "from-emerald-400/40 via-lime-300/30 to-amber-200/20",
  "from-pink-300/35 via-rose-200/25 to-amber-200/20",
  "from-sky-300/35 via-emerald-200/25 to-lime-200/20",
];

export function GuidesTeaser() {
  const featured = [...GUIDES]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  if (featured.length === 0) return null;
  const [hero, ...rest] = featured;

  return (
    <section className="relative border-t border-[var(--border)] py-20">
      {/* Soft gradient backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_0%,rgba(34,197,94,0.10),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
              📖 Guides pratiques
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Prenez la <span className="font-display gradient-text-anim italic">meilleure</span> décision
            </h2>
            <p className="text-[var(--text-secondary)] mt-2 max-w-lg">
              Des analyses honnêtes pour choisir où vivre — télétravail, famille, budget, retraite.
            </p>
          </div>
          <Link
            href="/guides"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Tous les guides →
          </Link>
        </div>

        {/* Bento layout: hero + two stacked */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Hero card — large */}
          <Link
            href={`/guides/${hero.slug}`}
            className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] hover:shadow-2xl hover:shadow-[var(--accent)]/10 transition-all min-h-[320px] flex flex-col"
          >
            {/* Animated cover */}
            <div className={`relative h-48 bg-gradient-to-br ${COVER_GRADIENTS[0]} overflow-hidden`}>
              <div className="absolute inset-0 bg-aurora opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="grain grain-soft" style={{ opacity: 0.2 }} />
              <div className="absolute top-6 left-6 text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-500">
                {hero.emoji}
              </div>
              <div className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                ★ À la une
              </div>
              <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-lg group-hover:bg-[var(--accent)] transition-colors">
                <ArrowUpRight className="h-5 w-5 text-[var(--accent)] group-hover:text-white transition-colors" />
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2 text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                <Clock className="h-3 w-3" />
                {hero.readMinutes} min
                <span>·</span>
                <span>{GUIDE_CATEGORIES.find((c) => c.id === hero.category)?.label ?? hero.category}</span>
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight mb-2">
                {hero.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{hero.intro}</p>
            </div>
          </Link>

          {/* Two smaller cards stacked */}
          <div className="grid gap-5">
            {rest.map((guide, i) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] hover:shadow-xl hover:shadow-[var(--accent)]/10 transition-all flex"
              >
                <div className={`relative w-32 sm:w-40 flex-shrink-0 bg-gradient-to-br ${COVER_GRADIENTS[(i + 1) % COVER_GRADIENTS.length]} overflow-hidden`}>
                  <div className="absolute inset-0 bg-aurora opacity-50" />
                  <div className="grain grain-soft" style={{ opacity: 0.18 }} />
                  <div className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow group-hover:scale-110 transition-transform duration-500">
                    {guide.emoji}
                  </div>
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                      <Clock className="h-3 w-3" />
                      {guide.readMinutes} min
                      <span>·</span>
                      <span className="truncate">{GUIDE_CATEGORIES.find((c) => c.id === guide.category)?.label ?? guide.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-1.5 line-clamp-2">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{guide.intro}</p>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-[var(--accent)] group-hover:gap-2 transition-all">
                    Lire <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link
            href="/guides"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Voir tous les guides →
          </Link>
        </div>
      </div>
    </section>
  );
}
