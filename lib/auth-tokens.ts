/**
 * Stateless auth primitives — Web Crypto only, so they run unchanged in the
 * Cloudflare Worker (no Node Buffer, no jsonwebtoken dependency).
 *
 * Two token kinds:
 *  - Session JWT: HS256, signed with AUTH_SECRET, carries { sub, email, iat, exp }.
 *    Sent by the client as `Authorization: Bearer <jwt>` on every authed request.
 *  - Login token: a 256-bit random string emailed in the magic link. Only its
 *    SHA-256 hash is stored in D1 (login_tokens), so a DB leak can't be replayed.
 *
 * AUTH_SECRET is a Worker secret (`wrangler secret put AUTH_SECRET`). Without it
 * the auth endpoints refuse to run rather than signing with a weak key.
 */

const enc = new TextEncoder();

function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlFromString(s: string): string {
  return b64urlFromBytes(enc.encode(s));
}

function bytesFromB64url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function stringFromB64url(s: string): string {
  return new TextDecoder().decode(bytesFromB64url(s));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

/** Constant-time-ish equality (avoids early-return timing leak on the MAC). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface SessionClaims {
  sub: string; // user id
  email: string;
  iat: number; // seconds
  exp: number; // seconds
}

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 60; // 60 days

export async function signSession(
  claims: { sub: string; email: string },
  secret: string,
  nowMs: number = Date.now(),
): Promise<string> {
  const iat = Math.floor(nowMs / 1000);
  const payload: SessionClaims = { ...claims, iat, exp: iat + SESSION_TTL_SECONDS };
  const header = b64urlFromString(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64urlFromString(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const key = await hmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
  return `${data}.${b64urlFromBytes(sig)}`;
}

/** Returns the claims if the JWT is valid and unexpired, else null. */
export async function verifySession(
  token: string,
  secret: string,
  nowMs: number = Date.now(),
): Promise<SessionClaims | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const key = await hmacKey(secret);
  const expected = b64urlFromBytes(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(`${header}.${body}`))),
  );
  if (!timingSafeEqual(sig, expected)) return null;
  let claims: SessionClaims;
  try {
    claims = JSON.parse(stringFromB64url(body)) as SessionClaims;
  } catch {
    return null;
  }
  if (typeof claims.exp !== "number" || claims.exp < Math.floor(nowMs / 1000)) return null;
  if (!claims.sub || !claims.email) return null;
  return claims;
}

/** 256 bits of randomness, base64url — the secret half of a magic link. */
export function generateLoginToken(): string {
  return b64urlFromBytes(crypto.getRandomValues(new Uint8Array(32)));
}

/** SHA-256 hex of a login token. Only the hash is persisted. */
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(token));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
