import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
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
  "Corse": "🏝️",
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
    <main className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-20 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🗺️ {sortedRegions.length} régions
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Explorer{" "}
            <span className="font-display gradient-text-anim italic">par région</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            {CITIES_SEED.length} villes analysées dans {sortedRegions.length} régions françaises —
            chacune avec ses pépites par score global.
          </p>
        </div>
      </section>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pb-12 space-y-5">
        {sortedRegions.map(({ region, cities, avgScore }) => (
          <div key={region} className="group rounded-2xl glass border border-white/50 hover:border-[var(--accent)]/30 p-6 shadow-md hover:shadow-xl transition-all">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-emerald-700 shadow-lg ring-1 ring-white/40 text-2xl">
                  {REGION_EMOJIS[region] ?? "📍"}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{region}</h2>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {cities.length} ville{cities.length > 1 ? "s" : ""} ·
                    <span className="ml-1 inline-flex items-center gap-1">
                      score moyen
                      <span className="font-mono-data font-bold text-[var(--accent)]">{avgScore.toFixed(1)}</span>
                      / 10
                    </span>
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
