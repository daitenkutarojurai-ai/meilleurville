"use client";

import { useState } from "react";

interface ContributorBadgeProps {
  visible: boolean;
  locale?: "fr" | "en";
}

/**
 * Accusé de réception d'une contribution, en registre « Carte & plaque » :
 * un tampon encre navy posé sur une note à filet, au lieu de l'ancien bandeau
 * émeraude à confettis — le vert et les teintes de confettis étant réservés
 * aux paliers de score.
 */
export function ContributorBadge({ visible, locale = "fr" }: ContributorBadgeProps) {
  const [mounted, setMounted] = useState(false);

  // Reste monté après la première apparition, pour que le fondu de sortie joue.
  // Ajustement d'état pendant le rendu (motif React « derived state »), pas d'effet.
  if (visible && !mounted) setMounted(true);

  if (!mounted && !visible) return null;

  const en = locale === "en";

  return (
    <div
      aria-live="polite"
      role="status"
      className={[
        "mt-3 flex items-center gap-3 border-l-2 border-[var(--accent)] bg-[var(--bg-canvas)] px-4 py-3 text-sm text-[var(--text-primary)]",
        "transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none",
      ].join(" ")}
    >
      <span
        aria-hidden
        className="contributor-stamp inline-flex shrink-0 -rotate-6 items-center rounded-sm border-2 border-[var(--accent)] px-1.5 py-0.5 font-mono-data text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]"
      >
        {en ? "Received" : "Reçu"}
      </span>
      <span className="font-semibold">
        {en ? "Thanks for your contribution!" : "Merci pour votre contribution !"}
      </span>

      <style>{`
        .contributor-stamp {
          animation: stampIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes stampIn {
          from { transform: rotate(-6deg) scale(1.6); opacity: 0; }
          to   { transform: rotate(-6deg) scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .contributor-stamp { animation: none; }
        }
      `}</style>
    </div>
  );
}
