/**
 * Newsletter-subscriber store — Cloudflare D1 backed.
 *
 * Every subscriber is tagged with a `locale` so the French list
 * (mavilleideale.fr) and the English list (bestcitiesinfrance.com) stay
 * strictly separate — an English reader must never receive the French
 * "lettre du dimanche", and vice versa.
 *
 * If BREVO_API_KEY is set, each NEW subscriber is also:
 *   - added to the matching Brevo list (BREVO_LIST_ID_FR / _EN), so campaigns
 *     can be sent per language straight from the Brevo dashboard;
 *   - sent a locale-appropriate welcome email.
 * Both Brevo calls are best-effort.
 */
import { getDB } from "@/lib/db";
import { sendBrevoEmail, addBrevoContact, type BrevoSender } from "@/lib/brevo";

export type NewsletterLocale = "fr" | "en";

export interface Subscriber {
  id: string;
  email: string;
  locale: NewsletterLocale;
  createdAt: string;
}

interface Row {
  id: string;
  email: string;
  locale: string;
  created_at: string;
}

function rowToSubscriber(r: Row): Subscriber {
  return {
    id: r.id,
    email: r.email,
    locale: r.locale as NewsletterLocale,
    createdAt: r.created_at,
  };
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
  const db = await getDB();
  const email = input.email.trim().toLowerCase();

  const existing = await db
    .prepare("SELECT * FROM newsletter_subscribers WHERE email = ? AND locale = ?")
    .bind(email, input.locale)
    .first<Row>();
  if (existing) return { subscriber: rowToSubscriber(existing), alreadySubscribed: true };

  const subscriber: Subscriber = {
    id: crypto.randomUUID(),
    email,
    locale: input.locale,
    createdAt: new Date().toISOString(),
  };
  await db
    .prepare(
      "INSERT INTO newsletter_subscribers (id, email, locale, created_at) VALUES (?, ?, ?, ?)",
    )
    .bind(subscriber.id, subscriber.email, subscriber.locale, subscriber.createdAt)
    .run();
  return { subscriber, alreadySubscribed: false };
}

// Brevo list ids — one list per locale, set as env vars (numeric values).
function numericEnv(name: string): number | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

const LIST_ID_BY_LOCALE: Record<NewsletterLocale, number | undefined> = {
  fr: numericEnv("BREVO_LIST_ID_FR"),
  en: numericEnv("BREVO_LIST_ID_EN"),
};

/** Best-effort: add the subscriber to the locale's Brevo list. */
export async function maybeSyncList(sub: Subscriber): Promise<boolean> {
  const listId = LIST_ID_BY_LOCALE[sub.locale];
  if (listId === undefined) return false;
  return addBrevoContact({ email: sub.email, listId });
}

// Sending identities. The domains must be authenticated in Brevo (the user has
// authenticated mavilleideale.fr and bestcitiesinfrance.com). Overridable.
const SENDER_BY_LOCALE: Record<NewsletterLocale, BrevoSender> = {
  fr: {
    email: process.env.NEWSLETTER_FROM_EMAIL_FR ?? "lettre@mavilleideale.fr",
    name: "MeilleurVille",
  },
  en: {
    email: process.env.NEWSLETTER_FROM_EMAIL_EN ?? "newsletter@bestcitiesinfrance.com",
    name: "BestCitiesInFrance",
  },
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

/** Best-effort: send the locale-appropriate welcome email via Brevo. */
export async function maybeSendWelcome(sub: Subscriber): Promise<boolean> {
  const copy = WELCOME[sub.locale];
  return sendBrevoEmail({
    sender: SENDER_BY_LOCALE[sub.locale],
    to: sub.email,
    subject: copy.subject,
    text: copy.text,
  });
}
