import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { EnGuide } from "@/data/guides-en";
import { EN_GUIDES, EN_GUIDE_CATEGORIES } from "@/data/guides-en";
import { pathAlternatesEn } from "@/lib/i18n";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";

// « Couleurs »: one colour band per category section, rotated so two
// neighbours never share one.
const BANDS = ["band-indigo", "band-pink", "band-sky", "band-aqua", "band-lilac"] as const;

export const metadata: Metadata = {
  title: `${EN_GUIDES.length} guides — choosing where to live in France`,
  description:
    "Practical, no-fluff guides for moving to and living in France: city guides, remote work, families, cost of living, expat practicalities, leaving Paris, retirement. Updated 2026.",
  alternates: pathAlternatesEn("/guides", "/guides"),
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
      <section className="relative bg-aurora pt-20 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <EmojiBadge emoji="📚" tone="indigo" size="md" className="mb-4" />
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 tracking-tight leading-[1.05]">
            <span className="gradient-text">Guides</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            {EN_GUIDES.length} long-form guides for anyone moving to or living in France. No postcards, no fluff.
          </p>
        </div>
      </section>

      {CATEGORY_ORDER.filter((cat) => byCategory.get(cat)?.length).map((cat, idx) => {
        const guides = byCategory.get(cat)!;
        return (
          <section key={cat} className={`band ${BANDS[idx % BANDS.length]} py-12`}>
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-5 flex flex-wrap items-baseline gap-2">
                <Link href={`/guides/category/${cat}`} className="gradient-text hover:opacity-80 transition-opacity">
                  {EN_GUIDE_CATEGORIES[cat]}
                </Link>
                <span className="rounded-full bg-white px-2.5 py-0.5 text-sm font-semibold text-[var(--accent)] shadow-sm">{guides.length}</span>
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/guides/${g.slug}`}
                      className="group block h-full rounded-2xl border border-white bg-white p-6 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] transition-all hover:-translate-y-0.5 hover:border-[#C7D2FE]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <EmojiBadge emoji={g.emoji} tone={toneFor(g.slug)} size="md" />
                        <span className="text-xs uppercase tracking-wide text-[var(--accent)] font-semibold">
                          {EN_GUIDE_CATEGORIES[g.category]}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">{g.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{g.metaDesc}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-3">{g.readMinutes} min read</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      <Footer />
    </main>
  );
}
