import { GUIDES } from "@/data/guides";

const MIN_GUIDES_PER_TAG = 3;

// Slugify a tag for URL use: lowercase, strip diacritics, replace non-word
// chars with hyphen, collapse repeats. "TGV Paris" → "tgv-paris",
// "Côte d'Azur" → "cote-d-azur".
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const tagToCount = new Map<string, number>();
const slugToOriginal = new Map<string, string>();

for (const g of GUIDES) {
  for (const t of g.tags ?? []) {
    const slug = slugifyTag(t);
    if (!slug) continue;
    tagToCount.set(slug, (tagToCount.get(slug) ?? 0) + 1);
    // Keep the first canonical casing seen for display.
    if (!slugToOriginal.has(slug)) slugToOriginal.set(slug, t);
  }
}

export const TAG_SLUGS: string[] = [...tagToCount.entries()]
  .filter(([, count]) => count >= MIN_GUIDES_PER_TAG)
  .map(([slug]) => slug)
  .sort();

export function getTagLabel(slug: string): string | null {
  return slugToOriginal.get(slug) ?? null;
}

export function getGuidesForTag(slug: string) {
  return GUIDES.filter((g) =>
    (g.tags ?? []).some((t) => slugifyTag(t) === slug)
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getAllTagsWithCounts(): { slug: string; label: string; count: number }[] {
  return TAG_SLUGS.map((slug) => ({
    slug,
    label: slugToOriginal.get(slug)!,
    count: tagToCount.get(slug)!,
  })).sort((a, b) => b.count - a.count);
}
