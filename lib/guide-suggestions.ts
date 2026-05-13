import { GUIDES } from "@/data/guides";

type Guide = (typeof GUIDES)[number];

/**
 * Score how relevant another guide is to the current one.
 * Same category = +3, each shared city = +2, each shared tag = +1.
 * Excludes the guide itself and any slug already in the hardcoded
 * relatedGuides list so the section adds new options rather than
 * duplicating the sidebar.
 */
export function suggestNextGuides(current: Guide, limit = 3): Guide[] {
  const exclude = new Set<string>([current.slug, ...current.relatedGuides]);
  const currentCities = new Set(current.relatedCities);
  const currentTags = new Set(current.tags ?? []);

  const scored = GUIDES.filter((g) => !exclude.has(g.slug))
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
      // Tie-break: prefer more recently updated guides
      return new Date(b.g.updatedAt).getTime() - new Date(a.g.updatedAt).getTime();
    })
    .slice(0, limit)
    .map((x) => x.g);

  return scored;
}
