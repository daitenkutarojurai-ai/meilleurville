// L'origine se déduit de la locale du build, comme dans `app/layout.tsx`,
// `app/sitemap.ts`, `app/robots.ts` et les deux flux RSS. Ce module était le
// **seul** à retomber en dur sur le domaine FR : `npm run build:en` ne diffère
// de `npm run build` que par `NEXT_PUBLIC_DEFAULT_LOCALE`, donc une valeur
// unique de `NEXT_PUBLIC_BASE_URL` ne peut pas être juste pour les deux
// exports. Conséquence, jusqu'au 2026-09-05 : chaque `BreadcrumbList` des
// pages EN annonçait `https://www.mavilleideale.fr/cities/...`, une URL qui
// n'existe pas sur le domaine FR — des données structurées inter-domaines
// pointant sur des 404, sur 91 fichiers de `app/[locale]/`. Le canonical, lui,
// était juste (il passe par `ORIGIN_BY_LOCALE` de `lib/i18n.ts`), ce qui est
// exactement pourquoi le garde-fou de déploiement `check-deploy-locale.mjs`
// ne pouvait pas le voir. Ne pas re-figer ce repli sur un domaine.
const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as
  | "fr"
  | "en";
const FR_URL = process.env.NEXT_PUBLIC_BASE_URL_FR ?? "https://www.mavilleideale.fr";
const EN_URL = process.env.NEXT_PUBLIC_BASE_URL_EN ?? "https://bestcitiesinfrance.com";

export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? (DEFAULT_LOCALE === "en" ? EN_URL : FR_URL);

export function breadcrumbJsonLd(
  parts: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: parts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      item: `${SITE_URL}${p.path}`,
    })),
  };
}

export function jsonLdScript(obj: unknown) {
  return {
    // <-escape so a "</script>" inside any data string can't break out
    // of the inline script block.
    __html: JSON.stringify(obj).replace(/</g, "\\u003c"),
  };
}

export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
