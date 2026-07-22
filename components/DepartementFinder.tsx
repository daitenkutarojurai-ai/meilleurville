"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { scoreHex } from "@/lib/utils";

export interface DeptEntry {
  dept: string;
  slug: string;
  num: string;
  count: number;
  avg: number;
}

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// "2A"/"2B" sort between 19 and 21; DROM (971+) at the end.
function numRank(num: string): number {
  if (num === "2A") return 20.1;
  if (num === "2B") return 20.2;
  return Number(num);
}

type Sort = "num" | "az" | "score";

const SORTS: Array<{ id: Sort; label: string }> = [
  { id: "num", label: "N°" },
  { id: "az", label: "A-Z" },
  { id: "score", label: "Score" },
];

export function DepartementFinder({
  depts,
  cityIndex,
}: {
  depts: DeptEntry[];
  /** [nom de ville, n° de département] — permet de trouver son département en tapant sa ville. */
  cityIndex: Array<[string, string]>;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("num");

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    let list = depts;
    if (q) {
      // Une ville qui matche fait remonter son département : la façon la plus
      // naturelle de retrouver le sien est de taper le nom de sa ville.
      const viaCity = new Set(
        cityIndex.filter(([name]) => normalize(name).includes(q)).map(([, num]) => num)
      );
      list = depts.filter(
        (d) => normalize(d.dept).includes(q) || d.num.toLowerCase().startsWith(q) || viaCity.has(d.num)
      );
    }
    return [...list].sort((a, b) => {
      if (sort === "num") return numRank(a.num) - numRank(b.num);
      if (sort === "az") return a.dept.localeCompare(b.dept, "fr");
      return b.avg - a.avg;
    });
  }, [depts, cityIndex, query, sort]);

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
            placeholder="33, Gironde, ou votre ville…"
            aria-label="Chercher un département par numéro, par nom ou par ville"
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
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              aria-pressed={sort === s.id}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors ${
                sort === s.id
                  ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        {visible.length} département{visible.length > 1 ? "s" : ""}
      </p>

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((d) => (
            <Link
              key={d.slug}
              href={`/departements/${d.slug}`}
              className="group flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2.5 transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)]"
            >
              <span className="flex-shrink-0 font-mono-data text-xs font-bold text-[var(--text-tertiary)]">
                {d.num}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                  {d.dept}
                </span>
                <span className="block text-[11px] text-[var(--text-tertiary)]">
                  {d.count} ville{d.count > 1 ? "s" : ""}
                </span>
              </span>
              <span
                className="flex-shrink-0 font-mono-data text-xs font-bold"
                style={{ color: scoreHex(d.avg) }}
              >
                {d.avg.toFixed(1)}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/50 px-6 py-10 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Aucun département pour «&nbsp;{query}&nbsp;». Essayez un numéro (33), un nom
            (Gironde) ou une ville (Bordeaux).
          </p>
        </div>
      )}
    </div>
  );
}
