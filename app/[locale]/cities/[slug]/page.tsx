import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CityProfile } from "@/app/villes/[slug]/CityProfile";
import { CityGuidesList } from "@/components/CityGuidesList";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { CITIES_SEED } from "@/data/cities-seed";
import { getCityTitle, getCityDescription, ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { buildCityProfileData } from "@/lib/city-profile-data";
import { jsonLdScript } from "@/lib/jsonld";
import { cityFaq } from "@/lib/city-faq";

// Pure static export (output:"export" on Cloudflare) — fully prebuilt at build
// time; no ISR/runtime revalidation exists to tune.
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
        // x-default must agree cluster-wide; site convention is the FR URL
        // (matches the FR city page, langPair() and the root layout).
        "x-default": `${FR_BASE}/villes/${slug}`,
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

  const faq = cityFaq(city, "en");
  const cityJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "City",
        name: city.name,
        url: `${EN_BASE}/cities/${city.slug}`,
        description: city.seoDescriptionEn ?? city.descriptionEn ?? getCityDescription(city, "en"),
        containedInPlace: { "@type": "AdministrativeArea", name: city.region },
        geo: { "@type": "GeoCoordinates", latitude: city.latitude, longitude: city.longitude },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
          { "@type": "ListItem", position: 2, name: "Cities", item: `${EN_BASE}/cities` },
          { "@type": "ListItem", position: 3, name: city.name, item: `${EN_BASE}/cities/${city.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(cityJsonLd)} />
      <Navbar />
      <CityProfile city={city} data={buildCityProfileData(city)} faq={faq} locale="en" />
      <CityGuidesList slug={city.slug} name={city.name} locale="en" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-4">
        <FeedbackWidget locale="en" />
      </div>
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
