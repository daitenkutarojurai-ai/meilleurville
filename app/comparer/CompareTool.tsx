"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, X, Search, MapPin } from "lucide-react";
import type { CityCore } from "@/lib/cities-light";
import { Badge } from "@/components/ui/Badge";
import { EmojiBadge } from "@/components/EmojiBadge";
import { cn, scoreColor } from "@/lib/utils";
import Link from "@/components/AppLink";

type CitySeed = CityCore;
type Locale = "fr" | "en";

const SCORE_ROWS: Array<{ key: keyof CitySeed["scores"]; label: string; labelEn: string; emoji: string }> = [
  { key: "global", label: "Score global", labelEn: "Overall score", emoji: "⭐" },
  { key: "life", label: "Qualité de vie", labelEn: "Quality of life", emoji: "🏡" },
  { key: "transport", label: "Transport", labelEn: "Transport", emoji: "🚆" },
  { key: "nature", label: "Nature", labelEn: "Nature", emoji: "🌿" },
  { key: "cost", label: "Coût de vie", labelEn: "Cost of living", emoji: "💰" },
  { key: "safety", label: "Sécurité", labelEn: "Safety", emoji: "🛡️" },
  { key: "culture", label: "Culture", labelEn: "Culture", emoji: "🎭" },
  { key: "remoteWork", label: "Télétravail", labelEn: "Remote work", emoji: "💻" },
  { key: "schools", label: "Écoles", labelEn: "Schools", emoji: "🏫" },
];

// « Couleurs » : une teinte par ville dans les familles décoratives indigo / rose / cyan.
// Violet, ambre, vert… restent réservés aux paliers de score (CLAUDE.md § Design identity).
const CITY_COLORS = ["text-[#4338CA]", "text-[#BE185D]", "text-[#0E7490]"];
const CITY_BG = [
  "bg-[#EEF2FF] border-[#C7D2FE]",
  "bg-[#FDF2F8] border-[#FBCFE8]",
  "bg-[#ECFEFF] border-[#A5F3FC]",
];

function CityPicker({
  allCities,
  selected,
  onSelect,
  exclude,
  colorClass,
  locale,
}: {
  allCities: CityCore[];
  selected: CitySeed | null;
  onSelect: (c: CitySeed | null) => void;
  exclude: string[];
  colorClass: string;
  locale: Locale;
}) {
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(
    () =>
      allCities.filter(
        (c) =>
          !exclude.includes(c.slug) &&
          c.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8),
    [allCities, query, exclude]
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
    <div className="relative" ref={wrapRef}>
      <div className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-[0_10px_28px_-20px_rgba(79,70,229,0.55)] ring-1 ring-[#C7D2FE] transition-shadow focus-within:ring-2 focus-within:ring-[#6366F1]">
        <Search className="h-4 w-4 text-[#4F46E5]" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={t("Rechercher une ville...", "Search a city...")}
          aria-label={t("Rechercher une ville à comparer", "Search a city to compare")}
          aria-autocomplete="list"
          aria-controls="city-picker-options"
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none"
        />
      </div>

      {open && filtered.length > 0 && (
        <div id="city-picker-options" role="listbox" className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-[#C7D2FE]">
          {filtered.map((c) => (
            <button
              key={c.slug}
              onClick={() => { onSelect(c); setQuery(""); setOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#EEF2FF] focus-visible:bg-[#EEF2FF] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]"
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

// `headingLevel="h2"` when the host page already carries the h1 (/comparer).
export function CompareTool({
  locale = "fr",
  cities: allCities,
  headingLevel = "h1",
}: { locale?: Locale; cities: CityCore[]; headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel;
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const cityHref = (slug: string) => (locale === "en" ? `/cities/${slug}` : `/villes/${slug}`);
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
        <span className="mb-3 inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
          {t("Comparateur", "Compare")}
        </span>
        <Heading className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
          <span className="gradient-text">{t("Comparez les villes côte à côte", "Compare cities side by side")}</span>
        </Heading>
        <p className="text-[var(--text-secondary)]">
          {t(
            "Sélectionnez 2 ou 3 villes pour comparer tous leurs scores en détail.",
            "Pick 2 or 3 cities to compare every score in detail."
          )}
        </p>
      </div>

      {/* City pickers */}
      <div className={cn("grid grid-cols-1 gap-3 mb-10", cities.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
        {cities.map((city, i) => (
          <div key={city?.slug ?? `slot-${i}`} className="relative">
            <CityPicker
              allCities={allCities}
              selected={city}
              onSelect={(c) => setCity(i, c)}
              exclude={exclude.filter((s) => city?.slug !== s)}
              colorClass={CITY_COLORS[i]}
              locale={locale}
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
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/70 p-6 text-[#4338CA] ring-1 ring-[#C7D2FE] transition-all hover:bg-white hover:ring-[#818CF8] hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm">{t("Ajouter une ville", "Add a city")}</span>
          </button>
        )}
      </div>

      {/* Comparison table */}
      {selected.length >= 1 && (
        <div className="space-y-8">
          {/* Score grid */}
          <div className="overflow-x-auto rounded-2xl bg-white shadow-[0_14px_36px_-22px_rgba(79,70,229,0.5)] ring-1 ring-[#C7D2FE]">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-[#C7D2FE] bg-[#EEF2FF]">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#4338CA]">
                    {t("Critère", "Metric")}
                  </th>
                  {cities.map((city, i) =>
                    city ? (
                      <th key={city.slug} className="px-6 py-4 text-right text-xs font-semibold">
                        <span className={CITY_COLORS[i]}>{city.name}</span>
                      </th>
                    ) : null
                  )}
                  {selected.length >= 2 && (
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#4338CA]">
                      {t("Meilleur", "Best")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {SCORE_ROWS.map(({ key, label, labelEn, emoji }, rowIdx) => {
                  const vals = selected.map((c) => c.scores[key]);
                  const maxVal = Math.max(...vals);
                  const minVal = Math.min(...vals);

                  return (
                    <tr
                      key={key}
                      className={cn(
                        "border-b border-[#E0E7FF] last:border-0 transition-colors hover:bg-[#EEF2FF]",
                        rowIdx === 0 ? "bg-[#F5F3FF] font-semibold" : rowIdx % 2 === 0 ? "bg-[#F8F9FF]" : "bg-white"
                      )}
                    >
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        <span className="mr-2">{emoji}</span>
                        {locale === "en" ? labelEn : label}
                      </td>
                      {cities.map((city) =>
                        city ? (
                          <td key={city.slug} className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {selected.length >= 2 && vals.length > 1 && (
                                <div className="h-1.5 w-16 hidden sm:block rounded-full bg-[#E0E7FF] overflow-hidden">
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
                                    ? "text-emerald-600"
                                    : selected.length >= 2 && city.scores[key] === minVal && vals.length > 1
                                    ? "text-red-500"
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
                          <span className="text-xs font-medium text-emerald-600">
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
                      wins === Math.max(...selected.map((c) =>
                        SCORE_ROWS.filter(({ key }) => {
                          const vals = selected.map((s) => s.scores[key]);
                          return c.scores[key] === Math.max(...vals);
                        }).length
                      ))
                        ? "border-transparent bg-white shadow-[0_14px_36px_-20px_rgba(79,70,229,0.6)] ring-2 ring-[#818CF8]"
                        : "border-transparent bg-white shadow-[0_10px_28px_-22px_rgba(79,70,229,0.5)] ring-1 ring-[#E0E7FF]"
                    )}
                  >
                    <div className={cn("text-xl font-bold mb-1", CITY_COLORS[i])}>
                      {city.name}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mb-2">
                      <span className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">
                        {wins}
                      </span>
                      {" "}
                      {locale === "en"
                        ? `win${wins > 1 ? "s" : ""}`
                        : `critère${wins > 1 ? "s" : ""} remporté${wins > 1 ? "s" : ""}`}
                    </div>
                    {wins === Math.max(...selected.map((c) =>
                      SCORE_ROWS.filter(({ key }) => {
                        const vals = selected.map((s) => s.scores[key]);
                        return c.scores[key] === Math.max(...vals);
                      }).length
                    )) && (
                      <Badge variant="success" className="text-xs">{t("Recommandé", "Recommended")}</Badge>
                    )}
                    <div className="mt-3">
                      <Link
                        href={cityHref(city.slug)}
                        className="text-xs font-semibold text-[#4338CA] hover:underline"
                      >
                        {t("Voir le profil complet →", "See full profile →")}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quiz CTA */}
          <div className="band-bold rounded-2xl p-6 text-center">
            <p className="mb-3 text-white">
              {t(
                "Vous hésitez encore ? Notre IA peut analyser votre profil exact.",
                "Still unsure? Our AI can analyse your exact profile."
              )}
            </p>
            <Link
              href="/city-match"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#4338CA] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {t("✨ Lancer le quiz de matching", "✨ Start the matching quiz")}
            </Link>
          </div>
        </div>
      )}

      {selected.length === 0 && (
        <div className="rounded-3xl bg-white/70 py-16 text-center text-[var(--text-secondary)] ring-1 ring-[#E0E7FF]">
          <div className="mb-4 flex justify-center"><EmojiBadge emoji="🏙️" tone="indigo" size="lg" /></div>
          <p className="text-lg">
            {t(
              "Sélectionnez au moins une ville pour commencer la comparaison.",
              "Pick at least one city to start comparing."
            )}
          </p>
        </div>
      )}
    </div>
  );
}
