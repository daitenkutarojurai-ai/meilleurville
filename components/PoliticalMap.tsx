"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Link from "@/components/AppLink";
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
import { project2027 } from "@/lib/presidential-2027";

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

type Year = "2022" | "2027";
type View = "3d" | "2d";

/** Ce que la carte affiche pour une ville, selon l'année choisie. */
type Shown = { lean: Bloc; topPct: number; blocs: Record<Bloc, number> };

function shownFor(d: PoliticalDot, year: Year): Shown {
  if (year === "2022") return { lean: d.lean, topPct: d.topPct, blocs: d.blocs };
  const p = project2027(d.blocs);
  return { lean: p.lead, topPct: p.blocs[p.lead], blocs: p.blocs };
}

type Selected = { d: PoliticalDot; s: Shown; sx: number; sy: number } | null;

// ─── Vue « relief » ──────────────────────────────────────────────────────────
// Projection oblique (2026-10-17) : la carte est inclinée comme un plan-relief
// posé sur une table, et chaque ville devient une colonne dont la hauteur est
// la part de la famille affichée. Pas de WebGL ni de dépendance : une matrice
// affine pour le sol, trois faces par colonne, peintes du nord au sud.
const SKEW = -0.2; // décalage horizontal par unité de latitude (vue depuis le sud-est)
const SQUASH = 0.6; // écrasement vertical du sol
// Hauteur : en mode « en tête » les scores vont de ~25 à ~60 %, donc on part
// d'un plancher de 20 % pour que l'écart se voie ; une famille isolée part de 0.
const LEAD_FLOOR = 20;
const HEIGHT_PER_PT = 2.4; // px de colonne par point au-dessus du plancher
const PLINTH = 10; // épaisseur du socle

const toScreen = (x: number, y: number): [number, number] => [x + SKEW * y, SQUASH * y];

// viewBox de la vue relief : le sol incliné + la place des plus hautes colonnes.
const VB_X = SKEW * H - 12;
const VB_Y = -100;
const VB_W = W - VB_X + 12;
const VB_H = SQUASH * H + PLINTH + 12 - VB_Y;

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) =>
    Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const pt = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

function columnHeight(pct: number, filtered: boolean): number {
  return Math.max(1.5, (filtered ? pct * 0.62 : pct - LEAD_FLOOR) * HEIGHT_PER_PT);
}

function Column({
  d,
  s,
  filter,
  delay,
  onEnter,
  onLeave,
  onTap,
}: {
  d: PoliticalDot;
  s: Shown;
  filter: Bloc | null;
  delay: number;
  onEnter: () => void;
  onLeave: () => void;
  onTap: () => void;
}) {
  const bloc = filter ?? s.lean;
  const pct = filter ? s.blocs[filter] ?? 0 : s.topPct;
  const h = columnHeight(pct, filter !== null);
  const half = Math.max(2, d.r * 0.8);
  const nw = toScreen(d.x - half, d.y - half);
  const ne = toScreen(d.x + half, d.y - half);
  const se = toScreen(d.x + half, d.y + half);
  const sw = toScreen(d.x - half, d.y + half);
  const up = (p: [number, number]): [number, number] => [p[0], p[1] - h];
  const base = BLOC_COLORS[bloc];
  // Hors filtre, une ville que la famille ne mène pas reste grisée : la
  // hauteur dit la part, la couleur dit si elle est en tête.
  const dim = filter !== null && s.lean !== filter;
  const front = dim ? "#C9C1B0" : base;
  const side = dim ? "#B3AB9A" : shade(base, -0.28);
  const top = dim ? "#DDD6C7" : shade(base, 0.32);
  return (
    <g
      className="pm-col"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onTap}
    >
      <path d={`M${pt(sw)}L${pt(se)}L${pt(up(se))}L${pt(up(sw))}Z`} fill={front} />
      <path d={`M${pt(se)}L${pt(ne)}L${pt(up(ne))}L${pt(up(se))}Z`} fill={side} />
      <path d={`M${pt(up(nw))}L${pt(up(ne))}L${pt(up(se))}L${pt(up(sw))}Z`} fill={top} />
    </g>
  );
}

const RELIEF_CSS = `
@keyframes pm-rise { from { transform: scaleY(0.02); opacity: 0.2; } to { transform: scaleY(1); opacity: 1; } }
.pm-col { transform-box: fill-box; transform-origin: 50% 100%; animation: pm-rise 0.7s cubic-bezier(.2,.8,.2,1) both; cursor: pointer; }
.pm-col:hover path { filter: brightness(1.12); }
@media (prefers-reduced-motion: reduce) { .pm-col { animation: none; } }
`;

function ReliefMap({
  dots,
  year,
  filter,
  coarse,
  onSelect,
}: {
  dots: PoliticalDot[];
  year: Year;
  filter: Bloc | null;
  coarse: boolean;
  onSelect: (s: Selected) => void;
}) {
  // Peinture du nord au sud (puis d'ouest en est) : une colonne au premier
  // plan recouvre celles de derrière, comme sur un plan-relief.
  const ordered = useMemo(() => [...dots].sort((a, b) => a.y - b.y || a.x - b.x), [dots]);
  const shown = useMemo(() => new Map(dots.map((d) => [d.slug, shownFor(d, year)])), [dots, year]);
  const go = (slug: string) => {
    window.location.href = `/villes/${slug}`;
  };
  return (
    <svg
      viewBox={`${VB_X.toFixed(0)} ${VB_Y} ${VB_W.toFixed(0)} ${VB_H.toFixed(0)}`}
      className="w-full h-auto"
      role="img"
      aria-label="Carte en relief des villes : la hauteur de chaque colonne est la part de la famille politique affichée"
      onClick={coarse ? () => onSelect(null) : undefined}
    >
      <style>{RELIEF_CSS}</style>
      <defs>
        <linearGradient id="pm-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--bg-surface)" />
          <stop offset="1" stopColor="var(--bg-elevated)" />
        </linearGradient>
      </defs>
      {/* Socle : la même silhouette, décalée vers le bas, en plus sombre. */}
      <g transform={`matrix(1 0 ${SKEW} ${SQUASH} 0 ${PLINTH})`}>
        <path d={BORDER_PATH} fill="#D8CFBB" stroke="#C9BFA8" strokeWidth="2" />
        <path d={CORSICA_PATH} fill="#D8CFBB" stroke="#C9BFA8" strokeWidth="2" />
      </g>
      <g transform={`matrix(1 0 ${SKEW} ${SQUASH} 0 0)`}>
        <path d={BORDER_PATH} fill="url(#pm-ground)" stroke="var(--border)" strokeWidth="2" />
        <path d={CORSICA_PATH} fill="url(#pm-ground)" stroke="var(--border)" strokeWidth="2" />
      </g>
      <g key={`${year}-${filter ?? "all"}`}>
        {ordered.map((d) => {
          const s = shown.get(d.slug)!;
          const [sx, syBase] = toScreen(d.x, d.y);
          const pct = filter ? s.blocs[filter] ?? 0 : s.topPct;
          const sy = syBase - columnHeight(pct, filter !== null);
          const sel = { d, s, sx, sy };
          return (
            <Column
              key={d.slug}
              d={d}
              s={s}
              filter={filter}
              delay={Math.round((d.y / H) * 500)}
              onEnter={coarse ? () => {} : () => onSelect(sel)}
              onLeave={coarse ? () => {} : () => onSelect(null)}
              onTap={(() => {
                if (!coarse) return () => go(d.slug);
                return () => onSelect(sel);
              })()}
            />
          );
        })}
      </g>
    </svg>
  );
}

// ─── Vue plan (rendu serveur, sans JS) ───────────────────────────────────────
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
  year,
  coarse,
  locale,
  onSelect,
}: {
  dots: PoliticalDot[];
  year: Year;
  coarse: boolean;
  locale: "fr" | "en";
  onSelect: (d: Selected) => void;
}) {
  const cityHref = (slug: string) => (locale === "en" ? `/cities/${slug}` : `/villes/${slug}`);
  return (
    <>
      {dots.map((d) => {
        const s = shownFor(d, year);
        const sel = { d, s, sx: d.x, sy: d.y };
        return (
          <a
            key={d.slug}
            href={cityHref(d.slug)}
            aria-label={`${d.name} — ${BLOC_LABEL[locale][s.lean]} ${s.topPct}%`}
            className="pm-dot"
            data-b={s.lean}
            // Same rule as the homepage heatmap: on touch the first tap opens
            // the card rather than the city, because the dots are dense.
            onClick={
              coarse
                ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(sel);
                  }
                : undefined
            }
            onMouseEnter={coarse ? undefined : () => onSelect(sel)}
            onMouseLeave={coarse ? undefined : () => onSelect(null)}
            onFocus={() => onSelect(sel)}
            onBlur={() => onSelect(null)}
          >
            <circle cx={d.x} cy={d.y} r={d.r} fill={BLOC_COLORS[s.lean]} stroke="white" strokeWidth="0.9" />
          </a>
        );
      })}
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
  const [year, setYear] = useState<Year>("2027");
  const [view, setView] = useState<View>("3d");
  // Set after mount so the prerendered dots hydrate with matching handlers,
  // and so the relief (client-only, ~1 500 paths) never weighs on the HTML.
  const [coarse, setCoarse] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setCoarse(mq.matches);
    setMounted(true);
    const onChange = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const counts = useMemo(() => {
    const out = {} as Record<Bloc, number>;
    for (const b of BLOC_ORDER) out[b] = 0;
    for (const d of dots) out[shownFor(d, year).lean] += 1;
    return out;
  }, [dots, year]);

  const present = BLOC_ORDER.filter((b) => counts[b] > 0 || b === filter);
  const relief = mounted && view === "3d";
  // L'anglais garde la vue plan : le relief navigue vers les URL FR.
  const reliefAllowed = locale === "fr";

  const seg = (on: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
      on ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    }`;

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-[var(--border)] p-0.5" role="group" aria-label={L("Année", "Year")}>
          <button type="button" className={seg(year === "2027")} aria-pressed={year === "2027"} onClick={() => setYear("2027")}>
            {L("2027 · projection", "2027 · projection")}
          </button>
          <button type="button" className={seg(year === "2022")} aria-pressed={year === "2022"} onClick={() => setYear("2022")}>
            {L("2022 · résultat", "2022 · result")}
          </button>
        </div>
        {reliefAllowed && (
          <div className="inline-flex rounded-full border border-[var(--border)] p-0.5" role="group" aria-label="Vue">
            <button type="button" className={seg(view === "3d")} aria-pressed={view === "3d"} onClick={() => setView("3d")}>
              ▲ Relief
            </button>
            <button type="button" className={seg(view === "2d")} aria-pressed={view === "2d"} onClick={() => setView("2d")}>
              ◉ Plan
            </button>
          </div>
        )}
      </div>

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
          {L("En tête", "Leader")} · {dots.length}
        </button>
        {(present.length ? present : BLOC_ORDER).map((b) => {
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
        {relief && reliefAllowed ? (
          <ReliefMap dots={dots} year={year} filter={filter} coarse={coarse} onSelect={setSel} />
        ) : (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto"
            role="img"
            aria-label={L(
              "Carte de France des villes colorées par famille politique en tête",
              "Map of France with cities coloured by the leading political bloc",
            )}
            onClick={coarse ? () => setSel(null) : undefined}
          >
            <style>{DOT_CSS}</style>
            <path d={BORDER_PATH} fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1.5" />
            <path d={CORSICA_PATH} fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1.5" />
            <g className="pm-dots" data-filter={filter ?? "all"}>
              <DotLayer dots={dots} year={year} coarse={coarse} locale={locale} onSelect={setSel} />
            </g>
            {sel && (
              <g pointerEvents="none">
                <circle cx={sel.d.x} cy={sel.d.y} r={sel.d.r + 7} fill="none" stroke={BLOC_COLORS[sel.s.lean]} strokeWidth="2" />
              </g>
            )}
          </svg>
        )}

        {sel && (() => {
          const vbX = relief && reliefAllowed ? VB_X : 0;
          const vbY = relief && reliefAllowed ? VB_Y : 0;
          const vbW = relief && reliefAllowed ? VB_W : W;
          const vbH = relief && reliefAllowed ? VB_H : H;
          const xPct = ((sel.sx - vbX) / vbW) * 100;
          const yPct = ((sel.sy - vbY) / vbH) * 100;
          const flipX = xPct > 60;
          const flipY = yPct > 70;
          const s = sel.s;
          return (
            <Link
              href={locale === "en" ? `/cities/${sel.d.slug}` : `/villes/${sel.d.slug}`}
              className="absolute z-20 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 shadow-2xl"
              style={{
                left: flipX ? `calc(${xPct}% - 12px)` : `calc(${xPct}% + 12px)`,
                top: flipY ? `calc(${yPct}% - 12px)` : `calc(${yPct}% + 12px)`,
                transform: `translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`,
                width: "min(250px, calc(100vw - 48px))",
              }}
            >
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-bold text-[var(--text-primary)]">{sel.d.name}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-[var(--text-primary)]">
                  {filter ? `${s.blocs[filter] ?? 0}%` : `${s.topPct}%`}
                </span>
              </div>
              <div className="mb-2 flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: BLOC_COLORS[s.lean] }} />
                  {BLOC_LABEL[locale][s.lean]} {L("en tête", "ahead")}
                </span>
                <span className="text-[var(--text-tertiary)]">
                  {year === "2027"
                    ? L("projection 2027", "2027 projection")
                    : sel.d.topCand
                      ? `${CANDIDATE_BY_KEY[sel.d.topCand].name} ${sel.d.topCandPct}%`
                      : "2022"}
                </span>
              </div>
              <div className="flex h-2 w-full gap-[2px] overflow-hidden rounded-full" aria-hidden>
                {BLOC_ORDER.filter((b) => s.blocs[b] > 0).map((b) => (
                  <span key={b} style={{ width: `${s.blocs[b]}%`, backgroundColor: BLOC_COLORS[b] }} />
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
        {relief && reliefAllowed
          ? filter
            ? `Hauteur de chaque colonne : score de « ${BLOC_LABEL.fr[filter]} » dans la ville ${year === "2027" ? "(projection 2027)" : "(1ᵉʳ tour 2022)"}. Colonnes grisées : la famille y est présente mais pas en tête.`
            : `Hauteur de chaque colonne : score de la famille en tête ${year === "2027" ? "dans la projection 2027" : "au 1ᵉʳ tour 2022"}, mesuré au-dessus d'un plancher de ${LEAD_FLOOR} % pour que les écarts se voient ; couleur : cette famille. Survolez une colonne, cliquez pour ouvrir la fiche.`
          : L(
              `Un point par ville, coloré par la famille en tête ${year === "2027" ? "dans la projection 2027" : "au 1ᵉʳ tour 2022"}.`,
              `One dot per city, coloured by the leading bloc ${year === "2027" ? "in the 2027 projection" : "in the 2022 first round"}.`,
            )}{" "}
        {L(
          "La projection 2027 est mécanique (vote 2022 × évolution des sondages nationaux), pas un sondage local. Les DROM ne sont pas représentés sur ce fond de carte.",
          "The 2027 projection is mechanical (2022 vote × national poll swing), not a local poll. Overseas territories are not on this base map.",
        )}
      </p>
    </div>
  );
}
