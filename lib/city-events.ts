// Lecture de `data/city-events.ts` : filtre « à venir », dates lisibles, JSON-LD.
// Serveur uniquement (les pages agenda sont statiques) — ne pas importer depuis
// un composant client.

import { CITY_EVENTS, type CityEvent } from "@/data/city-events";

const TZ = "Europe/Paris";

/** Date du jour à Paris, `YYYY-MM-DD`. Évaluée au build : la page est
 *  régénérée à chaque publication (2×/jour), un événement terminé tombe donc
 *  de la liste au plus tard à la publication suivante. */
function todayParis(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
}

const isDateOnly = (iso: string) => iso.length === 10;

/** Les 10 premiers caractères d'une date ISO avec décalage sont la date locale. */
const lastDay = (e: CityEvent) => (e.end ?? e.start).slice(0, 10);

export function upcomingCityEvents(citySlug: string, now = new Date()): CityEvent[] {
  const today = todayParis(now);
  return CITY_EVENTS.filter((e) => e.citySlug === citySlug && lastDay(e) >= today).sort((a, b) =>
    a.start.localeCompare(b.start),
  );
}

/** Événements sportifs à venir d'une ville (agenda et sous-page sport). */
export function upcomingSportEvents(citySlug: string, now = new Date()): CityEvent[] {
  return upcomingCityEvents(citySlug, now).filter((e) => e.kind === "sport");
}

function fmtDay(iso: string, locale: "fr" | "en", withYear: boolean): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    timeZone: isDateOnly(iso) ? "UTC" : TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(new Date(iso));
}

function fmtTime(iso: string, locale: "fr" | "en"): string | null {
  if (isDateOnly(iso)) return null;
  const parts = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" })
    .formatToParts(new Date(iso));
  const h = String(Number(parts.find((p) => p.type === "hour")?.value));
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  if (locale === "fr") return m === "00" ? `${h} h` : `${h} h ${m}`;
  return `${h}:${m}`;
}

/** « dimanche 8 novembre 2026 · 15 h » / « du samedi 5 au mardi 8 décembre 2026 ». */
export function eventDateLabel(e: CityEvent, locale: "fr" | "en"): string {
  const time = fmtTime(e.start, locale);
  if (!e.end || e.end.slice(0, 10) === e.start.slice(0, 10)) {
    const day = fmtDay(e.start, locale, true);
    return time ? `${day} · ${time}` : day;
  }
  const from = fmtDay(e.start, locale, e.start.slice(0, 4) !== e.end.slice(0, 4));
  const to = fmtDay(e.end, locale, true);
  return locale === "fr" ? `du ${from} au ${to}` : `${from} to ${to}`;
}

/** Pavé de date compact : jour + mois abrégé du premier jour. */
export function eventDateBadge(e: CityEvent, locale: "fr" | "en"): { day: string; month: string } {
  const d = new Date(e.start);
  const timeZone = isDateOnly(e.start) ? "UTC" : TZ;
  const loc = locale === "fr" ? "fr-FR" : "en-GB";
  return {
    day: new Intl.DateTimeFormat(loc, { timeZone, day: "numeric" }).format(d),
    month: new Intl.DateTimeFormat(loc, { timeZone, month: "short" }).format(d).replace(".", ""),
  };
}

export function cityEventsJsonLd(events: CityEvent[], cityName: string, locale: "fr" | "en") {
  return events.map((e) => ({
    "@context": "https://schema.org",
    "@type": e.kind === "sport" ? "SportsEvent" : "Event",
    name: locale === "fr" ? e.title : e.titleEn,
    description: locale === "fr" ? e.body : e.bodyEn,
    startDate: e.start,
    ...(e.end ? { endDate: e.end } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: e.venue,
      address: e.address ?? `${cityName}, France`,
    },
    organizer: { "@type": "Organization", name: e.organizer },
    ...(e.free ? { isAccessibleForFree: true } : {}),
    ...(e.url ? { url: e.url } : {}),
  }));
}
