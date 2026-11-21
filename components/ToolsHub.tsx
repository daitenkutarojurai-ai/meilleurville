// Hub « Outils » (FR /outils + EN /tools) — identité « Couleurs » (2026-10-22).
// Composant serveur, zéro JS : hero en aurore, une bande de couleur par famille
// d'outils (jamais deux voisines identiques), cartes blanches à pastille emoji.
// Les familles regroupent l'affichage seulement : l'ordre de la liste source
// (et donc l'ItemList JSON-LD des pages) ne change pas.

import type { ReactNode } from "react";
import Link from "@/components/AppLink";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";

export type HubTool = {
  href: string;
  emoji: string;
  title: string;
  desc: string;
  cta: string;
  group: string;
};

export type HubGroup = {
  id: string;
  emoji: string;
  title: string;
  lead: string;
};

const BANDS = ["band-indigo", "band-pink", "band-sky", "band-aqua", "band-lilac"];
// Anneau + couleur du lien d'appel, en rotation dans les familles indigo / rose / cyan.
const CARD_ACCENTS = [
  { ring: "ring-[#C7D2FE] hover:ring-[#4F46E5]", cta: "text-[#4338CA]" },
  { ring: "ring-[#FBCFE8] hover:ring-[#DB2777]", cta: "text-[#BE185D]" },
  { ring: "ring-[#A5F3FC] hover:ring-[#0891B2]", cta: "text-[#0E7490]" },
];

export function ToolsHub({
  tools,
  groups,
  breadcrumb,
  eyebrow,
  titleLead,
  titleAccent,
  intro,
  countLabel,
  jumpLabel,
}: {
  tools: HubTool[];
  groups: HubGroup[];
  breadcrumb: ReactNode;
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  intro: string;
  countLabel: (n: number) => string;
  jumpLabel: string;
}) {
  const visibleGroups = groups.filter((g) => tools.some((t) => t.group === g.id));

  return (
    <>
      <section className="relative overflow-hidden bg-aurora pt-20 pb-12">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {breadcrumb}
          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center">
            <EmojiBadge
              emoji="🧰"
              tone="indigo"
              size="lg"
              className="shadow-[0_12px_28px_-12px_rgba(79,70,229,0.5)]"
            />
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[#4338CA]">
                {eyebrow}
              </p>
              <h1 className="text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-4xl">
                {titleLead}{" "}
                <span className="font-display gradient-text italic pr-1">{titleAccent}</span>
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl leading-relaxed text-[var(--text-secondary)]">{intro}</p>

          <nav aria-label={jumpLabel} className="mt-6 flex flex-wrap gap-2">
            {visibleGroups.map((g, i) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors ${
                  [
                    "bg-[#EEF2FF] text-[#3730A3] ring-[#C7D2FE] hover:bg-[#E0E7FF]",
                    "bg-[#FDF2F8] text-[#9D174D] ring-[#FBCFE8] hover:bg-[#FCE7F3]",
                    "bg-[#ECFEFF] text-[#155E75] ring-[#A5F3FC] hover:bg-[#CFFAFE]",
                  ][i % 3]
                }`}
              >
                <span aria-hidden="true">{g.emoji}</span>
                {g.title}
                <span className="text-xs font-medium opacity-75">
                  {tools.filter((t) => t.group === g.id).length}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {visibleGroups.map((g, gi) => {
        const items = tools.filter((t) => t.group === g.id);
        return (
          <section
            key={g.id}
            id={g.id}
            aria-labelledby={`${g.id}-title`}
            className={`band ${BANDS[gi % BANDS.length]} scroll-mt-20 py-12`}
          >
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="mb-6 flex items-start gap-4">
                <EmojiBadge emoji={g.emoji} tone={toneFor(gi)} />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                    {countLabel(items.length)}
                  </p>
                  <h2
                    id={`${g.id}-title`}
                    className="text-2xl font-bold text-[var(--text-primary)]"
                  >
                    {g.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
                    {g.lead}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((t, i) => {
                  const accent = CARD_ACCENTS[(gi + i) % CARD_ACCENTS.length];
                  return (
                    <Link
                      key={`${t.href}-${t.title}`}
                      href={t.href}
                      className={`group flex flex-col rounded-2xl bg-white p-5 shadow-[0_10px_30px_-18px_rgba(79,70,229,0.45)] ring-1 transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-18px_rgba(79,70,229,0.55)] ${accent.ring}`}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <EmojiBadge emoji={t.emoji} tone={toneFor(gi * 7 + i)} size="sm" />
                        <h3 className="text-base font-bold leading-snug text-[var(--text-primary)]">
                          {t.title}
                        </h3>
                      </div>
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                        {t.desc}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-semibold ${accent.cta} group-hover:underline`}
                      >
                        {t.cta}
                        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
