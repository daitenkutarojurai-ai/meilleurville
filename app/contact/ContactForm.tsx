"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/effects/MagneticButton";

const TOPICS = [
  { id: "question", label: "Question générale", emoji: "👋" },
  { id: "erreur", label: "Signaler une erreur", emoji: "🐛" },
  { id: "ville", label: "Proposer une ville", emoji: "🏙️" },
  { id: "presse", label: "Presse / partenariat", emoji: "📰" },
  { id: "suggestion", label: "Suggestion produit", emoji: "💡" },
  { id: "autre", label: "Autre", emoji: "💌" },
] as const;

type Topic = (typeof TOPICS)[number]["id"];

export function ContactForm() {
  const [topic, setTopic] = useState<Topic>("question");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setError(null);

    // Quick client validation
    if (name.trim().length < 2) return setError("Votre prénom (2 caractères mini).");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Email invalide.");
    if (body.trim().length < 20) return setError("Au moins 20 caractères.");

    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, name: name.trim(), email: email.trim(), body: body.trim(), website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Erreur réseau");
      setState("ok");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Erreur réseau");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-3xl glass-strong border border-white/60 p-10 text-center shadow-2xl shadow-[var(--accent)]/10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-emerald-700 shadow-lg">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Reçu, merci !</h3>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
          Nous avons bien reçu votre message. Réponse sous 48 h ouvrables — vérifiez vos spams si la réponse tarde.
        </p>
        <button
          onClick={() => {
            setState("idle");
            setBody("");
          }}
          className="mt-6 text-sm text-[var(--accent)] font-semibold hover:underline"
        >
          Envoyer un autre message →
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative overflow-hidden rounded-3xl glass-strong border border-white/60 p-6 sm:p-8 shadow-2xl shadow-[var(--accent)]/10"
    >
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--accent)]/15 blur-[100px] pointer-events-none" aria-hidden />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[var(--accent-warm)]/15 blur-[100px] pointer-events-none" aria-hidden />

      <div className="relative space-y-5">
        {/* Topic chips */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Sujet
          </label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const active = topic === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.id)}
                  className={
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border " +
                    (active
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-md shadow-[var(--accent)]/30"
                      : "bg-white/70 backdrop-blur text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]")
                  }
                >
                  <span className="mr-1.5">{t.emoji}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Name + Email */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Votre prénom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
              className="w-full rounded-xl border border-[var(--border)] bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white transition-all"
              placeholder="Camille"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Votre email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[var(--border)] bg-white/80 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white transition-all"
              placeholder="vous@email.fr"
            />
          </div>
        </div>

        {/* Body */}
        <div>
          <label htmlFor="body" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
            Message
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={4000}
            rows={6}
            required
            className="w-full rounded-xl border border-[var(--border)] bg-white/80 px-3.5 py-3 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white transition-all resize-y"
            placeholder="Dites-nous tout — on lit chaque message."
          />
          <div className="mt-1 text-right text-[11px] text-[var(--text-tertiary)] font-mono-data">
            {body.length}/4000
          </div>
        </div>

        {/* Honeypot — hidden from real users */}
        <div aria-hidden className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
          <label>
            Site web
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-[11px] text-[var(--text-tertiary)] flex-1">
            Réponse sous 48 h ouvrables · Vos données restent en France
          </p>
          <MagneticButton strength={0.25}>
            <Button type="submit" size="lg" disabled={state === "loading"} className="gap-2 shine shadow-xl shadow-[var(--accent)]/30">
              {state === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </MagneticButton>
        </div>
      </div>
    </form>
  );
}
