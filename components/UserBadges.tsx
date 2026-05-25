"use client";

import { useEffect, useState } from "react";
import { readFavorites } from "@/components/effects/FavoriteButton";
import { computeUserBadges, type Badge } from "@/lib/user-badges";

export function UserBadges() {
  const [badges, setBadges] = useState<Badge[]>(() => computeUserBadges(readFavorites()));

  useEffect(() => {
    function refresh() {
      setBadges(computeUserBadges(readFavorites()));
    }
    window.addEventListener("favorites-changed", refresh);
    return () => window.removeEventListener("favorites-changed", refresh);
  }, []);

  const earned = badges.filter((b) => b.earned);
  const inProgress = badges.filter((b) => !b.earned);

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-white/60 backdrop-blur p-6 mb-6">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Badges</h2>
        <span className="text-xs text-[var(--text-tertiary)]">
          {earned.length}/{badges.length} obtenus
        </span>
      </div>

      {earned.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-4">
          {earned.map((b) => (
            <div
              key={b.key}
              className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-3 flex flex-col gap-1"
            >
              <div className="text-2xl">{b.emoji}</div>
              <div className="text-xs font-semibold text-[var(--text-primary)] leading-tight">{b.label}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">{b.progressLabel}</div>
            </div>
          ))}
        </div>
      )}

      {inProgress.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-wide font-semibold text-[var(--text-tertiary)] mb-2">À débloquer</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {inProgress.map((b) => (
              <div
                key={b.key}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-3 flex flex-col gap-1 opacity-70"
              >
                <div className="text-2xl grayscale">{b.emoji}</div>
                <div className="text-xs font-semibold text-[var(--text-secondary)] leading-tight">{b.label}</div>
                <div className="relative h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden mt-1">
                  <div
                    className="absolute inset-y-0 left-0 bg-[var(--accent)]"
                    style={{ width: `${Math.round(b.progress * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)]">{b.progressLabel}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
