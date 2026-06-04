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
  return langPair(frPath, "/" + [enHead, ...segs.slice(1)].join("/"));
}

// Same, from an EN route path — for the reciprocal hreflang on EN pages.
export function hreflangLanguagesEn(enPath: string): Record<string, string> | undefined {
  const segs = enPath.replace(/^\//, "").split("/");
  const frHead = EN_TO_FR_SEGMENT[segs[0]];
  if (!frHead) return undefined;
  return langPair("/" + [frHead, ...segs.slice(1)].join("/"), enPath);
}
