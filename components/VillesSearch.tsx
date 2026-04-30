"use client";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { City } from "@/lib/types";

function seedToCity(s: (typeof CITIES_SEED)[number]): City {
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    region: s.region,
    department: s.department,
    population: s.population,
    latitude: s.latitude,
    longitude: s.longitude,
    scores: s.scores,
    characterTags: s.characterTags,
    reviewCount: 180 + Math.floor(s.scores.global * 30),
    sunshinedays: s.sunshinedays,
    avgTempJuly: s.avgTempJuly,
    avgTempJanuary: s.avgTempJanuary,
  };
}

const SORT_OPTIONS = [
  { id: "global", label: "Score global" },
  { id: "remoteWork", label: "Télétravail" },
  { id: "nature", label: "Nature" },
  { id: "cost", label: "Coût de vie" },
  { id: "safety", label: "Sécurité" },
  { id: "schools", label: "Écoles" },
  { id: "culture", label: "Culture" },
];

const REGIONS = [...new Set(CITIES_SEED.map((c) => c.region))].sort();
const DEPARTMENTS = [...new Set(CITIES_SEED.map((c) => c.department))].sort();

const POPULAR_TAGS = ["mer", "montagne", "étudiant", "familial", "vélo", "nature", "dynamique", "abordable", "soleil", "culturel"];

export function VillesSearch() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("global");
  const [region, setRegion] = useState<string>("");
  const [dept, setDept] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = CITIES_SEED;

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q)
      );
    }

    if (region) {
      result = result.filter((c) => c.region === region);
    }

    if (dept) {
      result = result.filter((c) => c.department === dept);
    }

    if (tag) {
      result = result.filter((c) => c.characterTags.includes(tag as never));
    }

    return [...result]
      .sort((a, b) => {
        const av = a.scores[sortBy as keyof typeof a.scores] ?? 0;
        const bv = b.scores[sortBy as keyof typeof b.scores] ?? 0;
        return bv - av;
      })
      .map(seedToCity);
  }, [query, sortBy, region, dept, tag]);

  function clearFilters() {
    setQuery("");
    setRegion("");
    setDept("");
    setTag("");
    setSortBy("global");
  }

  const hasFilters = !!(query || region || dept || tag || sortBy !== "global");

  return (
    <div>
      {/* Search & filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 focus-within:border-[var(--accent)]/50 transition-colors">
          <Search className="h-4 w-4 flex-shrink-0 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une ville, région, département..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="secondary"
          className="gap-2 whitespace-nowrap"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {hasFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] text-white">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Filtres</span>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-[var(--accent)] hover:underline">
                Réinitialiser
              </button>
            )}
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-2">Trier par</label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    sortBy === opt.id
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-2">Ambiance / Profil</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTag("")}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  tag === ""
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                )}
              >
                Toutes
              </button>
              {POPULAR_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(tag === t ? "" : t)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer capitalize",
                    tag === t
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-2">Région</label>
              <select
                value={region}
                onChange={(e) => { setRegion(e.target.value); setDept(""); }}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 transition-colors cursor-pointer"
              >
                <option value="">Toutes les régions</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--text-secondary)] block mb-2">Département</label>
              <select
                value={dept}
                onChange={(e) => { setDept(e.target.value); setRegion(""); }}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 transition-colors cursor-pointer"
              >
                <option value="">Tous les départements</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-[var(--text-secondary)]">
          {filtered.length} ville{filtered.length !== 1 ? "s" : ""}
        </span>
        {hasFilters && (
          <Badge variant="accent">{sortBy !== "global" ? `Triées par ${SORT_OPTIONS.find(o => o.id === sortBy)?.label}` : ""}{region ? ` · ${region}` : ""}{dept ? ` · ${dept}` : ""}</Badge>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((city, i) => (
            <CityCard key={city.slug} city={city} rank={i + 1} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-[var(--text-secondary)]">
            Aucune ville trouvée pour «{query}». Essayez un autre terme.
          </p>
        </div>
      )}
    </div>
  );
}
