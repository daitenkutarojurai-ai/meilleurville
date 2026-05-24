import type { Metadata } from "next";
import { Telescope } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { ProjectionClient } from "@/app/projection-5ans/ProjectionClient";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "5-Year Projection — which French city in 5 years? | BestCitiesInFrance",
  description:
    "Family, retirement, remote work, rising or falling budget — and a 2040 climate that changes everything. Find the French city that fits who you will be in 5 years, not who you are today.",
  alternates: { canonical: `${EN_BASE}/projection-5ans` },
  openGraph: {
    title: "5-Year City Projection · BestCitiesInFrance",
    description: "352 French cities scored against your 5-year trajectory: family, career, budget and climate risk 2040.",
  },
};

export default function EnProjection5AnsPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "5-Year Projection", path: "/projection-5ans" },
  ]);

  const faq = faqJsonLd([
    {
      q: "How does the 5-year city projection work?",
      a: "You describe your anticipated life trajectory in 5 years (household, income, remote work %, climate priority) and the tool scores all 352 French cities against that future profile — not your current one.",
    },
    {
      q: "Does it account for climate change?",
      a: "Yes. The climate 2040 projections (from the Climat 2040 guide series) are factored in when climate is weighted as a priority — cities likely to face severe heat waves or drought score lower.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">R9.5 · 5-Year Projection</Badge>
          <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
            <Telescope className="h-3.5 w-3.5" />
            Forward-looking
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Where should you live in 5 years?
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Family, retirement, remote work, changing budget — and a 2040 climate
            that reshuffles the rankings. Score 352 French cities against who you
            will be in 5 years, not who you are today.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <ProjectionClient />
      </div>

      <Footer />
    </main>
  );
}
