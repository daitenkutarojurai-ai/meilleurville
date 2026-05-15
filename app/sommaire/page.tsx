import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CITIES_SEED } from "@/data/cities-seed";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";
import { RANKING_META } from "@/lib/rankings";
import { getAllTagsWithCounts } from "@/lib/guide-tags";
import { CITIES_COUNT, GUIDES_COUNT, TAGS_COUNT, RANKINGS_COUNT, REGIONS_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Sommaire — Index complet du site | MeilleurVille",
  description: `Index alphabétique complet : ${CITIES_COUNT} villes, ${GUIDES_COUNT} guides, ${TAGS_COUNT} tags, ${RANKINGS_COUNT} classements, ${REGIONS_COUNT} régions, départements et outils. Tout MeilleurVille en une page.`,
  alternates: { canonical: "/sommaire" },
};

// Group cities by first letter for an A-Z index.
function byInitial<T extends { name: string }>(items: T[]): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const item of items) {
    const k = item.name[0].toUpperCase();
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(item);
  }
  return new Map([...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "fr")));
}

export default function SommairePage() {
  const cities = [...CITIES_SEED].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const citiesByLetter = byInitial(cities);

  const guidesByCategory = GUIDE_CATEGORIES.map((cat) => ({
    cat,
    guides: GUIDES.filter((g) => g.category === cat.id).sort((a, b) =>
      a.title.localeCompare(b.title, "fr")
    ),
  }));

  const regions = [...new Set(CITIES_SEED.map((c) => c.region))].sort();
  const tags = getAllTagsWithCounts().slice(0, 50);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Sommaire" }]} />
          <Badge variant="accent" className="mb-3">Sommaire</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            Index complet du site
          </h1>
          <p className="text-[var(--text-secondary)] max-w-3xl">
            {cities.length} villes, {GUIDES.length} guides, {tags.length}+ tags, {regions.length}{" "}
            régions et tous les outils MeilleurVille — en un seul endroit, pour parcourir
            rapidement.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12">
        {/* Top-level navigation */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Navigation</h2>
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            {[
              { href: "/", label: "Accueil" },
              { href: "/villes", label: "Toutes les villes" },
              { href: "/classements", label: "Classements" },
              { href: "/comparer", label: "Comparateur" },
              { href: "/carte", label: "Carte interactive" },
              { href: "/leaderboard", label: "Top 100 villes" },
              { href: "/quiz", label: "Quiz IA" },
              { href: "/red-flags", label: "Red Flag Radar" },
              { href: "/guides", label: "Tous les guides" },
              { href: "/tags", label: "Tous les tags" },
              { href: "/regions", label: "Toutes les régions" },
              { href: "/departements", label: "Tous les départements" },
              { href: "/outils", label: "Tous les outils" },
              { href: "/recherche", label: "Recherche globale" },
              { href: "/glossaire", label: "Glossaire" },
              { href: "/calendrier-immobilier", label: "Calendrier immobilier" },
              { href: "/methode", label: "Méthodologie" },
              { href: "/faq", label: "FAQ" },
              { href: "/feed.xml", label: "Flux RSS" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Classements */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Classements thématiques ({Object.keys(RANKING_META).length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            {Object.entries(RANKING_META).map(([slug, meta]) => (
              <Link
                key={slug}
                href={`/classements/${slug}`}
                className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline"
              >
                {meta.headline}
              </Link>
            ))}
          </div>
        </section>

        {/* Regions */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Régions ({regions.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {regions.map((r) => {
              const slug = r
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{Diacritic}/gu, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              return (
                <Link
                  key={r}
                  href={`/regions/${slug}`}
                  className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline"
                >
                  {r}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Guides by category */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Guides par catégorie ({GUIDES.length})
          </h2>
          <div className="space-y-8">
            {guidesByCategory.map(({ cat, guides }) => (
              <div key={cat.id}>
                <p className={`text-sm font-semibold uppercase tracking-wide mb-2 ${cat.color}`}>
                  {cat.emoji} {cat.label} ({guides.length})
                </p>
                <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  {guides.map((g) => (
                    <Link
                      key={g.slug}
                      href={`/guides/${g.slug}`}
                      className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline truncate"
                    >
                      {g.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top tags */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Tags populaires (top 50)
          </h2>
          <div className="grid sm:grid-cols-3 gap-x-4 gap-y-1.5 text-sm">
            {tags.map((t) => (
              <Link
                key={t.slug}
                href={`/tags/${t.slug}`}
                className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline"
              >
                {t.label} <span className="text-[var(--text-tertiary)] font-mono-data text-xs">({t.count})</span>
              </Link>
            ))}
          </div>
          <Link href="/tags" className="inline-block mt-3 text-xs text-[var(--accent)] hover:underline">
            Voir tous les tags →
          </Link>
        </section>

        {/* Cities A-Z */}
        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Villes A-Z ({cities.length})
          </h2>
          <div className="space-y-6">
            {[...citiesByLetter.entries()].map(([letter, list]) => (
              <div key={letter} id={`city-${letter}`}>
                <p className="text-lg font-bold text-[var(--accent)] mb-2 font-mono-data">{letter}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-sm">
                  {list.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/villes/${c.slug}`}
                      className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline truncate"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
