import { GUIDES } from "@/data/guides";
import { EN_GUIDES } from "@/data/guides-en";

const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as "fr" | "en";
const IS_EN = DEFAULT_LOCALE === "en";
const FR_URL = "https://www.mavilleideale.fr";
const EN_URL = "https://www.bestcitiesinfrance.com";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? (IS_EN ? EN_URL : FR_URL);

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const dynamic = "force-static";
export async function GET() {
  if (IS_EN) {
    const sorted = [...EN_GUIDES].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const items = sorted
      .map((g) => {
        const url = `${BASE_URL}/guides/${g.slug}`;
        return `    <item>
      <title>${escapeXml(g.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(g.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(g.intro)}</description>
      <category>${escapeXml(g.category)}</category>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Best Cities in France — Guides</title>
    <link>${BASE_URL}/guides</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Honest, data-backed guides on where to live in France for expats and movers.</description>
    <language>en</language>
    <lastBuildDate>${new Date(sorted[0].updatedAt).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }

  const sorted = [...GUIDES].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const items = sorted
    .map((g) => {
      const url = `${BASE_URL}/guides/${g.slug}`;
      return `    <item>
      <title>${escapeXml(g.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(g.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(g.intro)}</description>
      <category>${escapeXml(g.category)}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MaVilleIdeal — Guides</title>
    <link>${BASE_URL}/guides</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Guides MaVilleIdeal — où vivre en France, sans bullshit, données à l'appui.</description>
    <language>fr-FR</language>
    <lastBuildDate>${new Date(sorted[0].updatedAt).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
