import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";

// Keep in sync with SITEMAP_CHUNKS in app/sitemap.ts.
// The values here are the chunk indexes (0..N-1), one per generated
// sitemap file: /sitemap/0.xml ... /sitemap/8.xml.
const SITEMAP_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

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
