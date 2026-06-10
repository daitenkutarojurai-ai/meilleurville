import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CityProfile } from "./CityProfile";
import { buildCityProfileData } from "@/lib/city-profile-data";
import { CityJsonLd } from "@/components/CityJsonLd";
import { CityGuidesList } from "@/components/CityGuidesList";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

// Pure static export (output:"export" on Cloudflare) — no ISR/runtime cache.
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const housing = getHousing(city.slug);
  const rentHint = housing ? ` Loyer T2 : ${housing.avgRentT2}€/mois.` : "";
  return {
    title: `${city.name} · Avis habitants, qualité de vie & classements 2026`,
    description: `${city.name} (${city.department}, ${city.region}) : score de qualité de vie ${city.scores.global}/10. Avis d'habitants, quartiers, données locales.${rentHint} Comparez avec d'autres villes.`,
    alternates: {
      canonical: `/villes/${slug}`,
      // City slugs are 1:1 across locales, so the EN equivalent is exact.
      languages: {
        "fr-FR": `${ORIGIN_BY_LOCALE.fr}/villes/${slug}`,
        "en-US": `${ORIGIN_BY_LOCALE.en}/cities/${slug}`,
        "x-default": `${ORIGIN_BY_LOCALE.fr}/villes/${slug}`,
      },
    },
    openGraph: {
      title: `${city.name} · MaVilleIdeal · ${city.scores.global}/10`,
      description: `Score QdV ${city.scores.global}/10 · ${city.region} · ${city.characterTags.slice(0, 3).join(", ")}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${city.name} · ${city.scores.global}/10 | MaVilleIdeal`,
      description: `Qualité de vie, avis d'habitants et données locales pour ${city.name}.`,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  return (
    <main id="main-content" className="min-h-screen">
      <CityJsonLd city={city} />
      <Navbar />
      <CityProfile city={city} data={buildCityProfileData(city)} />
      <CityGuidesList slug={city.slug} name={city.name} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-12">
        <FeedbackWidget />
      </div>
      <Footer />
    </main>
  );
}
