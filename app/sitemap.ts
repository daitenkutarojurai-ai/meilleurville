import { MetadataRoute } from "next";
import { CITIES_SEED } from "@/data/cities-seed";
import { RANKING_META } from "@/lib/rankings";
import { GUIDES } from "@/data/guides";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const SEO_PAIRS = [
    ["annecy", "grenoble"],
    ["nantes", "rennes"],
    ["bordeaux", "toulouse"],
    ["lyon", "grenoble"],
    ["montpellier", "nice"],
    ["nantes", "bordeaux"],
    ["rennes", "nantes"],
    ["nice", "aix-en-provence"],
    ["strasbourg", "lyon"],
    ["brest", "rennes"],
    ["toulouse", "montpellier"],
    ["angers", "nantes"],
    ["lille", "strasbourg"],
    ["bordeaux", "nantes"],
    ["lyon", "bordeaux"],
    ["grenoble", "annecy"],
    ["la-rochelle", "bordeaux"],
    ["pau", "biarritz"],
    ["caen", "rennes"],
    ["dijon", "strasbourg"],
    ["tours", "orleans"],
    ["annecy", "biarritz"],
    ["quimper", "brest"],
    ["valence", "grenoble"],
    ["lyon", "nice"],
    ["montpellier", "marseille"],
    ["besancon", "dijon"],
    ["toulon", "nice"],
    ["rouen", "caen"],
    ["perpignan", "montpellier"],
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/quiz`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/villes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/classements`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/comparer`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/premium`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/methode`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/red-flags`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/leaderboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    ...Object.keys(RANKING_META).map((slug) => ({
      url: `${BASE_URL}/classements/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...SEO_PAIRS.map(([a, b]) => ({
      url: `${BASE_URL}/comparer/${a}-vs-${b}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${BASE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const cityRoutes: MetadataRoute.Sitemap = CITIES_SEED.flatMap((city) => [
    {
      url: `${BASE_URL}/villes/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/villes/${city.slug}/quartiers`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]);

  return [...staticRoutes, ...guideRoutes, ...cityRoutes];
}
