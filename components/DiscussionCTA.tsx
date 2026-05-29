import Link from "next/link";
import { MessageCircle, ChevronRight } from "lucide-react";

interface Props {
  citySlug: string;
  cityName: string;
  locale?: "fr" | "en";
}

/**
 * CTA léger en bas des sous-pages ville : renvoie vers la section
 * Discussions du profil ville principal (anchor `#discussions`).
 *
 * Choix d'architecture (R7.11) : on garde une seule discussion par ville
 * plutôt que de fragmenter la conversation par sous-page. Le clic scrolle
 * directement à `/villes/<slug>#discussions`.
 */
export function DiscussionCTA({ citySlug, cityName, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const href =
    locale === "en"
      ? `/cities/${citySlug}#discussions`
      : `/villes/${citySlug}#discussions`;
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            {L(`Discuter de ${cityName}`, `Talk about ${cityName}`)}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-0.5">
            {L(
              "Lire les retours de la communauté ou partager votre expérience.",
              "Read what locals say or share your own experience.",
            )}
          </div>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
    </Link>
  );
}
