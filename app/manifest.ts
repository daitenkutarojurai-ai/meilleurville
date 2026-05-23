import { MetadataRoute } from "next";

// Locale-aware: the EN Vercel project sets NEXT_PUBLIC_DEFAULT_LOCALE=en, so
// the PWA manifest reads BestCitiesInFrance on bestcitiesinfrance.com and
// MaVilleIdeal on mavilleideale.fr.
const IS_EN = process.env.NEXT_PUBLIC_DEFAULT_LOCALE === "en";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: IS_EN ? "BestCitiesInFrance" : "MaVilleIdeal",
    short_name: IS_EN ? "BestCities" : "MaVilleIdeal",
    description: IS_EN
      ? "Find the French city that fits you — rankings, resident reviews, lifestyle quiz"
      : "Trouvez la ville française qui vous ressemble — IA + avis authentiques",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFBF4",
    theme_color: "#0D9488",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["travel", "lifestyle", "utilities"],
    lang: IS_EN ? "en" : "fr",
    dir: "ltr",
    shortcuts: IS_EN
      ? [
          {
            name: "AI Quiz",
            short_name: "Quiz",
            description: "Find my ideal city",
            url: "/quiz",
          },
          {
            name: "Rankings",
            short_name: "Rankings",
            url: "/rankings",
          },
        ]
      : [
          {
            name: "Quiz IA",
            short_name: "Quiz",
            description: "Trouver ma ville idéale",
            url: "/quiz",
          },
          {
            name: "Classements",
            short_name: "Classements",
            url: "/classements",
          },
        ],
  };
}
