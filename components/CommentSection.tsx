"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Star, User, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContributorBadge } from "@/components/effects/ContributorBadge";

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
  locale?: "fr" | "en";
}

function timeAgo(iso: string, locale: "fr" | "en" = "fr"): string {
  const en = locale === "en";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return en ? "just now" : "à l'instant";
  if (m < 60) return en ? `${m} min ago` : `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return en ? `${h} h ago` : `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return en ? `${d}d ago` : `il y a ${d} j`;
  const w = Math.floor(d / 7);
  if (w < 5) return en ? `${w}w ago` : `il y a ${w} sem`;
  return new Date(iso).toLocaleDateString(en ? "en-GB" : "fr-FR", { day: "numeric", month: "short", year: "numeric" });
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
  locale = "fr",
}: CommentSectionProps) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState(() => {
    if (typeof window === "undefined") return "";
    try { return localStorage.getItem(STORAGE_KEY) ?? ""; } catch { return ""; }
  });
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    try { return localStorage.getItem(EMAIL_KEY) ?? ""; } catch { return ""; }
  });
  const [body, setBody] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showBadge, setShowBadge] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "ok" | "err">("idle");
  const formRef = useRef<HTMLFormElement | null>(null);
  // Lazy-init via useState so we never call Date.now() during render
  // (react-hooks rule: pure-render). Survives re-renders identically.
  const [formStartedAt] = useState<number>(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?topic=${encodeURIComponent(topic)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setItems(Array.isArray(d.items) ? d.items : []);
      })
      .catch(() => {
        if (!cancelled) setError(locale === "en" ? "Couldn't load the comments." : "Impossible de charger les commentaires.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [topic, locale]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    if (author.trim().length < 3) return setError(L("Votre prénom (3 caractères minimum).", "Your first name (3 characters minimum)."));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError(L("Email valide requis (ne sera pas affiché).", "A valid email is required (it won't be shown)."));
    if (body.trim().length < 8) return setError(L("Au moins 8 caractères pour le message.", "At least 8 characters for the message."));

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        topic,
        author: author.trim(),
        email: email.trim(),
        body: body.trim(),
        website,
        formStartedAt,
      };
      if (showRating && rating) payload.rating = rating;
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? L("Erreur lors de l'envoi", "Something went wrong while sending"));
      const newComment: Comment | null = data.comment ?? null;
      if (newComment) setItems((prev) => [newComment, ...prev]);
      setBody("");
      setRating(null);
      setSuccess(L("Votre commentaire est en ligne.", "Your comment is live."));
      setShowBadge(true);
      try {
        localStorage.setItem(STORAGE_KEY, author.trim());
        localStorage.setItem(EMAIL_KEY, email.trim());
      } catch {}
      if (subscribeContext) setShowSubscribe(true);
      setTimeout(() => {
        setSuccess(null);
        setShowBadge(false);
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : L("Erreur réseau", "Network error"));
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
        body: JSON.stringify(locale === "en" ? { email: email.trim(), locale } : { email: email.trim() }),
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
            {L("💬 Communauté", "💬 Community")}
          </p>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <MessageCircle className="h-4 w-4" />
          {items.length} {items.length === 1 ? L("message", "comment") : L("messages", "comments")}
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
            placeholder={L("Votre prénom", "Your first name")}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={40}
            minLength={3}
            required
            className="rounded-xl border border-[var(--border)] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 transition-all sm:w-44"
          />
          <input
            type="email"
            placeholder={L("Email (non public)", "Email (not public)")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={120}
            required
            className="rounded-xl border border-[var(--border)] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 transition-all sm:flex-1 sm:min-w-[200px]"
          />
          {showRating && (
            <div className="flex items-center gap-1 px-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(rating === n ? null : n)}
                  className="p-1 transition-transform hover:scale-110"
                  aria-label={L(`Note ${n}`, `Rating ${n}`)}
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
          placeholder={emptyHint ?? L("Partagez votre expérience, votre avis, votre coup de cœur…", "Share your experience, your take, your favourite spot…")}
          aria-label={L("Votre avis", "Your comment")}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
          className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 transition-all resize-y"
        />

        {/* Honeypot — hidden from real users */}
        <div aria-hidden className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
          <label>
            {L("Site web", "Website")}
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
            {body.length}/2000 · {L("pas de liens · respect", "no links · be respectful")}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={submitting}
            aria-busy={submitting}
            className={submitting ? "gap-2 opacity-60 cursor-wait" : "gap-2"}
          >
            {submitting ? (
              <>
                <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" aria-hidden />
                {L("Envoi…", "Sending…")}
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                {L("Publier", "Post")}
              </>
            )}
          </Button>
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <ContributorBadge visible={showBadge} />
        {success && !showBadge && (
          <div role="status" aria-live="polite" className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}

        {showSubscribe && subscribeContext && subscribeStatus !== "ok" && (
          <div className="mt-4 rounded-xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent-soft)] to-white p-4">
            <p className="text-sm font-semibold text-[var(--accent)] mb-1">
              {L(`📬 Suivre ${subscribeContext} ?`, `📬 Follow ${subscribeContext}?`)}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              {L(
                `Recevez les nouveaux classements et avis sur ${subscribeContext} (1 mail/mois max, désinscription en 1 clic).`,
                `Get the latest rankings and reviews for ${subscribeContext} (1 email/month max, unsubscribe in one click).`,
              )}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={L("votre@email.fr", "you@email.com")}
                className="flex-1 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs outline-none focus:border-[var(--accent)]/60"
              />
              <button
                type="button"
                onClick={onSubscribe}
                className="rounded-lg bg-[var(--accent)] text-white text-xs font-semibold px-3 py-1.5 hover:bg-[var(--accent-hover)] transition-colors"
              >
                {L("S'abonner", "Subscribe")}
              </button>
              <button
                type="button"
                onClick={() => setShowSubscribe(false)}
                className="text-xs text-[var(--text-tertiary)] px-2"
                aria-label={L("Fermer", "Close")}
              >
                ✕
              </button>
            </div>
            {subscribeStatus === "err" && (
              <p className="mt-2 text-xs text-rose-600">{L("Erreur — réessayez plus tard.", "Something went wrong — try again later.")}</p>
            )}
          </div>
        )}
        {subscribeStatus === "ok" && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {L("Merci ! On vous tient au courant.", "Thanks! We'll keep you posted.")}
          </div>
        )}
      </form>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-sm text-[var(--text-tertiary)] text-center">
            {L("Chargement…", "Loading…")}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/50 p-8 text-center">
            <div className="text-4xl mb-2">🙊</div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {L("Personne n'a encore réagi.", "No one has weighed in yet.")}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {L("Lancez la discussion — soyez le premier !", "Start the conversation — be the first.")}
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
                    {timeAgo(c.createdAt, locale)}
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
