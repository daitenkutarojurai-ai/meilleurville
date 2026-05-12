import { MetadataRoute } from "next";
import { CITIES_SEED } from "@/data/cities-seed";
import { RANKING_META } from "@/lib/rankings";
import { GUIDES } from "@/data/guides";
import { SEO_PAIRS } from "@/lib/comparer-pairs";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";

// Honest lastModified values per content family.
// Bump these when the underlying source actually changes.
const CITY_DATA_UPDATED = new Date("2026-05-12"); // last seed + score calibration
const RANKING_UPDATED = new Date("2026-05-12");
const STATIC_UPDATED = new Date("2026-05-12");
const LEGAL_UPDATED = new Date("2025-04-01"); // cgu/confidentialite/mentions-legales

// Order MUST stay stable — the sitemap chunk URL is /sitemap/<index>.xml,
// and that URL is what's listed in robots.txt + (eventually) Search Console.
const SITEMAP_CHUNKS = [
  "static",
  "guides",
  "cities",
  "city-sub",
  "comparer",
  "classements",
  "regions",
  "departements",
] as const;

type Chunk = (typeof SITEMAP_CHUNKS)[number];

export async function generateSitemaps() {
  return SITEMAP_CHUNKS.map((_, id) => ({ id }));
}

function chunkAt(id: number): Chunk | null {
  return SITEMAP_CHUNKS[id] ?? null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function staticSection(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: STATIC_UPDATED, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/quiz`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/villes`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/classements`, lastModified: RANKING_UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/comparer`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/methode`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/red-flags`, lastModified: STATIC_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/guides`, lastModified: latestGuideUpdate(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/leaderboard`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/donnees`, lastModified: CITY_DATA_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/regions`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/departements`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/carte`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/confidentialite`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/cgu`, lastModified: LEGAL_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];
}

function latestGuideUpdate(): Date {
  const max = GUIDES.reduce((acc, g) => {
    const t = new Date(g.updatedAt).getTime();
    return t > acc ? t : acc;
  }, 0);
  return max ? new Date(max) : STATIC_UPDATED;
}

function guideSection(): MetadataRoute.Sitemap {
  return GUIDES.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
}

function citySection(): MetadataRoute.Sitemap {
  return CITIES_SEED.map((city) => ({
    url: `${BASE_URL}/villes/${city.slug}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}

function citySubSection(): MetadataRoute.Sitemap {
  return CITIES_SEED.flatMap((city) => [
    {
      url: `${BASE_URL}/villes/${city.slug}/quartiers`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/climat`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/transports`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/ecoles`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]);
}

function comparerSection(): MetadataRoute.Sitemap {
  return SEO_PAIRS.map(([a, b]) => ({
    url: `${BASE_URL}/comparer/${a}-vs-${b}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
}

function classementsSection(): MetadataRoute.Sitemap {
  return Object.keys(RANKING_META).map((slug) => ({
    url: `${BASE_URL}/classements/${slug}`,
    lastModified: RANKING_UPDATED,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
}

function regionsSection(): MetadataRoute.Sitemap {
  const regions = [...new Set(CITIES_SEED.map((c) => c.region))];
  return regions.map((r) => ({
    url: `${BASE_URL}/regions/${slugify(r)}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}

function departementsSection(): MetadataRoute.Sitemap {
  const depts = [...new Set(CITIES_SEED.map((c) => c.department))];
  return depts.map((d) => ({
    url: `${BASE_URL}/departements/${slugify(d)}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "weekly",
    priority: 0.65,
  }));
}

// Next 16 passes `id` as Promise<string>. See:
// node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-sitemaps.md
export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const chunk = chunkAt(Number(await id));
  switch (chunk) {
    case "static": return staticSection();
    case "guides": return guideSection();
    case "cities": return citySection();
    case "city-sub": return citySubSection();
    case "comparer": return comparerSection();
    case "classements": return classementsSection();
    case "regions": return regionsSection();
    case "departements": return departementsSection();
    default: return [];
  }
}
