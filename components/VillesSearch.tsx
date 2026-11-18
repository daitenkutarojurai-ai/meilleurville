"use client";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ArrowUpDown, Tag, Users, Mountain, MapPin, Vote } from "lucide-react";
import type { CityLight, LeanMeta } from "@/lib/cities-light";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import { EmojiBadge } from "@/components/EmojiBadge";
import { cn } from "@/lib/utils";
import type { City } from "@/lib/types";
import { computeNicheScores, TERRAIN_LABELS, type Terrain } from "@/lib/niche-scores";
import POSTAL_BY_SLUG from "@/data/city-postal-codes.json";

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

// Puces de filtre « Couleurs » : inactives blanches à anneau indigo pâle,
// actives en dégradé indigo → violet (texte blanc, ≥ 4,5:1 aux deux bouts).
const CHIP_ON = "grad-head-0 border-transparent shadow-[0_6px_14px_-8px_rgba(79,70,229,0.8)]";
const CHIP_OFF = "border-[#C7D2FE] bg-white text-[var(--text-secondary)] hover:bg-[var(--band-indigo)] hover:text-[#4338CA]";
// Libellés de groupe : icône dans une pastille teintée, en rotation indigo / rose / cyan.
const GROUP_ICON = [
  "bg-[var(--band-indigo)] text-[#4338CA]",
  "bg-[var(--band-pink)] text-[#BE185D]",
  "bg-[var(--band-aqua)] text-[#0E7490]",
] as const;

function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// How many city cards are prerendered into the SSG HTML before "show all".
// The cap also applies to filtered results: a one-letter query matches ~540
// cities, and rendering them all froze low-end phones.
const INITIAL_VISIBLE = 60;

const POSTAL: Record<string, string[]> = POSTAL_BY_SLUG;

// "75", "3300", "69003"… — a partial postal code, not a city name.
function postalPrefix(q: string): string | null {
  return /^\d{2,5}$/.test(q) ? q : null;
}

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

    if (query.trim()) {
      const raw = query.trim();
      const cp = postalPrefix(raw);
      if (cp) {
        result = result.filter((c) => (POSTAL[c.slug] ?? []).some((p) => p.startsWith(cp)));
      } else {
        const q = normalize(raw);
        result = result.filter(
          (c) =>
            normalize(c.name).includes(q) ||
            normalize(c.region).includes(q) ||
            normalize(c.department).includes(q)
        );
      }
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

  // Collapse back to the first page whenever the result set changes, without an
  // effect (React's "adjust state during render" pattern).
  const filterKey = `${query}|${region}|${dept}|${tag}|${lean}|${sortBy}|${[...niches].join(",")}|${nicheMin}|${[...terrains].join(",")}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    if (showAll) setShowAll(false);
  }

  return (
    <div>
      {/* Search & filter bar. One row at every width: stacking it on mobile made
          the sticky block ~110px tall with a transparent gap the cards scrolled
          through. The opaque backdrop below sm is what keeps them behind it. */}
      <div className="mb-6 sticky top-[var(--nav-h)] transition-[top] duration-300 z-30 flex gap-2 sm:gap-3 max-sm:bg-[#DFEEFF]/95 max-sm:backdrop-blur-sm max-sm:py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white ring-1 ring-[#C7D2FE] px-3 py-3 sm:px-4 shadow-[0_10px_24px_-16px_rgba(79,70,229,0.6)] focus-within:shadow-lg focus-within:ring-2 focus-within:ring-[var(--accent)]/50 transition-all">
          <Search className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={L("Ville, région, code postal…", "City, region, postcode…")}
            aria-label={L("Rechercher une ville, une région, un département ou un code postal", "Search a city, region, department or postcode")}
            data-search-shortcut
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label={L("Effacer la recherche", "Clear search")} className="flex-shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          className={cn(
            "flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-4 text-sm font-semibold transition-shadow max-sm:px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
            showFilters
              ? "grad-head-5 shadow-[0_10px_24px_-12px_rgba(219,39,119,0.7)]"
              : "grad-head-0 shadow-[0_10px_24px_-12px_rgba(79,70,229,0.7)] hover:shadow-[0_12px_28px_-10px_rgba(79,70,229,0.8)]"
          )}
          onClick={() => setShowFilters(!showFilters)}
          aria-label={L("Filtres", "Filters")}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="max-sm:sr-only">{L("Filtres", "Filters")}</span>
          {hasFilters && (
            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#BE185D]">
              !
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-[0_16px_36px_-22px_rgba(79,70,229,0.7)]">
          <div className="grad-head-0 flex items-center justify-between gap-3 px-5 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span aria-hidden>🎛️</span>
              {L("Filtres", "Filters")}
            </span>
            {hasFilters && (
              <button onClick={clearFilters} className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/30">
                {L("Réinitialiser", "Reset")}
              </button>
            )}
          </div>
          <div className="space-y-5 p-5">

          <div>
            <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${GROUP_ICON[0]}`} aria-hidden><ArrowUpDown className="h-3.5 w-3.5" /></span> {L("Trier par", "Sort by")}
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
                      ? CHIP_ON
                      : CHIP_OFF
                  )}
                >
                  <span aria-hidden>{opt.emoji}</span>
                  {locale === "en" ? opt.labelEn : opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${GROUP_ICON[1]}`} aria-hidden><Tag className="h-3.5 w-3.5" /></span> {L("Ambiance / Profil", "Vibe / profile")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTag("")}
                aria-pressed={tag === ""}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  tag === ""
                    ? CHIP_ON
                    : CHIP_OFF
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
                      ? CHIP_ON
                      : CHIP_OFF
                  )}
                >
                  <span aria-hidden>{emoji}</span>
                  {locale === "en" ? labelEn : t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-primary)] flex flex-wrap items-center gap-2 mb-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${GROUP_ICON[2]}`} aria-hidden><Users className="h-3.5 w-3.5" /></span> {L("Profils de vie · niche", "Lifestyle profiles · niche")}
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
                        ? CHIP_ON
                        : CHIP_OFF
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
            <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${GROUP_ICON[0]}`} aria-hidden><Mountain className="h-3.5 w-3.5" /></span> {L("Terrain", "Terrain")}
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
                        ? CHIP_ON
                        : CHIP_OFF
                    )}
                  >
                    <span aria-hidden>{TERRAIN_EMOJIS[t]}</span>
                    {locale === "en" ? TERRAIN_LABELS_EN[t] : TERRAIN_LABELS[t].replace(/^\S+\s/u, "")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${GROUP_ICON[1]}`} aria-hidden><MapPin className="h-3.5 w-3.5" /></span> {L("Région", "Region")}
              </label>
              <select
                value={region}
                onChange={(e) => { setRegion(e.target.value); setDept(""); }}
                aria-label={L("Filtrer par région", "Filter by region")}
                className="w-full rounded-xl border border-[#C7D2FE] bg-[#F5F7FF] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 transition-colors cursor-pointer"
              >
                <option value="">{L("Toutes les régions", "All regions")}</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-2">
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${GROUP_ICON[2]}`} aria-hidden><MapPin className="h-3.5 w-3.5" /></span> {L("Département", "Department")}
              </label>
              <select
                value={dept}
                onChange={(e) => { setDept(e.target.value); setRegion(""); }}
                aria-label={L("Filtrer par département", "Filter by department")}
                className="w-full rounded-xl border border-[#C7D2FE] bg-[#F5F7FF] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]/50 transition-colors cursor-pointer"
              >
                <option value="">{L("Tous les départements", "All departments")}</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-2">
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${GROUP_ICON[0]}`} aria-hidden><Vote className="h-3.5 w-3.5" /></span> {L("Orientation politique", "Political leaning")}
              <span className="text-[var(--text-tertiary)]">{L("· vote 1ᵉʳ tour 2022 · indicatif", "· 2022 1st-round vote · indicative")}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLean("")}
                aria-pressed={lean === ""}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${lean === "" ? CHIP_ON : CHIP_OFF}`}
              >
                {L("Toutes", "All")}
              </button>
              {leanMeta.options.map((b) => (
                <button
                  key={b}
                  onClick={() => setLean(lean === b ? "" : b)}
                  aria-pressed={lean === b}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors flex items-center gap-1.5 ${lean === b ? "text-white" : CHIP_OFF}`}
                  style={lean === b ? { backgroundColor: leanMeta.colors[b], borderColor: leanMeta.colors[b] } : undefined}
                >
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: lean === b ? "rgba(255,255,255,0.9)" : leanMeta.colors[b] }} />
                  {leanMeta.labels[locale][b]}
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-white px-3 py-1 text-sm text-[var(--text-secondary)] shadow-sm ring-1 ring-[#BAE6FD]">
          <span className="font-mono-data font-bold text-[#0369A1]">{filtered.length}</span> {L(filtered.length !== 1 ? "villes" : "ville", filtered.length !== 1 ? "cities" : "city")}
        </span>
        {(() => {
          const o = sortBy !== "global" ? SORT_OPTIONS.find((s) => s.id === sortBy) : undefined;
          const parts = [
            o ? `${L("Triées par", "Sorted by")} ${locale === "en" ? o.labelEn : o.label}` : "",
            region,
            dept,
          ].filter(Boolean);
          return parts.length > 0 ? <Badge variant="accent">{parts.join(" · ")}</Badge> : null;
        })()}
      </div>

      {/* Grid — only the first INITIAL_VISIBLE cards are rendered (the SSG HTML
          included); the rest reveal on click, the data is already in the page. */}
      {filtered.length > 0 ? (
        (() => {
          const capped = !showAll && filtered.length > INITIAL_VISIBLE;
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
                    className="grad-head-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-[0_12px_28px_-12px_rgba(219,39,119,0.7)] transition-shadow hover:shadow-[0_14px_32px_-10px_rgba(219,39,119,0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    {L(`Afficher les ${filtered.length - INITIAL_VISIBLE} villes restantes`, `Show the remaining ${filtered.length - INITIAL_VISIBLE} cities`)}
                  </button>
                </div>
              )}
            </>
          );
        })()
      ) : (
        <div className="rounded-2xl bg-white py-16 px-6 text-center shadow-[0_16px_36px_-22px_rgba(219,39,119,0.6)] ring-1 ring-[#FBCFE8]">
          <EmojiBadge emoji="🔍" tone="pink" size="lg" className="mb-4" />
          <p className="text-base font-semibold text-[var(--text-primary)] mb-1">
            {L("Aucune ville ne correspond", "No city matches")} {query ? <>{L("à", "")} «&nbsp;{query}&nbsp;»</> : L("à vos filtres", "your filters")}.
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mb-5">
            {L("Essayez un autre terme, un code postal, ou réinitialisez les filtres.", "Try another term, a postcode, or reset the filters.")}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="grad-head-0 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-4 py-2 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {L("Réinitialiser les filtres", "Reset filters")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
