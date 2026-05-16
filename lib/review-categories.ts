// T3 — Multi-category review system.
// Eight categories displayed as 1-5 star ratings on the city review form.
// IDs stay stable forever (used as keys in Comment.categoryRatings).

export const REVIEW_CATEGORIES = [
  { id: "transport", label: "Transports", emoji: "🚆" },
  { id: "nature", label: "Nature & espaces verts", emoji: "🌳" },
  { id: "securite", label: "Sécurité", emoji: "🛡️" },
  { id: "vie-nocturne", label: "Vie nocturne", emoji: "🌙" },
  { id: "cout", label: "Coût de la vie", emoji: "💰" },
  { id: "emploi", label: "Emploi", emoji: "💼" },
  { id: "ecoles", label: "Écoles", emoji: "🏫" },
  { id: "ambiance", label: "Ambiance générale", emoji: "✨" },
] as const;

export type ReviewCategoryId = (typeof REVIEW_CATEGORIES)[number]["id"];

export function isReviewCategoryId(s: string): s is ReviewCategoryId {
  return REVIEW_CATEGORIES.some((c) => c.id === s);
}

// Average per category across an array of comments that carry categoryRatings.
// Returns null when no rating exists for a category (avoids fake zeros).
export function aggregateCategoryRatings(
  comments: Array<{ categoryRatings?: Record<string, number> }>,
): { perCategory: Record<ReviewCategoryId, { mean: number; count: number } | null>; overallMean: number | null; totalReviewers: number } {
  const sums: Record<ReviewCategoryId, { sum: number; count: number }> = {} as never;
  for (const cat of REVIEW_CATEGORIES) {
    sums[cat.id] = { sum: 0, count: 0 };
  }
  let totalReviewers = 0;
  for (const c of comments) {
    if (!c.categoryRatings) continue;
    let touched = false;
    for (const cat of REVIEW_CATEGORIES) {
      const v = c.categoryRatings[cat.id];
      if (typeof v === "number" && v >= 1 && v <= 5) {
        sums[cat.id].sum += v;
        sums[cat.id].count += 1;
        touched = true;
      }
    }
    if (touched) totalReviewers += 1;
  }
  const perCategory: Record<ReviewCategoryId, { mean: number; count: number } | null> = {} as never;
  let overallSum = 0;
  let overallCount = 0;
  for (const cat of REVIEW_CATEGORIES) {
    const s = sums[cat.id];
    if (s.count > 0) {
      perCategory[cat.id] = { mean: s.sum / s.count, count: s.count };
      overallSum += s.sum;
      overallCount += s.count;
    } else {
      perCategory[cat.id] = null;
    }
  }
  return {
    perCategory,
    overallMean: overallCount > 0 ? overallSum / overallCount : null,
    totalReviewers,
  };
}
