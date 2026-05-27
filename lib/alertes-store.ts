/**
 * Alertes métrique store — Cloudflare D1 backed — R9.3.
 *
 * Stores city-watch subscriptions: user + city + what to watch (score / comments).
 *
 * An alerte fires when:
 *  - score type: the city's global score changed (by ≥ 0.1) since last notification
 *    AND (if threshold set) the new score crossed the threshold upward.
 *  - comments type: new comments have been posted since last check.
 */
import { getDB } from "@/lib/db";

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

export async function addAlerte(opts: {
  email: string;
  citySlug: string;
  cityName: string;
  types: Array<"score" | "comments">;
  scoreThreshold?: number;
  currentScore: number;
  currentCommentCount: number;
  locale: "fr" | "en";
}): Promise<Alerte> {
  const db = await getDB();
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
    subscribedAt: new Date().toISOString(),
    active: true,
    locale: opts.locale,
  };
  await db
    .prepare(
      "INSERT INTO alertes (id, email, city_slug, city_name, types, score_threshold, last_notified_score, last_notified_comment_count, unsubscribe_token, subscribed_at, active, locale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
      1,
      alerte.locale,
    )
    .run();
  return alerte;
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
