import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { t, ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Explore every French city · Reviews & 2026 rankings",
  description: `${CITIES_COUNT} French cities profiled with calibrated quality-of-life scores (Insee + Ministry of Interior), resident reviews, and detailed local data. Filter and compare.`,
  alternates: { canonical: `${EN_BASE}/cities` },
};

export default function EnCitiesIndex() {
  const count = CITIES_SEED.length;
  const avg = (
    CITIES_SEED.reduce((s, c) => s + c.scores.global, 0) / count
  ).toFixed(1);
  const sorted = [...CITIES_SEED].sort(
    (a, b) => b.scores.global - a.scores.global,
  );

  return (
    <main id="main-content" className="min-h-screen relative">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-10 text-center">
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
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((city) => (
            <li key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
                aria-label={`${city.name} — score ${city.scores.global.toFixed(1)} out of 10`}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    {city.region ?? ""}
                  </span>
                  <span className="font-mono-data font-bold text-xl text-[var(--accent)]">
                    {city.scores.global.toFixed(1)}
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                  {city.name}
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {city.department ?? ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Footer />
    </main>
  );
}
