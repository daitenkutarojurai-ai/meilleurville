"use client";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ArrowUpDown, Tag, Users, Mountain, MapPin, Vote } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { City } from "@/lib/types";
import { computeNicheScores, TERRAIN_LABELS, type Terrain } from "@/lib/niche-scores";
import { leanBySlug, leanOptions, BLOC_LABEL, BLOC_COLORS } from "@/lib/political-lean";

const LEAN_MAP = leanBySlug();
const LEAN_OPTS = leanOptions();

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
  { id: "global", label: "Score global", emoji: "⭐" },
  { id: "remoteWork", label: "Télétravail", emoji: "💻" },
  { id: "nature", label: "Nature", emoji: "🌲" },
  { id: "cost", label: "Coût de vie", emoji: "💸" },
  { id: "safety", label: "Sécurité", emoji: "🛡️" },
  { id: "schools", label: "Écoles", emoji: "🎓" },
  { id: "culture", label: "Culture", emoji: "🎭" },
  { id: "niche:expat", label: "Expat-friendly", emoji: "🌍" },
  { id: "niche:remote", label: "Remote workers", emoji: "💻" },
  { id: "niche:petFriendly", label: "Pet-friendly", emoji: "🐶" },
  { id: "niche:retirement", label: "Retraite", emoji: "🌿" },
  { id: "niche:studentLife", label: "Vie étudiante", emoji: "🎒" },
];

const REGIONS = [...new Set(CITIES_SEED.map((c) => c.region))].sort();
const DEPARTMENTS = [...new Set(CITIES_SEED.map((c) => c.department))].sort();

const POPULAR_TAGS: Array<{ tag: string; emoji: string }> = [
  { tag: "mer", emoji: "🌊" },
  { tag: "montagne", emoji: "⛰️" },
  { tag: "étudiant", emoji: "🎓" },
  { tag: "familial", emoji: "👨‍👩‍👧" },
  { tag: "vélo", emoji: "🚲" },
  { tag: "nature", emoji: "🌳" },
  { tag: "dynamique", emoji: "⚡" },
  { tag: "abordable", emoji: "💰" },
  { tag: "soleil", emoji: "☀️" },
  { tag: "culturel", emoji: "🎨" },
];

const NICHE_OPTIONS = [
  { id: "expat", label: "🌍 Expat-friendly", desc: "Anglais parlé, communauté internationale" },
  { id: "remote", label: "💻 Télétravail", desc: "Fibre, coworkings, cafés" },
  { id: "petFriendly", label: "🐶 Animaux", desc: "Parcs, vétos, espaces verts" },
  { id: "retirement", label: "🌿 Retraite", desc: "Calme, santé, climat doux" },
  { id: "studentLife", label: "🎓 Étudiant", desc: "Université, sorties, loyer accessible" },
] as const;
type NicheKey = (typeof NICHE_OPTIONS)[number]["id"];

const TERRAIN_OPTIONS: Terrain[] = ["mer", "montagne", "plaine", "vallee"];
const TERRAIN_EMOJIS: Record<Terrain, string> = {
  mer: "🌊",
  montagne: "⛰️",
  plaine: "🌾",
  vallee: "🏞️",
};

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
  const [lean, setLean] = useState<string>("");
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

    if (lean) {
      result = result.filter((c) => LEAN_MAP[c.slug] === lean);
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
  }, [query, sortBy, region, dept, tag, lean, niches, nicheMin, terrains]);

  function clearFilters() {
    setQuery("");
    setRegion("");
    setDept("");
    setTag("");
    setLean("");
    setNiches(new Set());
    setTerrains(new Set());
    setNicheMin(7);
    setSortBy("global");
  }

  const hasFilters = !!(query || region || dept || tag || lean || sortBy !== "global" || niches.size > 0 || terrains.size > 0);

  return (
    <div>
      {/* Search & filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sticky top-14 z-30">
        <div className="flex flex-1 items-center gap-2 rounded-2xl glass-strong border border-white/60 px-4 py-3 shadow-md focus-within:shadow-lg focus-within:ring-2 focus-within:ring-[var(--accent)]/30 transition-all">
          <Search className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une ville, région, département... (raccourci : /)"
            aria-label="Rechercher une ville, région ou département"
            data-search-shortcut
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
            <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-[var(--accent)]" /> Trier par
            </label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    sortBy === opt.id
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                  )}
                >
                  <span aria-hidden>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
              <Tag className="h-3.5 w-3.5 text-[var(--accent)]" /> Ambiance / Profil
            </label>
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
              {POPULAR_TAGS.map(({ tag: t, emoji }) => (
                <button
                  key={t}
                  onClick={() => setTag(tag === t ? "" : t)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer capitalize",
                    tag === t
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                  )}
                >
                  <span aria-hidden>{emoji}</span>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] flex flex-wrap items-center gap-1.5 mb-2">
              <Users className="h-3.5 w-3.5 text-[var(--accent)]" /> Profils de vie · niche
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
            <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
              <Mountain className="h-3.5 w-3.5 text-[var(--accent)]" /> Terrain
            </label>
            <div className="flex flex-wrap gap-2">
              {TERRAIN_OPTIONS.map((t) => {
                const active = terrains.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTerrain(t)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                    )}
                  >
                    <span aria-hidden>{TERRAIN_EMOJIS[t]}</span>
                    {TERRAIN_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
                <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" /> Région
              </label>
              <select
                value={region}
                onChange={(e) => { setRegion(e.target.value); setDept(""); }}
                aria-label="Filtrer par région"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 transition-colors cursor-pointer"
              >
                <option value="">Toutes les régions</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
                <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" /> Département
              </label>
              <select
                value={dept}
                onChange={(e) => { setDept(e.target.value); setRegion(""); }}
                aria-label="Filtrer par département"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 transition-colors cursor-pointer"
              >
                <option value="">Tous les départements</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
              <Vote className="h-3.5 w-3.5 text-[var(--accent)]" /> Orientation politique
              <span className="text-[var(--text-tertiary)]">· vote 1ᵉʳ tour 2022 · indicatif</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLean("")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${lean === "" ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"}`}
              >
                Toutes
              </button>
              {LEAN_OPTS.map((b) => (
                <button
                  key={b}
                  onClick={() => setLean(lean === b ? "" : b)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors flex items-center gap-1.5 ${lean === b ? "text-white" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"}`}
                  style={lean === b ? { backgroundColor: BLOC_COLORS[b], borderColor: BLOC_COLORS[b] } : undefined}
                >
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: lean === b ? "rgba(255,255,255,0.9)" : BLOC_COLORS[b] }} />
                  {BLOC_LABEL.fr[b]}
                </button>
              ))}
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
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/50 py-16 px-6 text-center">
          <div className="text-5xl mb-3" aria-hidden>🔍</div>
          <p className="text-base font-semibold text-[var(--text-primary)] mb-1">
            Aucune ville ne correspond {query ? <>à «&nbsp;{query}&nbsp;»</> : "à vos filtres"}.
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mb-5">
            Essayez un autre terme, ou réinitialisez les filtres.
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 hover:bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold px-4 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
