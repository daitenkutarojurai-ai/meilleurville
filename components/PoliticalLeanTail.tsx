"use client";

import { useState } from "react";
import Link from "next/link";
import { BLOC_COLORS, BLOC_ORDER, type Bloc } from "@/lib/political-lean";

export type LeanTailRow = {
  slug: string;
  name: string;
  topPct: number;
  blocs: Record<Bloc, number>;
};

export function PoliticalLeanTail({
  rows,
  startRank,
  bloc,
  locale = "fr",
}: {
  rows: LeanTailRow[];
  startRank: number;
  bloc: Bloc;
  locale?: "fr" | "en";
}) {
  const [open, setOpen] = useState(false);
  if (rows.length === 0) return null;

  return (
    <>
      {open &&
        rows.map((c, i) => (
          <li key={c.slug}>
            <Link
              href={locale === "en" ? `/cities/${c.slug}` : `/villes/${c.slug}`}
              className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:border-[var(--accent)]/40 hover:shadow-md"
            >
              <span className="w-6 shrink-0 text-right text-xs font-bold tabular-nums text-[var(--text-tertiary)]">
                {startRank + i}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{c.name}</span>
                  <span className="shrink-0 text-xs font-bold tabular-nums" style={{ color: BLOC_COLORS[bloc] }}>
                    {c.topPct}%
                  </span>
                </div>
                <div className="mt-1.5">
                  <div className="flex h-2 w-full overflow-hidden rounded-full" aria-hidden>
                    {BLOC_ORDER.filter((b) => c.blocs[b] > 0).map((b) => (
                      <span key={b} style={{ width: `${c.blocs[b]}%`, backgroundColor: BLOC_COLORS[b] }} />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      <li className="sm:col-span-2">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="w-full rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-sm font-semibold text-[var(--accent)] transition-colors hover:border-[var(--accent)]/40"
        >
          {open
            ? locale === "en"
              ? "Collapse the list"
              : "Réduire la liste"
            : locale === "en"
              ? `Show the full ranking (${rows.length} more cities)`
              : `Afficher le classement complet (${rows.length} villes)`}
        </button>
      </li>
    </>
  );
}
