import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { FutureYouClient } from "@/app/future-you/FutureYouClient";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "Future You — your life in another French city, in numbers | BestCitiesInFrance",
  description:
    "Salary, household, lifestyle, priorities: simulate monthly leftover, free hours per week, stress level, and climate match in your top 3 French cities.",
  alternates: { canonical: `${EN_BASE}/future-you` },
  openGraph: {
    title: "Future You — life in numbers",
    description: "Honest simulation of your life in another French city.",
  },
};

export default function EnFutureYouPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Future You", path: "/future-you" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Simulator · Beta</Badge>
          <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Future You
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Your life, in numbers, in another city
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            We combine salary, household, transport mode and priorities to
            concretely estimate your monthly leftover, free hours per week
            and daily stress level in the 3 French cities that best match your
            profile.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <FutureYouClient locale="en" />
      </div>

      <Footer />
    </main>
  );
}
