import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITIES_SEED } from "@/data/cities-seed";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CityProfile } from "./CityProfile";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Avis sur ${city.name} — Qualité de vie, quartiers, habitants`,
    description: `Découvrez ${city.name} (${city.department}) : scores de qualité de vie, avis d'habitants, quartiers, classements et données locales. Note globale : ${city.scores.global}/10.`,
    openGraph: {
      title: `${city.name} — MeilleurVille`,
      description: `Qualité de vie ${city.scores.global}/10 · ${city.region}`,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  return (
    <main className="min-h-screen">
      <Navbar />
      <CityProfile city={city} />
      <Footer />
    </main>
  );
}
