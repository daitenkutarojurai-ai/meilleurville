"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { QuizAnswers, MatchResult } from "@/lib/types";
import { CityCard } from "@/components/CityCard";
import { QuizShareButton } from "./QuizShareButton";
import { CITIES_SEED } from "@/data/cities-seed";
import Link from "next/link";

// ─── Steps ───────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: "environment",
    question: "Vous êtes plutôt...",
    type: "single" as const,
    options: [
      { value: "mer", label: "🌊 Mer", desc: "Côte, plage, air iodé" },
      { value: "montagne", label: "⛰️ Montagne", desc: "Alpes, Pyrénées, grands espaces" },
      { value: "campagne", label: "🌿 Campagne", desc: "Calme, nature, verdure" },
      { value: "ville", label: "🏙️ Ville", desc: "Culture, services, dynamisme" },
    ],
  },
  {
    id: "situation",
    question: "Votre situation ?",
    type: "single" as const,
    options: [
      { value: "seul", label: "🧍 Seul·e", desc: "Liberté totale" },
      { value: "couple", label: "👫 En couple", desc: "Projet à deux" },
      { value: "famille", label: "👨‍👩‍👧‍👦 Famille", desc: "Avec enfants" },
      { value: "retraite", label: "🌅 Retraite", desc: "Nouvelle vie" },
    ],
  },
  {
    id: "budget",
    question: "Budget logement mensuel ?",
    type: "slider" as const,
    min: 400,
    max: 3000,
    step: 100,
    unit: "€",
  },
  {
    id: "priorities",
    question: "Ce qui compte le plus (choisissez 3 max)",
    type: "multi" as const,
    max: 3,
    options: [
      { value: "transport", label: "🚆 Transport", desc: "Mobilité" },
      { value: "nature", label: "🌳 Nature", desc: "Espaces verts" },
      { value: "culture", label: "🎭 Culture", desc: "Vie culturelle" },
      { value: "calme", label: "🤫 Calme", desc: "Tranquillité" },
      { value: "dynamisme", label: "⚡ Dynamisme", desc: "Énergie" },
      { value: "emploi", label: "💼 Emploi", desc: "Marché du travail" },
      { value: "ecoles", label: "🏫 Écoles", desc: "Éducation" },
      { value: "prix", label: "💰 Prix", desc: "Coût de la vie" },
    ],
  },
  {
    id: "workStyle",
    question: "Vous travaillez comment ?",
    type: "single" as const,
    options: [
      { value: "presentiel", label: "🏢 Présentiel", desc: "Bureau chaque jour" },
      { value: "hybride", label: "🔄 Hybride", desc: "Mi-bureau, mi-remote" },
      { value: "remote", label: "💻 Full remote", desc: "Liberté totale" },
      { value: "independant", label: "🚀 Indépendant", desc: "Freelance / créateur" },
    ],
  },
  {
    id: "climate",
    question: "Votre rapport au soleil ?",
    type: "single" as const,
    options: [
      { value: "soleil", label: "☀️ Soleil max", desc: "Chaleur, +250j de soleil/an" },
      { value: "tempere", label: "⛅ Tempéré", desc: "4 vraies saisons" },
      { value: "ocean", label: "🌬️ Océanique", desc: "Doux, humide, verdoyant" },
      { value: "montagne", label: "❄️ Montagne", desc: "Neige en hiver, fraîcheur" },
    ],
  },
];

const INITIAL_ANSWERS: Partial<QuizAnswers> = {
  budget: 1200,
  priorities: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export function QuizFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>(INITIAL_ANSWERS);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchResult[] | null>(null);

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  function handleSingle(field: string, value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 250);
    }
  }

  function handleMulti(field: string, value: string) {
    const current = (answers as Record<string, string[]>)[field] ?? [];
    const maxItems = (currentStep as { max?: number }).max ?? 99;
    let next: string[];
    if (current.includes(value)) {
      next = current.filter((v) => v !== value);
    } else if (current.length < maxItems) {
      next = [...current, value];
    } else {
      next = current;
    }
    setAnswers((prev) => ({ ...prev, [field]: next }));
  }

  function handleSlider(field: string, value: number) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      setResults(data.results);
    } catch {
      // fallback to demo results
      setResults(getDemoResults());
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-[var(--accent)]/20 border-t-[var(--accent)] animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-[var(--accent)]" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)]">IA en cours...</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Analyse de votre profil contre {CITIES_SEED.length}+ villes françaises
          </p>
        </div>
        <div className="flex gap-1.5">
          {["Annecy", "Nantes", "Rennes", "Bordeaux", "Montpellier"].map((c, i) => (
            <span
              key={c}
              className="text-xs text-[var(--text-secondary)] animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {c}
              {i < 4 ? " ·" : ""}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (results) {
    const profileSummary = [
      answers.environment && { label: "Cadre", value: { mer: "🌊 Mer", montagne: "⛰️ Montagne", campagne: "🌿 Campagne", ville: "🏙️ Ville" }[answers.environment as string] ?? answers.environment },
      answers.situation && { label: "Situation", value: { seul: "🧍 Seul·e", couple: "👫 Couple", famille: "👨‍👩‍👧‍👦 Famille", retraite: "🌅 Retraite" }[answers.situation as string] ?? answers.situation },
      answers.budget && { label: "Budget", value: `${answers.budget}€/mois` },
      answers.workStyle && { label: "Travail", value: { presentiel: "🏢 Présentiel", hybride: "🔄 Hybride", remote: "💻 Remote", independant: "🚀 Freelance" }[answers.workStyle as string] ?? answers.workStyle },
      answers.climate && { label: "Météo", value: { soleil: "☀️ Soleil max", tempere: "⛅ Tempéré", ocean: "🌬️ Océanique", montagne: "❄️ Montagne" }[answers.climate as string] ?? answers.climate },
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    const SCORE_KEYS = [
      { key: "life" as const, label: "Qualité de vie" },
      { key: "cost" as const, label: "Budget" },
      { key: "transport" as const, label: "Transport" },
      { key: "nature" as const, label: "Nature" },
      { key: "safety" as const, label: "Sécurité" },
      { key: "culture" as const, label: "Culture" },
    ];

    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center fade-in-up">
          <div className="mb-4 inline-flex items-center gap-2 text-emerald-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Votre profil analysé</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Vos 5 villes idéales
          </h1>
          <p className="text-[var(--text-secondary)]">
            Basé sur votre profil · Score de compatibilité personnalisé
          </p>
        </div>

        {/* Profile summary */}
        {profileSummary.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2 justify-center fade-in-up">
            {profileSummary.map(({ label, value }) => (
              <div key={label} className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-1.5 text-sm">
                <span className="text-[var(--text-tertiary)]">{label} : </span>
                <span className="font-medium text-[var(--text-primary)]">{value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r, i) => (
            <div
              key={r.city.slug}
              className="fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <CityCard city={r.city} rank={i + 1} />
              <div className="mt-2 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-2">
                <p className="text-xs text-[var(--accent)]">
                  <span className="font-semibold">{Math.round(r.score)}% compatible</span>
                  {" · "}
                  {r.topReason}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table for top 3 */}
        {results.length >= 3 && (
          <div className="mt-12 fade-in-up">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Comparaison de vos 3 meilleures villes
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                    <th className="text-left px-4 py-3 text-[var(--text-tertiary)] font-medium w-32">Critère</th>
                    {results.slice(0, 3).map((r, i) => (
                      <th key={r.city.slug} className="px-4 py-3 text-center">
                        <Link href={`/villes/${r.city.slug}`} className="font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                          {i === 0 ? "🥇 " : i === 1 ? "🥈 " : "🥉 "}{r.city.name}
                        </Link>
                        <div className="text-xs text-[var(--accent)] font-mono-data">{Math.round(r.score)}% match</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SCORE_KEYS.map(({ key, label }) => {
                    const vals = results.slice(0, 3).map((r) => r.city.scores[key]);
                    const maxVal = Math.max(...vals);
                    return (
                      <tr key={key} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)]/50 transition-colors">
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{label}</td>
                        {vals.map((v, i) => (
                          <td key={i} className="px-4 py-3 text-center">
                            <span className={`font-bold font-mono-data ${v === maxVal ? "text-emerald-600" : "text-[var(--text-primary)]"}`}>
                              {v.toFixed(1)}
                            </span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compare links */}
        {results.length >= 2 && (
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {results.slice(0, 3).flatMap((r, i) =>
              results.slice(i + 1, 3).map((r2) => (
                <Link
                  key={`${r.city.slug}-${r2.city.slug}`}
                  href={`/comparer/${[r.city.slug, r2.city.slug].sort().join("-vs-")}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                >
                  Comparer {r.city.name} vs {r2.city.name} →
                </Link>
              ))
            )}
          </div>
        )}

        {/* Pro PDF Report upsell */}
        <div className="mt-8 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-8">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/20">
              <FileText className="h-7 w-7 text-[var(--accent)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-[var(--text-primary)]">
                  Rapport IA personnalisé — Pro
                </h3>
                <Lock className="h-4 w-4 text-[var(--text-tertiary)]" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Obtenez un PDF complet de 8 pages analysant votre compatibilité avec chaque ville recommandée :
                comparatif budget, analyse quartier, Red Flags personnalisés, checklist avant déménagement.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/premium"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
                >
                  ✨ Générer mon rapport — Pro
                </Link>
                <span className="flex items-center text-xs text-[var(--text-tertiary)] self-center">
                  Inclus dans l'abonnement 9,90€/mois
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <QuizShareButton results={results} />
          <Button variant="secondary" onClick={() => { setResults(null); setStep(0); setAnswers(INITIAL_ANSWERS); }}>
            Recommencer le quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {/* Progress */}
      <div className="mb-10">
        <div className="mb-2 flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <span>Question {step + 1} / {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8 fade-in-up" key={step}>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
          {currentStep.question}
        </h2>
        {currentStep.type === "multi" && (
          <p className="text-sm text-[var(--text-secondary)]">
            {(answers.priorities ?? []).length}/{(currentStep as { max: number }).max} sélectionnés
          </p>
        )}
      </div>

      {/* Options */}
      {(currentStep.type === "single" || currentStep.type === "multi") && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          {(currentStep as { options: Array<{ value: string; label: string; desc: string }> }).options.map((opt) => {
            const field = currentStep.id;
            const isMulti = currentStep.type === "multi";
            const selected = isMulti
              ? ((answers as Record<string, string[]>)[field] ?? []).includes(opt.value)
              : (answers as Record<string, string>)[field] === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() =>
                  isMulti ? handleMulti(field, opt.value) : handleSingle(field, opt.value)
                }
                className={cn(
                  "relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer",
                  selected
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-lg shadow-[var(--accent)]/10"
                    : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)]"
                )}
              >
                <span className="text-xl mb-1">{opt.label.split(" ")[0]}</span>
                <span className="font-semibold text-sm text-[var(--text-primary)]">
                  {opt.label.split(" ").slice(1).join(" ")}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">{opt.desc}</span>
                {selected && (
                  <CheckCircle className="absolute top-3 right-3 h-4 w-4 text-[var(--accent)]" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {currentStep.type === "slider" && (
        <div className="mb-8">
          <div className="mb-4 text-center">
            <span className="text-4xl font-bold font-mono-data text-[var(--accent)]">
              {(answers as Record<string, number>)[currentStep.id] ?? 1200}€
            </span>
            <span className="text-[var(--text-secondary)] ml-2 text-lg">/mois</span>
          </div>
          <input
            type="range"
            min={(currentStep as { min: number }).min}
            max={(currentStep as { max: number }).max}
            step={(currentStep as { step: number }).step}
            value={(answers as Record<string, number>)[currentStep.id] ?? 1200}
            onChange={(e) => handleSlider(currentStep.id, Number(e.target.value))}
            className="w-full accent-[var(--accent)] cursor-pointer"
          />
          <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-2">
            <span>{(currentStep as { min: number }).min}€</span>
            <span>{(currentStep as { max: number }).max}€+</span>
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canAdvance(step, currentStep, answers)}
            className="gap-2"
          >
            Suivant
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canAdvance(step, currentStep, answers)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Trouver mes villes
          </Button>
        )}
      </div>
    </div>
  );
}

function canAdvance(
  step: number,
  currentStep: (typeof STEPS)[number],
  answers: Partial<QuizAnswers>
): boolean {
  if (currentStep.type === "single") {
    return !!(answers as Record<string, string>)[currentStep.id];
  }
  if (currentStep.type === "multi") {
    return ((answers as Record<string, string[]>)[currentStep.id] ?? []).length > 0;
  }
  return true;
}

function getDemoResults(): MatchResult[] {
  const cities = [
    { slug: "annecy", name: "Annecy", region: "Auvergne-Rhône-Alpes", score: 9.1, reason: "Nature + sécurité + qualité de vie" },
    { slug: "nantes", name: "Nantes", region: "Pays de la Loire", score: 8.7, reason: "Dynamisme + transports + prix" },
    { slug: "rennes", name: "Rennes", region: "Bretagne", score: 8.4, reason: "Remote work + campus + vélo" },
    { slug: "bordeaux", name: "Bordeaux", region: "Nouvelle-Aquitaine", score: 8.1, reason: "Culture + gastronomie + soleil" },
    { slug: "montpellier", name: "Montpellier", region: "Occitanie", score: 7.9, reason: "Soleil + mer + étudiant" },
  ];
  return cities.map((c) => ({
    city: {
      id: c.slug,
      slug: c.slug,
      name: c.name,
      region: c.region,
      department: null,
      population: 150000,
      latitude: null,
      longitude: null,
      scores: { global: c.score, life: c.score, transport: 7.5, nature: 8, cost: 7, safety: 8, culture: 8, remoteWork: 8, schools: 7.5 },
      characterTags: ["dynamique", "culturel"],
      reviewCount: 280,
      sunshinedays: null,
      avgTempJuly: null,
      avgTempJanuary: null,
    },
    score: 70 + ((c.slug.charCodeAt(0) % 26) / 26) * 25,
    breakdown: {},
    topReason: c.reason,
  }));
}
