import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";
import { EN_GUIDES } from "@/data/guides-en";

const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as "fr" | "en";
const IS_EN = DEFAULT_LOCALE === "en";
const FR_URL = "https://www.mavilleideale.fr";
const EN_URL = "https://bestcitiesinfrance.com";
const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? (IS_EN ? EN_URL : FR_URL);

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function categoryLabel(id: string): string {
  return GUIDE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export const dynamic = "force-static";
export async function GET() {
  if (IS_EN) {
    const sorted = [...EN_GUIDES].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
    const latest = sorted[0]?.updatedAt ?? new Date().toISOString();

    const items = sorted
      .slice(0, 50)
      .map((g) => {
        const url = `${SITE_URL}/guides/${g.slug}`;
        return `    <item>
      <title>${escapeXml(g.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(g.publishedAt).toUTCString()}</pubDate>
      <category>${escapeXml(g.category)}</category>
      <description>${escapeXml(g.metaDesc ?? g.intro)}</description>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Best Cities in France — Guides</title>
    <link>${SITE_URL}/guides</link>
    <atom:link href="${SITE_URL}/guides/feed.xml" rel="self" type="application/rss+xml" />
    <description>Honest, data-backed guides on where to live in France for expats and movers.</description>
    <language>en</language>
    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  const sorted = [...GUIDES].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
  const latest = sorted[0]?.updatedAt ?? new Date().toISOString();

  const items = sorted
    .slice(0, 50)
    .map((g) => {
      const url = `${SITE_URL}/guides/${g.slug}`;
      return `    <item>
      <title>${escapeXml(g.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(g.publishedAt).toUTCString()}</pubDate>
      <category>${escapeXml(categoryLabel(g.category))}</category>
      <description>${escapeXml(g.metaDesc ?? g.intro)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MaVilleIdeal — Guides</title>
    <link>${SITE_URL}/guides</link>
    <atom:link href="${SITE_URL}/guides/feed.xml" rel="self" type="application/rss+xml" />
    <description>Guides MaVilleIdeal : télétravail, famille, budget, comparaisons.</description>
    <language>fr-FR</language>
    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
