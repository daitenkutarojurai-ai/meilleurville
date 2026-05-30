/**
 * Favorites store — Cloudflare D1 backed. Account-persisted city bookmarks.
 *
 * One row per (user, city). Anonymous visitors keep favorites in localStorage
 * (components/effects/FavoriteButton.tsx); on login the client merges the local
 * set up via `mergeFavorites`, so a device's bookmarks survive sign-in.
 */
import { getDB } from "@/lib/db";

export async function listFavorites(userId: string): Promise<string[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT city_slug FROM favorites WHERE user_id = ? ORDER BY created_at DESC")
    .bind(userId)
    .all<{ city_slug: string }>();
  return results.map((r) => r.city_slug);
}

export async function addFavorite(userId: string, slug: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      "INSERT INTO favorites (user_id, city_slug, created_at) VALUES (?, ?, ?) ON CONFLICT(user_id, city_slug) DO NOTHING",
    )
    .bind(userId, slug, new Date().toISOString())
    .run();
}

export async function removeFavorite(userId: string, slug: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM favorites WHERE user_id = ? AND city_slug = ?")
    .bind(userId, slug)
    .run();
}

/** Add many slugs at once (login merge). Returns the full list afterwards. */
export async function mergeFavorites(userId: string, slugs: string[]): Promise<string[]> {
  const clean = Array.from(new Set(slugs.filter((s) => /^[a-z0-9-]{1,80}$/.test(s)))).slice(0, 200);
  const db = await getDB();
  const now = new Date().toISOString();
  for (const slug of clean) {
    await db
      .prepare(
        "INSERT INTO favorites (user_id, city_slug, created_at) VALUES (?, ?, ?) ON CONFLICT(user_id, city_slug) DO NOTHING",
      )
      .bind(userId, slug, now)
      .run();
  }
  return listFavorites(userId);
}
