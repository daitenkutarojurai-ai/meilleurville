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
    ["vannes", "rennes"],
    ["chambery", "annecy"],
    ["nimes", "montpellier"],
    ["gap", "grenoble"],
    ["saint-malo", "rennes"],
    ["colmar", "strasbourg"],
    ["lorient", "brest"],
    ["bayonne", "bordeaux"],
    ["arles", "avignon"],
    ["angers", "le-mans"],
    ["metz", "nancy"],
    ["metz", "strasbourg"],
    ["nancy", "strasbourg"],
    ["saint-etienne", "lyon"],
    ["saint-etienne", "grenoble"],
    ["limoges", "bordeaux"],
    ["limoges", "poitiers"],
    ["amiens", "lille"],
    ["amiens", "rouen"],
    ["troyes", "reims"],
    ["troyes", "dijon"],
    ["tours", "angers"],
    ["pau", "bayonne"],
    ["clermont-ferrand", "lyon"],
    ["clermont-ferrand", "grenoble"],
    ["toulon", "marseille"],
    ["perpignan", "nimes"],
    ["avignon", "marseille"],
    ["caen", "rouen"],
    ["reims", "troyes"],
    ["dijon", "besancon"],
    ["poitiers", "tours"],
    ["le-havre", "rouen"],
    ["valence", "avignon"],
    ["frejus", "toulon"],
    ["colmar", "nancy"],
    ["angers", "tours"],
    ["nantes", "angers"],
    ["biarritz", "pau"],
    ["saint-malo", "brest"],
    ["quimper", "lorient"],
    ["vannes", "lorient"],
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
    { url: `${BASE_URL}/donnees`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/regions`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/departements`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/carte`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/confidentialite`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/cgu`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
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

  const regions = [...new Set(CITIES_SEED.map((c) => c.region))];
  const regionRoutes: MetadataRoute.Sitemap = regions.map((r) => ({
    url: `${BASE_URL}/regions/${r.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const depts = [...new Set(CITIES_SEED.map((c) => c.department))];
  const deptRoutes: MetadataRoute.Sitemap = depts.map((d) => ({
    url: `${BASE_URL}/departements/${d.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.65,
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

  return [...staticRoutes, ...guideRoutes, ...regionRoutes, ...deptRoutes, ...cityRoutes];
}
