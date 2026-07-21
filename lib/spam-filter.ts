/**
 * Lightweight spam / abuse filter for free-text user submissions.
 * Returns reasons; caller decides whether to reject or quarantine.
 */

/**
 * Matching is **word-boundary aware and diacritic-insensitive**, never a raw
 * substring test. Substring matching rejected ordinary French: "habite" hit
 * "bite", "balcon" hit "con", "connexion" hit "conne", "unique"/"technique"/
 * "clinique" hit "nique", "dispute" hit "pute", "fichier" hit "chier". On a
 * site whose whole point is residents describing where they live, that killed
 * most legitimate reviews.
 *
 * Because the body is normalised (accents stripped) before matching, each entry
 * is written unaccented: "encule" also catches "enculé". Inflections are listed
 * explicitly rather than inferred, so the blocklist stays auditable.
 */
const PROFANITY_WORDS = [
  // insultes courantes
  "con", "cons", "conne", "connes", "connard", "connards", "connasse", "connasses",
  "salope", "salopes", "salaud", "salauds", "saloperie", "saloperies", "salopard", "salopards",
  "pute", "putes", "putain", "putains",
  "encul", "encule", "encules", "enculee", "enculees", "enculer",
  "fdp", "ntm",
  "nique", "niques", "niquer", "niquee",
  "tamere",
  "bite", "bites", "couille", "couilles",
  "merde", "merdes", "merdeux", "merdique", "merdiques",
  "chiotte", "chiottes", "chier", "chiez",
  "tg",
  // injures racistes / homophobes — bloquées strictement
  "negre", "negres", "negresse", "bougnoul", "bougnoule", "bougnoules",
  "bicot", "bicots", "youpin", "youpins",
  "pede", "pedes", "tapette", "tapettes", "tarlouze", "tarlouzes",
  "gouine", "gouines", "tafiole", "tafioles",
  // injures grossières orthographe variée
  "batard", "batards", "batarde", "batardes",
  "trouduc", "trouducs",
];

// Multi-word / deliberately truncated patterns. Anchored at a word start but
// with no trailing boundary, so "fils de p" still catches "fils de pute".
const PROFANITY_PHRASES = [
  "ta mere", "ta gueule", "ferme ta gueule", "fermes ta gueule",
  "fils de p", "fils de chien",
  "trou du cul", "trou duc",
];

const SPAM_KEYWORDS = [
  // pharma
  "viagra", "cialis", "kamagra",
  // adult
  "porn", "porno", "porno gratuit", "xxx", "sex cam", "camgirl",
  // gambling — NOT bare "casino": it's a real amenity in the spa towns we cover
  // (Vichy, Évian, Aix-les-Bains) and a major French supermarket chain.
  "casino en ligne", "paris sportif", "betting",
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

/** Lowercase + strip diacritics, so "enculé" and "encule" match the same entry. */
function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// `\p{L}` lookarounds rather than `\b`: `\b` treats an accented letter as a word
// boundary, which would let "enculé" slip through as "encul" + boundary.
const PROFANITY_WORD_RE = new RegExp(
  `(?<!\\p{L})(?:${PROFANITY_WORDS.map(escapeRe).join("|")})(?!\\p{L})`,
  "u",
);
const PROFANITY_PHRASE_RE = new RegExp(
  `(?<!\\p{L})(?:${PROFANITY_PHRASES.map(escapeRe).join("|")})`,
  "u",
);

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
  const normalized = normalize(body);

  if (URL_RE.test(body)) {
    return { ok: false, reason: "Les liens ne sont pas autorisés." };
  }
  if (PROFANITY_WORD_RE.test(normalized) || PROFANITY_PHRASE_RE.test(normalized)) {
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
