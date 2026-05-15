import Link from "next/link";
import { CITIES_COUNT, GLOSSARY_TERMS_COUNT } from "@/lib/site-stats";

type Item = { href: string; emoji: string; label: string; desc: string };

const ITEMS: Item[] = [
  {
    href: "/glossaire",
    emoji: "📑",
    label: "Glossaire immobilier",
    desc: `${GLOSSARY_TERMS_COUNT} termes clés (DPE, LMNP, ZFE, taxe foncière...) expliqués clairement.`,
  },
  {
    href: "/calendrier-immobilier",
    emoji: "📅",
    label: "Calendrier immobilier 2026",
    desc: "Quand acheter, vendre, louer, déménager — mois par mois.",
  },
  {
    href: "/outils",
    emoji: "🧰",
    label: "Tous les outils",
    desc: "Quiz, simulateur, comparateur, carte, glossaire, calendrier.",
  },
  {
    href: "/methode",
    emoji: "🔬",
    label: "Méthodologie des scores",
    desc: `Comment les ${CITIES_COUNT} villes sont notées sur 8 axes.`,
  },
  {
    href: "/faq",
    emoji: "❓",
    label: "FAQ",
    desc: "Tout ce qu'on nous demande sur MeilleurVille en un seul endroit.",
  },
];

/**
 * Surfaces a tight grid of cross-links between the static info pages
 * (/glossaire, /calendrier-immobilier, /outils, /methode, /faq). Pass the
 * current page's href via `exclude` so it doesn't link to itself.
 */
export function StaticPageCrossLink({ exclude }: { exclude: string }) {
  const items = ITEMS.filter((i) => i.href !== exclude).slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-5">
          Ailleurs sur MeilleurVille
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4 hover:border-[var(--accent)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{i.emoji}</span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-1">
                {i.label}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{i.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
