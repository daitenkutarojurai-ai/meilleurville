"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "@/components/AppLink";
import { Search, X } from "lucide-react";
import { GuideCard, type GuideCardData } from "@/components/GuideCard";
import { EmojiBadge } from "@/components/EmojiBadge";
import { cn } from "@/lib/utils";
// NOT from data/guides — a value import there would bundle the whole corpus.
import { GUIDE_CATEGORIES } from "@/lib/guide-categories";
import { GUIDES_INITIAL_VISIBLE } from "@/lib/guide-card-projection";

interface Props {
  /** Cartes du premier rendu (à la une + GUIDES_INITIAL_VISIBLE). La liste
   *  complète est chargée depuis CARDS_URL au premier filtre, recherche ou
   *  « afficher tout » : en props, elle pesait 1,5 Mo de la page. */
  initial: GuideCardData[];
  total: number;
  categoryCounts: Record<string, number>;
  /** Build-time timestamp from the server page — keeps GuideCard freshness
   *  hydration-stable. */
  now: number;
}

// Lightweight string normalisation: lowercase + strip accents so "lycée"
// matches "lycee" and "vélo" matches "velo". Avoids pulling in a fuzzy-search
// library for a 285-item list.
const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

// `?categorie=tourisme` preselects a filter — the category chip on a guide page
// links here. Read lazily rather than in an effect: the value is known on the
// first render, so an effect would only cause a second one.
const initialCategory = () => {
  if (typeof window === "undefined") return "all";
  const c = new URLSearchParams(window.location.search).get("categorie");
  return c && GUIDE_CATEGORIES.some((cat) => cat.id === c) ? c : "all";
};

// The card is a two-line-clamped excerpt + metadata, so rendering all 654 of
// them put 1.8 MB of DOM in the page. Same treatment as VillesSearch: render a
// first batch, reveal the rest on demand (fetched from CARDS_URL, see Props).
// Every guide stays crawlable — app/guides/page.tsx emits the full link list.
const INITIAL_VISIBLE = GUIDES_INITIAL_VISIBLE;
const CARDS_URL = "/guides/cards.json";

export function GuidesGrid({ initial, total, categoryCounts, now }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [all, setAll] = useState<GuideCardData[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const q = normalize(query.trim());
  const needAll = showAll || activeCategory !== "all" || q !== "";

  // Chargé une fois, au premier besoin. En cas d'échec on garde les cartes
  // du premier rendu, et l'index complet des liens reste plus bas dans la page.
  useEffect(() => {
    if (!needAll || all || loadFailed) return;
    let cancelled = false;
    fetch(CARDS_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((list: GuideCardData[]) => { if (!cancelled) setAll(list); })
      .catch(() => { if (!cancelled) setLoadFailed(true); });
    return () => { cancelled = true; };
  }, [needAll, all, loadFailed]);

  const guides = all ?? initial;
  const loading = needAll && !all && !loadFailed;

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
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent)] pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Rechercher dans ${total} guides — ville, thème, mot-clé...`}
          aria-label="Rechercher dans les guides"
          className="w-full rounded-xl border border-white bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] pl-10 pr-10 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors"
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
              ? "border-transparent grad-head-0 shadow-[0_8px_18px_-10px_rgba(79,70,229,0.8)]"
              : "border-white bg-white text-[var(--text-secondary)] hover:border-[#C7D2FE] hover:text-[var(--accent)]"
          )}
        >
          Tous les guides ({total})
        </button>
        {GUIDE_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "rounded-full border text-xs font-medium px-3 py-1.5 transition-colors cursor-pointer",
                activeCategory === cat.id
                  ? "border-transparent grad-head-0 shadow-[0_8px_18px_-10px_rgba(79,70,229,0.8)]"
                  : "border-white bg-white text-[var(--text-secondary)] hover:border-[#C7D2FE] hover:text-[var(--accent)]"
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
          <h2 className="text-xs uppercase tracking-widest text-[var(--accent)] font-bold mb-4">
            À la une
          </h2>
          <Link
            href={`/guides/${featured.slug}`}
            className="group relative block overflow-hidden rounded-3xl border border-white bg-white shadow-[0_18px_40px_-20px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 hover:border-[#C7D2FE] transition-all duration-200 p-6 sm:p-8"
          >
            {/* Liseré dégradé en tête de la carte à la une. */}
            <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 grad-head-5" />
            <div className="flex flex-col sm:flex-row gap-6">
              <EmojiBadge emoji={featured.emoji} tone="pink" size="xl" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full grad-head-0 px-2.5 py-0.5 text-xs font-semibold">{GUIDE_CATEGORIES.find(c => c.id === featured.category)?.label ?? featured.category}</span>
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
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[#FCE7F3] text-[#9D174D]">
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
        <h2 className="text-xs uppercase tracking-widest text-[var(--accent)] font-bold mb-4">
          {q
            ? `${intersect.length} résultat${intersect.length > 1 ? "s" : ""} pour « ${query} »`
            : activeCategory === "all"
            ? `Tous les guides (${total})`
            : `${GUIDE_CATEGORIES.find(c => c.id === activeCategory)?.label} — ${filtered.length} guide${filtered.length > 1 ? "s" : ""}`
          }
        </h2>
        {loadFailed && (
          <p className="mb-4 text-xs text-[var(--text-tertiary)]">
            La liste complète n&apos;a pas pu être chargée : résultats limités aux {initial.length} premiers
            guides. L&apos;index complet est plus bas dans la page.
          </p>
        )}
        {loading ? (
          <p className="rounded-2xl bg-white py-10 text-center text-sm text-[var(--text-secondary)] shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
            Chargement des {total} guides…
          </p>
        ) : filtered.length > 0 ? (
          (() => {
            // Avant chargement, la vue par défaut n'a que ses 60 cartes : le
            // bouton se juge sur le vrai total (moins la carte à la une).
            const fullCount = all ? filtered.length : total - 1;
            const capped = !showAll && fullCount > INITIAL_VISIBLE;
            const visible = capped ? filtered.slice(0, INITIAL_VISIBLE) : filtered;
            return (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {visible.map((guide) => (
                    <GuideCard key={guide.slug} guide={guide} now={now} featured />
                  ))}
                </div>
                {capped && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAll(true)}
                      className="inline-flex items-center gap-2 rounded-full grad-head-0 px-6 py-3 text-sm font-semibold shadow-[0_10px_24px_-12px_rgba(79,70,229,0.7)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    >
                      Afficher les {fullCount - INITIAL_VISIBLE} guides restants
                    </button>
                  </div>
                )}
              </>
            );
          })()
        ) : (
          <div className="rounded-2xl border border-white bg-white py-12 px-6 text-center shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
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
