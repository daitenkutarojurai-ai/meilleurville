"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MAP_W as W,
  MAP_H as H,
  BORDER_PATH,
  CORSICA_PATH,
} from "@/lib/france-map-geo";
import {
  BLOC_COLORS,
  BLOC_LABEL,
  BLOC_ORDER,
  CANDIDATE_BY_KEY,
  type Bloc,
  type CandidateKey,
} from "@/lib/political-lean-meta";

// One projected city, precomputed server-side. Deliberately a projection and
// not the seed record: this rides into the client bundle once per city.
export type PoliticalDot = {
  slug: string;
  name: string;
  lean: Bloc;
  topPct: number;
  blocs: Record<Bloc, number>;
  x: number;
  y: number;
  r: number;
  topCand: CandidateKey | null;
  topCandPct: number;
};

type Selected = PoliticalDot | null;

// Dimming is done in CSS off a parent data-attribute rather than a per-dot
// inline style: 522 dots × a Tailwind class string + a style attribute was
// ~200 KB of HTML. It also means filtering re-renders nothing.
const DOT_CSS = `
.pm-dot { cursor: pointer; outline: none; transition: opacity 0.3s ease; }
.pm-dot:focus-visible { outline: 2px solid white; outline-offset: 2px; }
${BLOC_ORDER.map(
  (b) => `.pm-dots[data-filter="${b}"] .pm-dot:not([data-b="${b}"]) { opacity: 0.12; }`,
).join("\n")}
`;

const DotLayer = memo(function DotLayer({
  dots,
  coarse,
  locale,
  onSelect,
}: {
  dots: PoliticalDot[];
  coarse: boolean;
  locale: "fr" | "en";
  onSelect: (d: Selected) => void;
}) {
  const cityHref = (slug: string) => (locale === "en" ? `/cities/${slug}` : `/villes/${slug}`);
  return (
    <>
      {dots.map((d) => (
        <a
          key={d.slug}
          href={cityHref(d.slug)}
          aria-label={`${d.name} — ${BLOC_LABEL[locale][d.lean]} ${d.topPct}%`}
          className="pm-dot"
          data-b={d.lean}
          // Same rule as the homepage heatmap: on touch the first tap opens
          // the card rather than the city, because the dots are dense.
          onClick={
            coarse
              ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelect(d);
                }
              : undefined
          }
          onMouseEnter={coarse ? undefined : () => onSelect(d)}
          onMouseLeave={coarse ? undefined : () => onSelect(null)}
          onFocus={() => onSelect(d)}
          onBlur={() => onSelect(null)}
        >
          <circle cx={d.x} cy={d.y} r={d.r} fill={BLOC_COLORS[d.lean]} stroke="white" strokeWidth="0.9" />
        </a>
      ))}
    </>
  );
});

export function PoliticalMap({
  dots,
  locale = "fr",
}: {
  dots: PoliticalDot[];
  locale?: "fr" | "en";
}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const [filter, setFilter] = useState<Bloc | null>(null);
  const [sel, setSel] = useState<Selected>(null);
  // Set after mount so the prerendered dots hydrate with matching handlers.
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setCoarse(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const counts = useMemo(() => {
    const out = {} as Record<Bloc, number>;
    for (const b of BLOC_ORDER) out[b] = 0;
    for (const d of dots) out[d.lean] += 1;
    return out;
  }, [dots]);

  const present = BLOC_ORDER.filter((b) => counts[b] > 0);

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-sm">
      {/* Filter chips double as the legend — one control, not two blocks */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter(null)}
          aria-pressed={filter === null}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            filter === null
              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
          }`}
        >
          {L("Toutes", "All")} · {dots.length}
        </button>
        {present.map((b) => {
          const on = filter === b;
          return (
            <button
              key={b}
              type="button"
              onClick={() => setFilter(on ? null : b)}
              aria-pressed={on}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                on
                  ? "border-transparent text-white"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
              }`}
              style={on ? { backgroundColor: BLOC_COLORS[b] } : undefined}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: on ? "rgba(255,255,255,0.9)" : BLOC_COLORS[b] }}
              />
              {BLOC_LABEL[locale][b]} · {counts[b]}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          role="img"
          aria-label={L(
            "Carte de France des villes colorées par famille politique arrivée en tête en 2022",
            "Map of France with cities coloured by the leading political bloc in 2022",
          )}
          onClick={coarse ? () => setSel(null) : undefined}
        >
          <style>{DOT_CSS}</style>
          <path d={BORDER_PATH} fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1.5" />
          <path d={CORSICA_PATH} fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1.5" />
          <g className="pm-dots" data-filter={filter ?? "all"}>
            <DotLayer dots={dots} coarse={coarse} locale={locale} onSelect={setSel} />
          </g>
          {sel && (
            <g pointerEvents="none">
              <circle cx={sel.x} cy={sel.y} r={sel.r + 7} fill="none" stroke={BLOC_COLORS[sel.lean]} strokeWidth="2" />
            </g>
          )}
        </svg>

        {sel && (() => {
          const xPct = (sel.x / W) * 100;
          const yPct = (sel.y / H) * 100;
          const flipX = xPct > 60;
          const flipY = yPct > 70;
          return (
            <Link
              href={locale === "en" ? `/cities/${sel.slug}` : `/villes/${sel.slug}`}
              className="absolute z-20 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 shadow-2xl"
              style={{
                left: flipX ? `calc(${xPct}% - 12px)` : `calc(${xPct}% + 12px)`,
                top: flipY ? `calc(${yPct}% - 12px)` : `calc(${yPct}% + 12px)`,
                transform: `translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`,
                width: "min(240px, calc(100vw - 48px))",
              }}
            >
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-bold text-[var(--text-primary)]">{sel.name}</span>
                <span
                  className="shrink-0 text-sm font-bold tabular-nums"
                  style={{ color: BLOC_COLORS[sel.lean] }}
                >
                  {sel.topPct}%
                </span>
              </div>
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="font-semibold" style={{ color: BLOC_COLORS[sel.lean] }}>
                  {BLOC_LABEL[locale][sel.lean]}
                </span>
                {sel.topCand && (
                  <span className="text-[var(--text-tertiary)]">
                    {CANDIDATE_BY_KEY[sel.topCand].name} {sel.topCandPct}%
                  </span>
                )}
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-full" aria-hidden>
                {BLOC_ORDER.filter((b) => sel.blocs[b] > 0).map((b) => (
                  <span key={b} style={{ width: `${sel.blocs[b]}%`, backgroundColor: BLOC_COLORS[b] }} />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[var(--accent)]">
                  {L("Voir la fiche →", "See profile →")}
                </span>
                {coarse && (
                  <span className="shrink-0 text-[10px] text-[var(--text-tertiary)]">
                    {L("Touchez pour fermer", "Tap map to close")}
                  </span>
                )}
              </div>
            </Link>
          );
        })()}
      </div>

      <p className="mt-3 text-[11px] text-[var(--text-tertiary)]">
        {L(
          "Un point par ville, coloré par la famille arrivée en tête au 1ᵉʳ tour 2022. Les DROM ne sont pas représentés sur ce fond de carte.",
          "One dot per city, coloured by the bloc that led the 2022 first round. Overseas territories are not on this base map.",
        )}
      </p>
    </div>
  );
}
