"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2, CheckCircle2 } from "lucide-react";

const IS_EN = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") === "en";

export function FeedbackWidget({ locale }: { locale?: "fr" | "en" }) {
  const isEn = locale ? locale === "en" : IS_EN;
  const t = (fr: string, en: string) => (isEn ? en : fr);

  const [sentiment, setSentiment] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  // Honeypot — bots fill hidden fields; humans never see it.
  const [website, setWebsite] = useState("");

  async function submit(choice: "up" | "down", withComment: boolean) {
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          path: typeof window !== "undefined" ? window.location.pathname : "",
          sentiment: choice,
          comment: withComment && comment.trim() ? comment.trim().slice(0, 280) : undefined,
          locale: isEn ? "en" : "fr",
          website,
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-white p-5 text-sm text-[var(--text-secondary)] shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
        <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" aria-hidden />
        {t("Merci pour votre retour !", "Thanks for your feedback!")}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        {t("Cette page vous a-t-elle aidé ?", "Was this page helpful?")}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => { setSentiment("up"); if (sentiment === null) void submit("up", false); }}
          aria-pressed={sentiment === "up"}
          className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
            sentiment === "up"
              ? "grad-head-0 shadow-[0_10px_22px_-12px_rgba(79,70,229,0.8)]"
              : "bg-[var(--band-indigo)] text-[#3730A3] hover:bg-[var(--band-lilac)] hover:text-[var(--accent)]"
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          {t("Utile", "Helpful")}
        </button>
        <button
          type="button"
          onClick={() => { setSentiment("down"); if (sentiment === null) void submit("down", false); }}
          aria-pressed={sentiment === "down"}
          className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
            sentiment === "down"
              ? "grad-head-1 shadow-[0_10px_22px_-12px_rgba(219,39,119,0.8)]"
              : "bg-[var(--band-pink)] text-[#9D174D] hover:text-[#BE185D]"
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
          {t("À améliorer", "Needs work")}
        </button>
      </div>
      </div>

      {sentiment && (
        <div className="mt-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={280}
            rows={2}
            placeholder={t("Un commentaire ? (optionnel)", "Anything to add? (optional)")}
            className="w-full rounded-xl border border-[var(--band-indigo)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/20"
          />
          {/* Honeypot */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => void submit(sentiment, true)}
              disabled={status === "sending"}
              className="grad-head-0 inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-[0_10px_22px_-12px_rgba(79,70,229,0.8)] transition-all hover:brightness-110 disabled:opacity-60"
            >
              {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("Envoyer", "Send")}
            </button>
            {status === "error" && (
              <span className="text-xs text-[var(--danger)]">{t("Erreur, réessayez.", "Something went wrong.")}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
