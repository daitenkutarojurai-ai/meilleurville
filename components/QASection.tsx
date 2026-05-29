"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle, Send, User, AlertCircle, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ContributorBadge } from "@/components/effects/ContributorBadge";

interface QAItem {
  id: string;
  topic: string;
  author: string;
  body: string;
  type?: "comment" | "question";
  createdAt: string;
}

interface QASectionProps {
  citySlug: string;
  cityName: string;
}

const STORAGE_KEY = "meilleurville:commenter";
const EMAIL_KEY = "meilleurville:email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

function AnswerForm({
  questionId,
  citySlug,
  onPosted,
}: {
  questionId: string;
  citySlug: string;
  onPosted: (answer: QAItem) => void;
}) {
  const topic = `city:${citySlug}:q:${questionId}`;
  const [author, setAuthor] = useState(() => {
    if (typeof window === "undefined") return "";
    try { return localStorage.getItem(STORAGE_KEY) ?? ""; } catch { return ""; }
  });
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    try { return localStorage.getItem(EMAIL_KEY) ?? ""; } catch { return ""; }
  });
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBadge, setShowBadge] = useState(false);
  const [formStartedAt] = useState<number>(() => Date.now());

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (author.trim().length < 3) return setError("Votre prénom (3 caractères minimum).");
    if (!EMAIL_RE.test(email.trim())) return setError("Email valide requis (ne sera pas affiché).");
    if (body.trim().length < 8) return setError("Au moins 8 caractères.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          author: author.trim(),
          email: email.trim(),
          body: body.trim(),
          website,
          formStartedAt,
          type: "comment",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Erreur lors de l'envoi");
      if (data.comment) onPosted(data.comment);
      setBody("");
      setShowBadge(true);
      try {
        localStorage.setItem(STORAGE_KEY, author.trim());
        localStorage.setItem(EMAIL_KEY, email.trim());
      } catch {}
      setTimeout(() => setShowBadge(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/60 p-4">
      <p className="text-xs font-semibold text-[var(--text-secondary)] mb-3">Votre réponse</p>
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          type="text"
          placeholder="Votre prénom"
          aria-label="Votre prénom"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={40}
          required
          className="rounded-lg border border-[var(--border)] bg-white/80 px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white transition-all sm:w-40"
        />
        <input
          type="email"
          placeholder="Email (non public)"
          aria-label="Email (non public)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={120}
          required
          className="rounded-lg border border-[var(--border)] bg-white/80 px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white transition-all sm:flex-1"
        />
      </div>
      <textarea
        placeholder="Partagez ce que vous savez…"
        aria-label="Votre réponse"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={3}
        className="w-full rounded-lg border border-[var(--border)] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white transition-all resize-y"
      />
      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-[10px] text-[var(--text-tertiary)]">{body.length}/2000</span>
        <Button type="submit" size="sm" disabled={submitting} aria-busy={submitting} className={submitting ? "gap-2 opacity-60 cursor-wait" : "gap-2"}>
          {submitting ? (
            <>
              <span className="inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin" aria-hidden />
              Envoi…
            </>
          ) : (
            <>
              <Send className="h-3 w-3" />
              Répondre
            </>
          )}
        </Button>
      </div>
      {error && (
        <div role="alert" aria-live="assertive" className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <ContributorBadge visible={showBadge} />
    </form>
  );
}

function QuestionCard({
  question,
  citySlug,
}: {
  question: QAItem;
  citySlug: string;
}) {
  const [answers, setAnswers] = useState<QAItem[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [answersLoaded, setAnswersLoaded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [answerCount, setAnswerCount] = useState<number | null>(null);

  const answerTopic = `city:${citySlug}:q:${question.id}`;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?topic=${encodeURIComponent(answerTopic)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setAnswerCount(typeof d.total === "number" ? d.total : 0);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [answerTopic]);

  function loadAnswers() {
    if (answersLoaded) {
      setShowReplyForm(true);
      return;
    }
    setLoadingAnswers(true);
    fetch(`/api/comments?topic=${encodeURIComponent(answerTopic)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setAnswers(Array.isArray(d.items) ? d.items : []);
        setAnswerCount(typeof d.total === "number" ? d.total : 0);
        setAnswersLoaded(true);
        setShowReplyForm(true);
      })
      .catch(() => {})
      .finally(() => setLoadingAnswers(false));
  }

  function handleReplyClick() {
    if (!answersLoaded) {
      loadAnswers();
    } else {
      setShowReplyForm((v) => !v);
    }
  }

  function onAnswerPosted(answer: QAItem) {
    setAnswers((prev) => [answer, ...prev]);
    setAnswerCount((c) => (c ?? 0) + 1);
    setAnswersLoaded(true);
  }

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow">
      <header className="flex items-start gap-3 mb-3">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white font-bold shadow-sm mt-0.5"
          style={{ background: avatarColor(question.author) }}
          aria-hidden
        >
          {question.author.trim().charAt(0).toUpperCase() || <User className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-[var(--text-primary)] truncate">{question.author}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
              <HelpCircle className="h-2.5 w-2.5" />
              Question
            </span>
          </div>
          <div className="text-[11px] text-[var(--text-tertiary)] font-mono-data">{timeAgo(question.createdAt)}</div>
        </div>
      </header>

      <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap mb-3">
        {question.body}
      </p>

      {/* Answers preview */}
      {answersLoaded && answers.length > 0 && (
        <div className="ml-4 pl-4 border-l-2 border-[var(--border)] space-y-3 mb-3">
          {answers.map((a) => (
            <div key={a.id} className="flex items-start gap-2">
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold"
                style={{ background: avatarColor(a.author) }}
                aria-hidden
              >
                {a.author.trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-[var(--text-primary)]">{a.author}</span>
                <span className="text-[10px] text-[var(--text-tertiary)] ml-2">{timeAgo(a.createdAt)}</span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-0.5 whitespace-pre-wrap">{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleReplyClick}
          disabled={loadingAnswers}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-colors"
        >
          {loadingAnswers ? (
            <span className="inline-block h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin" aria-hidden />
          ) : (
            <MessageSquare className="h-3 w-3" />
          )}
          Répondre
        </button>
        {answerCount !== null && answerCount > 0 && (
          <button
            type="button"
            onClick={() => { if (!answersLoaded) loadAnswers(); else setShowReplyForm((v) => !v); }}
            className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${showReplyForm ? "rotate-180" : ""}`} />
            {answerCount} {answerCount === 1 ? "réponse" : "réponses"}
          </button>
        )}
      </div>

      {showReplyForm && (
        <AnswerForm questionId={question.id} citySlug={citySlug} onPosted={onAnswerPosted} />
      )}
    </article>
  );
}

export function QASection({ citySlug, cityName }: QASectionProps) {
  const questionTopic = `city:${citySlug}:questions`;

  const [questions, setQuestions] = useState<QAItem[]>([]);
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
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBadge, setShowBadge] = useState(false);
  const [formStartedAt] = useState<number>(() => Date.now());
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?topic=${encodeURIComponent(questionTopic)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const items: QAItem[] = Array.isArray(d.items) ? d.items : [];
        setQuestions(items.filter((i) => i.type === "question"));
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [questionTopic]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (author.trim().length < 3) return setError("Votre prénom (3 caractères minimum).");
    if (!EMAIL_RE.test(email.trim())) return setError("Email valide requis (ne sera pas affiché).");
    if (body.trim().length < 8) return setError("Au moins 8 caractères.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: questionTopic,
          author: author.trim(),
          email: email.trim(),
          body: body.trim(),
          website,
          formStartedAt,
          type: "question",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Erreur lors de l'envoi");
      if (data.comment) setQuestions((prev) => [data.comment, ...prev]);
      setBody("");
      setShowBadge(true);
      try {
        localStorage.setItem(STORAGE_KEY, author.trim());
        localStorage.setItem(EMAIL_KEY, email.trim());
      } catch {}
      setTimeout(() => setShowBadge(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">
            ❓ Questions & réponses
          </p>
          <h3 className="text-2xl font-bold text-[var(--text-primary)]">
            Posez vos questions sur {cityName}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <HelpCircle className="h-4 w-4" />
          {questions.length} {questions.length === 1 ? "question" : "questions"}
        </div>
      </div>

      {/* Question form */}
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="rounded-2xl glass border border-white/60 p-5 shadow-md mb-6"
      >
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          Vous avez une question sur {cityName} ?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Votre prénom"
            aria-label="Votre prénom"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={40}
            minLength={3}
            required
            className="rounded-xl border border-[var(--border)] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 transition-all sm:w-44"
          />
          <input
            type="email"
            placeholder="Email (non public)"
            aria-label="Email (non public)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={120}
            required
            className="rounded-xl border border-[var(--border)] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 transition-all sm:flex-1 sm:min-w-[200px]"
          />
        </div>
        <textarea
          placeholder={`Quelle est votre question sur ${cityName} ? (logement, transports, vie locale, écoles…)`}
          aria-label="Votre question"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={4}
          className="mt-3 w-full rounded-xl border border-[var(--border)] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60 focus:bg-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 transition-all resize-y"
        />

        {/* Honeypot */}
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
          <div className="text-[11px] text-[var(--text-tertiary)]">
            {body.length}/2000 · pas de liens · respect
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
                Envoi…
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Poser ma question
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
      </form>

      {/* Questions list */}
      <div className="space-y-3">
        {loading ? (
          <>
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 animate-pulse"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-[var(--bg-elevated)]" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded bg-[var(--bg-elevated)]" />
                    <div className="h-2 w-16 rounded bg-[var(--bg-elevated)]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-full rounded bg-[var(--bg-elevated)]" />
                  <div className="h-3 w-3/4 rounded bg-[var(--bg-elevated)]" />
                </div>
              </div>
            ))}
          </>
        ) : questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/50 p-8 text-center">
            <div className="text-4xl mb-2">🤔</div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Aucune question pour l&apos;instant.
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Posez la première — la communauté vous répondra !
            </p>
          </div>
        ) : (
          questions.map((q) => (
            <QuestionCard key={q.id} question={q} citySlug={citySlug} />
          ))
        )}
      </div>
    </section>
  );
}
