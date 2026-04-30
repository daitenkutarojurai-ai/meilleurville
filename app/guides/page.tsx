import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { GUIDES, GUIDE_CATEGORIES } from "@/data/guides";
import { GuidesGrid } from "@/components/GuidesGrid";

export const metadata: Metadata = {
  title: "Guides — Bien choisir sa ville en France | MeilleurVille",
  description:
    `${GUIDES.length} guides complets pour choisir sa ville en France : télétravail, famille, budget, qualité de vie. Analyses honnêtes avec données réelles.`,
  openGraph: {
    title: "Guides — Bien choisir sa ville | MeilleurVille",
    description: "Tous nos guides pour vous aider à trouver la ville faite pour vous.",
  },
};

export default function GuidesPage() {
  return (
    <main className="min-h-screen">
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
        <GuidesGrid guides={GUIDES} />

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
