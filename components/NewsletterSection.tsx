"use client";
import { useState } from "react";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";

type Locale = "fr" | "en";

interface NewsletterCopy {
  titlePre: string;
  titleEm: string;
  titlePost: string;
  desc: string;
  error: string;
  success: string;
  placeholder: string;
  ariaLabel: string;
  submit: string;
  sending: string;
  fine: string;
  kicker: string;
  stamp: string;
}

// Locale-scoped copy. The `locale` prop is also sent to /api/newsletter, so a
// reader of bestcitiesinfrance.com lands on the EN list and never receives the
// French "lettre du dimanche" (and vice versa).
const COPY: Record<Locale, NewsletterCopy> = {
  fr: {
    titlePre: "La",
    titleEm: "lettre",
    titlePost: "du dimanche",
    desc: "Nouveau classement chaque semaine · Analyse de la ville du mois · Alertes avis pour vos villes sauvegardées",
    error: "Erreur — réessayez dans un instant.",
    success: "Presque fini ! Vérifiez votre boîte mail pour confirmer l'inscription.",
    placeholder: "votre@email.fr",
    ariaLabel: "Adresse email pour la newsletter",
    submit: "S'abonner",
    sending: "Envoi…",
    fine: "Aucun spam · Désabonnement en un clic · Données en France",
    kicker: "Courrier · chaque dimanche",
    stamp: "Dim.",
  },
  en: {
    titlePre: "The",
    titleEm: "Sunday",
    titlePost: "letter",
    desc: "A new ranking every week · The city of the month, analysed · Review alerts for the cities you save",
    error: "Something went wrong. Try again in a moment.",
    success: "Almost done! Check your inbox to confirm your subscription.",
    placeholder: "you@email.com",
    ariaLabel: "Email address for the newsletter",
    submit: "Subscribe",
    sending: "Sending…",
    fine: "No spam · One-click unsubscribe",
    kicker: "Post · every Sunday",
    stamp: "Sun.",
  },
};

// Airmail envelope edge, in the two accents only.
const AIRMAIL: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, var(--accent) 0 12px, transparent 12px 18px, var(--accent-pink) 18px 30px, transparent 30px 36px)",
};

export function NewsletterSection({
  locale = "fr",
  // `compact` drops the stamp and the 4xl heading so the block can sit inside
  // an article without hijacking it. Same form, same
  // endpoint, same honeypot — only the surrounding decoration changes.
  compact = false,
}: {
  locale?: Locale;
  compact?: boolean;
}) {
  const copy = COPY[locale];
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, website }),
      });
      if (res.ok) setState("success");
      else setState("error");
    } catch {
      setState("error");
    }
  }

  // The Sunday letter as an envelope on the survey-map paper: an airmail edge
  // (navy and brick — the site's only two accents, never a score tier), a
  // postage stamp on a plaque, and a plain navy submit. No aurora, sparkles,
  // grain or magnetic button. CLAUDE.md « Carte & plaque ».
  const form =
    state === "success" ? (
      <div role="status" aria-live="polite" className="inline-flex items-center gap-2 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent)]">
        <CheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="font-semibold">{copy.success}</span>
      </div>
    ) : (
      <form onSubmit={handleSubmit} className="relative flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={copy.placeholder}
          aria-label={copy.ariaLabel}
          required
          className="min-w-0 flex-1 rounded-lg border border-[var(--text-primary)]/25 bg-[var(--bg-surface)] px-4 py-3 font-mono-data text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
        />
        {/* Honeypot — hidden from real users, drained server-side */}
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
        <Button type="submit" size="lg" disabled={state === "loading"} className="gap-2 rounded-lg shadow-none">
          {state === "loading" ? (
            <span className="animate-pulse">{copy.sending}</span>
          ) : (
            <>
              {copy.submit}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>
    );

  const error =
    state === "error" ? (
      <div role="alert" aria-live="assertive" className="mb-3 inline-flex items-center gap-2 rounded-lg border border-[var(--accent-pink)]/40 bg-[var(--bg-surface)] px-4 py-2 text-sm text-[var(--accent-pink)]">
        {copy.error}
      </div>
    ) : null;

  const envelope = (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
      <div aria-hidden="true" className="h-1.5" style={AIRMAIL} />
      <div className={compact ? "p-5 sm:p-6" : "grid gap-8 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-start"}>
        <div className="min-w-0">
          {compact && (
            <p className="mb-2 font-mono-data text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {copy.kicker}
            </p>
          )}
          {compact ? (
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--text-primary)]">
              <Mail className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
              {copy.titlePre} {copy.titleEm} {copy.titlePost}
            </h2>
          ) : (
            <h2 className="mb-3 text-3xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] sm:text-4xl">
              {copy.titlePre}{" "}
              <span className="font-display italic text-[var(--accent)]">{copy.titleEm}</span>{" "}
              {copy.titlePost}
            </h2>
          )}
          <p className={compact ? "mb-4 text-sm text-[var(--text-secondary)]" : "mb-6 max-w-xl text-[var(--text-secondary)]"}>
            {copy.desc}
          </p>
          {error}
          <div className={compact ? "" : "max-w-md"}>{form}</div>
          <p className="mt-3 border-t border-dashed border-[var(--text-primary)]/15 pt-3 font-mono-data text-[11px] text-[var(--text-tertiary)]">
            {copy.fine}
          </p>
        </div>

        {!compact && (
          // Postage stamp: perforated paper edge around a plaque.
          <div aria-hidden="true" className="hidden md:block">
            <div className="rotate-3 rounded-sm border-2 border-dashed border-[var(--text-primary)]/25 bg-[var(--bg-canvas)] p-2">
              <div className="topo-bg flex h-28 w-24 flex-col items-center justify-center gap-2 border border-[var(--text-primary)]/15 bg-[var(--bg-surface)]">
                <span className="plaque plaque-small">
                  <Mail className="h-4 w-4" />
                </span>
                <span className="font-mono-data text-[10px] font-semibold uppercase tracking-widest text-[var(--text-primary)]">
                  {copy.stamp}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (compact) return <section className="my-10">{envelope}</section>;

  return (
    <section className="band band-indigo py-8 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="border-t border-[var(--border)] pt-6">
          <p className="mb-4 inline-flex items-center gap-2 font-mono-data text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.kicker}
          </p>
          {envelope}
        </div>
      </div>
    </section>
  );
}
