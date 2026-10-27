// Bloc « À venir » des pages agenda ville (FR /villes/[slug]/agenda, EN
// /cities/[slug]/calendar). Composant serveur, zéro JS : chaque événement porte
// une ancre `#<id>` stable, c'est le lien qu'on renvoie à l'organisateur.
//
// Identité « Couleurs » : la date est une tuile dégradée (indigo / violet / rose,
// en rotation), cartes blanches à ombre indigo. Aucune couleur de palier de score
// (vert/lime/ambre/orange/rouge/violet) n'est utilisée en décoration.

import { MapPin, Ticket, ExternalLink } from "lucide-react";
import type { CityEvent } from "@/data/city-events";
import { eventDateBadge, eventDateLabel } from "@/lib/city-events";
import { ReportCTA } from "@/components/ReportCTA";

// Tuiles de date en rotation. Seuls les dégradés dont les deux extrémités
// tiennent le contraste sur du texte blanc (≥ 4,5:1) entrent ici.
const DATE_TILES = ["grad-head-0", "grad-head-5", "grad-head-4"] as const;

export function CityEvents({
  events,
  cityName,
  locale,
}: {
  events: CityEvent[];
  cityName: string;
  locale: "fr" | "en";
}) {
  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);

  return (
    <section aria-labelledby="a-venir">
      <h2 id="a-venir" className="text-2xl font-bold tracking-tight gradient-text">
        {t(`À venir à ${cityName}`, `Coming up in ${cityName}`)}
      </h2>
      <p className="mt-1 text-sm text-[var(--text-tertiary)]">
        {t(
          "Événements datés, vérifiés auprès de leur organisateur ou de la ville.",
          "Dated events, checked with their organiser or the city.",
        )}
      </p>

      {events.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-white p-5 text-[var(--text-secondary)] shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          {t(
            `Aucun événement daté pour ${cityName} pour l'instant.`,
            `No dated event listed for ${cityName} yet.`,
          )}
        </p>
      ) : (
        <ol className="mt-5 space-y-4">
          {events.map((e, i) => {
            const badge = eventDateBadge(e, locale);
            const price = locale === "fr" ? e.price : e.priceEn;
            return (
              <li
                key={e.id}
                id={e.id}
                className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] target:ring-2 target:ring-[var(--accent)]"
              >
                <div className="flex gap-4">
                  <div
                    className={`${DATE_TILES[i % DATE_TILES.length]} flex shrink-0 flex-col items-center justify-center w-16 h-16 rounded-2xl text-center leading-none shadow-[0_10px_22px_-12px_rgba(79,70,229,0.7)]`}
                    aria-hidden="true"
                  >
                    <span className="text-2xl font-bold">{badge.day}</span>
                    <span className="mt-1 text-[0.7rem] uppercase tracking-wide">{badge.month}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--accent)] first-letter:uppercase">
                      {eventDateLabel(e, locale)}
                      {e.kind === "sport" && (
                        <span className="ml-2 inline-block rounded-full bg-[var(--band-pink)] px-2 py-px align-middle text-[0.7rem] font-semibold uppercase tracking-wide text-[#BE185D]">
                          {t("Sport", "Sport")}
                        </span>
                      )}
                    </p>
                    <h3 className="mt-0.5 text-lg font-semibold text-[var(--text-primary)]">
                      {locale === "fr" ? e.title : e.titleEn}
                    </h3>
                    <p className="mt-1 flex items-start gap-1.5 text-sm text-[var(--text-secondary)]">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>
                        {e.venue}
                        {e.address ? ` — ${e.address}` : ""}
                      </span>
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
                  {locale === "fr" ? e.body : e.bodyEn}
                </p>

                {(price || e.free) && (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-[var(--text-secondary)]">
                    <Ticket className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{price ?? t("Gratuit", "Free")}</span>
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-tertiary)]">
                  {e.url && (
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 font-medium text-[var(--accent)] hover:underline"
                    >
                      {t("Infos et billets", "Info & tickets")}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
                  <span>
                    {t("Organisé par", "Organised by")} {e.organizer} · {t("Source :", "Source:")}{" "}
                    {e.sourceUrl ? (
                      <a href={e.sourceUrl} target="_blank" rel="noopener" className="underline">
                        {e.source}
                      </a>
                    ) : (
                      e.source
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <ReportCTA
        className="mt-5"
        kinds={["evenement", "erreur"]}
        locale={locale}
        cityName={cityName}
        title={t(`Un événement à ${cityName} manque ici ?`, `An event in ${cityName} is missing?`)}
        text={t(
          "Concert, marché, festival, vide-grenier… Envoyez la date, le lieu et le lien : on l'ajoute gratuitement, avec un lien vers l'organisateur.",
          "Concert, market, festival, car-boot sale… Send the date, venue and link: listing is free, with a link to the organiser.",
        )}
      />
    </section>
  );
}
