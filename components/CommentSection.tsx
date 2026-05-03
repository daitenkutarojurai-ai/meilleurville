"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Star, User, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Comment {
  id: string;
  topic: string;
  author: string;
  body: string;
  rating?: number;
  createdAt: string;
}

interface CommentSectionProps {
  topic: string;
  title?: string;
  showRating?: boolean;
  emptyHint?: string;
  className?: string;
  /** When set, shows a newsletter subscribe prompt after successful submission. */
  subscribeContext?: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  const w = Math.floor(d / 7);
  if (w < 5) return `il y a ${w} sem`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function avatarColor(name: string): string {
  const palette = ["#22C55E", "#84CC16", "#F59E0B", "#EC4899", "#0EA5E9", "#A855F7"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
}

const STORAGE_KEY = "meilleurville:commenter";

const EMAIL_KEY = "meilleurville:email";

export function CommentSection({
  topic,
  title = "Discussions",
  showRating = false,
  emptyHint,
  className = "",
  subscribeContext,
}: CommentSectionProps) {
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "ok" | "err">("idle");
  const formRef = useRef<HTMLFormElement | null>(null);
  const formStartedAt = useRef<number>(Date.now());

  // Pre-fill author + email from localStorage
  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v) setAuthor(v);
      const e = localStorage.getItem(EMAIL_KEY);
      if (e) setEmail(e);
    } catch {}
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/comments?topic=${encodeURIComponent(topic)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setItems(Array.isArray(d.items) ? d.items : []);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger les commentaires.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [topic]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    if (author.trim().length < 3) return setError("Votre prénom (3 caractères minimum).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Email valide requis (ne sera pas affiché).");
    if (body.trim().length < 8) return setError("Au moins 8 caractères pour le message.");

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        topic,
        author: author.trim(),
        email: email.trim(),
        body: body.trim(),
        website,
        formStartedAt: formStartedAt.current,
      };
      if (showRating && rating) payload.rating = rating;
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Erreur lors de l'envoi");
      const newComment: Comment | null = data.comment ?? null;
      if (newComment) setItems((prev) => [newComment, ...prev]);
      setBody("");
      setRating(null);
      setSuccess("Merci ! Votre commentaire est en ligne.");
      try {
        localStorage.setItem(STORAGE_KEY, author.trim());
        localStorage.setItem(EMAIL_KEY, email.trim());
      } catch {}
      if (subscribeContext) setShowSubscribe(true);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubscribe() {
    if (!email.trim()) return;
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSubscribeStatus(res.ok ? "ok" : "err");
    } catch {
      setSubscribeStatus("err");
    }
  }

  return (
    <section className={`relative ${className}`}>
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">
            💬 Communauté
          </p>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <MessageCircle className="h-4 w-4" />
          {items.length} {items.length === 1 ? "message" : "messages"}
        </div>
      </div>

      {/* Form */}
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="rounded-2xl glass border border-white/60 p-5 shadow-md mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Votre prénom"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={40}
            minLength={3}
            required
            className="rounded-xl border border-[var(--border)] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white transition-all sm:w-44"
          />
          <input
            type="email"
            placeholder="Email (non public)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={120}
            required
            className="rounded-xl border border-[var(--border)] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white transition-all sm:flex-1 sm:min-w-[200px]"
          />
          {showRating && (
            <div className="flex items-center gap-1 px-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? null : n)}
                  className="p-1 transition-transform hover:scale-110"
                  aria-label={`Note ${n}`}
                >
                  <Star
                    className={
                      "h-5 w-5 " +
                      ((rating ?? 0) >= n ? "fill-amber-400 text-amber-500" : "text-[var(--text-tertiary)]")
                    }
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <textarea
          placeholder={emptyHint ?? "Partagez votre expérience, votre avis, votre coup de cœur…"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
          className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white transition-all resize-y"
        />

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

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
            {body.length}/2000 · pas de liens · respect
          </div>
          <Button type="submit" size="sm" disabled={submitting} className="gap-2">
            {submitting ? (
              <span className="animate-pulse">Envoi…</span>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Publier
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        {showSubscribe && subscribeContext && subscribeStatus !== "ok" && (
          <div className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent-soft)] to-white p-4">
            <p className="text-sm font-semibold text-[var(--accent)] mb-1">
              📬 Suivre {subscribeContext} ?
            </p>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Recevez les nouveaux classements et avis sur {subscribeContext} (1 mail/mois max, désinscription en 1 clic).
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                className="flex-1 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs outline-none focus:border-[var(--accent)]/60"
              />
              <button
                type="button"
                onClick={onSubscribe}
                className="rounded-lg bg-[var(--accent)] text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-700 transition-colors"
              >
                S&apos;abonner
              </button>
              <button
                type="button"
                onClick={() => setShowSubscribe(false)}
                className="text-xs text-[var(--text-tertiary)] px-2"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            {subscribeStatus === "err" && (
              <p className="mt-2 text-xs text-rose-600">Erreur — réessayez plus tard.</p>
            )}
          </div>
        )}
        {subscribeStatus === "ok" && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Merci ! On vous tient au courant.
          </div>
        )}
      </form>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm text-[var(--text-tertiary)] text-center">
            Chargement…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/50 p-8 text-center">
            <div className="text-4xl mb-2">🙊</div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Personne n&apos;a encore réagi.
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Lancez la discussion — soyez le premier !
            </p>
          </div>
        ) : (
          items.map((c) => (
            <article
              key={c.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow"
            >
              <header className="flex items-center gap-3 mb-2">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white font-bold shadow-sm"
                  style={{ background: avatarColor(c.author) }}
                  aria-hidden
                >
                  {c.author.trim().charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {c.author}
                    </span>
                    {c.rating && (
                      <span className="inline-flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              "h-3 w-3 " +
                              (i < (c.rating ?? 0) ? "fill-amber-400 text-amber-500" : "text-[var(--text-tertiary)]")
                            }
                          />
                        ))}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)] font-mono-data">
                    {timeAgo(c.createdAt)}
                  </div>
                </div>
              </header>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {c.body}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
