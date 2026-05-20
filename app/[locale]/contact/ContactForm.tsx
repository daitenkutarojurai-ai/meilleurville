"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Topic ids must match the /api/contact enum exactly — only the labels differ
// from the French form.
const TOPICS = [
  { id: "question", label: "General message", emoji: "👋" },
  { id: "red-flag", label: "Report a red flag", emoji: "🚩" },
  { id: "erreur", label: "Technical bug", emoji: "🐛" },
  { id: "suggestion", label: "Suggestion", emoji: "💡" },
  { id: "ville", label: "Suggest a city", emoji: "🏙️" },
  { id: "presse", label: "Press / partnership", emoji: "🤝" },
  { id: "autre", label: "Other", emoji: "💌" },
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

    if (name.trim().length < 2) return setError("Please enter your name (2 characters minimum).");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("That email address looks invalid.");
    if (body.trim().length < 20) return setError("Your message needs at least 20 characters.");

    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          name: name.trim(),
          email: email.trim(),
          body: body.trim(),
          locale: "en",
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Network error");
      setState("ok");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Network error");
    }
  }

  if (state === "ok") {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-emerald-700">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Got it, thanks!</h3>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto">
          Your message reached us. We reply within ~48 hours on working days. Check your spam folder if the answer is slow to arrive.
        </p>
        <button
          onClick={() => {
            setState("idle");
            setBody("");
          }}
          className="mt-6 text-sm text-[var(--accent)] font-semibold hover:underline"
        >
          Send another message →
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8"
    >
      <div className="space-y-5">
        {/* Topic chips */}
        <fieldset>
          <legend className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Topic
          </legend>
          <div
            role="radiogroup"
            aria-label="Message topic"
            className="flex flex-wrap gap-2"
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
              e.preventDefault();
              const idx = TOPICS.findIndex((t) => t.id === topic);
              const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
              const next = forward ? (idx + 1) % TOPICS.length : (idx - 1 + TOPICS.length) % TOPICS.length;
              setTopic(TOPICS[next].id);
              document.getElementById(`topic-${TOPICS[next].id}`)?.focus();
            }}
          >
            {TOPICS.map((t) => {
              const active = topic === t.id;
              return (
                <button
                  key={t.id}
                  id={`topic-${t.id}`}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setTopic(t.id)}
                  className={
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] " +
                    (active
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-[var(--bg-canvas)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]")
                  }
                >
                  <span className="mr-1.5" aria-hidden>{t.emoji}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Name + Email */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Your name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]/60 transition-all"
              placeholder="Alex"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Your email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]/60 transition-all"
              placeholder="you@email.com"
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
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3.5 py-3 text-sm outline-none focus:border-[var(--accent)]/60 transition-all resize-y"
            placeholder="Tell us everything — we read every message."
          />
          <div className="mt-1 text-right text-[11px] text-[var(--text-tertiary)] font-mono-data">
            {body.length}/4000
          </div>
        </div>

        {/* Honeypot — hidden from real users */}
        <div aria-hidden className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
          <label>
            Website
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
          <div role="alert" aria-live="assertive" className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-[11px] text-[var(--text-tertiary)] flex-1">
            We reply within ~48 hours on working days.
          </p>
          <Button type="submit" size="lg" disabled={state === "loading"} className="gap-2">
            {state === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
