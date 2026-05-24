"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Share2,
  Check,
  Sparkles,
  Telescope,
  ThumbsUp,
} from "lucide-react";
import {
  projectionWithSurprise,
  encodeProjectionInput,
  LIFE_STAGE_META,
  BUDGET_TRAJ_META,
  PROJECTION_PRIORITY_META,
  CLIMATE_RISK_META,
  type LifeStageIn5Years,
  type BudgetTrajectory,
  type ProjectionPriority,
  type ProjectionInput,
  type ProjectionResult,
} from "@/lib/projection-5ans";
import { CITIES_SEED } from "@/data/cities-seed";
import { scoreHex } from "@/lib/utils";

type Step = 0 | 1 | 2;
type Phase = "intro" | "wizard" | "result";

const LIFE_STAGES: LifeStageIn5Years[] = [
  "same",
  "with_partner",
  "with_kids",
  "kids_growing",
  "remote_full",
  "retiring",
  "freelance",
];

const BUDGET_TRAJS: BudgetTrajectory[] = [
  "stable",
  "growing",
  "downsizing",
  "buying",
];

const PRIORITY_KEYS: ProjectionPriority[] = [
  "cost",
  "nature",
  "safety",
  "culture",
  "schools",
  "remote",
  "transport",
];

const MAX_PRIORITIES = 3;

export function ProjectionClient({
  initialCode,
}: {
  initialCode?: string | null;
}) {
  const [phase, setPhase] = useState<Phase>(initialCode ? "result" : "intro");
  const [step, setStep] = useState<Step>(0);
  const [lifeStage, setLifeStage] = useState<LifeStageIn5Years>("same");
  const [budgetTraj, setBudgetTraj] = useState<BudgetTrajectory>("stable");
  const [climateSensitivity, setClimateSensitivity] = useState<
    "low" | "med" | "high"
  >("med");
  const [priorities, setPriorities] = useState<ProjectionPriority[]>([
    "cost",
    "safety",
    "nature",
  ]);
  const [currentCity, setCurrentCity] = useState<string>("");
  const [cityQuery, setCityQuery] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const input: ProjectionInput = useMemo(
    () => ({
      currentCity,
      lifeIn5Years: lifeStage,
      budgetTraj,
      climateSensitivity,
      priorities,
    }),
    [currentCity, lifeStage, budgetTraj, climateSensitivity, priorities],
  );

  const result = useMemo(() => {
    if (phase !== "result") return null;
    return projectionWithSurprise(input);
  }, [phase, input]);

  const code = useMemo(() => encodeProjectionInput(input), [input]);

  const togglePriority = useCallback((p: ProjectionPriority) => {
    setPriorities((cur) => {
      if (cur.includes(p)) return cur.filter((x) => x !== p);
      if (cur.length >= MAX_PRIORITIES) return cur;
      return [...cur, p];
    });
  }, []);

  async function share() {
    const url = `${window.location.origin}/projection-5ans#${encodeURIComponent(code)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ma projection 5 ans — ${result?.top[0]?.city.name ?? ""}`,
          text: "Où devrais-je vivre dans 5 ans ? Ma projection sur mavilleideale.fr",
          url,
        });
        return;
      } catch {
        // user cancelled
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function restart() {
    setPhase("intro");
    setStep(0);
    setCopied(false);
  }

  function goResult() {
    setPhase("result");
  }

  // City autocomplete
  const citySuggestions = useMemo(() => {
    if (cityQuery.length < 2) return [];
    const q = cityQuery.toLowerCase();
    return CITIES_SEED.filter((c) => c.name.toLowerCase().startsWith(q)).slice(0, 6);
  }, [cityQuery]);

  // ── INTRO ───────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-amber-50/50 to-rose-50/30 dark:from-amber-900/10 dark:to-rose-900/5 p-8 sm:p-12 text-center shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-4">
          <Telescope className="h-3 w-3" /> 3 étapes · 2 minutes
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
          Où devriez-vous vivre dans 5 ans ?
        </h2>
        <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto mb-8 leading-relaxed">
          Pas « où vivre aujourd&apos;hui » : où vivre <em>dans 5 ans</em>,
          compte tenu de ce que vous serez — famille, carrière, budget, et d&apos;un
          climat 2040 qui ne ressemblera pas au climat 2025.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => { setPhase("wizard"); setStep(0); }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white px-7 py-3 text-base font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl hover:opacity-90 transition-all"
          >
            Commencer
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">
          Aucun email. Lien partageable. 352 villes analysées.
        </p>
      </div>
    );
  }

  // ── WIZARD ───────────────────────────────────────────────────────────────────
  if (phase === "wizard") {
    const steps = ["Situation dans 5 ans", "Budget & climat", "Priorités"];
    const progress = ((step + 1) / 3) * 100;

    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (step === 0 ? setPhase("intro") : setStep((s) => (s - 1) as Step))}
            className="rounded-full bg-[var(--bg-elevated)] h-9 w-9 inline-flex items-center justify-center text-[var(--text-secondary)] hover:bg-amber-500/10 hover:text-amber-600 transition"
            aria-label="Étape précédente"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-1">
              <span>{steps[step]}</span>
              <span className="font-mono-data">{step + 1} / 3</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #F59E0B, #F43F5E)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Step 0 — Vie dans 5 ans */}
        {step === 0 && (
          <div
            key="step-0"
            className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm"
            style={{ animation: "proj-card-in 0.4s cubic-bezier(.34,1.56,.64,1) both" }}
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🔭</div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Votre situation dans 5 ans ?
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Choisissez la trajectoire la plus proche de votre réalité.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {LIFE_STAGES.map((s) => {
                const m = LIFE_STAGE_META[s];
                const selected = lifeStage === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setLifeStage(s); setStep(1); }}
                    className={
                      "group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md " +
                      (selected
                        ? "border-amber-500 bg-amber-500/10 shadow-md"
                        : "border-[var(--border)] bg-[var(--bg-canvas)] hover:border-amber-400")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.emoji}</span>
                      <div>
                        <span className={
                          "text-sm font-semibold transition-colors " +
                          (selected ? "text-amber-700 dark:text-amber-400" : "text-[var(--text-primary)] group-hover:text-amber-600")
                        }>
                          {m.label}
                        </span>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{m.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Optional: current city */}
            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                Ville actuelle (optionnel — pour calculer l&apos;écart de score) :
              </p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex : Paris, Lyon, Bordeaux…"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-amber-400 transition"
                />
                {citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg overflow-hidden">
                    {citySuggestions.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => {
                          setCurrentCity(c.slug);
                          setCityQuery(c.name);
                        }}
                        className={
                          "w-full text-left px-4 py-2.5 text-sm transition hover:bg-amber-500/10 " +
                          (currentCity === c.slug ? "bg-amber-500/10 font-semibold text-amber-700" : "text-[var(--text-primary)]")
                        }
                      >
                        {c.name}
                        <span className="ml-2 text-xs text-[var(--text-tertiary)]">{c.region}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {currentCity && (
                <p className="mt-1.5 text-xs text-amber-600 font-medium">
                  Ville actuelle : {CITIES_SEED.find((c) => c.slug === currentCity)?.name}
                  {" "}
                  <button type="button" onClick={() => { setCurrentCity(""); setCityQuery(""); }} className="underline text-[var(--text-tertiary)]">
                    Effacer
                  </button>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 1 — Budget & climat */}
        {step === 1 && (
          <div
            key="step-1"
            className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm space-y-6"
            style={{ animation: "proj-card-in 0.4s cubic-bezier(.34,1.56,.64,1) both" }}
          >
            <div className="text-center">
              <div className="text-5xl mb-3">💰</div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Budget et sensibilité au climat
              </h3>
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                Trajectoire budgétaire dans 5 ans
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {BUDGET_TRAJS.map((t) => {
                  const m = BUDGET_TRAJ_META[t];
                  const selected = budgetTraj === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBudgetTraj(t)}
                      className={
                        "group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 " +
                        (selected
                          ? "border-amber-500 bg-amber-500/10 shadow-md"
                          : "border-[var(--border)] bg-[var(--bg-canvas)] hover:border-amber-400")
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{m.emoji}</span>
                        <div>
                          <span className={
                            "text-sm font-semibold transition-colors " +
                            (selected ? "text-amber-700 dark:text-amber-400" : "text-[var(--text-primary)]")
                          }>
                            {m.label}
                          </span>
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{m.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2">
                Sensibilité au réchauffement climatique (horizon 2040)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "med", "high"] as const).map((level) => {
                  const labels = {
                    low: { emoji: "🌤️", label: "Faible", desc: "Je m'adapterai" },
                    med: { emoji: "🌡️", label: "Modérée", desc: "Ça compte" },
                    high: { emoji: "🔥", label: "Forte", desc: "Critère majeur" },
                  } as const;
                  const m = labels[level];
                  const selected = climateSensitivity === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setClimateSensitivity(level)}
                      className={
                        "rounded-2xl border p-3 text-center transition-all " +
                        (selected
                          ? "border-rose-400 bg-rose-500/10 shadow-md"
                          : "border-[var(--border)] bg-[var(--bg-canvas)] hover:border-rose-300")
                      }
                    >
                      <div className="text-xl mb-1">{m.emoji}</div>
                      <p className={
                        "text-xs font-semibold " +
                        (selected ? "text-rose-600 dark:text-rose-400" : "text-[var(--text-primary)]")
                      }>
                        {m.label}
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white py-3 font-semibold shadow-md hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Suivant <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2 — Priorités */}
        {step === 2 && (
          <div
            key="step-2"
            className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm space-y-6"
            style={{ animation: "proj-card-in 0.4s cubic-bezier(.34,1.56,.64,1) both" }}
          >
            <div className="text-center">
              <div className="text-5xl mb-3">🎯</div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Vos 3 critères prioritaires
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Sélectionnez jusqu&apos;à {MAX_PRIORITIES} critères.{" "}
                <span className="font-mono-data text-amber-600">{priorities.length}/{MAX_PRIORITIES}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PRIORITY_KEYS.map((p) => {
                const m = PROJECTION_PRIORITY_META[p];
                const selected = priorities.includes(p);
                const disabled = !selected && priorities.length >= MAX_PRIORITIES;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePriority(p)}
                    disabled={disabled}
                    className={
                      "rounded-2xl border p-3 text-left transition-all " +
                      (selected
                        ? "border-amber-500 bg-amber-500/10 shadow-sm"
                        : disabled
                        ? "border-[var(--border)] bg-[var(--bg-canvas)] opacity-40 cursor-not-allowed"
                        : "border-[var(--border)] bg-[var(--bg-canvas)] hover:border-amber-400 hover:-translate-y-0.5")
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{m.emoji}</span>
                      <span className={
                        "text-xs font-semibold " +
                        (selected ? "text-amber-700 dark:text-amber-400" : "text-[var(--text-primary)]")
                      }>
                        {m.label}
                      </span>
                      {selected && <Check className="h-3 w-3 text-amber-600 ml-auto flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={goResult}
              disabled={priorities.length === 0}
              className="w-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white py-3 font-semibold shadow-md hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
              Calculer ma projection
            </button>
          </div>
        )}

        <style>{`
          @keyframes proj-card-in {
            from { transform: translateX(40px) scale(0.96); opacity: 0; }
            to { transform: none; opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            * { animation: none !important; }
          }
        `}</style>
      </div>
    );
  }

  // ── RESULT ───────────────────────────────────────────────────────────────────
  if (!result) return null;
  const { top, surprise } = result;
  const top1 = top[0];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-3">
          <Telescope className="h-3 w-3" /> Projection 5 ans
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
          {top1 ? (
            <>Dans 5 ans — <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-500">{top1.city.name}</span> ({top1.score}/100)</>
          ) : (
            "Votre projection"
          )}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
          Résultat basé sur votre trajectoire ({LIFE_STAGE_META[input.lifeIn5Years].label}),
          votre budget ({BUDGET_TRAJ_META[input.budgetTraj].label}) et le risque climatique 2040.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {top.map((r, i) => (
          <ProjectionCard key={r.city.slug} r={r} rank={i + 1} highlight={i === 0} />
        ))}
      </div>

      {surprise && (
        <div className="rounded-3xl border border-amber-400/30 bg-amber-50/50 dark:bg-amber-900/10 p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Match surprise — hors des sentiers battus
          </div>
          <ProjectionCard r={surprise} rank={null} highlight={false} />
        </div>
      )}

      {/* CTAs */}
      <div className="grid sm:grid-cols-2 gap-3">
        {top1 && (
          <Link
            href={`/comparer/${input.currentCity && input.currentCity !== top1.city.slug ? `${input.currentCity}-vs-${top1.city.slug}` : top1.city.slug}`}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-amber-400 transition-colors"
          >
            <p className="text-xs uppercase tracking-widest font-bold text-[var(--text-tertiary)] mb-1">Comparer</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-amber-600 transition-colors">
              {input.currentCity
                ? `Ma ville actuelle vs ${top1.city.name} →`
                : `Détails sur ${top1.city.name} →`}
            </p>
          </Link>
        )}
        <Link
          href="/city-match"
          className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)] transition-colors"
        >
          <p className="text-xs uppercase tracking-widest font-bold text-[var(--text-tertiary)] mb-1">Présent</p>
          <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            Quelle ville me correspond <em>maintenant</em> ? →
          </p>
        </Link>
      </div>

      {/* Share + restart */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white px-5 py-2.5 text-sm font-semibold shadow-md hover:opacity-90 transition-all"
        >
          {copied ? (
            <><Check className="h-4 w-4" /> Lien copié</>
          ) : (
            <><Share2 className="h-4 w-4" /> Partager ma projection</>
          )}
        </button>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] px-5 py-2.5 text-sm font-medium hover:border-amber-400 transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          Refaire
        </button>
      </div>

      <p className="text-center text-xs text-[var(--text-tertiary)]">
        Projection indicative — moteur déterministe, données seed + Climat 2040 ARPEGE. Aucun algorithme opaque.
      </p>
    </div>
  );
}

function ProjectionCard({
  r,
  rank,
  highlight,
}: {
  r: ProjectionResult;
  rank: number | null;
  highlight: boolean;
}) {
  const riskMeta = CLIMATE_RISK_META[r.climateRisk];

  return (
    <div
      className={
        "relative rounded-3xl border p-5 transition-all " +
        (highlight
          ? "border-amber-400 bg-gradient-to-br from-amber-50/80 to-rose-50/40 dark:from-amber-900/20 dark:to-rose-900/10 shadow-md"
          : "border-[var(--border)] bg-[var(--bg-surface)]")
      }
    >
      <div className="flex items-baseline justify-between mb-2">
        {rank != null && (
          <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">
            #{rank}
          </span>
        )}
        <div
          className="ml-auto text-2xl font-bold font-mono-data"
          style={{ color: scoreHex(r.city.scores.global) }}
        >
          {r.score}
          <span className="text-sm text-[var(--text-tertiary)]">/100</span>
        </div>
      </div>

      <Link href={`/villes/${r.city.slug}`} className="group block">
        <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-amber-600 transition-colors leading-tight">
          {r.city.name}
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{r.city.region}</p>
      </Link>

      {/* Delta */}
      {r.delta != null && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold font-mono-data"
          style={{
            background: r.delta >= 0 ? "#16A34A18" : "#EF444418",
            color: r.delta >= 0 ? "#16A34A" : "#EF4444",
          }}
        >
          {r.delta >= 0 ? "+" : ""}{r.delta} vs ma ville
        </div>
      )}

      {/* Climate risk */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-xs" aria-hidden>{riskMeta.emoji}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: riskMeta.color }}>
          Risque climat 2040 : {riskMeta.label}
        </span>
      </div>

      {/* Top axes */}
      {r.topAxes.length > 0 && (
        <div className="mt-3 space-y-1">
          {r.topAxes.map((ax) => (
            <div key={ax.key} className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${ax.score * 10}%`,
                    background: "linear-gradient(90deg, #F59E0B, #F43F5E)",
                  }}
                />
              </div>
              <span className="text-[10px] text-[var(--text-tertiary)] w-24 truncate text-right">{ax.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Trajectory fit */}
      <p className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed italic border-t border-[var(--border)] pt-2">
        <ThumbsUp className="h-3 w-3 inline mr-1 text-amber-500" aria-hidden />
        {r.trajectoryFit}
      </p>
    </div>
  );
}
