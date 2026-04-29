import Link from "next/link";
import { GUIDES } from "@/data/guides";

export function GuidesTeaser() {
  const featured = GUIDES.slice(0, 3);

  return (
    <section className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
              Guides pratiques
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Prenez la meilleure décision
            </h2>
            <p className="text-[var(--text-secondary)] mt-2 max-w-lg">
              Des analyses honnêtes pour vous aider à choisir où vivre : télétravail, famille,
              budget, retraite.
            </p>
          </div>
          <Link
            href="/guides"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Tous les guides →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {featured.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--accent)]/5 transition-all p-6"
            >
              <div className="text-3xl mb-4">{guide.emoji}</div>
              <div className="text-xs text-[var(--text-tertiary)] mb-2 font-medium uppercase tracking-wide">
                {guide.readMinutes} min · {guide.category === "teletravail" ? "Télétravail" : guide.category === "famille" ? "Famille" : guide.category === "budget" ? "Budget" : "Style de vie"}
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-3">
                {guide.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{guide.intro}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link
            href="/guides"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Voir tous les guides →
          </Link>
        </div>
      </div>
    </section>
  );
}
