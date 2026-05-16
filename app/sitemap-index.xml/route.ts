// Sitemap-index file at /sitemap-index.xml.
//
// Next 16's `generateSitemaps` (in app/sitemap.ts) only serves per-chunk
// files at /sitemap/<id>.xml — there is no auto-generated index at
// /sitemap.xml. This route hand-rolls a proper <sitemapindex> so a
// single URL covers every chunk in Search Console.
//
// The host in each <loc> is derived from the incoming request so the
// sitemap-index ALWAYS lists URLs on the same hostname as the index file.
// Google Search Console rejects cross-host sitemap entries silently
// ("Couldn't fetch"), and we previously got bitten by apex-vs-www and
// FR-vs-EN host mismatches. Trusting the request host removes that class
// of bug entirely.

import { GUIDES } from "@/data/guides";

const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as "fr" | "en";
// Must match the count of SITEMAP_CHUNKS in app/sitemap.ts (FR: 13, EN: 3)
const CHUNK_COUNT = DEFAULT_LOCALE === "en" ? 3 : 13;

function latestGuideUpdate(): string {
  const max = GUIDES.reduce((acc, g) => {
    const t = new Date(g.updatedAt).getTime();
    return t > acc ? t : acc;
  }, 0);
  return new Date(max || Date.now()).toISOString();
}

export function GET(request: Request) {
  const url = new URL(request.url);
  // Vercel sets x-forwarded-host/proto when the request crosses the edge —
  // prefer those so the emitted URL always reflects the public hostname.
  const host = request.headers.get("x-forwarded-host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const baseUrl = `${proto}://${host}`;

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
