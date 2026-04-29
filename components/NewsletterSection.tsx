"use client";
import { useState } from "react";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    await new Promise((r) => setTimeout(r, 800));
    setState("success");
  }

  return (
    <section className="py-20 border-t border-[var(--border)]">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <Mail className="h-6 w-6 text-[var(--accent)]" />
        </div>
        <h2 className="mb-3 text-2xl font-bold text-[var(--text-primary)]">
          Restez informé
        </h2>
        <p className="mb-8 text-[var(--text-secondary)]">
          Nouveau classement chaque semaine · Analyse de la ville du mois ·
          Alertes avis pour vos villes sauvegardées
        </p>

        {state === "success" ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Inscription confirmée — à bientôt !</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.fr"
              required
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]/50 transition-colors"
            />
            <Button type="submit" disabled={state === "loading"}>
              {state === "loading" ? (
                <span className="animate-pulse">...</span>
              ) : (
                <>
                  S'abonner
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
