import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VillesSearch } from "@/components/VillesSearch";
import { CITIES_LIGHT, LEAN_META } from "@/lib/cities-light";
import { t, pathAlternatesEn } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Explore every French city · Reviews & 2026 rankings",
  description: `${CITIES_COUNT} French cities profiled with calibrated quality-of-life scores, resident reviews and local data. Filter by region, lifestyle and terrain.`,
  alternates: pathAlternatesEn("/villes", "/cities"),
};

export default function EnCitiesIndex() {
  const count = CITIES_LIGHT.length;
  const avg = (
    CITIES_LIGHT.reduce((s, c) => s + c.scores.global, 0) / count
  ).toFixed(1);

  return (
    <main id="main-content" className="min-h-screen relative">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-8 text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
          🌍 {count} profiled cities
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          {t("cities.title", "en")}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          {t("cities.intro", "en")}
        </p>
        <div className="mt-6 inline-flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-2 text-sm text-[var(--text-secondary)]">
          <span>
            <strong className="text-[var(--text-primary)] font-mono-data">
              {count}
            </strong>{" "}
            cities
          </span>
          <span aria-hidden>·</span>
          <span>
            average score{" "}
            <strong className="text-[var(--text-primary)] font-mono-data">
              {avg}
            </strong>
            /10
          </span>
        </div>
        <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">
          Filter and sort here, or start from{" "}
          <Link href="/reviews" className="text-[var(--accent)] hover:underline">
            the ratings themselves and what residents wrote about them
          </Link>
          .
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <VillesSearch cities={CITIES_LIGHT} leanMeta={LEAN_META} locale="en" />
        {/* The grid renders its first 60 cards only (the rest on click). This index
            keeps a plain HTML link to every city, readable without JavaScript. */}
        <details className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--accent)]">
            A → Z index of all {count} cities
          </summary>
          <ul className="mt-4 columns-2 gap-x-6 text-sm sm:columns-3 lg:columns-4 [&_a]:inline-block [&_a]:py-1.5 [&_a]:text-[var(--text-secondary)] [&_a:hover]:text-[var(--accent)]">
            {[...CITIES_LIGHT]
              .sort((a, b) => a.name.localeCompare(b.name, "fr"))
              .map((c) => (
                <li key={c.slug}>
                  <Link href={`/cities/${c.slug}`}>{c.name}</Link>
                </li>
              ))}
          </ul>
        </details>
      </section>

      <Footer />
    </main>
  );
}
