/**
 * Newsletter-subscriber store. File-backed with the same fallback chain as
 * contact-store / comments-store (repo file → /tmp → in-memory).
 *
 * Every subscriber is tagged with a `locale` so the French list
 * (mavilleideale.fr) and the English list (bestcitiesinfrance.com) stay
 * strictly separate — an English reader must never receive the French
 * "lettre du dimanche", and vice versa.
 *
 * If RESEND_API_KEY is set, each NEW subscriber is also:
 *   - pushed to the matching Resend Audience (RESEND_AUDIENCE_ID_FR / _EN),
 *     so broadcasts can be sent per language straight from the Resend dashboard;
 *   - sent a locale-appropriate welcome email.
 * Both Resend calls are best-effort: the JSON store is the source of truth and
 * a missing key / audience id simply skips them (no error surfaced to the user).
 */
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type NewsletterLocale = "fr" | "en";

export interface Subscriber {
  id: string;
  email: string;
  locale: NewsletterLocale;
  createdAt: string;
}

const REPO_PATH = path.join(process.cwd(), "data", "newsletter-subscribers.json");
const TMP_PATH = path.join("/tmp", "meilleurville-newsletter.json");

let memCache: Subscriber[] | null = null;
let activePath: string | null = null;

async function tryReadFrom(p: string): Promise<Subscriber[] | null> {
  try {
    const raw = await fs.readFile(p, "utf-8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as Subscriber[];
  } catch {
    /* not present yet */
  }
  return null;
}

async function tryWriteTo(p: string, data: Subscriber[]): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

async function ensureLoaded(): Promise<Subscriber[]> {
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

/**
 * Record a subscriber. Idempotent per (email, locale): subscribing the same
 * address twice on the same site is a no-op. The same address MAY exist once
 * per locale (someone who reads both domains) — they are two separate lists.
 */
export async function addSubscriber(input: {
  email: string;
  locale: NewsletterLocale;
}): Promise<{ subscriber: Subscriber; alreadySubscribed: boolean }> {
  const all = await ensureLoaded();
  const email = input.email.trim().toLowerCase();

  const existing = all.find((s) => s.email === email && s.locale === input.locale);
  if (existing) return { subscriber: existing, alreadySubscribed: true };

  const subscriber: Subscriber = {
    id: randomUUID(),
    email,
    locale: input.locale,
    createdAt: new Date().toISOString(),
  };
  all.unshift(subscriber);
  await persist();
  return { subscriber, alreadySubscribed: false };
}

const AUDIENCE_BY_LOCALE: Record<NewsletterLocale, string | undefined> = {
  fr: process.env.RESEND_AUDIENCE_ID_FR,
  en: process.env.RESEND_AUDIENCE_ID_EN,
};

/** Best-effort: add the contact to the locale's Resend Audience. */
export async function maybeSyncAudience(sub: Subscriber): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = AUDIENCE_BY_LOCALE[sub.locale];
  if (!apiKey || !audienceId) return false;
  try {
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: sub.email, unsubscribed: false }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Sending domains. Both must be verified in Resend (the user has authenticated
// mavilleideale.fr and bestcitiesinfrance.com). Overridable per environment.
const FROM_BY_LOCALE: Record<NewsletterLocale, string> = {
  fr: process.env.NEWSLETTER_FROM_EMAIL_FR ?? "lettre@mavilleideale.fr",
  en: process.env.NEWSLETTER_FROM_EMAIL_EN ?? "newsletter@bestcitiesinfrance.com",
};

const WELCOME: Record<NewsletterLocale, { subject: string; text: string }> = {
  fr: {
    subject: "Bienvenue dans la lettre du dimanche",
    text: [
      "Merci de votre inscription à la lettre de MeilleurVille.",
      "",
      "Chaque dimanche : un nouveau classement, l'analyse de la ville du mois,",
      "et des alertes sur les villes que vous suivez.",
      "",
      "Pour vous désabonner, répondez simplement à cet email.",
      "",
      "— L'équipe MeilleurVille",
    ].join("\n"),
  },
  en: {
    subject: "Welcome to the BestCitiesInFrance newsletter",
    text: [
      "Thanks for subscribing to the BestCitiesInFrance newsletter.",
      "",
      "Every Sunday: a fresh ranking, the city of the month analysed,",
      "and alerts on the French cities you follow.",
      "",
      "To unsubscribe, just reply to this email.",
      "",
      "— The BestCitiesInFrance team",
    ].join("\n"),
  },
};

/** Best-effort: send the locale-appropriate welcome email. */
export async function maybeSendWelcome(sub: Subscriber): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const copy = WELCOME[sub.locale];
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_BY_LOCALE[sub.locale],
        to: sub.email,
        subject: copy.subject,
        text: copy.text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
