import type { NextConfig } from "next";
// Boot OpenNext's Cloudflare bindings during `next dev` so getCloudflareContext()
// works (and so `lib/db.ts` can talk to D1) without running `wrangler dev`.
// Safe in production builds — function is a no-op outside dev.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [],
  },
  async redirects() {
    return [
      { source: "/a-propos", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
