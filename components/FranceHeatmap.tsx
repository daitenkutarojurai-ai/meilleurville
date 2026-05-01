"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { CITIES_SEED } from "@/data/cities-seed";

// Hand-traced French border (lng, lat) — closed polygon
const BORDER: Array<[number, number]> = [
  [2.38, 51.04], [1.85, 50.95], [1.6, 50.7], [0.7, 50.0], [0.07, 49.51],
  [-1.0, 49.4], [-1.62, 49.64], [-1.95, 49.72], [-2.0, 49.0], [-3.0, 48.83],
  [-4.49, 48.39], [-4.7, 48.1], [-4.55, 47.85], [-4.10, 48.0], [-3.36, 47.74],
  [-2.6, 47.5], [-2.33, 47.22], [-1.85, 46.7], [-1.55, 46.5], [-1.15, 46.16],
  [-1.03, 45.62], [-1.16, 44.66], [-1.4, 44.2], [-1.47, 43.49], [-1.78, 43.36],
  [-0.7, 43.0], [0.5, 42.85], [1.7, 42.6], [2.89, 42.69], [3.17, 42.44],
  [3.6, 43.3], [4.6, 43.4], [5.37, 43.30], [5.93, 43.12], [6.6, 43.18],
  [7.27, 43.71], [7.50, 43.78], [7.0, 44.2], [6.85, 44.85], [6.95, 45.5],
  [7.05, 45.92], [6.85, 46.13], [6.14, 46.21], [6.1, 46.5], [6.45, 47.0],
  [6.95, 47.5], [7.34, 47.75], [7.55, 48.1], [7.75, 48.58], [8.0, 48.95],
  [8.18, 48.97], [7.5, 49.05], [6.95, 49.18], [6.5, 49.45], [6.0, 49.55],
  [5.5, 49.55], [4.85, 49.79], [4.85, 50.15], [4.2, 50.28], [3.7, 50.5],
  [3.06, 50.63], [2.6, 50.85], [2.38, 51.04],
];

// Project (lng, lat) → (x, y) in SVG using simple equirectangular with cos(46°) correction
const LNG_MIN = -5.6;
const LNG_MAX = 9.8;
const LAT_MIN = 41.2;
const LAT_MAX = 51.4;
const PAD = 18;
const W = 700;
const H = 720;

const SCALE_X = (W - PAD * 2) / (LNG_MAX - LNG_MIN);
const SCALE_Y = (H - PAD * 2) / (LAT_MAX - LAT_MIN);

function project(lng: number, lat: number): [number, number] {
  return [PAD + (lng - LNG_MIN) * SCALE_X, PAD + (LAT_MAX - lat) * SCALE_Y];
}

function scoreColor(score: number): string {
  if (score >= 8.5) return "#059669"; // emerald-600
  if (score >= 7.5) return "#22C55E"; // green-500
  if (score >= 6.5) return "#84CC16"; // lime-500
  if (score >= 5.5) return "#F59E0B"; // amber-500
  return "#FB923C"; // orange-400
}

function dotRadius(population: number): number {
  if (population > 500000) return 7;
  if (population > 200000) return 5.5;
  if (population > 80000) return 4.5;
  if (population > 30000) return 3.5;
  return 2.8;
}

const BORDER_PATH = "M " + BORDER.map(([lng, lat]) => {
  const [x, y] = project(lng, lat);
  return `${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" L ") + " Z";

interface HoverState {
  slug: string;
  name: string;
  region: string;
  score: number;
  x: number;
  y: number;
}

export function FranceHeatmap() {
  const [hover, setHover] = useState<HoverState | null>(null);

  const dots = useMemo(() => {
    return [...CITIES_SEED]
      // Sort so higher scores render on top
      .sort((a, b) => a.scores.global - b.scores.global)
      .map((c) => {
        const [x, y] = project(c.longitude, c.latitude);
        return {
          slug: c.slug,
          name: c.name,
          region: c.region,
          score: c.scores.global,
          population: c.population,
          x,
          y,
          color: scoreColor(c.scores.global),
          r: dotRadius(c.population),
        };
      });
  }, []);

  const top3 = useMemo(
    () =>
      [...CITIES_SEED]
        .sort((a, b) => b.scores.global - a.scores.global)
        .slice(0, 3),
    []
  );

  return (
    <section className="relative overflow-hidden py-20 border-t border-[var(--border)]">
      {/* Dark forest gradient backdrop only behind the map area */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgba(16,185,129,0.18),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_80%,rgba(245,158,11,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_25%_at_15%_20%,rgba(236,72,153,0.10),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🗺️ Carte de France
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            La France des <span className="gradient-text">bons coins</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            {`Chaque point = une ville. La couleur, c'est sa note de qualité de vie.
            Survole pour voir les détails, clique pour explorer.`}
          </p>
        </div>

        {/* Map + side panel */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
          {/* SVG map */}
          <div className="relative rounded-3xl border border-[var(--border)] bg-white/60 backdrop-blur-sm shadow-xl shadow-[var(--accent)]/10 p-4 sm:p-6">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto"
              role="img"
              aria-label="Carte de France des villes notées"
            >
              <defs>
                <radialGradient id="franceFill" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#DCFCE7" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#F0F5E5" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#FAFBF4" stopOpacity="0.7" />
                </radialGradient>
                <filter id="dotGlow" x="-150%" y="-150%" width="400%" height="400%">
                  <feGaussianBlur stdDeviation="2.5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="borderGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(22,163,74,0.06)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Grid background */}
              <rect width={W} height={H} fill="url(#grid)" />

              {/* France glow shadow */}
              <path
                d={BORDER_PATH}
                fill="rgba(22,163,74,0.18)"
                filter="url(#borderGlow)"
                transform="translate(0 4)"
              />

              {/* France filled shape */}
              <path
                d={BORDER_PATH}
                fill="url(#franceFill)"
                stroke="#16A34A"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Soft inner glow border */}
              <path
                d={BORDER_PATH}
                fill="none"
                stroke="rgba(22,163,74,0.25)"
                strokeWidth="6"
                strokeLinejoin="round"
                filter="url(#borderGlow)"
              />

              {/* City dots with glow */}
              {dots.map((d) => (
                <g
                  key={d.slug}
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHover({ slug: d.slug, name: d.name, region: d.region, score: d.score, x: d.x, y: d.y })
                  }
                  onMouseLeave={() => setHover(null)}
                >
                  {/* Outer glow halo */}
                  <circle
                    cx={d.x}
                    cy={d.y}
                    r={d.r * 2.6}
                    fill={d.color}
                    opacity="0.18"
                    filter="url(#dotGlow)"
                  >
                    {d.score >= 8.5 && (
                      <animate
                        attributeName="r"
                        values={`${d.r * 2.4};${d.r * 3.2};${d.r * 2.4}`}
                        dur="2.6s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                  {/* Mid glow */}
                  <circle cx={d.x} cy={d.y} r={d.r * 1.6} fill={d.color} opacity="0.35" />
                  {/* Core dot */}
                  <circle
                    cx={d.x}
                    cy={d.y}
                    r={d.r}
                    fill={d.color}
                    stroke="white"
                    strokeWidth="0.8"
                  />
                </g>
              ))}

              {/* Hover ring */}
              {hover && (
                <g pointerEvents="none">
                  <circle
                    cx={hover.x}
                    cy={hover.y}
                    r="14"
                    fill="none"
                    stroke="#1F3A2A"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                  <circle
                    cx={hover.x}
                    cy={hover.y}
                    r="22"
                    fill="none"
                    stroke="#1F3A2A"
                    strokeWidth="1"
                    opacity="0.25"
                  />
                </g>
              )}
            </svg>

            {/* Tooltip — absolute positioned over the SVG */}
            {hover && (
              <Link
                href={`/villes/${hover.slug}`}
                className="absolute pointer-events-auto rounded-xl border border-[var(--border)] bg-white px-3 py-2 shadow-xl shadow-[var(--accent)]/20 text-left transition-transform hover:scale-105"
                style={{
                  left: `calc(${(hover.x / W) * 100}% + 24px)`,
                  top: `calc(${(hover.y / H) * 100}% - 8px)`,
                  transform: "translate(0, -50%)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: scoreColor(hover.score) }}
                  />
                  <span className="text-sm font-bold text-[var(--text-primary)]">{hover.name}</span>
                  <span
                    className="text-sm font-bold font-mono-data"
                    style={{ color: scoreColor(hover.score) }}
                  >
                    {hover.score.toFixed(1)}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{hover.region}</div>
                <div className="text-[10px] text-[var(--accent)] mt-0.5 font-medium">Voir la fiche →</div>
              </Link>
            )}

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
              <span className="text-[var(--text-tertiary)]">Score :</span>
              {[
                { c: "#FB923C", l: "<5.5" },
                { c: "#F59E0B", l: "5.5–6.5" },
                { c: "#84CC16", l: "6.5–7.5" },
                { c: "#22C55E", l: "7.5–8.5" },
                { c: "#059669", l: "≥8.5" },
              ].map((s) => (
                <span key={s.l} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.c }} />
                  <span className="text-[var(--text-secondary)] font-mono-data">{s.l}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Side panel: top 3 + tip */}
          <aside className="space-y-3">
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-3">
                🏆 Podium national
              </p>
              <div className="space-y-2">
                {top3.map((c, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <Link
                      key={c.slug}
                      href={`/villes/${c.slug}`}
                      className="flex items-center gap-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--accent-soft)] hover:scale-[1.02] transition-all p-2.5 group"
                    >
                      <span className="text-xl flex-shrink-0">{medals[i]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-tertiary)] truncate">{c.region}</div>
                      </div>
                      <span
                        className="text-sm font-bold font-mono-data"
                        style={{ color: scoreColor(c.scores.global) }}
                      >
                        {c.scores.global.toFixed(1)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent-soft)] to-white p-5">
              <p className="text-sm font-semibold text-[var(--accent)] mb-1">
                💡 Astuce
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Les gros points = grandes villes. Les petits = pépites de campagne.
                Plus c&apos;est vert, plus on s&apos;y sent bien.
              </p>
            </div>

            <Link
              href="/carte"
              className="block text-center rounded-2xl border-2 border-[var(--accent)]/30 bg-white hover:bg-[var(--accent-soft)] hover:border-[var(--accent)] transition-all p-4"
            >
              <div className="text-sm font-bold text-[var(--accent)]">
                Carte interactive complète →
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                Filtres · Zoom · Cherche par critère
              </div>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
