"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { GuideCard } from "@/components/GuideCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Guide } from "@/data/guides";
import { GUIDE_CATEGORIES } from "@/data/guides";

interface Props {
  guides: Guide[];
  /** Build-time timestamp from the server page — keeps GuideCard freshness
   *  hydration-stable. */
  now: number;
}

// Lightweight string normalisation: lowercase + strip accents so "lycée"
// matches "lycee" and "vélo" matches "velo". Avoids pulling in a fuzzy-search
// library for a 285-item list.
const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export function GuidesGrid({ guides, now }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const q = normalize(query.trim());

  // Search index built once per guides[] reference (effectively once at module
  // load, given the list comes from a static import).
  const searchIndex = useMemo(
    () =>
      guides.map((g) => ({
        guide: g,
        haystack: normalize(
          [g.title, g.intro, g.tags?.join(" ") ?? "", g.slug, g.category].join(" ")
        ),
      })),
    [guides]
  );

  const categoryMatches =
    activeCategory === "all"
      ? guides
      : guides.filter((g) => g.category === activeCategory);

  const searchMatches = q
    ? searchIndex.filter((x) => x.haystack.includes(q)).map((x) => x.guide)
    : null;

  const intersect = searchMatches
    ? categoryMatches.filter((g) => searchMatches.includes(g))
    : categoryMatches;

  // Featured slot only when nothing is being narrowed down.
  const showFeatured = activeCategory === "all" && !q;
  const featured = guides[0];
  const filtered = showFeatured ? intersect.slice(1) : intersect;

  return (
    <div className="space-y-10">
      {/* Search input */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Rechercher dans ${guides.length} guides — ville, thème, mot-clé...`}
          aria-label="Rechercher dans les guides"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] pl-10 pr-10 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

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
          {q
            ? `${intersect.length} résultat${intersect.length > 1 ? "s" : ""} pour « ${query} »`
            : activeCategory === "all"
            ? `Tous les guides (${guides.length})`
            : `${GUIDE_CATEGORIES.find(c => c.id === activeCategory)?.label} — ${filtered.length} guide${filtered.length > 1 ? "s" : ""}`
          }
        </h2>
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} now={now} featured />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/50 py-12 px-6 text-center">
            <div className="text-4xl mb-3" aria-hidden>📭</div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
              Aucun guide dans cette catégorie pour l&apos;instant.
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">
              On y travaille. En attendant, parcourez les autres catégories.
            </p>
            <button
              onClick={() => setActiveCategory("all")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 hover:bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold px-4 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Voir tous les guides
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
