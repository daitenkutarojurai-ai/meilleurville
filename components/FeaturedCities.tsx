import { CITIES_SEED } from "@/data/cities-seed";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { City } from "@/lib/types";
import { TiltCard } from "@/components/effects/TiltCard";

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

export function FeaturedCities() {
  const top = [...CITIES_SEED]
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 6)
    .map(seedToCity);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <Badge variant="success" className="mb-3">🏆 Coup de cœur</Badge>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              Les villes où on se sent bien
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              {`${CITIES_SEED.length} villes passées au crible — calibré sur Insee + Ministère Intérieur`}
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
            <TiltCard key={city.slug} max={5} scale={1.015}>
              <CityCard city={city} rank={i + 1} />
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
