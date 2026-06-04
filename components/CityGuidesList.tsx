import Link from "next/link";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";
import { EN_GUIDES, EN_GUIDE_CATEGORIES } from "@/data/guides-en";

/**
 * Server component — given a city slug, renders the list of every guide
 * that lists this city in `relatedCities`. Surfaces reverse navigation
 * (city → guides) which the standalone guide pages don't provide.
 *
 * Returns null when the city has fewer than 2 guides — not worth a section.
 *
 * locale defaults to "fr" (FR output byte-identical). With locale="en" it
 * reads EN_GUIDES + EN copy so bestcitiesinfrance.com city pages surface
 * their own native guides.
 */
type GuideRow = {
  slug: string;
  title: string;
  emoji: string;
  readMinutes: number;
  category: string;
  relatedCities: string[];
  updatedAt: string;
};

export function CityGuidesList({
  slug,
  name,
  locale = "fr",
}: {
  slug: string;
  name: string;
  locale?: "fr" | "en";
}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const source: GuideRow[] = locale === "en" ? EN_GUIDES : GUIDES;

  const matches = source
    .filter((g) => g.relatedCities.includes(slug))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (matches.length < 2) return null;

  const catFor = (category: string): { label: string; color: string } | null => {
    if (locale === "en") {
      const label = (EN_GUIDE_CATEGORIES as Record<string, string>)[category];
      return label ? { label, color: "text-[var(--accent)]" } : null;
    }
    const c = GUIDE_CATEGORIES.find((x) => x.id === category);
    return c ? { label: c.label, color: c.color } : null;
  };

  return (
    <section className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-1">
              {L("Guides MaVilleIdeal", "BestCitiesInFrance guides")}
            </p>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {L(`${matches.length} guides qui parlent de ${name}`, `${matches.length} guides about ${name}`)}
            </h2>
          </div>
          <Link
            href="/guides"
            className="text-sm text-[var(--accent)] hover:underline whitespace-nowrap"
          >
            {L("Tous les guides →", "All guides →")}
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.slice(0, 12).map((g) => {
            const cat = catFor(g.category);
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
            {L(
              `+${matches.length - 12} autres guides citent ${name}`,
              `+${matches.length - 12} more guides mention ${name}`
            )}
          </p>
        )}
      </div>
    </section>
  );
}
