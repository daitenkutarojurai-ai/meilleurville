import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";

export const metadata: Metadata = {
  title: "Villes par région — Toutes les régions françaises | MeilleurVille",
  description:
    "Explorez les meilleures villes françaises région par région : Bretagne, Occitanie, PACA, Auvergne-Rhône-Alpes et plus. Scores comparés, top villes.",
};

const REGION_EMOJIS: Record<string, string> = {
  "Auvergne-Rhône-Alpes": "⛰️",
  "Pays de la Loire": "🌊",
  "Bretagne": "⚓",
  "Nouvelle-Aquitaine": "🍷",
  "Occitanie": "☀️",
  "Normandie": "🏰",
  "Bourgogne-Franche-Comté": "🍇",
  "Centre-Val de Loire": "🏰",
  "Hauts-de-France": "🌾",
  "Provence-Alpes-Côte d'Azur": "🌺",
  "Grand Est": "🥨",
  "Île-de-France": "🗼",
};

export default function RegionsPage() {
  const byRegion = CITIES_SEED.reduce((acc, city) => {
    if (!acc[city.region]) acc[city.region] = [];
    acc[city.region].push(city);
    return acc;
  }, {} as Record<string, typeof CITIES_SEED>);

  const sortedRegions = Object.entries(byRegion)
    .map(([region, cities]) => ({
      region,
      cities: [...cities].sort((a, b) => b.scores.global - a.scores.global),
      avgScore: cities.reduce((s, c) => s + c.scores.global, 0) / cities.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Par région</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Explorer par région
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            {CITIES_SEED.length} villes analysées dans {sortedRegions.length} régions françaises.
            Chaque région avec ses meilleures villes par score global.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-6">
        {sortedRegions.map(({ region, cities, avgScore }) => (
          <div key={region} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{REGION_EMOJIS[region] ?? "📍"}</div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">{region}</h2>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {cities.length} ville{cities.length > 1 ? "s" : ""} · score moyen {avgScore.toFixed(1)}/10
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  href={`/regions/${region.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                  className="text-xs text-[var(--accent)] hover:underline font-medium"
                >
                  Guide région →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cities.slice(0, 3).map((city, i) => (
                <Link
                  key={city.slug}
                  href={`/villes/${city.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3"
                >
                  <div className="text-sm font-mono text-[var(--text-tertiary)] w-5 text-right">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {city.name}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] truncate">{city.characterTags.slice(0, 2).join(", ")}</div>
                  </div>
                  <div className="text-sm font-bold font-mono-data text-[var(--accent)] flex-shrink-0">
                    {city.scores.global.toFixed(1)}
                  </div>
                </Link>
              ))}
            </div>

            {cities.length > 3 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {cities.slice(3).map((city) => (
                  <Link
                    key={city.slug}
                    href={`/villes/${city.slug}`}
                    className="text-xs rounded-full border border-[var(--border)] px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-colors"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-3 pt-4">
          <Link href="/villes" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Chercher une ville spécifique →
          </Link>
          <Link href="/departements" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Par département →
          </Link>
          <Link href="/carte" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Carte interactive →
          </Link>
          <Link href="/leaderboard" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Leaderboard global →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
