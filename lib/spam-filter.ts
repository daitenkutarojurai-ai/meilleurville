/**
 * Lightweight spam / abuse filter for free-text user submissions.
 * Returns reasons; caller decides whether to reject or quarantine.
 */

// FR profanity + insults. Lower-case, normalised. Variations covered: with/without
// accent, with/without space. Word-substring matching so "enculé" catches "enculé(e)",
// "encules", etc. Reviewed 2026-05-16 for false-positive risk on city names — none of
// these strings appear in any of the 352 city slugs.
const PROFANITY = [
  // insultes courantes
  "connard", "connasse", "conne", "con ", " con,", " con.", " con!", " con?", " con-",
  "salope", "salaud", "saloperie", "salopard",
  "pute", "putain", "putes",
  "encule", "enculé", "encul",
  "fdp", "fils de p", "fils de chien",
  "ntm", "nique", "niquer", "nique ta", "nique sa",
  "ta mère", "ta mere", "tamere",
  "bite", "bites", "couille", "couilles",
  "merde", "merdeux", "merdique",
  "chiotte", "chier", "chiez",
  "tg ", "ta gueule", "ferme ta gueule", "fermes ta gueule",
  // injures racistes / homophobes — bloquées strictement
  "negre", "nègre", "negres", "bougnoul", "bicot", "youpin",
  "pédé", "pede", "tapette", "tarlouze",
  "gouine", "tafiole",
  // injures grossières orthographe variée
  "batard", "bâtard", "batards", "bâtards",
  "trou du cul", "trou duc", "trouduc",
  "salopette", // false-pos? aussi nom commun, mais usage rare
];

const SPAM_KEYWORDS = [
  // pharma
  "viagra", "cialis", "kamagra",
  // adult
  "porn", "porno", "porno gratuit", "xxx", "sex cam", "camgirl",
  // gambling
  "casino", "casino en ligne", "paris sportif", "betting",
  // crypto / scam
  "crypto", "bitcoin", "btc giveaway", "ethereum giveaway", "nft drop", "airdrop",
  "doublez votre", "double your", "guaranteed roi", "roi garanti",
  // payday / loans
  "loan", "prêt rapide", "credit rapide", "crédit rapide", "argent rapide",
  "free money", "argent gratuit", "argent facile", "gagnez de l'argent",
  // call to action SEO
  "click here", "cliquez ici", "buy now", "achetez maintenant", "commandez maintenant",
  "visit our website", "visitez notre site",
  // contact farming
  "telegram @", "telegram me", "whatsapp +", "whatsapp me",
  "contactez moi sur", "contactez-moi sur",
  // SEO outreach
  "seo service", "seo services", "backlink", "backlinks gratuit", "link exchange",
  "échange de liens", "guest post",
  // generic shilling
  "make money online", "gagner de l'argent en ligne", "work from home", "travailler à la maison",
  "investissement garanti", "high return",
];

// Domains and TLDs commonly used by spammers. Real informational URLs (gov.fr,
// service-public, insee, ademe) won't trip this — we just block ANY URL in
// user-submitted content. The site never needs users to paste links.
const URL_RE = /(https?:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|fr|io|biz|xyz|ru|cn|info|top|tk|click|loan|life|monster|website|site|online|store|shop|gq|ml|ga|cf)\b)/i;
const REPEATED_CHAR_RE = /(.)\1{6,}/; // 7+ identical chars in a row
const ALL_CAPS_RE = /^[\p{Lu}\s\d!?.,'-]{40,}$/u;

// Gibberish heuristic: a long run of consonants is unnatural in French/English
// (≥ 8 consonants in a row almost never happens in a real word) — catches
// keyboard-mashing bots. Threshold chosen to avoid false positives on common
// FR words and brand names with consonant clusters (Schwarz, Schtroumpf, etc.).
const GIBBERISH_RE = /[bcdfghjklmnpqrstvwxz]{8,}/i;
// Repeated word spam: same word repeated 4+ times consecutively.
const REPEATED_WORD_RE = /\b(\w{2,})(?:\s+\1\b){3,}/i;

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
  if (GIBBERISH_RE.test(body)) {
    return { ok: false, reason: "Message illisible (mots inexistants)." };
  }
  if (REPEATED_WORD_RE.test(body)) {
    return { ok: false, reason: "Mot répété trop souvent (spam)." };
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
