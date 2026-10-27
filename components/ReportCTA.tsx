// Boutons « Signaler… » semés dans les sections du site (demande du
// propriétaire, 2026-10-17 : inciter davantage à nous écrire, ex. un bouton
// évident pour signaler un événement depuis l'agenda). Composant serveur, zéro
// JS : chaque bouton ouvre /contact avec le sujet et la ville pré-remplis
// (`lib/contact-prefill.ts`).
//
// Deux formes :
//  - `variant="card"` : encart pleine largeur, titre + boutons ;
//  - `variant="inline"` : rangée de boutons compacts, pour un pied de section.
// Identité « Couleurs » (2026-10-27) : carte blanche à ombre indigo posée sur
// la bande de la section, tuile d'icône dégradée, bouton principal en dégradé
// indigo → violet, secondaires en pilules lavande ; aucun vert/ambre/rouge de
// palier détourné en décoration.

import { CalendarPlus, Flag, PenLine, Vote, MapPinned, Megaphone } from "lucide-react";

export type ReportKind = "evenement" | "red-flag" | "erreur" | "politique" | "ville";

const META: Record<ReportKind, { icon: typeof Flag; fr: string; en: string }> = {
  evenement: { icon: CalendarPlus, fr: "Signaler un événement", en: "Submit an event" },
  "red-flag": { icon: Flag, fr: "Signaler un point noir", en: "Report an issue" },
  erreur: { icon: PenLine, fr: "Corriger une info", en: "Fix a detail" },
  politique: { icon: Vote, fr: "Signaler une actu politique", en: "Share political news" },
  ville: { icon: MapPinned, fr: "Proposer une ville", en: "Suggest a city" },
};

export function reportHref(kind: ReportKind, locale: "fr" | "en", cityName?: string): string {
  const q = new URLSearchParams({ topic: kind });
  if (cityName) q.set(locale === "fr" ? "ville" : "city", cityName);
  return `/contact?${q.toString()}`;
}

export function ReportCTA({
  kinds,
  locale = "fr",
  cityName,
  title,
  text,
  variant = "card",
  className = "",
}: {
  kinds: ReportKind[];
  locale?: "fr" | "en";
  cityName?: string;
  title?: string;
  text?: string;
  variant?: "card" | "inline";
  className?: string;
}) {
  const buttons = (
    <div className="flex flex-wrap gap-2">
      {kinds.map((k, i) => {
        const { icon: Icon, fr, en } = META[k];
        const primary = i === 0;
        return (
          <a
            key={k}
            href={reportHref(k, locale, cityName)}
            className={
              "inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] " +
              (primary
                ? "grad-head-0 shadow-[0_10px_22px_-12px_rgba(79,70,229,0.8)] hover:brightness-110"
                : "bg-[var(--band-indigo)] text-[#3730A3] hover:bg-[var(--band-lilac)] hover:text-[var(--accent)]")
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {locale === "fr" ? fr : en}
          </a>
        );
      })}
    </div>
  );

  if (variant === "inline") return <div className={className}>{buttons}</div>;

  return (
    <aside
      className={`rounded-2xl bg-white p-4 sm:p-5 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] ${className}`}
    >
      {(title || text) && (
        <div className="flex items-start gap-3">
          <span className="grad-head-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-[0_10px_22px_-12px_rgba(219,39,119,0.7)]">
            <Megaphone className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            {title && <p className="text-base font-bold text-[var(--text-primary)]">{title}</p>}
            {text && <p className="mt-1 text-sm text-[var(--text-secondary)]">{text}</p>}
          </div>
        </div>
      )}
      <div className={title || text ? "mt-3 sm:pl-[3.25rem]" : ""}>{buttons}</div>
    </aside>
  );
}
