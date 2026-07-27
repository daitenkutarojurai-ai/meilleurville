"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { scoreHex } from "@/lib/utils";

// Shared finder for administrative areas (départements, régions…). A visitor
// arrives knowing their city, sometimes a number, rarely the exact name of the
// area — so search is loose (name, number, or city) and sort is a chip row. UX
// stays identical across surfaces so the pattern is learnable once.

export interface AreaEntry {
  /** URL slug of the area. */
  slug: string;
  /** Display label (« Gironde », « Bretagne »…). */
  label: string;
  /** Optional short badge shown on the left (dept number). Hidden if absent. */
  num?: string;
  /** Cities in this area. */
  count: number;
  /** Average global score across the area's cities. */
  avg: number;
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Les n° ne sont pas tous numériques : "2A"/"2B" (Corse) se classent entre 19 et
// 21, "69D"/"69M" (Rhône / Métropole de Lyon) se suivent à l'intérieur du 69, et
// les DROM (971+) ferment la marche. On trie donc sur la partie chiffrée, la
// lettre servant de départage — sans quoi Number("69M") vaut NaN et l'ordre du
// tri « N° » devient indéterminé.
function numRank(num: string): number {
  // La Corse est le seul cas où la partie chiffrée ment : 2A/2B ont remplacé le
  // département 20, ils se classent donc à 20, pas à 2.
  const digits = num.startsWith("2A") || num.startsWith("2B") ? 20 : parseInt(num, 10);
  if (Number.isNaN(digits)) return Number.MAX_SAFE_INTEGER;
  const suffix = num.replace(/^\d+/, "");
  return digits + (suffix ? (suffix.charCodeAt(0) % 32) / 100 : 0);
}

export type AreaSort = "num" | "az" | "score";

const SORT_LABELS: Record<AreaSort, string> = {
  num: "N°",
  az: "A-Z",
  score: "Score",
};

export interface AreaFinderCopy {
  /** Search input placeholder. */
  placeholder: string;
  /** aria-label on the input. */
  searchAria: string;
  /** Displayed noun, e.g. "département" / "région". */
  singular: string;
  /** Displayed noun plural. */
  plural: string;
  /** Empty state hint (« Essayez … »). */
  emptyHint: string;
}

export interface AreaFinderProps {
  areas: AreaEntry[];
  /** [nom de ville, slug de l'area] — permet de trouver son area en tapant sa ville. */
  cityIndex: Array<[string, string]>;
  /** Route prefix for the link (e.g. "/departements", "/regions"). */
  hrefPrefix: string;
  /** Which sort chips to show, in order. Defaults to num,az,score. */
  sorts?: AreaSort[];
  /** Initial sort. Defaults to the first entry of `sorts`. */
  initialSort?: AreaSort;
  copy: AreaFinderCopy;
}

export function AreaFinder({
  areas,
  cityIndex,
  hrefPrefix,
  sorts = ["num", "az", "score"],
  initialSort,
  copy,
}: AreaFinderProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AreaSort>(initialSort ?? sorts[0]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    let list = areas;
    if (q) {
      // Une ville qui matche fait remonter son area : la façon la plus naturelle
      // de retrouver la sienne est de taper le nom de sa ville.
      const viaCity = new Set(
        cityIndex.filter(([name]) => normalize(name).includes(q)).map(([, slug]) => slug)
      );
      list = areas.filter(
        (a) =>
          normalize(a.label).includes(q) ||
          (a.num ? a.num.toLowerCase().startsWith(q) : false) ||
          viaCity.has(a.slug)
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "num") {
        // Areas without a num fall to the end so the ordering stays stable.
        if (!a.num && !b.num) return a.label.localeCompare(b.label, "fr");
        if (!a.num) return 1;
        if (!b.num) return -1;
        return numRank(a.num) - numRank(b.num);
      }
      if (sort === "az") return a.label.localeCompare(b.label, "fr");
      return b.avg - a.avg;
    });
  }, [areas, cityIndex, query, sort]);

  const anyNum = areas.some((a) => a.num);

  return (
    <div>
      <div className="mb-5 flex gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl glass-strong border border-white/60 px-3 py-3 sm:px-4 shadow-md focus-within:shadow-lg focus-within:ring-2 focus-within:ring-[var(--accent)]/30 transition-all">
          <Search className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.placeholder}
            aria-label={copy.searchAria}
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Effacer"
              className="flex-shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-1">
          {sorts.map((id) => (
            <button
              key={id}
              onClick={() => setSort(id)}
              aria-pressed={sort === id}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
                sort === id
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {SORT_LABELS[id]}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        {visible.length} {visible.length > 1 ? copy.plural : copy.singular}
      </p>

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((a) => (
            <Link
              key={a.slug}
              href={`${hrefPrefix}/${a.slug}`}
              className="group flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2.5 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)]"
            >
              {anyNum && (
                <span className="flex-shrink-0 font-mono-data text-xs font-bold text-[var(--text-tertiary)]">
                  {a.num ?? ""}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                  {a.label}
                </span>
                <span className="block text-[11px] text-[var(--text-tertiary)]">
                  {a.count} ville{a.count > 1 ? "s" : ""}
                </span>
              </span>
              <span
                className="flex-shrink-0 font-mono-data text-xs font-bold"
                style={{ color: scoreHex(a.avg) }}
              >
                {a.avg.toFixed(1)}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/50 px-6 py-10 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            {copy.emptyHint.replace("{q}", query)}
          </p>
        </div>
      )}
    </div>
  );
}
