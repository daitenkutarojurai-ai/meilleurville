"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { cn } from "@/lib/utils";

const MEDAL = ["🥇", "🥈", "🥉"];
const REGIONS = ["Toutes", ...Array.from(new Set(CITIES_SEED.map((c) => c.region))).sort()];

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

type SortKey = "global" | keyof (typeof CITIES_SEED)[number]["scores"];

function scoreClass(s: number) {
  if (s >= 8) return "text-emerald-600";
  if (s >= 6) return "text-amber-400";
  return "text-red-500";
}

export function LeaderboardTable() {
  const [region, setRegion] = useState("Toutes");
  const [sortKey, setSortKey] = useState<SortKey>("global");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return [...CITIES_SEED]
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
  }, [region, sortKey, search]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Rechercher une ville..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors cursor-pointer"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors cursor-pointer"
        >
          <option value="global">Trier : Score global</option>
          {CRITERIA.map(({ key, label }) => (
            <option key={key} value={key}>Trier : {label}</option>
          ))}
        </select>
        {(region !== "Toutes" || search || sortKey !== "global") && (
          <button
            onClick={() => { setRegion("Toutes"); setSearch(""); setSortKey("global"); }}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Réinitialiser
          </button>
        )}
        <span className="ml-auto text-xs text-[var(--text-tertiary)]">
          {filtered.length} ville{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] px-4 py-3 w-10">#</th>
                <th className="text-left text-xs uppercase tracking-wide text-[var(--text-tertiary)] px-4 py-3">Ville</th>
                <th
                  className={cn("text-right text-xs uppercase tracking-wide px-3 py-3 cursor-pointer transition-colors", sortKey === "global" ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]")}
                  onClick={() => setSortKey("global")}
                >
                  Global ↕
                </th>
                {CRITERIA.map(({ key, label }) => (
                  <th
                    key={key}
                    className={cn("text-right text-xs uppercase tracking-wide px-2 py-3 hidden md:table-cell cursor-pointer transition-colors", sortKey === key ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]")}
                    onClick={() => setSortKey(key)}
                  >
                    {label.split(" ")[0]} ↕
                  </th>
                ))}
                <th className="text-right text-xs uppercase tracking-wide text-[var(--text-tertiary)] px-3 py-3 hidden lg:table-cell">Loyer T2</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((city, i) => (
                <tr key={city.slug} className="hover:bg-[var(--bg-elevated)] transition-colors group">
                  <td className="px-4 py-3 text-[var(--text-tertiary)] font-mono text-xs">
                    {i < 3 && region === "Toutes" && sortKey === "global" && !search ? MEDAL[i] : `${i + 1}`}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/villes/${city.slug}`} className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
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
                    {HOUSING[city.slug]?.avgRentT2 ? `${HOUSING[city.slug].avgRentT2}€` : "—"}
                  </td>
                  <td className="py-3 pl-2 pr-4">
                    <Link href={`/villes/${city.slug}`} className="text-xs text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[var(--text-secondary)]">
            Aucune ville trouvée pour ces critères.
          </div>
        )}
      </div>
    </div>
  );
}
