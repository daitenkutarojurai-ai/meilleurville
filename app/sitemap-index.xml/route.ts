// Sitemap-index file at /sitemap-index.xml.
//
// Next 16's `generateSitemaps` (in app/sitemap.ts) only serves per-chunk
// files at /sitemap/<id>.xml — there is no auto-generated index at
// /sitemap.xml. This route hand-rolls a proper <sitemapindex> so a
// single URL covers every chunk in Search Console.
//
// The host in each <loc> is the static per-locale origin (ORIGIN_BY_LOCALE),
// matching the per-chunk files emitted by app/sitemap.ts. A static export has
// no incoming request to read the host from, so it must be derived at build
// time from NEXT_PUBLIC_DEFAULT_LOCALE — the same source the rest of the app
// uses for canonicals.

import { GUIDES } from "@/data/guides";
import { ORIGIN_BY_LOCALE, type Locale } from "@/lib/i18n";

const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as Locale;
// Must match the count of SITEMAP_CHUNKS in app/sitemap.ts (FR: 13, EN: 3)
const CHUNK_COUNT = DEFAULT_LOCALE === "en" ? 3 : 13;
const BASE_URL = ORIGIN_BY_LOCALE[DEFAULT_LOCALE];

function latestGuideUpdate(): string {
  const max = GUIDES.reduce((acc, g) => {
    const t = new Date(g.updatedAt).getTime();
    return t > acc ? t : acc;
  }, 0);
  return new Date(max || Date.now()).toISOString();
}

export const dynamic = "force-static";
export function GET() {
  const baseUrl = BASE_URL;
  const lastmod = latestGuideUpdate();
  const entries = Array.from({ length: CHUNK_COUNT })
    .map((_, i) => {
      return `  <sitemap>
    <loc>${baseUrl}/sitemap/${i}.xml</loc>
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
