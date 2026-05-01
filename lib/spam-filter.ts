/**
 * Lightweight spam / abuse filter for free-text user submissions.
 * Returns reasons; caller decides whether to reject or quarantine.
 */

const PROFANITY = [
  "connard",
  "salope",
  "pute",
  "encule",
  "enculé",
  "encul",
  "fdp",
  "bite",
  "couille",
  "ntm",
  "nique ta",
  "fils de",
];

const SPAM_KEYWORDS = [
  "viagra",
  "cialis",
  "casino",
  "porn",
  "porno",
  "xxx",
  "crypto",
  "bitcoin",
  "btc giveaway",
  "click here",
  "cliquez ici",
  "buy now",
  "achetez maintenant",
  "free money",
  "argent gratuit",
  "loan",
  "prêt rapide",
  "telegram",
  "whatsapp +",
  "seo service",
  "seo services",
];

const URL_RE = /(https?:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|fr|io|biz|xyz|ru|cn|info|top|tk|click|loan)\b)/i;
const REPEATED_CHAR_RE = /(.)\1{6,}/; // 7+ identical chars in a row
const ALL_CAPS_RE = /^[\p{Lu}\s\d!?.,'-]{40,}$/u;

const COMMENT_HISTORY = new Map<string, { body: string; at: number }>();

export interface SpamCheck {
  ok: boolean;
  reason?: string;
}

/**
 * Hard-block content. Caller should reject 4xx if `!ok`.
 * - Any URL → reject (we never let users post links here)
 * - Profanity → reject
 * - Repeated chars / all caps → reject
 * - Spam keywords → reject
 * - Same author posting the same body within 5 min → reject (duplicate)
 */
export function checkContent(input: { author: string; body: string }): SpamCheck {
  const body = input.body.trim();
  const lower = body.toLowerCase();

  if (URL_RE.test(body)) {
    return { ok: false, reason: "Les liens ne sont pas autorisés." };
  }
  if (PROFANITY.some((w) => lower.includes(w))) {
    return { ok: false, reason: "Propos non autorisés (insultes)." };
  }
  if (SPAM_KEYWORDS.some((w) => lower.includes(w))) {
    return { ok: false, reason: "Votre message a été détecté comme indésirable." };
  }
  if (REPEATED_CHAR_RE.test(body)) {
    return { ok: false, reason: "Caractères répétés (spam)." };
  }
  if (ALL_CAPS_RE.test(body)) {
    return { ok: false, reason: "Évitez d'écrire tout en majuscules." };
  }

  // Duplicate guard — same author + same body within 5 minutes
  const key = `${input.author.trim().toLowerCase()}::${lower}`;
  const prev = COMMENT_HISTORY.get(key);
  const now = Date.now();
  if (prev && now - prev.at < 5 * 60_000) {
    return { ok: false, reason: "Vous venez d'envoyer le même message." };
  }
  COMMENT_HISTORY.set(key, { body: lower, at: now });

  // GC older entries occasionally
  if (COMMENT_HISTORY.size > 1000) {
    for (const [k, v] of COMMENT_HISTORY.entries()) {
      if (now - v.at > 30 * 60_000) COMMENT_HISTORY.delete(k);
    }
  }

  return { ok: true };
}
