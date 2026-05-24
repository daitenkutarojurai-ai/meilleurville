import { cityVibe, VIBE_META } from "@/lib/vibe";
import type { CitySeed } from "@/data/cities-seed";

export function VibeWidget({ city }: { city: CitySeed }) {
  const { tone, breakdown } = cityVibe(city);
  const meta = VIBE_META[tone];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          Ambiance
        </span>
        <span
          className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700"
          title="Estimation éditoriale — non issue de données en temps réel"
        >
          ESTIMÉ
        </span>
      </div>
      <div className={`flex items-center gap-2 text-sm font-bold ${meta.color}`}>
        <span aria-hidden>{meta.emoji}</span>
        <span>{meta.label}</span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-tertiary)] leading-snug">{meta.desc}</p>
      {breakdown.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {breakdown.map((b) => (
            <li key={b} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
              <span className="mt-1 inline-block h-1 w-1 rounded-full bg-[var(--text-tertiary)] shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
