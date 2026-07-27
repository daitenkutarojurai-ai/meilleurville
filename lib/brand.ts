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
  const word = window.lastIndexOf(" ");
  return text.slice(0, word > 0 ? word : max).trim();
}
