import Link from "next/link";
import type { SimilarCityItem } from "@/lib/city-profile-data";

// Presentational only — the cosine-similarity ranking is computed server-side
// (lib/city-profile-data buildCityProfileData) so this client component
// doesn't bundle the full seed + housing datasets.
interface SimilarCitiesProps {
  citySlug: string;
  items: SimilarCityItem[];
  locale?: "fr" | "en";
}

export function SimilarCities({ citySlug, items, locale = "fr" }: SimilarCitiesProps) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  if (items.length === 0) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">
        {L("Villes similaires", "Similar cities")}
      </p>
      <div className="space-y-2">
        {items.map((c) => (
          <Link
            key={c.slug}
            href={locale === "en" ? `/cities/${c.slug}` : `/villes/${c.slug}`}
            className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3 group"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                {c.name}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                {c.region}
                {c.rentT2 ? ` · ${c.rentT2}€${L("/mois T2", "/mo 2-room")}` : ""}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-sm font-bold font-mono-data text-[var(--accent)]">
                {c.scoreGlobal.toFixed(1)}
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">
                {Math.round(c.sim * 100)}{L("% similaire", "% similar")}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.slice(0, 2).map((c) => (
          <Link
            key={c.slug}
            href={`${locale === "en" ? "/compare" : "/comparer"}/${[citySlug, c.slug].sort().join("-vs-")}`}
            className="text-xs text-[var(--accent)] border border-[var(--accent)]/30 rounded-lg px-3 py-1.5 hover:bg-[var(--accent)]/5 transition-colors"
          >
            vs {c.name} →
          </Link>
        ))}
        <Link
          href={locale === "en" ? `/compare` : `/comparer`}
          className="text-xs text-[var(--text-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 hover:text-[var(--text-primary)] transition-colors"
        >
          {L("Comparateur →", "Compare →")}
        </Link>
      </div>
    </div>
  );
}
