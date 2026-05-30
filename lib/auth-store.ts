/**
 * Auth data store — Cloudflare D1 backed.
 *
 * Two tables (see schema.sql):
 *  - users: one row per account, keyed by id (uuid), unique lowercased email.
 *  - login_tokens: short-lived magic-link tokens. Only the SHA-256 HASH is
 *    stored; a row is single-use (consumed_at) and expires (expires_at).
 *
 * No passwords: identity is proven by clicking an emailed one-time link, then
 * exchanged for a session JWT (see lib/auth-tokens.ts).
 */
import { getDB } from "@/lib/db";

export interface User {
  id: string;
  email: string;
  handle: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

interface UserRow {
  id: string;
  email: string;
  handle: string | null;
  created_at: string;
  last_login_at: string | null;
}

function rowToUser(r: UserRow): User {
  return {
    id: r.id,
    email: r.email,
    handle: r.handle,
    createdAt: r.created_at,
    lastLoginAt: r.last_login_at,
  };
}

const LOGIN_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1")
    .bind(email)
    .first<UserRow>();
  return row ? rowToUser(row) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDB();
  const row = await db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").bind(id).first<UserRow>();
  return row ? rowToUser(row) : null;
}

/** Get the existing account for an email, or create one. */
export async function findOrCreateUser(email: string): Promise<User> {
  const existing = await findUserByEmail(email);
  if (existing) return existing;
  const db = await getDB();
  const user: User = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    handle: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };
  await db
    .prepare("INSERT INTO users (id, email, handle, created_at, last_login_at) VALUES (?, ?, ?, ?, ?)")
    .bind(user.id, user.email, null, user.createdAt, null)
    .run();
  return user;
}

export async function markLogin(userId: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare("UPDATE users SET last_login_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), userId)
    .run();
}

export async function setHandle(userId: string, handle: string): Promise<void> {
  const db = await getDB();
  await db.prepare("UPDATE users SET handle = ? WHERE id = ?").bind(handle, userId).run();
}

/** Store a login token (hash only) tied to a user. Returns nothing. */
export async function createLoginToken(opts: {
  userId: string;
  tokenHash: string;
  nowMs?: number;
}): Promise<void> {
  const db = await getDB();
  const now = opts.nowMs ?? Date.now();
  await db
    .prepare(
      "INSERT INTO login_tokens (token_hash, user_id, created_at, expires_at, consumed_at) VALUES (?, ?, ?, ?, NULL)",
    )
    .bind(
      opts.tokenHash,
      opts.userId,
      new Date(now).toISOString(),
      new Date(now + LOGIN_TOKEN_TTL_MS).toISOString(),
    )
    .run();
}

/**
 * Atomically consume a login token: returns the userId if the token exists, is
 * unexpired, and was not already consumed; marks it consumed; else null.
 */
export async function consumeLoginToken(
  tokenHash: string,
  nowMs: number = Date.now(),
): Promise<string | null> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT user_id, expires_at, consumed_at FROM login_tokens WHERE token_hash = ? LIMIT 1")
    .bind(tokenHash)
    .first<{ user_id: string; expires_at: string; consumed_at: string | null }>();
  if (!row) return null;
  if (row.consumed_at) return null;
  if (new Date(row.expires_at).getTime() < nowMs) return null;
  // Mark consumed; guard on consumed_at IS NULL so a racing request can't double-spend.
  const res = await db
    .prepare("UPDATE login_tokens SET consumed_at = ? WHERE token_hash = ? AND consumed_at IS NULL")
    .bind(new Date(nowMs).toISOString(), tokenHash)
    .run();
  const changes = (res.meta as { changes?: number } | undefined)?.changes ?? 0;
  if (changes === 0) return null;
  return row.user_id;
}

/** Best-effort GC of expired/consumed tokens. Called opportunistically. */
export async function purgeStaleLoginTokens(nowMs: number = Date.now()): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM login_tokens WHERE expires_at < ? OR consumed_at IS NOT NULL")
    .bind(new Date(nowMs).toISOString())
    .run();
}
