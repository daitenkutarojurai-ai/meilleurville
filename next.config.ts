import type { NextConfig } from "next";
// Boot OpenNext's Cloudflare bindings during `next dev` so getCloudflareContext()
// works (and so `lib/db.ts` can talk to D1) without running `wrangler dev`.
// Safe in production builds — function is a no-op outside dev.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

// FR-only segments — on the EN domain these rewrite to /404.
const FR_ONLY_SEGMENTS = [
  "villes","classements","comparer","comparer-regions","guides","quartiers",
  "departements","red-flags","carte","carte-risques","calendrier-immobilier",
  "calculateur-cout-reel","quiz-compatibilite","journal-demenagement",
  "expat-retour","reality-check","ville-du-mois","alertes","favoris",
  "recherche","sommaire","methode","outils","tags","glossaire","donnees",
  "mentions-legales","confidentialite","cgu","a-propos",
];

const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as "fr" | "en";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  async redirects() {
    const base = [
      { source: "/a-propos", destination: "/about", permanent: true },
    ];
    if (DEFAULT_LOCALE === "fr") {
      // FR domain: block /en/* to avoid serving EN content
      base.push({ source: "/en/:path*", destination: "/404", permanent: false });
    }
    return base;
  },
  async rewrites() {
    if (DEFAULT_LOCALE !== "en") return [];
    // EN domain: rewrite bare paths to /en/* (keeps URL bar clean)
    const frOnly = FR_ONLY_SEGMENTS.map((seg) => `/${seg}/:path*`);
    const frOnlyRoot = FR_ONLY_SEGMENTS.map((seg) => `/${seg}`);
    // These stay as 404 — handled by absence of a rewrite (falls through to missing page)
    return {
      beforeFiles: [
        // Pass /en/* through unchanged
        { source: "/en/:path*", destination: "/en/:path*" },
        // Rewrite root
        { source: "/", destination: "/en" },
        // Rewrite everything else that isn't an FR-only segment
        {
          source: "/:path((?!" + FR_ONLY_SEGMENTS.join("|") + ")[^/]+)(.*)",
          destination: "/en/:path$2",
        },
      ],
    };
  },
};

export default nextConfig;
