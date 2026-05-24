import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CITIES_SEED } from "@/data/cities-seed";
import type { City } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CityCard } from "@/components/CityCard";
import { SignOutButton } from "./SignOutButton";
import { Heart } from "lucide-react";

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

export const metadata: Metadata = {
  title: "Mes villes · MaVilleIdeal",
  description: "Votre espace personnel — vos villes sauvegardées et favoris.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/mes-villes" },
};

export default async function MesVillesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: rows } = await supabase
    .from("favorites")
    .select("city_slug")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const slugs = (rows ?? []).map((r) => r.city_slug);
  const savedCities = slugs
    .map((slug) => CITIES_SEED.find((c) => c.slug === slug))
    .filter((c): c is (typeof CITIES_SEED)[number] => Boolean(c))
    .map(seedToCity);

  const email = user.email ?? "";
  const displayName = email.split("@")[0];

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-20 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
                Mon espace
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-1">
                Bonjour,{" "}
                <span className="gradient-text-anim font-display italic">{displayName}</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">{email}</p>
            </div>
            <SignOutButton />
          </div>

          {/* Favorites section */}
          <div className="mb-6 flex items-center gap-3">
            <Heart className="h-5 w-5 text-[var(--accent-pink)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Vos villes sauvegardées
              {savedCities.length > 0 && (
                <span className="ml-2 text-sm font-normal text-[var(--text-tertiary)]">
                  ({savedCities.length})
                </span>
              )}
            </h2>
          </div>

          {savedCities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)]/50 px-6 py-12 text-center">
              <Heart className="mx-auto h-10 w-10 text-[var(--text-tertiary)] mb-4" strokeWidth={1.5} />
              <p className="text-[var(--text-secondary)] font-medium mb-1">
                Aucune ville sauvegardée pour l&apos;instant
              </p>
              <p className="text-[var(--text-tertiary)] text-sm">
                Parcourez les villes et cliquez sur ♥ pour les sauvegarder ici.
              </p>
              <a
                href="/villes"
                className="inline-flex items-center gap-2 mt-6 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent)]/90 transition-colors"
              >
                Explorer les villes
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCities.map((city: City) => (
                <CityCard key={city.slug} city={city} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
