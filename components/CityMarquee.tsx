import Link from "next/link";
import { Marquee } from "@/components/effects/Marquee";
import { CITIES_SEED } from "@/data/cities-seed";

/**
 * CityMarquee — infinite-scroll trust ribbon of top cities + scores.
 * Sits between the hero and the stats bar.
 */
export function CityMarquee() {
  const items = [...CITIES_SEED]
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 24)
    .map((c) => ({ slug: c.slug, name: c.name, score: c.scores.global, region: c.region }));

  return (
    <section className="relative py-6 border-y border-[var(--border)]/60 bg-[var(--bg-canvas)]/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl">
        <Marquee speed={70}>
          {items.map((c) => (
            <Link
              key={c.slug}
              href={`/villes/${c.slug}`}
              className="group flex items-center gap-3 rounded-full px-4 py-2 hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] group-hover:scale-150 transition-transform" />
              <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors whitespace-nowrap">
                {c.name}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] whitespace-nowrap">
                {c.region}
              </span>
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold font-mono-data text-[var(--accent)]">
                {c.score.toFixed(1)}
              </span>
            </Link>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
