import {
  cityNews,
  cityNewsSources,
  newsKindLabel,
  newsDateLabel,
  newsMonthLabel,
  cityNewsRefreshedAt,
  isCityNewsStale,
  newsPartialThrough,
  NEWS_WINDOW_MONTHS,
  NEWS_REFRESH_INTERVAL_DAYS,
  type CityNewsEntry,
} from "@/lib/city-news";

/**
 * F64 — "Signaux publics récents".
 *
 * Server component on purpose. CityProfile is the heaviest page of the site
 * (~1 MB of JS) and it is `"use client"`, so putting this section inside it
 * would ship all of data/city-news.json to every visitor's browser for a list
 * of a few lines of text. It renders after CityProfile in the server page
 * instead — same place on screen, zero bytes of client bundle. Same pattern as
 * CityGuidesList.
 *
 * Returns null when the city has nothing in the 12-month window. That is the
 * designed behaviour, not a fallback: a "no news" box on 300 city pages would
 * be worse than no box, and 540 pages of aggregated headlines are exactly what
 * Google calls scraped content — which is also why this has no URL of its own,
 * no sitemap entry and no NewsArticle JSON-LD. We are not the publisher.
 *
 * The section states what it is. It does not rank, comment or interpret: a
 * company registration is not good news, a deregistration is not bad news, and
 * a CatNat order is a fact with a date. Every entry names its source and its
 * licence, and links out with rel="nofollow".
 */

const KIND_ACCENT: Record<CityNewsEntry["kind"], string> = {
  entreprises: "text-[var(--accent)]",
  radiations: "text-[var(--text-secondary)]",
  procedures: "text-[var(--text-secondary)]",
  associations: "text-[var(--accent)]",
  catnat: "text-amber-600 dark:text-amber-400",
};

/** The record stores ingest keys ("bodacc"); readers must see publisher names.
 *  An unknown key falls through as-is rather than being dropped — a source we
 *  cannot name is still a source we used, and hiding it would misstate where
 *  the figures came from. */
const SOURCE_LABEL: Record<string, string> = {
  bodacc: "BODACC",
  rna: "Journal officiel des associations",
  georisques: "Géorisques (GASPAR)",
};

/** Monthly aggregates are dated to the 1st and mean the whole month, so
 *  showing "1 juillet 2026" would be a false precision. CatNat orders are
 *  single acts with a real date. */
function dateLabel(entry: CityNewsEntry, locale: "fr" | "en") {
  return entry.kind === "catnat"
    ? newsDateLabel(entry.date, locale)
    : newsMonthLabel(entry.date, locale);
}

export function CityNewsSection({
  slug,
  name,
  locale = "fr",
}: {
  slug: string;
  name: string;
  locale?: "fr" | "en";
}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const entries = cityNews(slug);
  if (!entries.length) return null;

  const refreshedAt = cityNewsRefreshedAt(slug);
  const stale = isCityNewsStale(slug);
  // Fall back to the sources the entries themselves name, so the footer is
  // never blank on a row written before `sources` was recorded.
  const sources = (cityNewsSources(slug).length
    ? cityNewsSources(slug).map((s) => SOURCE_LABEL[s] ?? s)
    : [...new Set(entries.map((e) => e.source))]);
  // Licence lives on the entry, not the file, precisely because the sources may
  // diverge — so the footer lists the distinct ones rather than assuming the
  // first entry speaks for all of them.
  const licences = [...new Set(entries.map((e) => e.licence).filter(Boolean))];
  const hasPartial = entries.some((e) => newsPartialThrough(slug, e));

  return (
    <section className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-1">
          {L("Données publiques", "Public records")}
        </p>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          {L("Signaux publics récents", "Recent public signals")}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          {L(
            `Ce que les publications officielles disent de ${name} sur les ${NEWS_WINDOW_MONTHS} derniers mois. Ce ne sont ni des articles de presse ni un classement : des dépôts légaux et des arrêtés, comptés et datés. Une création d'entreprise n'est pas une bonne nouvelle en soi, une radiation n'est pas une mauvaise.`,
            `What official publications say about ${name} over the past ${NEWS_WINDOW_MONTHS} months. These are not news articles and not a ranking: legal filings and government orders, counted and dated. A business registration is not good news in itself, and a deregistration is not bad news.`,
          )}
        </p>

        <ul className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {entries.map((e, i) => {
            // A count stopped mid-month sits directly above the same metric for
            // the previous, complete month. Both figures are exact; read as a
            // column they state a collapse that did not happen. Marked, not
            // dropped — see newsPartialThrough().
            const partialThrough = newsPartialThrough(slug, e);
            return (
              <li
                key={`${e.date}-${e.kind}-${i}`}
                className="py-3 flex flex-wrap items-baseline gap-x-3 gap-y-1"
              >
                <span className="text-xs tabular-nums text-[var(--text-tertiary)] w-32 shrink-0">
                  {dateLabel(e, locale)}
                  {partialThrough ? (
                    // "partiel", not "en cours": once a month ends without a
                    // refresh the count is still truncated but the month is no
                    // longer ongoing, and only the first word stays true.
                    <span className="ml-1 italic">{L("· partiel", "· partial")}</span>
                  ) : null}
                </span>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${KIND_ACCENT[e.kind]}`}
                >
                  {newsKindLabel(e.kind, locale)}
                </span>
                <span className="text-sm text-[var(--text-primary)] basis-full sm:basis-auto sm:flex-1 min-w-0">
                  {locale === "en" ? e.titleEn ?? e.title : e.title}
                  {partialThrough ? (
                    <span className="text-[var(--text-tertiary)]">
                      {" "}
                      {L(
                        `— comptage arrêté au ${newsDateLabel(partialThrough, locale)}`,
                        `— counted on ${newsDateLabel(partialThrough, locale)}`,
                      )}
                    </span>
                  ) : null}
                </span>
                <a
                  href={e.sourceUrl}
                  rel="nofollow noopener noreferrer"
                  target="_blank"
                  className="text-xs text-[var(--text-tertiary)] underline hover:text-[var(--accent)] shrink-0"
                >
                  {e.source}
                </a>
              </li>
            );
          })}
        </ul>

        {hasPartial ? (
          <p className="mt-3 text-xs text-[var(--text-secondary)]">
            {L(
              "Un mois marqué « partiel » n'a été compté que jusqu'à la date indiquée : il porte quelques jours quand les autres portent un mois entier. Le chiffre est exact, mais le mettre en regard des mois pleins ne dit rien — ce n'est pas une baisse.",
              "A month marked “partial” was only counted up to the date shown: it covers a few days where the others cover a whole month. The figure is exact, but reading it against the full months tells you nothing — it is not a decline.",
            )}
          </p>
        ) : null}

        <p className="mt-4 text-xs text-[var(--text-tertiary)]">
          {L(
            `Sources : ${sources.join(", ")} · ${licences.join(" · ")} · consultables librement.`,
            `Sources: ${sources.join(", ")} · ${licences.join(" · ")} · openly available.`,
          )}
          {/* The date is published as a CEILING, not as a badge of freshness.
              "Mis à jour le 4 août" reads as reassurance and stops being the
              point the day the collector dies — which it did on 2026-08-05,
              while 527 city pages went on saying it for three weeks. "Relevé
              arrêté au 4 août" says the same date and the thing the reader
              actually needs: the list has a top, and nothing published above it
              was counted. True on day one, still true on day two hundred. The
              overdue sentence is then an addition, not a substitution. */}
          {refreshedAt ? (
            <>
              {" "}
              {L(
                `Relevé arrêté au ${newsDateLabel(refreshedAt, locale)} : ce qui a été publié après cette date n'est pas compté ici.`,
                `Counted up to ${newsDateLabel(refreshedAt, locale)}: anything published after that date is not counted here.`,
              )}
              {stale ? (
                <>
                  {" "}
                  {L(
                    `Le relevé est repris tous les ${NEWS_REFRESH_INTERVAL_DAYS} jours ; il ne l'a pas été depuis.`,
                    `The count is retaken every ${NEWS_REFRESH_INTERVAL_DAYS} days; it has not been retaken since.`,
                  )}
                </>
              ) : null}
            </>
          ) : null}
        </p>
      </div>
    </section>
  );
}
