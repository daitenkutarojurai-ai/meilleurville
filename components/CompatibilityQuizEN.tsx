"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  rankCompatibility,
  topReasons,
  type CompatibilityAnswers,
  type CompatibilityCriterion,
  type CompatibilityMatch,
} from "@/lib/compatibility";

type Step =
  | { id: keyof CompatibilityAnswers; type: "single"; question: string; options: Array<{ value: string; label: string; desc?: string }> }
  | { id: "budget"; type: "slider"; question: string; min: number; max: number; step: number; unit: string };

const STEPS: Step[] = [
  {
    id: "budget",
    type: "slider",
    question: "Monthly housing budget (1-bed / T2 rent)?",
    min: 400,
    max: 2500,
    step: 50,
    unit: "€/month",
  },
  {
    id: "age",
    type: "single",
    question: "Your age group?",
    options: [
      { value: "18-30", label: "18-30" },
      { value: "30-45", label: "30-45" },
      { value: "45-60", label: "45-60" },
      { value: "60+", label: "60+" },
    ],
  },
  {
    id: "climate",
    type: "single",
    question: "Preferred climate?",
    options: [
      { value: "froid", label: "❄️ Cool", desc: "Mild summers, crisp winters" },
      { value: "tempere", label: "🌤️ Temperate", desc: "Mid-Atlantic vibe" },
      { value: "chaud", label: "☀️ Hot", desc: "Sunny, marked summers" },
      { value: "indifferent", label: "🤷 Don't mind", desc: "I adapt" },
    ],
  },
  {
    id: "car",
    type: "single",
    question: "What about a car?",
    options: [
      { value: "obligatoire", label: "Essential", desc: "Keeping my car no matter what" },
      { value: "preferable", label: "Preferable", desc: "But I can manage without sometimes" },
      { value: "non-merci", label: "Car-free", desc: "I want to live without one" },
    ],
  },
  {
    id: "family",
    type: "single",
    question: "Family situation?",
    options: [
      { value: "seul", label: "🧍 Solo" },
      { value: "couple", label: "👫 Couple" },
      { value: "famille", label: "👨‍👩‍👧‍👦 Family with kids" },
      { value: "retraite", label: "🌅 Retired" },
    ],
  },
  {
    id: "ambiance",
    type: "single",
    question: "What vibe are you looking for?",
    options: [
      { value: "calme", label: "🌳 Calm", desc: "Quiet setting, smaller city" },
      { value: "dynamique", label: "🏙️ Dynamic", desc: "Big, lively city" },
      { value: "international", label: "🌍 International", desc: "Expats, flights, mix" },
      { value: "village", label: "🏡 Village", desc: "Strong local community" },
    ],
  },
  {
    id: "workMode",
    type: "single",
    question: "Work style?",
    options: [
      { value: "presentiel", label: "🏢 Office" },
      { value: "hybride", label: "🔀 Hybrid" },
      { value: "remote", label: "💻 100% remote" },
      { value: "retraite", label: "🌅 Retired" },
    ],
  },
  {
    id: "priority",
    type: "single",
    question: "Top priority?",
    options: [
      { value: "budget", label: "💰 Budget", desc: "Cost of living first" },
      { value: "nature", label: "🌿 Nature", desc: "Forests, sea, mountains nearby" },
      { value: "carriere", label: "🚀 Career", desc: "Professional network + remote work" },
      { value: "famille", label: "👨‍👩‍👧 Family", desc: "Schools + safety" },
      { value: "culture", label: "🎭 Culture", desc: "Museums, concerts, festivals" },
      { value: "calme", label: "😌 Peace & quiet", desc: "Safety + nature" },
    ],
  },
  {
    id: "noise",
    type: "single",
    question: "Urban noise?",
    options: [
      { value: "supporte", label: "Fine with it", desc: "Part of city life" },
      { value: "ne-supporte-pas", label: "Can't stand it", desc: "Quiet is non-negotiable" },
    ],
  },
  {
    id: "heat",
    type: "single",
    question: "Hot summers?",
    options: [
      { value: "supporte", label: "Fine with it", desc: "I love hot summers" },
      { value: "ne-supporte-pas", label: "Can't stand it", desc: "Summer ≤ 25 °C please" },
    ],
  },
];

const EN_LABELS: Record<string, string> = {
  budget: "Housing budget",
  age: "Age group",
  climate: "Climate",
  car: "Car dependency",
  family: "Family situation",
  ambiance: "Vibe",
  workMode: "Work style",
  priority: "Top priority",
  noise: "Urban noise",
  heat: "Summer heat",
};

function translateReason(key: string, reason: string): string {
  switch (key) {
    case "budget":
      return reason
        .replace("Loyer T2 médian ", "Median T2 rent ")
        .replace("€/mois — dans votre budget (", "€/month — within your budget (")
        .replace("€/mois — au-dessus de votre budget (", "€/month — above your budget (")
        .replace(/ — estimation neutre\.$/, " — neutral estimate.");
    case "age":
      return reason
        .replace("Jeune actif + famille moyenne ", "Young professional + family avg ")
        .replace("Jeune actif ", "Young professional ")
        .replace("Famille + qualité de vie ", "Family + quality of life ")
        .replace("Cadre de vie + sécurité ", "Lifestyle & safety ");
    case "climate":
      return reason
        .replace("Été ", "Summer ")
        .replace(" j de soleil — chaud comme vous aimez.", " days of sun — hot, as you like it.")
        .replace(" j de soleil — tempéré.", " days of sun — mild.")
        .replace(" — tempéré pour vous.", " — mild for you.")
        .replace(" — chaud pour vous.", " — hot for you.")
        .replace(" — idéal.", " — ideal.")
        .replace(" — écart au tempéré.", " — off temperate.")
        .replace(" · hiver ", " · winter ");
    case "car":
      return reason
        .replace("Voiture obligatoire — toutes les villes conviennent.", "Car kept — works anywhere.")
        .replace("Score sans-voiture ", "Car-free score ")
        .replace(" — réseau dense.", " — dense transit network.")
        .replace(" — voiture quasi-obligatoire.", " — car near-essential.");
    case "family":
      return reason
        .replace("Score famille ", "Family score ")
        .replace(" (écoles + sécurité + nature).", " (schools + safety + nature).")
        .replace("Mix famille + qualité de vie.", "Family + quality-of-life mix.")
        .replace("Score jeune actif ", "Young professional score ")
        .replace("Sécurité + cadre + nature.", "Safety + environment + nature.");
    case "ambiance":
      return reason
        .replace(" hab. — calme.", " residents — quiet.")
        .replace(" hab. — animée.", " residents — lively.")
        .replace(" hab. — très dynamique.", " residents — very dynamic.")
        .replace(" hab. — modérée.", " residents — moderate.")
        .replace("Ville à vocation internationale.", "City with international character.")
        .replace("Ville majoritairement franco-française.", "Predominantly French city.")
        .replace(" hab. — esprit village.", " residents — village feel.")
        .replace(" hab. — trop urbaine.", " residents — too urban.");
    case "workMode":
      return reason
        .replace("Qualité de vie + transports.", "Quality of life + transport.")
        .replace(" (fibre + cadre).", " (fibre + environment).")
        .replace("Score télétravail ", "Remote-work score ")
        .replace(" + transports.", " + transport.")
        .replace("Score qualité de vie ", "Quality-of-life score ");
    case "priority":
      return reason
        .replace("coût de la vie : ", "cost of living: ")
        .replace("accès nature : ", "nature access: ")
        .replace("carrière (remote + culture) : ", "career (remote + culture): ")
        .replace("famille (sécurité + écoles) : ", "family (safety + schools): ")
        .replace("calme (sécurité + nature) : ", "quiet (safety + nature): ")
        .replace("culture : ", "culture: ");
    case "noise":
      return reason.replace("Calme sonore ", "Sound comfort ");
    case "heat":
      return reason.replace("Résistance canicule ", "Heat resistance ");
    default:
      return reason;
  }
}

function translateCriterion(c: CompatibilityCriterion): CompatibilityCriterion {
  return {
    ...c,
    label: EN_LABELS[c.key] ?? c.label,
    reason: translateReason(c.key, c.reason),
  };
}

function scoreColorBadge(score: number): string {
  if (score >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if (score >= 65) return "bg-lime-100 text-lime-700 border-lime-300";
  if (score >= 50) return "bg-amber-100 text-amber-700 border-amber-300";
  return "bg-orange-100 text-orange-700 border-orange-300";
}

const INITIAL: Partial<CompatibilityAnswers> = { budget: 900 };

export function CompatibilityQuizEN() {
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
            Results
          </Badge>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            Your 5 best-matched French cities
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Match % calculated across 10 weighted criteria
          </p>
        </div>

        <ol className="space-y-4">
          {results.map((match, i) => {
            const reasons = topReasons(match, 3).map(translateCriterion);
            const allCriteria = match.criteria.map(translateCriterion);
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
                          href={`/cities/${match.city.slug}`}
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
                              <strong className="text-[var(--text-primary)]">{r.label}:</strong>{" "}
                              {r.reason}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <details className="text-xs text-[var(--text-tertiary)]">
                        <summary className="cursor-pointer hover:text-[var(--text-secondary)]">
                          Show all 10 criteria
                        </summary>
                        <ul className="mt-2 space-y-1">
                          {allCriteria.map((c) => (
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
                                <strong>{c.label}:</strong> {c.reason}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                      <div className="mt-3">
                        <Link
                          href={`/cities/${match.city.slug}`}
                          className="text-xs text-[var(--accent)] underline hover:opacity-80"
                        >
                          Full profile for {match.city.name} →
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
            Retake the quiz
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
              {(answers.budget ?? current.min).toLocaleString("en-GB")} {current.unit}
            </span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Your monthly budget for a 1-bed flat in your target city.
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
          Back
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
          {isLast ? "See my 5 cities" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
