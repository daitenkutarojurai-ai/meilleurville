"use client";
import { useState, useMemo } from "react";
import Link from "@/components/AppLink";
import type { CityCore } from "@/lib/cities-light";
import { cn, scoreColor as scoreClass } from "@/lib/utils";

const MEDAL = ["🥇", "🥈", "🥉"];

const CRITERIA = [
  { key: "life" as const, label: "Qualité de vie" },
  { key: "transport" as const, label: "Transport" },
  { key: "nature" as const, label: "Nature" },
  { key: "cost" as const, label: "Coût de vie" },
  { key: "safety" as const, label: "Sécurité" },
  { key: "culture" as const, label: "Culture" },
  { key: "remoteWork" as const, label: "Télétravail" },
  { key: "schools" as const, label: "Écoles" },
];

type SortKey = "global" | keyof CityCore["scores"];

// Le tableau rendait ses 593 lignes d'un coup (10 669 balises, 1,0 Mo de balisage,
// HTML statique compris). Seules les INITIAL_VISIBLE premières sont rendues ; le
// reste se révèle au clic, les données étant déjà dans la page. Le plafond vaut
// aussi pour un filtre ou un tri. Les liens vers toutes les villes restent
// crawlables par l'index compact que la page émet sous le tableau.
const INITIAL_VISIBLE = 100;

// scoreClass = scoreColor from @/lib/utils (aliased import above)

export function LeaderboardTable({
  cities,
  rentT2BySlug,
}: {
  cities: CityCore[];
  rentT2BySlug: Record<string, number>;
}) {
  const [region, setRegion] = useState("Toutes");
  const [sortKey, setSortKey] = useState<SortKey>("global");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const REGIONS = useMemo(
    () => ["Toutes", ...Array.from(new Set(cities.map((c) => c.region))).sort()],
    [cities]
  );

  const filtered = useMemo(() => {
    return [...cities]
      .filter((c) => {
        if (region !== "Toutes" && c.region !== region) return false;
        if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        const aVal = sortKey === "global" ? a.scores.global : a.scores[sortKey as keyof typeof a.scores];
        const bVal = sortKey === "global" ? b.scores.global : b.scores[sortKey as keyof typeof b.scores];
        return bVal - aVal;
      });
  }, [cities, region, sortKey, search]);

  const capped = !showAll && filtered.length > INITIAL_VISIBLE;
  const visible = capped ? filtered.slice(0, INITIAL_VISIBLE) : filtered;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Rechercher une ville..."
          aria-label="Rechercher une ville dans le classement"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-auto rounded-full bg-white px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-sm ring-1 ring-[#C7D2FE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] transition-shadow"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          aria-label="Filtrer par région"
          className="max-w-full rounded-full bg-white px-4 py-2 text-sm font-medium text-[#312E81] shadow-sm ring-1 ring-[#C7D2FE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] transition-shadow cursor-pointer"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          aria-label="Trier le classement"
          className="max-w-full rounded-full bg-white px-4 py-2 text-sm font-medium text-[#312E81] shadow-sm ring-1 ring-[#C7D2FE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] transition-shadow cursor-pointer"
        >
          <option value="global">Trier : Score global</option>
          {CRITERIA.map(({ key, label }) => (
            <option key={key} value={key}>Trier : {label}</option>
          ))}
        </select>
        {(region !== "Toutes" || search || sortKey !== "global") && (
          <button
            onClick={() => { setRegion("Toutes"); setSearch(""); setSortKey("global"); }}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#BE185D] hover:bg-white/70 transition-colors"
          >
            Réinitialiser
          </button>
        )}
        <span className="ml-auto rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">
          {filtered.length} ville{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)] ring-1 ring-[#BAE6FD]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EEF2FF]">
                <th scope="col" className="text-left text-xs uppercase tracking-wide text-[#4338CA] px-4 py-3 w-10">#</th>
                <th scope="col" className="text-left text-xs uppercase tracking-wide text-[#4338CA] px-4 py-3">Ville</th>
                <th
                  scope="col"
                  aria-sort={sortKey === "global" ? "descending" : "none"}
                  className={cn("text-right px-3 py-3 transition-colors", sortKey === "global" ? "text-[#BE185D]" : "text-[#4338CA]")}
                >
                  <button
                    type="button"
                    onClick={() => setSortKey("global")}
                    className="text-xs uppercase tracking-wide hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
                    aria-label={`Trier par score global${sortKey === "global" ? " (actif)" : ""}`}
                  >
                    Global ↕
                  </button>
                </th>
                {CRITERIA.map(({ key, label }) => (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={sortKey === key ? "descending" : "none"}
                    className={cn("text-right px-2 py-3 hidden md:table-cell transition-colors", sortKey === key ? "text-[#BE185D]" : "text-[#4338CA]")}
                  >
                    <button
                      type="button"
                      onClick={() => setSortKey(key)}
                      className="text-xs uppercase tracking-wide hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
                      aria-label={`Trier par ${label}${sortKey === key ? " (actif)" : ""}`}
                    >
                      {label.split(" ")[0]} ↕
                    </button>
                  </th>
                ))}
                <th scope="col" className="text-right text-xs uppercase tracking-wide text-[#4338CA] px-3 py-3 hidden lg:table-cell">Loyer T2</th>
                <th scope="col" aria-label="Action" className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E7FF]">
              {visible.map((city, i) => (
                <tr key={city.slug} className={cn("hover:bg-[#F5F3FF] transition-colors group", i % 2 === 1 ? "bg-[#FAFBFF]" : "bg-white")}>
                  <td className="px-4 py-3 font-mono text-xs">
                    {i < 3 && region === "Toutes" && sortKey === "global" && !search ? (
                      <span className="text-base">{MEDAL[i]}</span>
                    ) : (
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#EEF2FF] px-1.5 font-bold text-[#4338CA]">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/villes/${city.slug}`} className="inline-block py-1.5 font-medium text-[var(--text-primary)] hover:text-[#4338CA] transition-colors">
                      {city.name}
                    </Link>
                    <div className="text-xs text-[var(--text-tertiary)]">{city.region}</div>
                  </td>
                  <td className={`px-3 py-3 text-right font-bold font-mono-data ${scoreClass(city.scores.global)}`}>
                    {city.scores.global.toFixed(1)}
                  </td>
                  {CRITERIA.map(({ key }) => (
                    <td key={key} className={`px-2 py-3 text-right font-mono-data text-xs hidden md:table-cell ${sortKey === key ? "font-bold " + scoreClass(city.scores[key]) : scoreClass(city.scores[key])}`}>
                      {city.scores[key].toFixed(1)}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right text-xs font-mono-data text-[var(--text-secondary)] hidden lg:table-cell">
                    {rentT2BySlug[city.slug] ? `${rentT2BySlug[city.slug]}€` : "—"}
                  </td>
                  <td className="py-3 pl-2 pr-4">
                    <Link href={`/villes/${city.slug}`} className="text-xs text-[#BE185D] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-lg:opacity-100 transition-opacity font-medium">
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {capped && (
          <div className="border-t border-[#E0E7FF] bg-[#FAFBFF] px-4 py-4 text-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full grad-head-0 px-6 py-2.5 text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]"
            >
              Afficher les {filtered.length - INITIAL_VISIBLE} villes suivantes
            </button>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[var(--text-secondary)]">
            Aucune ville trouvée pour ces critères.
          </div>
        )}
      </div>
    </div>
  );
}
