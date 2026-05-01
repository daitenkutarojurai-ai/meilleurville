import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";

export const metadata: Metadata = {
  title: "Villes par département — Tous les départements français | MeilleurVille",
  description:
    "Explorez les meilleures villes françaises département par département : Isère, Ille-et-Vilaine, Gironde, Hérault et plus. Scores comparés, top villes.",
};

function deptToSlug(dept: string): string {
  return dept
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function DepartementsPage() {
  const byDept = CITIES_SEED.reduce((acc, city) => {
    if (!acc[city.department]) acc[city.department] = [];
    acc[city.department].push(city);
    return acc;
  }, {} as Record<string, typeof CITIES_SEED>);

  const sortedDepts = Object.entries(byDept)
    .map(([dept, cities]) => ({
      dept,
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
            🏙️ {sortedDepts.length} départements
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Par <span className="font-display gradient-text-anim italic">département</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            {CITIES_SEED.length} villes regroupées par département, classées par score global.
          </p>
        </div>
      </section>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pb-12 space-y-3">
        {sortedDepts.map(({ dept, cities, avgScore }) => (
          <div key={dept} className="rounded-2xl glass border border-white/50 hover:border-[var(--accent)]/30 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">{dept}</h2>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {cities.length} ville{cities.length > 1 ? "s" : ""} · score moyen {avgScore.toFixed(1)}/10
                </div>
              </div>
              <Link
                href={`/departements/${deptToSlug(dept)}`}
                className="text-xs text-[var(--accent)] hover:underline font-medium flex-shrink-0"
              >
                Guide département →
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {cities.map((city, i) => (
                <Link
                  key={city.slug}
                  href={`/villes/${city.slug}`}
                  className="group flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-3 py-1.5"
                >
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{i + 1}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {city.name}
                  </span>
                  <span className="text-xs font-bold font-mono-data text-[var(--accent)]">
                    {city.scores.global.toFixed(1)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-3 pt-4">
          <Link href="/regions" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Explorer par région →
          </Link>
          <Link href="/villes" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Chercher une ville spécifique →
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
