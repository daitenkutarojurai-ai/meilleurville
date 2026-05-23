"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "mv:consent:v1";
const IS_EN = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") === "en";

type Decision = "granted" | "denied";

function updateGtagConsent(decision: Decision) {
  if (typeof window === "undefined") return;
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
  w.gtag("consent", "update", {
    ad_storage: decision,
    ad_user_data: decision,
    ad_personalization: decision,
    analytics_storage: decision,
  });
  (w.dataLayer as unknown[]).push({ event: decision === "granted" ? "consent_accepted" : "consent_refused" });
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
      if (existing === "granted" || existing === "denied") return;
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
    updateGtagConsent(decision);
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
      <div className="relative rounded-2xl bg-white/95 backdrop-blur-md ring-1 ring-black/5 shadow-[0_18px_50px_-12px_rgba(13,148,136,0.35)] overflow-hidden">
        {/* Brand tape strip across the top */}
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--accent) 0%, var(--accent-warm) 50%, var(--accent-pink) 100%)",
          }}
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => persist("denied")}
          aria-label={COPY.dismiss}
          className="absolute top-2.5 right-2.5 rounded-full p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={14} strokeWidth={2.2} />
        </button>

        <div className="px-4 pt-3.5 pb-3.5 sm:px-5 sm:pt-4 sm:pb-4">
          <div className="flex items-start gap-3">
            <div
              className="shrink-0 grid place-items-center w-9 h-9 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"
              aria-hidden="true"
            >
              <Cookie size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-tertiary)] font-medium">
                {COPY.eyebrow}
              </div>
              <div className="mt-0.5 font-display text-[18px] leading-tight text-[var(--text-primary)]">
                {COPY.title}
              </div>
            </div>
          </div>

          <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {COPY.body}
          </p>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => persist("granted")}
              className="flex-1 rounded-xl bg-[var(--accent)] px-3.5 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-[var(--accent-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            >
              {COPY.accept}
            </button>
            <button
              type="button"
              onClick={() => persist("denied")}
              className="flex-1 rounded-xl bg-transparent px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] ring-1 ring-[var(--border)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {COPY.refuse}
            </button>
          </div>

          <div className="mt-2.5 text-center">
            <Link
              href={COPY.detailHref}
              className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--accent)] underline-offset-4 hover:underline"
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
            transform: translateY(14px) rotate(-1.2deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotate(-0.6deg);
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
