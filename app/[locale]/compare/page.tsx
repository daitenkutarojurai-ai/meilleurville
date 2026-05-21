import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { SEO_PAIRS } from "@/lib/comparer-pairs";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Compare French cities — side-by-side quality of life",
  description:
    "Compare any two French cities side by side: cost of living, transport, nature, safety, schools and a verdict per lifestyle profile.",
  alternates: { canonical: `${EN_BASE}/compare` },
};

export default function EnCompareIndex() {
  const byName = new Map(CITIES_SEED.map((c) => [c.slug, c.name]));

  // Surface the curated pairs that resolve to known cities, deduplicated.
  const seen = new Set<string>();
  const pairs = SEO_PAIRS.filter(([a, b]) => {
    if (!byName.has(a) || !byName.has(b)) return false;
    const key = [a, b].sort().join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 120);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          Compare French cities
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          Two cities, side by side: every score, housing costs, and a verdict for families, remote workers, retirees and students.
        </p>
        <Link
          href="/compare-regions"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-5 py-2.5 text-sm font-semibold text-[var(--accent)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)]/10"
        >
          🗺️ Or compare entire regions
        </Link>
      </section>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Popular comparisons</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pairs.map(([a, b]) => (
            <li key={`${a}-${b}`}>
              <Link
                href={`/compare/${a}-vs-${b}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
              >
                <span className="font-semibold text-[var(--text-primary)]">{byName.get(a)}</span>
                <span className="text-[var(--text-tertiary)]"> vs </span>
                <span className="font-semibold text-[var(--text-primary)]">{byName.get(b)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
