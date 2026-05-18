"use client";
import { useEffect, useState } from "react";
import { Hotel, ExternalLink, X } from "lucide-react";

interface Props {
  cityName: string;
}

/**
 * Sticky bar Booking en bas d'écran sur mobile + desktop. Apparait après
 * 30 % de scroll, dismissible (session-storage). Conçue pour ne PAS gêner
 * la lecture (slim, retirable, ton transparent).
 */
export function StickyBookingBar({ cityName }: Props) {
  const [visible, setVisible] = useState(false);
  // Lazy initialiser — évite le setState-in-effect (cf. CLAUDE.md).
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("mv-booking-dismissed") === "1";
  });

  useEffect(() => {
    if (typeof window === "undefined" || dismissed) return;
    function onScroll() {
      const scrolled = window.scrollY;
      const doc = document.documentElement;
      const total = Math.max(1, doc.scrollHeight - doc.clientHeight);
      const ratio = scrolled / total;
      setVisible(ratio > 0.3 && ratio < 0.95);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (dismissed || !visible) return null;

  const aid = process.env.NEXT_PUBLIC_BOOKING_AID;
  const url = new URL("https://www.booking.com/searchresults.fr.html");
  url.searchParams.set("ss", `${cityName}, France`);
  if (aid) url.searchParams.set("aid", aid);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:pb-4 pointer-events-none">
      <div className="mx-auto max-w-3xl pointer-events-auto">
        <div className="flex items-center gap-2 rounded-full border border-[var(--accent)]/40 bg-white/95 backdrop-blur-md px-3 py-2 shadow-lg shadow-black/10">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
            <Hotel className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
              Trouver un hôtel à {cityName}
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] truncate">
              Lien partenaire Booking
            </div>
          </div>
          <a
            href={url.toString()}
            target="_blank"
            rel="sponsored noopener"
            className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] text-white text-xs font-semibold px-3 py-1.5 hover:bg-[var(--accent-hover)] transition-colors shrink-0"
          >
            Voir
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem("mv-booking-dismissed", "1");
              setDismissed(true);
            }}
            aria-label="Fermer"
            className="ml-1 rounded-full p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
