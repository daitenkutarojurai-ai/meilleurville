// Minimal i18n. No external dependency.
//
// Usage:
//   import { t, type Locale } from "@/lib/i18n";
//   t("home.hero.title", "fr") // "Trouvez la ville qui vous ressemble"
//   t("home.hero.title", "en") // "Find the French city that fits you"
//
// Keys are typed via TranslationKey. Adding a key only in one locale is a
// TypeScript error (locales/en.ts is typed against TranslationDict from
// locales/fr.ts).

import { fr, type TranslationDict, type TranslationKey } from "@/locales/fr";
import { en } from "@/locales/en";

export type Locale = "fr" | "en";

export type { TranslationKey };

const DICTIONARIES: Record<Locale, TranslationDict> = { fr, en };

export const SUPPORTED_LOCALES: readonly Locale[] = ["fr", "en"];

export const DEFAULT_LOCALE: Locale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale | undefined) === "en"
    ? "en"
    : "fr";

export function isLocale(value: string): value is Locale {
  return value === "fr" || value === "en";
}

export function t(key: TranslationKey, locale: Locale = DEFAULT_LOCALE): string {
  return DICTIONARIES[locale][key] ?? DICTIONARIES.fr[key];
}

// Helpers used by the EN city pages — read the EN seo/description fields if
// present, otherwise compose a generic English template from city stats so
// we never ship a French string on the EN domain.
export function getCityTitle(
  city: { name: string; descriptionEn?: string; seoTitleEn?: string },
  locale: Locale,
): string {
  if (locale === "en") return city.seoTitleEn ?? `${city.name} — Quality of life, reviews & rankings 2026`;
  return `${city.name} — Avis habitants, qualité de vie & classements 2026`;
}

export function getCityDescription(
  city: {
    name: string;
    department: string | null;
    region: string | null;
    scores: { global: number };
    descriptionEn?: string;
    seoDescriptionEn?: string;
  },
  locale: Locale,
): string {
  if (locale === "en") {
    return (
      city.seoDescriptionEn ??
      `${city.name} (${city.department ?? ""}, ${city.region ?? ""}): quality-of-life score ${city.scores.global}/10. Resident reviews, neighbourhoods, local data.`
    );
  }
  return `${city.name} (${city.department}, ${city.region}) : score de qualité de vie ${city.scores.global}/10. Avis d'habitants, quartiers, données locales.`;
}

export function getCityBody(
  city: { name: string; descriptionEn?: string },
  locale: Locale,
): string | undefined {
  if (locale === "en") return city.descriptionEn;
  return undefined;
}

// Cross-domain origins for hreflang. The build-time env should reflect the
// canonical domain for the locale, but we expose both so the FR build can
// still emit the EN hreflang link (and vice versa).
export const ORIGIN_BY_LOCALE: Record<Locale, string> = {
  fr: process.env.NEXT_PUBLIC_BASE_URL_FR ?? "https://www.mavilleideale.fr",
  en: process.env.NEXT_PUBLIC_BASE_URL_EN ?? "https://bestcitiesinfrance.com",
};

// FR families whose EN counterpart shares the exact same slug (only the head
// segment differs). Guides are deliberately excluded — EN guides are native
// content with their own slugs, so there is no 1:1 hreflang pair.
const FR_TO_EN_SEGMENT: Record<string, string> = {
  villes: "cities",
  classements: "rankings",
  regions: "regions",
  departements: "departments",
  comparer: "compare",
  quiz: "quiz",
};

const EN_TO_FR_SEGMENT: Record<string, string> = Object.fromEntries(
  Object.entries(FR_TO_EN_SEGMENT).map(([fr, en]) => [en, fr])
);

// City sub-pages do NOT share their slug across locales: the EN twin of
// /villes/lyon/sante is /cities/lyon/healthcare, not /cities/lyon/sante.
// Translating only the head segment would advertise ~42 000 EN URLs that don't
// exist — worse than shipping no hreflang at all — so the full correspondence
// lives here. Derived from the two route trees (app/villes/[slug]/* and
// app/[locale]/cities/[slug]/*), 39 pairs, both sides generating the same 540
// city slugs (parcs/parks are gated on hasParksData on both sides, so their
// generated sets match too).
//
// `overview` (EN) has no FR entry on purpose: its FR counterpart is the city
// page itself, which already carries its own hreflang pair.
export const FR_TO_EN_CITY_SUB: Record<string, string> = {
  "a-faire": "things-to-do",
  agenda: "calendar",
  air: "air-quality",
  "avis-honnete": "honest-review",
  biodiversite: "biodiversity",
  bruit: "noise",
  climat: "climate",
  "climat-2040": "climate-2040",
  commerces: "retail",
  "connexion-internet": "internet-quality",
  "cout-de-la-vie": "cost-of-living",
  demographie: "demographics",
  eau: "water",
  ecoles: "schools",
  emploi: "employment",
  empreinte: "fingerprint",
  fiscalite: "tax",
  logement: "housing",
  "louer-ou-acheter": "own-vs-rent",
  "mentalite-locale": "local-mindset",
  parcs: "parks",
  "parent-solo": "single-parent",
  profils: "profiles",
  quartiers: "neighbourhoods",
  questions: "questions",
  risques: "natural-risks",
  "s-installer": "get-settled",
  saisons: "seasons",
  sante: "healthcare",
  securite: "safety",
  "services-publics": "public-services",
  sport: "sports-leisure",
  statistiques: "statistics",
  synthese: "synthesis",
  teletravail: "remote-work",
  "tension-locative": "rental-market",
  transports: "transport",
  velo: "cycling",
  vibe: "vibe",
};

const EN_TO_FR_CITY_SUB: Record<string, string> = Object.fromEntries(
  Object.entries(FR_TO_EN_CITY_SUB).map(([fr, en]) => [en, fr])
);

function langPair(frPath: string, enPath: string): Record<string, string> {
  return {
    "fr-FR": `${ORIGIN_BY_LOCALE.fr}${frPath}`,
    "en-US": `${ORIGIN_BY_LOCALE.en}${enPath}`,
    "x-default": `${ORIGIN_BY_LOCALE.fr}${frPath}`,
  };
}

// hreflang `alternates.languages` map for a FR route path, when an exact EN
// equivalent exists. Returns undefined for FR-only families so the page simply
// omits hreflang rather than advertising a non-existent EN URL.
export function hreflangLanguages(frPath: string): Record<string, string> | undefined {
  const segs = frPath.replace(/^\//, "").split("/");
  const enHead = FR_TO_EN_SEGMENT[segs[0]];
  if (!enHead) return undefined;
  const tail = segs.slice(1);
  if (segs[0] === "villes" && tail.length === 2) {
    const enSub = FR_TO_EN_CITY_SUB[tail[1]];
    if (!enSub) return undefined; // unknown sub-page: no hreflang beats a wrong one
    tail[1] = enSub;
  }
  return langPair(frPath, "/" + [enHead, ...tail].join("/"));
}

// Same, from an EN route path — for the reciprocal hreflang on EN pages.
export function hreflangLanguagesEn(enPath: string): Record<string, string> | undefined {
  const segs = enPath.replace(/^\//, "").split("/");
  const frHead = EN_TO_FR_SEGMENT[segs[0]];
  if (!frHead) return undefined;
  const tail = segs.slice(1);
  if (segs[0] === "cities" && tail.length === 2) {
    const frSub = EN_TO_FR_CITY_SUB[tail[1]];
    if (!frSub) return undefined; // e.g. /cities/lyon/overview — EN-only
    tail[1] = frSub;
  }
  return langPair("/" + [frHead, ...tail].join("/"), enPath);
}

// Ready-made `alternates` for a city sub-page: canonical + the hreflang pair.
// The canonical strings are exactly what the 79 sub-pages wrote by hand before
// (FR relative against metadataBase, EN absolute on the EN origin) — the whole
// point of the helper is that adding `languages` can no longer be forgotten,
// since Next replaces the layout's `alternates` object wholesale as soon as a
// page provides one.
export function cityAlternates(
  frSub: string,
  slug: string,
): { canonical: string; languages: Record<string, string> | undefined } {
  const frPath = `/villes/${slug}/${frSub}`;
  return { canonical: frPath, languages: hreflangLanguages(frPath) };
}

export function cityAlternatesEn(
  enSub: string,
  slug: string,
): { canonical: string; languages: Record<string, string> | undefined } {
  const enPath = `/cities/${slug}/${enSub}`;
  return { canonical: `${ORIGIN_BY_LOCALE.en}${enPath}`, languages: hreflangLanguagesEn(enPath) };
}
