/**
 * Newsletter-subscriber store — Cloudflare D1 backed.
 *
 * Every subscriber is tagged with a `locale` so the French list
 * (mavilleideale.fr) and the English list (bestcitiesinfrance.com) stay
 * strictly separate — an English reader must never receive the French
 * "lettre du dimanche", and vice versa.
 *
 * Double opt-in: a new subscriber is stored PENDING (confirmed_at NULL) with a
 * confirm token, and only the confirmation email is sent. Nothing reaches a
 * Brevo list and no welcome goes out until the token is clicked
 * (GET /api/newsletter/confirm). Pending rows older than 7 days are purged
 * opportunistically from the subscribe handlers.
 *
 * If BREVO_API_KEY is set, each CONFIRMED subscriber is also:
 *   - added to the matching Brevo list (BREVO_LIST_ID_FR / _EN, or the row's
 *     explicit list_id — the vacances funnel pins list 4);
 *   - sent a locale-appropriate welcome email.
 * Both Brevo calls are best-effort.
 */
import { getDB } from "@/lib/db";
import { generateLoginToken } from "@/lib/auth-tokens";
import { sendBrevoEmail, addBrevoContact, type BrevoSender } from "@/lib/brevo";

export type NewsletterLocale = "fr" | "en";

const PENDING_TTL_MS = 7 * 24 * 60 * 60_000;

export interface Subscriber {
  id: string;
  email: string;
  locale: NewsletterLocale;
  createdAt: string;
  confirmToken: string | null;
  confirmedAt: string | null;
  /** Explicit Brevo list override (vacances funnel = 4). Default: locale list. */
  listId?: number;
}

interface Row {
  id: string;
  email: string;
  locale: string;
  created_at: string;
  confirm_token: string | null;
  confirmed_at: string | null;
  list_id: number | null;
}

function rowToSubscriber(r: Row): Subscriber {
  return {
    id: r.id,
    email: r.email,
    locale: r.locale as NewsletterLocale,
    createdAt: r.created_at,
    confirmToken: r.confirm_token,
    confirmedAt: r.confirmed_at,
    listId: r.list_id ?? undefined,
  };
}

/**
 * Record a subscriber as PENDING confirmation. Idempotent per
 * (email, locale, listId): re-subscribing while pending reuses (or restores)
 * the confirm token; an already-confirmed address is a no-op
 * (`alreadySubscribed: true` — caller must NOT send any email). The same
 * address MAY exist once per locale (someone who reads both domains) and once
 * more per explicit list (vacances) — they are separate lists.
 */
export async function addSubscriber(input: {
  email: string;
  locale: NewsletterLocale;
  listId?: number;
}): Promise<{ subscriber: Subscriber; alreadySubscribed: boolean }> {
  const db = await getDB();
  const email = input.email.trim().toLowerCase();

  const existing = await db
    .prepare(
      "SELECT * FROM newsletter_subscribers WHERE email = ? AND locale = ? AND COALESCE(list_id, 0) = ?",
    )
    .bind(email, input.locale, input.listId ?? 0)
    .first<Row>();
  if (existing) {
    const sub = rowToSubscriber(existing);
    if (sub.confirmedAt) return { subscriber: sub, alreadySubscribed: true };
    // Pending re-subscribe: reuse the token (rotate only if a legacy row lacks one).
    if (!sub.confirmToken) {
      sub.confirmToken = generateLoginToken();
      await db
        .prepare("UPDATE newsletter_subscribers SET confirm_token = ? WHERE id = ?")
        .bind(sub.confirmToken, sub.id)
        .run();
    }
    return { subscriber: sub, alreadySubscribed: false };
  }

  const subscriber: Subscriber = {
    id: crypto.randomUUID(),
    email,
    locale: input.locale,
    createdAt: new Date().toISOString(),
    confirmToken: generateLoginToken(),
    confirmedAt: null,
    listId: input.listId,
  };
  await db
    .prepare(
      "INSERT INTO newsletter_subscribers (id, email, locale, created_at, confirm_token, confirmed_at, list_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(
      subscriber.id,
      subscriber.email,
      subscriber.locale,
      subscriber.createdAt,
      subscriber.confirmToken,
      null,
      subscriber.listId ?? null,
    )
    .run();
  return { subscriber, alreadySubscribed: false };
}

export async function findByConfirmToken(token: string): Promise<Subscriber | undefined> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT * FROM newsletter_subscribers WHERE confirm_token = ?")
    .bind(token)
    .first<Row>();
  return row ? rowToSubscriber(row) : undefined;
}

/** True if a pending subscription's confirm window (7 days) has lapsed. */
export function isPendingExpired(sub: Subscriber, nowMs: number = Date.now()): boolean {
  return !sub.confirmedAt && nowMs - Date.parse(sub.createdAt) > PENDING_TTL_MS;
}

/** Mark a pending subscriber confirmed. Returns the subscriber, or undefined if the token is unknown/already used. */
export async function confirmSubscriber(token: string): Promise<Subscriber | undefined> {
  const db = await getDB();
  const sub = await findByConfirmToken(token);
  if (!sub || sub.confirmedAt) return undefined;
  const confirmedAt = new Date().toISOString();
  await db
    .prepare(
      "UPDATE newsletter_subscribers SET confirmed_at = ? WHERE confirm_token = ? AND confirmed_at IS NULL",
    )
    .bind(confirmedAt, token)
    .run();
  return { ...sub, confirmedAt };
}

/** Opportunistic cleanup: drop pending rows whose 7-day confirm window lapsed. */
export async function purgePendingSubscribers(): Promise<void> {
  const db = await getDB();
  const cutoff = new Date(Date.now() - PENDING_TTL_MS).toISOString();
  await db
    .prepare(
      "DELETE FROM newsletter_subscribers WHERE confirmed_at IS NULL AND confirm_token IS NOT NULL AND created_at < ?",
    )
    .bind(cutoff)
    .run();
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

/** Best-effort: add the subscriber to its Brevo list (explicit list_id, else the locale's). */
export async function maybeSyncList(sub: Subscriber): Promise<boolean> {
  const listId = sub.listId ?? LIST_ID_BY_LOCALE[sub.locale];
  if (listId === undefined) return false;
  return addBrevoContact({ email: sub.email, listId });
}

// Sending identities. The domains must be authenticated in Brevo (the user has
// authenticated mavilleideale.fr and bestcitiesinfrance.com). Overridable.
const SENDER_BY_LOCALE: Record<NewsletterLocale, BrevoSender> = {
  fr: {
    email: process.env.NEWSLETTER_FROM_EMAIL_FR ?? "lettre@mavilleideale.fr",
    name: "MaVilleIdéale",
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
      "Merci de votre inscription à la lettre de MaVilleIdéale.",
      "",
      "Chaque dimanche : un nouveau classement, l'analyse de la ville du mois,",
      "et des alertes sur les villes que vous suivez.",
      "",
      "Pour vous désabonner, répondez simplement à cet email.",
      "",
      "— L'équipe MaVilleIdéale",
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
