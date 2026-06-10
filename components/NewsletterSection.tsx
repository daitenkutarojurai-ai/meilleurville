"use client";
import { useState } from "react";
import { Mail, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MagneticButton } from "@/components/effects/MagneticButton";

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
  },
};

export function NewsletterSection({ locale = "fr" }: { locale?: Locale }) {
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

  return (
    <section className="relative py-8 sm:py-20 border-t border-[var(--border)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/60 glass-strong p-10 sm:p-14 shadow-2xl shadow-[var(--accent)]/15">
          {/* Aurora */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-aurora opacity-60" />
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-[100px] animate-drift" />
            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[var(--accent-pink)]/15 blur-[100px] animate-drift" style={{ animationDelay: "2.5s" }} />
          </div>
          <div className="grain grain-soft rounded-[2rem]" style={{ opacity: 0.18 }} />

          {/* Floating envelope sparkles */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <Sparkles className="absolute top-8 right-12 h-5 w-5 text-[var(--accent-warm)] animate-drift opacity-60" style={{ animationDelay: "0.5s" }} />
            <Sparkles className="absolute bottom-12 left-10 h-4 w-4 text-[var(--accent)] animate-drift opacity-50" style={{ animationDelay: "1.5s" }} />
            <Sparkles className="absolute top-20 left-20 h-3 w-3 text-[var(--accent-pink)] animate-drift opacity-50" style={{ animationDelay: "2.2s" }} />
          </div>

          <div className="relative text-center">
            <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-emerald-700 shadow-xl shadow-[var(--accent)]/40 animate-drift">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <h2 className="mb-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              {copy.titlePre}{" "}
              <span className="font-display gradient-text-anim italic">{copy.titleEm}</span>{" "}
              {copy.titlePost}
            </h2>
            <p className="mb-8 text-[var(--text-secondary)] max-w-xl mx-auto">
              {copy.desc}
            </p>

            {state === "error" && (
              <div role="alert" aria-live="assertive" className="mb-3 inline-flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {copy.error}
              </div>
            )}

            {state === "success" ? (
              <div role="status" aria-live="polite" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent-soft)] border border-[var(--accent)]/30 px-5 py-3 text-emerald-700 shadow-md">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">{copy.success}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.placeholder}
                  aria-label={copy.ariaLabel}
                  required
                  className="flex-1 rounded-xl border border-white/60 bg-white/85 backdrop-blur px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]/60 focus:bg-white focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 transition-all shadow-sm"
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
                <MagneticButton strength={0.25}>
                  <Button type="submit" size="lg" disabled={state === "loading"} className="gap-2 shine shadow-xl shadow-[var(--accent)]/30">
                    {state === "loading" ? (
                      <span className="animate-pulse">{copy.sending}</span>
                    ) : (
                      <>
                        {copy.submit}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </MagneticButton>
              </form>
            )}

            <p className="mt-5 text-[11px] text-[var(--text-tertiary)]">
              {copy.fine}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
