// Hubs « Comparer deux départements » (FR /comparer-departements, EN
// /compare-departments) et « Comparer deux régions » (FR /comparer-regions,
// EN /compare-regions) — identité « Couleurs » (2026-10-22).
// Composant serveur, zéro JS : hero en aurore avec puces d'ancre, une bande de
// couleur par région (jamais deux voisines identiques), duels en pastilles
// blanches à anneau teinté indigo / rose / cyan. Les pages gardent leur copie,
// leurs métadonnées et leur JSON-LD ; seul l'habillage vit ici.

import type { ReactNode } from "react";
import Link from "@/components/AppLink";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";

const BANDS = ["band-indigo", "band-pink", "band-sky", "band-aqua", "band-lilac"];

const CHIP_ACCENTS = [
  "bg-[#EEF2FF] text-[#3730A3] ring-[#C7D2FE] hover:bg-[#E0E7FF]",
  "bg-[#FDF2F8] text-[#9D174D] ring-[#FBCFE8] hover:bg-[#FCE7F3]",
  "bg-[#ECFEFF] text-[#155E75] ring-[#A5F3FC] hover:bg-[#CFFAFE]",
];

const PILL_ACCENTS = [
  "ring-[#C7D2FE] hover:ring-[#4F46E5] hover:text-[#3730A3]",
  "ring-[#FBCFE8] hover:ring-[#DB2777] hover:text-[#9D174D]",
  "ring-[#A5F3FC] hover:ring-[#0891B2] hover:text-[#155E75]",
];

const PILL_BASE =
  "inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] shadow-[0_6px_16px_-12px_rgba(79,70,229,0.55)] ring-1 transition";

function Hero({
  emoji,
  eyebrow,
  titleLead,
  titleAccent,
  intro,
  nav,
}: {
  emoji: string;
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  intro: ReactNode;
  nav?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-aurora pt-24 pb-12">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <EmojiBadge
            emoji={emoji}
            tone="indigo"
            size="lg"
            className="shadow-[0_12px_28px_-12px_rgba(79,70,229,0.5)]"
          />
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-[#4338CA]">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-5xl">
              {titleLead}{" "}
              <span className="font-display gradient-text italic pr-1">{titleAccent}</span>
            </h1>
          </div>
        </div>
        <div className="mt-5 max-w-3xl space-y-3 leading-relaxed text-[var(--text-secondary)]">
          {intro}
        </div>
        {nav}
      </div>
    </section>
  );
}

function Vs({ label = "vs" }: { label?: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DB2777]">{label}</span>
  );
}

// ─── Départements ──────────────────────────────────────────────────────────

export type DeptDuelGroup = {
  id: string;
  region: string;
  emoji: string;
  pairs: Array<{ a: string; b: string; href: string }>;
};

export function DepartmentDuelsHub({
  groups,
  eyebrow,
  titleLead,
  titleAccent,
  intro,
  jumpLabel,
  countLabel,
}: {
  groups: DeptDuelGroup[];
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  intro: ReactNode;
  jumpLabel: string;
  countLabel: (n: number) => string;
}) {
  return (
    <>
      <Hero
        emoji="🧭"
        eyebrow={eyebrow}
        titleLead={titleLead}
        titleAccent={titleAccent}
        intro={intro}
        nav={
          <nav aria-label={jumpLabel} className="mt-6 flex flex-wrap gap-2">
            {groups.map((g, i) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition-colors ${CHIP_ACCENTS[i % 3]}`}
              >
                <span aria-hidden="true">{g.emoji}</span>
                {g.region}
                <span className="text-xs font-medium opacity-75">{g.pairs.length}</span>
              </a>
            ))}
          </nav>
        }
      />

      {groups.map((g, gi) => (
        <section
          key={g.id}
          id={g.id}
          aria-labelledby={`${g.id}-title`}
          className={`band ${BANDS[gi % BANDS.length]} scroll-mt-20 py-10`}
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-5 flex items-center gap-4">
              <EmojiBadge emoji={g.emoji} tone={toneFor(gi)} />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                  {countLabel(g.pairs.length)}
                </p>
                <h2 id={`${g.id}-title`} className="text-2xl font-bold text-[var(--text-primary)]">
                  {g.region}
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {g.pairs.map((p, i) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className={`${PILL_BASE} ${PILL_ACCENTS[(gi + i) % 3]}`}
                >
                  {p.a}
                  <Vs />
                  {p.b}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

// ─── Régions ───────────────────────────────────────────────────────────────

export type RegionDuel = {
  a: string;
  b: string;
  emojiA: string;
  emojiB: string;
  href: string;
  tagline?: string;
};

export function RegionDuelsHub({
  featured,
  others,
  eyebrow,
  titleLead,
  titleAccent,
  intro,
  featuredTitle,
  featuredBadge,
  othersTitle,
  othersNote,
  crossLink,
}: {
  featured: RegionDuel[];
  others: RegionDuel[];
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  intro: ReactNode;
  featuredTitle: string;
  featuredBadge: string;
  othersTitle: string;
  othersNote: ReactNode;
  crossLink: ReactNode;
}) {
  return (
    <>
      <Hero
        emoji="🗺️"
        eyebrow={eyebrow}
        titleLead={titleLead}
        titleAccent={titleAccent}
        intro={intro}
      />

      <section aria-labelledby="duels-featured" className="band band-indigo py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-6 flex items-center gap-4">
            <EmojiBadge emoji="⭐" tone="pink" />
            <h2 id="duels-featured" className="text-2xl font-bold text-[var(--text-primary)]">
              {featuredTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {featured.map((d, i) => (
              <Link
                key={d.href}
                href={d.href}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_-18px_rgba(79,70,229,0.45)] ring-1 ring-[#E0E7FF] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-18px_rgba(79,70,229,0.6)]"
              >
                <div className={`grad-head-${i % 6} flex flex-wrap items-center gap-x-2 gap-y-1 px-5 py-3`}>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {featuredBadge}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <span className="text-xl" aria-hidden="true">{d.emojiA}</span>
                    {d.a}
                  </span>
                  <span className="text-xs font-bold uppercase opacity-90">vs</span>
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <span className="text-xl" aria-hidden="true">{d.emojiB}</span>
                    {d.b}
                  </span>
                </div>
                <p className="flex-1 px-5 py-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {d.tagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="duels-all" className="band band-sky py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-6 flex items-center gap-4">
            <EmojiBadge emoji="🔀" tone="aqua" />
            <h2 id="duels-all" className="text-2xl font-bold text-[var(--text-primary)]">
              {othersTitle}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {others.map((d, i) => (
              <Link key={d.href} href={d.href} className={`${PILL_BASE} ${PILL_ACCENTS[i % 3]}`}>
                <span aria-hidden="true">{d.emojiA}</span>
                {d.a}
                <Vs />
                <span aria-hidden="true">{d.emojiB}</span>
                {d.b}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-xs text-[var(--text-secondary)]">{othersNote}</p>
        </div>
      </section>

      <section className="band band-bold py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:px-6">
          <span className="text-4xl" aria-hidden="true">🧭</span>
          <p className="text-base leading-relaxed text-white [&_a]:font-semibold [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2">
            {crossLink}
          </p>
        </div>
      </section>
    </>
  );
}
