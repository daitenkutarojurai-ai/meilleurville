// Sitemap-index file at /sitemap-index.xml.
//
// Next 16's `generateSitemaps` (in app/sitemap.ts) only serves per-chunk
// files at /sitemap/<id>.xml — there is no auto-generated index at
// /sitemap.xml. This route hand-rolls a proper <sitemapindex> so a
// single URL covers every chunk in Search Console.

import { GUIDES } from "@/data/guides";

const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as "fr" | "en";
const FR_URL = process.env.NEXT_PUBLIC_BASE_URL_FR ?? "https://mavilleideale.fr";
const EN_URL = process.env.NEXT_PUBLIC_BASE_URL_EN ?? "https://bestcitiesinfrance.com";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? (DEFAULT_LOCALE === "en" ? EN_URL : FR_URL);
// Must match the count of SITEMAP_CHUNKS in app/sitemap.ts (FR: 13, EN: 3)
const CHUNK_COUNT = DEFAULT_LOCALE === "en" ? 3 : 13;

function latestGuideUpdate(): string {
  const max = GUIDES.reduce((acc, g) => {
    const t = new Date(g.updatedAt).getTime();
    return t > acc ? t : acc;
  }, 0);
  return new Date(max || Date.now()).toISOString();
}

export function GET() {
  const lastmod = latestGuideUpdate();
  const entries = Array.from({ length: CHUNK_COUNT })
    .map((_, i) => {
      return `  <sitemap>
    <loc>${BASE_URL}/sitemap/${i}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
