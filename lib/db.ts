/**
 * Cloudflare D1 client helper.
 *
 * The standalone API Worker (worker/index.ts) calls `setDB(env.DB)` at the start
 * of every fetch/scheduled invocation. Store modules then call `getDB()` with no
 * args — call sites stay unchanged. The static site (no Worker) never touches D1.
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

let _db: D1Database | undefined;

/** Worker entrypoint sets the D1 binding once per invocation. */
export function setDB(db: D1Database): void {
  _db = db;
}

/**
 * Return the D1 binding. Throws if not initialized — only ever called from the
 * API Worker's request/cron handlers, where setDB(env.DB) ran first.
 */
export async function getDB(): Promise<D1Database> {
  if (!_db) {
    throw new Error(
      "D1 binding not initialized — call setDB(env.DB) in the Worker entrypoint before using a store.",
    );
  }
  return _db;
}
