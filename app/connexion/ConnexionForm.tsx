"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { requestLoginLink } from "@/lib/auth-client";

const IS_EN = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") === "en";
const t = (fr: string, en: string) => (IS_EN ? en : fr);

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
      setError(res.error ?? t("Erreur, réessayez.", "Something went wrong, please try again."));
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-3xl glass-strong border border-white/60 p-8 text-center shadow-md">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--accent)] mb-4" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          {t("Vérifiez vos emails", "Check your inbox")}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          {IS_EN ? (
            <>
              If an account exists (or was just created) for{" "}
              <strong className="text-[var(--text-primary)]">{email}</strong>, a sign-in link
              is on its way. It expires in 30 minutes.
            </>
          ) : (
            <>
              Si un compte existe (ou vient d&apos;être créé) pour{" "}
              <strong className="text-[var(--text-primary)]">{email}</strong>, un lien de
              connexion vient d&apos;y être envoyé. Il expire dans 30 minutes.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setEmail("");
          }}
          className="mt-6 text-sm text-[var(--accent)] hover:underline"
        >
          {t("Utiliser une autre adresse", "Use a different address")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl glass-strong border border-white/60 p-6 sm:p-8 shadow-md">
      <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
        {t("Adresse email", "Email address")}
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
          placeholder={t("vous@exemple.fr", "you@example.com")}
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
            {t("Envoi…", "Sending…")}
          </>
        ) : (
          t("Recevoir mon lien de connexion", "Send me a sign-in link")
        )}
      </button>

      <p className="mt-4 text-xs text-[var(--text-tertiary)] text-center">
        {IS_EN ? (
          <>
            By signing in, you agree to our{" "}
            <a href="/legal-notice" className="underline hover:text-[var(--accent)]">Terms</a> and{" "}
            <a href="/privacy-policy" className="underline hover:text-[var(--accent)]">Privacy Policy</a>.
          </>
        ) : (
          <>
            En vous connectant, vous acceptez nos{" "}
            <a href="/cgu" className="underline hover:text-[var(--accent)]">CGU</a> et notre{" "}
            <a href="/confidentialite" className="underline hover:text-[var(--accent)]">politique de confidentialité</a>.
          </>
        )}
      </p>
    </form>
  );
}
