"use client";

import { useEffect, useState } from "react";
import { Star, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  REVIEW_CATEGORIES,
  aggregateCategoryRatings,
  type ReviewCategoryId,
} from "@/lib/review-categories";

interface UserScoresCardProps {
  citySlug: string;
  cityName: string;
  /** Open the review modal. Provided by the parent. */
  onOpenReview?: () => void;
}

interface MinimalComment {
  id: string;
  categoryRatings?: Record<string, number>;
}

export function UserScoresCard({ citySlug, cityName, onOpenReview }: UserScoresCardProps) {
  const [items, setItems] = useState<MinimalComment[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?topic=${encodeURIComponent(`city:${citySlug}`)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setItems(Array.isArray(d.items) ? d.items : []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [citySlug]);

  const agg = aggregateCategoryRatings(items);
  const hasAnyRatings = agg.totalReviewers > 0;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--text-secondary)]" />
          Note communauté
        </h3>
        {agg.overallMean != null && (
          <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            {agg.overallMean.toFixed(1)}
            <span className="text-xs text-[var(--text-tertiary)] font-normal">/5</span>
          </span>
        )}
      </div>

      {!loaded ? (
        <div className="text-xs text-[var(--text-tertiary)]">Chargement…</div>
      ) : !hasAnyRatings ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/50 p-3 text-center">
          <p className="text-xs text-[var(--text-primary)] font-medium mb-1">
            Pas encore d&apos;avis communauté
          </p>
          <p className="text-[11px] text-[var(--text-tertiary)] mb-3">
            Soyez le premier à noter {cityName} sur 8 catégories.
          </p>
          {onOpenReview && (
            <button
              type="button"
              onClick={onOpenReview}
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-700 transition-colors"
            >
              Donner mon avis →
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {REVIEW_CATEGORIES.map((cat) => {
              const k = cat.id as ReviewCategoryId;
              const v = agg.perCategory[k];
              return (
                <div key={cat.id} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                    <span aria-hidden>{cat.emoji}</span>
                    {cat.label}
                  </span>
                  {v ? (
                    <span className="inline-flex items-center gap-1 font-mono-data">
                      <span className="font-bold text-[var(--text-primary)]">{v.mean.toFixed(1)}</span>
                      <span className="text-[var(--text-tertiary)]">/5</span>
                      <span className="text-[var(--text-tertiary)] tabular-nums">({v.count})</span>
                    </span>
                  ) : (
                    <span className="text-[var(--text-tertiary)]">—</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-[var(--border)]/50">
            <span className="text-[11px] text-[var(--text-tertiary)]">
              {agg.totalReviewers} habitant{agg.totalReviewers > 1 ? "s" : ""} a{agg.totalReviewers > 1 ? "ont" : ""} noté
            </span>
            {onOpenReview && (
              <button
                type="button"
                onClick={onOpenReview}
                className="text-xs text-[var(--accent)] font-semibold hover:underline"
              >
                Ajouter mon avis →
              </button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
