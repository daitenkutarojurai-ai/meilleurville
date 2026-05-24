import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { EnGuide } from "@/data/guides-en";
import { EN_GUIDES, EN_GUIDE_CATEGORIES } from "@/data/guides-en";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: `${EN_GUIDES.length} guides — choosing where to live in France | BestCitiesInFrance`,
  description:
    "Practical, no-fluff guides for moving to and living in France: city guides, remote work, families, cost of living, expat practicalities, leaving Paris, retirement. Updated 2026.",
  alternates: { canonical: `${EN_BASE}/guides` },
};

const CATEGORY_ORDER: EnGuide["category"][] = [
  "city-guide", "moving", "remote-work", "lifestyle", "family", "budget",
];

export default function EnGuidesIndex() {
  const byCategory = new Map<EnGuide["category"], typeof EN_GUIDES>();
  for (const g of EN_GUIDES) {
    const arr = byCategory.get(g.category) ?? [];
    arr.push(g);
    byCategory.set(g.category, arr);
  }

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          Guides
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          {EN_GUIDES.length} long-form guides for anyone moving to or living in France. No postcards, no fluff.
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12 pb-12">
        {CATEGORY_ORDER.map((cat) => {
          const guides = byCategory.get(cat);
          if (!guides?.length) return null;
          return (
            <section key={cat}>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 border-b border-[var(--border)] pb-2">
                {EN_GUIDE_CATEGORIES[cat]}
                <span className="ml-2 text-sm font-normal text-[var(--text-tertiary)]">({guides.length})</span>
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="block h-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl" aria-hidden>{g.emoji}</span>
                        <span className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold">
                          {EN_GUIDE_CATEGORIES[g.category]}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{g.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{g.metaDesc}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-3">{g.readMinutes} min read</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <Footer />
    </main>
  );
}
