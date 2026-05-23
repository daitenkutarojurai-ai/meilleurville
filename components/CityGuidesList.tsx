import Link from "next/link";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";

/**
 * Server component — given a city slug, renders the list of every guide
 * that lists this city in `relatedCities`. Surfaces reverse navigation
 * (city → guides) which the standalone guide pages don't provide.
 *
 * Returns null when the city has fewer than 2 guides — not worth a section.
 */
export function CityGuidesList({ slug, name }: { slug: string; name: string }) {
  const matches = GUIDES.filter((g) => g.relatedCities.includes(slug)).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (matches.length < 2) return null;

  return (
    <section className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-1">
              Guides MaVilleIdeal
            </p>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {matches.length} guides qui parlent de {name}
            </h2>
          </div>
          <Link
            href="/guides"
            className="text-sm text-[var(--accent)] hover:underline whitespace-nowrap"
          >
            Tous les guides →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.slice(0, 12).map((g) => {
            const cat = GUIDE_CATEGORIES.find((c) => c.id === g.category);
            return (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4 hover:border-[var(--accent)] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{g.emoji}</span>
                  {cat && (
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${cat.color}`}>
                      {cat.label}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-3">
                  {g.title}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">{g.readMinutes} min</p>
              </Link>
            );
          })}
        </div>

        {matches.length > 12 && (
          <p className="text-xs text-[var(--text-tertiary)] mt-5 text-center">
            +{matches.length - 12} autres guides citent {name}
          </p>
        )}
      </div>
    </section>
  );
}
