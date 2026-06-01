import { Hotel, ExternalLink } from "lucide-react";

interface Props {
  cityName: string;
  /** Compact = inline row, full = standalone card with description */
  variant?: "compact" | "full";
  /** Optional preferred month — appended as date hint in the search URL */
  month?: number;
  locale?: "fr" | "en";
}

/**
 * Lien affilié Booking.com (programme Partners). Pour activer le suivi,
 * définir `NEXT_PUBLIC_BOOKING_AID` (Affiliate ID) dans l'environnement.
 * Sans cet ID, le lien fonctionne en mode standard (pas de commission, mais
 * pas de casse non plus).
 *
 * Note : on déclare clairement le caractère affilié au-dessus du lien
 * (« lien partenaire ») — cohérence avec le ton « sans bullshit » du site.
 */
export function BookingCTA({ cityName, variant = "compact", month, locale = "fr" }: Props) {
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const aid = process.env.NEXT_PUBLIC_BOOKING_AID;

  const url = new URL(
    locale === "en"
      ? "https://www.booking.com/searchresults.en-gb.html"
      : "https://www.booking.com/searchresults.fr.html",
  );
  url.searchParams.set("ss", `${cityName}, France`);
  if (aid) url.searchParams.set("aid", aid);
  if (month) {
    // Booking attend des dates ISO ; on suggère un samedi-mardi du mois.
    const now = new Date();
    const year = now.getMonth() + 1 <= month ? now.getFullYear() : now.getFullYear() + 1;
    const checkin = new Date(year, month - 1, 14);
    const checkout = new Date(year, month - 1, 18);
    url.searchParams.set("checkin", checkin.toISOString().slice(0, 10));
    url.searchParams.set("checkout", checkout.toISOString().slice(0, 10));
  }

  const href = url.toString();
  const label = t(`Trouver un hôtel à ${cityName}`, `Find a hotel in ${cityName}`);

  if (variant === "compact") {
    return (
      <a
        href={href}
        target="_blank"
        rel="sponsored noopener"
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-3 py-1.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
      >
        <Hotel className="h-3.5 w-3.5" />
        {label}
        <ExternalLink className="h-3 w-3 opacity-60" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener"
      className="group block rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
          <Hotel className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              {label}
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">
            {t("Comparer les disponibilités et les prix sur Booking.", "Compare availability and prices on Booking.")}
            <span className="text-[var(--text-tertiary)]">{t(" Lien partenaire — on touche une petite commission si vous réservez via ce lien, sans surcoût pour vous.", " Partner link — we earn a small commission if you book through it, at no extra cost to you.")}</span>
          </p>
        </div>
      </div>
    </a>
  );
}
