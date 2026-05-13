import Link from "next/link";
import type { Guide } from "@/data/guides";

interface GuideCardProps {
  guide: Guide;
  featured?: boolean;
}

function categoryLabel(c: Guide["category"]): string {
  switch (c) {
    case "teletravail": return "Télétravail";
    case "famille": return "Famille";
    case "budget": return "Budget";
    case "region": return "Région";
    case "comparaison": return "Comparaison";
    default: return "Style de vie";
  }
}

function freshness(updatedAt: string): string | null {
  const dt = new Date(updatedAt);
  if (Number.isNaN(dt.getTime())) return null;
  const days = Math.floor((Date.now() - dt.getTime()) / 86_400_000);
  if (days < 14) return "Mis à jour récemment";
  return dt.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function isNew(publishedAt: string): boolean {
  const dt = new Date(publishedAt);
  if (Number.isNaN(dt.getTime())) return false;
  return Date.now() - dt.getTime() < 30 * 86_400_000;
}

export function GuideCard({ guide, featured = false }: GuideCardProps) {
  const fresh = freshness(guide.updatedAt);
  const isFresh = isNew(guide.publishedAt);
  return (
    <Link
      href={`/guides/${guide.slug}`}
      aria-label={`${guide.title} — ${guide.readMinutes} minutes de lecture`}
      className={`group block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--accent)]/5 active:scale-[0.99] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${featured ? "p-6" : "p-5"}`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center ${featured ? "w-14 h-14 text-2xl" : "w-11 h-11 text-xl"}`} aria-hidden>
          {guide.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {isFresh && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                Nouveau
              </span>
            )}
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-medium">
              {categoryLabel(guide.category)}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]" aria-hidden>·</span>
            <span className="text-xs text-[var(--text-tertiary)]">{guide.readMinutes} min de lecture</span>
            {fresh && (
              <>
                <span className="text-xs text-[var(--text-tertiary)]" aria-hidden>·</span>
                <span className="text-xs text-[var(--text-tertiary)]">
                  <time dateTime={guide.updatedAt}>{fresh}</time>
                </span>
              </>
            )}
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
