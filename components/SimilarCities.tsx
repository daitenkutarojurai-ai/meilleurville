import Link from "next/link";
import { CITIES_SEED, type CitySeed } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";

interface SimilarCitiesProps {
  city: CitySeed;
  maxResults?: number;
}

function cosineSimilarity(a: CitySeed["scores"], b: CitySeed["scores"]): number {
  const keys: Array<keyof CitySeed["scores"]> = [
    "life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools",
  ];
  let dot = 0, normA = 0, normB = 0;
  for (const k of keys) {
    dot += a[k] * b[k];
    normA += a[k] * a[k];
    normB += b[k] * b[k];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function SimilarCities({ city, maxResults = 4 }: SimilarCitiesProps) {
  const similar = CITIES_SEED.filter((c) => c.slug !== city.slug)
    .map((c) => ({ city: c, sim: cosineSimilarity(city.scores, c.scores) }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, maxResults);

  if (similar.length === 0) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">
        Villes similaires
      </p>
      <div className="space-y-2">
        {similar.map(({ city: c, sim }) => (
          <Link
            key={c.slug}
            href={`/villes/${c.slug}`}
            className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3 group"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                {c.name}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                {c.region}
                {HOUSING[c.slug] ? ` · ${HOUSING[c.slug].avgRentT2}€/mois T2` : ""}
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <div className="text-sm font-bold font-mono-data text-[var(--accent)]">
                {c.scores.global.toFixed(1)}
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">
                {Math.round(sim * 100)}% similaire
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {similar.slice(0, 2).map(({ city: c }) => (
          <Link
            key={c.slug}
            href={`/comparer/${[city.slug, c.slug].sort().join("-vs-")}`}
            className="text-xs text-[var(--accent)] border border-[var(--accent)]/30 rounded-lg px-3 py-1.5 hover:bg-[var(--accent)]/5 transition-colors"
          >
            vs {c.name} →
          </Link>
        ))}
        <Link
          href={`/comparer`}
          className="text-xs text-[var(--text-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 hover:text-[var(--text-primary)] transition-colors"
        >
          Comparateur →
        </Link>
      </div>
    </div>
  );
}
