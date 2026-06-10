/**
 * Comments store — Cloudflare D1 backed.
 *
 * Comments are partitioned by `topic` (e.g. "city:annecy", "guide:foo", "contact:general").
 * No auth: every commenter is identified only by the handle they type.
 */
import { getDB } from "@/lib/db";

export interface Comment {
  id: string;
  topic: string;
  author: string;
  body: string;
  rating?: number; // 1-5 optional (overall)
  // T3 — multi-category ratings (1-5 each). Keys are CATEGORY ids from
  // lib/review-categories.ts. Used by /villes/[slug] UserScoresCard to
  // compute crowd-sourced aggregate scores per category.
  categoryRatings?: Record<string, number>;
  type?: "comment" | "question"; // R9.4 — defaults to "comment" when absent
  createdAt: string; // ISO
}

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

export async function listComments(topic: string, limit = 100): Promise<Comment[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM comments WHERE topic = ? AND status = 'published' ORDER BY created_at DESC LIMIT ?")
    .bind(topic, limit)
    .all<Row>();
  return results.map(rowToComment);
}

export async function countComments(topic: string): Promise<number> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM comments WHERE topic = ? AND status = 'published'")
    .bind(topic)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function addComment(input: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
  const db = await getDB();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO comments (id, topic, author, body, rating, category_ratings, type, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published')",
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
    )
    .run();
  return {
    id,
    createdAt,
    ...input,
  };
}
