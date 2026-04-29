import { CITIES_SEED } from "@/data/cities-seed";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { City } from "@/lib/types";

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
    reviewCount: Math.floor(Math.random() * 400 + 50),
    sunshinedays: s.sunshinedays,
    avgTempJuly: s.avgTempJuly,
    avgTempJanuary: s.avgTempJanuary,
  };
}

export function FeaturedCities() {
  const top = CITIES_SEED.slice(0, 6).map(seedToCity);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <Badge variant="success" className="mb-3">Top villes</Badge>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              Les villes les mieux notées
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Calculé sur {"{"}47 000{"}"} avis · mise à jour hebdomadaire
            </p>
          </div>
          <Link
            href="/villes"
            className="hidden sm:flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
          >
            Toutes les villes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((city, i) => (
            <CityCard key={city.slug} city={city} rank={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
