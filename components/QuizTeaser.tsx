"use client";
import Link from "next/link";
import { useState } from "react";
import { Sparkles, ArrowRight, Brain, Target, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/effects/MagneticButton";
import { TiltCard } from "@/components/effects/TiltCard";

type Locale = "fr" | "en";

const STEPS = (L: (fr: string, en: string) => string) => [
  { icon: Brain, label: L("7 questions", "7 questions"), desc: L("Style de vie, budget, priorités", "Lifestyle, budget, priorities") },
  { icon: Zap, label: L("Match en 3s", "Match in 3s"), desc: L("Algorithme pondéré sur 8 axes", "Weighted algorithm across 8 axes") },
  { icon: Target, label: L("Top 5 villes", "Top 5 cities"), desc: L("Personnalisé et expliqué", "Personalised and explained") },
];

const DEMO_OPTIONS = (L: (fr: string, en: string) => string) => [
  { id: "nature", label: L("Nature, calme, vélo", "Nature, quiet, cycling"), emoji: "🌲", match: ["Annecy", "Grenoble", "Chambéry"] },
  { id: "city", label: L("Ville vibrante, sorties", "Buzzing city, nightlife"), emoji: "🎭", match: ["Lyon", "Bordeaux", "Nantes"] },
  { id: "mer", label: L("Mer, soleil, terrasses", "Sea, sun, terraces"), emoji: "🌊", match: ["Montpellier", "Nice", "La Rochelle"] },
  { id: "calme", label: L("Charme & douceur", "Charm & easy living"), emoji: "🥐", match: ["Annecy", "Aix-en-Provence", "Strasbourg"] },
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
        <TiltCard max={4} scale={1.005} glare={false}>
          <div className="relative overflow-hidden rounded-3xl border border-white/60 glass-strong p-8 sm:p-12 lg:p-14 shadow-2xl shadow-[var(--accent)]/10">
            {/* Aurora background */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute inset-0 bg-aurora opacity-50" />
              <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[var(--accent)]/15 blur-[100px] animate-drift" />
              <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-[var(--accent-warm)]/15 blur-[80px] animate-drift" style={{ animationDelay: "2s" }} />
            </div>

            {/* Grain */}
            <div className="grain grain-soft rounded-3xl" style={{ opacity: 0.18 }} />

            <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Left: copy */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span className="text-[var(--text-secondary)] font-medium">{L("Quiz IA · 3 minutes", "AI quiz · 3 minutes")}</span>
                </div>
                <h2 className="mb-4 text-3xl lg:text-5xl font-bold text-[var(--text-primary)] leading-[1.05] tracking-tight">
                  {locale === "en" ? (
                    <>
                      Your perfect city{" "}
                      <span className="font-display gradient-text-anim italic">exists.</span>
                      <br />
                      Let&apos;s find it.
                    </>
                  ) : (
                    <>
                      Votre ville parfaite{" "}
                      <span className="font-display gradient-text-anim italic">existe.</span>
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
                  <MagneticButton strength={0.3}>
                    <Link href={cityMatchHref}>
                      <Button size="lg" className="gap-2 shadow-2xl shadow-[var(--accent)]/30 shine accent-pulse">
                        <Sparkles className="h-5 w-5" />
                        {L("Trouver ma ville", "Find my city")}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </MagneticButton>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {L("Gratuit · Sans inscription", "Free · No sign-up")}
                  </span>
                </div>

                <div className="mt-3">
                  <Link
                    href={cityMatchHref}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
                  >
                    {L("✨ Nouveau · Essayer City Match (résultat partageable)", "✨ New · Try City Match (shareable result)")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Steps */}
                <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-3">
                  {steps.map(({ icon: Icon, label }, i) => (
                    <div key={label} className="flex items-center gap-2 rounded-xl glass px-3 py-2">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15">
                        <Icon className="h-3.5 w-3.5 text-[var(--accent)]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">{label}</div>
                        <div className="text-[9px] text-[var(--text-tertiary)] font-mono-data">{L("étape", "step")} {i + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: interactive demo */}
              <div className="relative">
                <div className="rounded-2xl glass border border-white/60 p-5 shadow-xl shadow-[var(--accent)]/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono-data font-bold text-[var(--accent)] bg-[var(--accent-soft)] rounded-full px-2 py-0.5">
                      Q.1 / 7
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">{L("démo", "demo")}</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-4">
                    {locale === "en" ? (
                      <>When you picture &ldquo;living well&rdquo;, what does it look like&nbsp;?</>
                    ) : (
                      <>Quand vous pensez « bien vivre », ça ressemble à quoi&nbsp;?</>
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {demoOptions.map((o) => {
                      const active = picked === o.id;
                      return (
                        <button
                          key={o.id}
                          onClick={() => setPicked(active ? null : o.id)}
                          className={
                            "flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-all " +
                            (active
                              ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg shadow-[var(--accent)]/30 scale-[1.02]"
                              : "bg-white/70 border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-white")
                          }
                        >
                          <span className="text-lg">{o.emoji}</span>
                          <span className={"flex-1 font-medium " + (active ? "" : "text-[var(--text-primary)]")}>{o.label}</span>
                          {active && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Match preview */}
                  <div
                    className="mt-4 overflow-hidden transition-all"
                    style={{
                      maxHeight: matched ? 120 : 0,
                      opacity: matched ? 1 : 0,
                    }}
                  >
                    <div className="rounded-xl bg-gradient-to-br from-[var(--accent-soft)] to-white border border-[var(--accent)]/20 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-[var(--accent)] font-bold mb-1.5">
                        {L("✨ Vos villes matchées", "✨ Your matched cities")}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {matched?.map((m) => (
                          <span
                            key={m}
                            className="rounded-full bg-white text-xs font-semibold text-[var(--accent)] px-2.5 py-1 shadow-sm"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 text-[10px] text-[var(--text-tertiary)]">
                        {L("+ 6 autres questions pour affiner votre top 5 →", "+ 6 more questions to refine your top 5 →")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating sparkle */}
                <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-warm)] to-[var(--accent-pink)] shadow-xl animate-drift">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </TiltCard>
      </div>
    </section>
  );
}
