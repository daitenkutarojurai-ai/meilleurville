import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityFaq } from "@/lib/city-faq";
import { HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `${city.name} — questions fréquentes & réponses 2026 | MaVilleIdeal`,
    description: `Toutes les questions qu'on se pose avant de vivre à ${city.name} : loyers, sécurité, trajets, climat 2040, écoles, télétravail. Réponses 2026 sourcées et chiffrées.`,
    alternates: { canonical: `/villes/${slug}/questions` },
    openGraph: {
      title: `${city.name} — questions fréquentes 2026`,
      description: `13 questions, 13 réponses chiffrées sur ${city.name}.`,
    },
  };
}

export default async function QuestionsPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const faq = cityFaq(city, "fr");
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Questions fréquentes", path: `/villes/${city.slug}/questions` },
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
            <Breadcrumbs
              items={[
                { label: "Villes", href: "/villes" },
                { label: city.name, href: `/villes/${city.slug}` },
                { label: "Questions" },
              ]}
            />
            <div className="mt-6 flex items-center gap-3">
              <div className="rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] p-2.5">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                  Questions fréquentes — {city.name}
                </h1>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  Données 2026 indicatives. Croisez toujours avec une visite sur place.
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

            <div className="mt-10 flex items-center justify-between">
              <Link
                href={`/villes/${city.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Retour à la fiche {city.name}
              </Link>
            </div>

            <DiscussionCTA citySlug={city.slug} cityName={city.name} />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
