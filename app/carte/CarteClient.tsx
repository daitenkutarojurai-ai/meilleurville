"use client";
import { useState } from "react";
import Link from "next/link";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";

type ScoreKey = "global" | "nature" | "cost" | "safety" | "transport" | "culture" | "remoteWork" | "schools";

const SCORE_OPTIONS: Array<{ key: ScoreKey; label: string }> = [
  { key: "global", label: "Score global" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Coût de vie" },
  { key: "safety", label: "Sécurité" },
  { key: "transport", label: "Transport" },
  { key: "culture", label: "Culture" },
  { key: "remoteWork", label: "Télétravail" },
];

function scoreColor(score: number): string {
  if (score >= 8.5) return "#10b981";
  if (score >= 7.5) return "#6366f1";
  if (score >= 6.5) return "#f59e0b";
  return "#ef4444";
}

function scoreSize(score: number): number {
  return 8 + (score - 5) * 4;
}

export function CarteClient() {
  const [scoreKey, setScoreKey] = useState<ScoreKey>("global");
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const sorted = [...CITIES_SEED].sort((a, b) => b.scores[scoreKey] - a.scores[scoreKey]);
  const hovered = hoveredCity ? CITIES_SEED.find((c) => c.slug === hoveredCity) : null;
  const housing = hoveredCity ? HOUSING[hoveredCity] : null;

  // France bounding box: lat 41.3 – 51.1, lng -5.1 – 9.6
  // SVG: 800×600
  function latLngToSvg(lat: number, lng: number) {
    const x = ((lng - (-5.1)) / (9.6 - (-5.1))) * 780 + 10;
    const y = ((51.1 - lat) / (51.1 - 41.3)) * 560 + 20;
    return { x, y };
  }

  return (
    <div className="space-y-6">
      {/* Score selector */}
      <div className="flex flex-wrap gap-2">
        {SCORE_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setScoreKey(key)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              scoreKey === key
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Map */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 overflow-hidden">
          <div className="text-xs text-[var(--text-tertiary)] mb-3">
            Survolez un point pour voir le détail · Cliquez pour ouvrir la fiche
          </div>
          <div className="relative w-full" style={{ paddingBottom: "75%" }}>
            <svg
              viewBox="0 0 800 600"
              className="absolute inset-0 w-full h-full"
              style={{ background: "var(--bg-canvas)" }}
            >
              {/* Subtle grid */}
              {[45, 47, 49, 51].map((lat) => {
                const { y } = latLngToSvg(lat, 0);
                return <line key={lat} x1="0" y1={y} x2="800" y2={y} stroke="var(--border)" strokeWidth="0.5" />;
              })}
              {[-4, -2, 0, 2, 4, 6, 8].map((lng) => {
                const { x } = latLngToSvg(47, lng);
                return <line key={lng} x1={x} y1="0" x2={x} y2="600" stroke="var(--border)" strokeWidth="0.5" />;
              })}

              {/* City dots */}
              {sorted.map((city) => {
                if (!city.latitude || !city.longitude) return null;
                const { x, y } = latLngToSvg(city.latitude, city.longitude);
                const score = city.scores[scoreKey];
                const r = scoreSize(score);
                const color = scoreColor(score);
                const isHovered = hoveredCity === city.slug;
                return (
                  <g key={city.slug}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? r + 3 : r}
                      fill={color}
                      fillOpacity={isHovered ? 0.9 : 0.7}
                      stroke={isHovered ? color : "transparent"}
                      strokeWidth={isHovered ? 2 : 0}
                      style={{ cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={() => setHoveredCity(city.slug)}
                      onMouseLeave={() => setHoveredCity(null)}
                      onClick={() => window.location.href = `/villes/${city.slug}`}
                    />
                    {(isHovered || score >= 8.5) && (
                      <text
                        x={x}
                        y={y - r - 3}
                        textAnchor="middle"
                        fontSize="9"
                        fill="var(--text-secondary)"
                        style={{ pointerEvents: "none" }}
                      >
                        {city.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {[
              { color: "#10b981", label: "≥ 8.5" },
              { color: "#6366f1", label: "7.5–8.4" },
              { color: "#f59e0b", label: "6.5–7.4" },
              { color: "#ef4444", label: "< 6.5" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-[11px] text-[var(--text-tertiary)]">{label}</span>
              </div>
            ))}
            <span className="text-[11px] text-[var(--text-tertiary)] ml-2">Taille = score</span>
          </div>
        </div>

        {/* Right panel: hovered city or top list */}
        <div className="space-y-4">
          {hovered ? (
            <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--bg-surface)] p-5">
              <div className="text-xs text-[var(--text-tertiary)] mb-1">{hovered.region} · {hovered.department}</div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{hovered.name}</h3>
              <div className="text-2xl font-black font-mono-data mb-3" style={{ color: scoreColor(hovered.scores[scoreKey]) }}>
                {hovered.scores[scoreKey].toFixed(1)}<span className="text-sm font-normal text-[var(--text-tertiary)]">/10</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {(["global", "nature", "cost", "safety", "transport", "culture"] as ScoreKey[]).map((k) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[var(--text-secondary)] capitalize">{k}</span>
                    <span className="font-mono-data font-semibold" style={{ color: scoreColor(hovered.scores[k]) }}>
                      {hovered.scores[k].toFixed(1)}
                    </span>
                  </div>
                ))}
                {housing && (
                  <div className="flex justify-between pt-1 border-t border-[var(--border)]">
                    <span className="text-[var(--text-secondary)]">Loyer T2</span>
                    <span className="font-semibold text-[var(--text-primary)]">{housing.avgRentT2}€/mois</span>
                  </div>
                )}
              </div>
              <Link
                href={`/villes/${hovered.slug}`}
                className="mt-4 block text-center rounded-xl bg-[var(--accent)] text-white text-xs font-semibold py-2 hover:opacity-90 transition-opacity"
              >
                Voir la fiche complète →
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <p className="text-xs text-[var(--text-tertiary)] mb-3 uppercase tracking-widest font-semibold">
                Top 10 — {SCORE_OPTIONS.find(o => o.key === scoreKey)?.label}
              </p>
              <div className="space-y-2">
                {sorted.slice(0, 10).map((city, i) => (
                  <Link
                    key={city.slug}
                    href={`/villes/${city.slug}`}
                    className="flex items-center gap-3 group"
                    onMouseEnter={() => setHoveredCity(city.slug)}
                    onMouseLeave={() => setHoveredCity(null)}
                  >
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)] w-4">{i + 1}</span>
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
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Classements thématiques →
            </Link>
            <Link
              href="/quiz"
              className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2.5 text-sm text-center text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              ✨ Quiz : trouver ma ville →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
