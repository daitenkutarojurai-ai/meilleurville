"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, Share2, Sparkles, Check } from "lucide-react";
import {
  CITY_MATCH_QUESTIONS,
  computeMatches,
  encodeAnswers,
  topMatchesWithSurprise,
  type CityMatchAnswer,
  type CityMatchResult,
} from "@/lib/city-match";
import { scoreColor, scoreHex } from "@/lib/utils";

type Phase = "intro" | "quiz" | "result";

export function CityMatchQuiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CityMatchAnswer[]>([]);
  const [copied, setCopied] = useState(false);

  const total = CITY_MATCH_QUESTIONS.length;

  const liveTop3 = useMemo(() => {
    if (answers.length === 0) return [];
    return computeMatches(answers).slice(0, 3);
  }, [answers]);

  const finalResult = useMemo(() => {
    if (phase !== "result") return null;
    return topMatchesWithSurprise(answers, 3);
  }, [phase, answers]);

  const code = useMemo(() => encodeAnswers(answers), [answers]);

  function handleAnswer(value: string) {
    const q = CITY_MATCH_QUESTIONS[step];
    const filtered = answers.filter((a) => a.id !== q.id);
    const next: CityMatchAnswer[] = [...filtered, { id: q.id, value } as CityMatchAnswer];
    setAnswers(next);
    if (step + 1 >= total) {
      setPhase("result");
    } else {
      setStep(step + 1);
    }
  }

  function restart() {
    setPhase("intro");
    setStep(0);
    setAnswers([]);
    setCopied(false);
  }

  async function share() {
    const url = `${window.location.origin}/city-match/r/${code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mon match ville — ${finalResult?.top[0]?.city.name} à ${finalResult?.top[0]?.percent} %`,
          text: "Voici les villes françaises qui collent à mon profil :",
          url,
        });
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (phase === "intro") {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-canvas)] p-8 sm:p-12 text-center shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] mb-4">
          <Sparkles className="h-3 w-3" /> 8 questions · 90 secondes
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
          Quelle ville française vous correspond vraiment ?
        </h2>
        <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
          Pas de classement universel cette fois — votre <em>match</em> personnel,
          calculé à partir de vos priorités. À chaque réponse, le top 3 se met à
          jour en direct.
        </p>
        <button
          type="button"
          onClick={() => setPhase("quiz")}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-6 py-3 text-base font-semibold shadow-lg shadow-[var(--accent)]/30 hover:shadow-xl hover:bg-[var(--accent-hover)] transition-all"
        >
          Commencer
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-6 text-xs text-[var(--text-tertiary)]">
          Aucun email demandé. Le résultat est partageable via un lien.
        </p>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = CITY_MATCH_QUESTIONS[step];
    const progress = ((step + 1) / total) * 100;
    return (
      <div className="space-y-6">
        {/* Progress + back */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (step === 0 ? setPhase("intro") : setStep(step - 1))}
            className="rounded-full bg-[var(--bg-elevated)] h-9 w-9 inline-flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition"
            aria-label="Question précédente"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-1">
              <span>Question {step + 1} / {total}</span>
              <span className="font-mono-data">{Math.round(progress)} %</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-emerald-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div
          key={step}
          className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm"
          style={{ animation: "cm-card-in 0.45s cubic-bezier(.34,1.56,.64,1) both" }}
        >
          <div className="text-center mb-6">
            <div className="text-5xl mb-3" aria-hidden>{q.emoji}</div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {q.question}
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {q.options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => handleAnswer(o.value)}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>{o.emoji}</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {o.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live top 3 */}
        {liveTop3.length > 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-canvas)] px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Top 3 en direct
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {liveTop3.map((r, i) => (
                <span
                  key={r.city.slug}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
                  style={{
                    background: `${scoreHex(r.city.scores.global)}18`,
                    color: scoreHex(r.city.scores.global),
                  }}
                >
                  <span className="text-[10px] font-mono-data opacity-70">#{i + 1}</span>
                  {r.city.name}
                  <span className="text-[10px] font-mono-data opacity-80">{r.percent} %</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <style>{`
          @keyframes cm-card-in {
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

  // phase === "result"
  if (!finalResult) return null;
  const { top, surprise } = finalResult;
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-3">
          <Sparkles className="h-3 w-3" /> Votre match
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
          {top[0]?.city.name} vous correspond à {top[0]?.percent} %
        </h2>
        <p className="text-[var(--text-secondary)]">
          Trois villes ressortent fortement de vos {answers.length} priorités. Une quatrième est
          {surprise ? <> dans le « match surprise » plus bas — moins évident mais qui mérite un coup d&apos;œil.</> : <> à explorer dans le classement complet.</>}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {top.map((r, i) => (
          <ResultCard key={r.city.slug} r={r} rank={i + 1} highlight={i === 0} />
        ))}
      </div>

      {surprise && (
        <div className="rounded-3xl border border-amber-400/30 bg-amber-500/5 p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
            🎲 Match surprise
          </div>
          <ResultCard r={surprise} rank={null} highlight={false} />
        </div>
      )}

      {/* Share + restart */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-[var(--accent-hover)] transition-all"
        >
          {copied ? <><Check className="h-4 w-4" /> Lien copié</> : <><Share2 className="h-4 w-4" /> Partager mon match</>}
        </button>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] px-5 py-2.5 text-sm font-medium hover:border-[var(--accent)]/40 transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          Refaire le quiz
        </button>
      </div>

      <p className="text-center text-xs text-[var(--text-tertiary)]">
        Lien partageable :{" "}
        <Link href={`/city-match/r/${code}`} className="text-[var(--accent)] underline">
          /city-match/r/{code}
        </Link>
      </p>
    </div>
  );
}

function ResultCard({ r, rank, highlight }: { r: CityMatchResult; rank: number | null; highlight: boolean }) {
  return (
    <Link
      href={`/villes/${r.city.slug}`}
      className={
        "group relative block rounded-3xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg " +
        (highlight
          ? "border-[var(--accent)] bg-gradient-to-br from-[var(--accent)]/10 to-transparent shadow-md"
          : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40")
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
          {r.percent}
          <span className="text-sm text-[var(--text-tertiary)]">%</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight">
        {r.city.name}
      </h3>
      <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{r.city.region}</p>

      {r.topReasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {r.topReasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
              <span className={scoreColor(r.city.scores.global)}>●</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 text-xs font-semibold text-[var(--accent)] group-hover:underline">
        Voir la fiche →
      </div>
    </Link>
  );
}
