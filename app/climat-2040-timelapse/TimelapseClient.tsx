"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Thermometer, Sun, Moon, Play, Pause, ChevronRight } from "lucide-react";
import type { CityLight } from "@/lib/cities-light";
import {
  CLIMATE_TIMELINE_MIN_YEAR,
  CLIMATE_TIMELINE_MAX_YEAR,
  METRIC_META,
  interpolateClimate,
  metricColor,
  metricValue,
  type ClimateMetric,
} from "@/lib/climate-2040-timeline";

// French border + Corsica — reused from FranceHeatmap / CarteClient
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
const W = 700;
const H = 700;
const SCALE_X = (W - PAD * 2) / (LNG_MAX - LNG_MIN);
const SCALE_Y = (H - PAD * 2) / (LAT_MAX - LAT_MIN);

function project(lng: number, lat: number): [number, number] {
  return [PAD + (lng - LNG_MIN) * SCALE_X, PAD + (LAT_MAX - lat) * SCALE_Y];
}

function buildPath(points: Array<[number, number]>): string {
  return "M " + points.map(([lng, lat]) => {
    const [x, y] = project(lng, lat);
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" L ") + " Z";
}

const BORDER_PATH = buildPath(BORDER);
const CORSICA_PATH = buildPath(CORSICA);

const METRIC_KEYS: ClimateMetric[] = ["julyC", "days30C", "tropicalNights"];

const METRIC_ICON: Record<ClimateMetric, typeof Thermometer> = {
  julyC: Thermometer,
  days30C: Sun,
  tropicalNights: Moon,
};

const METRIC_LABEL_EN: Record<ClimateMetric, { label: string; unit: string }> = {
  julyC: { label: "July temperature", unit: "°C" },
  days30C: { label: "Days above 30 °C / yr", unit: "d" },
  tropicalNights: { label: "Tropical nights", unit: "n" },
};

// cities = the metropolitan subset, computed server-side (lib/cities-light) so
// the seed isn't bundled here.
export function TimelapseClient({ locale = "fr", cities }: { locale?: "fr" | "en"; cities: CityLight[] }) {
  const t = <T,>(fr: T, en: T): T => (locale === "en" ? en : fr);
  const cityHref = (slug: string) => (locale === "en" ? `/cities/${slug}` : `/villes/${slug}`);
  const metricLabel = (m: ClimateMetric) =>
    locale === "en" ? METRIC_LABEL_EN[m].label : METRIC_META[m].label;
  const metricUnit = (m: ClimateMetric) =>
    locale === "en" ? METRIC_LABEL_EN[m].unit : METRIC_META[m].unit;
  const [year, setYear] = useState(CLIMATE_TIMELINE_MIN_YEAR);
  const [metric, setMetric] = useState<ClimateMetric>("days30C");
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setYear((y) => {
        if (y >= CLIMATE_TIMELINE_MAX_YEAR) {
          setPlaying(false);
          return CLIMATE_TIMELINE_MAX_YEAR;
        }
        return y + 1;
      });
    }, 380);
    return () => clearInterval(t);
  }, [playing]);

  const interpolatedCities = useMemo(() => {
    return cities.map((c) => {
      const climate = interpolateClimate(c, year);
      const value = metricValue(climate, metric);
      const [x, y] = project(c.longitude, c.latitude);
      return {
        slug: c.slug,
        name: c.name,
        region: c.region,
        x,
        y,
        value,
        color: metricColor(metric, value),
        population: c.population ?? 0,
      };
    });
  }, [year, metric]);

  const top5 = useMemo(
    () => [...interpolatedCities].sort((a, b) => b.value - a.value).slice(0, 5),
    [interpolatedCities],
  );

  const avg = useMemo(() => {
    if (interpolatedCities.length === 0) return 0;
    return Math.round(
      (interpolatedCities.reduce((s, c) => s + c.value, 0) / interpolatedCities.length) * 10,
    ) / 10;
  }, [interpolatedCities]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          {METRIC_KEYS.map((m) => {
            const active = metric === m;
            const Icon = METRIC_ICON[m];
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all border inline-flex items-center gap-1.5 " +
                  (active
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent)]/30"
                    : "bg-[var(--bg-canvas)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/40")
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {metricLabel(m)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full bg-[var(--accent)] text-white h-10 w-10 inline-flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
            aria-label={playing ? t("Pause", "Pause") : t("Lecture", "Play")}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-tertiary)]">
                {t("Année projetée", "Projected year")}
              </span>
              <span className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">
                {year}
              </span>
            </div>
            <input
              type="range"
              min={CLIMATE_TIMELINE_MIN_YEAR}
              max={CLIMATE_TIMELINE_MAX_YEAR}
              step={1}
              value={year}
              onChange={(e) => {
                setPlaying(false);
                setYear(Number(e.target.value));
              }}
              aria-label={t("Année de projection", "Projection year")}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] font-mono-data mt-0.5">
              <span>{CLIMATE_TIMELINE_MIN_YEAR}</span>
              <span>{CLIMATE_TIMELINE_MAX_YEAR}</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-[var(--text-tertiary)] text-center">
          {t(
            <>
              Projection ARPEGE / GIEC interpolée linéairement par macro-région — pas
              une prévision ville par ville. Le 2040 affiché correspond à l&apos;horizon
              médian RCP4.5/8.5.
            </>,
            <>
              ARPEGE / IPCC projection interpolated linearly by macro-region — not a
              city-by-city forecast. The 2040 figure reflects the median RCP4.5/8.5
              horizon.
            </>,
          )}
        </p>
      </section>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Map */}
        <div className="rounded-3xl border border-[#0F2419]/40 shadow-2xl shadow-[var(--accent)]/20 p-4 sm:p-6 overflow-hidden"
          style={{
            background: "radial-gradient(ellipse 80% 100% at 50% 0%, #1F3A2A 0%, #15301F 55%, #0B1E14 100%)",
          }}>
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-widest font-semibold text-[#84CC16]/80">
            <span>{metricLabel(metric)}</span>
            <span>{t("moyenne France", "France average")} · <span className="text-white font-mono-data">{avg} {metricUnit(metric)}</span></span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${t("Carte timelapse climat", "Climate timelapse map")} ${year} — ${metricLabel(metric)}`}>
            <defs>
              <radialGradient id="tlFill" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#34D399" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#0F2419" stopOpacity="0.05" />
              </radialGradient>
              <filter id="tlDotGlow" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern id="tlGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(132,204,22,0.07)" strokeWidth="1" />
              </pattern>
              <style>{`
                .tl-dot circle { transition: fill 0.45s ease, r 0.45s ease; }
              `}</style>
            </defs>

            <rect width={W} height={H} fill="url(#tlGrid)" />

            <path d={BORDER_PATH} fill="url(#tlFill)" stroke="#84CC16" strokeOpacity="0.35" strokeWidth="1.5" />
            <path d={CORSICA_PATH} fill="url(#tlFill)" stroke="#84CC16" strokeOpacity="0.35" strokeWidth="1.5" />

            {interpolatedCities.map((c) => {
              const r = c.population > 200000 ? 7 : c.population > 80000 ? 5 : c.population > 30000 ? 4 : 3;
              return (
                <a key={c.slug} href={cityHref(c.slug)} aria-label={`${c.name} — ${c.value.toFixed(1)} ${metricUnit(metric)}`} className="tl-dot">
                  <circle cx={c.x} cy={c.y} r={r * 2.6} fill={c.color} opacity="0.18" filter="url(#tlDotGlow)" />
                  <circle cx={c.x} cy={c.y} r={r * 1.5} fill={c.color} opacity="0.35" />
                  <circle cx={c.x} cy={c.y} r={r} fill={c.color} stroke="white" strokeWidth="1" />
                </a>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] font-mono-data text-[#C4D5C0]">
            {[
              { c: "#3B82F6", l: t("très bas", "very low") },
              { c: "#22D3EE", l: t("bas", "low") },
              { c: "#84CC16", l: t("modéré", "moderate") },
              { c: "#F59E0B", l: t("élevé", "high") },
              { c: "#F97316", l: t("très élevé", "very high") },
              { c: "#EF4444", l: t("sévère", "severe") },
            ].map((s) => (
              <span key={s.l} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: s.c, boxShadow: `0 0 6px ${s.c}` }} />
                {s.l}
              </span>
            ))}
          </div>
        </div>

        {/* Sidebar — top affected */}
        <aside className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
              {t("Top 5 affectées en", "Top 5 most affected in")} {year}
            </h3>
            <ul className="space-y-1.5">
              {top5.map((c, i) => (
                <li key={c.slug}>
                  <Link href={cityHref(c.slug)} className="flex items-center gap-2 group">
                    <span className="text-[10px] font-mono-data text-[var(--text-tertiary)] w-4">{i + 1}</span>
                    <span className="flex-1 text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">{c.name}</span>
                    <span className="font-mono-data text-sm font-bold" style={{ color: c.color }}>
                      {c.value.toFixed(metricUnit(metric) === "°C" ? 1 : 0)}{metricUnit(metric) !== "°C" ? "" : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/guides?cat=climat-2040"
            className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] px-4 py-3 hover:border-[var(--accent)]/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {t("Guides Climat 2040", "Climate 2040 guides")}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                  {t("15 macro-régions analysées", "15 macro-regions analysed")}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
            </div>
          </Link>
        </aside>
      </div>
    </div>
  );
}
