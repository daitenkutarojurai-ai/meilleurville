/**
 * Global daily budget for Claude/Anthropic calls — a hard cost backstop that the
 * per-IP rate limiter can't provide (it's in-memory/per-isolate, so a distributed
 * bot bypasses it). One row per UTC day in D1; each AI call reserves `units`
 * against AI_DAILY_BUDGET. Over budget → callers serve their non-AI fallback.
 *
 * Fails OPEN on infrastructure error (DB unavailable): the per-IP limiter and the
 * Anthropic Console monthly spend cap remain as backstops, so a transient D1 blip
 * never takes the AI features down.
 */
import { getDB } from "@/lib/db";

const DEFAULT_DAILY_BUDGET = 1500;
const DDL =
  "CREATE TABLE IF NOT EXISTS ai_budget (day TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0)";
const UPSERT =
  "INSERT INTO ai_budget (day, count) VALUES (?1, ?2) " +
  "ON CONFLICT(day) DO UPDATE SET count = count + ?2 RETURNING count";

export function aiDailyBudget(): number {
  const n = parseInt(process.env.AI_DAILY_BUDGET ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_BUDGET;
}

/**
 * Atomically add `units` to today's global AI-call count and report whether the
 * call stays within budget. `units` lets a multi-call request (e.g. the copilot
 * agentic loop, up to 4 Claude calls) reserve its worst-case cost up front.
 */
export async function reserveAiBudget(units = 1): Promise<boolean> {
  const max = aiDailyBudget();
  const day = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
  try {
    const db = await getDB();
    const run = () => db.prepare(UPSERT).bind(day, units).first<{ count: number }>();
    let row: { count: number } | null;
    try {
      row = await run();
    } catch (e) {
      // First call ever — table not provisioned yet. Create and retry once.
      if (String(e).includes("no such table")) {
        await db.prepare(DDL).run();
        row = await run();
      } else {
        throw e;
      }
    }
    return (row?.count ?? 0) <= max;
  } catch {
    return true; // fail open
  }
}
