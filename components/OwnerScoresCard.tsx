"use client";

// F3 — Profils propriétaires bloc. 10 scores 0-10 with source provenance
// per criterion. Click a score to expand its source line.
//
// All values come from lib/owner-scores.ts. v0 = derived from existing seed.
// When real feeds are wired, this component doesn't change — only the
// computation in owner-scores.ts does.

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  computeOwnerScores,
  ownerScoreColor,
  sourceKindBadge,
  type OwnerScore,
} from "@/lib/owner-scores";
import type { CitySeed } from "@/data/cities-seed";

function ScoreRow({ score }: { score: OwnerScore }) {
  const [open, setOpen] = useState(false);
  const colorClass = ownerScoreColor(score.value);
  const kindBadge = sourceKindBadge(score.kind);
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-[var(--bg-canvas)] transition-colors"
        aria-expanded={open}
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {score.label}
          </span>
          <span
            className={`mt-1 inline-flex items-center self-start rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${kindBadge.tone}`}
          >
            {kindBadge.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-mono-data font-bold text-lg ${colorClass}`}
            aria-label={`Score ${score.value} sur 10`}
          >
            {score.value.toFixed(1)}
          </span>
          <span className="text-[var(--text-tertiary)] text-xs" aria-hidden>
            /10
          </span>
        </div>
      </button>
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2.5">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Source : </strong>
            {score.source}
          </p>
        </div>
      )}
    </div>
  );
}

export function OwnerScoresCard({ city }: { city: CitySeed }) {
  const scores = computeOwnerScores(city);
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
          Profils propriétaires — {city.name}
        </h2>
        <p className="text-xs text-[var(--text-tertiary)]">
          10 scores 0–10 sur des dimensions concrètes (canicule, solitude, bruit,
          sécurité nocturne, mobilité sans voiture, qualité d&apos;air, etc.). Cliquez sur
          un score pour voir la source exacte. v0 = dérivé du seed actuel ; les feeds
          réels (Météo-France, Insee, Bruitparif, SSMSI, ATMO, SIRENE) seront branchés
          itération par itération.
        </p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {scores.map((s) => (
          <li key={s.key}>
            <ScoreRow score={s} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
