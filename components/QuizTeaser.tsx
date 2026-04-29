import Link from "next/link";
import { Sparkles, ArrowRight, Brain, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

const STEPS = [
  { icon: Brain, label: "7 questions", desc: "Style de vie, budget, priorités" },
  { icon: Zap, label: "IA en 3s", desc: "Claude analyse votre profil" },
  { icon: Target, label: "Top 5 villes", desc: "Personnalisé et expliqué" },
];

export function QuizTeaser() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/10 via-[var(--bg-surface)] to-[var(--bg-elevated)] p-10 lg:p-14">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-[80px]" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[var(--accent-warm)]/8 blur-[60px]" />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: copy */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-sm text-[var(--accent)]">
                <Sparkles className="h-3.5 w-3.5" />
                Quiz de Matching IA
              </div>
              <h2 className="mb-4 text-3xl lg:text-4xl font-bold text-[var(--text-primary)] leading-tight">
                Votre ville idéale existe.{" "}
                <span className="gradient-text">On va la trouver.</span>
              </h2>
              <p className="mb-8 text-[var(--text-secondary)] leading-relaxed text-lg">
                7 questions. Notre IA analyse votre profil contre les données de 850
                villes françaises et vous explique pourquoi chaque résultat vous correspond.
              </p>
              <Link href="/quiz">
                <Button size="lg" className="gap-2 shadow-xl shadow-[var(--accent)]/20">
                  <Sparkles className="h-5 w-5" />
                  Commencer le quiz (gratuit)
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Right: steps */}
            <div className="space-y-4">
              {STEPS.map(({ icon: Icon, label, desc }, i) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]/60 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/15 border border-[var(--accent)]/20">
                    <Icon className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--text-primary)] text-sm">
                      {label}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">{desc}</div>
                  </div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-xs font-bold font-mono-data text-[var(--text-secondary)]">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
