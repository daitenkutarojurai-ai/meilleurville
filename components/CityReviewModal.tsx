"use client";

import { useEffect, useState } from "react";
import { Star, X, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { REVIEW_CATEGORIES, type ReviewCategoryId } from "@/lib/review-categories";
import { Button } from "@/components/ui/Button";

interface CityReviewModalProps {
  citySlug: string;
  cityName: string;
  open: boolean;
  onClose: () => void;
  onPosted?: () => void;
}

const STORAGE_KEY = "meilleurville:commenter";
const EMAIL_KEY = "meilleurville:email";

export function CityReviewModal({ citySlug, cityName, open, onClose, onPosted }: CityReviewModalProps) {
  const [author, setAuthor] = useState(() => {
    if (typeof window === "undefined") return "";
    try { return localStorage.getItem(STORAGE_KEY) ?? ""; } catch { return ""; }
  });
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    try { return localStorage.getItem(EMAIL_KEY) ?? ""; } catch { return ""; }
  });
  const [body, setBody] = useState("");
  const [ratings, setRatings] = useState<Record<ReviewCategoryId, number>>(() => {
    const init: Record<string, number> = {};
    for (const c of REVIEW_CATEGORIES) init[c.id] = 0;
    return init as Record<ReviewCategoryId, number>;
  });
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formStartedAt] = useState<number>(() => Date.now());

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const overall = (() => {
    const vals = Object.values(ratings).filter((v) => v > 0);
    if (vals.length === 0) return null;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  })();

  function setCat(id: ReviewCategoryId, v: number) {
    setRatings((prev) => ({ ...prev, [id]: prev[id] === v ? 0 : v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (author.trim().length < 3) return setError("Votre prénom (3 caractères minimum).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Email valide requis (non public).");
    if (body.trim().length < 8) return setError("Au moins 8 caractères pour le message.");
    const filledCats = Object.values(ratings).filter((v) => v > 0).length;
    if (filledCats < 3) return setError("Notez au moins 3 catégories.");

    setSubmitting(true);
    try {
      const categoryRatings: Record<string, number> = {};
      for (const [k, v] of Object.entries(ratings)) {
        if (v > 0) categoryRatings[k] = v;
      }
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `city:${citySlug}`,
          author: author.trim(),
          email: email.trim(),
          body: body.trim(),
          rating: overall ? Math.round(overall) : undefined,
          categoryRatings,
          website,
          formStartedAt,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Erreur lors de l'envoi");
      try {
        localStorage.setItem(STORAGE_KEY, author.trim());
        localStorage.setItem(EMAIL_KEY, email.trim());
      } catch {}
      setSuccess(true);
      onPosted?.();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-3 right-3 rounded-full p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">
              ✨ Votre avis sur {cityName}
            </p>
            <h2 id="review-modal-title" className="text-2xl font-bold text-[var(--text-primary)]">
              Noter {cityName} en 8 catégories
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Vos notes alimentent la note communautaire affichée sur la fiche ville.
              Notez au moins 3 catégories.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Identity */}
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={40}
                minLength={3}
                required
                placeholder="Votre prénom"
                aria-label="Votre prénom"
                className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]/60"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
                required
                placeholder="Email (non public)"
                aria-label="Email"
                className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]/60"
              />
            </div>

            {/* Category stars */}
            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                Notez chaque catégorie (1 à 5)
              </legend>
              {REVIEW_CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2"
                >
                  <span className="text-sm text-[var(--text-primary)] flex items-center gap-2">
                    <span aria-hidden>{cat.emoji}</span>
                    {cat.label}
                  </span>
                  <span className="flex items-center gap-0.5" role="radiogroup" aria-label={cat.label}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCat(cat.id, n)}
                        aria-label={`${cat.label} : ${n} étoile${n > 1 ? "s" : ""}`}
                        aria-pressed={ratings[cat.id] === n}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            ratings[cat.id] >= n ? "fill-amber-400 text-amber-500" : "text-[var(--text-tertiary)]"
                          }`}
                        />
                      </button>
                    ))}
                  </span>
                </div>
              ))}
              {overall != null && (
                <div className="text-xs text-[var(--text-tertiary)] text-right pt-1">
                  Moyenne actuelle : <strong className="text-[var(--text-primary)]">{overall.toFixed(1)}/5</strong>
                </div>
              )}
            </fieldset>

            {/* Body */}
            <div>
              <label htmlFor="review-body" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Votre ressenti
              </label>
              <textarea
                id="review-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={2000}
                rows={4}
                required
                placeholder={`Qu'avez-vous aimé ou regretté à ${cityName} ? Soyez concret.`}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)]/60 resize-y"
              />
              <div className="mt-1 text-right text-[11px] text-[var(--text-tertiary)]">{body.length}/2000 · pas de liens</div>
            </div>

            {/* Honeypot */}
            <div aria-hidden className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
              <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div role="status" className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm text-emerald-700">
                <CheckCircle className="h-4 w-4" />
                <span>Avis publié, merci !</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
              >
                Annuler
              </button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Envoi…" : "Publier mon avis"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
