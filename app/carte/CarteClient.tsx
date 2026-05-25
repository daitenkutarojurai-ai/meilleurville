"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { DromStrip } from "@/components/DromStrip";
import { scoreHex as scoreColor } from "@/lib/utils";

type ScoreKey = "global" | "nature" | "cost" | "safety" | "transport" | "culture" | "remoteWork" | "schools";

const SCORE_OPTIONS: Array<{ key: ScoreKey; label: string; emoji: string }> = [
  { key: "global", label: "Score global", emoji: "🌍" },
  { key: "nature", label: "Nature", emoji: "🌲" },
  { key: "cost", label: "Coût de vie", emoji: "💸" },
  { key: "safety", label: "Sécurité", emoji: "🛡️" },
  { key: "transport", label: "Transport", emoji: "🚆" },
  { key: "culture", label: "Culture", emoji: "🎭" },
  { key: "remoteWork", label: "Télétravail", emoji: "💻" },
  { key: "schools", label: "Écoles", emoji: "🎓" },
];

// Hand-traced French border (lng, lat) — closed polygon (same as homepage map)
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

// Hand-traced Corsica polygon (lng, lat) — same as homepage map
const CORSICA: Array<[number, number]> = [
  [9.45, 43.02], [9.56, 42.85], [9.55, 42.55], [9.52, 42.13],
  [9.40, 41.85], [9.28, 41.55], [9.17, 41.38], [9.05, 41.40],
  [8.79, 41.56], [8.65, 41.92], [8.55, 42.10], [8.65, 42.40],
  [8.55, 42.55], [8.85, 42.75], [9.10, 42.93], [9.25, 43.00],
  [9.45, 43.02],
];

const LNG_MIN = -5.6;
const LNG_MAX = 9.8;
const LAT_MIN = 41.2;
const LAT_MAX = 51.4;
const PAD = 22;
const W = 800;
const H = 820;
const SCALE_X = (W - PAD * 2) / (LNG_MAX - LNG_MIN);
const SCALE_Y = (H - PAD * 2) / (LAT_MAX - LAT_MIN);

function project(lng: number, lat: number): [number, number] {
  return [PAD + (lng - LNG_MIN) * SCALE_X, PAD + (LAT_MAX - lat) * SCALE_Y];
}

function isMetropolitan(lng: number, lat: number): boolean {
  return lng >= -6 && lng <= 10 && lat >= 40 && lat <= 52;
}

// scoreColor is imported above from @/lib/utils (single source of truth)

function scoreSize(score: number): number {
  return 5 + Math.max(0, score - 4) * 0.9;
}

function buildPath(points: Array<[number, number]>): string {
  return (
    "M " +
    points
      .map(([lng, lat]) => {
        const [x, y] = project(lng, lat);
        return `${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" L ") +
    " Z"
  );
}

const BORDER_PATH = buildPath(BORDER);
const CORSICA_PATH = buildPath(CORSICA);

interface HoverState {
  slug: string;
  x: number;
  y: number;
}

export function CarteClient() {
  const [scoreKey, setScoreKey] = useState<ScoreKey>("global");
  const [hover, setHover] = useState<HoverState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Cursor spotlight
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    function onMove(e: PointerEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    }
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  const sorted = useMemo(
    () => [...CITIES_SEED].sort((a, b) => b.scores[scoreKey] - a.scores[scoreKey]),
    [scoreKey]
  );

  const dots = useMemo(
    () =>
      [...CITIES_SEED]
        .filter((c) => isMetropolitan(c.longitude, c.latitude))
        .sort((a, b) =>
          is3D
            ? a.latitude - b.latitude   // 3D: south first (further from viewer)
            : a.scores[scoreKey] - b.scores[scoreKey]   // 2D: low scores drawn first (below)
        )
        .map((c, i) => {
          const [x, y] = project(c.longitude, c.latitude);
          return {
            slug: c.slug,
            name: c.name,
            region: c.region,
            score: c.scores[scoreKey],
            x,
            y,
            color: scoreColor(c.scores[scoreKey]),
            r: scoreSize(c.scores[scoreKey]),
            delay: i * 8,
          };
        }),
    [scoreKey, is3D]
  );

  const hovered = hover ? CITIES_SEED.find((c) => c.slug === hover.slug) : null;
  const housing = hovered ? HOUSING[hovered.slug] : null;
  const currentLabel = SCORE_OPTIONS.find((o) => o.key === scoreKey)?.label ?? "Score global";

  return (
    <div className="space-y-6">
      {/* Score chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SCORE_OPTIONS.map(({ key, label, emoji }) => {
          const active = scoreKey === key;
          return (
            <button
              key={key}
              onClick={() => setScoreKey(key)}
              className={
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all border " +
                (active
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent)]/30"
                  : "bg-white/70 backdrop-blur text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]")
              }
            >
              <span className="mr-1.5">{emoji}</span>
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Map */}
        <div
          ref={mapRef}
          className="group relative rounded-3xl border border-[#0F2419]/40 shadow-2xl shadow-[var(--accent)]/20 p-4 sm:p-6 overflow-hidden"
          style={{
            ["--mx" as never]: "50%",
            ["--my" as never]: "50%",
            background:
              "radial-gradient(ellipse 80% 100% at 50% 0%, #1F3A2A 0%, #15301F 55%, #0B1E14 100%)",
          }}
        >
          {/* Aurora glow */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl" aria-hidden>
            <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#22C55E]/25 blur-[120px]" />
            <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[#F59E0B]/15 blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#84CC16]/15 blur-[100px]" />
          </div>

          {/* Cursor spotlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(420px circle at var(--mx) var(--my), rgba(132,204,22,0.25), transparent 65%)",
            }}
          />
          <div className="grain rounded-3xl" style={{ opacity: 0.18, mixBlendMode: "overlay" }} />

          <div className="relative">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-[11px] uppercase tracking-widest text-[#84CC16]/80 font-semibold">
                {currentLabel} · {sorted.length} villes
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIs3D((v) => !v)}
                  className={
                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all border " +
                    (is3D
                      ? "bg-[#84CC16]/25 text-[#BEF264] border-[#84CC16]/50 ring-1 ring-[#84CC16]/30"
                      : "bg-white/5 text-[#84CC16]/70 border-[#84CC16]/20 hover:border-[#84CC16]/50")
                  }
                  aria-label="Basculer vue 3D"
                >
                  {is3D ? "▲ 3D" : "◉ 2D"}
                </button>
                <div
                  key={scoreKey}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#84CC16]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#BEF264] ring-1 ring-[#84CC16]/30"
                  style={{ animation: "carte-axis-pop 0.45s cubic-bezier(.34,1.56,.64,1) both" }}
                >
                  {SCORE_OPTIONS.find((o) => o.key === scoreKey)?.emoji}{" "}
                  <span>Coloriage : {currentLabel}</span>
                </div>
              </div>
            </div>

            <div
              style={
                is3D
                  ? { perspective: "900px", perspectiveOrigin: "50% 5%" }
                  : {}
              }
            >
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto"
              role="img"
              aria-label="Carte de France des villes"
              style={
                is3D
                  ? {
                      transform: "rotateX(-52deg)",
                      transformOrigin: "50% 55%",
                      transition: "transform 0.55s cubic-bezier(.4,0,.2,1)",
                    }
                  : { transition: "transform 0.55s cubic-bezier(.4,0,.2,1)" }
              }
            >
              <defs>
                <radialGradient id="cFranceFill" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.18" />
                  <stop offset="60%" stopColor="#22C55E" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0F2419" stopOpacity="0.05" />
                </radialGradient>
                <linearGradient id="cFranceStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#15803D" />
                  <stop offset="50%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#84CC16" />
                </linearGradient>
                <filter id="cDotGlow" x="-150%" y="-150%" width="400%" height="400%">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="cBorderGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" />
                </filter>
                <filter id="cFranceShadow" x="-10%" y="-10%" width="120%" height="130%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
                  <feOffset dx="0" dy="8" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.45" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <pattern id="cGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(132,204,22,0.07)" strokeWidth="1" />
                </pattern>
                <clipPath id="cFranceClip">
                  <path d={BORDER_PATH} />
                  <path d={CORSICA_PATH} />
                </clipPath>
              </defs>

              {/* Grid */}
              <rect width={W} height={H} fill="url(#cGrid)" />

              {/* Heat layer (top cities for current metric) */}
              <g clipPath="url(#cFranceClip)" opacity="0.55" style={{ mixBlendMode: "screen" }}>
                {[...CITIES_SEED]
                  .filter((c) => isMetropolitan(c.longitude, c.latitude) && c.scores[scoreKey] >= 7.5)
                  .map((c) => {
                    const [x, y] = project(c.longitude, c.latitude);
                    const r = 70 + (c.scores[scoreKey] - 7.5) * 30;
                    return (
                      <radialGradient
                        key={`ch-${c.slug}`}
                        id={`cheat-${c.slug}`}
                        cx={x}
                        cy={y}
                        r={r}
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor={scoreColor(c.scores[scoreKey])} stopOpacity="0.55" />
                        <stop offset="100%" stopColor={scoreColor(c.scores[scoreKey])} stopOpacity="0" />
                      </radialGradient>
                    );
                  })}
                {[...CITIES_SEED]
                  .filter((c) => isMetropolitan(c.longitude, c.latitude) && c.scores[scoreKey] >= 7.5)
                  .map((c) => {
                    const [x, y] = project(c.longitude, c.latitude);
                    const r = 70 + (c.scores[scoreKey] - 7.5) * 30;
                    return (
                      <circle
                        key={`chc-${c.slug}`}
                        cx={x}
                        cy={y}
                        r={r}
                        fill={`url(#cheat-${c.slug})`}
                      />
                    );
                  })}
              </g>

              {/* France shape */}
              <path
                d={BORDER_PATH}
                fill="url(#cFranceFill)"
                stroke="url(#cFranceStroke)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 4400,
                  strokeDashoffset: mounted ? 0 : 4400,
                  transition: "stroke-dashoffset 2.4s cubic-bezier(0.2, 0.7, 0.2, 1)",
                  filter: "url(#cFranceShadow)",
                }}
              />
              <path
                d={BORDER_PATH}
                fill="none"
                stroke="rgba(132,204,22,0.45)"
                strokeWidth="6"
                strokeLinejoin="round"
                filter="url(#cBorderGlow)"
              />

              {/* Corsica shape */}
              <path
                d={CORSICA_PATH}
                fill="url(#cFranceFill)"
                stroke="url(#cFranceStroke)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 700,
                  strokeDashoffset: mounted ? 0 : 700,
                  transition: "stroke-dashoffset 2.4s cubic-bezier(0.2, 0.7, 0.2, 1)",
                  filter: "url(#cFranceShadow)",
                }}
              />
              <path
                d={CORSICA_PATH}
                fill="none"
                stroke="rgba(132,204,22,0.45)"
                strokeWidth="6"
                strokeLinejoin="round"
                filter="url(#cBorderGlow)"
              />

              {/* Pulsing rings for top tier */}
              {dots
                .filter((d) => d.score >= 7.5)
                .map((d, i) => (
                  <g key={`r-${d.slug}`} pointerEvents="none">
                    <circle cx={d.x} cy={d.y} r={d.r * 2.5} fill="none" stroke={d.color} strokeWidth="1.5" opacity="0.45">
                      <animate attributeName="r" values={`${d.r * 2};${d.r * 5};${d.r * 2}`} dur="2.8s" begin={`${(i * 0.15).toFixed(2)}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.55;0;0.55" dur="2.8s" begin={`${(i * 0.15).toFixed(2)}s`} repeatCount="indefinite" />
                    </circle>
                  </g>
                ))}

              {/* Clickable city marks */}
              <style>{`
                @keyframes carte-axis-pop {
                  0% { transform: scale(0.85); opacity: 0; }
                  60% { transform: scale(1.08); opacity: 1; }
                  100% { transform: scale(1); opacity: 1; }
                }
                .carte-dot circle { transition: fill 0.35s ease-out, r 0.45s cubic-bezier(.34,1.56,.64,1); }
                .carte-bar rect { transition: fill 0.35s ease-out; }
              `}</style>

              {is3D
                ? /* 3D column bars */
                  dots.map((d) => {
                    const barH = Math.max(8, d.score * 32);
                    const barW = Math.max(7, d.r * 2.2);
                    return (
                      <a
                        key={d.slug}
                        href={`/villes/${d.slug}`}
                        aria-label={`Voir ${d.name}`}
                        className="cursor-pointer carte-bar"
                        style={{
                          opacity: mounted ? 1 : 0,
                          transition: `opacity 0.4s ease ${d.delay}ms`,
                        }}
                        onMouseEnter={() => setHover({ slug: d.slug, x: d.x, y: d.y })}
                        onMouseLeave={() => setHover(null)}
                      >
                        {/* Ground shadow */}
                        <ellipse cx={d.x} cy={d.y + 2} rx={barW * 0.75} ry={barW * 0.28} fill="#000" opacity="0.35" />
                        {/* Column body */}
                        <rect
                          x={d.x - barW / 2}
                          y={d.y - barH}
                          width={barW}
                          height={barH}
                          fill={d.color}
                          opacity="0.82"
                          rx="2"
                        />
                        {/* Left dark face (depth illusion) */}
                        <rect
                          x={d.x - barW / 2}
                          y={d.y - barH}
                          width={barW * 0.18}
                          height={barH}
                          fill="#000"
                          opacity="0.22"
                          rx="2"
                        />
                        {/* Top cap highlight */}
                        <rect
                          x={d.x - barW / 2}
                          y={d.y - barH}
                          width={barW}
                          height={Math.max(3, barH * 0.12)}
                          fill="white"
                          opacity="0.28"
                          rx="2"
                        />
                      </a>
                    );
                  })
                : /* 2D dots (original) */
                  dots.map((d) => (
                    <a
                      key={d.slug}
                      href={`/villes/${d.slug}`}
                      aria-label={`Voir ${d.name}`}
                      className="cursor-pointer carte-dot"
                      style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "scale(1)" : "scale(0)",
                        transformOrigin: `${d.x}px ${d.y}px`,
                        transformBox: "view-box",
                        transition: `opacity 0.4s ease ${d.delay}ms, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${d.delay}ms`,
                      }}
                      onMouseEnter={() => setHover({ slug: d.slug, x: d.x, y: d.y })}
                      onMouseLeave={() => setHover(null)}
                    >
                      <circle cx={d.x} cy={d.y} r={d.r * 2.6} fill={d.color} opacity="0.18" filter="url(#cDotGlow)" />
                      <circle cx={d.x} cy={d.y} r={d.r * 1.6} fill={d.color} opacity="0.35" />
                      <circle cx={d.x} cy={d.y} r={d.r} fill={d.color} stroke="white" strokeWidth="1" />
                    </a>
                  ))}

              {/* Hover label (2D only — 3D uses side panel) */}
              {!is3D && hover && hovered && (
                <g pointerEvents="none">
                  <circle cx={hover.x} cy={hover.y} r={14} fill="none" stroke={scoreColor(hovered.scores[scoreKey])} strokeWidth="2" opacity="0.7">
                    <animate attributeName="r" values="12;20;12" dur="1.4s" repeatCount="indefinite" />
                  </circle>
                  <text
                    x={hover.x}
                    y={hover.y - 16}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="white"
                    style={{ paintOrder: "stroke", stroke: "#0B1E14", strokeWidth: 4, strokeLinejoin: "round" }}
                  >
                    {hovered.name}
                  </text>
                </g>
              )}
            </svg>
            </div>{/* end perspective wrapper */}
          </div>

          {/* Legend */}
          <div className="relative mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <span className="text-[#A8C4A8]">Score :</span>
            {[
              { c: "#EF4444", l: "< 4.0" },
              { c: "#F97316", l: "4.0–5.0" },
              { c: "#F59E0B", l: "5.0–6.0" },
              { c: "#84CC16", l: "6.0–7.0" },
              { c: "#16A34A", l: "7.0–7.5" },
              { c: "#A855F7", l: "≥ 7.5 ✦" },
            ].map((s) => (
              <span key={s.l} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.c, boxShadow: `0 0 10px ${s.c}` }} />
                <span className="text-[#C4D5C0] font-mono-data">{s.l}</span>
              </span>
            ))}
            <span className="ml-auto text-[#A8C4A8]">
              {is3D
                ? "Vue 3D — hauteur = score · cliquez pour ouvrir la fiche"
                : "Cliquez sur un point pour ouvrir la fiche"}
            </span>
          </div>

          <DromStrip />
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {hovered ? (
            <Link
              href={`/villes/${hovered.slug}`}
              className="block rounded-2xl border border-[var(--accent)]/30 glass-strong p-5 hover:scale-[1.02] transition-all shadow-lg"
            >
              <div className="text-xs text-[var(--text-tertiary)] mb-1">
                {hovered.region} · {hovered.department}
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{hovered.name}</h3>
              <div className="text-3xl font-black font-mono-data mb-3" style={{ color: scoreColor(hovered.scores[scoreKey]) }}>
                {hovered.scores[scoreKey].toFixed(1)}
                <span className="text-sm font-normal text-[var(--text-tertiary)]">/10</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {(["global", "nature", "cost", "safety", "transport", "culture"] as ScoreKey[]).map((k) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-16 text-[var(--text-secondary)] capitalize">{k}</span>
                    <div className="flex-1 h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(hovered.scores[k] / 10) * 100}%`,
                          background: scoreColor(hovered.scores[k]),
                        }}
                      />
                    </div>
                    <span className="font-mono-data font-semibold w-8 text-right" style={{ color: scoreColor(hovered.scores[k]) }}>
                      {hovered.scores[k].toFixed(1)}
                    </span>
                  </div>
                ))}
                {housing && (
                  <div className="flex justify-between pt-2 mt-1 border-t border-[var(--border)]">
                    <span className="text-[var(--text-secondary)]">Loyer T2</span>
                    <span className="font-semibold text-[var(--text-primary)]">{housing.avgRentT2}€/mois</span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center rounded-xl bg-[var(--accent)] text-white text-xs font-semibold py-2">
                Voir la fiche complète →
              </div>
            </Link>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] glass p-5">
              <p className="text-xs text-[var(--text-tertiary)] mb-3 uppercase tracking-widest font-semibold">
                Top 10 — {currentLabel}
              </p>
              <div className="space-y-2">
                {sorted.slice(0, 10).map((city, i) => (
                  <Link
                    key={city.slug}
                    href={`/villes/${city.slug}`}
                    className="flex items-center gap-3 group rounded-lg p-2 hover:bg-[var(--bg-elevated)] transition-colors"
                    onMouseEnter={() => {
                      const [x, y] = project(city.longitude, city.latitude);
                      setHover({ slug: city.slug, x, y });
                    }}
                    onMouseLeave={() => setHover(null)}
                  >
                    <span className="text-[10px] font-mono-data text-[var(--text-tertiary)] w-4">{i + 1}</span>
                    <span className="flex-1 text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {city.name}
                    </span>
                    <span className="text-sm font-bold font-mono-data" style={{ color: scoreColor(city.scores[scoreKey]) }}>
                      {city.scores[scoreKey].toFixed(1)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Link
              href="/classements"
              className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
            >
              Classements thématiques →
            </Link>
            <Link
              href="/quiz"
              className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2.5 text-sm text-center text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors font-semibold"
            >
              ✨ Quiz : trouver ma ville →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
