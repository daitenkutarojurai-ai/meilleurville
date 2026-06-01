import { EN_GUIDES, type EnGuide } from "@/data/guides-en";

/**
 * EN analogue of suggestNextGuides (lib/guide-suggestions.ts). Scores other
 * EN guides by relevance to the current one: same category +3, each shared
 * related city +2, each shared tag +1. Falls back to the most recent guides
 * if nothing overlaps, so the "Read next" block is never empty.
 */
export function suggestNextEnGuides(current: EnGuide, limit = 3): EnGuide[] {
  const currentCities = new Set(current.relatedCities);
  const currentTags = new Set(current.tags ?? []);

  const scored = EN_GUIDES.filter((g) => g.slug !== current.slug)
    .map((g) => {
      let score = 0;
      if (g.category === current.category) score += 3;
      for (const c of g.relatedCities) if (currentCities.has(c)) score += 2;
      for (const t of g.tags ?? []) if (currentTags.has(t)) score += 1;
      return { g, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.g.updatedAt).getTime() - new Date(a.g.updatedAt).getTime();
    })
    .slice(0, limit)
    .map((x) => x.g);

  if (scored.length >= limit) return scored;

  // Top up with the most recent other guides so the block is always full.
  const have = new Set([current.slug, ...scored.map((g) => g.slug)]);
  const filler = EN_GUIDES.filter((g) => !have.has(g.slug))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit - scored.length);
  return [...scored, ...filler];
}
