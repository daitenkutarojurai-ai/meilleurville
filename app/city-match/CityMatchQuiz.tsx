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
import type { CityLight } from "@/lib/cities-light";
import { scoreColor, scoreHex } from "@/lib/utils";

type Phase = "intro" | "quiz" | "result";

type Locale = "fr" | "en";

// EN labels keyed by question id (the lib only ships French copy).
const QUESTION_EN: Record<string, string> = {
  stage: "What stage of life are you at?",
  budget: "What's your budget level?",
  vibe: "What are you looking for?",
  size: "What size of city?",
  climate: "Ideal climate?",
  work: "How do you work?",
  safety: "How much does safety matter?",
  terrain: "What kind of setting?",
};

// EN option labels keyed by `${questionId}:${optionValue}`.
const OPTION_EN: Record<string, string> = {
  "stage:solo": "Solo, young professional",
  "stage:couple": "Couple, no kids",
  "stage:family": "Family with children",
  "stage:retire": "Retired or nearly there",
  "budget:low": "Tight — every euro counts",
  "budget:mid": "Comfortable — within reason",
  "budget:high": "Well-off — quality over price",
  "vibe:nature": "Nature, quiet, the outdoors",
  "vibe:culture": "Culture, nightlife, the scene",
  "vibe:balanced": "A balance of both",
  "size:metro": "Big metro (200k+)",
  "size:mid": "Mid-size city (30k-200k)",
  "size:small": "Small town (< 30k)",
  "climate:warm": "Warm and sunny",
  "climate:mild": "Mild, oceanic",
  "climate:cold": "Cool, continental",
  "work:remote": "Fully remote",
  "work:mixed": "Hybrid",
  "work:office": "Office / on-site",
  "safety:essential": "Essential, non-negotiable",
  "safety:important": "Important",
  "safety:secondary": "Secondary, I'll manage",
  "terrain:sea": "Sea / coast",
  "terrain:mountain": "Mountains",
  "terrain:plain": "Plains / inland",
  "terrain:any": "No preference",
};

// The lib builds `topReasons` as French strings. Translate them for EN at the
// display site (per the no-touch-lib constraint). Patterns mirror lib/city-match.ts.
function translateReason(reason: string): string {
  const num = "([\\d.]+)";
  const rules: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
    [new RegExp(`^coût de la vie ${num}/10$`), (m) => `cost of living ${m[1]}/10`],
    [new RegExp(`^qualité de vie ${num}/10$`), (m) => `quality of life ${m[1]}/10`],
    [new RegExp(`^nature ${num}/10$`), (m) => `nature ${m[1]}/10`],
    [new RegExp(`^culture ${num}/10$`), (m) => `culture ${m[1]}/10`],
    [/^grande métropole$/, () => "big metro"],
    [/^ville à taille humaine$/, () => "human-scale city"],
    [/^village ou bourg$/, () => "village or small town"],
    [new RegExp(`^été (\\d+)°C, (\\d+)j de soleil$`), (m) => `summer ${m[1]}°C, ${m[2]} sunny days`],
    [new RegExp(`^hiver (-?\\d+)°C$`), (m) => `winter ${m[1]}°C`],
    [/^climat équilibré$/, () => "balanced climate"],
    [new RegExp(`^familles : écoles ${num} \\+ sécurité ${num}$`), (m) => `families: schools ${m[1]} + safety ${m[2]}`],
    [/^retraite tranquille$/, () => "quiet retirement"],
    [new RegExp(`^télétravail ${num}/10$`), (m) => `remote work ${m[1]}/10`],
    [new RegExp(`^transport ${num}/10$`), (m) => `transit ${m[1]}/10`],
    [new RegExp(`^très sûr \\(${num}/10\\)$`), (m) => `very safe (${m[1]}/10)`],
    [/^bord de mer$/, () => "by the sea"],
    [new RegExp(`^montagne \\((\\d+) m\\)$`), (m) => `mountains (${m[1]} m)`],
    [/^plaine$/, () => "plains"],
  ];
  for (const [re, fn] of rules) {
    const m = reason.match(re);
    if (m) return fn(m);
  }
  return reason;
}

export function CityMatchQuiz({ locale = "fr", cities }: { locale?: Locale; cities: CityLight[] }) {
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const cityHref = (slug: string) => (locale === "en" ? `/cities/${slug}` : `/villes/${slug}`);
  const localizeReason = (reason: string) => (locale === "en" ? translateReason(reason) : reason);

  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<CityMatchAnswer[]>([]);
  const [copied, setCopied] = useState(false);

  const total = CITY_MATCH_QUESTIONS.length;

  const liveTop3 = useMemo(() => {
    if (answers.length === 0) return [];
    return computeMatches(answers, cities).slice(0, 3);
  }, [answers, cities]);

  const finalResult = useMemo(() => {
    if (phase !== "result") return null;
    return topMatchesWithSurprise(answers, cities, 3);
  }, [phase, answers, cities]);

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
          title: t(
            `Mon match ville — ${finalResult?.top[0]?.city.name} à ${finalResult?.top[0]?.percent} %`,
            `My city match — ${finalResult?.top[0]?.city.name} at ${finalResult?.top[0]?.percent}%`,
          ),
          text: t(
            "Voici les villes françaises qui collent à mon profil :",
            "Here are the French cities that fit my profile:",
          ),
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
          <Sparkles className="h-3 w-3" /> {t("8 questions · 90 secondes", "8 questions · 90 seconds")}
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
          {t("Quelle ville française vous correspond vraiment ?", "Which French city really fits you?")}
        </h2>
        <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
          {locale === "en" ? (
            <>
              Not a universal ranking this time — your personal <em>match</em>,
              calculated from your priorities. Your top 3 updates live with every
              answer.
            </>
          ) : (
            <>
              Pas de classement universel cette fois — votre <em>match</em> personnel,
              calculé à partir de vos priorités. À chaque réponse, le top 3 se met à
              jour en direct.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => setPhase("quiz")}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-6 py-3 text-base font-semibold shadow-lg shadow-[var(--accent)]/30 hover:shadow-xl hover:bg-[var(--accent-hover)] transition-all"
        >
          {t("Commencer", "Start")}
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-6 text-xs text-[var(--text-tertiary)]">
          {t(
            "Aucun email demandé. Le résultat est partageable via un lien.",
            "No email required. Your result is shareable via a link.",
          )}
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
            aria-label={t("Question précédente", "Previous question")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-1">
              <span>{t("Question", "Question")} {step + 1} / {total}</span>
              <span className="font-mono-data">{Math.round(progress)}{t(" %", "%")}</span>
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
              {t(q.question, QUESTION_EN[q.id] ?? q.question)}
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
                    {t(o.label, OPTION_EN[`${q.id}:${o.value}`] ?? o.label)}
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
              <Sparkles className="h-3 w-3" /> {t("Top 3 en direct", "Live top 3")}
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
                  <span className="text-[10px] font-mono-data opacity-80">{r.percent}{t(" %", "%")}</span>
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
          <Sparkles className="h-3 w-3" /> {t("Votre match", "Your match")}
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
          {t(
            `${top[0]?.city.name} vous correspond à ${top[0]?.percent} %`,
            `${top[0]?.city.name} is a ${top[0]?.percent}% match`,
          )}
        </h2>
        <p className="text-[var(--text-secondary)]">
          {locale === "en" ? (
            <>
              Three cities stand out strongly from your {answers.length} priorities. A fourth is
              {surprise ? <> in the &laquo; surprise match &raquo; below — less obvious, but worth a look.</> : <> waiting in the full ranking.</>}
            </>
          ) : (
            <>
              Trois villes ressortent fortement de vos {answers.length} priorités. Une quatrième est
              {surprise ? <> dans le « match surprise » plus bas — moins évident mais qui mérite un coup d&apos;œil.</> : <> à explorer dans le classement complet.</>}
            </>
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {top.map((r, i) => (
          <ResultCard
            key={r.city.slug}
            r={r}
            rank={i + 1}
            highlight={i === 0}
            href={cityHref(r.city.slug)}
            localizeReason={localizeReason}
            ctaLabel={t("Voir la fiche →", "View the profile →")}
          />
        ))}
      </div>

      {surprise && (
        <div className="rounded-3xl border border-amber-400/30 bg-amber-500/5 p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
            🎲 {t("Match surprise", "Surprise match")}
          </div>
          <ResultCard
            r={surprise}
            rank={null}
            highlight={false}
            href={cityHref(surprise.city.slug)}
            localizeReason={localizeReason}
            ctaLabel={t("Voir la fiche →", "View the profile →")}
          />
        </div>
      )}

      {/* Share + restart */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-[var(--accent-hover)] transition-all"
        >
          {copied
            ? <><Check className="h-4 w-4" /> {t("Lien copié", "Link copied")}</>
            : <><Share2 className="h-4 w-4" /> {t("Partager mon match", "Share my match")}</>}
        </button>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] px-5 py-2.5 text-sm font-medium hover:border-[var(--accent)]/40 transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          {t("Refaire le quiz", "Start over")}
        </button>
      </div>

      <p className="text-center text-xs text-[var(--text-tertiary)]">
        {t("Lien partageable :", "Shareable link:")}{" "}
        <Link href={`/city-match/r/${code}`} className="text-[var(--accent)] underline">
          /city-match/r/{code}
        </Link>
      </p>
    </div>
  );
}

function ResultCard({
  r,
  rank,
  highlight,
  href,
  localizeReason,
  ctaLabel,
}: {
  r: CityMatchResult;
  rank: number | null;
  highlight: boolean;
  href: string;
  localizeReason: (reason: string) => string;
  ctaLabel: string;
}) {
  return (
    <Link
      href={href}
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
              <span>{localizeReason(reason)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 text-xs font-semibold text-[var(--accent)] group-hover:underline">
        {ctaLabel}
      </div>
    </Link>
  );
}
