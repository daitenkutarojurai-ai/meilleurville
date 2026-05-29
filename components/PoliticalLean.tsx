import { Vote } from "lucide-react";
import {
  getPoliticalLean,
  BLOC_ORDER,
  BLOC_COLORS,
  BLOC_LABEL,
  type Bloc,
} from "@/lib/political-lean";

// Indicative political-lean metric for a city, from the 2022 presidential
// 1st-round commune result. Pure display (server component). Shows the
// plurality bloc, a left→right stacked bar of the four blocs, a legend, and a
// sourced "indicatif" caption. Renders nothing if the city has no data.
export function PoliticalLean({
  slug,
  cityName,
  locale = "fr",
}: {
  slug: string;
  cityName: string;
  locale?: "fr" | "en";
}) {
  const p = getPoliticalLean(slug);
  if (!p) return null;

  const L = BLOC_LABEL[locale];
  const t =
    locale === "en"
      ? {
          heading: "Political lean",
          lead: `In the 2022 presidential first round, ${cityName} leaned`,
          caption: "Estimate · Ministry of the Interior, 2022 1st round · electorate, not municipal politics",
        }
      : {
          heading: "Orientation politique",
          lead: `Au 1ᵉʳ tour de la présidentielle 2022, ${cityName} a voté majoritairement`,
          caption:
            "Estimation · Ministère de l'Intérieur, 1ᵉʳ tour 2022 · vote des habitants, pas la mairie",
        };

  const segments = BLOC_ORDER.filter((b) => p.blocs[b] > 0);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-3">
        <Vote className="h-4 w-4 text-[var(--text-secondary)]" />
        {t.heading}
      </h3>

      <p className="text-sm text-[var(--text-secondary)] mb-3">
        {t.lead}{" "}
        <strong className="font-semibold" style={{ color: BLOC_COLORS[p.lean] }}>
          {L[p.lean].toLowerCase()}
        </strong>{" "}
        <span className="tabular-nums text-[var(--text-tertiary)]">({p.topPct}%)</span>
      </p>

      {/* Left → right stacked bar of the four blocs. */}
      <div
        className="flex h-3 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={segments
          .map((b) => `${L[b]} ${p.blocs[b]}%`)
          .join(", ")}
      >
        {segments.map((b) => (
          <span
            key={b}
            style={{ width: `${p.blocs[b]}%`, backgroundColor: BLOC_COLORS[b] }}
            title={`${L[b]} · ${p.blocs[b]}%`}
          />
        ))}
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {BLOC_ORDER.map((b) => (
          <li key={b} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: BLOC_COLORS[b] }}
              />
              {L[b]}
            </span>
            <span className="tabular-nums text-[var(--text-tertiary)]">{p.blocs[b]}%</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[10px] leading-snug text-[var(--text-tertiary)]">{t.caption}</p>
    </section>
  );
}
