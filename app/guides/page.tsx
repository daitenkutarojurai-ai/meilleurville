import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GuideCard } from "@/components/GuideCard";
import { Badge } from "@/components/ui/Badge";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";

export const metadata: Metadata = {
  title: "Guides — Bien choisir sa ville en France | MeilleurVille",
  description:
    "Guides complets pour choisir sa ville en France : télétravail, famille, budget, qualité de vie. Analyses honnêtes avec données réelles.",
  openGraph: {
    title: "Guides — Bien choisir sa ville | MeilleurVille",
    description: "Tous nos guides pour vous aider à trouver la ville faite pour vous.",
  },
};

export default function GuidesPage() {
  const featured = GUIDES[0];
  const rest = GUIDES.slice(1);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Guides pratiques</Badge>
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
        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium px-3 py-1.5">
            Tous les guides
          </span>
          {GUIDE_CATEGORIES.map((cat) => (
            <span
              key={cat.id}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] text-xs font-medium px-3 py-1.5 hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              {cat.emoji} {cat.label}
            </span>
          ))}
        </div>

        {/* Featured guide */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-4">
            À la une
          </h2>
          <Link
            href={`/guides/${featured.slug}`}
            className="group block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-xl hover:shadow-[var(--accent)]/5 transition-all duration-200 p-8"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center text-4xl">
                {featured.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="accent">{featured.category === "teletravail" ? "Télétravail" : featured.category}</Badge>
                  <span className="text-xs text-[var(--text-tertiary)]">{featured.readMinutes} min de lecture</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-3">
                  {featured.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {featured.intro}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {featured.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* All guides grid */}
        <div>
          <h2 className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-4">
            Tous les guides ({GUIDES.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {rest.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} featured />
            ))}
          </div>
        </div>

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

        {/* CTA */}
        <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-8 text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Vous ne savez pas par où commencer ?
          </p>
          <p className="text-[var(--text-secondary)] mb-5">
            Notre quiz IA analyse votre profil et vous recommande les villes faites pour vous en 3 minutes.
          </p>
          <Link
            href="/quiz"
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
