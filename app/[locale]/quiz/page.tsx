import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_SEED } from "@/data/cities-seed";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "City-matching quiz · Which French city is right for you?",
  description:
    "Two ways to find your French city: a qualitative lifestyle quiz and a quantitative compatibility scorer across 10 weighted criteria.",
  alternates: { canonical: `${EN_BASE}/quiz` },
};

export default function EnQuizPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-24 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
          Find your French city
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          Two approaches. Same mission: a city that fits your life, not a sponsored recommendation.
        </p>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 grid sm:grid-cols-2 gap-5">
        <Link
          href="/quiz/compatibility"
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 hover:border-[var(--accent)]/50 hover:shadow-md transition-all group"
        >
          <div className="text-3xl mb-3">🎯</div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">
            Compatibility quiz
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            10 questions on budget, climate, car, family, work style and priorities. Returns Top 5
            cities with a percentage match and a breakdown by criterion.
          </p>
          <span className="text-xs font-semibold text-[var(--accent)]">
            {CITIES_SEED.length} cities · quantitative →
          </span>
        </Link>

        <Link
          href="/for-who"
          className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 hover:border-[var(--accent)]/50 hover:shadow-md transition-all group"
        >
          <div className="text-3xl mb-3">👤</div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">
            City profiles by lifestyle
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Pick your profile — families, retirees, remote workers, students and more. Browse
            the top 20 cities tailored to each lifestyle, no questions required.
          </p>
          <span className="text-xs font-semibold text-[var(--accent)]">
            11 profiles · instant →
          </span>
        </Link>
      </div>

      <Footer />
    </main>
  );
}
