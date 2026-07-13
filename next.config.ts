import type { NextConfig } from "next";

// Static-first: `next build` emits a full static export to `out/`, served from
// Cloudflare Workers Static Assets. Dynamic endpoints live in a separate Worker
// (see worker/), so the Next app contains no Request-dependent routes.
//
// `output: "export"` forbids rewrites/redirects/headers/cookies/ISR — the FR
// locale needs no rewrites (those only fired on the EN domain), and the lone
// /a-propos -> /about redirect moves to public/_redirects (Cloudflare assets).
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Barrel imports (`import { X } from "lucide-react"`) otherwise pull the whole
  // module graph into the shared chunk — the icon set alone built a 4.7 MB one.
  // This rewrites them to deep imports at compile time.
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
