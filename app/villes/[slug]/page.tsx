import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CityProfile } from "./CityProfile";
import { CityJsonLd } from "@/components/CityJsonLd";

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
    title: `${city.name} — Avis habitants, qualité de vie & classements 2025`,
    description: `${city.name} (${city.department}, ${city.region}) : score de qualité de vie ${city.scores.global}/10. Avis d'habitants, quartiers, données locales.${rentHint} Comparez avec d'autres villes.`,
    openGraph: {
      title: `${city.name} — MeilleurVille · ${city.scores.global}/10`,
      description: `Score QdV ${city.scores.global}/10 · ${city.region} · ${city.characterTags.slice(0, 3).join(", ")}`,
    },
    twitter: {
      card: "summary",
      title: `${city.name} — ${city.scores.global}/10 | MeilleurVille`,
      description: `Qualité de vie, avis d'habitants et données locales pour ${city.name}.`,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  return (
    <main className="min-h-screen">
      <CityJsonLd city={city} />
      <Navbar />
      <CityProfile city={city} />
      <Footer />
    </main>
  );
}
