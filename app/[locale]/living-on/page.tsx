import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Badge } from "@/components/ui/Badge";
import { SALARY_BRACKETS, slugForSalary } from "@/lib/vivre-avec";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Living in France on X €/month 2026 · Top cities by salary bracket",
  description:
    "Best French cities for your net monthly salary: 1,500, 2,000, 2,500, 3,000, 4,000, 5,000 €. Disposable income simulation + Paris comparison.",
  alternates: { canonical: `${EN_BASE}/living-on` },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Living on", path: "/living-on" },
]);

export default function EnLivingOnIndexPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            💰 Living costs by salary
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
            Which French cities can you live in on your salary?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Pick your monthly net salary. We show the top 10 cities where that budget works
            comfortably, with a real monthly cost breakdown and a side-by-side comparison
            with Paris.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-20 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {SALARY_BRACKETS.map((s) => (
          <Link
            key={s}
            href={`/living-on/${slugForSalary(s)}`}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center hover:border-[var(--accent)]/50 hover:shadow-md transition-all group"
          >
            <div className="font-mono-data font-bold text-3xl text-[var(--accent)] mb-1">
              €{s.toLocaleString("en-GB")}
            </div>
            <div className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              /month
            </div>
            <div className="mt-3 text-xs text-[var(--accent)] font-medium group-hover:underline">
              Top 10 cities →
            </div>
          </Link>
        ))}
      </div>

      <Footer />
    </main>
  );
}
