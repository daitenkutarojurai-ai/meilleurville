/**
 * Weekly newsletter content — the "lettre du dimanche" / "Sunday letter".
 *
 * buildNewsletter(locale) returns { subject, html } assembled from live site
 * data (CITIES_SEED, RANKING_META, GUIDES). The featured items rotate
 * deterministically by ISO week, so every Sunday is different and nothing is
 * ever invented — each pick is a real, existing page on the site.
 *
 * FR and EN get different bodies on purpose: FR leans on its rankings + 360
 * guides; EN leans on the city pages + quiz that the English build actually
 * ships today. No French string ever lands in the EN letter.
 */
import { CITIES_SEED } from "@/data/cities-seed";
import { GUIDES } from "@/data/guides";
import { RANKING_META, getRankedCities, type RankingSlug } from "@/lib/rankings";
import { ORIGIN_BY_LOCALE, type Locale } from "@/lib/i18n";

// The seed records carry slug/name/region/scores but not the full City type
// (no id/reviewCount) — work off the inferred element type.
type SeedCity = (typeof CITIES_SEED)[number];

// --- deterministic weekly rotation -----------------------------------------

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

/** Monotone week counter so picks advance every week and never reset yearly. */
function weekRotation(d: Date): number {
  return d.getUTCFullYear() * 53 + isoWeek(d);
}

// --- pick helpers -----------------------------------------------------------

// Featured cities are drawn from the strongest 90 — a random low-scored city
// every week would not make a good "city of the week".
const TOP_POOL: SeedCity[] = [...CITIES_SEED]
  .sort((a, b) => b.scores.global - a.scores.global)
  .slice(0, 90);

const AXES = [
  "life", "transport", "nature", "cost",
  "safety", "culture", "remoteWork", "schools",
] as const;
type Axis = (typeof AXES)[number];

const AXIS_LABEL: Record<Locale, Record<Axis, string>> = {
  fr: {
    life: "art de vivre", transport: "transports", nature: "nature",
    cost: "coût de la vie", safety: "sécurité", culture: "culture",
    remoteWork: "télétravail", schools: "écoles",
  },
  en: {
    life: "quality of life", transport: "transport", nature: "nature",
    cost: "affordability", safety: "safety", culture: "culture",
    remoteWork: "remote work", schools: "schools",
  },
};

function bestAxis(city: SeedCity): Axis {
  return AXES.reduce((best, a) => (city.scores[a] > city.scores[best] ? a : best), AXES[0]);
}

function fmt(n: number): string {
  return n.toFixed(1);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Trim a description to a word boundary so blurbs stay one or two lines. */
function trimDesc(s: string, max = 150): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).trimEnd() + "…";
}

// --- HTML (inline styles — email clients ignore <style> blocks) ------------

const ACCENT = "#16a34a";
const FONT = "-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif";

function block(opts: {
  eyebrow: string;
  title: string;
  href: string;
  blurb: string;
  cta: string;
}): string {
  return `
  <tr><td style="padding:0 0 14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e7e5e0;border-radius:14px;">
      <tr><td style="padding:20px 22px;">
        <div style="font:600 11px/1 ${FONT};letter-spacing:1.5px;text-transform:uppercase;color:${ACCENT};">${opts.eyebrow}</div>
        <a href="${opts.href}" style="display:block;margin:8px 0 6px;font:700 19px/1.3 ${FONT};color:#1a1a1a;text-decoration:none;">${opts.title}</a>
        <div style="font:400 14px/1.55 ${FONT};color:#57534e;">${opts.blurb}</div>
        <a href="${opts.href}" style="display:inline-block;margin-top:12px;font:600 13px/1 ${FONT};color:${ACCENT};text-decoration:none;">${opts.cta} &rarr;</a>
      </td></tr>
    </table>
  </td></tr>`;
}

function shell(opts: {
  locale: Locale;
  heading: string;
  dateline: string;
  preheader: string;
  blocks: string;
}): string {
  const brand = opts.locale === "fr" ? "MeilleurVille" : "BestCitiesInFrance";
  const origin = ORIGIN_BY_LOCALE[opts.locale];
  const footerTag =
    opts.locale === "fr"
      ? "Vous recevez cette lettre car vous vous êtes inscrit sur MeilleurVille."
      : "You are receiving this letter because you subscribed on BestCitiesInFrance.";
  const unsub = opts.locale === "fr" ? "Se désabonner" : "Unsubscribe";
  return `<!doctype html>
<html lang="${opts.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f6f4;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f4;">
<tr><td align="center" style="padding:28px 14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
  <tr><td style="padding:0 4px 18px;">
    <div style="font:800 22px/1 ${FONT};color:#1a1a1a;">${brand}</div>
    <div style="margin-top:7px;font:600 13px/1 ${FONT};color:${ACCENT};">${esc(opts.heading)}</div>
    <div style="margin-top:4px;font:400 12px/1 ${FONT};color:#9ca3af;">${esc(opts.dateline)}</div>
  </td></tr>
  ${opts.blocks}
  <tr><td style="padding:18px 6px 0;font:400 11px/1.6 ${FONT};color:#9ca3af;">
    ${esc(footerTag)}<br>
    <a href="${origin}" style="color:#9ca3af;">${origin.replace(/^https?:\/\//, "")}</a>
    &nbsp;&middot;&nbsp;
    <a href="{{ unsubscribe }}" style="color:#9ca3af;">${unsub}</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// --- public API -------------------------------------------------------------

/** Build the Sunday letter for one locale. `now` is injectable for tests. */
export function buildNewsletter(
  locale: Locale,
  now: Date = new Date(),
): { subject: string; html: string } {
  const rot = weekRotation(now);
  const origin = ORIGIN_BY_LOCALE[locale];
  const dateline = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const city = TOP_POOL[rot % TOP_POOL.length];
  const axis = bestAxis(city);
  const blocks: string[] = [];

  if (locale === "fr") {
    blocks.push(
      block({
        eyebrow: "Ville de la semaine",
        title: `${esc(city.name)} — ${fmt(city.scores.global)}/10`,
        href: `${origin}/villes/${city.slug}`,
        blurb: `${esc(city.region ?? "France")}. Son point fort cette semaine : ${AXIS_LABEL.fr[axis]} (${fmt(city.scores[axis])}/10).`,
        cta: "Voir la fiche",
      }),
    );

    const rankingSlugs = Object.keys(RANKING_META) as RankingSlug[];
    const rSlug = rankingSlugs[rot % rankingSlugs.length];
    const meta = RANKING_META[rSlug];
    const leader = getRankedCities(rSlug)[0];
    blocks.push(
      block({
        eyebrow: "Classement à la une",
        title: esc(meta.headline),
        href: `${origin}/classements/${rSlug}`,
        blurb: leader
          ? `En tête actuellement : ${esc(leader.city.name)}. ${esc(trimDesc(meta.description))}`
          : esc(trimDesc(meta.description)),
        cta: "Voir le classement",
      }),
    );

    const guide = GUIDES[(rot * 7) % GUIDES.length];
    blocks.push(
      block({
        eyebrow: "Guide de la semaine",
        title: esc(guide.title),
        href: `${origin}/guides/${guide.slug}`,
        blurb: `${guide.readMinutes} min de lecture. ${esc(trimDesc(guide.metaDesc))}`,
        cta: "Lire le guide",
      }),
    );

    return {
      subject: `Cette semaine : ${city.name} et nos classements`,
      html: shell({
        locale,
        heading: "La lettre du dimanche",
        dateline,
        preheader: `${city.name}, ${meta.label} et un guide à lire`,
        blocks: blocks.join(""),
      }),
    };
  }

  // EN — cities + quiz only (the EN build ships those today, not /guides).
  const city2 = TOP_POOL[(rot + 37) % TOP_POOL.length];
  const axis2 = bestAxis(city2);
  blocks.push(
    block({
      eyebrow: "City of the week",
      title: `${esc(city.name)} — ${fmt(city.scores.global)}/10`,
      href: `${origin}/cities/${city.slug}`,
      blurb: `${esc(city.region ?? "France")}. Strongest this week on ${AXIS_LABEL.en[axis]} (${fmt(city.scores[axis])}/10).`,
      cta: "See the city",
    }),
  );
  blocks.push(
    block({
      eyebrow: "Also worth a look",
      title: `${esc(city2.name)} — ${fmt(city2.scores.global)}/10`,
      href: `${origin}/cities/${city2.slug}`,
      blurb: `${esc(city2.region ?? "France")}. A strong pick for ${AXIS_LABEL.en[axis2]} (${fmt(city2.scores[axis2])}/10).`,
      cta: "See the city",
    }),
  );
  blocks.push(
    block({
      eyebrow: "Not sure where to start?",
      title: "Find the French city that fits you",
      href: `${origin}/quiz`,
      blurb:
        "Ten questions, two minutes, and a shortlist of cities matched to how you actually want to live.",
      cta: "Take the quiz",
    }),
  );

  return {
    subject: `This week: ${city.name}, plus a city-match quiz`,
    html: shell({
      locale,
      heading: "The Sunday letter",
      dateline,
      preheader: `${city.name}, ${city2.name} and a 2-minute quiz`,
      blocks: blocks.join(""),
    }),
  };
}
