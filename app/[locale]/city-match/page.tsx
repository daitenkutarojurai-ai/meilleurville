import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CityMatchQuiz } from "@/app/city-match/CityMatchQuiz";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "City Match — which French city really fits your life? | BestCitiesInFrance",
  description:
    "8 questions, 90 seconds: we calculate your personal match across 352 French cities. Top 3 + a surprise match, live ranking as you answer, shareable link.",
  alternates: { canonical: `${EN_BASE}/city-match` },
  openGraph: {
    title: "City Match · The French city finder",
    description: "8 questions → your 3 best-fit French cities.",
  },
};

export default function EnCityMatchPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "City Match", path: "/city-match" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">City Match</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            The French city that fits your life
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Not a universal ranking — your <em>personal</em> match. 8 questions
            about your priorities (budget, climate, safety, remote work…). The
            ranking updates live as you answer.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <CityMatchQuiz locale="en" />
      </div>

      <Footer />
    </main>
  );
}
