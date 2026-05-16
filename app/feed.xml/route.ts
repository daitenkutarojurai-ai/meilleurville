import { GUIDES } from "@/data/guides";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
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
    <title>MeilleurVille — Guides</title>
    <link>${BASE_URL}/guides</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Guides MeilleurVille — où vivre en France, sans bullshit, données à l'appui.</description>
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
