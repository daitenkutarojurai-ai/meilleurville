"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

interface Props {
  citySlug: string;
  cityName: string;
  locale?: "fr" | "en";
}

type Status = "idle" | "loading" | "success" | "error";

export function AlerteForm({ citySlug, cityName, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [watchScore, setWatchScore] = useState(true);
  const [watchComments, setWatchComments] = useState(true);
  const [threshold, setThreshold] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const errorMsg = L("Une erreur est survenue. Réessayez.", "Something went wrong. Please try again.");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || (!watchScore && !watchComments)) return;
    setStatus("loading");
    setMessage("");
    try {
      const types: string[] = [];
      if (watchScore) types.push("score");
      if (watchComments) types.push("comments");

      const body: Record<string, unknown> = { email: email.trim(), citySlug, types, locale };
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
        setMessage(data.error ?? errorMsg);
      } else {
        setStatus("success");
        setMessage(
          L(
            `Alertes activées pour ${cityName}. Email de confirmation envoyé.`,
            `Alerts activated for ${cityName}. Confirmation email sent.`,
          ),
        );
      }
    } catch {
      setStatus("error");
      setMessage(errorMsg);
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/40 px-4 py-3">
        <Bell className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-emerald-700">{message}</p>
          <p className="text-[11px] text-emerald-600 mt-1">
            <a href={locale === "en" ? "/my-alerts" : "/mes-alertes"} className="underline hover:no-underline">
              {L("Gérer mes alertes", "Manage my alerts")}
            </a>
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
        <span className="font-medium">{L("🔔 Recevoir des alertes", "🔔 Get alerts")}</span>
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
            placeholder={L("votre@email.fr", "your@email.com")}
            aria-label={L("votre@email.fr", "your@email.com")}
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
              {L("Score modifié", "Score change")}
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input
                type="checkbox"
                checked={watchComments}
                onChange={(e) => setWatchComments(e.target.checked)}
                className="rounded accent-[var(--accent)]"
              />
              {L("Nouveaux commentaires", "New comments")}
            </label>
          </div>

          {watchScore && (
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1">{L("Seuil de score (optionnel)", "Score threshold (optional)")}</label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder={L("Alerter seulement si le score atteint ce seuil (ex. 7.0)", "Only alert if the score reaches this value (e.g. 7.0)")}
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
            {L("Activer les alertes", "Activate alerts")}
          </button>
          <p className="text-[11px] text-[var(--text-tertiary)]">{L("Pas de spam. Désabonnement en un clic dans chaque email.", "No spam. One-click unsubscribe in every email.")}</p>
        </form>
      )}
    </div>
  );
}
