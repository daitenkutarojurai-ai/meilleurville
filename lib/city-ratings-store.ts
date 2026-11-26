/**
 * Note rapide des habitants (2026-11-26) — une note de 1 à 5 par ville, sans compte ni email.
 *
 * Pourquoi : au 2026-11-26 le site comptait 20 avis écrits pour 593 villes (bien-dans-ma-ville.fr
 * annonce 80 000 avis), alors que la moitié des clics Google cherchent « avis / note ville »
 * (docs/seo/strategie-audience.md § 2). Le formulaire d'avis écrit (prénom + email + message)
 * reste en place ; la note rapide est la marche d'entrée, un tap suffit.
 *
 * - Table créée à la première écriture ou lecture (même mécanique que lib/ai-budget.ts).
 * - Aucune IP stockée ici : l'anti-doublon (une note par ville et par IP sur 30 jours) passe par
 *   rate_limits / rateLimitD1, dont les lignes expirent et sont purgées par le cron du lundi.
 * - Modération manuelle, comme les commentaires :
 *     wrangler d1 execute meilleurville --remote --command \
 *       "UPDATE city_ratings SET status='hidden' WHERE id='<id>'"
 */
import { getDB } from "@/lib/db";

export const RATING_RELATIONS = ["habitant", "ancien", "connait"] as const;
export type RatingRelation = (typeof RATING_RELATIONS)[number];

/** Sous-critères facultatifs : ids stables (clés du JSON `criteria`). */
export const RATING_CRITERIA = ["securite", "transport", "cout", "ambiance"] as const;
export type RatingCriterion = (typeof RATING_CRITERIA)[number];

export interface CityRatingInput {
  city: string;
  overall: number;
  relation: RatingRelation;
  criteria?: Partial<Record<RatingCriterion, number>>;
  locale: "fr" | "en";
}

export interface CityRatingSummary {
  city: string;
  n: number;
  /** Moyenne sur 5, une décimale ; null sans vote. */
  avg: number | null;
  /** Effectifs des notes 1 → 5. */
  dist: [number, number, number, number, number];
  criteria: Record<RatingCriterion, { avg: number; n: number } | null>;
  relations: Record<RatingRelation, number>;
}

const DDL_TABLE =
  "CREATE TABLE IF NOT EXISTS city_ratings (" +
  "id TEXT PRIMARY KEY, city TEXT NOT NULL, overall INTEGER NOT NULL, criteria TEXT, " +
  "relation TEXT NOT NULL, locale TEXT NOT NULL DEFAULT 'fr', created_at TEXT NOT NULL, " +
  "status TEXT NOT NULL DEFAULT 'published')";
const DDL_INDEX = "CREATE INDEX IF NOT EXISTS idx_city_ratings_city ON city_ratings (city, status)";

async function withTable<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!String(e).includes("no such table")) throw e;
    const db = await getDB();
    await db.batch([db.prepare(DDL_TABLE), db.prepare(DDL_INDEX)]);
    return fn();
  }
}

export async function addCityRating(input: CityRatingInput): Promise<{ id: string; createdAt: string }> {
  const db = await getDB();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const criteria = input.criteria && Object.keys(input.criteria).length > 0 ? JSON.stringify(input.criteria) : null;
  await withTable(() =>
    db
      .prepare(
        "INSERT INTO city_ratings (id, city, overall, criteria, relation, locale, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .bind(id, input.city, input.overall, criteria, input.relation, input.locale, createdAt)
      .run(),
  );
  return { id, createdAt };
}

const round1 = (x: number) => Math.round(x * 10) / 10;

export async function cityRatingSummary(city: string): Promise<CityRatingSummary> {
  const db = await getDB();
  const { results } = await withTable(() =>
    db
      .prepare("SELECT overall, criteria, relation FROM city_ratings WHERE city = ? AND status = 'published'")
      .bind(city)
      .all<{ overall: number; criteria: string | null; relation: string }>(),
  );
  const dist: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  const relations: Record<RatingRelation, number> = { habitant: 0, ancien: 0, connait: 0 };
  const sums = Object.fromEntries(RATING_CRITERIA.map((c) => [c, { sum: 0, n: 0 }])) as Record<
    RatingCriterion,
    { sum: number; n: number }
  >;
  let total = 0;
  for (const r of results) {
    if (r.overall < 1 || r.overall > 5) continue;
    dist[r.overall - 1] += 1;
    total += r.overall;
    if ((RATING_RELATIONS as readonly string[]).includes(r.relation)) relations[r.relation as RatingRelation] += 1;
    if (r.criteria) {
      try {
        const c = JSON.parse(r.criteria) as Record<string, number>;
        for (const k of RATING_CRITERIA) {
          const v = c[k];
          if (typeof v === "number" && v >= 1 && v <= 5) {
            sums[k].sum += v;
            sums[k].n += 1;
          }
        }
      } catch {
        /* ligne illisible : ignorée */
      }
    }
  }
  const n = dist.reduce((a, b) => a + b, 0);
  const criteria = Object.fromEntries(
    RATING_CRITERIA.map((k) => [k, sums[k].n ? { avg: round1(sums[k].sum / sums[k].n), n: sums[k].n } : null]),
  ) as CityRatingSummary["criteria"];
  return { city, n, avg: n ? round1(total / n) : null, dist, criteria, relations };
}

/** Toutes les villes notées au moins une fois : sert au bloc de /avis et à un futur instantané statique. */
export async function allCityRatingSummaries(): Promise<Array<{ city: string; n: number; avg: number }>> {
  const db = await getDB();
  const { results } = await withTable(() =>
    db
      .prepare(
        "SELECT city, COUNT(*) AS n, AVG(overall) AS avg FROM city_ratings WHERE status = 'published' GROUP BY city",
      )
      .all<{ city: string; n: number; avg: number }>(),
  );
  return results.map((r) => ({ city: r.city, n: r.n, avg: round1(r.avg) }));
}
