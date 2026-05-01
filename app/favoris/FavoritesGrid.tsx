"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CityCard } from "@/components/CityCard";
import { CITIES_SEED } from "@/data/cities-seed";
import { readFavorites } from "@/components/effects/FavoriteButton";
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
    reviewCount: 180 + Math.floor(s.scores.global * 30),
    sunshinedays: s.sunshinedays,
    avgTempJuly: s.avgTempJuly,
    avgTempJanuary: s.avgTempJanuary,
  };
}

export function FavoritesGrid() {
  const [slugs, setSlugs] = useState<string[] | null>(null);

  useEffect(() => {
    setSlugs(readFavorites());
    function onChange() {
      setSlugs(readFavorites());
    }
    window.addEventListener("favorites-changed", onChange);
    return () => window.removeEventListener("favorites-changed", onChange);
  }, []);

  if (slugs === null) {
    return (
      <div className="text-center text-sm text-[var(--text-tertiary)] py-16">Chargement…</div>
    );
  }

  if (slugs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--border)] bg-white/60 backdrop-blur p-12 text-center">
        <div className="text-5xl mb-3">💚</div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Pas encore de coup de cœur ?
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
          Cliquez sur le ❤️ d&apos;une ville pour la sauvegarder ici. C&apos;est local — rien n&apos;est envoyé.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/villes"
            className="rounded-xl bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Explorer les villes →
          </Link>
          <Link
            href="/quiz"
            className="rounded-xl border border-[var(--accent)]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            ✨ Faire le quiz
          </Link>
        </div>
      </div>
    );
  }

  const cities = slugs
    .map((slug) => CITIES_SEED.find((c) => c.slug === slug))
    .filter((c): c is (typeof CITIES_SEED)[number] => Boolean(c))
    .map(seedToCity);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cities.map((city) => (
        <CityCard key={city.slug} city={city} />
      ))}
    </div>
  );
}
