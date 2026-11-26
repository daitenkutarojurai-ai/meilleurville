"use client";

/**
 * Note rapide des habitants (2026-11-26) : un tap sur une étoile, la relation à la ville,
 * et c'est envoyé. Pas de compte, pas d'email. Le formulaire d'avis écrit reste accessible
 * après la note. API : /api/ratings (worker/index.ts), stockage lib/city-ratings-store.ts.
 * La moyenne ne s'affiche qu'à partir de MIN_PUBLIC votes, pour ne pas publier une « note
 * des habitants » faite d'une seule personne.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { Star, Check, Loader2, PenLine, Share2, Bell } from "lucide-react";

const MIN_PUBLIC = 3;
const CRITERIA = [
  { id: "securite", fr: "Sécurité", en: "Safety" },
  { id: "transport", fr: "Transports", en: "Transport" },
  { id: "cout", fr: "Coût de la vie", en: "Cost of living" },
  { id: "ambiance", fr: "Ambiance", en: "Atmosphere" },
] as const;
type CriterionId = (typeof CRITERIA)[number]["id"];
const RELATIONS = [
  { id: "habitant", fr: "J'y habite", en: "I live here" },
  { id: "ancien", fr: "J'y ai habité", en: "I used to live here" },
  { id: "connait", fr: "Je connais bien", en: "I know it well" },
] as const;

interface Summary {
  n: number;
  avg: number | null;
  dist: number[];
  criteria: Record<CriterionId, { avg: number; n: number } | null>;
}

const storageKey = (slug: string) => `mvi:rated:${slug}`;
const noSubscribe = () => () => {};
function readStoredRating(slug: string): number {
  try {
    return Number(JSON.parse(localStorage.getItem(storageKey(slug)) ?? "{}").overall) || 0;
  } catch {
    return 0;
  }
}

function StarRow({
  value,
  onChange,
  size,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  size: "lg" | "sm";
  label: string;
}) {
  const cls = size === "lg" ? "h-8 w-8" : "h-5 w-5";
  return (
    <div role="radiogroup" aria-label={label} className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n}/5`}
          onClick={() => onChange(n)}
          className={`${size === "lg" ? "p-1.5" : "p-1"} rounded-lg hover:bg-[var(--accent)]/10 transition-colors`}
        >
          <Star className={`${cls} ${value >= n ? "fill-amber-400 text-amber-500" : "text-[var(--text-tertiary)]"}`} />
        </button>
      ))}
    </div>
  );
}

export function QuickCityRating({
  citySlug,
  cityName,
  locale = "fr",
  onWriteReview,
}: {
  citySlug: string;
  cityName: string;
  locale?: "fr" | "en";
  onWriteReview?: () => void;
}) {
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const fmt = (x: number) => (locale === "en" ? x.toFixed(1) : x.toFixed(1).replace(".", ","));
  const [summary, setSummary] = useState<Summary | null>(null);
  // Snapshot serveur = 0 : le HTML statique et la première hydratation montrent le formulaire,
  // puis React relit localStorage sans erreur d'hydratation (#418).
  const stored = useSyncExternalStore(noSubscribe, () => readStoredRating(citySlug), () => 0);
  const [justRated, setJustRated] = useState(0);
  const [already, setAlready] = useState(false);
  const mine = justRated || stored;
  const [overall, setOverall] = useState(0);
  const [relation, setRelation] = useState<string>("");
  const [criteria, setCriteria] = useState<Partial<Record<CriterionId, number>>>({});
  const [startedAt] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/ratings?city=${encodeURIComponent(citySlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && j && typeof j.n === "number" && setSummary(j))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [citySlug]);

  async function submit() {
    if (!overall) return;
    if (!relation) return setError(t("Dites-nous votre lien avec la ville.", "Tell us how you know the city."));
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ city: citySlug, overall, relation, criteria, locale, formStartedAt: startedAt }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok || j.already) {
        if (j.already) setAlready(true);
        if (j.summary) setSummary(j.summary);
        try {
          localStorage.setItem(storageKey(citySlug), JSON.stringify({ overall, at: Date.now() }));
        } catch {
          /* stockage indisponible : la note est quand même envoyée */
        }
        setJustRated(overall);
      } else {
        setError(j.error ?? t("Envoi impossible, réessayez.", "Could not send, please retry."));
      }
    } catch {
      setError(t("Envoi impossible, réessayez.", "Could not send, please retry."));
    } finally {
      setSending(false);
    }
  }

  const pageUrl =
    locale === "en"
      ? `https://bestcitiesinfrance.com/cities/${citySlug}`
      : `https://www.mavilleideale.fr/villes/${citySlug}`;
  const shareUrl = `${pageUrl}?utm_source=partage&utm_medium=note-habitants#note-habitants`;
  const shareText = t(
    `J'ai donné ma note à ${cityName} sur MaVilleIdéale. Et vous, vous lui mettez combien ?`,
    `I just rated ${cityName} on BestCitiesInFrance. What would you give it?`,
  );
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
    } catch {
      /* partage annulé */
    }
  }

  const showAvg = summary && summary.n >= MIN_PUBLIC && summary.avg !== null;
  const btn =
    "inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 min-h-[40px] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors";

  return (
    <div id="note-habitants" className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]/90 p-4 shadow-sm scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent-pink)]">
          {t("La note des habitants", "Residents' rating")}
        </p>
        {showAvg ? (
          <p className="text-sm text-[var(--text-secondary)]">
            <Star className="inline h-4 w-4 -mt-0.5 fill-amber-400 text-amber-500" aria-hidden />{" "}
            <strong className="font-mono-data text-[var(--text-primary)]">{fmt(summary.avg as number)}/5</strong>{" "}
            · {summary.n} {t("votes", "votes")}
          </p>
        ) : summary && summary.n > 0 ? (
          <p className="text-xs text-[var(--text-tertiary)]">
            {t(`${summary.n} vote${summary.n > 1 ? "s" : ""} : la moyenne s'affiche à partir de ${MIN_PUBLIC}.`, `${summary.n} vote${summary.n > 1 ? "s" : ""}: the average shows from ${MIN_PUBLIC}.`)}
          </p>
        ) : null}
      </div>

      {showAvg ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-xs text-[var(--text-secondary)]">
          {CRITERIA.map((c) => {
            const v = summary.criteria?.[c.id];
            return v && v.n >= MIN_PUBLIC ? (
              <span key={c.id}>
                {t(c.fr, c.en)} <strong className="font-mono-data text-[var(--text-primary)]">{fmt(v.avg)}</strong>
              </span>
            ) : null;
          })}
        </div>
      ) : null}

      {mine ? (
        <div>
          <p className="flex items-center gap-1.5 text-sm text-[var(--text-primary)] mb-3">
            <Check className="h-4 w-4 text-emerald-600" aria-hidden />
            {already
              ? t(`Vous avez déjà noté ${cityName} ce mois-ci : merci !`, `You already rated ${cityName} this month: thanks!`)
              : t(`Merci : votre note (${mine}/5) compte dans la moyenne de ${cityName}.`, `Thanks: your ${mine}/5 counts towards ${cityName}'s average.`)}
          </p>
          <div className="flex flex-wrap gap-2">
            {onWriteReview ? (
              <button type="button" onClick={onWriteReview} className={btn}>
                <PenLine className="h-4 w-4" aria-hidden /> {t("Ajouter un avis écrit", "Add a written review")}
              </button>
            ) : null}
            <button type="button" onClick={share} className={btn}>
              <Share2 className="h-4 w-4" aria-hidden />{" "}
              {copied ? t("Lien copié", "Link copied") : t("Demander à vos voisins", "Ask your neighbours")}
            </button>
            <a href="#discussions" className={btn}>
              <Bell className="h-4 w-4" aria-hidden /> {t("Être prévenu des nouveaux avis", "Get new reviews by email")}
            </a>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-[var(--text-primary)] font-semibold">
            {t(`Et vous, quelle note donnez-vous à ${cityName} ?`, `What would you give ${cityName}?`)}{" "}
            <span className="font-normal text-[var(--text-tertiary)]">{t("10 secondes, sans inscription.", "10 seconds, no sign-up.")}</span>
          </p>
          <StarRow value={overall} onChange={setOverall} size="lg" label={t(`Note globale de ${cityName}`, `Overall rating for ${cityName}`)} />
          {overall ? (
            <div className="mt-2 space-y-3">
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("Votre lien avec la ville", "How you know the city")}>
                {RELATIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={relation === r.id}
                    onClick={() => setRelation(r.id)}
                    className={`rounded-full px-3 py-1.5 min-h-[36px] text-sm border transition-colors ${
                      relation === r.id
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)]"
                    }`}
                  >
                    {t(r.fr, r.en)}
                  </button>
                ))}
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer text-[var(--accent)] font-medium">
                  {t("Détailler (facultatif) : sécurité, transports, coût, ambiance", "Add detail (optional): safety, transport, cost, atmosphere")}
                </summary>
                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {CRITERIA.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-2">
                      <span className="text-[var(--text-secondary)]">{t(c.fr, c.en)}</span>
                      <StarRow
                        value={criteria[c.id] ?? 0}
                        onChange={(n) => setCriteria((p) => ({ ...p, [c.id]: n }))}
                        size="sm"
                        label={t(c.fr, c.en)}
                      />
                    </div>
                  ))}
                </div>
              </details>
              {error ? <p className="text-sm text-rose-700">{error}</p> : null}
              <button
                type="button"
                onClick={submit}
                disabled={sending}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold px-4 py-2 min-h-[40px] hover:bg-[var(--accent-hover)] disabled:opacity-60 transition-colors"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {t("Envoyer ma note", "Send my rating")}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
