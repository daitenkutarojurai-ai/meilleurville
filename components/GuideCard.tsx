import Link from "next/link";
import type { Guide } from "@/data/guides";

interface GuideCardProps {
  guide: Guide;
  featured?: boolean;
}

export function GuideCard({ guide, featured = false }: GuideCardProps) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={`group block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--accent)]/5 transition-all duration-200 ${featured ? "p-6" : "p-5"}`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center ${featured ? "w-14 h-14 text-2xl" : "w-11 h-11 text-xl"}`}>
          {guide.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-medium">
              {guide.category === "teletravail" ? "Télétravail" :
               guide.category === "famille" ? "Famille" :
               guide.category === "budget" ? "Budget" :
               guide.category === "region" ? "Région" :
               guide.category === "comparaison" ? "Comparaison" : "Style de vie"}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">·</span>
            <span className="text-xs text-[var(--text-tertiary)]">{guide.readMinutes} min</span>
          </div>
          <h3 className={`font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug ${featured ? "text-base" : "text-sm"}`}>
            {guide.title}
          </h3>
          {featured && (
            <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">{guide.intro}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {guide.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
