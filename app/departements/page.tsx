import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { EmojiBadge } from "@/components/EmojiBadge";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { DepartementFinder, type DeptEntry } from "@/components/DepartementFinder";
import { DepartementMap, type DeptMapEntry } from "@/components/DepartementMap";
import { deptNumber } from "@/lib/dept-slug";
import { hubTitle } from "@/lib/brand";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: hubTitle("Villes par département · France"),
  description:
    "Explorez les meilleures villes françaises département par département : Isère, Ille-et-Vilaine, Gironde, Hérault et plus. Scores comparés, top villes.",
  alternates: pathAlternates("/departements", "/departments"),
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
      num: deptNumber(dept, cities[0].inseeCode),
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

  const mapEntries: DeptMapEntry[] = sortedDepts.map(({ dept, num, cities, avgScore }) => ({
    slug: deptToSlug(dept),
    dept,
    num,
    cities: cities.length,
    avg: avgScore,
    lng: cities.reduce((s, c) => s + c.longitude, 0) / cities.length,
    lat: cities.reduce((s, c) => s + c.latitude, 0) / cities.length,
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
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Départements</span>
          </nav>
          <div className="flex items-center justify-center gap-3 mb-3">
            <EmojiBadge emoji="🏙️" tone="pink" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              {sortedDepts.length} départements
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Par <span className="font-display gradient-text-anim italic">département</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            {CITIES_SEED.length} villes regroupées par département, classées par score global.
          </p>
        </div>
      </section>

      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <DepartementMap entries={mapEntries} />
        </div>
      </section>

      <section className="band band-sky py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <DepartementFinder depts={deptEntries} cityIndex={cityIndex} />
        </div>
      </section>

      {/* Index complet ville par ville — replié, mais bien dans le HTML
          statique : c'est lui qui porte le maillage interne vers les {CITIES_SEED.length}
          villes, que la grille compacte ci-dessus ne peut plus assurer. */}
      <section className="band band-lilac py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <details className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_14px_36px_-22px_rgba(124,58,237,0.5)] ring-1 ring-[#DDD6FE]">
            <summary className="cursor-pointer text-base font-bold gradient-text">
              Toutes les villes, département par département
            </summary>
            <div className="mt-5 space-y-5">
              {sortedDepts.map(({ dept, num, cities, avgScore }) => (
                <div key={dept}>
                  <h2 className="text-sm font-bold text-[var(--text-primary)]">
                    <span className="mr-1 inline-flex rounded-md bg-[#EEF2FF] px-1.5 py-0.5 font-mono-data text-xs text-[#4338CA]">{num}</span> {dept}{" "}
                    <Link
                      href={`/departements/${deptToSlug(dept)}`}
                      className="text-xs font-semibold text-[#BE185D] hover:underline"
                    >
                      guide →
                    </Link>
                  </h2>
                  <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {cities.length} ville{cities.length > 1 ? "s" : ""} · score moyen {avgScore.toFixed(1)}/10
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                    {cities.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/villes/${city.slug}`}
                        className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#4338CA]"
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
            <Link href="/villes" className="rounded-full grad-head-0 px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5">
              Chercher une ville spécifique →
            </Link>
            {[
              ["/regions", "Explorer par région →"],
              ["/comparer-departements", "Comparer deux départements →"],
              ["/leaderboard", "Leaderboard global →"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full bg-white ring-1 ring-[#C7D2FE] px-4 py-2.5 text-sm font-medium text-[#4338CA] hover:ring-[#818CF8] transition-all">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>

      <Footer />
    </main>
  );
}
