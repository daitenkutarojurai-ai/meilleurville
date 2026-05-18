"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, MapPin, RefreshCw, Sparkles } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { BookingCTA } from "@/components/BookingCTA";
import {
  MONTHS,
  formatMonthLabel,
  type MonthIndex,
} from "@/lib/vacation-seasons";
import {
  ACTIVITIES,
  ACTIVITY_DEFS,
  type ActivitySlug,
} from "@/lib/vacation-activities";
import {
  vacationFit,
  VACATION_PROFILES,
  VACATION_PROFILE_DEFS,
  BUDGET_TIER_LABEL,
  BUDGET_TIER_DESC,
  type VacationProfile,
} from "@/lib/vacation-fit";

type Step = 1 | 2 | 3 | 4 | 5 | "results";

interface Answers {
  month: MonthIndex | null;
  activity: ActivitySlug | null;
  profile: VacationProfile | null;
  budget: 1 | 2 | 3 | 4 | null;
  duration: "weekend" | "court" | "semaine" | "deux-semaines" | null;
}

const EMPTY_ANSWERS: Answers = {
  month: null,
  activity: null,
  profile: null,
  budget: null,
  duration: null,
};

const DURATIONS: Array<{ id: NonNullable<Answers["duration"]>; label: string; hint: string }> = [
  { id: "weekend", label: "Un week-end", hint: "2-3 jours, on file dans une seule ville" },
  { id: "court", label: "4 à 5 jours", hint: "Un pont prolongé, on a le temps de respirer" },
  { id: "semaine", label: "Une semaine", hint: "Le classique, parfait pour une base + rayonnement" },
  { id: "deux-semaines", label: "Deux semaines ou plus", hint: "Vraies vacances, on peut bouger" },
];

const BUDGET_TIERS: Array<{ tier: 1 | 2 | 3 | 4; label: string; range: string }> = [
  { tier: 1, label: "Petit budget", range: "< 70 €/jour/pers" },
  { tier: 2, label: "Raisonnable", range: "70-110 €/jour/pers" },
  { tier: 3, label: "Confortable", range: "110-180 €/jour/pers" },
  { tier: 4, label: "Sans compter", range: "180 €+/jour/pers" },
];

export function QuizFlow() {
  const [step, setStep] = useState<Step>(1);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);

  function reset() {
    setAnswers(EMPTY_ANSWERS);
    setStep(1);
  }

  function next() {
    if (step === 5) setStep("results");
    else if (step !== "results") setStep((step + 1) as Step);
  }

  function back() {
    if (step === "results") setStep(5);
    else if (step !== 1) setStep(((step as number) - 1) as Step);
  }

  const canNext =
    (step === 1 && answers.month != null) ||
    (step === 2 && answers.activity != null) ||
    (step === 3 && answers.profile != null) ||
    (step === 4 && answers.budget != null) ||
    (step === 5 && answers.duration != null) ||
    step === "results";

  // Compute results lazily
  const results = useMemo(() => {
    if (step !== "results") return [];
    if (!answers.month || !answers.activity || !answers.profile || !answers.budget) {
      return [];
    }
    return CITIES_SEED
      .filter((c) => (c.population ?? 0) >= 3_000)
      .map((c) => ({
        city: c,
        fit: vacationFit(c, {
          month: answers.month!,
          activity: answers.activity!,
          profile: answers.profile!,
        }),
      }))
      // Filtre budget: la tier max acceptable est le budget de l'utilisateur
      .filter((r) => r.fit.budgetTier <= answers.budget!)
      // Filtre activité minimale
      .filter((r) => r.fit.activityScore >= 4)
      .sort((a, b) => b.fit.score - a.fit.score)
      .slice(0, 3);
  }, [step, answers]);

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm">
      {/* Progress */}
      {step !== "results" && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mb-2">
            <span>Question {step} sur 5</span>
            <span>{Math.round((((step - 1) as number) / 5) * 100)} %</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${(((step) as number) / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Q1 — Mois */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            Quand partez-vous ?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            Le mois change tout, surtout en France.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {MONTHS.map((slug, i) => {
              const m = (i + 1) as MonthIndex;
              const active = answers.month === m;
              return (
                <button
                  key={slug}
                  onClick={() => setAnswers({ ...answers, month: m })}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  {formatMonthLabel(m)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Q2 — Activité */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            Quelle envie ?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            Pas de panique, un seul choix : ce qui compte le plus cette fois.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ACTIVITIES.map((slug) => {
              const def = ACTIVITY_DEFS[slug];
              const active = answers.activity === slug;
              return (
                <button
                  key={slug}
                  onClick={() => setAnswers({ ...answers, activity: slug })}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  <span aria-hidden className="text-lg">{def.emoji}</span>
                  {def.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Q3 — Profil */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            Avec qui ?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            Ça change la sélection — sécurité, ambiance, restos.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {VACATION_PROFILES.map((p) => {
              const def = VACATION_PROFILE_DEFS[p];
              const active = answers.profile === p;
              return (
                <button
                  key={p}
                  onClick={() => setAnswers({ ...answers, profile: p })}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  <span aria-hidden className="text-lg">{def.emoji}</span>
                  {def.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Q4 — Budget */}
      {step === 4 && (
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            Quel budget par jour et par personne ?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            Hébergement + restos + déplacements, tout compris.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {BUDGET_TIERS.map(({ tier, label, range }) => {
              const active = answers.budget === tier;
              return (
                <button
                  key={tier}
                  onClick={() => setAnswers({ ...answers, budget: tier })}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--border)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <span className={`text-sm font-semibold ${active ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>
                      {label}
                    </span>
                    <span className="text-xs font-mono-data text-[var(--text-tertiary)]">
                      {BUDGET_TIER_LABEL[tier]}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">{range}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Q5 — Durée */}
      {step === 5 && (
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
            Combien de temps ?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            Pour adapter la suggestion (un week-end, ce n&apos;est pas le moment d&apos;un road-trip de Bretagne en Corse).
          </p>
          <div className="space-y-2">
            {DURATIONS.map(({ id, label, hint }) => {
              const active = answers.duration === id;
              return (
                <button
                  key={id}
                  onClick={() => setAnswers({ ...answers, duration: id })}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                    active
                      ? "border-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--border)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  <div className={`text-sm font-semibold ${active ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>
                    {label}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{hint}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {step === "results" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Vos 3 destinations
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            {answers.month && answers.activity && answers.profile ? (
              <>
                Sélection {ACTIVITY_DEFS[answers.activity].label.toLowerCase()} en {formatMonthLabel(answers.month).toLowerCase()},
                profil {VACATION_PROFILE_DEFS[answers.profile].label.toLowerCase()},
                budget {answers.budget && BUDGET_TIER_DESC[answers.budget]}.
              </>
            ) : null}
          </p>

          {results.length === 0 ? (
            <div className="rounded-xl border border-amber-300/40 bg-amber-50/40 p-5">
              <p className="text-sm text-[var(--text-primary)]">
                Aucune destination ne coche toutes vos cases. Soit votre activité n&apos;est pas
                de saison ce mois-ci, soit votre budget est trop serré pour ce type de voyage.
                Essayez d&apos;élargir le budget ou de changer de mois.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(({ city, fit }, i) => (
                <div
                  key={city.slug}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1 shrink-0">
                      <span className="text-2xl font-bold font-mono-data text-[var(--text-tertiary)]">
                        #{i + 1}
                      </span>
                      <span className="text-xl font-bold font-mono-data text-[var(--accent)]">
                        {fit.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                        <Link
                          href={`/vacances/${city.slug}`}
                          className="text-base font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                        >
                          {city.name}
                        </Link>
                        <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {city.department}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-snug mb-3">
                        {fit.whyOneLine}
                      </p>
                      <BookingCTA cityName={city.name} variant="compact" month={answers.month ?? undefined} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={reset}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refaire le quiz
          </button>
        </div>
      )}

      {/* Nav */}
      {step !== "results" && (
        <div className="mt-7 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 1}
            className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </button>
          <button
            onClick={next}
            disabled={!canNext}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {step === 5 ? "Voir mes destinations" : "Suivant"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
