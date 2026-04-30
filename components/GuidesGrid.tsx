"use client";
import { useState } from "react";
import Link from "next/link";
import { GuideCard } from "@/components/GuideCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Guide } from "@/data/guides";
import { GUIDE_CATEGORIES } from "@/data/guides";

interface Props {
  guides: Guide[];
}

export function GuidesGrid({ guides }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const featured = guides[0];
  const filtered = activeCategory === "all"
    ? guides.slice(1)
    : guides.filter((g) => g.category === activeCategory);

  const showFeatured = activeCategory === "all";

  return (
    <div className="space-y-10">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "rounded-full border text-xs font-medium px-3 py-1.5 transition-colors cursor-pointer",
            activeCategory === "all"
              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
              : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
          )}
        >
          Tous les guides ({guides.length})
        </button>
        {GUIDE_CATEGORIES.map((cat) => {
          const count = guides.filter((g) => g.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "rounded-full border text-xs font-medium px-3 py-1.5 transition-colors cursor-pointer",
                activeCategory === cat.id
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
              )}
            >
              {cat.emoji} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Featured guide — only when showing all */}
      {showFeatured && featured && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-4">
            À la une
          </h2>
          <Link
            href={`/guides/${featured.slug}`}
            className="group block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-xl hover:shadow-[var(--accent)]/5 transition-all duration-200 p-8"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center text-4xl">
                {featured.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="accent">{GUIDE_CATEGORIES.find(c => c.id === featured.category)?.label ?? featured.category}</Badge>
                  <span className="text-xs text-[var(--text-tertiary)]">{featured.readMinutes} min de lecture</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-3">
                  {featured.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {featured.intro}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {featured.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Grid */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-4">
          {activeCategory === "all"
            ? `Tous les guides (${guides.length})`
            : `${GUIDE_CATEGORIES.find(c => c.id === activeCategory)?.label} — ${filtered.length} guide${filtered.length > 1 ? "s" : ""}`
          }
        </h2>
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} featured />
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-secondary)] py-8 text-center">
            Aucun guide dans cette catégorie pour l'instant.
          </p>
        )}
      </div>
    </div>
  );
}
