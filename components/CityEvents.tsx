// Bloc « À venir » des pages agenda ville (FR /villes/[slug]/agenda, EN
// /cities/[slug]/calendar). Composant serveur, zéro JS : chaque événement porte
// une ancre `#<id>` stable, c'est le lien qu'on renvoie à l'organisateur.
//
// Identité « Carte & plaque » : la date est une plaque émaillée (navy), aucune
// couleur de palier de score (vert/ambre/rouge…) n'est utilisée en décoration.

import { MapPin, Ticket, ExternalLink } from "lucide-react";
import type { CityEvent } from "@/data/city-events";
import { eventDateBadge, eventDateLabel } from "@/lib/city-events";

export function CityEvents({
  events,
  cityName,
  locale,
  contactHref,
}: {
  events: CityEvent[];
  cityName: string;
  locale: "fr" | "en";
  contactHref: string;
}) {
  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);

  return (
    <section aria-labelledby="a-venir" className="mb-12">
      <h2 id="a-venir" className="text-2xl font-bold text-[var(--text-primary)]">
        {t(`À venir à ${cityName}`, `Coming up in ${cityName}`)}
      </h2>
      <p className="mt-1 text-sm text-[var(--text-tertiary)]">
        {t(
          "Événements datés, vérifiés auprès de leur organisateur ou de la ville.",
          "Dated events, checked with their organiser or the city.",
        )}
      </p>

      {events.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-5 text-[var(--text-secondary)]">
          {t(
            `Aucun événement daté pour ${cityName} pour l'instant.`,
            `No dated event listed for ${cityName} yet.`,
          )}
        </p>
      ) : (
        <ol className="mt-5 space-y-4">
          {events.map((e) => {
            const badge = eventDateBadge(e, locale);
            const price = locale === "fr" ? e.price : e.priceEn;
            return (
              <li
                key={e.id}
                id={e.id}
                className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 target:border-[var(--accent)] target:ring-2 target:ring-[var(--accent)]"
              >
                <div className="flex gap-4">
                  <div
                    className="plaque flex-col !gap-0 shrink-0 w-16 h-16 justify-center text-center leading-none"
                    aria-hidden="true"
                  >
                    <span className="text-2xl font-bold">{badge.day}</span>
                    <span className="mt-1 text-[0.7rem] uppercase tracking-wide">{badge.month}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--accent)] first-letter:uppercase">
                      {eventDateLabel(e, locale)}
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

      <p className="mt-4 text-sm text-[var(--text-secondary)]">
        {t(`Vous organisez un événement à ${cityName} ?`, `Organising an event in ${cityName}?`)}{" "}
        <a href={contactHref} className="font-medium text-[var(--accent)] underline">
          {t("Proposez-le-nous", "Send it to us")}
        </a>
        {t(" — on l'ajoute gratuitement.", " — listing is free.")}
      </p>
    </section>
  );
}
