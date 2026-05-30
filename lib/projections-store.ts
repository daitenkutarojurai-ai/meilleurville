/**
 * Saved projections store — Cloudflare D1 backed.
 *
 * Persists a result from /projection-5ans (R9.5, otherwise a stateless client
 * calculator) so a logged-in user can keep and revisit a scenario. The `payload`
 * is the opaque JSON the projection client produces; we store and return it
 * verbatim, capped in size at the endpoint.
 */
import { getDB } from "@/lib/db";

export interface SavedProjection {
  id: string;
  citySlug: string;
  cityName: string;
  label: string;
  payload: unknown;
  createdAt: string;
}

interface Row {
  id: string;
  city_slug: string;
  city_name: string;
  label: string;
  payload: string;
  created_at: string;
}

function rowToProjection(r: Row): SavedProjection {
  let payload: unknown = null;
  try {
    payload = JSON.parse(r.payload);
  } catch {
    payload = null;
  }
  return {
    id: r.id,
    citySlug: r.city_slug,
    cityName: r.city_name,
    label: r.label,
    payload,
    createdAt: r.created_at,
  };
}

export async function listProjections(userId: string): Promise<SavedProjection[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM projections WHERE user_id = ? ORDER BY created_at DESC LIMIT 50")
    .bind(userId)
    .all<Row>();
  return results.map(rowToProjection);
}

export async function addProjection(opts: {
  userId: string;
  citySlug: string;
  cityName: string;
  label: string;
  payload: unknown;
}): Promise<SavedProjection> {
  const db = await getDB();
  const proj: SavedProjection = {
    id: crypto.randomUUID(),
    citySlug: opts.citySlug,
    cityName: opts.cityName,
    label: opts.label,
    payload: opts.payload,
    createdAt: new Date().toISOString(),
  };
  await db
    .prepare(
      "INSERT INTO projections (id, user_id, city_slug, city_name, label, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      proj.id,
      opts.userId,
      proj.citySlug,
      proj.cityName,
      proj.label,
      JSON.stringify(opts.payload),
      proj.createdAt,
    )
    .run();
  return proj;
}

export async function removeProjection(userId: string, id: string): Promise<void> {
  const db = await getDB();
  await db.prepare("DELETE FROM projections WHERE user_id = ? AND id = ?").bind(userId, id).run();
}
