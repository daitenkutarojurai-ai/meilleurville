"use client";

// F64 — Palmarès personnalisé 8 axes.
//
// 8 sliders 1-5 (env / santé / emploi / cadre / vélo / sécurité / démo / services).
// Recalcule en direct le composite synthèse F61 selon les poids utilisateur
// et affiche le top 10 perso. URL hash (#e=X&s=Y&j=Z&q=A&v=B&n=C&d=D&p=E) pour
// partager le résultat. `e`/`s`/`j` choisis compatibles avec F55 (mêmes
// premières trois lettres).

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  personalSynthesisRanking,
  DEFAULT_SYNTHESIS_WEIGHTS,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
  type SynthesisWeights,
} from "@/lib/city-synthesis";

const MIN_POP = 15_000;
const SCALE_LABELS = [
  "Pas important",
  "Peu important",
  "Moyen",
  "Important",
  "Crucial",
];

/** Axis config: order shown to user + URL hash letter + UI label. */
const AXES: ReadonlyArray<{ key: keyof SynthesisWeights; letter: string; label: string; hint: string }> = [
  { key: "env", letter: "e", label: "Environnement", hint: "Air · bruit · eau · risques" },
  { key: "health", letter: "s", label: "Santé", hint: "MG · spé · urgences · pharma" },
  { key: "job", letter: "j", label: "Emploi", hint: "Chômage · salaires · dynamisme" },
  { key: "qol", letter: "q", label: "Cadre de vie", hint: "Méga-index env + santé + emploi" },
  { key: "cycling", letter: "v", label: "Vélo", hint: "Réseau · relief · sécurité · climat" },
  { key: "safety", letter: "n", label: "Sécurité", hint: "Biens · personnes · nuit · VFFS" },
  { key: "demo", letter: "d", label: "Démographie", hint: "Vieillis. · jeunes · trajectoire" },
  { key: "services", letter: "p", label: "Services publics", hint: "Écoles · Poste · mairie · médiath." },
] as const;

function readHashWeights(): SynthesisWeights {
  if (typeof window === "undefined") return { ...DEFAULT_SYNTHESIS_WEIGHTS };
  const h = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(h);
  const clamp = (v: string | null, d: number) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return d;
    return Math.max(1, Math.min(5, Math.round(n)));
  };
  const w = { ...DEFAULT_SYNTHESIS_WEIGHTS };
  for (const a of AXES) {
    w[a.key] = clamp(params.get(a.letter), 3);
  }
  return w;
}

function weightsToHash(weights: SynthesisWeights): string {
  return AXES.map((a) => `${a.letter}=${weights[a.key]}`).join("&");
}

export function PersonalSynthesisQuiz() {
  const [weights, setWeights] = useState<SynthesisWeights>(() => readHashWeights());
  const [shareLabel, setShareLabel] = useState<string>("Copier le lien");

  // Sync weights → URL hash so the result is shareable.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const next = weightsToHash(weights);
    if (window.location.hash.replace(/^#/, "") !== next) {
      window.history.replaceState(null, "", `#${next}`);
    }
  }, [weights]);

  const ranking = useMemo(
    () => personalSynthesisRanking(weights, 10, MIN_POP),
    [weights],
  );

  function copyLink() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShareLabel("Lien copié ✓");
        setTimeout(() => setShareLabel("Copier le lien"), 2000);
      })
      .catch(() => {
        setShareLabel("Erreur — copie manuelle");
        setTimeout(() => setShareLabel("Copier le lien"), 2500);
      });
  }

  function reset() {
    setWeights({ ...DEFAULT_SYNTHESIS_WEIGHTS });
  }

  return (
    <div className="space-y-6">
      {/* Sliders grid */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          {AXES.map((a) => (
            <div key={a.key}>
              <div className="flex items-baseline justify-between mb-1">
                <label
                  htmlFor={`weight-${a.letter}`}
                  className="text-sm font-semibold text-[var(--text-primary)]"
                >
                  {a.label}
                </label>
                <span className="text-xs font-mono text-[var(--text-tertiary)]">
                  {weights[a.key]}/5 · {SCALE_LABELS[weights[a.key] - 1]}
                </span>
              </div>
              <input
                id={`weight-${a.letter}`}
                aria-label={`Importance ${a.label}`}
                type="range"
                min={1}
                max={5}
                step={1}
                value={weights[a.key]}
                onChange={(e) =>
                  setWeights({ ...weights, [a.key]: Number(e.target.value) })
                }
                className="w-full accent-[var(--accent)]"
              />
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1">{a.hint}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-full bg-[var(--accent)] text-white px-4 py-2 text-xs font-semibold shadow-sm hover:opacity-90"
          >
            🔗 {shareLabel}
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
          >
            Réinitialiser (tout à 3)
          </button>
          <span className="text-xs text-[var(--text-tertiary)]">
            Recalcul en direct · Filtre 15 000 hab. minimum
          </span>
        </div>
      </Card>

      {/* Result list */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Top 10 selon vos priorités
          </h2>
          <Badge>Recalcul live</Badge>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Personnel</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/synthese`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.level]}`}
                      >
                        {c.personalGlobal.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {SYNTHESIS_LEVEL_LABEL[c.level]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-3">
          Score personnel = Σ (score axe × poids axe) / Σ poids. Convention unifiée
          10 = excellent. Score 0 sur un axe en cas de donnée manquante (rare).
        </p>
      </div>
    </div>
  );
}
