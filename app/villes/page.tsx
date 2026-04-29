import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import type { City } from "@/lib/types";

export const metadata: Metadata = {
  title: "Explorer toutes les villes françaises — Avis & Classements",
  description:
    "Découvrez les meilleures villes françaises : avis d'habitants, scores de qualité de vie, données locales. Plus de 850 communes analysées.",
};

function seedToCity(s: (typeof CITIES_SEED)[number]): City {
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    region: s.region,
    department: s.department,
    population: s.population,
    latitude: s.latitude,
    longitude: s.longitude,
    scores: s.scores,
    characterTags: s.characterTags,
    reviewCount: 180 + Math.floor(s.scores.global * 30),
    sunshinedays: s.sunshinedays,
    avgTempJuly: s.avgTempJuly,
    avgTempJanuary: s.avgTempJanuary,
  };
}

export default function VillesPage() {
  const cities = CITIES_SEED.map(seedToCity).sort(
    (a, b) => b.scores.global - a.scores.global
  );

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] py-14 border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">850+ villes</Badge>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">
            Explorer les villes françaises
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Avis d&apos;habitants · Scores de qualité de vie · Données officielles.
            Cliquez sur une ville pour voir son profil complet.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cities.map((city, i) => (
            <CityCard key={city.slug} city={city} rank={i + 1} />
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
