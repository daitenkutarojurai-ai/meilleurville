import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { CITIES_CORE } from "@/lib/cities-light";
import { pathAlternatesEn } from "@/lib/i18n";
import { SEO_PAIRS } from "@/lib/comparer-pairs";
import { CompareTool } from "@/app/comparer/CompareTool";
import { FeedbackWidget } from "@/components/FeedbackWidget";

export const metadata: Metadata = {
  title: "Compare French cities — side-by-side quality of life",
  description:
    "Compare any two French cities side by side: cost of living, transport, nature, safety, schools and a verdict per lifestyle profile.",
  alternates: pathAlternatesEn("/comparer", "/compare"),
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
      {/* Interactive picker (parity with FR /comparer) — provides the page h1. */}
      <section className="relative overflow-hidden bg-aurora pt-8">
        <CompareTool locale="en" cities={CITIES_CORE} />
      </section>
      <section className="band band-lilac py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3 px-4 sm:px-6">
          <Link
            href="/compare-regions"
            className="inline-flex items-center gap-2 rounded-full grad-head-0 px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
          >
            🗺️ Or compare entire regions
          </Link>
          <Link
            href="/compare-departments"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE] transition-all hover:ring-[#818CF8]"
          >
            📍 Or two departments
          </Link>
        </div>
      </section>
      <section className="band band-sky">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4"><span className="gradient-text">Popular comparisons</span></h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pairs.map(([a, b]) => (
            <li key={`${a}-${b}`}>
              <Link
                href={`/compare/${a}-vs-${b}`}
                className="block rounded-xl bg-white p-4 shadow-[0_10px_28px_-20px_rgba(8,145,178,0.6)] ring-1 ring-[#BAE6FD] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-[#38BDF8]"
              >
                <span className="font-semibold text-[var(--text-primary)]">{byName.get(a)}</span>
                {" "}<span className="rounded-full grad-head-5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider align-middle">vs</span>{" "}
                <span className="font-semibold text-[var(--text-primary)]">{byName.get(b)}</span>
              </Link>
            </li>
          ))}
        </ul>
        </div>
      </section>
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget locale="en" />
        </div>
      </section>
      <Footer />
    </main>
  );
}
