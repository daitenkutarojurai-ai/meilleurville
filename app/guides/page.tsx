import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";
import { GuidesGrid } from "@/components/GuidesGrid";
import { getAllTagsWithCounts } from "@/lib/guide-tags";
import { hubTitle } from "@/lib/brand";
import { pathAlternates } from "@/lib/i18n";

// Build-time freshness reference — captured once at module load so render
// stays pure (Date.now inside the component body trips react-hooks/purity).
const BUILD_NOW = Date.now();

export const metadata: Metadata = {
  title: hubTitle("Guides · Bien choisir sa ville en France"),
  description:
    `${GUIDES.length} guides complets pour choisir sa ville en France : télétravail, famille, budget, qualité de vie. Analyses honnêtes avec données réelles.`,
  alternates: {
    ...pathAlternates("/guides", "/guides"),
    types: { "application/rss+xml": "/guides/feed.xml" },
  },
  openGraph: {
    title: "Guides · Bien choisir sa ville | MaVilleIdéale",
    description: "Tous nos guides pour vous aider à trouver la ville faite pour vous.",
  },
};

export default function GuidesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Guides MaVilleIdéale",
    description: `Tous les guides pour bien choisir sa ville en France (${GUIDES.length} guides).`,
    url: `${baseUrl}/guides`,
    inLanguage: "fr-FR",
    isPartOf: { "@type": "WebSite", name: "MaVilleIdéale", url: baseUrl },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${baseUrl}/guides` },
      ],
    },
    hasPart: GUIDES.slice(0, 50).map((g) => ({
      "@type": "Article",
      headline: g.title,
      url: `${baseUrl}/guides/${g.slug}`,
      datePublished: g.publishedAt,
      dateModified: g.updatedAt,
    })),
  };
  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <Navbar />

      {/* Hero — « Couleurs » : aurore colorée, titre en dégradé. */}
      <section className="relative bg-aurora pt-20 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <EmojiBadge emoji="📚" tone="indigo" size="md" />
            <span className="rounded-full grad-head-0 px-3 py-1 text-xs font-semibold shadow-[0_8px_18px_-10px_rgba(79,70,229,0.8)]">
              {GUIDES.length} guides pratiques
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.08]">
            Bien choisir <span className="gradient-text">sa ville en France</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl sm:text-lg">
            Des analyses honnêtes pour naviguer les grandes décisions de vie : télétravail, famille, budget,
            retraite. Sans langue de bois, avec des données réelles.
          </p>
        </div>
      </section>

      {/* Interactive guides grid with category filtering. Project to the
          card fields — passing full Guide objects serializes every
          sections[] body into the flight payload (~3.8 MB of HTML).
          `intro` is cut to an excerpt too: the card clamps it to two lines,
          but the full text shipped twice (DOM + flight payload) for all 654
          guides. It stays long enough to remain useful as a search haystack. */}
      <section className="band band-indigo py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <GuidesGrid
            guides={GUIDES.map(({ slug, title, intro, category, emoji, readMinutes, publishedAt, updatedAt, tags }) => ({
              slug, title, category, emoji, readMinutes, publishedAt, updatedAt, tags,
              intro: intro.length > 200 ? intro.slice(0, 200).replace(/\s+\S*$/, "") + "…" : intro,
            }))}
            now={BUILD_NOW}
          />
        </div>
      </section>

      {/* Every guide stays one hop from this hub even though the grid only
          renders its first batch — this is the crawlable index, not a
          decoration. ~100 bytes a link against ~2.4 kB for a card. */}
      <section className="band band-white py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <details className="rounded-2xl border border-[#C7D2FE] bg-[#F5F7FF] p-5">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--accent)]">
              Index complet — {GUIDES.length} guides
            </summary>
            <ul className="mt-4 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {GUIDES.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                  >
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>

      {/* Categories overview — tuiles blanches à pastille dégradée. Les teintes
          de catégorie (vert, ambre, orange, violet) sont réservées aux paliers
          de score : elles ne servent plus de fond décoratif ici. */}
      <section className="band band-pink py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-5">
            <span className="gradient-text">Par thématique</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GUIDE_CATEGORIES.map((cat, idx) => {
              const count = GUIDES.filter((g) => g.category === cat.id).length;
              return (
                <Link
                  key={cat.id}
                  href={`/guides/categorie/${cat.id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-[0_10px_28px_-18px_rgba(219,39,119,0.55)] hover:-translate-y-0.5 hover:border-[#FBCFE8] transition-all"
                >
                  <EmojiBadge emoji={cat.emoji} tone={toneFor(idx)} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-pink)] transition-colors">{cat.label}</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {count} guide{count > 1 ? "s" : ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular tags */}
      <section className="band band-sky py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <h2 className="text-xl sm:text-2xl font-bold">
              <span className="gradient-text">Tags populaires</span>
            </h2>
            <Link href="/tags" className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0E7490] shadow-sm hover:text-[var(--accent)] transition-colors">
              Tous les tags →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {getAllTagsWithCounts().slice(0, 24).map((t) => (
              <Link
                key={t.slug}
                href={`/tags/${t.slug}`}
                className="group inline-flex items-center gap-2 rounded-full border border-white bg-white px-3 py-1.5 text-sm shadow-[0_6px_16px_-12px_rgba(8,145,178,0.6)] hover:border-[#A5F3FC] transition-colors"
              >
                <span className="text-[var(--text-secondary)] group-hover:text-[#0E7490] transition-colors">
                  {t.label}
                </span>
                <span className="rounded-full bg-[#DBF6FA] px-1.5 text-xs font-mono-data text-[#0E7490]">{t.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — le seul bloc en bande vive de la page. */}
      <section className="band band-bold py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-xl sm:text-2xl font-bold text-white mb-2">
            Vous ne savez pas par où commencer ?
          </p>
          <p className="text-[var(--text-secondary)] mb-6">
            Notre quiz IA analyse votre profil et vous recommande les villes faites pour vous en 3 minutes.
          </p>
          <Link
            href="/city-match"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-[var(--accent)] font-semibold px-6 py-3 shadow-[0_12px_28px_-14px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 transition-transform"
          >
            ✨ Faire le quiz de matching
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
