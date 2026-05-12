export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";

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
    __html: JSON.stringify(obj),
  };
}
