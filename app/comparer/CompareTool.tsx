"use client";
import { useState, useMemo } from "react";
import { Plus, X, Search, MapPin, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, formatScore, scoreColor } from "@/lib/utils";
import Link from "next/link";

type CitySeed = (typeof CITIES_SEED)[number];

const SCORE_ROWS: Array<{ key: keyof CitySeed["scores"]; label: string; emoji: string }> = [
  { key: "global", label: "Score global", emoji: "⭐" },
  { key: "life", label: "Qualité de vie", emoji: "🏡" },
  { key: "transport", label: "Transport", emoji: "🚆" },
  { key: "nature", label: "Nature", emoji: "🌿" },
  { key: "cost", label: "Coût de vie", emoji: "💰" },
  { key: "safety", label: "Sécurité", emoji: "🛡️" },
  { key: "culture", label: "Culture", emoji: "🎭" },
  { key: "remoteWork", label: "Télétravail", emoji: "💻" },
  { key: "schools", label: "Écoles", emoji: "🏫" },
];

const CITY_COLORS = ["text-blue-400", "text-violet-400", "text-amber-400"];
const CITY_BG = ["bg-blue-400/10 border-blue-400/20", "bg-violet-400/10 border-violet-400/20", "bg-amber-400/10 border-amber-400/20"];

function CityPicker({
  selected,
  onSelect,
  exclude,
  colorClass,
}: {
  selected: CitySeed | null;
  onSelect: (c: CitySeed | null) => void;
  exclude: string[];
  colorClass: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      CITIES_SEED.filter(
        (c) =>
          !exclude.includes(c.slug) &&
          c.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8),
    [query, exclude]
  );

  if (selected) {
    return (
      <div className={cn("relative rounded-2xl border p-4 flex items-center gap-3", CITY_BG[CITY_COLORS.indexOf(colorClass)])}>
        <MapPin className={cn("h-5 w-5 flex-shrink-0", colorClass)} />
        <div className="flex-1 min-w-0">
          <div className={cn("font-semibold truncate", colorClass)}>{selected.name}</div>
          <div className="text-xs text-[var(--text-secondary)]">{selected.region}</div>
        </div>
        <div className={cn("text-2xl font-bold font-mono-data", colorClass)}>
          {selected.scores.global.toFixed(1)}
        </div>
        <button
          onClick={() => onSelect(null)}
          className="ml-2 rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-colors focus-within:border-[var(--accent)]/50">
        <Search className="h-4 w-4 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Rechercher une ville..."
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-xl">
          {filtered.map((c) => (
            <button
              key={c.slug}
              onMouseDown={() => { onSelect(c); setQuery(""); setOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-elevated)]"
            >
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[var(--text-secondary)]" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-[var(--text-primary)]">{c.name}</span>
                <span className="ml-2 text-xs text-[var(--text-secondary)]">{c.region}</span>
              </div>
              <span className={cn("text-sm font-bold font-mono-data", scoreColor(c.scores.global))}>
                {c.scores.global.toFixed(1)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CompareTool() {
  const [cities, setCities] = useState<Array<CitySeed | null>>([null, null]);

  const selected = cities.filter(Boolean) as CitySeed[];

  function setCity(i: number, c: CitySeed | null) {
    setCities((prev) => {
      const next = [...prev];
      next[i] = c;
      return next;
    });
  }

  function addSlot() {
    if (cities.length < 3) setCities((p) => [...p, null]);
  }

  function removeSlot(i: number) {
    setCities((p) => p.filter((_, idx) => idx !== i));
  }

  const exclude = cities.filter(Boolean).map((c) => c!.slug);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <Badge variant="accent" className="mb-3">Comparateur</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
          Comparez les villes côte à côte
        </h1>
        <p className="text-[var(--text-secondary)]">
          Sélectionnez 2 ou 3 villes pour comparer tous leurs scores en détail.
        </p>
      </div>

      {/* City pickers */}
      <div className="grid gap-3 mb-10" style={{ gridTemplateColumns: `repeat(${cities.length}, 1fr)` }}>
        {cities.map((city, i) => (
          <div key={i} className="relative">
            <CityPicker
              selected={city}
              onSelect={(c) => setCity(i, c)}
              exclude={exclude.filter((s) => city?.slug !== s)}
              colorClass={CITY_COLORS[i]}
            />
            {cities.length > 2 && (
              <button
                onClick={() => removeSlot(i)}
                className="absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--danger)]/20 border border-[var(--danger)]/30 text-[var(--danger)] text-xs hover:bg-[var(--danger)]/30 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        {cities.length < 3 && (
          <button
            onClick={addSlot}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] p-6 text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] cursor-pointer"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm">Ajouter une ville</span>
          </button>
        )}
      </div>

      {/* Comparison table */}
      {selected.length >= 1 && (
        <div className="space-y-8">
          {/* Score grid */}
          <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary)]">
                    Critère
                  </th>
                  {cities.map((city, i) =>
                    city ? (
                      <th key={city.slug} className="px-6 py-4 text-right text-xs font-semibold">
                        <span className={CITY_COLORS[i]}>{city.name}</span>
                      </th>
                    ) : null
                  )}
                  {selected.length >= 2 && (
                    <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--text-secondary)]">
                      Meilleur
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {SCORE_ROWS.map(({ key, label, emoji }, rowIdx) => {
                  const vals = selected.map((c) => c.scores[key]);
                  const maxVal = Math.max(...vals);
                  const minVal = Math.min(...vals);

                  return (
                    <tr
                      key={key}
                      className={cn(
                        "border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--bg-elevated)]",
                        rowIdx === 0 ? "bg-[var(--bg-surface)]" : "bg-[var(--bg-canvas)]"
                      )}
                    >
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        <span className="mr-2">{emoji}</span>
                        {label}
                      </td>
                      {cities.map((city, i) =>
                        city ? (
                          <td key={city.slug} className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {selected.length >= 2 && vals.length > 1 && (
                                <div className="h-1.5 w-16 hidden sm:block rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      scoreColor(city.scores[key]).replace("text-", "bg-")
                                    )}
                                    style={{ width: `${(city.scores[key] / 10) * 100}%` }}
                                  />
                                </div>
                              )}
                              <span
                                className={cn(
                                  "font-bold font-mono-data text-sm",
                                  selected.length >= 2 && city.scores[key] === maxVal
                                    ? "text-emerald-400"
                                    : selected.length >= 2 && city.scores[key] === minVal && vals.length > 1
                                    ? "text-red-400"
                                    : scoreColor(city.scores[key])
                                )}
                              >
                                {city.scores[key].toFixed(1)}
                              </span>
                            </div>
                          </td>
                        ) : null
                      )}
                      {selected.length >= 2 && (
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-medium text-emerald-400">
                            {selected.find((c) => c.scores[key] === maxVal)?.name}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Winner summary */}
          {selected.length >= 2 && (
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selected.length}, 1fr)` }}>
              {selected.map((city, i) => {
                const wins = SCORE_ROWS.filter(({ key }) => {
                  const vals = selected.map((c) => c.scores[key]);
                  return city.scores[key] === Math.max(...vals);
                }).length;

                return (
                  <div
                    key={city.slug}
                    className={cn(
                      "rounded-2xl border p-5 text-center",
                      wins === Math.max(...selected.map((c, ci) =>
                        SCORE_ROWS.filter(({ key }) => {
                          const vals = selected.map((s) => s.scores[key]);
                          return c.scores[key] === Math.max(...vals);
                        }).length
                      ))
                        ? "border-emerald-400/30 bg-emerald-400/5"
                        : "border-[var(--border)] bg-[var(--bg-surface)]"
                    )}
                  >
                    <div className={cn("text-xl font-bold mb-1", CITY_COLORS[i])}>
                      {city.name}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mb-2">
                      <span className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">
                        {wins}
                      </span>
                      {" "}critère{wins > 1 ? "s" : ""} remporté{wins > 1 ? "s" : ""}
                    </div>
                    {wins === Math.max(...selected.map((c) =>
                      SCORE_ROWS.filter(({ key }) => {
                        const vals = selected.map((s) => s.scores[key]);
                        return c.scores[key] === Math.max(...vals);
                      }).length
                    )) && (
                      <Badge variant="success" className="text-xs">Recommandé</Badge>
                    )}
                    <div className="mt-3">
                      <Link
                        href={`/villes/${city.slug}`}
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        Voir le profil complet →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quiz CTA */}
          <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6 text-center">
            <p className="text-[var(--text-secondary)] mb-3">
              Vous hésitez encore ? Notre IA peut analyser votre profil exact.
            </p>
            <Link href="/quiz">
              <Button className="gap-2">
                ✨ Lancer le quiz de matching
              </Button>
            </Link>
          </div>
        </div>
      )}

      {selected.length === 0 && (
        <div className="py-20 text-center text-[var(--text-secondary)]">
          <div className="text-5xl mb-4">🏙️</div>
          <p className="text-lg">Sélectionnez au moins une ville pour commencer la comparaison.</p>
        </div>
      )}
    </div>
  );
}
