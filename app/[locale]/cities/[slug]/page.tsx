import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CityProfile } from "@/app/villes/[slug]/CityProfile";
import { CITIES_SEED } from "@/data/cities-seed";
import { getCityTitle, getCityDescription, ORIGIN_BY_LOCALE } from "@/lib/i18n";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

const EN_BASE = ORIGIN_BY_LOCALE.en;
const FR_BASE = ORIGIN_BY_LOCALE.fr;

// Build all EN city pages at compile time, matching the FR site's pattern.
export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};

  const title = getCityTitle(city, "en");
  const description = getCityDescription(city, "en");

  return {
    title,
    description,
    alternates: {
      canonical: `${EN_BASE}/cities/${slug}`,
      languages: {
        "fr-FR": `${FR_BASE}/villes/${slug}`,
        "en-US": `${EN_BASE}/cities/${slug}`,
        "x-default": `${EN_BASE}/cities/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `${EN_BASE}/cities/${slug}`,
      title: `${city.name} · BestCitiesInFrance · ${city.scores.global.toFixed(1)}/10`,
      description,
    },
  };
}

// EN city page = the exact same rich CityProfile as the FR site, rendered with
// locale="en" (tabs, narrative, niche scores, data cards, sub-page strip — all
// English, with /cities routes). The aurora hero supplies the page background.
export default async function EnCityPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  return (
    <main id="main-content" className="min-h-screen relative">
      <Navbar />
      <CityProfile city={city} locale="en" />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-12 text-sm text-[var(--text-secondary)]">
        <p>
          Prefer the French-language original?{" "}
          <a className="underline hover:text-[var(--accent)]" href={`${FR_BASE}/villes/${city.slug}`}>
            {city.name} on mavilleideale.fr
          </a>
          .
        </p>
      </section>
      <Footer />
    </main>
  );
}
