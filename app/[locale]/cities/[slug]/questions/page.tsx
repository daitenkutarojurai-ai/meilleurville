import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityFaq } from "@/lib/city-faq";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `${city.name} — frequently asked questions 2026 | Best Cities in France`,
    description: `Everything to know before moving to ${city.name}: rents, safety, commute, 2040 climate, schools, remote work. Data-grounded 2026 answers.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/questions` },
    openGraph: {
      title: `${city.name} — FAQ 2026`,
      description: `13 questions, 13 data-grounded answers about ${city.name}.`,
    },
  };
}

export default async function EnQuestionsPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const faq = cityFaq(city, "en");
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${city.slug}` },
    { name: "Questions", path: `/cities/${city.slug}/questions` },
  ]);
  const faqLd = faqJsonLd(faq);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqLd)} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />
        <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mt-2 flex items-center gap-3">
              <div className="rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] p-2.5">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                  Frequently asked questions — {city.name}
                </h1>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  Indicative 2026 data. Always cross-check with a site visit.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <ul className="space-y-4">
              {faq.map((item, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
                >
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {item.q}
                  </h2>
                  <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
                    {item.a}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                href={`/cities/${city.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back to {city.name}
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
