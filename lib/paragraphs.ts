/**
 * Split a guide section body into reading paragraphs.
 *
 * Why (2026-10-11): section bodies are single strings — median 114 words, one in
 * ten above 200 — and the template rendered each as one <p>. On a phone that is a
 * 40-line block with no place for the eye to rest. Rewriting 2 268 guides to add
 * breaks would be a content pass; this is a display rule, and it never changes a
 * word: joining the paragraphs back with a space gives the original text.
 *
 * Rules, conservative on purpose — a missed break costs nothing, a wrong one
 * cuts a sentence in two:
 * - an explicit newline in the source is always a break;
 * - otherwise a body under SPLIT_ABOVE words stays whole;
 * - a sentence ends on . ! ? … followed by a space and a capital, digit or
 *   opening quote, outside parentheses and « » quotes, and never after an
 *   initial or a known abbreviation (J.-C., M., St., av., etc.);
 * - sentences are packed greedily into paragraphs of at least TARGET words, a
 *   short tail is merged back, and a paragraph never splits a **bold** run.
 */

const SPLIT_ABOVE = 110;
const TARGET = 55;
const MIN_TAIL = 30;

const ABBREV = new Set([
  "m", "mm", "mme", "mlle", "dr", "pr", "st", "ste", "av", "apr", "j.-c", "c.-à-d", "cf", "env",
  "ex", "no", "n°", "vol", "p", "pp", "ca", "vs", "mr", "mrs", "ms", "jr", "sr", "inc", "ltd", "co",
  "e.g", "i.e", "approx", "dept", "fig", "max", "min", "hab", "km", "sq",
]);

const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const boldBalanced = (s: string) => (s.match(/\*\*/g)?.length ?? 0) % 2 === 0;

function sentences(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(" || ch === "«" || ch === "[") depth++;
    else if ((ch === ")" || ch === "»" || ch === "]") && depth > 0) depth--;
    if (depth !== 0 || !/[.!?…]/.test(ch)) continue;
    // allow a closing quote/paren right after the stop
    let j = i + 1;
    while (j < text.length && /[»"”’)]/.test(text[j])) j++;
    if (text[j] !== " ") continue;
    const next = text[j + 1];
    if (!next || !/[\p{Lu}\d«"“*]/u.test(next)) continue;
    if (ch === ".") {
      const before = text.slice(start, i).match(/([\p{L}.°-]+)$/u)?.[1] ?? "";
      const token = before.toLowerCase();
      if (/^\p{L}$/u.test(before) || ABBREV.has(token) || /^\p{Lu}\.\p{Lu}$/u.test(before)) continue;
      if (/\d$/.test(text.slice(start, i)) && /\d/.test(next)) continue;
    }
    out.push(text.slice(start, j).trim());
    start = j + 1;
  }
  const rest = text.slice(start).trim();
  if (rest) out.push(rest);
  return out;
}

function pack(text: string): string[] {
  if (words(text) <= SPLIT_ABOVE) return [text];
  const paras: string[] = [];
  let cur = "";
  for (const s of sentences(text)) {
    cur = cur ? `${cur} ${s}` : s;
    if (words(cur) >= TARGET && boldBalanced(cur)) {
      paras.push(cur);
      cur = "";
    }
  }
  if (cur) {
    if (paras.length && (words(cur) < MIN_TAIL || !boldBalanced(cur))) paras[paras.length - 1] += ` ${cur}`;
    else paras.push(cur);
  }
  return paras;
}

export function splitParagraphs(body: string): string[] {
  return body
    .split(/\s*\n+\s*/)
    .filter(Boolean)
    .flatMap(pack);
}
