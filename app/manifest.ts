import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MeilleurVille",
    short_name: "MeilleurVille",
    description: "Trouvez la ville française qui vous ressemble — IA + avis authentiques",
    start_url: "/",
    display: "standalone",
    background_color: "#0E0F13",
    theme_color: "#5B7FFF",
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
    lang: "fr",
    dir: "ltr",
    shortcuts: [
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
