// Glossaire (FR /glossaire + EN /glossary) — identité « Couleurs » (2026-10-22).
// Composant serveur, zéro JS : hero en aurore avec puces d'ancre vers chaque
// rubrique, puis une bande de couleur par rubrique (rotation sur cinq bandes,
// jamais deux voisines identiques), termes en cartes blanches à liseré dégradé.
// Les ancres `#section-N` des anciennes pages sont conservées.

import type { ReactNode } from "react";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";

export type GlossaryTerm = { term: string; def: string };
export type GlossarySection = { title: string; emoji: string; terms: GlossaryTerm[] };

const BANDS = ["band-indigo", "band-pink", "band-sky", "band-aqua", "band-lilac"];
const CHIPS = [
  "bg-[#EEF2FF] text-[#3730A3] ring-[#C7D2FE] hover:bg-[#E0E7FF]",
  "bg-[#FDF2F8] text-[#9D174D] ring-[#FBCFE8] hover:bg-[#FCE7F3]",
  "bg-[#ECFEFF] text-[#155E75] ring-[#A5F3FC] hover:bg-[#CFFAFE]",
];
const CARD_RINGS = ["ring-[#C7D2FE]", "ring-[#FBCFE8]", "ring-[#A5F3FC]"];
// Liseré dégradé en tête de carte (mêmes dégradés que .grad-head-0…5), peint en
// arrière-plan : un <dl> n'admet que dt/dd dans ses <div>, pas de div décoratif.
const STRIPS = [
  "linear-gradient(120deg, #4F46E5, #7C3AED)",
  "linear-gradient(120deg, #BE185D, #EC4899)",
  "linear-gradient(120deg, #0369A1, #0EA5E9)",
  "linear-gradient(120deg, #0E7490, #06B6D4)",
  "linear-gradient(120deg, #7C3AED, #C026D3)",
  "linear-gradient(120deg, #4338CA, #DB2777)",
];

export function GlossaryView({
  locale = "fr",
  sections,
  breadcrumb,
  title,
  intro,
}: {
  locale?: "fr" | "en";
  sections: GlossarySection[];
  breadcrumb: ReactNode;
  title: ReactNode;
  intro: ReactNode;
}) {
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const termCount = sections.reduce((n, s) => n + s.terms.length, 0);
  const total = sections.length;

  return (
    <>
      <section className="relative overflow-hidden bg-aurora pt-20 pb-12">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          {breadcrumb}
          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center">
            <EmojiBadge
              emoji="📖"
              tone="indigo"
              size="lg"
              className="shadow-[0_12px_28px_-12px_rgba(79,70,229,0.5)]"
            />
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[#4338CA]">
                {t("Glossaire", "Glossary")}
              </p>
              <h1 className="text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-4xl">
                {title}
              </h1>
            </div>
          </div>
          <p className="mt-4 max-w-3xl leading-relaxed text-[var(--text-secondary)]">{intro}</p>
          <p className="mt-4 inline-flex flex-wrap items-center gap-x-2 rounded-full bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm ring-1 ring-[#C7D2FE]">
            <span>{t(`${termCount} termes`, `${termCount} terms`)}</span>
            <span aria-hidden="true" className="text-[#DB2777]">•</span>
            <span>{t(`${total} rubriques`, `${total} sections`)}</span>
          </p>

          <nav id="sommaire" aria-label={t("Rubriques du glossaire", "Glossary sections")} className="mt-6 scroll-mt-24">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
              {t("Sections", "Sections")}
            </p>
            <ol className="flex flex-wrap gap-2">
              {sections.map((s, i) => (
                <li key={i}>
                  <a
                    href={`#section-${i}`}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition-colors ${CHIPS[i % CHIPS.length]}`}
                  >
                    <span aria-hidden="true">{s.emoji}</span>
                    {s.title}
                    <span className="text-xs font-medium opacity-75">({s.terms.length})</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {sections.map((section, i) => (
        <section
          key={i}
          id={`section-${i}`}
          aria-labelledby={`section-${i}-title`}
          className={`band ${BANDS[i % BANDS.length]} scroll-mt-20 py-12`}
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-6 flex items-start gap-4">
              <EmojiBadge emoji={section.emoji} tone={toneFor(i)} />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                  {t(`Rubrique ${i + 1} / ${total}`, `Section ${i + 1} of ${total}`)}
                  {" · "}
                  {t(`${section.terms.length} termes`, `${section.terms.length} terms`)}
                </p>
                <h2 id={`section-${i}-title`} className="text-2xl font-bold text-[var(--text-primary)]">
                  {section.title}
                </h2>
              </div>
            </div>

            <dl className="grid gap-4 md:grid-cols-2">
              {section.terms.map((term, j) => (
                <div
                  key={j}
                  className={`rounded-2xl px-5 pb-5 pt-6 shadow-[0_10px_30px_-18px_rgba(79,70,229,0.45)] ring-1 ${CARD_RINGS[(i + j) % CARD_RINGS.length]}`}
                  style={{ background: `${STRIPS[(i + j) % STRIPS.length]} top / 100% 6px no-repeat, #fff` }}
                >
                  <dt className="mb-2 font-bold leading-snug text-[var(--text-primary)]">{term.term}</dt>
                  <dd className="text-sm leading-relaxed text-[var(--text-secondary)]">{term.def}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-right">
              <a
                href="#sommaire"
                className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE] hover:bg-white hover:underline"
              >
                <span aria-hidden="true">↑</span>
                {t("Retour aux rubriques", "Back to sections")}
              </a>
            </p>
          </div>
        </section>
      ))}
    </>
  );
}
