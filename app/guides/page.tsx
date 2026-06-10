import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";
import { GuidesGrid } from "@/components/GuidesGrid";
import { getAllTagsWithCounts } from "@/lib/guide-tags";

// Build-time freshness reference — captured once at module load so render
// stays pure (Date.now inside the component body trips react-hooks/purity).
const BUILD_NOW = Date.now();

export const metadata: Metadata = {
  title: "Guides · Bien choisir sa ville en France",
  description:
    `${GUIDES.length} guides complets pour choisir sa ville en France : télétravail, famille, budget, qualité de vie. Analyses honnêtes avec données réelles.`,
  alternates: {
    canonical: "/guides",
    types: { "application/rss+xml": "/guides/feed.xml" },
  },
  openGraph: {
    title: "Guides · Bien choisir sa ville | MaVilleIdeal",
    description: "Tous nos guides pour vous aider à trouver la ville faite pour vous.",
  },
};

export default function GuidesPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Guides MaVilleIdeal",
    description: `Tous les guides pour bien choisir sa ville en France (${GUIDES.length} guides).`,
    url: `${baseUrl}/guides`,
    inLanguage: "fr-FR",
    isPartOf: { "@type": "WebSite", name: "MaVilleIdeal", url: baseUrl },
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

      {/* Hero */}
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">{GUIDES.length} guides pratiques</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Bien choisir sa ville en France
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Des analyses honnêtes pour naviguer les grandes décisions de vie : télétravail, famille, budget,
            retraite. Sans langue de bois, avec des données réelles.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12">
        {/* Interactive guides grid with category filtering */}
        <GuidesGrid guides={GUIDES} now={BUILD_NOW} />

        {/* Categories overview */}
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Par thématique</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GUIDE_CATEGORIES.map((cat) => {
              const count = GUIDES.filter((g) => g.category === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className={`rounded-xl border px-4 py-3 ${cat.bg}`}
                >
                  <div className="text-xl mb-1">{cat.emoji}</div>
                  <div className={`text-sm font-semibold ${cat.color}`}>{cat.label}</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {count} guide{count > 1 ? "s" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular tags */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Tags populaires
            </h2>
            <Link href="/tags" className="text-xs text-[var(--accent)] hover:underline">
              Tous les tags →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {getAllTagsWithCounts().slice(0, 24).map((t) => (
              <Link
                key={t.slug}
                href={`/tags/${t.slug}`}
                className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors"
              >
                <span className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
                  {t.label}
                </span>
                <span className="text-xs font-mono-data text-[var(--text-tertiary)]">{t.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-8 text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Vous ne savez pas par où commencer ?
          </p>
          <p className="text-[var(--text-secondary)] mb-5">
            Notre quiz IA analyse votre profil et vous recommande les villes faites pour vous en 3 minutes.
          </p>
          <Link
            href="/city-match"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
          >
            ✨ Faire le quiz de matching
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
