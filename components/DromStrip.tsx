import Link from "next/link";
import { CITIES_SEED } from "@/data/cities-seed";
import { scoreHex } from "@/lib/utils";

const DROM = [
  { name: "Guadeloupe", emoji: "🌴", region: "Guadeloupe", regionSlug: "guadeloupe" },
  { name: "Martinique", emoji: "🌺", region: "Martinique", regionSlug: "martinique" },
  { name: "Guyane", emoji: "🌿", region: "Guyane", regionSlug: "guyane" },
  { name: "La Réunion", emoji: "🌋", region: "La Réunion", regionSlug: "la-reunion" },
  { name: "Mayotte", emoji: "🐢", region: "Mayotte", regionSlug: "mayotte" },
] as const;

// scoreHex imported from @/lib/utils — single source of truth

export function DromStrip({ locale = "fr" }: { locale?: "fr" | "en" } = {}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const cityHref = (slug: string) => (locale === "en" ? `/cities/${slug}` : `/villes/${slug}`);
  // Group DROM cities by region from the seed
  const byRegion = DROM.map((r) => ({
    ...r,
    cities: CITIES_SEED.filter((c) => c.region === r.region)
      .sort((a, b) => b.scores.global - a.scores.global),
  })).filter((r) => r.cities.length > 0);

  if (byRegion.length === 0) return null;

  return (
    <div className="relative mt-5">
      <div className="flex items-baseline justify-between mb-2 px-1">
        <span className="text-[11px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold">
          {L("Outre-mer", "Overseas")}
        </span>
        <Link
          href="/regions"
          className="text-[11px] text-[var(--accent)] hover:underline font-medium"
        >
          {L("Toutes les régions →", "All regions →")}
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {byRegion.map((r) => (
          <div
            key={r.regionSlug}
            className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)]/60 hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all p-3"
          >
            <Link
              href={`/regions/${r.regionSlug}`}
              className="flex items-center gap-1.5 mb-1.5 hover:text-[var(--accent)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded-md"
              aria-label={`${L("Région", "Region")} ${r.name}`}
            >
              <span className="text-base leading-none">{r.emoji}</span>
              <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate">{r.name}</span>
            </Link>
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {r.cities.slice(0, 4).map((c) => (
                <Link
                  key={c.slug}
                  href={cityHref(c.slug)}
                  className="inline-flex items-center gap-1 text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline truncate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
                  title={`${c.name} — ${c.scores.global.toFixed(1)}/10`}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ background: scoreHex(c.scores.global) }}
                  />
                  {c.name.replace(/\s*\(.*\)\s*$/, "")}
                </Link>
              ))}
              {r.cities.length > 4 && (
                <Link
                  href={`/regions/${r.regionSlug}`}
                  className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:underline"
                >
                  +{r.cities.length - 4}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
