// F64 — accessor over the public-signal feed shown on city profiles.
//
// The data comes from `scripts/city-news.mjs`, which queries three official
// open-data sources per commune (BODACC, RNA/JO Associations, Géorisques
// CatNat) and writes data/city-news.json in batches. Until the crawl covers a
// slug, every accessor here returns null/empty and the surface renders
// NOTHING — see the "no filler" rule below.
//
// ── What this is, and what it is deliberately not ────────────────────────
//
// It is not press. Reproducing regional-press headlines falls under the French
// publishers' neighbouring right (loi 2019-775) and Google News RSS forbids
// reuse in its terms; neither is touched here, and rewording an article with an
// LLM would not remove the right — it would only add a factual error signed by
// us. Phase 1 is official open data only, where the licence is unambiguous.
//
// It is not a verdict either. A company creation is not good news and a
// deregistration is not bad news: both are counts of legal filings, and a city
// with many of each is simply a city where things move. Nothing here ranks,
// scores or comments — the surface states what the number is and who published
// it.
//
// ── Two windows, on purpose ──────────────────────────────────────────────
//
// Entries are pruned at crawl time (12 months, 8 per city) AND filtered again
// at read time against the build date. The second pass is what protects us when
// the weekly refresh routine breaks: a JSON committed 14 months ago yields zero
// in-window entries, so the section disappears instead of presenting stale
// filings as current. `NEWS_REFRESHED_AT` / `isNewsStale()` let the surface say
// when it last managed to refresh rather than pretending it just did.
//
// Licence is carried per ENTRY, not per file: the three sources are all Licence
// Ouverte today, but the schema must not assume the fourth one will be.
import RAW from "@/data/city-news.json";

/** Signal families. Deliberately coarse — this is not a taxonomy of events,
 *  it is the set of things official open data can tell us about a commune. */
export type NewsKind =
  /** BODACC — business registrations, monthly count. */
  | "entreprises"
  /** BODACC — deregistrations (radiations), monthly count. */
  | "radiations"
  /** BODACC — insolvency proceedings, monthly count. */
  | "procedures"
  /** RNA / JO Associations — association creations, monthly count. */
  | "associations"
  /** Géorisques — a single natural-disaster order (arrêté CatNat). */
  | "catnat";

export interface CityNewsEntry {
  /** ISO date, YYYY-MM-DD. For a monthly aggregate: the first of the month. */
  date: string;
  kind: NewsKind;
  /** Plain factual sentence, built by the pipeline from counted rows. Never an
   *  editorial headline and never a reproduced press title. French. */
  title: string;
  /** The English twin, composed by the pipeline from the SAME count — so the
   *  two locales cannot state different figures for one city, which is the
   *  hreflang rule in CLAUDE.md. Optional: rows written before this existed
   *  fall back to `title`, and the EN page then shows French rather than
   *  nothing. For a CatNat order only the frame is English; the risk label
   *  stays the French wording of the administrative act. */
  titleEn?: string;
  /** Publisher, as displayed: "BODACC", "Journal officiel des associations"… */
  source: string;
  /** Landing page for the underlying record — outbound, rel="nofollow". */
  sourceUrl: string;
  /** e.g. "Licence Ouverte / Etalab". Per entry: sources may diverge later. */
  licence: string;
}

export interface CityNewsRecord {
  /** Last successful refresh for THIS city, ISO date. */
  refreshedAt: string;
  /** Which of the three ingests actually answered for this city. A row with a
   *  missing source is partial, not empty — the difference matters when a
   *  city shows only CatNat orders because BODACC timed out. */
  sources: string[];
  entries: CityNewsEntry[];
}

export interface CityNewsFile {
  meta: {
    /** Last date any city in the file was refreshed. */
    refreshedAt: string | null;
    queryVersion: number;
    windowMonths: number;
    maxEntriesPerCity: number;
  };
  cities: Record<string, CityNewsRecord>;
}

const FILE = RAW as unknown as CityNewsFile;
const CITIES = FILE.cities ?? {};

/** Rolling window, in months. Anything older is dropped at read time. */
export const NEWS_WINDOW_MONTHS = FILE.meta?.windowMonths ?? 12;
export const NEWS_MAX_ENTRIES = FILE.meta?.maxEntriesPerCity ?? 8;
/** Date of the last successful refresh, or null if nothing was ever crawled. */
export const NEWS_REFRESHED_AT: string | null = FILE.meta?.refreshedAt ?? null;
export const NEWS_CRAWLED_SLUGS = Object.keys(CITIES);
export const NEWS_CITY_COUNT = NEWS_CRAWLED_SLUGS.length;

/**
 * Beyond this, the surface must say "last successful refresh" instead of
 * "updated".
 *
 * It is deliberately much looser than the crawler's DUE_AFTER_DAYS (14), so it
 * cannot fire while a city is merely waiting its turn. A threshold of 21 days
 * would label cities stale for being on schedule, which trains readers to
 * ignore the warning on the day it matters.
 *
 * The margin is larger than intended, though, and the arithmetic that set it
 * was wrong: it assumed ~180 cities per WEEKLY run, hence a rotation of about
 * three weeks. The collector actually runs twice a day (~360 cities/day), and
 * the file bears that out — all 540 cities were first collected across two
 * consecutive days. So a healthy row is never older than DUE_AFTER_DAYS plus
 * one ~2-day sweep, i.e. ~16 days, and 45 is roughly three healthy cycles
 * rather than the two it was described as. Loose, not wrong: it still never
 * fires on a working pipeline, it just takes six weeks to notice a dead one.
 * Tightening it towards ~30 is a separate, deliberate change.
 */
const STALE_AFTER_DAYS = 45;

function daysBetween(from: string, to: Date): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  if (Number.isNaN(a)) return Number.POSITIVE_INFINITY;
  return Math.floor((to.getTime() - a) / 86_400_000);
}

/** True when the refresh routine has visibly stopped keeping the FILE current.
 *  Callers should keep rendering the (still in-window) entries and add the
 *  refresh date, rather than hide data that is merely not fresh. */
export function isNewsStale(now: Date = new Date()): boolean {
  if (!NEWS_REFRESHED_AT) return true;
  return daysBetween(NEWS_REFRESHED_AT, now) > STALE_AFTER_DAYS;
}

/**
 * True when THIS city's row has gone stale — which is the one a city page
 * should ask about. The file-level date only says some city was refreshed
 * recently; under the rotation that can be true while this particular commune
 * has not been looked at in months.
 */
export function isCityNewsStale(slug: string, now: Date = new Date()): boolean {
  const at = cityNewsRefreshedAt(slug);
  if (!at) return true;
  return daysBetween(at, now) > STALE_AFTER_DAYS;
}

/** Age of the data in days, or null when nothing was ever crawled. */
export function newsAgeDays(now: Date = new Date()): number | null {
  if (!NEWS_REFRESHED_AT) return null;
  return daysBetween(NEWS_REFRESHED_AT, now);
}

/** True the moment the crawl has run for a slug — even if every source came
 *  back empty. Distinguishes "not crawled yet" from "crawled, nothing to say". */
export function hasCityNews(slug: string): boolean {
  return slug in CITIES;
}

/** Last successful refresh for one city, or null if never crawled. */
export function cityNewsRefreshedAt(slug: string): string | null {
  return CITIES[slug]?.refreshedAt ?? null;
}

function cutoffISO(now: Date, months: number): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}

/**
 * In-window entries for a city, most recent first, capped.
 *
 * Returns [] both when the city was never crawled and when everything it has
 * fell out of the window. The surface treats the two identically — it renders
 * nothing — which is the point: an empty "Aucune actualité" block on 300 cities
 * would be worse than no block at all.
 *
 * Entries dated in the future are dropped. A source that publishes an order
 * with a forward date would otherwise sit permanently at the top of the list.
 */
export function cityNews(
  slug: string,
  opts: { now?: Date; limit?: number; windowMonths?: number } = {},
): CityNewsEntry[] {
  const rec = CITIES[slug];
  if (!rec || !Array.isArray(rec.entries)) return [];
  const now = opts.now ?? new Date();
  const cutoff = cutoffISO(now, opts.windowMonths ?? NEWS_WINDOW_MONTHS);
  const today = now.toISOString().slice(0, 10);
  return rec.entries
    .filter((e) => e.date >= cutoff && e.date <= today)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, opts.limit ?? NEWS_MAX_ENTRIES);
}

/** Which ingests answered for this city. Empty array when never crawled. */
export function cityNewsSources(slug: string): string[] {
  return CITIES[slug]?.sources ?? [];
}

/** Kinds that are a count over a calendar month, as opposed to a dated act. */
const AGGREGATE_KINDS: ReadonlySet<NewsKind> = new Set<NewsKind>([
  "entreprises",
  "radiations",
  "procedures",
  "associations",
]);

function lastDayOfMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

/**
 * When a monthly aggregate was counted before its month was over, the ISO date
 * the count stopped at. `null` when the figure covers a whole month.
 *
 * This is not an edge case, it is the normal state of the freshest line. The
 * crawler buckets BODACC rows on `dateparution`, so the bucket for the month it
 * runs in only holds the days already elapsed — and the round-robin puts that
 * bucket at the top of the list, right above the same metric for the previous
 * month. Found on the first real crawl (540/540, 2026-08-11): Paris read "567
 * créations d'entreprises en août 2026" over "5356 en juillet 2026", which is a
 * 90 % collapse to anyone scanning the column, and was four days of August. The
 * median current-month bucket sits at 0.16 of the previous month across the 895
 * comparable pairs in the file.
 *
 * Both numbers are exact; it is the invitation to compare them that misleads,
 * so the fix is to mark the figure rather than drop it. Dropping would cost the
 * section its freshest signal without recovering anything: the crawler already
 * capped the city at 8 entries, so the complete month the partial one displaced
 * is not in the file to fall back on. A marked partial also self-heals — the
 * next refresh that lands in a later month rewrites the bucket as a full month.
 *
 * The cut-off returned is the day WE counted, never a claim about how far
 * BODACC had published by then: the publisher's own lag is unknown here, and
 * the per-family spread on the same day (Paris August held 10.6 % of July's
 * registrations but 1.0 % of its insolvencies) shows it is not uniform.
 */
export function newsPartialThrough(slug: string, entry: CityNewsEntry): string | null {
  if (!AGGREGATE_KINDS.has(entry.kind)) return null;
  const refreshedAt = cityNewsRefreshedAt(slug);
  if (!refreshedAt) return null;
  const e = /^(\d{4})-(\d{2})-\d{2}$/.exec(entry.date);
  const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(refreshedAt);
  if (!e || !r) return null;
  // Same calendar month as the crawl, and the crawl did not run on its last day.
  if (e[1] !== r[1] || e[2] !== r[2]) return null;
  if (Number(r[3]) >= lastDayOfMonth(Number(r[1]), Number(r[2]))) return null;
  return refreshedAt;
}

const KIND_LABEL_FR: Record<NewsKind, string> = {
  entreprises: "Créations d'entreprises",
  radiations: "Radiations",
  procedures: "Procédures collectives",
  associations: "Associations créées",
  catnat: "Arrêté catastrophe naturelle",
};
const KIND_LABEL_EN: Record<NewsKind, string> = {
  entreprises: "Business registrations",
  radiations: "Deregistrations",
  procedures: "Insolvency proceedings",
  associations: "Associations created",
  catnat: "Natural-disaster order",
};

export function newsKindLabel(kind: NewsKind, locale: "fr" | "en" = "fr"): string {
  return (locale === "en" ? KIND_LABEL_EN : KIND_LABEL_FR)[kind];
}

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "12 mars 2026" / "12 March 2026". Returns the raw string if unparseable —
 *  never throws on a malformed row, never invents a date. */
export function newsDateLabel(iso: string, locale: "fr" | "en" = "fr"): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const name = (locale === "en" ? MONTHS_EN : MONTHS_FR)[Number(mo) - 1];
  if (!name) return iso;
  return `${Number(d)} ${name} ${y}`;
}

/** Month-granular label, for the aggregate entries dated to the 1st. */
export function newsMonthLabel(iso: string, locale: "fr" | "en" = "fr"): string {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(iso);
  if (!m) return iso;
  const name = (locale === "en" ? MONTHS_EN : MONTHS_FR)[Number(m[2]) - 1];
  if (!name) return iso;
  return `${name} ${m[1]}`;
}
