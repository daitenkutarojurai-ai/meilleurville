/**
 * Contributions store — Cloudflare D1 backed.
 *
 * A logged-in user's own comments/reviews/questions, read back by user_id for
 * the account dashboard. Writes still go through lib/comments-store.ts (the
 * shared comment pipeline); this module only adds the per-user read + the
 * authored-write helper that stamps user_id.
 *
 * The comments table gained a nullable `user_id` column (schema.sql) so anonymous
 * comments keep working unchanged; only authed submissions carry an identity.
 */
import { getDB } from "@/lib/db";
import type { Comment } from "@/lib/comments-store";

interface Row {
  id: string;
  topic: string;
  author: string;
  body: string;
  rating: number | null;
  category_ratings: string | null;
  type: string;
  created_at: string;
}

function rowToComment(r: Row): Comment {
  return {
    id: r.id,
    topic: r.topic,
    author: r.author,
    body: r.body,
    rating: r.rating ?? undefined,
    categoryRatings: r.category_ratings ? JSON.parse(r.category_ratings) : undefined,
    type: (r.type as "comment" | "question") ?? "comment",
    createdAt: r.created_at,
  };
}

export async function listUserContributions(userId: string): Promise<Comment[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM comments WHERE user_id = ? ORDER BY created_at DESC LIMIT 100")
    .bind(userId)
    .all<Row>();
  return results.map(rowToComment);
}

export async function countUserContributions(userId: string): Promise<number> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM comments WHERE user_id = ?")
    .bind(userId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

/** Add a comment stamped with the author's user id. Mirrors addComment(). */
export async function addUserComment(input: {
  userId: string;
  topic: string;
  author: string;
  body: string;
  rating?: number;
  categoryRatings?: Record<string, number>;
  type?: "comment" | "question";
}): Promise<Comment> {
  const db = await getDB();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO comments (id, topic, author, body, rating, category_ratings, type, created_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      id,
      input.topic,
      input.author,
      input.body,
      input.rating ?? null,
      input.categoryRatings ? JSON.stringify(input.categoryRatings) : null,
      input.type ?? "comment",
      createdAt,
      input.userId,
    )
    .run();
  return {
    id,
    topic: input.topic,
    author: input.author,
    body: input.body,
    rating: input.rating,
    categoryRatings: input.categoryRatings,
    type: input.type ?? "comment",
    createdAt,
  };
}
