import { MetadataRoute } from "next";

const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as "fr" | "en";
const FR_URL = process.env.NEXT_PUBLIC_BASE_URL_FR ?? "https://www.mavilleideale.fr";
const EN_URL = process.env.NEXT_PUBLIC_BASE_URL_EN ?? "https://bestcitiesinfrance.com";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? (DEFAULT_LOCALE === "en" ? EN_URL : FR_URL);

// Keep in sync with SITEMAP_CHUNKS in app/sitemap.ts (FR: 13 chunks incl.
// comparer-regions + calculator + gentrification; EN: 3).
const CHUNK_COUNT = DEFAULT_LOCALE === "en" ? 3 : 13;
const SITEMAP_INDEXES = Array.from({ length: CHUNK_COUNT }, (_, i) => i);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/favoris", "/dashboard"],
    },
    // Sitemap index + per-chunk URLs so crawlers can fetch them individually
    // (Google supports multiple Sitemap: lines and a parent index file).
    sitemap: [
      `${BASE_URL}/sitemap-index.xml`,
      ...SITEMAP_INDEXES.map((i) => `${BASE_URL}/sitemap/${i}.xml`),
    ],
  };
}
