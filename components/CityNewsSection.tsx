import {
  cityNews,
  cityNewsSources,
  newsKindLabel,
  newsDateLabel,
  newsMonthLabel,
  cityNewsRefreshedAt,
  isCityNewsStale,
  newsPartialCoverage,
  newsSpan,
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

  // What the reader is actually looking at, derived from the very array printed
  // below — see newsSpan(). The intro used to assert the section covered the
  // whole 12-month window; measured on the real file, 536 of the 537 rendering
  // cities are pinned at the 8-entry cap and the list carries 3 or 4 months on
  // 506 of them, never 12.
  const span = newsSpan(entries);
  const range =
    span == null
      ? ""
      : span.from === span.to
        ? newsMonthLabel(span.from, locale)
        : L(
            `de ${newsMonthLabel(span.from, locale)} à ${newsMonthLabel(span.to, locale)}`,
            `${newsMonthLabel(span.from, locale)} to ${newsMonthLabel(span.to, locale)}`,
          );

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
  // Every partial row of one city shares its `refreshedAt`, and a row is only
  // partial when it falls in that same month — so one coverage describes them
  // all, and the footnote can quote it instead of guessing at an adjective.
  const partial = entries.map((e) => newsPartialCoverage(slug, e)).find(Boolean) ?? null;

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
            `Ce que les publications officielles disent de ${name}. Ce ne sont ni des articles de presse ni un classement : des dépôts légaux et des arrêtés, comptés et datés. Une création d'entreprise n'est pas une bonne nouvelle en soi, une radiation n'est pas une mauvaise.`,
            `What official publications say about ${name}. These are not news articles and not a ranking: legal filings and government orders, counted and dated. A business registration is not good news in itself, and a deregistration is not bad news.`,
          )}
        </p>

        {/* The searched window and the printed list are two different things,
            and the first sentence used to name only the former — "sur les 12
            derniers mois", on every rendering page, above a list that carries
            three. The scope is therefore stated from the list itself, and the
            cap is named where it has a consequence: once it bites, a month with
            no line is a month that was evicted, not a month with nothing in it.
            That caveat is printed only when `capped`, because when the list
            kept everything found, an absent month really is an empty one. */}
        {span ? (
          <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
            {span.capped
              ? L(
                  // "les plus récents de chaque type", not "les N plus récents":
                  // the list is a per-type round-robin, so Nantes keeps a March
                  // CatNat order that a pure date sort would have evicted. The
                  // first draft of this sentence said "les plus récents" and was
                  // already false on the page it was read against.
                  `Les ${NEWS_WINDOW_MONTHS} derniers mois ont été interrogés ; la liste n'en retient que ${entries.length} signaux, les plus récents de chaque type, ici ${range}. Un mois qui n'y figure pas n'est donc pas un mois sans dépôt : il a été écarté par cette limite.`,
                  `The past ${NEWS_WINDOW_MONTHS} months were searched; the list keeps only ${entries.length} signals, the most recent of each type, here ${range}. A month missing from it is therefore not a month without filings — it was displaced by that limit.`,
                )
              : L(
                  `Les ${NEWS_WINDOW_MONTHS} derniers mois ont été interrogés : ils portent ${entries.length} signal${entries.length > 1 ? "s" : ""} en tout, ${range}.`,
                  `The past ${NEWS_WINDOW_MONTHS} months were searched: they hold ${entries.length} signal${entries.length > 1 ? "s" : ""} in all, ${range}.`,
                )}
          </p>
        ) : null}

        <ul className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {entries.map((e, i) => {
            // A count stopped mid-month sits directly above the same metric for
            // the previous, complete month. Both figures are exact; read as a
            // column they state a collapse that did not happen. Marked, not
            // dropped — see newsPartialThrough().
            const cov = newsPartialCoverage(slug, e);
            return (
              <li
                key={`${e.date}-${e.kind}-${i}`}
                className="py-3 flex flex-wrap items-baseline gap-x-3 gap-y-1"
              >
                <span className="text-xs tabular-nums text-[var(--text-tertiary)] w-32 shrink-0">
                  {dateLabel(e, locale)}
                  {cov ? (
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
                  {cov ? (
                    <span className="text-[var(--text-tertiary)]">
                      {" "}
                      {L(
                        `— comptage arrêté au ${newsDateLabel(cov.through, locale)}, soit ${cov.daysCounted} des ${cov.daysInMonth} jours du mois`,
                        `— counted up to ${newsDateLabel(cov.through, locale)}, i.e. ${cov.daysCounted} of the month's ${cov.daysInMonth} days`,
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

        {/* The note quotes the coverage instead of characterising it. It used to
            read "quelques jours" — exact while the only crawl on record had
            stopped on the 4th of the month, and false from the sweep of the 26th
            on, when the same sentence told readers that 26 days of 31 were "a
            few" and that comparing them to a full month said nothing. Naming the
            denominator is true at 4/31 and at 27/31, and leaves the arithmetic
            to the reader rather than ruling on what the figure is worth. */}
        {partial ? (
          <p className="mt-3 text-xs text-[var(--text-secondary)]">
            {L(
              `Un mois marqué « partiel » a été compté sur ${partial.daysCounted} des ${partial.daysInMonth} jours du mois, là où les lignes voisines portent un mois entier. Le chiffre est exact sur cette fenêtre : c'est le dénominateur qui diffère, pas la mesure — l'écart avec le mois plein qui suit n'est donc pas une évolution.`,
              `A month marked “partial” was counted over ${partial.daysCounted} of the month's ${partial.daysInMonth} days, where the lines around it cover a whole month. The figure is exact over that window: what differs is the denominator, not the measurement — so the gap with the full month below it is not a trend.`,
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
