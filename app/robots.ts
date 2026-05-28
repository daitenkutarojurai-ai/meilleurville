import { MetadataRoute } from "next";
import { SITEMAP_CHUNK_COUNT } from "./sitemap";

const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as "fr" | "en";
const FR_URL = process.env.NEXT_PUBLIC_BASE_URL_FR ?? "https://www.mavilleideale.fr";
const EN_URL = process.env.NEXT_PUBLIC_BASE_URL_EN ?? "https://bestcitiesinfrance.com";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? (DEFAULT_LOCALE === "en" ? EN_URL : FR_URL);

// Chunk count derived from app/sitemap.ts so every chunk generateSitemaps
// emits is advertised here — no manual drift (FR: 16 chunks, EN: 8).
const SITEMAP_INDEXES = Array.from({ length: SITEMAP_CHUNK_COUNT }, (_, i) => i);

export const dynamic = "force-static";

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
