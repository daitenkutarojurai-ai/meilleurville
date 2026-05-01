"use client";
import { useMemo, useRef, useState, useEffect } from "react";
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

const LNG_MIN = -5.6;
const LNG_MAX = 9.8;
const LAT_MIN = 41.2;
const LAT_MAX = 51.4;
const PAD = 22;
const W = 700;
const H = 720;

const SCALE_X = (W - PAD * 2) / (LNG_MAX - LNG_MIN);
const SCALE_Y = (H - PAD * 2) / (LAT_MAX - LAT_MIN);

function project(lng: number, lat: number): [number, number] {
  return [PAD + (lng - LNG_MIN) * SCALE_X, PAD + (LAT_MAX - lat) * SCALE_Y];
}

function scoreColor(score: number): string {
  if (score >= 8.5) return "#059669";
  if (score >= 7.5) return "#22C55E";
  if (score >= 6.5) return "#84CC16";
  if (score >= 5.5) return "#F59E0B";
  return "#FB923C";
}

function dotRadius(population: number): number {
  if (population > 500000) return 8;
  if (population > 200000) return 6;
  if (population > 80000) return 5;
  if (population > 30000) return 4;
  return 3;
}

const BORDER_PATH =
  "M " +
  BORDER.map(([lng, lat]) => {
    const [x, y] = project(lng, lat);
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" L ") +
  " Z";

interface HoverState {
  slug: string;
  name: string;
  region: string;
  population: number;
  scores: { global: number; nature: number; transport: number; cost: number };
  x: number;
  y: number;
  color: string;
}

export function FranceHeatmap() {
  const [hover, setHover] = useState<HoverState | null>(null);
  const [filter, setFilter] = useState<"all" | "top" | "budget" | "nature">("all");
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Cursor spotlight on the map surface
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    function onMove(e: PointerEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
    }
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  const dots = useMemo(() => {
    return [...CITIES_SEED]
      .filter((c) => {
        if (filter === "top") return c.scores.global >= 8.0;
        if (filter === "budget") return c.scores.cost >= 7.5;
        if (filter === "nature") return c.scores.nature >= 8.5;
        return true;
      })
      .sort((a, b) => a.scores.global - b.scores.global)
      .map((c, i) => {
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
          delay: i * 12,
          scores: c.scores,
        };
      });
  }, [filter]);

  const top3 = useMemo(
    () => [...CITIES_SEED].sort((a, b) => b.scores.global - a.scores.global).slice(0, 3),
    []
  );

  const stats = useMemo(() => {
    const all = CITIES_SEED;
    const avg = all.reduce((s, c) => s + c.scores.global, 0) / all.length;
    const best = Math.max(...all.map((c) => c.scores.global));
    const top = all.filter((c) => c.scores.global >= 8.0).length;
    return { count: all.length, avg, best, top };
  }, []);

  return (
    <section className="relative overflow-hidden py-20 border-t border-[var(--border)]">
      {/* Aurora backdrop behind the map */}
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
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3">
            La France des <span className="font-display gradient-text-anim">bons coins</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Chaque point est une ville, chaque couleur sa note de qualité de vie.
            Survole pour les détails, clique pour explorer.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: "all" as const, label: "Toutes", emoji: "🌍" },
            { id: "top" as const, label: "Top villes (8+)", emoji: "🏆" },
            { id: "budget" as const, label: "Bon budget", emoji: "💸" },
            { id: "nature" as const, label: "Côté nature", emoji: "🌲" },
          ].map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all border " +
                  (active
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-[var(--accent)]/30"
                    : "bg-white/70 backdrop-blur text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]")
                }
              >
                <span className="mr-1.5">{f.emoji}</span>
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Map + side panel */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Map surface — glass card with cursor spotlight */}
          <div
            ref={mapRef}
            className="group relative rounded-3xl border border-white/60 glass-strong shadow-2xl shadow-[var(--accent)]/10 p-4 sm:p-6"
            style={{ ["--mx" as never]: "50%", ["--my" as never]: "50%" }}
          >
            {/* Cursor spotlight */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(360px circle at var(--mx) var(--my), rgba(22,163,74,0.18), transparent 60%)",
              }}
            />

            {/* Subtle grain on top */}
            <div className="grain grain-soft rounded-3xl" style={{ opacity: 0.18 }} />

            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="relative w-full h-auto"
              role="img"
              aria-label="Carte de France des villes notées"
            >
              <defs>
                <radialGradient id="franceFill" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#DCFCE7" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#F0F5E5" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#FAFBF4" stopOpacity="0.7" />
                </radialGradient>
                <linearGradient id="franceStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#15803D" />
                  <stop offset="50%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#84CC16" />
                </linearGradient>
                <filter id="dotGlow" x="-150%" y="-150%" width="400%" height="400%">
                  <feGaussianBlur stdDeviation="2.5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="borderGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" />
                </filter>
                <filter id="franceShadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
                  <feOffset dx="0" dy="8" result="offsetblur" />
                  <feComponentTransfer><feFuncA type="linear" slope="0.45" /></feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(22,163,74,0.06)" strokeWidth="1" />
                </pattern>
                <clipPath id="franceClip">
                  <path d={BORDER_PATH} />
                </clipPath>
              </defs>

              {/* Grid background */}
              <rect width={W} height={H} fill="url(#grid)" />

              {/* Soft outer glow shadow */}
              <path
                d={BORDER_PATH}
                fill="rgba(22,163,74,0.18)"
                filter="url(#borderGlow)"
                transform="translate(0 6)"
              />

              {/* Heat layer — radial gradients per top city, clipped to France */}
              <g clipPath="url(#franceClip)" opacity="0.55" style={{ mixBlendMode: "screen" }}>
                {[...CITIES_SEED]
                  .filter((c) => c.scores.global >= 7.5)
                  .map((c) => {
                    const [x, y] = project(c.longitude, c.latitude);
                    const r = 70 + (c.scores.global - 7.5) * 30;
                    return (
                      <radialGradient
                        key={`h-${c.slug}`}
                        id={`heat-${c.slug}`}
                        cx={x}
                        cy={y}
                        r={r}
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor={scoreColor(c.scores.global)} stopOpacity="0.55" />
                        <stop offset="100%" stopColor={scoreColor(c.scores.global)} stopOpacity="0" />
                      </radialGradient>
                    );
                  })}
                {[...CITIES_SEED]
                  .filter((c) => c.scores.global >= 7.5)
                  .map((c) => {
                    const [x, y] = project(c.longitude, c.latitude);
                    const r = 70 + (c.scores.global - 7.5) * 30;
                    return (
                      <circle
                        key={`hc-${c.slug}`}
                        cx={x}
                        cy={y}
                        r={r}
                        fill={`url(#heat-${c.slug})`}
                      />
                    );
                  })}
              </g>

              {/* France filled shape — animated draw on mount */}
              <path
                d={BORDER_PATH}
                fill="url(#franceFill)"
                stroke="url(#franceStroke)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 4400,
                  strokeDashoffset: mounted ? 0 : 4400,
                  transition: "stroke-dashoffset 2.4s cubic-bezier(0.2, 0.7, 0.2, 1)",
                  filter: "url(#franceShadow)",
                }}
              />

              {/* Soft inner glow border */}
              <path
                d={BORDER_PATH}
                fill="none"
                stroke="rgba(22,163,74,0.30)"
                strokeWidth="6"
                strokeLinejoin="round"
                filter="url(#borderGlow)"
              />

              {/* Top-tier expanding rings for cities ≥ 8.5 */}
              {dots
                .filter((d) => d.score >= 8.5)
                .map((d, i) => (
                  <g key={`r-${d.slug}`} pointerEvents="none">
                    <circle cx={d.x} cy={d.y} r={d.r * 2.5} fill="none" stroke={d.color} strokeWidth="1.5" opacity="0.45">
                      <animate attributeName="r" values={`${d.r * 2};${d.r * 5};${d.r * 2}`} dur="2.8s" begin={`${(i * 0.15).toFixed(2)}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.55;0;0.55" dur="2.8s" begin={`${(i * 0.15).toFixed(2)}s`} repeatCount="indefinite" />
                    </circle>
                    <circle cx={d.x} cy={d.y} r={d.r * 3.5} fill="none" stroke={d.color} strokeWidth="1" opacity="0.25">
                      <animate attributeName="r" values={`${d.r * 3};${d.r * 7};${d.r * 3}`} dur="3.4s" begin={`${(0.4 + i * 0.15).toFixed(2)}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="3.4s" begin={`${(0.4 + i * 0.15).toFixed(2)}s`} repeatCount="indefinite" />
                    </circle>
                  </g>
                ))}

              {/* City dots — staggered fade-in */}
              {dots.map((d) => (
                <g
                  key={d.slug}
                  className="cursor-pointer"
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "scale(1)" : "scale(0)",
                    transformOrigin: `${d.x}px ${d.y}px`,
                    transformBox: "view-box",
                    transition: `opacity 0.5s ease ${d.delay}ms, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${d.delay}ms`,
                  }}
                  onMouseEnter={() =>
                    setHover({
                      slug: d.slug,
                      name: d.name,
                      region: d.region,
                      population: d.population,
                      scores: { global: d.score, nature: d.scores.nature, transport: d.scores.transport, cost: d.scores.cost },
                      x: d.x,
                      y: d.y,
                      color: d.color,
                    })
                  }
                  onMouseLeave={() => setHover(null)}
                >
                  {/* Outer glow halo */}
                  <circle cx={d.x} cy={d.y} r={d.r * 2.6} fill={d.color} opacity="0.18" filter="url(#dotGlow)" />
                  {/* Mid glow */}
                  <circle cx={d.x} cy={d.y} r={d.r * 1.6} fill={d.color} opacity="0.35" />
                  {/* Core dot */}
                  <circle cx={d.x} cy={d.y} r={d.r} fill={d.color} stroke="white" strokeWidth="1" />
                </g>
              ))}

              {/* Hover ring */}
              {hover && (
                <g pointerEvents="none">
                  <circle cx={hover.x} cy={hover.y} r="14" fill="none" stroke={hover.color} strokeWidth="2" opacity="0.7">
                    <animate attributeName="r" values="12;20;12" dur="1.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={hover.x} cy={hover.y} r="26" fill="none" stroke={hover.color} strokeWidth="1" opacity="0.35" />
                </g>
              )}
            </svg>

            {/* Glass tooltip */}
            {hover && (
              <Link
                href={`/villes/${hover.slug}`}
                className="absolute pointer-events-auto rounded-2xl glass-strong border border-white/60 px-4 py-3 shadow-2xl shadow-[var(--accent)]/20 text-left transition-transform hover:scale-105 z-20"
                style={{
                  left: `calc(${(hover.x / W) * 100}% + 28px)`,
                  top: `calc(${(hover.y / H) * 100}% - 12px)`,
                  transform: "translate(0, -50%)",
                  minWidth: 220,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block h-3 w-3 rounded-full ring-2 ring-white shadow" style={{ background: hover.color }} />
                  <span className="text-base font-bold text-[var(--text-primary)]">{hover.name}</span>
                  <span
                    className="ml-auto text-base font-bold font-mono-data"
                    style={{ color: hover.color }}
                  >
                    {hover.scores.global.toFixed(1)}
                  </span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mb-2">{hover.region}</div>
                <div className="space-y-1">
                  {[
                    { label: "Nature", val: hover.scores.nature },
                    { label: "Transport", val: hover.scores.transport },
                    { label: "Coût", val: hover.scores.cost },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2 text-[10px]">
                      <span className="w-14 text-[var(--text-secondary)]">{s.label}</span>
                      <div className="flex-1 h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(s.val / 10) * 100}%`,
                            background: scoreColor(s.val),
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                      <span className="font-mono-data text-[var(--text-secondary)] w-6 text-right">{s.val.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[10px] text-[var(--accent)] font-semibold">Voir la fiche →</div>
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
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.c, boxShadow: `0 0 8px ${s.c}` }} />
                  <span className="text-[var(--text-secondary)] font-mono-data">{s.l}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <aside className="space-y-3">
            {/* Stats card */}
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-3">
                📊 Vue d&apos;ensemble
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">{stats.count}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">villes notées</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono-data text-[var(--accent)]">{stats.avg.toFixed(1)}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">score moyen</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono-data text-emerald-600">{stats.best.toFixed(1)}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">meilleure ville</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono-data text-[var(--accent-warm)]">{stats.top}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">villes ≥ 8.0</div>
                </div>
              </div>
            </div>

            {/* Podium */}
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-md">
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
                      className="flex items-center gap-3 rounded-xl bg-white/60 hover:bg-[var(--accent-soft)] hover:scale-[1.02] transition-all p-2.5 group ring-1 ring-white/60"
                    >
                      <span className="text-2xl flex-shrink-0">{medals[i]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                          {c.name}
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(c.scores.global / 10) * 100}%`,
                              background: `linear-gradient(90deg, ${scoreColor(c.scores.global)}, #84CC16)`,
                            }}
                          />
                        </div>
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

            <div className="rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent-soft)] to-white p-5 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-[var(--accent-warm)]/30 blur-2xl" aria-hidden />
              <p className="relative text-sm font-semibold text-[var(--accent)] mb-1">
                💡 Astuce
              </p>
              <p className="relative text-xs text-[var(--text-secondary)] leading-relaxed">
                Les gros points = grandes villes. Les petits = pépites de campagne.
                Plus c&apos;est vert, plus on s&apos;y sent bien.
              </p>
            </div>

            <Link
              href="/carte"
              className="block text-center rounded-2xl border-2 border-[var(--accent)]/30 bg-white hover:bg-[var(--accent-soft)] hover:border-[var(--accent)] transition-all p-4 shine"
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
