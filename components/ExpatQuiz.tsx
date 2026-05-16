"use client";

// F11 — Expat retour quiz UI.
//
// Variante du quiz de compatibilité avec un préfiltre par pays d'origine :
// les villes "bestSuitedCities" du profil pays reçoivent un bonus de
// matching (+15 pts) qui reflète le bénéfice pratique (frontalier, vols
// directs, communauté expat existante).

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
import { EXPAT_COUNTRIES, getExpatCountry, type ExpatCountry } from "@/lib/expat-return";

type Step =
  | { id: "originCountry"; type: "country"; question: string }
  | { id: keyof CompatibilityAnswers; type: "single"; question: string; options: Array<{ value: string; label: string; desc?: string }> }
  | { id: "budget"; type: "slider"; question: string; min: number; max: number; step: number; unit: string };

const STEPS: Step[] = [
  {
    id: "originCountry",
    type: "country",
    question: "Vous rentrez de quel pays ?",
  },
  {
    id: "budget",
    type: "slider",
    question: "Budget logement mensuel en France (loyer T2) ?",
    min: 500,
    max: 3000,
    step: 50,
    unit: "€/mois",
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
    id: "workMode",
    type: "single",
    question: "Vous comptez travailler comment en France ?",
    options: [
      { value: "presentiel", label: "🏢 Présentiel français" },
      { value: "hybride", label: "🔀 Hybride" },
      { value: "remote", label: "💻 Garder l'emploi à l'étranger (frontalier / remote)" },
      { value: "retraite", label: "🌅 Plus de travail / retraite" },
    ],
  },
  {
    id: "priority",
    type: "single",
    question: "Priorité absolue en rentrant ?",
    options: [
      { value: "budget", label: "💰 Optimiser le coût de la vie" },
      { value: "famille", label: "👨‍👩‍👧 Écoles + sécurité (enfants)" },
      { value: "carriere", label: "🚀 Réseau pro + télétravail" },
      { value: "nature", label: "🌿 Cadre + nature accessibles" },
      { value: "culture", label: "🎭 Culture + sortie urbaine" },
      { value: "calme", label: "😌 Calme + sécurité" },
    ],
  },
];

const FRONTIER_BONUS = 15;

interface ExpatAnswers extends Partial<CompatibilityAnswers> {
  originCountry?: ExpatCountry;
}

const INITIAL: ExpatAnswers = { budget: 1100 };

function scoreColorBadge(score: number): string {
  if (score >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (score >= 65) return "bg-lime-100 text-lime-700 border-lime-300";
  if (score >= 50) return "bg-amber-100 text-amber-700 border-amber-300";
  return "bg-orange-100 text-orange-700 border-orange-300";
}

export function ExpatQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ExpatAnswers>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const currentValue = answers[current.id as keyof ExpatAnswers];
  const canAdvance = currentValue != null;

  const results: CompatibilityMatch[] = useMemo(() => {
    if (!submitted) return [];
    // Reasonable defaults for fields not explicitly asked in the expat quiz.
    const compatibilityInput: CompatibilityAnswers = {
      budget: answers.budget ?? 1100,
      age: (answers.age as CompatibilityAnswers["age"]) ?? "30-45",
      climate: (answers.climate as CompatibilityAnswers["climate"]) ?? "indifferent",
      car: (answers.car as CompatibilityAnswers["car"]) ?? "preferable",
      family: (answers.family as CompatibilityAnswers["family"]) ?? "couple",
      ambiance: (answers.ambiance as CompatibilityAnswers["ambiance"]) ?? "dynamique",
      workMode: (answers.workMode as CompatibilityAnswers["workMode"]) ?? "hybride",
      priority: (answers.priority as CompatibilityAnswers["priority"]) ?? "carriere",
      noise: (answers.noise as CompatibilityAnswers["noise"]) ?? "supporte",
      heat: (answers.heat as CompatibilityAnswers["heat"]) ?? "supporte",
    };
    const base = rankCompatibility(compatibilityInput, 50);
    const country = answers.originCountry ? getExpatCountry(answers.originCountry) : undefined;
    const frontierSlugs = new Set(country?.bestSuitedCities ?? []);
    // Apply frontier bonus + re-rank
    const boosted = base.map((m) => ({
      ...m,
      score: Math.min(100, m.score + (frontierSlugs.has(m.city.slug) ? FRONTIER_BONUS : 0)),
    }));
    boosted.sort((a, b) => b.score - a.score);
    return boosted.slice(0, 5);
  }, [submitted, answers]);

  if (submitted) {
    const country = answers.originCountry ? getExpatCountry(answers.originCountry) : undefined;
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Badge variant="accent" className="mb-2">
            <Sparkles className="inline h-3 w-3 mr-1" />
            Résultats expat
          </Badge>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            Vos 5 villes adaptées au retour
            {country && (
              <>
                {" "}
                <span className="text-base text-[var(--text-secondary)]">
                  depuis {country.flag} {country.name}
                </span>
              </>
            )}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Bonus +{FRONTIER_BONUS} pts appliqué aux villes frontalières / liaisons directes
          </p>
        </div>

        <ol className="space-y-4">
          {results.map((match, i) => {
            const reasons = topReasons(match, 2);
            const isFrontier = country?.bestSuitedCities.includes(match.city.slug);
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
                          className="text-xl font-bold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {match.city.name}
                        </Link>
                        {isFrontier && (
                          <Badge variant="accent">Frontalière / Adaptée</Badge>
                        )}
                        <span className="text-xs text-[var(--text-tertiary)]">{match.city.region}</span>
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
                      <Link
                        href={`/villes/${match.city.slug}`}
                        className="text-xs text-[var(--accent)] underline hover:opacity-80"
                      >
                        Fiche complète →
                      </Link>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>

        <div className="text-center space-y-2">
          {country && (
            <Link
              href={`/expat-retour/depuis-${country.slug}`}
              className="block text-sm text-[var(--accent)] underline"
            >
              Guide complet retour depuis {country.name} →
            </Link>
          )}
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

      {current.type === "country" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EXPAT_COUNTRIES.map((c) => {
            const selected = answers.originCountry === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setAnswers({ ...answers, originCountry: c.slug })}
                className={`rounded-xl border px-4 py-3 transition-colors text-center ${
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)]"
                }`}
                aria-pressed={selected}
              >
                <div className="text-3xl mb-1" aria-hidden>
                  {c.flag}
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {c.name}
                </div>
              </button>
            );
          })}
        </div>
      ) : current.type === "slider" ? (
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
            Comptez large : un retour de Suisse / UK signifie souvent un loyer plus bas en France.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {current.options.map((opt) => {
            const selected = answers[current.id as keyof ExpatAnswers] === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setAnswers({ ...answers, [current.id]: opt.value } as ExpatAnswers)
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
