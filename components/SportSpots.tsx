// Section « Où s'entraîner » des sous-pages sport (FR /villes/[slug]/sport, EN
// /cities/[slug]/sports-leisure) : salles, street workout, CrossFit, escalade
// cartographiés dans OpenStreetMap, plus les prochains rendez-vous sportifs de
// l'agenda. Composant serveur, zéro JS (les listes longues passent par <details>).
//
// ODbL : l'attribution OpenStreetMap accompagne la donnée, ce n'est pas une option.

import Link from "@/components/AppLink";
import { MapPin, ExternalLink } from "lucide-react";
import {
  SPORT_SPOT_KINDS,
  SPORT_SPOT_LABEL,
  citySportSpots,
  sportSpotName,
  type SportSpot,
} from "@/lib/sport-spots";
import { upcomingSportEvents, eventDateLabel } from "@/lib/city-events";
import { mapsDirectionsUrl, mapsPlaceUrl } from "@/lib/maps-link";

const VISIBLE = 6;

function SpotRow({ s, cityName, locale }: { s: SportSpot; cityName: string; locale: "fr" | "en" }) {
  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);
  const name = sportSpotName(s, locale);
  const maps = s.n ? mapsPlaceUrl(s.n, cityName) : mapsDirectionsUrl(s.lat, s.lng);
  const km = s.km.toFixed(1).replace(".", locale === "fr" ? "," : ".");
  return (
    <li className="flex items-start justify-between gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
      <div className="min-w-0">
        <div className="font-medium text-[var(--text-primary)] break-words">{name}</div>
        <div className="text-xs text-[var(--text-tertiary)]">
          {t(`à ${km} km du centre`, `${km} km from the centre`)}
          {s.b ? ` · ${s.b}` : ""}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        <a href={maps} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {t("Y aller", "Directions")}
        </a>
        {s.w && (
          <a href={s.w} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-[var(--text-secondary)] hover:underline">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            {t("Site", "Website")}
          </a>
        )}
      </div>
    </li>
  );
}

export function SportSpots({ citySlug, cityName, locale }: { citySlug: string; cityName: string; locale: "fr" | "en" }) {
  const t = (fr: string, en: string) => (locale === "fr" ? fr : en);
  const data = citySportSpots(citySlug);
  const events = upcomingSportEvents(citySlug);
  const agendaHref = locale === "fr" ? `/villes/${citySlug}/agenda` : `/cities/${citySlug}/calendar`;
  const total = data ? SPORT_SPOT_KINDS.reduce((n, k) => n + data.counts[k], 0) : 0;

  return (
    <section aria-labelledby="ou-s-entrainer" className="mt-10">
      <h2 id="ou-s-entrainer" className="text-xl font-semibold text-[var(--text-primary)]">
        {t(`Où s'entraîner à ${cityName} ?`, `Where to train in ${cityName}`)}
      </h2>

      {!data ? (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {t(
            "Le recensement des salles et spots de cette ville n'a pas encore été collecté.",
            "Gyms and training spots have not been collected for this city yet.",
          )}
        </p>
      ) : (
        <>
          <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
            {total > 0
              ? t(
                  `OpenStreetMap recense à ${cityName} ${data.counts.fitness} salle${data.counts.fitness > 1 ? "s" : ""} de sport, ${data.counts.street} spot${data.counts.street > 1 ? "s" : ""} de street workout ou d'agrès en plein air, ${data.counts.crossfit} box CrossFit et ${data.counts.climbing} salle${data.counts.climbing > 1 ? "s" : ""} d'escalade. C'est ce qui est cartographié, pas un annuaire complet : une salle récente ou mal référencée peut manquer.`,
                  `OpenStreetMap lists ${data.counts.fitness} gym${data.counts.fitness === 1 ? "" : "s"}, ${data.counts.street} street-workout or outdoor fitness spot${data.counts.street === 1 ? "" : "s"}, ${data.counts.crossfit} CrossFit box${data.counts.crossfit === 1 ? "" : "es"} and ${data.counts.climbing} climbing gym${data.counts.climbing === 1 ? "" : "s"} in ${cityName}. This is what is mapped, not a complete directory: a new or poorly listed gym may be missing.`,
                )
              : t(
                  `Aucune salle de sport, aucun spot de street workout, aucune box CrossFit ni salle d'escalade n'est cartographié dans OpenStreetMap sur la commune de ${cityName}. Cela ne veut pas dire qu'il n'y en a pas : la carte est contributive, et les communes voisines peuvent en compter.`,
                  `No gym, street-workout spot, CrossFit box or climbing gym is mapped in OpenStreetMap within ${cityName}. That does not mean there are none: the map is crowd-sourced, and neighbouring towns may have some.`,
                )}
          </p>

          {total > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SPORT_SPOT_KINDS.map((k) => (
                <div key={k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                  <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{data.counts[k]}</div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    <span aria-hidden="true">{SPORT_SPOT_LABEL[k].emoji} </span>
                    {SPORT_SPOT_LABEL[k][locale]}
                  </div>
                </div>
              ))}
            </div>
          )}

          {SPORT_SPOT_KINDS.map((k) => {
            const list = data.spots.filter((s) => s.k === k);
            if (list.length === 0) return null;
            const head = list.slice(0, VISIBLE);
            const rest = list.slice(VISIBLE);
            return (
              <div key={k} className="mt-6">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  <span aria-hidden="true">{SPORT_SPOT_LABEL[k].emoji} </span>
                  {SPORT_SPOT_LABEL[k][locale]}
                  {data.counts[k] > list.length && (
                    <span className="ml-2 text-xs font-normal text-[var(--text-tertiary)]">
                      {t(`les ${list.length} plus proches du centre sur ${data.counts[k]}`, `the ${list.length} closest to the centre out of ${data.counts[k]}`)}
                    </span>
                  )}
                </h3>
                <ul className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4">
                  {head.map((s) => (
                    <SpotRow key={s.id} s={s} cityName={cityName} locale={locale} />
                  ))}
                </ul>
                {rest.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-[var(--accent)] hover:underline">
                      {t(`Voir les ${rest.length} autres`, `Show ${rest.length} more`)}
                    </summary>
                    <ul className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4">
                      {rest.map((s) => (
                        <SpotRow key={s.id} s={s} cityName={cityName} locale={locale} />
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })}

          <p className="mt-4 text-xs text-[var(--text-tertiary)]">
            {t("Données ", "Data ")}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">
              © {t("les contributeurs OpenStreetMap", "OpenStreetMap contributors")}
            </a>{" "}
            (ODbL), {t(`relevé du ${data.at}`, `collected ${data.at}`)}.{" "}
            {t(
              "Une salle manque ou a fermé ? Elle se corrige directement sur OpenStreetMap, et apparaîtra au prochain relevé.",
              "A gym missing or closed? Fix it directly on OpenStreetMap and it will show up at the next collection.",
            )}{" "}
            <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className="underline">
              {t("Contribuer sur OpenStreetMap", "Contribute on OpenStreetMap")}
            </a>
          </p>
        </>
      )}

      <h3 className="mt-8 text-base font-semibold text-[var(--text-primary)]">
        {t("Prochains rendez-vous sportifs", "Upcoming sports events")}
      </h3>
      {events.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {t(
            `Aucun événement sportif daté pour ${cityName} dans notre agenda pour l'instant. Vous organisez une course, un tournoi ou un match ? Signalez-le depuis `,
            `No dated sports event for ${cityName} in our calendar yet. Organising a race, a tournament or a match? Tell us from `,
          )}
          <Link href={agendaHref} className="text-[var(--accent)] hover:underline">
            {t("l'agenda de la ville", "the city calendar")}
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {events.map((e) => (
            <li key={e.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
              <div className="text-sm font-semibold text-[var(--accent)] first-letter:uppercase">{eventDateLabel(e, locale)}</div>
              <Link href={`${agendaHref}#${e.id}`} className="font-medium text-[var(--text-primary)] hover:underline">
                {locale === "fr" ? e.title : e.titleEn}
              </Link>
              <div className="text-xs text-[var(--text-tertiary)]">{e.venue}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
