// Augment CloudflareEnv (from @opennextjs/cloudflare) with our bindings.
// The runtime values come from wrangler.toml.

import type { D1Database } from "@/lib/db";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ASSETS: Fetcher;
  }
}

export {};
