"use client";

import { useState } from "react";
import { scoreColor } from "@/lib/utils";

export type RankingTailRow = {
  rank: number;
  slug: string;
  name: string;
  region: string | null;
  score: number;
  global: number;
  rentT2: number | null;
};

export function RankingTableTail({ rows }: { rows: RankingTailRow[] }) {
  const [open, setOpen] = useState(false);
  if (rows.length === 0) return null;

  return (
    <tbody className="border-t border-[var(--border)]">
      {open &&
        rows.map((r) => (
          <tr
            key={r.slug}
            className="border-b border-[var(--border)] bg-[var(--bg-canvas)] transition-colors hover:bg-[var(--bg-elevated)]"
          >
            <td className="px-4 py-3">
              <span className="font-bold font-mono-data text-[var(--text-secondary)]">
                {r.rank}
              </span>
            </td>
            <td className="px-4 py-3">
              <a
                href={`/villes/${r.slug}`}
                className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
              >
                {r.name}
              </a>
              <div className="text-xs text-[var(--text-secondary)]">{r.region}</div>
            </td>
            <td className="px-4 py-3 text-right">
              <span className={`font-bold font-mono-data ${scoreColor(r.score)}`}>
                {r.score.toFixed(1)}
              </span>
            </td>
            <td className="hidden sm:table-cell px-4 py-3 text-right">
              <span className={`text-xs font-mono-data ${scoreColor(r.global)}`}>
                {r.global.toFixed(1)}
              </span>
            </td>
            <td className="hidden lg:table-cell px-4 py-3 text-right">
              <span className="text-xs font-mono-data text-[var(--text-secondary)]">
                {r.rentT2 ? `${r.rentT2}€` : "—"}
              </span>
            </td>
          </tr>
        ))}
      <tr className="bg-[var(--bg-canvas)]">
        <td colSpan={5} className="px-4 py-3 text-center">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            {open
              ? "Réduire le classement"
              : `Afficher le classement complet (${rows.length} villes)`}
          </button>
        </td>
      </tr>
    </tbody>
  );
}
