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

import Link from "@/components/AppLink";
import { EmojiBadge } from "@/components/EmojiBadge";
import { scoreHex } from "@/lib/utils";
import {
  MAP_W as W,
  MAP_H,
  project,
  BORDER_PATH,
  CORSICA_PATH,
  inMetropolitanBox,
} from "@/lib/france-map-geo";

// The legend lives in HTML under the SVG (identité « Couleurs », 2026-11-15):
// drawn inside the viewBox it scaled down to ~3 px text on a 390 px phone.
const H = MAP_H;

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
    <figure className="my-4 overflow-hidden rounded-3xl bg-white ring-1 ring-[#C7D2FE] shadow-[0_18px_44px_-24px_rgba(79,70,229,0.55)]">
      <figcaption className="grad-head-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-5">
        <span className="flex items-center gap-2.5">
          <EmojiBadge emoji="🗺️" tone="pink" size="sm" />
          <span className="text-xs font-bold uppercase tracking-widest">
            {L("Carte cliquable", "Clickable map")}
          </span>
        </span>
        <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/40">
          {L(
            `${placed.length} départements métropolitains · outre-mer sous la carte`,
            `${placed.length} metropolitan departments · overseas below`,
          )}
        </span>
      </figcaption>

      <div className="bg-gradient-to-br from-[#EEF2FF] via-white to-[#ECFEFF] px-2 pt-3 pb-1 sm:px-5 sm:pt-5">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          role="img"
          aria-label={L(
            "Carte de France cliquable — chaque département est un lien vers sa page.",
            "Clickable map of France — each department is a link to its page.",
          )}
        >
          <defs>
            <linearGradient id="dept-map-land" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E0E7FF" />
              <stop offset="55%" stopColor="#FCE7F3" />
              <stop offset="100%" stopColor="#CFFAFE" />
            </linearGradient>
          </defs>

          {/* Base country outline — reuse the shared hand-traced path. */}
          <path
            d={BORDER_PATH}
            fill="url(#dept-map-land)"
            stroke="#A5B4FC"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d={CORSICA_PATH}
            fill="url(#dept-map-land)"
            stroke="#A5B4FC"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Faint stems for bubbles that got pushed off their true centroid. */}
          <g stroke="#4338CA" strokeWidth="0.7" strokeOpacity="0.4">
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
                    fillOpacity="0.95"
                    stroke="white"
                    strokeWidth="1.6"
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

          <style>{`
            .dept-bubble { cursor: pointer; transition: transform 0.12s ease; transform-box: fill-box; transform-origin: center; outline: none; }
            .dept-bubble circle { filter: drop-shadow(0 2px 3px rgba(67, 56, 202, 0.28)); }
            .dept-bubble:hover circle { fill-opacity: 1; stroke-width: 2.2; }
            .dept-bubble:hover { transform: scale(1.08); }
            .dept-bubble:focus-visible circle { stroke: var(--accent); stroke-width: 2.8; }
          `}</style>
        </svg>
      </div>

      {/* Legend — HTML chips so they stay readable on a phone. */}
      <div className="border-t border-[#E0E7FF] px-4 py-4 sm:px-5">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-[#4338CA]">
          {L("Score moyen du département (10 = meilleur)", "Department average score (10 = best)")}
        </p>
        <ul className="flex flex-wrap gap-1.5 sm:gap-2">
          {tiers.map((t) => (
            <li
              key={t.min}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F7FF] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] ring-1 ring-[#E0E7FF]"
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: scoreHex(t.min + 0.01) }}
              />
              {L(t.label, t.labelEn)}
              <span className="font-mono-data text-[10.5px] text-[var(--text-tertiary)]">
                {t.min > 0 ? `≥ ${t.min.toFixed(1).replace(".", locale === "en" ? "." : ",")}` : `< 4${locale === "en" ? ".0" : ",0"}`}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
          {L(
            "Bulle = département, taille ∝ nombre de villes classées, couleur = score moyen. Île-de-France : bulles décalées (traits fins pour retrouver le centre réel).",
            "Bubble = department, size ∝ number of ranked cities, colour = average score. Île-de-France bubbles are offset (thin stems mark the true centre).",
          )}
        </p>
      </div>

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
