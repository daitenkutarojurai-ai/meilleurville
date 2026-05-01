/**
 * Comments store with three persistence modes:
 *  1. File-backed under data/comments.json when running locally with a writable cwd
 *  2. /tmp/comments.json on serverless (persists for the lifetime of an instance)
 *  3. In-memory fallback if both fail
 *
 * Comments are partitioned by `topic` (e.g. "city:annecy", "guide:foo", "contact:general").
 * No auth: every commenter is identified only by the handle they type.
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface Comment {
  id: string;
  topic: string;
  author: string;
  body: string;
  rating?: number; // 1-5 optional
  createdAt: string; // ISO
}

const REPO_PATH = path.join(process.cwd(), "data", "comments.json");
const TMP_PATH = path.join("/tmp", "meilleurville-comments.json");

let memCache: Comment[] | null = null;
let activePath: string | null = null;

async function tryReadFrom(p: string): Promise<Comment[] | null> {
  try {
    const raw = await fs.readFile(p, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as Comment[];
  } catch {
    /* not present yet */
  }
  return null;
}

async function tryWriteTo(p: string, data: Comment[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

async function ensureLoaded(): Promise<Comment[]> {
  if (memCache) return memCache;

  // Prefer repo file if it exists (and survived deploy)
  const repoData = await tryReadFrom(REPO_PATH);
  if (repoData) {
    memCache = repoData;
    activePath = REPO_PATH;
    return memCache;
  }

  // Try /tmp (serverless instance-scope)
  const tmpData = await tryReadFrom(TMP_PATH);
  if (tmpData) {
    memCache = tmpData;
    activePath = TMP_PATH;
    return memCache;
  }

  // Probe writability — repo first, then /tmp, else in-memory only
  if (await tryWriteTo(REPO_PATH, [])) {
    activePath = REPO_PATH;
    memCache = [];
  } else if (await tryWriteTo(TMP_PATH, [])) {
    activePath = TMP_PATH;
    memCache = [];
  } else {
    activePath = null;
    memCache = [];
  }

  return memCache;
}

async function persist(): Promise<void> {
  if (!memCache || !activePath) return;
  await tryWriteTo(activePath, memCache);
}

export async function listComments(topic: string, limit = 100): Promise<Comment[]> {
  const all = await ensureLoaded();
  return all
    .filter((c) => c.topic === topic)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function countComments(topic: string): Promise<number> {
  const all = await ensureLoaded();
  return all.filter((c) => c.topic === topic).length;
}

export async function addComment(input: Omit<Comment, "id" | "createdAt">): Promise<Comment> {
  const all = await ensureLoaded();
  const c: Comment = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  all.unshift(c);
  await persist();
  return c;
}
