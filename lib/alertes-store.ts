/**
 * Alertes métrique store — R9.3.
 *
 * Stores city-watch subscriptions: user + city + what to watch (score / comments).
 * Three-tier persistence identical to comments-store: repo file → /tmp → in-memory.
 *
 * An alerte fires when:
 *  - score type: the city's global score changed (by ≥ 0.1) since last notification
 *    AND (if threshold set) the new score crossed the threshold upward.
 *  - comments type: new comments have been posted since last check.
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface Alerte {
  id: string;
  email: string;
  citySlug: string;
  cityName: string;
  types: Array<"score" | "comments">;
  scoreThreshold?: number;            // optional: alert only if score ≥ this value
  lastNotifiedScore: number;
  lastNotifiedCommentCount: number;
  unsubscribeToken: string;
  subscribedAt: string;
  active: boolean;
  locale: "fr" | "en";
}

const REPO_PATH = path.join(process.cwd(), "data", "alertes.json");
const TMP_PATH = path.join("/tmp", "meilleurville-alertes.json");

let memCache: Alerte[] | null = null;
let activePath: string | null = null;

async function tryReadFrom(p: string): Promise<Alerte[] | null> {
  try {
    const raw = await fs.readFile(p, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as Alerte[];
  } catch {
    /* not present yet */
  }
  return null;
}

async function tryWriteTo(p: string, data: Alerte[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

async function ensureLoaded(): Promise<Alerte[]> {
  if (memCache) return memCache;
  const repoData = await tryReadFrom(REPO_PATH);
  if (repoData) {
    memCache = repoData;
    activePath = REPO_PATH;
    return memCache;
  }
  const tmpData = await tryReadFrom(TMP_PATH);
  if (tmpData) {
    memCache = tmpData;
    activePath = TMP_PATH;
    return memCache;
  }
  memCache = [];
  activePath = null;
  return memCache;
}

async function persist(data: Alerte[]): Promise<void> {
  memCache = data;
  if (activePath) {
    await tryWriteTo(activePath, data);
    return;
  }
  if (await tryWriteTo(REPO_PATH, data)) {
    activePath = REPO_PATH;
    return;
  }
  if (await tryWriteTo(TMP_PATH, data)) {
    activePath = TMP_PATH;
  }
}

export async function getAllAlertes(): Promise<Alerte[]> {
  return ensureLoaded();
}

export async function getAlertesForCity(citySlug: string): Promise<Alerte[]> {
  const all = await ensureLoaded();
  return all.filter((a) => a.active && a.citySlug === citySlug);
}

export async function findByUnsubscribeToken(token: string): Promise<Alerte | undefined> {
  const all = await ensureLoaded();
  return all.find((a) => a.unsubscribeToken === token);
}

export async function findAllByEmail(email: string): Promise<Alerte[]> {
  const all = await ensureLoaded();
  return all.filter((a) => a.active && a.email.toLowerCase() === email.toLowerCase());
}

export async function findActiveByEmailAndCity(
  email: string,
  citySlug: string
): Promise<Alerte | undefined> {
  const all = await ensureLoaded();
  return all.find((a) => a.active && a.email === email && a.citySlug === citySlug);
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
  const all = await ensureLoaded();
  const existing = all.find(
    (a) => a.active && a.email === opts.email && a.citySlug === opts.citySlug
  );
  if (existing) {
    // Update existing subscription
    existing.types = opts.types;
    existing.scoreThreshold = opts.scoreThreshold;
    await persist(all);
    return existing;
  }
  const alerte: Alerte = {
    id: randomUUID(),
    email: opts.email,
    citySlug: opts.citySlug,
    cityName: opts.cityName,
    types: opts.types,
    scoreThreshold: opts.scoreThreshold,
    lastNotifiedScore: opts.currentScore,
    lastNotifiedCommentCount: opts.currentCommentCount,
    unsubscribeToken: randomUUID(),
    subscribedAt: new Date().toISOString(),
    active: true,
    locale: opts.locale,
  };
  all.push(alerte);
  await persist(all);
  return alerte;
}

export async function deactivateAlerte(token: string): Promise<boolean> {
  const all = await ensureLoaded();
  const alerte = all.find((a) => a.unsubscribeToken === token);
  if (!alerte) return false;
  alerte.active = false;
  await persist(all);
  return true;
}

export async function updateLastNotified(
  id: string,
  score: number,
  commentCount: number
): Promise<void> {
  const all = await ensureLoaded();
  const alerte = all.find((a) => a.id === id);
  if (alerte) {
    alerte.lastNotifiedScore = score;
    alerte.lastNotifiedCommentCount = commentCount;
  }
  await persist(all);
}
