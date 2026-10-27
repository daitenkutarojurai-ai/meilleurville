import Link from "@/components/AppLink";
import { MessageCircle, ChevronRight } from "lucide-react";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ReportCTA } from "@/components/ReportCTA";

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
  // Le 👍/👎 vit ici depuis le 2026-10-16 : les retours arrivent nombreux sur
  // les guides et les fiches ville, ce bloc le porte sur toutes les sous-pages.
  return (
    <div className="space-y-3">
    <FeedbackWidget locale={locale} />
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-18px_rgba(79,70,229,0.7)]"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="grad-head-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_10px_22px_-12px_rgba(79,70,229,0.7)]">
          <MessageCircle className="h-5 w-5" aria-hidden />
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
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--band-indigo)] text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white">
        <ChevronRight className="h-4 w-4" aria-hidden />
      </span>
    </Link>
    {/* Signalements en un clic, ville pré-remplie (2026-10-17) : la demande
        du propriétaire était de rendre le contact présent dans chaque section,
        et ce bloc est rendu sur toutes les sous-pages ville. */}
    <ReportCTA
      locale={locale}
      cityName={cityName}
      kinds={["evenement", "red-flag", "erreur"]}
      title={L(`Vous connaissez ${cityName} ?`, `Know ${cityName}?`)}
      text={L(
        "Un événement à annoncer, un problème que les annonces taisent, un chiffre à corriger : écrivez-nous, on lit tout.",
        "An event to list, an issue listings keep quiet, a figure to fix: write to us, we read everything.",
      )}
    />
    </div>
  );
}
