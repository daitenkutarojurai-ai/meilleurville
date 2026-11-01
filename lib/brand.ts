// Brand strings, per locale. Zero-dependency on purpose: `metadata` blocks
// across ~50 route files import this, and pulling the city seed in through a
// heavier module would be a needless build-graph edge.
//
// Spelling: "MaVilleIdéale" matches the domain (mavilleideale.fr) and the
// transactional emails. Don't reintroduce the accent-less "MaVilleIdeal".

const IS_EN = process.env.NEXT_PUBLIC_DEFAULT_LOCALE === "en";

export const BRAND = IS_EN ? "BestCitiesInFrance" : "MaVilleIdéale";

// The root layout's title template is a bare "%s" so the ~52 000 deep pages
// (cities, guides, rankings, comparisons) spend all ~60 of Google's rendered
// characters on what distinguishes them. Top-level hubs have short titles with
// room to spare, so they keep the brand for recognition in the SERP.
export const HUB_TITLE_SUFFIX = ` | ${BRAND}`;

export function hubTitle(title: string): string {
  return `${title}${HUB_TITLE_SUFFIX}`;
}

/**
 * Clamp a meta description to what a SERP actually renders (~160 chars).
 *
 * For pages whose `description` field does double duty as on-page editorial
 * copy: the full text stays on the page, only the `<meta>` tag is cut. Cuts on
 * a sentence boundary when one falls in range, otherwise on a word boundary —
 * never mid-word, and never with an ellipsis that would eat rendered chars.
 */
export function clampMeta(text: string, max = 158): string {
  if (text.length <= max) return text;
  const window = text.slice(0, max + 1);

  const sentence = Math.max(window.lastIndexOf(". "), window.lastIndexOf(" : "));
  if (sentence >= max * 0.6) return text.slice(0, sentence + 1).trim();

  // Fall back to a clause boundary before a bare word boundary. Cutting at the
  // last space leaves the snippet dangling mid-clause ("…celles où l'on peut
  // vivre à l'année sans devenir"); cutting at the preceding comma or dash ends
  // on a complete thought, which is what a reader actually scans.
  const clause = Math.max(window.lastIndexOf(", "), window.lastIndexOf(" — "), window.lastIndexOf(" – "));
  if (clause >= max * 0.6) return text.slice(0, clause).trim();

  const word = window.lastIndexOf(" ");
  return text.slice(0, word > 0 ? word : max).trim();
}

/**
 * Fit a `<title>` of the form "Head · tail, items" into what a SERP renders.
 *
 * City and pair templates append a keyword tail after the name; with a long
 * commune (« Château-Gontier-sur-Mayenne », « Saint-Paul (La Réunion) ») the
 * title ran to 98 chars and Google cut it mid-tail. Short titles are returned
 * as is; long ones drop items of the last segment from the end (on ", "), then
 * that segment. Everything before the last separator — where the city, region or
 * pair name sits — is never cut.
 */
export function fitTitle(title: string, max = 65): string {
  if (title.length <= max) return title;
  const sep = [" · ", " — ", " | "]
    .map((s) => ({ s, i: title.lastIndexOf(s) }))
    .filter((x) => x.i > 0)
    .sort((a, b) => b.i - a.i)[0];
  if (!sep) return title;
  const head = title.slice(0, sep.i);
  const tail = title.slice(sep.i + sep.s.length);
  // A comma inside parentheses is not an item boundary: « (loyer, voiture, taxes) ».
  const items: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < tail.length; i++) {
    if (tail[i] === "(") depth++;
    else if (tail[i] === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0 && tail.startsWith(", ", i)) {
      items.push(tail.slice(start, i));
      start = i + 2;
    }
  }
  items.push(tail.slice(start));
  while (items.length > 1) {
    items.pop();
    const t = `${head}${sep.s}${items.join(", ")}`;
    if (t.length <= max) return t;
  }
  // Still too long once the last segment is gone: fit what precedes it.
  return fitTitle(head, max);
}
