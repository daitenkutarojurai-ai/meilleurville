"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { requestLoginLink } from "@/lib/auth-client";

export function ConnexionForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);
    const res = await requestLoginLink(email.trim());
    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
      setError(res.error ?? "Erreur, réessayez.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl glass-strong border border-white/60 p-8 text-center shadow-md">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--accent)] mb-4" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Vérifiez vos emails
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Si un compte existe (ou vient d&apos;être créé) pour{" "}
          <strong className="text-[var(--text-primary)]">{email}</strong>, un lien de
          connexion vient d&apos;y être envoyé. Il expire dans 30 minutes.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setEmail("");
          }}
          className="mt-6 text-sm text-[var(--accent)] hover:underline"
        >
          Utiliser une autre adresse
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl glass-strong border border-white/60 p-6 sm:p-8 shadow-md">
      <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
        Adresse email
      </label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.fr"
          className="w-full rounded-xl border border-[var(--border)] bg-white/80 pl-10 pr-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi…
          </>
        ) : (
          "Recevoir mon lien de connexion"
        )}
      </button>

      <p className="mt-4 text-xs text-[var(--text-tertiary)] text-center">
        En vous connectant, vous acceptez nos{" "}
        <a href="/cgu" className="underline hover:text-[var(--accent)]">CGU</a> et notre{" "}
        <a href="/confidentialite" className="underline hover:text-[var(--accent)]">politique de confidentialité</a>.
      </p>
    </form>
  );
}
