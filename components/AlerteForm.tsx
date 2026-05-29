"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

interface Props {
  citySlug: string;
  cityName: string;
  locale?: "fr" | "en";
}

type Status = "idle" | "loading" | "success" | "error";

const COPY = {
  fr: {
    toggle: "🔔 Recevoir des alertes",
    emailPlaceholder: "votre@email.fr",
    labelScore: "Score modifié",
    labelComments: "Nouveaux commentaires",
    threshold: "Seuil de score (optionnel)",
    thresholdHint: "Alerter seulement si le score atteint ce seuil (ex. 7.0)",
    submit: "Activer les alertes",
    successMsg: (city: string) => `Alertes activées pour ${city}. Email de confirmation envoyé.`,
    errorMsg: "Une erreur est survenue. Réessayez.",
    disclaimer: "Pas de spam. Désabonnement en un clic dans chaque email.",
  },
  en: {
    toggle: "🔔 Get alerts",
    emailPlaceholder: "your@email.com",
    labelScore: "Score change",
    labelComments: "New comments",
    threshold: "Score threshold (optional)",
    thresholdHint: "Only alert if the score reaches this value (e.g. 7.0)",
    submit: "Activate alerts",
    successMsg: (city: string) => `Alerts activated for ${city}. Confirmation email sent.`,
    errorMsg: "Something went wrong. Please try again.",
    disclaimer: "No spam. One-click unsubscribe in every email.",
  },
};

export function AlerteForm({ citySlug, cityName, locale = "fr" }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [watchScore, setWatchScore] = useState(true);
  const [watchComments, setWatchComments] = useState(true);
  const [threshold, setThreshold] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const c = COPY[locale];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || (!watchScore && !watchComments)) return;
    setStatus("loading");
    setMessage("");
    try {
      const types: string[] = [];
      if (watchScore) types.push("score");
      if (watchComments) types.push("comments");

      const body: Record<string, unknown> = { email: email.trim(), citySlug, types };
      const parsedThreshold = parseFloat(threshold);
      if (!isNaN(parsedThreshold) && parsedThreshold > 0) {
        body.scoreThreshold = parsedThreshold;
      }

      const res = await fetch("/api/alertes/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? c.errorMsg);
      } else {
        setStatus("success");
        setMessage(c.successMsg(cityName));
      }
    } catch {
      setStatus("error");
      setMessage(c.errorMsg);
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/40 px-4 py-3">
        <Bell className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-emerald-700">{message}</p>
          <p className="text-[11px] text-emerald-600 mt-1">
            <a href="/mes-alertes" className="underline hover:no-underline">Gérer mes alertes</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <span className="font-medium">{c.toggle}</span>
        {open ? (
          <BellOff className="h-4 w-4 text-[var(--text-tertiary)]" />
        ) : (
          <Bell className="h-4 w-4 text-[var(--text-tertiary)]" />
        )}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="border-t border-[var(--border)] px-4 py-4 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={c.emailPlaceholder}
            aria-label={c.emailPlaceholder}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
          />

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={watchScore}
                onChange={(e) => setWatchScore(e.target.checked)}
                className="rounded accent-[var(--accent)]"
              />
              {c.labelScore}
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={watchComments}
                onChange={(e) => setWatchComments(e.target.checked)}
                className="rounded accent-[var(--accent)]"
              />
              {c.labelComments}
            </label>
          </div>

          {watchScore && (
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1">{c.threshold}</label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={c.thresholdHint}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
              />
            </div>
          )}

          {status === "error" && (
            <p className="text-xs text-red-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !email || (!watchScore && !watchComments)}
            className="flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {status === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {c.submit}
          </button>
          <p className="text-[11px] text-[var(--text-tertiary)]">{c.disclaimer}</p>
        </form>
      )}
    </div>
  );
}
