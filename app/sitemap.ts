import { MetadataRoute } from "next";
import { CITIES_SEED } from "@/data/cities-seed";
import { RANKING_META } from "@/lib/rankings";
import { GUIDES } from "@/data/guides";
import { SEO_PAIRS } from "@/lib/comparer-pairs";
import { SEO_TRIPLETS } from "@/lib/comparer-triplets";
import { TAG_SLUGS } from "@/lib/guide-tags";

// Locale-aware sitemap. Each Vercel project sets NEXT_PUBLIC_DEFAULT_LOCALE and
// (optionally) NEXT_PUBLIC_BASE_URL — the FR project emits FR URLs at
// mavilleideale.fr, the EN project emits EN URLs at bestcitiesinfrance.com.
const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as "fr" | "en";
const FR_URL = process.env.NEXT_PUBLIC_BASE_URL_FR ?? "https://mavilleideale.fr";
const EN_URL = process.env.NEXT_PUBLIC_BASE_URL_EN ?? "https://bestcitiesinfrance.com";
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? (DEFAULT_LOCALE === "en" ? EN_URL : FR_URL);
const IS_EN = DEFAULT_LOCALE === "en";

// Honest lastModified values per content family.
// Bump these when the underlying source actually changes.
const CITY_DATA_UPDATED = new Date("2026-05-12"); // last seed + score calibration
const RANKING_UPDATED = new Date("2026-05-12");
const STATIC_UPDATED = new Date("2026-05-12");
const LEGAL_UPDATED = new Date("2025-04-01"); // cgu/confidentialite/mentions-legales

// Order MUST stay stable per locale — the sitemap chunk URL is /sitemap/<index>.xml,
// and that URL is what's listed in robots.txt + (eventually) Search Console.
// EN chunk list is a strict subset (no guides, no per-city sub-pages yet).
const SITEMAP_CHUNKS_FR = [
  "static",
  "guides",
  "cities",
  "city-sub",
  "comparer",
  "classements",
  "regions",
  "departements",
  "tags",
  "red-flags",
] as const;

const SITEMAP_CHUNKS_EN = [
  "en-static",
  "en-cities",
  "en-rankings",
] as const;

const SITEMAP_CHUNKS = IS_EN ? SITEMAP_CHUNKS_EN : SITEMAP_CHUNKS_FR;

type Chunk = (typeof SITEMAP_CHUNKS_FR)[number] | (typeof SITEMAP_CHUNKS_EN)[number];

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
    { url: `${BASE_URL}/glossaire`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/calendrier-immobilier`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/outils`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/recherche`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/sommaire`, lastModified: latestGuideUpdate(), changeFrequency: "weekly", priority: 0.5 },
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
    {
      url: `${BASE_URL}/villes/${city.slug}/fiscalite`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]);
}

function comparerSection(): MetadataRoute.Sitemap {
  return [
    ...SEO_PAIRS.map(([a, b]) => ({
      url: `${BASE_URL}/comparer/${a}-vs-${b}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...SEO_TRIPLETS.map(([a, b, c]) => ({
      url: `${BASE_URL}/comparer/${a}-vs-${b}-vs-${c}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
  ];
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

function tagsSection(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/tags`, lastModified: latestGuideUpdate(), changeFrequency: "weekly", priority: 0.6 },
    ...TAG_SLUGS.map((slug) => ({
      url: `${BASE_URL}/tags/${slug}`,
      lastModified: latestGuideUpdate(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}

function redFlagsSection(): MetadataRoute.Sitemap {
  return CITIES_SEED.map((city) => ({
    url: `${BASE_URL}/red-flags/${city.slug}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));
}

function departementsSection(): MetadataRoute.Sitemap {
  const depts = [...new Set(CITIES_SEED.map((c) => c.department))];
  return depts.flatMap((d) => [
    {
      url: `${BASE_URL}/departements/${slugify(d)}`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/departements/${slugify(d)}/fiscalite`,
      lastModified: CITY_DATA_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    },
  ]);
}

// ----- EN sitemap sections -----
// Mirrors the EN app/[locale]/ tree. Only routes that actually exist on the EN
// build are emitted, so Google never sees a 404 from the sitemap.

function enStaticSection(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, lastModified: STATIC_UPDATED, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/cities`, lastModified: CITY_DATA_UPDATED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/rankings`, lastModified: RANKING_UPDATED, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/quiz`, lastModified: STATIC_UPDATED, changeFrequency: "monthly", priority: 0.8 },
  ];
}

function enCitySection(): MetadataRoute.Sitemap {
  return CITIES_SEED.map((city) => ({
    url: `${BASE_URL}/cities/${city.slug}`,
    lastModified: CITY_DATA_UPDATED,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
}

function enRankingsSection(): MetadataRoute.Sitemap {
  return Object.keys(RANKING_META).map((slug) => ({
    url: `${BASE_URL}/rankings/${slug}`,
    lastModified: RANKING_UPDATED,
    changeFrequency: "weekly",
    priority: 0.8,
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
    case "tags": return tagsSection();
    case "red-flags": return redFlagsSection();
    case "en-static": return enStaticSection();
    case "en-cities": return enCitySection();
    case "en-rankings": return enRankingsSection();
    default: return [];
  }
}
