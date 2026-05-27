/**
 * Cloudflare D1 client helper.
 *
 * In production on Cloudflare Workers (via @opennextjs/cloudflare adapter),
 * `getCloudflareContext().env.DB` returns the bound D1Database. During `next dev`
 * without wrangler the binding is missing — hitting any store function in that
 * mode will throw a descriptive error pointing the developer at the dev wrapper.
 *
 * D1 binding is configured in wrangler.toml as `[[d1_databases]] binding = "DB"`.
 */

// Minimal D1Database surface we use — avoids a hard dependency on
// @cloudflare/workers-types so this file compiles in any environment.
export interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta?: Record<string, unknown>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<D1Result>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

/**
 * Return the D1 binding. Throws if not available — only ever called from
 * dynamic API routes / dynamic pages, never at module load.
 */
export async function getDB(): Promise<D1Database> {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const ctx = getCloudflareContext();
  const db = ctx?.env?.DB as D1Database | undefined;
  if (!db) {
    throw new Error(
      "D1 binding `DB` missing. Configure [[d1_databases]] binding = \"DB\" in wrangler.toml.",
    );
  }
  return db;
}
