"use client";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { City } from "@/lib/types";
import { computeNicheScores, TERRAIN_LABELS, type Terrain } from "@/lib/niche-scores";

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
  { id: "niche:expat", label: "Expat-friendly" },
  { id: "niche:remote", label: "Remote workers" },
  { id: "niche:petFriendly", label: "Pet-friendly" },
  { id: "niche:retirement", label: "Retraite" },
  { id: "niche:studentLife", label: "Vie étudiante" },
];

const REGIONS = [...new Set(CITIES_SEED.map((c) => c.region))].sort();
const DEPARTMENTS = [...new Set(CITIES_SEED.map((c) => c.department))].sort();

const POPULAR_TAGS = ["mer", "montagne", "étudiant", "familial", "vélo", "nature", "dynamique", "abordable", "soleil", "culturel"];

const NICHE_OPTIONS = [
  { id: "expat", label: "🌍 Expat-friendly", desc: "Anglais parlé, communauté internationale" },
  { id: "remote", label: "💻 Télétravail", desc: "Fibre, coworkings, cafés" },
  { id: "petFriendly", label: "🐶 Animaux", desc: "Parcs, vétos, espaces verts" },
  { id: "retirement", label: "🌿 Retraite", desc: "Calme, santé, climat doux" },
  { id: "studentLife", label: "🎓 Étudiant", desc: "Université, sorties, loyer accessible" },
] as const;
type NicheKey = (typeof NICHE_OPTIONS)[number]["id"];

const TERRAIN_OPTIONS: Terrain[] = ["mer", "montagne", "plaine", "vallee"];

// Precompute niche scores once per city — cheap, pure
const NICHE_BY_SLUG: Record<string, ReturnType<typeof computeNicheScores>> = Object.fromEntries(
  CITIES_SEED.map((c) => [c.slug, computeNicheScores(c)])
);

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function VillesSearch() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("global");
  const [region, setRegion] = useState<string>("");
  const [dept, setDept] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [niches, setNiches] = useState<Set<NicheKey>>(new Set());
  const [nicheMin, setNicheMin] = useState<number>(7);
  const [terrains, setTerrains] = useState<Set<Terrain>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  function toggleNiche(id: NicheKey) {
    setNiches((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function toggleTerrain(t: Terrain) {
    setTerrains((prev) => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });
  }

  const filtered = useMemo(() => {
    let result = CITIES_SEED;

    if (query) {
      const q = normalize(query);
      result = result.filter(
        (c) =>
          normalize(c.name).includes(q) ||
          normalize(c.region).includes(q) ||
          normalize(c.department).includes(q)
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

    if (niches.size > 0) {
      result = result.filter((c) => {
        const n = NICHE_BY_SLUG[c.slug];
        if (!n) return false;
        for (const k of niches) {
          if (n[k] < nicheMin) return false;
        }
        return true;
      });
    }

    if (terrains.size > 0) {
      result = result.filter((c) => terrains.has(NICHE_BY_SLUG[c.slug]?.terrain));
    }

    return [...result]
      .sort((a, b) => {
        if (sortBy.startsWith("niche:")) {
          const k = sortBy.slice(6) as Exclude<NicheKey, "terrain">;
          const av = NICHE_BY_SLUG[a.slug]?.[k] ?? 0;
          const bv = NICHE_BY_SLUG[b.slug]?.[k] ?? 0;
          return bv - av;
        }
        const av = a.scores[sortBy as keyof typeof a.scores] ?? 0;
        const bv = b.scores[sortBy as keyof typeof b.scores] ?? 0;
        return bv - av;
      })
      .map(seedToCity);
  }, [query, sortBy, region, dept, tag, niches, nicheMin, terrains]);

  function clearFilters() {
    setQuery("");
    setRegion("");
    setDept("");
    setTag("");
    setNiches(new Set());
    setTerrains(new Set());
    setNicheMin(7);
    setSortBy("global");
  }

  const hasFilters = !!(query || region || dept || tag || sortBy !== "global" || niches.size > 0 || terrains.size > 0);

  return (
    <div>
      {/* Search & filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sticky top-16 z-30">
        <div className="flex flex-1 items-center gap-2 rounded-2xl glass-strong border border-white/60 px-4 py-3 shadow-md focus-within:shadow-lg focus-within:ring-2 focus-within:ring-[var(--accent)]/30 transition-all">
          <Search className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
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

          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-2">
              Profils de vie · niche
              {niches.size > 0 && (
                <span className="ml-2 text-[10px] text-[var(--text-tertiary)]">
                  Score mini : <span className="font-mono-data font-bold">{nicheMin.toFixed(1)}</span>/10
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {NICHE_OPTIONS.map((n) => {
                const active = niches.has(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => toggleNiche(n.id)}
                    title={n.desc}
                    className={cn(
                      "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                    )}
                  >
                    {n.label}
                  </button>
                );
              })}
            </div>
            {niches.size > 0 && (
              <input
                type="range"
                min={5}
                max={9}
                step={0.5}
                value={nicheMin}
                onChange={(e) => setNicheMin(Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
                aria-label="Score minimum sur les niches sélectionnées"
              />
            )}
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-2">Terrain</label>
            <div className="flex flex-wrap gap-2">
              {TERRAIN_OPTIONS.map((t) => {
                const active = terrains.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTerrain(t)}
                    className={cn(
                      "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                    )}
                  >
                    {TERRAIN_LABELS[t]}
                  </button>
                );
              })}
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
