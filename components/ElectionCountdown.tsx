"use client";

// Compte à rebours jusqu'au 1er tour 2027. Le nombre est calculé au build
// (HTML statique, lisible sans JS), puis recalculé au montage pour qu'une page
// servie depuis le cache ne reste pas un jour en retard.

import { useEffect, useState } from "react";
import { ELECTION_CALENDAR } from "@/data/political-news";

function daysUntil(iso: string, now: number): number {
  const target = Date.parse(iso + "T00:00:00+02:00");
  return Math.max(0, Math.ceil((target - now) / 86_400_000));
}

export function ElectionCountdown({ builtAt }: { builtAt: number }) {
  const [now, setNow] = useState(builtAt);
  useEffect(() => setNow(Date.now()), []);
  const next = ELECTION_CALENDAR.find((e) => daysUntil(e.date, now) > 0) ?? ELECTION_CALENDAR[ELECTION_CALENDAR.length - 1];
  const first = ELECTION_CALENDAR.find((e) => e.date === "2027-04-18")!;
  const dFirst = daysUntil(first.date, now);

  return (
    <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
      <div className="plaque flex-col !items-start !gap-0 px-5 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">1ᵉʳ tour dans</span>
        <span className="text-4xl font-bold tabular-nums leading-none">{dFirst}</span>
        <span className="text-xs">jour{dFirst > 1 ? "s" : ""} · 18 avril 2027</span>
      </div>
      <ol className="grid gap-2 sm:grid-cols-3">
        {ELECTION_CALENDAR.map((e) => {
          const d = daysUntil(e.date, now);
          const isNext = e === next;
          return (
            <li
              key={e.date}
              className={`rounded-2xl border p-3 ${
                isNext ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--bg-surface)]"
              }`}
            >
              <p className="text-[11px] font-semibold text-[var(--accent)]">
                {new Date(e.date + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                {d > 0 && <span className="ml-1 font-normal text-[var(--text-tertiary)]">· J-{d}</span>}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">{e.label}</p>
              <p className="mt-1 text-xs leading-snug text-[var(--text-secondary)]">{e.detail}</p>
              {e.rule && <p className="mt-1 text-[10px] leading-snug text-[var(--text-tertiary)]">{e.rule}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
