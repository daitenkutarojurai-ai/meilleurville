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
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
