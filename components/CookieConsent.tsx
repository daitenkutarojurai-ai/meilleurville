"use client";

import { useEffect, useState } from "react";
import Link from "@/components/AppLink";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "mv:consent:v1";
const IS_EN = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") === "en";

type Decision = "granted" | "denied";

function getGtag() {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function (...args: unknown[]) {
      (w.dataLayer as unknown[]).push(args);
    };
  }
  return w as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };
}

// Re-apply the stored consent choice. Safe to call on every page load: the
// consent 'update' command is idempotent and must run on each page so a
// previously-granted visitor isn't held at the 'denied' default. See
// developers.google.com/tag-platform/security/guides/consent — "persist their
// choice and call the update command accordingly on subsequent pages".
function applyGtagConsent(decision: Decision) {
  const w = getGtag();
  if (!w) return;
  w.gtag("consent", "update", {
    ad_storage: decision,
    ad_user_data: decision,
    ad_personalization: decision,
    analytics_storage: decision,
  });
}

// Interaction marker — only on an actual user click, not on reload.
function emitConsentEvent(decision: Decision) {
  const w = getGtag();
  if (!w) return;
  w.dataLayer.push({ event: decision === "granted" ? "consent_accepted" : "consent_refused" });
}

const COPY = IS_EN
  ? {
      eyebrow: "A quick note",
      title: "Yes, we use cookies.",
      body: "Google Analytics, so we can see which rankings actually get read. Nothing sold, nothing creepy, no retargeting army.",
      accept: "Sounds fair",
      refuse: "No thanks",
      detail: "Read the detail",
      detailHref: "/privacy-policy",
      dismiss: "Close",
    }
  : {
      eyebrow: "Petite note",
      title: "Oui, on utilise des cookies.",
      body: "Google Analytics, pour voir quels classements sont vraiment lus. Rien n'est revendu, aucun reciblage, pas d'armée de pixels.",
      accept: "Ça me va",
      refuse: "Non merci",
      detail: "Voir le détail",
      detailHref: "/confidentialite",
      dismiss: "Fermer",
    };

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing === "granted" || existing === "denied") {
        // Re-assert the persisted choice on this page load, then stay hidden.
        applyGtagConsent(existing);
        return;
      }
    } catch {
      // localStorage unavailable (private mode, SSR fallback) — still show.
    }
    const t = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  const persist = (decision: Decision) => {
    try {
      localStorage.setItem(STORAGE_KEY, decision);
    } catch {
      // ignore
    }
    applyGtagConsent(decision);
    emitConsentEvent(decision);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={COPY.title}
      className="fixed bottom-3 left-3 right-3 z-[90] sm:left-5 sm:right-auto sm:bottom-5 sm:max-w-[360px] animate-cookie-in"
    >
      {/* « Couleurs » (2026-10-25): white card with a vivid indigo → violet →
          pink header strip carrying the eyebrow and the title, a pastel cookie
          medallion, gradient primary button. No paper, no contour strip, no
          dashed rules — the old « Carte & plaque » slip is gone. */}
      <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-surface)] ring-1 ring-[#C7D2FE] shadow-[0_18px_44px_-16px_rgba(79,70,229,0.55)]">
        <div className="relative px-4 pt-3.5 pb-3 pr-11 sm:px-5" style={{ background: "var(--band-bold)" }}>
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/95 text-xl shadow-[0_4px_12px_-4px_rgba(30,27,75,0.5)]"
              aria-hidden="true"
            >
              🍪
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                {COPY.eyebrow}
              </div>
              <div className="mt-0.5 font-display text-[18px] leading-tight text-white">
                {COPY.title}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => persist("denied")}
            aria-label={COPY.dismiss}
            className="absolute top-2.5 right-2.5 rounded-full p-1.5 text-white/85 hover:bg-white/20 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={14} strokeWidth={2.4} />
          </button>
        </div>

        <div className="px-4 pt-3 pb-3.5 sm:px-5 sm:pb-4">
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {COPY.body}
          </p>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => persist("granted")}
              className="btn-couleurs flex-1 rounded-full px-3.5 py-2 text-[13px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            >
              {COPY.accept}
            </button>
            <button
              type="button"
              onClick={() => persist("denied")}
              className="flex-1 rounded-full bg-[var(--accent-soft)] px-3.5 py-2 text-[13px] font-semibold text-[var(--accent-hover)] ring-1 ring-[#C7D2FE] hover:bg-[var(--band-indigo)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {COPY.refuse}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full bg-[var(--band-aqua)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0E7490]"
              aria-hidden="true"
            >
              <Cookie size={11} strokeWidth={2.4} />
              GA4 · {IS_EN ? "opt-in" : "consentement"}
            </span>
            <Link
              href={COPY.detailHref}
              className="text-[12px] font-medium text-[var(--accent)] hover:text-[var(--accent-pink)] underline decoration-[var(--accent-pink)] decoration-1 underline-offset-4"
            >
              {COPY.detail} →
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes cookie-in {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-cookie-in {
          animation: cookie-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-cookie-in {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
