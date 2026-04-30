import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  async redirects() {
    return [
      { source: "/a-propos", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
