import Link from "@/components/AppLink";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
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
    desc: "Tout ce qu'on nous demande sur MaVilleIdéale en un seul endroit.",
  },
];

const RINGS = [
  "ring-[#C7D2FE] hover:ring-[#818CF8]",
  "ring-[#FBCFE8] hover:ring-[#F472B6]",
  "ring-[#A5F3FC] hover:ring-[#22D3EE]",
];

/**
 * Surfaces a tight grid of cross-links between the static info pages
 * (/glossaire, /calendrier-immobilier, /outils, /methode, /faq). Pass the
 * current page's href via `exclude` so it doesn't link to itself.
 */
export function StaticPageCrossLink({ exclude }: { exclude: string }) {
  const items = ITEMS.filter((i) => i.href !== exclude).slice(0, 3);
  if (items.length === 0) return null;

  // Identité « Couleurs » : bande lilas (distincte de la bande vive ou du fond
  // canevas qui la précède sur les cinq pages statiques), cartes blanches à
  // pastille emoji et anneau teinté en rotation indigo / rose / cyan.
  return (
    <section className="band band-lilac py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="flex items-center gap-2.5 mb-5">
          <EmojiBadge emoji="🧭" tone="lilac" size="sm" />
          <p className="text-xs uppercase tracking-widest text-[#6D28D9] font-semibold">
            Ailleurs sur MaVilleIdéale
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {items.map((i, idx) => (
            <Link
              key={i.href}
              href={i.href}
              className={`group rounded-2xl bg-white p-4 ring-1 shadow-[0_12px_28px_-20px_rgba(109,40,217,0.55)] hover:-translate-y-0.5 hover:shadow-lg transition-all ${RINGS[idx % RINGS.length]}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <EmojiBadge emoji={i.emoji} tone={toneFor(idx)} size="sm" />
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors mb-1">
                {i.label} <span aria-hidden="true" className="text-[#DB2777]">→</span>
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{i.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
