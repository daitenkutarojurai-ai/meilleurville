/**
 * Contact-message store. File-backed with the same fallback chain as comments-store.
 * If RESEND_API_KEY is set in the environment, also forwards via email.
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface ContactMessage {
  id: string;
  topic: string;
  name: string;
  email: string;
  body: string;
  /** Which site the message came from. Older entries may lack it → treated as "fr". */
  locale?: "fr" | "en";
  createdAt: string;
}

const REPO_PATH = path.join(process.cwd(), "data", "contact-messages.json");
const TMP_PATH = path.join("/tmp", "meilleurville-contact.json");

let memCache: ContactMessage[] | null = null;
let activePath: string | null = null;

async function tryReadFrom(p: string): Promise<ContactMessage[] | null> {
  try {
    const raw = await fs.readFile(p, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as ContactMessage[];
  } catch {
    /* not present yet */
  }
  return null;
}

async function tryWriteTo(p: string, data: ContactMessage[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

async function ensureLoaded(): Promise<ContactMessage[]> {
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

export async function addContactMessage(
  input: Omit<ContactMessage, "id" | "createdAt">
): Promise<ContactMessage> {
  const all = await ensureLoaded();
  const m: ContactMessage = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  all.unshift(m);
  await persist();
  return m;
}

/**
 * Best-effort Resend forward. Returns true if sent.
 *
 * Every contact message — FR or EN — is delivered to a single inbox
 * (CONTACT_TO_EMAIL). Only the `from` address and the subject brand change
 * with the locale, so a reply lands on the right domain. The `from` domains
 * must be verified in Resend (mavilleideale.fr / bestcitiesinfrance.com).
 */
export async function maybeForwardEmail(m: ContactMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const to = process.env.CONTACT_TO_EMAIL ?? "daitenkutarojurai@gmail.com";
  const locale = m.locale ?? "fr";
  const from =
    locale === "en"
      ? process.env.CONTACT_FROM_EMAIL_EN ?? "hello@bestcitiesinfrance.com"
      : process.env.CONTACT_FROM_EMAIL_FR ??
        process.env.CONTACT_FROM_EMAIL ??
        "bonjour@mavilleideale.fr";
  const brand = locale === "en" ? "BestCitiesInFrance" : "MeilleurVille";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: m.email,
        subject: `[${brand}] ${m.topic} — ${m.name}`,
        text: `${m.body}\n\n— ${m.name} <${m.email}>`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
