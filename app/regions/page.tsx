import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { hubTitle } from "@/lib/brand";
import { RegionFinder, type RegionEntry } from "@/components/RegionFinder";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: hubTitle("Villes par région · Régions françaises"),
  description:
    "Explorez les meilleures villes françaises région par région : Bretagne, Occitanie, PACA, Auvergne-Rhône-Alpes et plus. Scores comparés, top villes.",
  alternates: pathAlternates("/regions", "/regions"),
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
  "La Réunion": "🌋",
  "Martinique": "🌺",
  "Guadeloupe": "🌴",
  "Guyane": "🌿",
  "Mayotte": "🐢",
};

function regionToSlug(region: string): string {
  return region
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function RegionsPage() {
  const byRegion = CITIES_SEED.reduce((acc, city) => {
    if (!acc[city.region]) acc[city.region] = [];
    acc[city.region].push(city);
    return acc;
  }, {} as Record<string, typeof CITIES_SEED>);

  const sortedRegions = Object.entries(byRegion)
    .map(([region, cities]) => ({
      region,
      slug: regionToSlug(region),
      cities: [...cities].sort((a, b) => b.scores.global - a.scores.global),
      avgScore: cities.reduce((s, c) => s + c.scores.global, 0) / cities.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  const regionEntries: RegionEntry[] = sortedRegions.map(({ region, slug, cities, avgScore }) => ({
    region,
    slug,
    count: cities.length,
    avg: avgScore,
    emoji: REGION_EMOJIS[region] ?? "📍",
  }));

  const cityIndex: Array<[string, string]> = sortedRegions.flatMap(({ slug, cities }) =>
    cities.map((c) => [c.name, slug] as [string, string])
  );

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Régions", path: "/regions" },
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
            <span className="text-[var(--text-secondary)]">Régions</span>
          </nav>
          <div className="flex items-center justify-center gap-3 mb-3">
            <EmojiBadge emoji="🗺️" tone="indigo" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              {sortedRegions.length} régions
            </span>
          </div>
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

      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <RegionFinder regions={regionEntries} cityIndex={cityIndex} />
        </div>
      </section>

      {/* Cartes riches par région — top 3 + pastilles pour les autres villes.
          La grille compacte du finder ne porte pas ces liens ville par ville,
          il faut les garder ici pour préserver le maillage interne. */}
      <section className="band band-sky py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-5">
          {sortedRegions.map(({ region, slug, cities, avgScore }) => (
            <div key={region} className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_14px_36px_-22px_rgba(8,145,178,0.55)] ring-1 ring-[#BAE6FD]/70 transition-shadow hover:shadow-[0_18px_44px_-20px_rgba(79,70,229,0.5)]">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3 min-w-0">
                  <EmojiBadge emoji={REGION_EMOJIS[region] ?? "📍"} tone={toneFor(slug)} className="shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold gradient-text">{region}</h2>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {cities.length} ville{cities.length > 1 ? "s" : ""} ·
                      <span className="ml-1 inline-flex items-center gap-1">
                        score moyen{" "}
                        <span className="font-mono-data font-bold text-[#4338CA]">{avgScore.toFixed(1)}</span>
                        / 10
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/regions/${slug}`}
                  className="inline-flex items-center rounded-full grad-head-0 px-3 py-1.5 text-xs font-semibold shrink-0 transition-transform hover:-translate-y-0.5"
                >
                  Guide région →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cities.slice(0, 3).map((city, i) => (
                  <Link
                    key={city.slug}
                    href={`/villes/${city.slug}`}
                    className="group flex items-center gap-3 rounded-2xl bg-[#F5F7FF] ring-1 ring-[#E0E7FF] hover:ring-[#A5B4FC] hover:bg-[#EEF2FF] transition-all px-4 py-3"
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full grad-head-${i} text-xs font-bold`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors truncate">
                        {city.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] truncate">{city.characterTags.slice(0, 2).join(", ")}</div>
                    </div>
                    <div className="text-sm font-bold font-mono-data text-[#4338CA] flex-shrink-0">
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
                      className="text-xs rounded-full bg-[#F0F9FF] ring-1 ring-[#BAE6FD] px-2.5 py-1 text-[#0E7490] hover:bg-[#E0F2FE] hover:ring-[#7DD3FC] transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="band band-lilac py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-wrap gap-3">
          <Link href="/villes" className="rounded-full grad-head-0 px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5">
            Chercher une ville spécifique →
          </Link>
          {[
            ["/departements", "Par département →"],
            ["/comparer-departements", "Comparer deux départements →"],
            ["/guides/categorie/region", "Lire nos guides « vivre en région » →"],
            ["/carte", "Carte interactive →"],
            ["/leaderboard", "Leaderboard global →"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full bg-white ring-1 ring-[#C7D2FE] px-4 py-2.5 text-sm font-medium text-[#4338CA] hover:ring-[#818CF8] transition-all">
              {label}
            </Link>
          ))}
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
