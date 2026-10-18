"use client";
import Link from "@/components/AppLink";
import { useState } from "react";
import { ArrowRight, Brain, Target, Zap, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

// « Carte & plaque » (2026-10-18): one survey-map sheet instead of the aurora /
// glass / tilt / sparkle stack. The demo answers are plain choices (no emoji),
// and matched cities are place names, hence enamel plaques.

type Locale = "fr" | "en";

const STEPS = (L: (fr: string, en: string) => string) => [
  { icon: Brain, label: L("7 questions", "7 questions"), desc: L("Style de vie, budget, priorités", "Lifestyle, budget, priorities") },
  { icon: Zap, label: L("Match en 3s", "Match in 3s"), desc: L("Algorithme pondéré sur 8 axes", "Weighted algorithm across 8 axes") },
  { icon: Target, label: L("Top 5 villes", "Top 5 cities"), desc: L("Personnalisé et expliqué", "Personalised and explained") },
];

const DEMO_OPTIONS = (L: (fr: string, en: string) => string) => [
  { id: "nature", label: L("Nature, calme, vélo", "Nature, quiet, cycling"), match: ["Annecy", "Grenoble", "Chambéry"] },
  { id: "city", label: L("Ville vibrante, sorties", "Buzzing city, nightlife"), match: ["Lyon", "Bordeaux", "Nantes"] },
  { id: "mer", label: L("Mer, soleil, terrasses", "Sea, sun, terraces"), match: ["Montpellier", "Nice", "La Rochelle"] },
  { id: "calme", label: L("Charme & douceur", "Charm & easy living"), match: ["Annecy", "Aix-en-Provence", "Strasbourg"] },
];

export function QuizTeaser({ citiesCount, locale = "fr" }: { citiesCount: number; locale?: Locale }) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const steps = STEPS(L);
  const demoOptions = DEMO_OPTIONS(L);
  const cityMatchHref = "/city-match";
  const [picked, setPicked] = useState<string | null>(null);
  const matched = demoOptions.find((o) => o.id === picked)?.match ?? null;

  return (
    <section id="quiz" className="py-8 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]">
          <div className="grid lg:grid-cols-2">
            {/* Left: copy */}
            <div className="p-6 sm:p-10 lg:p-12">
              <p className="mb-4 font-mono-data text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                {L("Quiz IA · 3 minutes", "AI quiz · 3 minutes")}
              </p>
              <h2 className="mb-4 text-3xl lg:text-5xl font-bold text-[var(--text-primary)] leading-[1.08] tracking-tight">
                {locale === "en" ? (
                  <>
                    Your perfect city <span className="ink-underline">exists.</span>
                    <br />
                    Let&apos;s find it.
                  </>
                ) : (
                  <>
                    Votre ville parfaite <span className="ink-underline">existe.</span>
                    <br />
                    On va la dénicher.
                  </>
                )}
              </h2>
              <p className="mb-8 text-[var(--text-secondary)] leading-relaxed text-lg">
                {locale === "en" ? (
                  <>
                    7 questions, 3 minutes. We match what you want against {citiesCount} French cities and
                    tell you why each one could be your next home.
                  </>
                ) : (
                  <>
                    7 questions, 3 minutes. On compare vos envies à {citiesCount} villes françaises et
                    on vous dit pourquoi chacune pourrait être votre prochain chez-vous.
                  </>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href={cityMatchHref}>
                  <Button size="lg" className="plaque gap-2 !rounded-md border-0 hover:!bg-[var(--accent-hover)]">
                    <MapPin className="h-5 w-5" aria-hidden />
                    {L("Trouver ma ville", "Find my city")}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
                <span className="font-mono-data text-xs text-[var(--text-tertiary)]">
                  {L("Gratuit · Sans inscription", "Free · No sign-up")}
                </span>
              </div>

              <div className="mt-4">
                <Link
                  href={cityMatchHref}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] underline decoration-[var(--accent)]/30 underline-offset-4 hover:decoration-[var(--accent)]"
                >
                  {L("Nouveau · Essayer City Match (résultat partageable)", "New · Try City Match (shareable result)")}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>

              {/* Steps: a map legend, numbered */}
              <ol className="mt-10 grid grid-cols-3 border-t border-dashed border-[var(--border)]">
                {steps.map(({ icon: Icon, label }, i) => (
                  <li
                    key={label}
                    className={
                      "flex flex-col gap-1.5 pt-3 pr-2 " +
                      (i > 0 ? "border-l border-dashed border-[var(--border)] pl-3" : "")
                    }
                  >
                    <div className="flex items-center gap-1.5 text-[var(--accent)]">
                      <span className="font-mono-data text-[11px] font-semibold">{String(i + 1).padStart(2, "0")}</span>
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </div>
                    <div className="text-xs font-bold leading-tight text-[var(--text-primary)]">{label}</div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Right: interactive demo, on a topo sheet */}
            <div className="topo-bg border-t border-[var(--border)] p-6 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="mb-2 flex items-center justify-between gap-2 border-b border-dashed border-[var(--border)] pb-2">
                  <span className="font-mono-data text-xs font-semibold text-[var(--accent)]">Q.1 / 7</span>
                  <span className="font-mono-data text-[11px] uppercase tracking-widest text-[var(--text-tertiary)]">
                    {L("démo", "demo")}
                  </span>
                </div>
                <p className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-4">
                  {locale === "en" ? (
                    <>When you picture &ldquo;living well&rdquo;, what does it look like&nbsp;?</>
                  ) : (
                    <>Quand vous pensez « bien vivre », ça ressemble à quoi&nbsp;?</>
                  )}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {demoOptions.map((o) => {
                    const active = picked === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setPicked(active ? null : o.id)}
                        className={
                          "flex items-center gap-2 rounded-md border p-3 text-left text-sm transition-colors " +
                          (active
                            ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                            : "bg-[var(--bg-canvas)] border-[var(--border)] hover:border-[var(--accent)]")
                        }
                      >
                        <span className={"flex-1 font-medium " + (active ? "" : "text-[var(--text-primary)]")}>{o.label}</span>
                        {active && <Check className="h-4 w-4" aria-hidden />}
                      </button>
                    );
                  })}
                </div>

                {/* Match preview */}
                <div
                  className="mt-4 overflow-hidden transition-all"
                  style={{
                    maxHeight: matched ? 140 : 0,
                    opacity: matched ? 1 : 0,
                  }}
                  aria-live="polite"
                >
                  <div className="border-t border-dashed border-[var(--border)] pt-3">
                    <div className="mb-2 font-mono-data text-[11px] font-semibold uppercase tracking-widest text-[var(--accent)]">
                      {L("Vos villes matchées", "Your matched cities")}
                    </div>
                    <div className="flex flex-wrap gap-2 pl-0.5">
                      {matched?.map((m) => (
                        <span key={m} className="plaque plaque-small">
                          {m}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2.5 text-xs text-[var(--text-tertiary)]">
                      {L("+ 6 autres questions pour affiner votre top 5 →", "+ 6 more questions to refine your top 5 →")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
