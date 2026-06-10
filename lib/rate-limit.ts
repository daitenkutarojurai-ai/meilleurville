/**
 * Naive in-memory sliding-window rate limiter, scoped per process.
 * Good enough to deflect casual spam; production-grade abuse needs a shared store
 * (Redis / Upstash). Keys are anything you want — typically `${ip}:${action}`.
 */

interface Bucket {
  /** Sorted list of timestamps (ms) within the current window. */
  hits: number[];
}

const store = new Map<string, Bucket>();

// Periodic GC so the map doesn't leak — runs at most once per minute on access.
let lastGc = 0;
function gc(now: number, maxWindow: number) {
  if (now - lastGc < 60_000) return;
  lastGc = now;
  for (const [k, b] of store.entries()) {
    const fresh = b.hits.filter((t) => now - t < maxWindow);
    if (fresh.length === 0) store.delete(k);
    else b.hits = fresh;
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * @param key      identifier (usually IP + action)
 * @param max      max hits allowed within `windowMs`
 * @param windowMs window length in ms
 */
export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  gc(now, windowMs);

  const bucket = store.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= max) {
    const oldest = bucket.hits[0];
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    store.set(key, bucket);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  bucket.hits.push(now);
  store.set(key, bucket);
  return { allowed: true, remaining: max - bucket.hits.length, retryAfterSeconds: 0 };
}

export function getClientIp(headers: Headers): string {
  // CF-Connecting-IP is set by Cloudflare and can't be spoofed. X-Forwarded-For
  // must NOT be trusted here: Cloudflare appends the real IP to any
  // client-supplied value, so its first entry is attacker-controlled.
  return headers.get("cf-connecting-ip") ?? headers.get("x-real-ip") ?? "unknown";
}

// ---- D1-backed fixed-window limiter ----------------------------------------
// The in-memory limiter above is per-isolate (resets on recycle, not shared
// across colos). For limits where bypass costs real money — AI spend, email
// sends, auth links — use this shared counter instead. Fails open on D1 errors
// so an outage never blocks legitimate traffic.

const D1_UPSERT =
  "INSERT INTO rate_limits (bucket, count, expires_at) VALUES (?1, 1, ?2) " +
  "ON CONFLICT(bucket) DO UPDATE SET count = count + 1 RETURNING count";

export async function rateLimitD1(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
  const now = Date.now();
  const slot = Math.floor(now / windowMs);
  const expiresAt = (slot + 1) * windowMs;
  try {
    const { getDB } = await import("@/lib/db");
    const db = await getDB();
    const row = await db.prepare(D1_UPSERT).bind(`${key}:${slot}`, expiresAt).first<{ count: number }>();
    const count = row?.count ?? 1;
    return {
      allowed: count <= max,
      remaining: Math.max(0, max - count),
      retryAfterSeconds: Math.ceil((expiresAt - now) / 1000),
    };
  } catch {
    return { allowed: true, remaining: max, retryAfterSeconds: 0 };
  }
}

export async function purgeExpiredRateLimits(): Promise<void> {
  try {
    const { getDB } = await import("@/lib/db");
    const db = await getDB();
    await db.prepare("DELETE FROM rate_limits WHERE expires_at < ?1").bind(Date.now()).run();
  } catch {
    /* best-effort housekeeping */
  }
}
