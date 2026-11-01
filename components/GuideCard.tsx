import Link from "@/components/AppLink";
import type { Guide } from "@/data/guides";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";

// Card-level projection of Guide — server pages pass only these fields so the
// multi-MB sections[] bodies never enter the client props / flight payload.
export type GuideCardData = Pick<
  Guide,
  "slug" | "title" | "intro" | "category" | "emoji" | "readMinutes" | "publishedAt" | "updatedAt" | "tags"
>;

interface GuideCardProps {
  guide: GuideCardData;
  featured?: boolean;
  /** Build-time reference timestamp. Passed down from a server component so
   *  freshness is computed identically on server and client (no hydration
   *  mismatch when GuideCard renders inside the client GuidesGrid). */
  now: number;
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

function freshness(updatedAt: string, now: number): string | null {
  const dt = new Date(updatedAt);
  if (Number.isNaN(dt.getTime())) return null;
  const days = Math.floor((now - dt.getTime()) / 86_400_000);
  if (days < 14) return "Mis à jour récemment";
  return dt.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function isNew(publishedAt: string, now: number): boolean {
  const dt = new Date(publishedAt);
  if (Number.isNaN(dt.getTime())) return false;
  return now - dt.getTime() < 30 * 86_400_000;
}

export function GuideCard({ guide, featured = false, now }: GuideCardProps) {
  const fresh = freshness(guide.updatedAt, now);
  const isFresh = isNew(guide.publishedAt, now);
  return (
    <Link
      href={`/guides/${guide.slug}`}
      aria-label={`${guide.title} — ${guide.readMinutes} minutes de lecture`}
      className={`group block h-full rounded-2xl border border-white bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] hover:-translate-y-0.5 hover:border-[#C7D2FE] hover:shadow-[0_16px_32px_-16px_rgba(79,70,229,0.6)] active:scale-[0.99] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${featured ? "p-6" : "p-5"}`}
    >
      <div className="flex items-start gap-4">
        {/* « Couleurs » : pastille dégradée, teinte stable par slug. */}
        <EmojiBadge emoji={guide.emoji} tone={toneFor(guide.slug)} size={featured ? "md" : "sm"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {isFresh && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full grad-head-5">
                Nouveau
              </span>
            )}
            <span className="text-xs text-[var(--accent)] uppercase tracking-wide font-semibold">
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
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#EEF0FF] text-[#4338CA]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
