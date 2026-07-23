// Clickable map of French metropolitan departments. Pure SSG, no client
// component — every dept is a plain <a>, so the map works with JS disabled
// (which the FR crawler grade depends on). Uses the shared projection from
// lib/france-map-geo so this canvas lines up pixel-for-pixel with the other
// map surfaces (heatmap, political map).
//
// A bubble per dept, positioned at the mean of its cities' coordinates, then
// relaxed to avoid the Île-de-France collision (8 depts inside a ~30 km box).
// We keep a subtle stem from the true centroid to the displaced bubble so the
// reader can tell where the actual dept sits.
//
// DROM are excluded (outside the metropolitan bbox); they surface via the
// finder grid below the map, and via /regions.

import Link from "next/link";
import { scoreHex } from "@/lib/utils";
import {
  MAP_W as W,
  MAP_H,
  project,
  BORDER_PATH,
  CORSICA_PATH,
  inMetropolitanBox,
} from "@/lib/france-map-geo";

// A little breathing room below the metropolitan canvas for a legend row.
const LEGEND_H = 44;
const H = MAP_H + LEGEND_H;

export interface DeptMapEntry {
  slug: string;
  dept: string;
  num: string;
  cities: number;
  avg: number;
  /** Weighted centroid (mean lng/lat of the dept's cities in the seed). */
  lng: number;
  lat: number;
}

interface Placed extends DeptMapEntry {
  cx: number;
  cy: number;
  ox: number; // original projected x — for the stem when displaced
  oy: number;
  r: number;
}

// Tiny relaxation pass: push overlapping bubbles apart. Cheap O(n² × iters)
// for n≈96 metropolitan depts — a few thousand ops at build time, negligible.
function relax(placed: Placed[], iters = 80, minGap = 2): void {
  const cx = placed.map((p) => p.cx);
  const cy = placed.map((p) => p.cy);
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const dx = cx[j] - cx[i];
        const dy = cy[j] - cy[i];
        const d = Math.hypot(dx, dy);
        const need = placed[i].r + placed[j].r + minGap;
        if (d < need && d > 0.001) {
          const push = (need - d) / 2;
          const ux = dx / d;
          const uy = dy / d;
          cx[i] -= ux * push;
          cy[i] -= uy * push;
          cx[j] += ux * push;
          cy[j] += uy * push;
        }
      }
    }
  }
  for (let i = 0; i < placed.length; i++) {
    placed[i].cx = cx[i];
    placed[i].cy = cy[i];
  }
}

function hrefFor(slug: string, locale: "fr" | "en"): string {
  return locale === "en" ? `/departments/${slug}` : `/departements/${slug}`;
}

export function DepartementMap({
  entries,
  locale = "fr",
}: {
  entries: DeptMapEntry[];
  locale?: "fr" | "en";
}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);

  // Metro only — DROM sit outside the projection bbox and would plot off-canvas.
  const metro = entries.filter((e) => inMetropolitanBox(e.lng, e.lat));

  const placed: Placed[] = metro.map((e) => {
    const [x, y] = project(e.lng, e.lat);
    // Modest size range so labels stay readable and layout stays tidy.
    const r = Math.max(14, Math.min(20, 12 + Math.sqrt(e.cities) * 1.6));
    return { ...e, cx: x, cy: y, ox: x, oy: y, r };
  });

  relax(placed);

  // Sort so lower-score bubbles paint under higher-score ones (a click on the
  // apparent top bubble goes to that dept, not a hidden neighbour).
  placed.sort((a, b) => a.avg - b.avg);

  // Legend tiers — mirror the 6-tier scale documented in CLAUDE.md.
  const tiers: Array<{ min: number; label: string; labelEn: string }> = [
    { min: 7.5, label: "Exceptionnel", labelEn: "Exceptional" },
    { min: 7.0, label: "Excellent", labelEn: "Excellent" },
    { min: 6.0, label: "Bon", labelEn: "Good" },
    { min: 5.0, label: "Moyen", labelEn: "Average" },
    { min: 4.0, label: "En dessous", labelEn: "Below" },
    { min: 0, label: "Faible", labelEn: "Weak" },
  ];

  return (
    <figure className="my-4 rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 sm:p-5 shadow-sm">
      <figcaption className="mb-2 flex items-baseline justify-between gap-2 px-1">
        <span className="text-[11px] uppercase tracking-widest font-semibold text-[var(--text-tertiary)]">
          {L("Carte cliquable", "Clickable map")}
        </span>
        <span className="text-[11px] text-[var(--text-tertiary)]">
          {L(
            `${placed.length} départements métropolitains · outre-mer sous la carte`,
            `${placed.length} metropolitan departments · overseas below`,
          )}
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label={L(
          "Carte de France cliquable — chaque département est un lien vers sa page.",
          "Clickable map of France — each department is a link to its page.",
        )}
      >
        {/* Base country outline — reuse the shared hand-traced path. */}
        <path
          d={BORDER_PATH}
          fill="var(--bg-elevated)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <path
          d={CORSICA_PATH}
          fill="var(--bg-elevated)"
          stroke="var(--border)"
          strokeWidth="1.5"
        />

        {/* Faint stems for bubbles that got pushed off their true centroid. */}
        <g stroke="var(--text-tertiary)" strokeWidth="0.6" strokeOpacity="0.35">
          {placed.map((p) => {
            const dx = p.cx - p.ox;
            const dy = p.cy - p.oy;
            if (Math.hypot(dx, dy) < 6) return null;
            return (
              <line
                key={`stem-${p.slug}`}
                x1={p.ox.toFixed(1)}
                y1={p.oy.toFixed(1)}
                x2={p.cx.toFixed(1)}
                y2={p.cy.toFixed(1)}
              />
            );
          })}
        </g>

        {/* Bubbles — a plain <a> wrapping <circle>+<text> so it stays a link
            when JS is off. Each one carries a <title> for hover tooltips. */}
        <g>
          {placed.map((p) => {
            const fill = scoreHex(p.avg);
            const label = L(
              `${p.dept} (${p.num}) — score moyen ${p.avg.toFixed(1)} sur 10, ${p.cities} ville${p.cities > 1 ? "s" : ""}`,
              `${p.dept} (${p.num}) — average score ${p.avg.toFixed(1)} out of 10, ${p.cities} cit${p.cities > 1 ? "ies" : "y"}`,
            );
            return (
              <a
                key={p.slug}
                href={hrefFor(p.slug, locale)}
                aria-label={label}
                className="dept-bubble"
              >
                <title>{label}</title>
                <circle
                  cx={p.cx.toFixed(1)}
                  cy={p.cy.toFixed(1)}
                  r={p.r.toFixed(1)}
                  fill={fill}
                  fillOpacity="0.92"
                  stroke="white"
                  strokeWidth="1.2"
                />
                <text
                  x={p.cx.toFixed(1)}
                  y={(p.cy + 0.5).toFixed(1)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={p.r > 17 ? 11 : 10}
                  fontWeight="700"
                  fill="white"
                  pointerEvents="none"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {p.num}
                </text>
              </a>
            );
          })}
        </g>

        {/* Legend row at the bottom of the SVG. */}
        <g transform={`translate(${W / 2}, ${MAP_H + 24})`}>
          {tiers.map((t, i) => {
            const cellW = 80;
            const totalW = cellW * tiers.length;
            const x = -totalW / 2 + i * cellW + cellW / 2;
            const hex = scoreHex(t.min + 0.01);
            return (
              <g key={t.min} transform={`translate(${x.toFixed(1)}, 0)`}>
                <circle cx="0" cy="0" r="6" fill={hex} />
                <text
                  x="0"
                  y="18"
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--text-tertiary)"
                >
                  {L(t.label, t.labelEn)}
                </text>
              </g>
            );
          })}
        </g>

        <style>{`
          .dept-bubble { cursor: pointer; transition: transform 0.12s ease; transform-box: fill-box; transform-origin: center; outline: none; }
          .dept-bubble:hover circle { fill-opacity: 1; stroke-width: 2; }
          .dept-bubble:hover { transform: scale(1.06); }
          .dept-bubble:focus-visible circle { stroke: var(--accent); stroke-width: 2.5; }
        `}</style>
      </svg>

      <p className="mt-1 px-1 text-[10.5px] text-[var(--text-tertiary)]">
        {L(
          "Bulle = département, taille ∝ nombre de villes classées, couleur = score moyen. Île-de-France : bulles décalées (traits fins pour retrouver le centre réel).",
          "Bubble = department, size ∝ number of ranked cities, colour = average score. Île-de-France bubbles are offset (thin stems mark the true centre).",
        )}
      </p>

      <div className="sr-only">
        <h2>{L("Liste des départements", "Departments list")}</h2>
        <ul>
          {placed.map((p) => (
            <li key={`sr-${p.slug}`}>
              <Link href={hrefFor(p.slug, locale)}>
                {p.num} {p.dept} — {p.avg.toFixed(1)}/10
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
