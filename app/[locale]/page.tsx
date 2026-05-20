import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NewsletterSection } from "@/components/NewsletterSection";
import { CITIES_SEED } from "@/data/cities-seed";
import { t, ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "BestCitiesInFrance · Find the French city that fits you",
  description: `AI + lived experience + ${CITIES_COUNT} cities of official data. Rankings, resident reviews, lifestyle-matching quiz — independent and unbiased.`,
  alternates: {
    canonical: `${EN_BASE}/`,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BestCitiesInFrance",
    url: `${EN_BASE}/`,
    title: "BestCitiesInFrance · Find the French city that fits you",
    description: `AI + lived experience + ${CITIES_COUNT} cities of official data. Rankings, resident reviews, lifestyle-matching quiz.`,
  },
};

export default function EnHomePage() {
  const top = [...CITIES_SEED]
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 6);

  return (
    <main id="main-content" className="min-h-screen relative">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 pb-12 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-5 tracking-tight leading-[1.05]">
          {t("home.hero.title", "en")}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          {t("home.hero.subtitle", "en")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/quiz"
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-white font-semibold shadow-md hover:opacity-90"
          >
            {t("home.hero.ctaQuiz", "en")}
          </Link>
          <Link
            href="/cities"
            className="rounded-full border border-[var(--border)] px-6 py-3 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
          >
            {t("home.hero.ctaCities", "en")}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[var(--text-primary)]">
          Top {top.length} highest-rated cities
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {top.map((city, i) => (
            <li key={city.slug}>
              <Link
                href={`/cities/${city.slug}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">
                    #{i + 1}
                  </span>
                  <span className="font-mono-data font-bold text-2xl text-[var(--accent)]">
                    {city.scores.global.toFixed(1)}
                  </span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                  {city.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {city.region ?? ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            See the full leaderboard — all {CITIES_COUNT} cities ranked →
          </Link>
        </div>
      </section>

      <NewsletterSection locale="en" />

      <Footer />
    </main>
  );
}
