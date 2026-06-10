import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { getAllTagsWithCounts } from "@/lib/guide-tags";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GUIDES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Tous les tags · Index thématique des guides",
  description:
    "Index complet des tags MaVilleIdeal. Parcourez les guides par thème : télétravail, déménagement, immobilier, ville par ville, climat, mobilité...",
  alternates: { canonical: "/tags" },
};

export default function TagsIndexPage() {
  const tags = getAllTagsWithCounts();

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Guides", href: "/guides" },
              { label: "Tags" },
            ]}
          />
          <Badge variant="accent" className="mb-3">Index</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Tous les tags</h1>
          <p className="text-[var(--text-secondary)]">
            {tags.length} thèmes pour naviguer les {GUIDES_COUNT} guides. Triés par fréquence.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t.slug}
              href={`/tags/${t.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors"
            >
              <span className="text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                {t.label}
              </span>
              <span className="text-xs font-mono-data text-[var(--text-tertiary)]">{t.count}</span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/guides"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Tous les guides
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
