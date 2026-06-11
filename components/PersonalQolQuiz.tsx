"use client";

// F55 — Quiz « personnalise ton Cadre de Vie ».
//
// 3 sliders 1-5 (env / santé / emploi). Recalcule en direct le composite
// F52 selon les poids utilisateur et affiche le top 10 perso.
// URL hash (#e=X&s=Y&j=Z) pour partager le résultat.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QOL_LEVEL_LABEL, QOL_LEVEL_COLOR, personalQolRanking, type QolWeights } from "@/lib/quality-of-life-index";
import type { CityLight } from "@/lib/cities-light";

const MIN_POP = 10_000;
const LABELS = [
  "Pas important",
  "Peu important",
  "Moyen",
  "Important",
  "Crucial",
];

function readHashWeights(): QolWeights {
  if (typeof window === "undefined") return { env: 3, health: 3, job: 3 };
  const h = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(h);
  const clamp = (v: string | null, d: number) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return d;
    return Math.max(1, Math.min(5, Math.round(n)));
  };
  return {
    env: clamp(params.get("e"), 3),
    health: clamp(params.get("s"), 3),
    job: clamp(params.get("j"), 3),
  };
}

export function PersonalQolQuiz({ cities }: { cities: CityLight[] }) {
  const [weights, setWeights] = useState<QolWeights>(() => readHashWeights());
  const [shareLabel, setShareLabel] = useState<string>("Copier le lien");

  // Sync weights → URL hash so the result is shareable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = `#e=${weights.env}&s=${weights.health}&j=${weights.job}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    }
  }, [weights]);

  const ranking = useMemo(
    () => personalQolRanking(weights, cities, 10, MIN_POP),
    [weights, cities],
  );

  const sum = weights.env + weights.health + weights.job;
  const pctEnv = Math.round((weights.env / sum) * 100);
  const pctHealth = Math.round((weights.health / sum) * 100);
  const pctJob = 100 - pctEnv - pctHealth;

  const copyShareLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareLabel("Lien copié ✓");
      setTimeout(() => setShareLabel("Copier le lien"), 1800);
    } catch {
      setShareLabel("Échec — copier manuellement");
      setTimeout(() => setShareLabel("Copier le lien"), 2400);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Vos priorités
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Réglez l&apos;importance de chaque pilier (1 = pas important, 5 = crucial).
              Le top 10 se recalcule en direct.
            </p>
          </div>
          <button
            type="button"
            onClick={copyShareLink}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]/40 transition-colors"
          >
            {shareLabel}
          </button>
        </div>

        <div className="space-y-5">
          <WeightSlider
            label="🌿 Environnement"
            hint="Air, bruit, eau, risques naturels"
            value={weights.env}
            pct={pctEnv}
            onChange={(v) => setWeights({ ...weights, env: v })}
          />
          <WeightSlider
            label="🩺 Santé"
            hint="Médecins, urgences, accès aux soins"
            value={weights.health}
            pct={pctHealth}
            onChange={(v) => setWeights({ ...weights, health: v })}
          />
          <WeightSlider
            label="💼 Emploi"
            hint="Chômage, salaire, dynamisme"
            value={weights.job}
            pct={pctJob}
            onChange={(v) => setWeights({ ...weights, job: v })}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <Badge>Env. {pctEnv} %</Badge>
          <Badge>Santé {pctHealth} %</Badge>
          <Badge>Emploi {pctJob} %</Badge>
        </div>
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Votre top 10 personnalisé
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Communes ≥ 10 000 hab. — composite pondéré selon vos priorités. 10 = match parfait.
        </p>

        <Card className="mt-3 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Score perso</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Env.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Santé</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Emploi</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${QOL_LEVEL_COLOR[c.level]}`}>
                        {c.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {QOL_LEVEL_LABEL[c.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {c.envScore.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {c.healthScore.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {c.jobScore.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function WeightSlider({
  label,
  hint,
  value,
  pct,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  pct: number;
  onChange: (v: number) => void;
}) {
  const sliderId = `qol-weight-${label.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <label htmlFor={sliderId} className="text-sm font-semibold text-[var(--text-primary)]">
          {label}
        </label>
        <span className="text-xs tabular-nums text-[var(--text-tertiary)]">
          {LABELS[value - 1]} · poids {pct} %
        </span>
      </div>
      <div className="flex items-center gap-3">
        <input
          id={sliderId}
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
          aria-label={`Importance ${label}`}
        />
        <span className="font-mono-data font-bold text-lg text-[var(--text-primary)] w-6 text-right">
          {value}
        </span>
      </div>
      <p className="text-[11px] text-[var(--text-tertiary)] mt-1">{hint}</p>
    </div>
  );
}
