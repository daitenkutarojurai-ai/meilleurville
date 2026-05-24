"use client";

import { useState, useTransition } from "react";
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ClientSignIn() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Adresse e-mail invalide.");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : "/auth/callback";
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: redirectTo },
      });
      if (authError) {
        setError("Impossible d'envoyer le lien. Réessayez dans quelques secondes.");
      } else {
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <CheckCircle2 className="h-12 w-12 text-[var(--accent)]" strokeWidth={1.5} />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Lien de connexion envoyé</h2>
        <p className="text-[var(--text-secondary)] text-sm max-w-xs">
          Vérifiez votre boite mail. Le lien expire dans 1 heure.
        </p>
        <button
          type="button"
          onClick={() => { setSent(false); setEmail(""); }}
          className="text-xs text-[var(--text-tertiary)] underline underline-offset-2 hover:text-[var(--accent)] transition-colors mt-2"
        >
          Utiliser une autre adresse
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[var(--text-secondary)]">
          Adresse e-mail
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="w-full rounded-xl border border-[var(--border)] bg-white/70 pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)] transition-all"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--accent)]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        {isPending ? "Envoi en cours…" : "Continuer avec mon email"}
      </button>

      <p className="text-center text-xs text-[var(--text-tertiary)]">
        Pas de mot de passe. Un lien magique vous sera envoyé.
      </p>
    </form>
  );
}
