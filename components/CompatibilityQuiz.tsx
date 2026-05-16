"use client";

// F2 — City Compatibility Score quiz UI.
//
// 10 questions sequenced. Result = Top 5 with score % + per-criterion
// breakdown. All computation client-side (calls lib/compatibility.ts).

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  rankCompatibility,
  topReasons,
  type CompatibilityAnswers,
  type CompatibilityMatch,
} from "@/lib/compatibility";

type Step =
  | { id: keyof CompatibilityAnswers; type: "single"; question: string; options: Array<{ value: string; label: string; desc?: string }> }
  | { id: "budget"; type: "slider"; question: string; min: number; max: number; step: number; unit: string };

const STEPS: Step[] = [
  {
    id: "budget",
    type: "slider",
    question: "Budget logement mensuel (loyer T2) ?",
    min: 400,
    max: 2500,
    step: 50,
    unit: "€/mois",
  },
  {
    id: "age",
    type: "single",
    question: "Votre tranche d'âge ?",
    options: [
      { value: "18-30", label: "18-30 ans" },
      { value: "30-45", label: "30-45 ans" },
      { value: "45-60", label: "45-60 ans" },
      { value: "60+", label: "60+ ans" },
    ],
  },
  {
    id: "climate",
    type: "single",
    question: "Climat préféré ?",
    options: [
      { value: "froid", label: "❄️ Frais", desc: "Été doux, hiver vif" },
      { value: "tempere", label: "🌤️ Tempéré", desc: "Mid-Atlantique" },
      { value: "chaud", label: "☀️ Chaud", desc: "Été marqué, beaucoup de soleil" },
      { value: "indifferent", label: "🤷 Indifférent", desc: "Je m'adapte" },
    ],
  },
  {
    id: "car",
    type: "single",
    question: "Et la voiture ?",
    options: [
      { value: "obligatoire", label: "Obligatoire", desc: "Je garde ma voiture quoi qu'il arrive" },
      { value: "preferable", label: "Préférable", desc: "Mais je peux m'en passer parfois" },
      { value: "non-merci", label: "Non merci", desc: "Je veux pouvoir vivre sans" },
    ],
  },
  {
    id: "family",
    type: "single",
    question: "Situation familiale ?",
    options: [
      { value: "seul", label: "🧍 Seul·e" },
      { value: "couple", label: "👫 Couple" },
      { value: "famille", label: "👨‍👩‍👧‍👦 Famille avec enfants" },
      { value: "retraite", label: "🌅 Retraite" },
    ],
  },
  {
    id: "ambiance",
    type: "single",
    question: "Ambiance recherchée ?",
    options: [
      { value: "calme", label: "🌳 Calme", desc: "Cadre tranquille, petite ville" },
      { value: "dynamique", label: "🏙️ Dynamique", desc: "Grande ville animée" },
      { value: "international", label: "🌍 International", desc: "Brassage, vols, expats" },
      { value: "village", label: "🏡 Village", desc: "Communauté locale forte" },
    ],
  },
  {
    id: "workMode",
    type: "single",
    question: "Mode de travail ?",
    options: [
      { value: "presentiel", label: "🏢 Présentiel" },
      { value: "hybride", label: "🔀 Hybride" },
      { value: "remote", label: "💻 100% remote" },
      { value: "retraite", label: "🌅 Plus de travail" },
    ],
  },
  {
    id: "priority",
    type: "single",
    question: "Priorité absolue ?",
    options: [
      { value: "budget", label: "💰 Budget", desc: "Le coût de la vie d'abord" },
      { value: "nature", label: "🌿 Nature", desc: "Forêts, mer, montagne accessibles" },
      { value: "carriere", label: "🚀 Carrière", desc: "Réseau pro + télétravail" },
      { value: "famille", label: "👨‍👩‍👧 Famille", desc: "Écoles + sécurité" },
      { value: "culture", label: "🎭 Culture", desc: "Musées, concerts, festivals" },
      { value: "calme", label: "😌 Calme", desc: "Sécurité + nature" },
    ],
  },
  {
    id: "noise",
    type: "single",
    question: "Le bruit urbain ?",
    options: [
      { value: "supporte", label: "Je supporte", desc: "Ça fait partie de la ville" },
      { value: "ne-supporte-pas", label: "Je ne supporte pas", desc: "Calme indispensable" },
    ],
  },
  {
    id: "heat",
    type: "single",
    question: "Les fortes chaleurs estivales ?",
    options: [
      { value: "supporte", label: "Je supporte", desc: "J'aime les étés chauds" },
      { value: "ne-supporte-pas", label: "Je ne supporte pas", desc: "Été ≤ 25 °C SVP" },
    ],
  },
];

const INITIAL: Partial<CompatibilityAnswers> = { budget: 900 };

function scoreColorBadge(score: number): string {
  if (score >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (score >= 65) return "bg-lime-100 text-lime-700 border-lime-300";
  if (score >= 50) return "bg-amber-100 text-amber-700 border-amber-300";
  return "bg-orange-100 text-orange-700 border-orange-300";
}

export function CompatibilityQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<CompatibilityAnswers>>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const currentValue = answers[current.id];
  const canAdvance = currentValue != null;

  const results: CompatibilityMatch[] = useMemo(() => {
    if (!submitted) return [];
    return rankCompatibility(answers as CompatibilityAnswers, 5);
  }, [submitted, answers]);

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Badge variant="accent" className="mb-2">
            <Sparkles className="inline h-3 w-3 mr-1" />
            Résultats
          </Badge>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            Vos 5 villes les plus compatibles
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Match en % calculé sur 10 critères pondérés
          </p>
        </div>

        <ol className="space-y-4">
          {results.map((match, i) => {
            const reasons = topReasons(match, 3);
            return (
              <li key={match.city.slug}>
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <span className="font-mono-data text-3xl font-bold text-[var(--text-tertiary)]">
                        #{i + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2 mb-2">
                        <Link
                          href={`/villes/${match.city.slug}`}
                          className="text-xl font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                        >
                          {match.city.name}
                        </Link>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {match.city.region}
                        </span>
                        <span
                          className={`ml-auto inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-bold ${scoreColorBadge(match.score)}`}
                        >
                          {match.score.toFixed(0)}% match
                        </span>
                      </div>
                      <ul className="space-y-1 mb-3">
                        {reasons.map((r) => (
                          <li
                            key={r.key}
                            className="text-xs text-[var(--text-secondary)] flex items-baseline gap-2"
                          >
                            <span className="font-mono-data text-emerald-600 font-bold w-12 shrink-0">
                              +{r.contribution.toFixed(1)}
                            </span>
                            <span>
                              <strong className="text-[var(--text-primary)]">{r.label} :</strong> {r.reason}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <details className="text-xs text-[var(--text-tertiary)]">
                        <summary className="cursor-pointer hover:text-[var(--text-secondary)]">
                          Voir les 10 critères
                        </summary>
                        <ul className="mt-2 space-y-1">
                          {match.criteria.map((c) => (
                            <li key={c.key} className="flex items-baseline gap-2">
                              <span
                                className={`font-mono-data font-bold w-12 shrink-0 ${
                                  c.contribution >= 0 ? "text-emerald-600" : "text-red-600"
                                }`}
                              >
                                {c.contribution >= 0 ? "+" : ""}
                                {c.contribution.toFixed(1)}
                              </span>
                              <span>
                                <strong>{c.label} :</strong> {c.reason}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                      <div className="mt-3">
                        <Link
                          href={`/villes/${match.city.slug}`}
                          className="text-xs text-[var(--accent)] underline hover:opacity-80"
                        >
                          Fiche complète {match.city.name} →
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setStep(0);
              setAnswers(INITIAL);
            }}
            className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
          >
            Refaire le quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <span>
          Question {step + 1} / {STEPS.length}
        </span>
        <div className="h-1 flex-1 mx-4 rounded-full bg-[var(--border)] overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">{current.question}</h2>

      {current.type === "slider" ? (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="range"
              min={current.min}
              max={current.max}
              step={current.step}
              value={(answers.budget ?? current.min) as number}
              onChange={(e) => setAnswers({ ...answers, budget: Number(e.target.value) })}
              className="flex-1"
              aria-label={current.question}
            />
            <span className="font-mono-data font-bold text-2xl text-[var(--text-primary)] w-28 text-right">
              {(answers.budget ?? current.min).toLocaleString("fr-FR")} {current.unit}
            </span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Budget mensuel raisonnable pour un T2 dans votre ville cible.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {current.options.map((opt) => {
            const selected = answers[current.id] === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setAnswers({ ...answers, [current.id]: opt.value } as Partial<CompatibilityAnswers>)
                }
                className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)]"
                }`}
                aria-pressed={selected}
              >
                <div className="text-sm font-semibold text-[var(--text-primary)]">{opt.label}</div>
                {opt.desc && (
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{opt.desc}</div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Précédent
        </button>
        <button
          type="button"
          onClick={() => {
            if (isLast) {
              setSubmitted(true);
            } else {
              setStep((s) => s + 1);
            }
          }}
          disabled={!canAdvance}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] text-white px-5 py-2 text-sm font-semibold shadow-sm hover:opacity-90 disabled:opacity-40"
        >
          {isLast ? "Voir mes 5 villes" : "Suivant"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
