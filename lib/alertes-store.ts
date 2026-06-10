/**
 * Alertes métrique store — Cloudflare D1 backed — R9.3.
 *
 * Stores city-watch subscriptions: user + city + what to watch (score / comments).
 *
 * An alerte fires when:
 *  - score type: the city's global score changed (by ≥ 0.1) since last notification
 *    AND (if threshold set) the new score crossed the threshold upward.
 *  - comments type: new comments have been posted since last check.
 *
 * Double opt-in: an unauthenticated subscribe creates a PENDING row
 * (active = 0, confirm_token set, confirmed_at NULL) — the Monday cron only
 * mails active rows, so nothing fires until GET /api/alertes/confirm flips it.
 * Authenticated subscribes (Bearer JWT matching the email) skip the dance and
 * are created active + confirmed directly. Pending rows expire after 7 days.
 */
import { getDB } from "@/lib/db";
import { generateLoginToken } from "@/lib/auth-tokens";

const PENDING_TTL_MS = 7 * 24 * 60 * 60_000;

export interface Alerte {
  id: string;
  email: string;
  citySlug: string;
  cityName: string;
  types: Array<"score" | "comments">;
  scoreThreshold?: number; // optional: alert only if score ≥ this value
  lastNotifiedScore: number;
  lastNotifiedCommentCount: number;
  unsubscribeToken: string;
  subscribedAt: string;
  active: boolean;
  locale: "fr" | "en";
  confirmToken: string | null;
  confirmedAt: string | null;
}

interface Row {
  id: string;
  email: string;
  city_slug: string;
  city_name: string;
  types: string;
  score_threshold: number | null;
  last_notified_score: number;
  last_notified_comment_count: number;
  unsubscribe_token: string;
  subscribed_at: string;
  active: number;
  locale: string;
  confirm_token: string | null;
  confirmed_at: string | null;
}

function rowToAlerte(r: Row): Alerte {
  return {
    id: r.id,
    email: r.email,
    citySlug: r.city_slug,
    cityName: r.city_name,
    types: JSON.parse(r.types) as Array<"score" | "comments">,
    scoreThreshold: r.score_threshold ?? undefined,
    lastNotifiedScore: r.last_notified_score,
    lastNotifiedCommentCount: r.last_notified_comment_count,
    unsubscribeToken: r.unsubscribe_token,
    subscribedAt: r.subscribed_at,
    active: r.active === 1,
    locale: r.locale as "fr" | "en",
    confirmToken: r.confirm_token,
    confirmedAt: r.confirmed_at,
  };
}

export async function getAllAlertes(): Promise<Alerte[]> {
  const db = await getDB();
  const { results } = await db.prepare("SELECT * FROM alertes").all<Row>();
  return results.map(rowToAlerte);
}

export async function getAlertesForCity(citySlug: string): Promise<Alerte[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM alertes WHERE active = 1 AND city_slug = ?")
    .bind(citySlug)
    .all<Row>();
  return results.map(rowToAlerte);
}

export async function findByUnsubscribeToken(token: string): Promise<Alerte | undefined> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT * FROM alertes WHERE unsubscribe_token = ?")
    .bind(token)
    .first<Row>();
  return row ? rowToAlerte(row) : undefined;
}

export async function findAllByEmail(email: string): Promise<Alerte[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM alertes WHERE active = 1 AND lower(email) = lower(?)")
    .bind(email)
    .all<Row>();
  return results.map(rowToAlerte);
}

export async function findActiveByEmailAndCity(
  email: string,
  citySlug: string,
): Promise<Alerte | undefined> {
  const db = await getDB();
  const row = await db
    .prepare(
      "SELECT * FROM alertes WHERE active = 1 AND email = ? AND city_slug = ? LIMIT 1",
    )
    .bind(email, citySlug)
    .first<Row>();
  return row ? rowToAlerte(row) : undefined;
}

/** Pending = not yet confirmed (active = 0 with a live confirm token). */
export async function findPendingByEmailAndCity(
  email: string,
  citySlug: string,
): Promise<Alerte | undefined> {
  const db = await getDB();
  const row = await db
    .prepare(
      "SELECT * FROM alertes WHERE active = 0 AND confirm_token IS NOT NULL AND confirmed_at IS NULL AND lower(email) = lower(?) AND city_slug = ? LIMIT 1",
    )
    .bind(email, citySlug)
    .first<Row>();
  return row ? rowToAlerte(row) : undefined;
}

export async function addAlerte(opts: {
  email: string;
  citySlug: string;
  cityName: string;
  types: Array<"score" | "comments">;
  scoreThreshold?: number;
  currentScore: number;
  currentCommentCount: number;
  locale: "fr" | "en";
  /** true = ownership already proven (authed user) → active immediately. */
  confirmed: boolean;
}): Promise<Alerte> {
  const db = await getDB();
  const now = new Date().toISOString();

  const existing = await findActiveByEmailAndCity(opts.email, opts.citySlug);
  if (existing) {
    await db
      .prepare("UPDATE alertes SET types = ?, score_threshold = ? WHERE id = ?")
      .bind(JSON.stringify(opts.types), opts.scoreThreshold ?? null, existing.id)
      .run();
    return {
      ...existing,
      types: opts.types,
      scoreThreshold: opts.scoreThreshold,
    };
  }

  const pending = await findPendingByEmailAndCity(opts.email, opts.citySlug);
  if (pending) {
    if (opts.confirmed) {
      // Authed re-subscribe while a pending row exists: promote it directly.
      await db
        .prepare(
          "UPDATE alertes SET types = ?, score_threshold = ?, active = 1, confirmed_at = ? WHERE id = ?",
        )
        .bind(JSON.stringify(opts.types), opts.scoreThreshold ?? null, now, pending.id)
        .run();
      return { ...pending, types: opts.types, scoreThreshold: opts.scoreThreshold, active: true, confirmedAt: now };
    }
    // Pending re-subscribe: update prefs, reuse the confirm token.
    await db
      .prepare("UPDATE alertes SET types = ?, score_threshold = ? WHERE id = ?")
      .bind(JSON.stringify(opts.types), opts.scoreThreshold ?? null, pending.id)
      .run();
    return { ...pending, types: opts.types, scoreThreshold: opts.scoreThreshold };
  }

  const alerte: Alerte = {
    id: crypto.randomUUID(),
    email: opts.email,
    citySlug: opts.citySlug,
    cityName: opts.cityName,
    types: opts.types,
    scoreThreshold: opts.scoreThreshold,
    lastNotifiedScore: opts.currentScore,
    lastNotifiedCommentCount: opts.currentCommentCount,
    unsubscribeToken: crypto.randomUUID(),
    subscribedAt: now,
    active: opts.confirmed,
    locale: opts.locale,
    confirmToken: opts.confirmed ? null : generateLoginToken(),
    confirmedAt: opts.confirmed ? now : null,
  };
  await db
    .prepare(
      "INSERT INTO alertes (id, email, city_slug, city_name, types, score_threshold, last_notified_score, last_notified_comment_count, unsubscribe_token, subscribed_at, active, locale, confirm_token, confirmed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      alerte.id,
      alerte.email,
      alerte.citySlug,
      alerte.cityName,
      JSON.stringify(alerte.types),
      alerte.scoreThreshold ?? null,
      alerte.lastNotifiedScore,
      alerte.lastNotifiedCommentCount,
      alerte.unsubscribeToken,
      alerte.subscribedAt,
      alerte.active ? 1 : 0,
      alerte.locale,
      alerte.confirmToken,
      alerte.confirmedAt,
    )
    .run();
  return alerte;
}

export async function findByConfirmToken(token: string): Promise<Alerte | undefined> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT * FROM alertes WHERE confirm_token = ?")
    .bind(token)
    .first<Row>();
  return row ? rowToAlerte(row) : undefined;
}

/** True if a pending alerte's confirm window (7 days) has lapsed. */
export function isPendingExpired(alerte: Alerte, nowMs: number = Date.now()): boolean {
  return !alerte.confirmedAt && nowMs - Date.parse(alerte.subscribedAt) > PENDING_TTL_MS;
}

/** Activate a pending alerte. Returns it, or undefined if the token is unknown/already used. */
export async function confirmAlerte(token: string): Promise<Alerte | undefined> {
  const db = await getDB();
  const alerte = await findByConfirmToken(token);
  if (!alerte || alerte.confirmedAt) return undefined;
  const now = new Date().toISOString();
  await db
    .prepare(
      "UPDATE alertes SET active = 1, confirmed_at = ? WHERE confirm_token = ? AND confirmed_at IS NULL",
    )
    .bind(now, token)
    .run();
  return { ...alerte, active: true, confirmedAt: now };
}

/** Opportunistic cleanup: drop pending rows whose 7-day confirm window lapsed. */
export async function purgePendingAlertes(): Promise<void> {
  const db = await getDB();
  const cutoff = new Date(Date.now() - PENDING_TTL_MS).toISOString();
  await db
    .prepare(
      "DELETE FROM alertes WHERE active = 0 AND confirm_token IS NOT NULL AND confirmed_at IS NULL AND subscribed_at < ?",
    )
    .bind(cutoff)
    .run();
}

export async function deactivateAlerte(token: string): Promise<boolean> {
  const db = await getDB();
  const result = await db
    .prepare("UPDATE alertes SET active = 0 WHERE unsubscribe_token = ?")
    .bind(token)
    .run();
  const changes = (result.meta as { changes?: number } | undefined)?.changes ?? 0;
  return changes > 0;
}

export async function updateLastNotified(
  id: string,
  score: number,
  commentCount: number,
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      "UPDATE alertes SET last_notified_score = ?, last_notified_comment_count = ? WHERE id = ?",
    )
    .bind(score, commentCount, id)
    .run();
}
