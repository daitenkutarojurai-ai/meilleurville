import Link from "next/link";
import { CITIES_SEED } from "@/data/cities-seed";

const DROM = [
  { name: "Guadeloupe", emoji: "🌴", region: "Guadeloupe", regionSlug: "guadeloupe" },
  { name: "Martinique", emoji: "🌺", region: "Martinique", regionSlug: "martinique" },
  { name: "Guyane", emoji: "🌿", region: "Guyane", regionSlug: "guyane" },
  { name: "La Réunion", emoji: "🌋", region: "La Réunion", regionSlug: "la-reunion" },
  { name: "Mayotte", emoji: "🐢", region: "Mayotte", regionSlug: "mayotte" },
] as const;

function scoreColor(score: number): string {
  if (score >= 9.5) return "#EAB308"; // gold — légendaire
  if (score >= 7.5) return "#059669"; // emerald — exceptionnel
  if (score >= 7.0) return "#16A34A"; // green — excellent
  if (score >= 6.0) return "#84CC16"; // lime — bon
  if (score >= 5.0) return "#F59E0B"; // amber — moyen
  if (score >= 4.0) return "#F97316"; // orange — en dessous
  return "#EF4444";                   // red — mauvais
}

export function DromStrip() {
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
          Outre-mer
        </span>
        <Link
          href="/regions"
          className="text-[11px] text-[var(--accent)] hover:underline font-medium"
        >
          Toutes les régions →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {byRegion.map((r) => (
          <Link
            key={r.regionSlug}
            href={`/regions/${r.regionSlug}`}
            className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)]/60 hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all p-3"
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-base leading-none">{r.emoji}</span>
              <span className="text-xs font-bold text-[var(--text-primary)] truncate">{r.name}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {r.cities.slice(0, 4).map((c) => (
                <span
                  key={c.slug}
                  className="inline-flex items-center gap-1 text-[10px] text-[var(--text-secondary)] truncate"
                  title={`${c.name} — ${c.scores.global.toFixed(1)}/10`}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ background: scoreColor(c.scores.global) }}
                  />
                  {c.name.replace(/\s*\(.*\)\s*$/, "")}
                </span>
              ))}
              {r.cities.length > 4 && (
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  +{r.cities.length - 4}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
