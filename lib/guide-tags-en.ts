import { EN_GUIDES } from "@/data/guides-en";

const MIN_GUIDES_PER_TAG = 3;

// Slugify a tag for URL use: lowercase, strip diacritics, replace non-word
// chars with hyphen, collapse repeats. EN-guide counterpart of `slugifyTag`
// in lib/guide-tags.ts — kept separate so the FR index stays untouched.
export function slugifyTagEn(tag: string): string {
  return tag
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const tagToCount = new Map<string, number>();
const slugToOriginal = new Map<string, string>();

for (const g of EN_GUIDES) {
  for (const t of g.tags ?? []) {
    const slug = slugifyTagEn(t);
    if (!slug) continue;
    tagToCount.set(slug, (tagToCount.get(slug) ?? 0) + 1);
    if (!slugToOriginal.has(slug)) slugToOriginal.set(slug, t);
  }
}

export const TAG_SLUGS_EN: string[] = [...tagToCount.entries()]
  .filter(([, count]) => count >= MIN_GUIDES_PER_TAG)
  .map(([slug]) => slug)
  .sort();

export function getTagLabelEn(slug: string): string | null {
  return slugToOriginal.get(slug) ?? null;
}

export function getGuidesForTagEn(slug: string) {
  return EN_GUIDES.filter((g) =>
    (g.tags ?? []).some((t) => slugifyTagEn(t) === slug)
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getAllTagsWithCountsEn(): { slug: string; label: string; count: number }[] {
  return TAG_SLUGS_EN.map((slug) => ({
    slug,
    label: slugToOriginal.get(slug)!,
    count: tagToCount.get(slug)!,
  })).sort((a, b) => b.count - a.count);
}

/**
 * Tags that co-occur with the given tag, ranked by co-occurrence count.
 * Each candidate must itself have a /tags/[slug] page (i.e. ≥3 guides total).
 */
export function getRelatedTagsEn(slug: string, limit = 8): { slug: string; label: string; count: number }[] {
  const target = slugToOriginal.get(slug);
  if (!target) return [];

  const cooc = new Map<string, number>();
  for (const g of EN_GUIDES) {
    if (!(g.tags ?? []).some((t) => slugifyTagEn(t) === slug)) continue;
    for (const t of g.tags ?? []) {
      const s = slugifyTagEn(t);
      if (!s || s === slug) continue;
      cooc.set(s, (cooc.get(s) ?? 0) + 1);
    }
  }

  return [...cooc.entries()]
    .filter(([s]) => TAG_SLUGS_EN.includes(s))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([s, n]) => ({ slug: s, label: slugToOriginal.get(s)!, count: n }));
}
