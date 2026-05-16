import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { t, ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "City-matching quiz — Which French city is right for you?",
  description:
    "Answer 10 questions about budget, climate, family, work style and lifestyle priorities. We surface 5 French cities that genuinely match — no fluff, no sponsored slots.",
  alternates: { canonical: `${EN_BASE}/quiz` },
};

export default function EnQuizPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-24 pb-12 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          {t("quiz.title", "en")}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          {t("quiz.intro", "en")}
        </p>

        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-left">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            The interactive quiz UI is shared with the French version and is being localised.
            Meanwhile, you can browse rankings or jump straight to a city:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/rankings"
              className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold shadow-sm hover:opacity-90"
            >
              {t("nav.rankings", "en")}
            </Link>
            <Link
              href="/cities"
              className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-canvas)]"
            >
              {t("nav.cities", "en")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
