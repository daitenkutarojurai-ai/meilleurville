"use client";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ArrowUpDown, Tag, Users, Mountain, MapPin, Vote } from "lucide-react";
import type { CityLight, LeanMeta } from "@/lib/cities-light";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { City } from "@/lib/types";
import { computeNicheScores, TERRAIN_LABELS, type Terrain } from "@/lib/niche-scores";

function seedToCity(s: CityLight): City {
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
  { id: "global", label: "Score global", labelEn: "Overall score", emoji: "⭐" },
  { id: "remoteWork", label: "Télétravail", labelEn: "Remote work", emoji: "💻" },
  { id: "nature", label: "Nature", labelEn: "Nature", emoji: "🌲" },
  { id: "cost", label: "Coût de vie", labelEn: "Cost of living", emoji: "💸" },
  { id: "safety", label: "Sécurité", labelEn: "Safety", emoji: "🛡️" },
  { id: "schools", label: "Écoles", labelEn: "Schools", emoji: "🎓" },
  { id: "culture", label: "Culture", labelEn: "Culture", emoji: "🎭" },
  { id: "niche:expat", label: "Expat-friendly", labelEn: "Expat-friendly", emoji: "🌍" },
  { id: "niche:remote", label: "Remote workers", labelEn: "Remote workers", emoji: "💻" },
  { id: "niche:petFriendly", label: "Pet-friendly", labelEn: "Pet-friendly", emoji: "🐶" },
  { id: "niche:retirement", label: "Retraite", labelEn: "Retirement", emoji: "🌿" },
  { id: "niche:studentLife", label: "Vie étudiante", labelEn: "Student life", emoji: "🎒" },
];


const POPULAR_TAGS: Array<{ tag: string; emoji: string; labelEn: string }> = [
  { tag: "mer", emoji: "🌊", labelEn: "sea" },
  { tag: "montagne", emoji: "⛰️", labelEn: "mountains" },
  { tag: "étudiant", emoji: "🎓", labelEn: "student" },
  { tag: "familial", emoji: "👨‍👩‍👧", labelEn: "family" },
  { tag: "vélo", emoji: "🚲", labelEn: "cycling" },
  { tag: "nature", emoji: "🌳", labelEn: "nature" },
  { tag: "dynamique", emoji: "⚡", labelEn: "lively" },
  { tag: "abordable", emoji: "💰", labelEn: "affordable" },
  { tag: "soleil", emoji: "☀️", labelEn: "sunny" },
  { tag: "culturel", emoji: "🎨", labelEn: "cultural" },
];

const NICHE_OPTIONS = [
  { id: "expat", label: "🌍 Expat-friendly", desc: "Anglais parlé, communauté internationale", labelEn: "🌍 Expat-friendly", descEn: "English spoken, international community" },
  { id: "remote", label: "💻 Télétravail", desc: "Fibre, coworkings, cafés", labelEn: "💻 Remote work", descEn: "Fibre, coworking, cafés" },
  { id: "petFriendly", label: "🐶 Animaux", desc: "Parcs, vétos, espaces verts", labelEn: "🐶 Pets", descEn: "Parks, vets, green space" },
  { id: "retirement", label: "🌿 Retraite", desc: "Calme, santé, climat doux", labelEn: "🌿 Retirement", descEn: "Calm, healthcare, mild climate" },
  { id: "studentLife", label: "🎓 Étudiant", desc: "Université, sorties, loyer accessible", labelEn: "🎓 Student", descEn: "Universities, nightlife, affordable rent" },
] as const;
type NicheKey = (typeof NICHE_OPTIONS)[number]["id"];

const TERRAIN_OPTIONS: Terrain[] = ["mer", "montagne", "plaine", "vallee"];
const TERRAIN_EMOJIS: Record<Terrain, string> = {
  mer: "🌊",
  montagne: "⛰️",
  plaine: "🌾",
  vallee: "🏞️",
};
const TERRAIN_LABELS_EN: Record<Terrain, string> = {
  mer: "Sea",
  montagne: "Mountains",
  plaine: "Plains",
  vallee: "Valley",
};

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// How many city cards are prerendered into the SSG HTML before "show all".
const INITIAL_VISIBLE = 120;

export function VillesSearch({ cities, leanMeta, locale = "fr" }: { cities: CityLight[]; leanMeta: LeanMeta; locale?: "fr" | "en" }) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
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
  const [showAll, setShowAll] = useState(false);

  const REGIONS = useMemo(() => [...new Set(cities.map((c) => c.region))].sort(), [cities]);
  const DEPARTMENTS = useMemo(() => [...new Set(cities.map((c) => c.department))].sort(), [cities]);

  // Precompute niche scores once per city — cheap, pure
  const NICHE_BY_SLUG = useMemo<Record<string, ReturnType<typeof computeNicheScores>>>(
    () => Object.fromEntries(cities.map((c) => [c.slug, computeNicheScores(c)])),
    [cities]
  );

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
    let result = cities;

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
      result = result.filter((c) => leanMeta.map[c.slug] === lean);
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
  }, [cities, leanMeta, query, sortBy, region, dept, tag, lean, niches, nicheMin, terrains, NICHE_BY_SLUG]);

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
            placeholder={L("Rechercher une ville, région, département... (raccourci : /)", "Search a city, region or department… (shortcut: /)")}
            aria-label={L("Rechercher une ville, région ou département", "Search a city, region or department")}
            data-search-shortcut
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label={L("Effacer la recherche", "Clear search")} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
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
          {L("Filtres", "Filters")}
          {hasFilters && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] text-white">
              !
            </span>
          )}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-elevated)]/40 ring-1 ring-black/[0.03] shadow-lg shadow-[var(--accent)]/[0.04] p-5 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">{L("Filtres", "Filters")}</span>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-[var(--accent)] hover:underline">
                {L("Réinitialiser", "Reset")}
              </button>
            )}
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-[var(--accent)]" /> {L("Trier par", "Sort by")}
            </label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  aria-pressed={sortBy === opt.id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                    sortBy === opt.id
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                  )}
                >
                  <span aria-hidden>{opt.emoji}</span>
                  {locale === "en" ? opt.labelEn : opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
              <Tag className="h-3.5 w-3.5 text-[var(--accent)]" /> {L("Ambiance / Profil", "Vibe / profile")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTag("")}
                aria-pressed={tag === ""}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  tag === ""
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                )}
              >
                {L("Toutes", "All")}
              </button>
              {POPULAR_TAGS.map(({ tag: t, emoji, labelEn }) => (
                <button
                  key={t}
                  onClick={() => setTag(tag === t ? "" : t)}
                  aria-pressed={tag === t}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer capitalize",
                    tag === t
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                  )}
                >
                  <span aria-hidden>{emoji}</span>
                  {locale === "en" ? labelEn : t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] flex flex-wrap items-center gap-1.5 mb-2">
              <Users className="h-3.5 w-3.5 text-[var(--accent)]" /> {L("Profils de vie · niche", "Lifestyle profiles · niche")}
              {niches.size > 0 && (
                <span className="ml-2 text-[10px] text-[var(--text-tertiary)]">
                  {L("Score mini :", "Min score:")} <span className="font-mono-data font-bold">{nicheMin.toFixed(1)}</span>/10
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
                    title={locale === "en" ? n.descEn : n.desc}
                    aria-pressed={active}
                    className={cn(
                      "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                    )}
                  >
                    {locale === "en" ? n.labelEn : n.label}
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
                aria-label={L("Score minimum sur les niches sélectionnées", "Minimum score on selected niches")}
              />
            )}
          </div>

          <div>
            <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
              <Mountain className="h-3.5 w-3.5 text-[var(--accent)]" /> {L("Terrain", "Terrain")}
            </label>
            <div className="flex flex-wrap gap-2">
              {TERRAIN_OPTIONS.map((t) => {
                const active = terrains.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTerrain(t)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                      active
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                    )}
                  >
                    <span aria-hidden>{TERRAIN_EMOJIS[t]}</span>
                    {locale === "en" ? TERRAIN_LABELS_EN[t] : TERRAIN_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
                <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" /> {L("Région", "Region")}
              </label>
              <select
                value={region}
                onChange={(e) => { setRegion(e.target.value); setDept(""); }}
                aria-label={L("Filtrer par région", "Filter by region")}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 transition-colors cursor-pointer"
              >
                <option value="">{L("Toutes les régions", "All regions")}</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
                <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" /> {L("Département", "Department")}
              </label>
              <select
                value={dept}
                onChange={(e) => { setDept(e.target.value); setRegion(""); }}
                aria-label={L("Filtrer par département", "Filter by department")}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 transition-colors cursor-pointer"
              >
                <option value="">{L("Tous les départements", "All departments")}</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mb-2">
              <Vote className="h-3.5 w-3.5 text-[var(--accent)]" /> {L("Orientation politique", "Political leaning")}
              <span className="text-[var(--text-tertiary)]">{L("· vote 1ᵉʳ tour 2022 · indicatif", "· 2022 1st-round vote · indicative")}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLean("")}
                aria-pressed={lean === ""}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${lean === "" ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"}`}
              >
                {L("Toutes", "All")}
              </button>
              {leanMeta.options.map((b) => (
                <button
                  key={b}
                  onClick={() => setLean(lean === b ? "" : b)}
                  aria-pressed={lean === b}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors flex items-center gap-1.5 ${lean === b ? "text-white" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"}`}
                  style={lean === b ? { backgroundColor: leanMeta.colors[b], borderColor: leanMeta.colors[b] } : undefined}
                >
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: lean === b ? "rgba(255,255,255,0.9)" : leanMeta.colors[b] }} />
                  {leanMeta.labels[locale][b]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-[var(--text-secondary)]">
          {filtered.length} {L(filtered.length !== 1 ? "villes" : "ville", filtered.length !== 1 ? "cities" : "city")}
        </span>
        {hasFilters && (
          <Badge variant="accent">{sortBy !== "global" ? `${L("Triées par", "Sorted by")} ${(() => { const o = SORT_OPTIONS.find(o => o.id === sortBy); return o ? (locale === "en" ? o.labelEn : o.label) : ""; })()}` : ""}{region ? ` · ${region}` : ""}{dept ? ` · ${dept}` : ""}</Badge>
        )}
      </div>

      {/* Grid — when no filter is active, the SSG HTML only prerenders the
          first INITIAL_VISIBLE cards; the rest reveal client-side (the data is
          already in the page). Any active filter renders the full set. */}
      {filtered.length > 0 ? (
        (() => {
          const capped = !hasFilters && !showAll && filtered.length > INITIAL_VISIBLE;
          const visible = capped ? filtered.slice(0, INITIAL_VISIBLE) : filtered;
          return (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visible.map((city, i) => (
                  <CityCard key={city.slug} city={city} rank={i + 1} locale={locale} />
                ))}
              </div>
              {capped && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    aria-expanded={false}
                    onClick={() => setShowAll(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-6 py-3 text-sm font-semibold text-[var(--accent)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {L(`Afficher les ${filtered.length - INITIAL_VISIBLE} villes restantes`, `Show the remaining ${filtered.length - INITIAL_VISIBLE} cities`)}
                  </button>
                </div>
              )}
            </>
          );
        })()
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)]/50 py-16 px-6 text-center">
          <div className="text-5xl mb-3" aria-hidden>🔍</div>
          <p className="text-base font-semibold text-[var(--text-primary)] mb-1">
            {L("Aucune ville ne correspond", "No city matches")} {query ? <>{L("à", "")} «&nbsp;{query}&nbsp;»</> : L("à vos filtres", "your filters")}.
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mb-5">
            {L("Essayez un autre terme, ou réinitialisez les filtres.", "Try another term, or reset the filters.")}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 hover:bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold px-4 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {L("Réinitialiser les filtres", "Reset filters")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
