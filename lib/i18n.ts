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
  // Les paires département sont construites avec le même `deptToSlug` des deux
  // côtés : `rhone-vs-isere` est identique en FR et en EN, seule la tête change.
  "comparer-departements": "compare-departments",
  quiz: "quiz",
};

const EN_TO_FR_SEGMENT: Record<string, string> = Object.fromEntries(
  Object.entries(FR_TO_EN_SEGMENT).map(([fr, en]) => [en, fr])
);

/**
 * Correspondance complète des **têtes de route** FR → EN.
 *
 * `FR_TO_EN_SEGMENT` au-dessus ne liste que les familles dont le slug est
 * partagé, parce que c'est tout ce dont le hreflang a besoin. Cette table-ci
 * est plus large : elle couvre toutes les têtes des deux arbres, y compris
 * celles dont les slugs divergent, et sert à ce qui raisonne sur les routes
 * plutôt que sur les paires — la redirection FR→EN du Worker et le contrôle de
 * parité (`npm run parity`).
 *
 * Une tête absente ici est signalée par le contrôle de parité comme non
 * mappée : c'est volontaire, on préfère un rapport bruyant à un mappage
 * silencieusement faux. Les exceptions assumées (FR-only ou EN-only) se
 * déclarent dans `PARITY_EXCEPTIONS`, pas ici.
 */
export const FR_TO_EN_ROUTE: Record<string, string> = {
  ...FR_TO_EN_SEGMENT,
  "a-propos": "about",
  avis: "reviews",
  "cadre-de-vie": "quality-of-life",
  "calculateur-cout-reel": "calculator/real-cost",
  "calendrier-immobilier": "property-calendar",
  carte: "map",
  cgu: "terms",
  "climat-2040-timelapse": "climate-2040-timelapse",
  commerces: "retail-coverage",
  "comparer-regions": "compare-regions",
  confidentialite: "privacy-policy",
  connexion: "login",
  "cout-menage": "household-cost",
  demographie: "demographics",
  depuis: "weekend-getaways",
  "depuis-paris": "from-paris",
  donnees: "data-sources",
  emploi: "employment",
  environnement: "environment",
  "expat-retour": "expat-return",
  favoris: "favorites",
  gentrification: "gentrification",
  glossaire: "glossary",
  guides: "guides",
  internet: "internet-quality",
  leaderboard: "leaderboard",
  "louer-ou-acheter": "own-vs-rent",
  "macro-region": "geographic-zones",
  "mentions-legales": "legal-notice",
  "mes-villes": "my-cities",
  methode: "methodology",
  "orientation-politique": "political-leaning",
  "ou-vont-les-gens": "moving-from",
  outils: "tools",
  palmares: "overall-ranking",
  parcs: "parks",
  "parent-solo": "single-parent",
  "portraits-types": "community-profiles",
  "pour-qui": "for-who",
  presse: "press",
  quitter: "leaving",
  "quiz-compatibilite": "quiz/compatibility",
  recherche: "search",
  "red-flags": "red-flags",
  risques: "natural-risks",
  "salaire-equivalent": "salary-equivalent",
  sante: "healthcare",
  securite: "safety",
  "services-publics": "public-services",
  "simulateur-achat": "simulator/purchase",
  sommaire: "site-index",
  sport: "sport",
  synthese: "synthesis",
  tags: "tags",
  "tension-locative": "rental-tension",
  vacances: "vacations",
  velo: "cycling",
  "villes-qui-grandissent": "cheapest-cities",
  "vivre-avec": "living-on",
  // Sous-segments : mêmes familles, vocabulaire traduit.
  activite: "activity",
  mois: "month",
  profil: "profile",
  personnaliser: "customise",
  // Têtes identiques des deux côtés. Listées explicitement plutôt que traitées
  // par défaut : sans entrée, le contrôle de parité les signale « non mappées »,
  // ce qui est le bon comportement pour une tête qu'on a oublié de déclarer.
  about: "about",
  "city-match": "city-match",
  contact: "contact",
  copilot: "copilot",
  faq: "faq",
  "future-you": "future-you",
  "people-like-you": "people-like-you",
  "projection-5ans": "projection-5ans",
  vibe: "vibe",
};

/**
 * Routes assumées comme n'existant que d'un côté, avec la raison.
 *
 * Le contrôle de parité les exclut du rapport. Toute autre asymétrie remonte
 * comme un écart à combler — c'est le point : la liste des exceptions doit
 * rester courte et argumentée, sinon « parité » ne veut plus rien dire.
 */
export const PARITY_EXCEPTIONS: Record<string, string> = {
  // FR-only
  badge: "R13.1 — la motion backlink vise mairies et offices de tourisme français ; sans objet pour l'audience expat.",
  auth: "Surface de compte, pas de contenu indexable.",
  dashboard: "Surface de compte.",
  "mes-villes": "Surface de compte.",
  favoris: "Surface de compte.",
  connexion: "Surface de compte.",
  // EN-only
  "best-value-cities": "Angle expat sans équivalent FR direct (le FR passe par /classements).",
  "my-account": "Surface de compte.",
  "sign-in": "Surface de compte.",
  "niche-rankings": "Regroupement EN des classements de niche ; côté FR ils vivent sous /classements.",
};

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
