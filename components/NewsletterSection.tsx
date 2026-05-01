"use client";
import { useState } from "react";
import { Mail, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/effects/MagneticButton";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setState("success");
      else setState("error");
    } catch {
      setState("error");
    }
  }

  return (
    <section className="relative py-20 border-t border-[var(--border)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/60 glass-strong p-10 sm:p-14 shadow-2xl shadow-[var(--accent)]/15">
          {/* Aurora */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-aurora opacity-60" />
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-[100px] animate-drift" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[var(--accent-pink)]/15 blur-[100px] animate-drift" style={{ animationDelay: "2.5s" }} />
          </div>
          <div className="grain grain-soft rounded-[2rem]" style={{ opacity: 0.18 }} />

          {/* Floating envelope sparkles */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <Sparkles className="absolute top-8 right-12 h-5 w-5 text-[var(--accent-warm)] animate-drift opacity-60" style={{ animationDelay: "0.5s" }} />
            <Sparkles className="absolute bottom-12 left-10 h-4 w-4 text-[var(--accent)] animate-drift opacity-50" style={{ animationDelay: "1.5s" }} />
            <Sparkles className="absolute top-20 left-20 h-3 w-3 text-[var(--accent-pink)] animate-drift opacity-50" style={{ animationDelay: "2.2s" }} />
          </div>

          <div className="relative text-center">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-emerald-700 shadow-xl shadow-[var(--accent)]/40 animate-drift">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <h2 className="mb-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              La <span className="font-display gradient-text-anim italic">lettre</span> du dimanche
            </h2>
            <p className="mb-8 text-[var(--text-secondary)] max-w-xl mx-auto">
              Nouveau classement chaque semaine · Analyse de la ville du mois ·
              Alertes avis pour vos villes sauvegardées
            </p>

            {state === "success" ? (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-5 py-3 text-emerald-700 shadow-md">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Inscription confirmée — à dimanche !</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  required
                  className="flex-1 rounded-xl border border-white/60 bg-white/80 backdrop-blur px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)]/60 focus:bg-white transition-all shadow-sm"
                />
                <MagneticButton strength={0.25}>
                  <Button type="submit" size="lg" disabled={state === "loading"} className="gap-2 shine shadow-xl shadow-[var(--accent)]/30">
                    {state === "loading" ? (
                      <span className="animate-pulse">Envoi…</span>
                    ) : (
                      <>
                        S&apos;abonner
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </MagneticButton>
              </form>
            )}

            <p className="mt-5 text-[11px] text-[var(--text-tertiary)]">
              Aucun spam · Désabonnement en un clic · Données en France
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
