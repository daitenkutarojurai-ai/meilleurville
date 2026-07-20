"use client";
import { memo, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import type { MapCity } from "@/lib/cities-light";
import { DromStrip } from "@/components/DromStrip";
import { scoreHex } from "@/lib/utils";
import { regionToSlug } from "@/lib/regions";

import {
  MAP_W as W,
  MAP_H,
  PAD,
  project,
  BORDER_PATH,
  CORSICA_PATH,
} from "@/lib/france-map-geo";

// Metropolitan map fits in y[0, MAP_H]; the extra strip below (DROM_*) hosts
// the overseas cartouches so they no longer overlap the Provence / Corsica
// area, which is what y=534+ used to collide with.
const DROM_STRIP_H = 70;
const H = MAP_H + DROM_STRIP_H;

// scoreColor: use scoreHex from @/lib/utils
const scoreColor = scoreHex;

function dotRadius(population: number): number {
  if (population > 500000) return 8;
  if (population > 200000) return 6;
  if (population > 80000) return 5;
  if (population > 30000) return 4;
  return 3;
}

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

type ScoreKey = "global" | "nature" | "cost" | "safety" | "transport" | "culture" | "remoteWork" | "schools";

const SCORE_OPTIONS: Array<{ key: ScoreKey; label: string; labelEn: string; emoji: string }> = [
  { key: "global", label: "Score global", labelEn: "Overall score", emoji: "🌍" },
  { key: "nature", label: "Nature", labelEn: "Nature", emoji: "🌲" },
  { key: "cost", label: "Coût de vie", labelEn: "Cost of living", emoji: "💸" },
  { key: "safety", label: "Sécurité", labelEn: "Safety", emoji: "🛡️" },
  { key: "transport", label: "Transport", labelEn: "Transport", emoji: "🚆" },
  { key: "culture", label: "Culture", labelEn: "Culture", emoji: "🎭" },
  { key: "remoteWork", label: "Télétravail", labelEn: "Remote work", emoji: "💻" },
  { key: "schools", label: "Écoles", labelEn: "Schools", emoji: "🎓" },
];

interface Dot {
  slug: string;
  name: string;
  region: string;
  score: number;
  population: number;
  x: number;
  y: number;
  color: string;
  r: number;
  delay: number;
  scores: MapCity["scores"];
}

// Static heat-gradient layer — memoised so hovering a dot (which only changes
// the tooltip/highlight state) doesn't re-render these SVG nodes.
// One shared gradient per score-tier colour (objectBoundingBox scales it to
// each circle's bbox) — the old per-city userSpaceOnUse defs put ~190 gradient
// definitions (~300 KB) into the landing page HTML for an identical render.
const HeatLayer = memo(function HeatLayer({ cities, scoreKey }: { cities: MapCity[]; scoreKey: ScoreKey }) {
  const hot = cities.filter((c) => c.scores[scoreKey] >= 6.0);
  const tierHexes = [...new Set(hot.map((c) => scoreColor(c.scores[scoreKey])))];
  return (
    <g clipPath="url(#franceClip)" opacity="0.55" style={{ mixBlendMode: "screen" }}>
      {tierHexes.map((hex) => (
        <radialGradient key={hex} id={`heat-${hex.slice(1)}`}>
          <stop offset="0%" stopColor={hex} stopOpacity="0.55" />
          <stop offset="100%" stopColor={hex} stopOpacity="0" />
        </radialGradient>
      ))}
      {hot.map((c) => {
        const [x, y] = project(c.longitude, c.latitude);
        const r = 70 + (c.scores[scoreKey] - 6.0) * 30;
        return (
          <circle
            key={`hc-${c.slug}`}
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r={Math.round(r)}
            fill={`url(#heat-${scoreColor(c.scores[scoreKey]).slice(1)})`}
          />
        );
      })}
    </g>
  );
});

// Static dot layer — memoised: `dots` only changes on axis switch, `onHover`
// is the stable setState, so hover re-renders skip these ~1,600 SVG nodes.
const CityDotLayer = memo(function CityDotLayer({
  dots,
  mounted,
  locale,
  coarse,
  onHover,
}: {
  dots: Dot[];
  mounted: boolean;
  locale: "fr" | "en";
  coarse: boolean;
  onHover: (h: HoverState | null) => void;
}) {
  const cityHref = (slug: string) => (locale === "en" ? `/cities/${slug}` : `/villes/${slug}`);
  return (
    <g>
      {dots.map((d) => {
        const hoverPayload = {
          slug: d.slug,
          name: d.name,
          region: d.region,
          population: d.population,
          scores: { global: d.score, nature: d.scores.nature, transport: d.scores.transport, cost: d.scores.cost },
          x: d.x,
          y: d.y,
          color: d.color,
        };
        return (
          <a
            key={d.slug}
            href={cityHref(d.slug)}
            aria-label={
              locale === "en"
                ? `${d.name} (${d.region}) — score ${d.score.toFixed(1)} out of 10`
                : `${d.name} (${d.region}) — score ${d.score.toFixed(1)} sur 10`
            }
            className={`cursor-pointer fh-dot outline-none focus-visible:[outline:2px_solid_white] focus-visible:[outline-offset:2px]${mounted ? " fh-dot-in" : ""}`}
            style={{
              // Animation lives in .fh-dot/.fh-dot-in (globals.css) — the old
              // per-dot inline transition strings were ~120 KB of HTML ×540.
              transformOrigin: `${d.x}px ${d.y}px`,
              "--fhd": `${d.delay}ms`,
            } as React.CSSProperties}
            // On touch there is no hover state to preview with: a tap would go
            // straight to the city page, and the dots are dense enough that the
            // one you hit is often not the one you aimed at. So the first tap
            // opens the card, and the card itself is the link.
            onClick={
              coarse
                ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onHover(hoverPayload);
                  }
                : undefined
            }
            onMouseEnter={coarse ? undefined : () => onHover(hoverPayload)}
            onMouseLeave={coarse ? undefined : () => onHover(null)}
            onFocus={() => onHover(hoverPayload)}
            onBlur={() => onHover(null)}
          >
            {/* The glow halo is decoration; leaving it hit-testable makes each
                dot a r*2.6 target that swallows its neighbours' taps. */}
            <circle cx={d.x} cy={d.y} r={d.r * 2.6} fill={d.color} opacity="0.18" filter="url(#dotGlow)" pointerEvents="none" />
            <circle cx={d.x} cy={d.y} r={d.r * 1.6} fill={d.color} opacity="0.35" pointerEvents={coarse ? "none" : undefined} />
            <circle cx={d.x} cy={d.y} r={d.r} fill={d.color} stroke="white" strokeWidth="1" />
          </a>
        );
      })}
    </g>
  );
});

export type DeptBubble = {
  dept: string;
  slug: string;
  longitude: number;
  latitude: number;
  n: number;
  scores: MapCity["scores"];
};

export function FranceHeatmap({ locale = "fr", showRegionToggle = false, cities, departments }: { locale?: "fr" | "en"; showRegionToggle?: boolean; cities: MapCity[]; departments?: DeptBubble[] }) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const optionLabel = (o: { label: string; labelEn: string }) => (locale === "en" ? o.labelEn : o.label);
  const cityHref = (slug: string) => (locale === "en" ? `/cities/${slug}` : `/villes/${slug}`);
  const [hover, setHover] = useState<HoverState | null>(null);
  const [scoreKey, setScoreKey] = useState<ScoreKey>("global");
  const [view, setView] = useState<"cities" | "regions" | "departments">("cities");
  const [mounted, setMounted] = useState(false);
  // Set after mount, not during render: the dots are prerendered and a
  // server/client disagreement on their handlers would be a hydration error.
  const [coarse, setCoarse] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setCoarse(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Cursor spotlight on the map surface
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    function onMove(e: PointerEvent) {
      if (!el) return;
      // Touch drags over the map are scrolls, not aim — tracking them makes the
      // spotlight lurch under the finger on every swipe.
      if (e.pointerType !== "mouse") return;
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
    return [...cities]
      .filter((c) => c.longitude >= -6 && c.longitude <= 10 && c.latitude >= 40 && c.latitude <= 52)
      .sort((a, b) => a.scores[scoreKey] - b.scores[scoreKey])
      .map((c, i) => {
        const [x, y] = project(c.longitude, c.latitude);
        return {
          slug: c.slug,
          name: c.name,
          region: c.region,
          score: c.scores[scoreKey],
          population: c.population,
          // 0.1px is plenty on a 700px viewBox — full floats add ~15 digits
          // per attribute × ~1,600 nodes of prerendered HTML.
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          color: scoreColor(c.scores[scoreKey]),
          r: dotRadius(c.population),
          delay: i * 12,
          scores: c.scores,
        };
      });
  }, [cities, scoreKey]);

  // Region aggregate layer — one bubble per metropolitan region at its city
  // centroid, coloured by the average of its cities' current-axis score.
  const regionAgg = useMemo(() => {
    const groups: Record<string, { sumLng: number; sumLat: number; sumScore: number; n: number }> = {};
    for (const c of cities) {
      if (!(c.longitude >= -6 && c.longitude <= 10 && c.latitude >= 40 && c.latitude <= 52)) continue;
      const g = (groups[c.region] ??= { sumLng: 0, sumLat: 0, sumScore: 0, n: 0 });
      g.sumLng += c.longitude;
      g.sumLat += c.latitude;
      g.sumScore += c.scores[scoreKey];
      g.n += 1;
    }
    return Object.entries(groups)
      .map(([region, g]) => {
        const avg = g.sumScore / g.n;
        const [x, y] = project(g.sumLng / g.n, g.sumLat / g.n);
        return { region, slug: regionToSlug(region), avg, n: g.n, x, y, color: scoreColor(avg), r: 16 + Math.sqrt(g.n) * 2.6 };
      })
      .sort((a, b) => b.r - a.r);
  }, [cities, scoreKey]);

  // Department aggregate bubbles — precomputed per-axis averages arrive via
  // the optional `departments` prop (only /map passes it), so the shared
  // homepage payload stays untouched.
  const deptAgg = useMemo(() => {
    if (!departments) return [];
    return departments
      .map((d) => {
        const avg = d.scores[scoreKey];
        const [x, y] = project(d.longitude, d.latitude);
        return { ...d, avg, x, y, color: scoreColor(avg), r: 9 + Math.sqrt(d.n) * 1.6 };
      })
      .sort((a, b) => b.r - a.r);
  }, [departments, scoreKey]);

  const top3 = useMemo(
    () => [...cities].sort((a, b) => b.scores.global - a.scores.global).slice(0, 3),
    [cities]
  );

  // Top city per DROM territory for the cartouche strip — memoised so hover
  // re-renders don't re-filter/sort the seed five times.
  const dromTops = useMemo(() => {
    const out: Record<string, MapCity | undefined> = {};
    for (const name of ["Guadeloupe", "Martinique", "Guyane", "La Réunion", "Mayotte"]) {
      out[name] = [...cities]
        .filter((c) => c.region === name)
        .sort((a, b) => b.scores[scoreKey] - a.scores[scoreKey])[0];
    }
    return out;
  }, [cities, scoreKey]);

  const stats = useMemo(() => {
    const all = cities;
    const avg = all.reduce((s, c) => s + c.scores.global, 0) / all.length;
    const best = Math.max(...all.map((c) => c.scores.global));
    const top = all.filter((c) => c.scores.global >= 7.0).length;
    return { count: all.length, avg, best, top };
  }, [cities]);

  return (
    <section className="relative overflow-hidden py-8 sm:py-20 border-t border-[var(--border)]">
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
            {L("🗺️ Carte de France", "🗺️ Map of France")}
          </p>
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3">
            {locale === "en" ? (
              <>The France of <span className="font-display gradient-text-anim">good spots</span></>
            ) : (
              <>La France des <span className="font-display gradient-text-anim">bons coins</span></>
            )}
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            {L(
              "Chaque point est une ville, chaque couleur sa note de qualité de vie. Survole pour les détails, clique pour explorer.",
              "Every dot is a city, every colour its quality-of-life score. Hover for the details, click to explore."
            )}
          </p>
        </div>

        {/* Score chips — colour the map by selected axis */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {SCORE_OPTIONS.map((opt) => {
            const { key, emoji } = opt;
            const active = scoreKey === key;
            return (
              <button
                key={key}
                onClick={() => setScoreKey(key)}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all border " +
                  (active
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-[var(--accent)]/30"
                    : "bg-white/70 backdrop-blur text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]")
                }
              >
                <span className="mr-1.5">{emoji}</span>
                {optionLabel(opt)}
              </button>
            );
          })}
        </div>

        {/* Villes / Régions layer toggle (opt-in via showRegionToggle) */}
        {showRegionToggle && (
          <div className="mb-3 flex justify-center">
            <div className="inline-flex rounded-full border border-[var(--border)] bg-white/70 backdrop-blur p-0.5 text-xs font-semibold">
              {(departments ? (["cities", "departments", "regions"] as const) : (["cities", "regions"] as const)).map((v) => (
                <button
                  key={v}
                  onClick={() => { setView(v); setHover(null); }}
                  aria-pressed={view === v}
                  className={
                    "rounded-full px-4 py-1.5 transition-all " +
                    (view === v
                      ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/30"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")
                  }
                >
                  {v === "cities" ? L("Villes", "Cities") : v === "departments" ? L("Départements", "Departments") : L("Régions", "Regions")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current colouring badge — pops on filter change */}
        <div className="mb-4 flex justify-center">
          <div
            key={scoreKey}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/12 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] ring-1 ring-[var(--accent)]/30"
            style={{ animation: "fh-axis-pop 0.45s cubic-bezier(.34,1.56,.64,1) both" }}
          >
            {SCORE_OPTIONS.find((o) => o.key === scoreKey)?.emoji}
            <span>
              {L("Coloriage par :", "Coloured by:")}{" "}
              {(() => {
                const o = SCORE_OPTIONS.find((x) => x.key === scoreKey);
                return o ? optionLabel(o) : "";
              })()}
            </span>
          </div>
        </div>

        {/* Legend — score color scale */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-[var(--text-tertiary)]">
          <span className="font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{L("Échelle de score", "Score scale")}</span>
          {(locale === "en"
            ? [
                { color: "#A855F7", label: "≥ 7.5 Exceptional" },
                { color: "#16A34A", label: "≥ 7.0 Excellent" },
                { color: "#84CC16", label: "≥ 6.0 Good" },
                { color: "#F59E0B", label: "≥ 5.0 Average" },
                { color: "#F97316", label: "≥ 4.0 Below par" },
                { color: "#EF4444", label: "< 4.0 Poor" },
              ]
            : [
                { color: "#A855F7", label: "≥ 7,5 Exceptionnel" },
                { color: "#16A34A", label: "≥ 7,0 Excellent" },
                { color: "#84CC16", label: "≥ 6,0 Bon" },
                { color: "#F59E0B", label: "≥ 5,0 Moyen" },
                { color: "#F97316", label: "≥ 4,0 En dessous" },
                { color: "#EF4444", label: "< 4,0 Mauvais" },
              ]
          ).map((tier) => (
            <span key={tier.label} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full shadow-sm"
                style={{ background: tier.color }}
              />
              {tier.label}
            </span>
          ))}
        </div>

        {/* Map + side panel */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Map surface — deep forest gradient with aurora glow + cursor spotlight */}
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
            {/* Aurora glow inside the surface */}
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

            {/* Grain on top */}
            <div className="grain rounded-3xl" style={{ opacity: 0.18, mixBlendMode: "overlay" }} />

            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="relative w-full h-auto"
              role="img"
              aria-label={L("Carte de France des villes notées", "Map of France with rated cities")}
              onClick={coarse ? () => setHover(null) : undefined}
            >
              <defs>
                <radialGradient id="franceFill" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.18" />
                  <stop offset="60%" stopColor="#22C55E" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0F2419" stopOpacity="0.05" />
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
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(132,204,22,0.07)" strokeWidth="1" />
                </pattern>
                <clipPath id="franceClip">
                  <path d={BORDER_PATH} />
                  <path d={CORSICA_PATH} />
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
              <path
                d={CORSICA_PATH}
                fill="rgba(22,163,74,0.18)"
                filter="url(#borderGlow)"
                transform="translate(0 6)"
              />

              {/* Heat layer — radial gradients per top city for current axis */}
              {view === "cities" && <HeatLayer cities={cities} scoreKey={scoreKey} />}

              {/* France filled shape — animated draw on mount */}
              <path
                d={BORDER_PATH}
                fill="url(#franceFill)"
                stroke="url(#franceStroke)"
                strokeWidth="2.5"
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
                stroke="rgba(132,204,22,0.45)"
                strokeWidth="6"
                strokeLinejoin="round"
                filter="url(#borderGlow)"
              />

              {/* Corsica filled shape */}
              <path
                d={CORSICA_PATH}
                fill="url(#franceFill)"
                stroke="url(#franceStroke)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 700,
                  strokeDashoffset: mounted ? 0 : 700,
                  transition: "stroke-dashoffset 2.4s cubic-bezier(0.2, 0.7, 0.2, 1)",
                  filter: "url(#franceShadow)",
                }}
              />
              <path
                d={CORSICA_PATH}
                fill="none"
                stroke="rgba(132,204,22,0.45)"
                strokeWidth="6"
                strokeLinejoin="round"
                filter="url(#borderGlow)"
              />

              {/* DROM inset cartouches — overseas regions on a dedicated strip
                  BELOW the metropolitan map (y > MAP_H). CITIES_SEED outside
                  the metropolitan bbox are filtered from the main dot layer
                  (lng/lat bounds), so we surface them here as small framed
                  labels colored by their top city. */}
              <g aria-label={L("Régions d'outre-mer", "Overseas regions")}>
                {/* Faint separator between metro map and DROM strip */}
                <line
                  x1={PAD}
                  x2={W - PAD}
                  y1={MAP_H}
                  y2={MAP_H}
                  stroke="rgba(229,231,235,0.15)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                {(() => {
                  const droms = [
                    { code: "GUA", name: "Guadeloupe", slug: "guadeloupe" },
                    { code: "MAR", name: "Martinique", slug: "martinique" },
                    { code: "GUY", name: "Guyane", slug: "guyane" },
                    { code: "REU", name: "La Réunion", slug: "la-reunion" },
                    { code: "MAY", name: "Mayotte", slug: "mayotte" },
                  ];
                  const boxW = 56;
                  const boxH = 32;
                  const gap = 6;
                  const totalW = droms.length * boxW + (droms.length - 1) * gap;
                  const startX = Math.round((W - totalW) / 2);
                  const startY = MAP_H + 22;
                  return droms.map((r, i) => {
                    const top = dromTops[r.name];
                    const color = top ? scoreColor(top.scores[scoreKey]) : "#94A3B8";
                    const x = startX + i * (boxW + gap);
                    return (
                      <g key={r.code} opacity={mounted ? 1 : 0} style={{ transition: `opacity 0.5s ease ${(800 + i * 60).toFixed(0)}ms` }}>
                        <rect
                          x={x}
                          y={startY}
                          width={boxW}
                          height={boxH}
                          rx={6}
                          ry={6}
                          fill="rgba(15,36,25,0.7)"
                          stroke={color}
                          strokeOpacity={0.8}
                          strokeWidth={1}
                        />
                        <text
                          x={x + boxW / 2}
                          y={startY + 13}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="700"
                          fill="#E5E7EB"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {r.code}
                        </text>
                        {top && (
                          <text
                            x={x + boxW / 2}
                            y={startY + 25}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                            fill={color}
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {top.scores[scoreKey].toFixed(1)}
                          </text>
                        )}
                      </g>
                    );
                  });
                })()}
                <text
                  x={W / 2}
                  y={MAP_H + 14}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="rgba(229,231,235,0.7)"
                  letterSpacing="1.5"
                  style={{ textTransform: "uppercase" }}
                >
                  {L("Outre-mer · score de la meilleure ville", "Overseas · top city score")}
                </text>
              </g>

              {/* Top-tier expanding rings for cities ≥ 7.5 */}
              {view === "cities" && dots
                .filter((d) => d.score >= 7.5)
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

              {/* CSS — dot fill transition + axis-pop animation */}
              <style>{`
                @keyframes fh-axis-pop {
                  0% { transform: scale(0.85); opacity: 0; }
                  60% { transform: scale(1.08); opacity: 1; }
                  100% { transform: scale(1); opacity: 1; }
                }
                .fh-dot circle { transition: fill 0.35s ease-out; }
              `}</style>

              {/* City dots — staggered fade-in, click to open city */}
              {view === "cities" && (
                <CityDotLayer dots={dots} mounted={mounted} locale={locale} coarse={coarse} onHover={setHover} />
              )}

              {/* Region aggregate bubbles — one per metropolitan region */}
              {view === "regions" && regionAgg.map((rg) => (
                <a
                  key={rg.region}
                  href={`/regions/${rg.slug}`}
                  aria-label={
                    locale === "en"
                      ? `${rg.region} — average score ${rg.avg.toFixed(1)} out of 10 (${rg.n} cities)`
                      : `${rg.region} — score moyen ${rg.avg.toFixed(1)} sur 10 (${rg.n} villes)`
                  }
                  className="cursor-pointer fh-dot outline-none focus-visible:[outline:2px_solid_white] focus-visible:[outline-offset:2px]"
                  style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}
                >
                  <circle cx={rg.x} cy={rg.y} r={rg.r * 1.7} fill={rg.color} opacity="0.18" filter="url(#dotGlow)" />
                  <circle cx={rg.x} cy={rg.y} r={rg.r} fill={rg.color} opacity="0.85" stroke="white" strokeWidth="1.5" />
                  <text x={rg.x} y={rg.y + 4} textAnchor="middle" fontSize="13" fontWeight="800" fill="white" style={{ paintOrder: "stroke", stroke: "#0B1E14", strokeWidth: 3, strokeLinejoin: "round" }}>
                    {rg.avg.toFixed(1)}
                  </text>
                  <text x={rg.x} y={rg.y + rg.r + 13} textAnchor="middle" fontSize="10" fontWeight="700" fill="#E5E7EB" style={{ paintOrder: "stroke", stroke: "#0B1E14", strokeWidth: 3.5, strokeLinejoin: "round" }}>
                    {rg.region}
                  </text>
                </a>
              ))}

              {/* Department aggregate bubbles — value inside, name in tooltip */}
              {view === "departments" && deptAgg.map((dg) => (
                <a
                  key={dg.dept}
                  href={`${locale === "en" ? "/departments" : "/departements"}/${dg.slug}`}
                  aria-label={
                    locale === "en"
                      ? `${dg.dept} — average score ${dg.avg.toFixed(1)} out of 10 (${dg.n} ${dg.n > 1 ? "cities" : "city"})`
                      : `${dg.dept} — score moyen ${dg.avg.toFixed(1)} sur 10 (${dg.n} ville${dg.n > 1 ? "s" : ""})`
                  }
                  className="cursor-pointer fh-dot outline-none focus-visible:[outline:2px_solid_white] focus-visible:[outline-offset:2px]"
                  style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s ease" }}
                >
                  <title>{`${dg.dept} · ${dg.avg.toFixed(1)}/10`}</title>
                  <circle cx={dg.x} cy={dg.y} r={dg.r * 1.5} fill={dg.color} opacity="0.15" filter="url(#dotGlow)" />
                  <circle cx={dg.x} cy={dg.y} r={dg.r} fill={dg.color} opacity="0.85" stroke="white" strokeWidth="1.2" />
                  <text x={dg.x} y={dg.y + 3} textAnchor="middle" fontSize="9" fontWeight="800" fill="white" style={{ paintOrder: "stroke", stroke: "#0B1E14", strokeWidth: 2.5, strokeLinejoin: "round" }}>
                    {dg.avg.toFixed(1)}
                  </text>
                </a>
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

            {/* Glass tooltip — viewport-aware, flips when near edges */}
            {hover && (() => {
              const xPct = (hover.x / W) * 100;
              const yPct = (hover.y / H) * 100;
              const flipX = xPct > 60;
              const flipY = yPct > 70;
              return (
                <Link
                  href={cityHref(hover.slug)}
                  className="absolute pointer-events-auto rounded-2xl glass-strong border border-white/60 px-5 py-4 shadow-2xl shadow-[var(--accent)]/30 text-left transition-transform hover:scale-[1.02] z-20"
                  style={{
                    left: flipX ? `calc(${xPct}% - 16px)` : `calc(${xPct}% + 16px)`,
                    top: flipY ? `calc(${yPct}% - 16px)` : `calc(${yPct}% + 16px)`,
                    transform: `translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`,
                    width: "min(280px, calc(100vw - 32px))",
                    maxWidth: 280,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block h-3.5 w-3.5 rounded-full ring-2 ring-white shadow" style={{ background: hover.color }} />
                    <span className="text-lg font-bold text-[var(--text-primary)] truncate">{hover.name}</span>
                    <span
                      className="ml-auto text-xl font-bold font-mono-data shrink-0"
                      style={{ color: hover.color }}
                    >
                      {hover.scores.global.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold mb-2 text-right text-[var(--text-tertiary)]">
                    {(() => {
                      const o = SCORE_OPTIONS.find((x) => x.key === scoreKey);
                      const lbl = o ? optionLabel(o) : "";
                      return locale === "en" ? <>on the {lbl} axis</> : <>sur l&apos;axe {lbl}</>;
                    })()}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mb-3 truncate">
                    {hover.region} · {hover.population.toLocaleString(locale === "en" ? "en-US" : "fr-FR")} {L("hab.", "pop.")}
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: L("Nature", "Nature"), val: hover.scores.nature },
                      { label: L("Transport", "Transport"), val: hover.scores.transport },
                      { label: L("Coût", "Cost"), val: hover.scores.cost },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 text-xs">
                        <span className="w-16 text-[var(--text-secondary)] font-medium">{s.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(s.val / 10) * 100}%`,
                              background: scoreColor(s.val),
                              transition: "width 0.4s ease",
                            }}
                          />
                        </div>
                        <span className="font-mono-data font-bold text-[var(--text-primary)] w-8 text-right">{s.val.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[var(--border)]/60 flex items-center justify-between gap-2">
                    <span className="text-xs text-[var(--accent)] font-semibold">
                      {L("Voir la fiche complète →", "See the full profile →")}
                    </span>
                    {coarse && (
                      <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">
                        {L("Touchez la carte pour fermer", "Tap the map to close")}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })()}

            {/* Screen reader fallback — text listing of map content */}
            <div className="sr-only">
              <h3>{L("Top 10 villes affichées sur la carte", "Top 10 cities shown on the map")}</h3>
              <ul>
                {[...dots]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 10)
                  .map((d) => (
                    <li key={`sr-${d.slug}`}>
                      <a href={cityHref(d.slug)}>
                        {d.name} ({d.region}) — {d.score.toFixed(1)}/10
                      </a>
                    </li>
                  ))}
              </ul>
              {locale === "en" ? (
                <p>For the full list, see the <Link href="/leaderboard">leaderboard</Link> or <Link href="/cities">all cities</Link>.</p>
              ) : (
                <p>Pour la liste complète, consulter la page <Link href="/leaderboard">leaderboard</Link> ou <Link href="/villes">toutes les villes</Link>.</p>
              )}
            </div>

            {/* Legend */}
            <div className="relative mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
              <span className="text-[#A8C4A8]">{L("Score :", "Score:")}</span>
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
            </div>

            <DromStrip locale={locale} cities={cities} />
          </div>

          {/* Side panel */}
          <aside className="space-y-3">
            {/* Stats card */}
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-3">
                {L("📊 Vue d'ensemble", "📊 Overview")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">{stats.count}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{L("villes notées", "rated cities")}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono-data text-[var(--accent)]">{stats.avg.toFixed(1)}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{L("score moyen", "average score")}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono-data" style={{ color: scoreColor(stats.best) }}>{stats.best.toFixed(1)}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{L("meilleure ville", "top city")}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono-data text-[var(--accent-warm)]">{stats.top}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">{L("villes ≥ 7.0", "cities ≥ 7.0")}</div>
                </div>
              </div>
            </div>

            {/* Podium */}
            <div className="rounded-2xl glass border border-white/50 p-5 shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] mb-3">
                {L("🏆 Podium national", "🏆 National podium")}
              </p>
              <div className="space-y-2">
                {top3.map((c, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <Link
                      key={c.slug}
                      href={cityHref(c.slug)}
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
                              background: `linear-gradient(90deg, ${scoreColor(c.scores.global)}, ${scoreColor(c.scores.global)}33)`,
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
                {L("💡 Astuce", "💡 Tip")}
              </p>
              <p className="relative text-xs text-[var(--text-secondary)] leading-relaxed">
                {L(
                  "Les gros points = grandes villes. Les petits = pépites de campagne.",
                  "Big dots = big cities. Small ones = countryside gems."
                )}
              </p>
              <ul className="relative mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[var(--text-secondary)]">
                <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "#A855F7" }} aria-hidden /> {L("Violet · exceptionnel", "Purple · exceptional")}</li>
                <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "#16A34A" }} aria-hidden /> {L("Vert · excellent", "Green · excellent")}</li>
                <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "#84CC16" }} aria-hidden /> {L("Lime · bon", "Lime · good")}</li>
                <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "#F59E0B" }} aria-hidden /> {L("Ambre · moyen", "Amber · average")}</li>
                <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "#F97316" }} aria-hidden /> {L("Orange · en dessous", "Orange · below par")}</li>
                <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "#EF4444" }} aria-hidden /> {L("Rouge · mauvais", "Red · poor")}</li>
              </ul>
            </div>

            <Link
              href={locale === "en" ? "/map" : "/carte"}
              className="block text-center rounded-2xl border-2 border-[var(--accent)]/30 bg-white hover:bg-[var(--accent-soft)] hover:border-[var(--accent)] transition-all p-4 shine"
            >
              <div className="text-sm font-bold text-[var(--accent)]">
                {L("Carte interactive complète →", "Full interactive map →")}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                {L("Filtres · Zoom · Cherche par critère", "Filters · Zoom · Search by criterion")}
              </div>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
