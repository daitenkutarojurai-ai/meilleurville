import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { DepartementFinder, type DeptEntry } from "@/components/DepartementFinder";

// Le n° de département vient du code Insee : 3 chiffres en outre-mer (971-976),
// 2 caractères ailleurs — ce qui donne bien 2A/2B pour la Corse.
function deptNumber(inseeCode: string): string {
  return inseeCode.startsWith("97") ? inseeCode.slice(0, 3) : inseeCode.slice(0, 2);
}

export const metadata: Metadata = {
  title: "Villes par département · France",
  description:
    "Explorez les meilleures villes françaises département par département : Isère, Ille-et-Vilaine, Gironde, Hérault et plus. Scores comparés, top villes.",
  alternates: { canonical: "/departements" },
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
      num: deptNumber(cities[0].inseeCode),
      cities: [...cities].sort((a, b) => b.scores.global - a.scores.global),
      avgScore: cities.reduce((s, c) => s + c.scores.global, 0) / cities.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  const deptEntries: DeptEntry[] = sortedDepts.map(({ dept, num, cities, avgScore }) => ({
    dept,
    slug: deptToSlug(dept),
    num,
    count: cities.length,
    avg: avgScore,
  }));

  const cityIndex: Array<[string, string]> = sortedDepts.flatMap(({ num, cities }) =>
    cities.map((c) => [c.name, num] as [string, string])
  );

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Départements", path: "/departements" },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
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

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pb-12">
        <DepartementFinder depts={deptEntries} cityIndex={cityIndex} />

        {/* Index complet ville par ville — replié, mais bien dans le HTML
            statique : c'est lui qui porte le maillage interne vers les 540
            villes, que la grille compacte ci-dessus ne peut plus assurer. */}
        <details className="mt-8 rounded-2xl glass border border-white/50 p-5">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]">
            Toutes les villes, département par département
          </summary>
          <div className="mt-5 space-y-5">
            {sortedDepts.map(({ dept, num, cities, avgScore }) => (
              <div key={dept}>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  <span className="font-mono-data text-[var(--text-tertiary)]">{num}</span> {dept}{" "}
                  <Link
                    href={`/departements/${deptToSlug(dept)}`}
                    className="text-xs font-medium text-[var(--accent)] hover:underline"
                  >
                    guide →
                  </Link>
                </h2>
                <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                  {cities.length} ville{cities.length > 1 ? "s" : ""} · score moyen {avgScore.toFixed(1)}/10
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/villes/${city.slug}`}
                      className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
                    >
                      {city.name}{" "}
                      <span className="font-mono-data text-xs text-[var(--text-tertiary)]">
                        {city.scores.global.toFixed(1)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>

        <div className="flex flex-wrap gap-3 pt-8">
          <Link href="/regions" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Explorer par région →
          </Link>
          <Link href="/villes" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Chercher une ville spécifique →
          </Link>
          <Link href="/comparer-departements" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Comparer deux départements →
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
