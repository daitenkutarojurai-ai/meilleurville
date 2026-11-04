import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge } from "@/components/EmojiBadge";
import { getAllTagsWithCounts } from "@/lib/guide-tags";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GUIDES_COUNT } from "@/lib/site-stats";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Tous les tags · Index thématique des guides",
  description:
    "Index complet des tags MaVilleIdéale. Parcourez les guides par thème : télétravail, déménagement, immobilier, ville par ville, climat, mobilité...",
  alternates: pathAlternates("/tags", "/tags"),
};

export default function TagsIndexPage() {
  const tags = getAllTagsWithCounts();

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Guides", href: "/guides" },
              { label: "Tags" },
            ]}
          />
          <div className="mb-3 flex items-center gap-3">
            <EmojiBadge emoji="🏷️" tone="indigo" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="gradient-text">Tous les tags</span>
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            {tags.length} thèmes pour naviguer les {GUIDES_COUNT} guides. Triés par fréquence.
          </p>
        </div>
      </section>

      {/* Nuage de tags — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex flex-wrap gap-2.5">
          {tags.map((t) => (
            <Link
              key={t.slug}
              href={`/tags/${t.slug}`}
              className="group inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-3.5 pr-1.5 text-sm shadow-[0_8px_20px_-16px_rgba(79,70,229,0.7)] ring-1 ring-[#C7D2FE] transition hover:-translate-y-0.5 hover:ring-[#4F46E5]"
            >
              <span className="font-medium text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
                {t.label}
              </span>
              <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-xs font-semibold font-mono-data text-[#4338CA] group-hover:bg-gradient-to-r group-hover:from-[#4F46E5] group-hover:to-[#DB2777] group-hover:text-white">{t.count}</span>
            </Link>
          ))}
        </div>
        </div>
      </section>

      {/* Renvoi — bande rose */}
      <section className="band band-pink py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-wrap gap-3">
          <Link
            href="/guides"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#4F46E5] to-[#DB2777] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(79,70,229,0.7)] transition hover:opacity-95"
          >
            ← Tous les guides
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
