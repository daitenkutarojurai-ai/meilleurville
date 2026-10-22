"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MessageCircle, Send, Star, User, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContributorBadge } from "@/components/effects/ContributorBadge";
import {
  submitContribution,
  subscribeAuth,
  getAuthSnapshot,
  getServerAuthSnapshot,
} from "@/lib/auth-client";

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
  const loggedIn = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
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
    // Logged-in users skip the name/email fields — identity comes from the session.
    if (!loggedIn) {
      if (author.trim().length < 3) return setError(L("Votre prénom (3 caractères minimum).", "Your first name (3 characters minimum)."));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError(L("Email valide requis (ne sera pas affiché).", "A valid email is required (it won't be shown)."));
    }
    if (body.trim().length < 8) return setError(L("Au moins 8 caractères pour le message.", "At least 8 characters for the message."));

    setSubmitting(true);
    try {
      const result = await submitContribution({
        topic,
        body: body.trim(),
        rating: showRating && rating ? rating : undefined,
        type: "comment",
        author: author.trim(),
        email: email.trim(),
        website,
        formStartedAt,
      });
      if (!result.ok) throw new Error(result.error ?? L("Erreur lors de l'envoi", "Something went wrong while sending"));
      const newComment = (result.comment as Comment | undefined) ?? null;
      if (newComment) setItems((prev) => [newComment, ...prev]);
      setBody("");
      setRating(null);
      setSuccess(L("Votre commentaire est en ligne.", "Your comment is live."));
      setShowBadge(true);
      if (!loggedIn) {
        try {
          localStorage.setItem(STORAGE_KEY, author.trim());
          localStorage.setItem(EMAIL_KEY, email.trim());
        } catch {}
      }
      if (subscribeContext && !loggedIn) setShowSubscribe(true);
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

  // Champs de saisie « au crayon » : papier, filet crayon, angles nets.
  const fieldCls =
    "rounded-sm border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 transition-colors";
  const countLabel = `${items.length} ${items.length === 1 ? L("message", "comment") : L("messages", "comments")}`;

  return (
    <section className={`relative ${className}`}>
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-[var(--text-primary)]/20 pb-3">
        <div className="min-w-0">
          <p className="mb-1 font-mono-data text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-pink)]">
            {L("Communauté · registre", "Community · register")}
          </p>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 font-mono-data text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          <MessageCircle className="h-4 w-4" aria-hidden />
          {countLabel}
        </div>
      </div>

      {/* Formulaire — cartouche à double filet, comme les fiches de carte. */}
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="relative mb-6 rounded-md border border-[var(--text-primary)]/25 bg-[var(--bg-surface)] p-1"
      >
        <div className="border border-[var(--border)] p-4 sm:p-5">
          <div className="mb-3 font-mono-data text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {L("Nouvelle entrée", "New entry")}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {loggedIn ? (
              <div className="flex items-center gap-2 border-l-2 border-[var(--accent)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-secondary)] sm:flex-1">
                <CheckCircle className="h-4 w-4 text-[var(--accent)]" aria-hidden />
                {L("Publié avec votre compte", "Posting from your account")}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder={L("Votre prénom", "Your first name")}
                  aria-label={L("Votre prénom", "Your first name")}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  maxLength={40}
                  minLength={3}
                  required
                  className={`${fieldCls} sm:w-44`}
                />
                <input
                  type="email"
                  placeholder={L("Email (non public)", "Email (not public)")}
                  aria-label={L("Email (non public)", "Email (not public)")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={120}
                  required
                  className={`${fieldCls} sm:flex-1 sm:min-w-[200px]`}
                />
              </>
            )}
            {showRating && (
              <div className="flex items-center gap-1 px-2" role="group" aria-label={L("Votre note", "Your rating")}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(rating === n ? null : n)}
                    className="p-1 transition-transform hover:scale-110"
                    aria-label={L(`Note ${n}`, `Rating ${n}`)}
                    aria-pressed={(rating ?? 0) >= n}
                  >
                    <Star
                      className={
                        "h-5 w-5 " +
                        ((rating ?? 0) >= n
                          ? "fill-[var(--accent-pink)] text-[var(--accent-pink)]"
                          : "text-[var(--text-tertiary)]")
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
            className={`${fieldCls} mt-3 w-full resize-y leading-relaxed`}
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

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-[var(--border)] pt-3">
            <div className="font-mono-data text-[11px] text-[var(--text-tertiary)]">
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
                  <Send className="h-3.5 w-3.5" aria-hidden />
                  {L("Publier", "Post")}
                </>
              )}
            </Button>
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="mt-3 flex items-start gap-2 border-l-2 border-[var(--accent-pink)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)]">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--accent-pink)]" aria-hidden />
              <span>{error}</span>
            </div>
          )}
          <ContributorBadge visible={showBadge} locale={locale} />
          {success && !showBadge && (
            <div role="status" aria-live="polite" className="mt-3 flex items-center gap-2 border-l-2 border-[var(--accent)] bg-[var(--bg-canvas)] px-3 py-2 text-xs text-[var(--text-primary)]">
              <CheckCircle className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              <span>{success}</span>
            </div>
          )}

          {showSubscribe && subscribeContext && subscribeStatus !== "ok" && (
            <div className="mt-4 border border-dashed border-[var(--accent)]/40 bg-[var(--bg-canvas)] p-4">
              <p className="mb-1 font-mono-data text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-pink)]">
                {L("Lettre mensuelle", "Monthly letter")}
              </p>
              <p className="text-sm font-semibold text-[var(--accent)] mb-1">
                {L(`Suivre ${subscribeContext} ?`, `Follow ${subscribeContext}?`)}
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
                  aria-label={L("Votre email", "Your email")}
                  className={`${fieldCls} min-w-0 flex-1 py-1.5 text-xs`}
                />
                <button
                  type="button"
                  onClick={onSubscribe}
                  className="rounded-sm bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
                >
                  {L("S'abonner", "Subscribe")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubscribe(false)}
                  className="px-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  aria-label={L("Fermer", "Close")}
                >
                  ✕
                </button>
              </div>
              {subscribeStatus === "err" && (
                <p className="mt-2 text-xs text-[var(--accent-pink)]">{L("Erreur — réessayez plus tard.", "Something went wrong — try again later.")}</p>
              )}
            </div>
          )}
          {subscribeStatus === "ok" && (
            <div className="mt-4 flex items-center gap-2 border-l-2 border-[var(--accent)] bg-[var(--bg-canvas)] p-3 text-xs text-[var(--text-primary)]">
              <CheckCircle className="h-4 w-4 text-[var(--accent)]" aria-hidden />
              {L("Merci ! On vous tient au courant.", "Thanks! We'll keep you posted.")}
            </div>
          )}
        </div>
      </form>

      {/* Liste — registre à filets : chaque entrée numérotée, initiale en repère navy. */}
      {loading ? (
        <div className="border-y border-[var(--border)] py-5 text-center font-mono-data text-xs uppercase tracking-widest text-[var(--text-tertiary)]">
          {L("Chargement…", "Loading…")}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--bg-canvas)] px-6 py-8 text-center">
          <p className="mb-2 font-mono-data text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {L("Registre vierge", "Empty register")}
          </p>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {L("Personne n'a encore réagi.", "No one has weighed in yet.")}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {L("Lancez la discussion — soyez le premier !", "Start the conversation — be the first.")}
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-[var(--border)] border-y border-[var(--text-primary)]/20">
          {items.map((c, i) => (
            <li key={c.id}>
              <article className="flex gap-3 py-4">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-sm border-2 border-[var(--accent)] bg-[var(--bg-surface)] font-bold text-[var(--accent)]"
                  aria-hidden
                >
                  {c.author.trim().charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <header className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="truncate text-sm font-bold text-[var(--text-primary)]">
                      {c.author}
                    </span>
                    {c.rating && (
                      <span
                        className="inline-flex items-center gap-0.5 self-center"
                        role="img"
                        aria-label={L(`${c.rating} sur 5`, `${c.rating} out of 5`)}
                      >
                        {Array.from({ length: 5 }).map((_, k) => (
                          <Star
                            key={k}
                            aria-hidden
                            className={
                              "h-3 w-3 " +
                              (k < (c.rating ?? 0)
                                ? "fill-[var(--accent-pink)] text-[var(--accent-pink)]"
                                : "text-[var(--text-tertiary)]")
                            }
                          />
                        ))}
                      </span>
                    )}
                    <span className="ml-auto font-mono-data text-[10px] tracking-wider text-[var(--text-tertiary)]">
                      {L("N°", "No.")} {String(items.length - i).padStart(2, "0")} · {timeAgo(c.createdAt, locale)}
                    </span>
                  </header>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                    {c.body}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
