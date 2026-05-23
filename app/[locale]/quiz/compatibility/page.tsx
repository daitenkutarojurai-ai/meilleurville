import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Badge } from "@/components/ui/Badge";
import { CompatibilityQuizEN } from "@/components/CompatibilityQuizEN";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_SEED } from "@/data/cities-seed";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "City compatibility quiz · France | BestCitiesInFrance",
  description: `10 questions about your budget, climate preference, family situation, work style and lifestyle priorities. Algorithm calibrated across ${CITIES_SEED.length} French cities. Top 5 results with a % score and per-criterion breakdown.`,
  alternates: { canonical: `${EN_BASE}/quiz/compatibility` },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Quiz", path: "/quiz" },
  { name: "City compatibility", path: "/quiz/compatibility" },
]);

export default function EnQuizCompatibilityPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            ✨ Quantitative matching
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
            Which French city is actually right for you?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            10 questions about your real life: budget, climate, car, family situation, work style,
            priorities. Algorithm calibrated across {CITIES_SEED.length} French cities. Result: Top 5
            with a percentage score and a breakdown by criterion.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <CompatibilityQuizEN />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 text-center text-xs text-[var(--text-tertiary)]">
        <p>
          Different from the{" "}
          <Link href="/quiz" className="underline">
            qualitative quiz
          </Link>
          : here the score is a percentage and every criterion shows its numeric contribution.
          Full methodology on the{" "}
          <Link href="/methodology" className="underline">
            methodology page
          </Link>
          .
        </p>
      </div>

      <Footer />
    </main>
  );
}
