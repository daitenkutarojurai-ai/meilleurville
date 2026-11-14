import { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { hreflangLanguages } from "@/lib/i18n";
import { Footer } from "@/components/Footer";
import { CommentSection } from "@/components/CommentSection";
import { CITIES_SEED } from "@/data/cities-seed";
import { EmojiBadge } from "@/components/EmojiBadge";
import type { City } from "@/lib/types";
import Link from "@/components/AppLink";
import { getHousing } from "@/data/housing";
import React from "react";
import { TripletView } from "./TripletView";
import { VsBattle } from "@/components/VsBattle";
import { fitTitle } from "@/lib/brand";

type Props = { params: Promise<{ pair: string }> };

// SEO_PAIRS is shared with app/sitemap.ts to avoid drift
import { SEO_PAIRS } from "@/lib/comparer-pairs";
import { SEO_TRIPLETS } from "@/lib/comparer-triplets";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;

export function generateStaticParams() {
  return [
    ...SEO_PAIRS.map(([a, b]) => ({ pair: `${a}-vs-${b}` })),
    ...SEO_TRIPLETS.map(([a, b, c]) => ({ pair: `${a}-vs-${b}-vs-${c}` })),
  ];
}

// Only the curated SEO_PAIRS / SEO_TRIPLETS are pre-built and sitemap'd; any
// other pair 404s (required by output: "export" — no on-demand rendering).
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parts = pair.split("-vs-");

  if (parts.length === 3) {
    const cities = parts.map((s) => CITIES_SEED.find((c) => c.slug === s));
    if (cities.some((c) => !c)) return {};
    const [a, b, c] = cities as NonNullable<(typeof cities)[number]>[];
    return {
      title: `${a.name} vs ${b.name} vs ${c.name} · Comparaison 3 villes 2026`,
      description: `Comparaison à 3 entre ${a.name} (${a.scores.global}/10), ${b.name} (${b.scores.global}/10) et ${c.name} (${c.scores.global}/10) : coût de vie, sécurité, transport, nature, écoles. Tableau côte à côte + radar.`,
      alternates: { canonical: `/comparer/${pair}`, languages: hreflangLanguages(`/comparer/${pair}`) },
      openGraph: {
        // Sans `images`, un openGraph de page remplace celui hérité de la racine
        // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
        images: ["/opengraph-image"],
        title: `${a.name} vs ${b.name} vs ${c.name} · Quelle ville choisir ?`,
        description: `Comparatif complet sur 9 critères avec verdict par profil.`,
      },
    };
  }

  const [slugA, slugB] = parts;
  const a = CITIES_SEED.find((c) => c.slug === slugA);
  const b = CITIES_SEED.find((c) => c.slug === slugB);
  if (!a || !b) return {};

  return {
    title: fitTitle(`${a.name} vs ${b.name} · Comparaison qualité de vie 2026`),
    description: `Comparaison complète entre ${a.name} (${a.scores.global}/10) et ${b.name} (${b.scores.global}/10) : coût de vie, transport, nature, sécurité, écoles. Laquelle choisir ?`,
    alternates: { canonical: `/comparer/${pair}`, languages: hreflangLanguages(`/comparer/${pair}`) },
    openGraph: {
      // Même raison qu'au-dessus, et le correctif du 2026-08-03 avait manqué
      // cette branche : les 722 paires partaient sans `og:image` pendant que
      // les 49 triplets et la jumelle EN en avaient une.
      images: ["/opengraph-image"],
      title: `${a.name} vs ${b.name} · Quelle ville choisir ?`,
      description: `${a.name} : ${a.scores.global}/10 · ${b.name} : ${b.scores.global}/10. Comparez tous les critères.`,
    },
  };
}

function seedToCity(s: (typeof CITIES_SEED)[number]): City {
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    region: s.region,
    department: s.department,
    population: s.population,
    latitude: s.latitude,
    longitude: s.longitude,
    scores: s.scores,
    characterTags: s.characterTags,
    reviewCount: 180 + Math.floor(s.scores.global * 30),
    sunshinedays: s.sunshinedays,
    avgTempJuly: s.avgTempJuly,
    avgTempJanuary: s.avgTempJanuary,
  };
}

const SCORE_ROWS: Array<{ key: keyof (typeof CITIES_SEED)[number]["scores"]; label: string }> = [
  { key: "global", label: "Score global" },
  { key: "life", label: "Qualité de vie" },
  { key: "transport", label: "Transport" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Coût de vie" },
  { key: "safety", label: "Sécurité" },
  { key: "culture", label: "Culture" },
  { key: "remoteWork", label: "Télétravail" },
  { key: "schools", label: "Écoles" },
];

type ScoreKey = keyof (typeof CITIES_SEED)[number]["scores"];

const PROFILES: Array<{ label: string; emoji: string; keys: ScoreKey[]; desc: string }> = [
  { label: "Famille", emoji: "👨‍👩‍👧", keys: ["safety", "schools", "nature", "cost"], desc: "sécurité, écoles, espaces verts, budget" },
  { label: "Télétravail", emoji: "💻", keys: ["remoteWork", "transport", "cost", "life"], desc: "fibre, coworking, coût, qualité de vie" },
  { label: "Retraite", emoji: "☀️", keys: ["nature", "safety", "cost", "life"], desc: "nature, sécurité, budget, bien-être" },
  { label: "Étudiant·e", emoji: "🎓", keys: ["culture", "transport", "cost", "schools"], desc: "culture, transports, budget, campus" },
];

export default async function PairPage({ params }: Props) {
  const { pair } = await params;
  const parts = pair.split("-vs-");

  // 3-city dispatch — same dynamic segment, different render.
  if (parts.length === 3) {
    const cities = parts.map((s) => CITIES_SEED.find((c) => c.slug === s));
    if (cities.some((c) => !c)) notFound();
    const tripletCities = cities as NonNullable<(typeof cities)[number]>[];
    return (
      <>
        <Navbar />
        <TripletView cities={tripletCities} slug={pair} />
        <Footer />
      </>
    );
  }

  if (parts.length !== 2) notFound();

  const [slugA, slugB] = parts;
  const seedA = CITIES_SEED.find((c) => c.slug === slugA);
  const seedB = CITIES_SEED.find((c) => c.slug === slugB);

  if (!seedA || !seedB) notFound();

  const cityA = seedToCity(seedA);
  const cityB = seedToCity(seedB);

  const winsA = SCORE_ROWS.filter(({ key }) => seedA.scores[key] > seedB.scores[key]).length;
  const winsB = SCORE_ROWS.filter(({ key }) => seedB.scores[key] > seedA.scores[key]).length;
  const winner = winsA > winsB ? cityA : winsB > winsA ? cityB : null;

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "MaVilleIdéale", item: process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr" },
                  { "@type": "ListItem", position: 2, name: "Comparer", item: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr"}/comparer` },
                  { "@type": "ListItem", position: 3, name: `${seedA.name} vs ${seedB.name}`, item: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr"}/comparer/${pair}` },
                ],
              },
              {
                "@type": "ItemList",
                name: `${seedA.name} vs ${seedB.name} · Comparaison`,
                itemListElement: [cityA, cityB].map((c, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: c.name,
                  url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr"}/villes/${c.slug}`,
                })),
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: `Quelle est la meilleure ville entre ${seedA.name} et ${seedB.name} ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: winner
                        ? `${winner.name} l'emporte globalement avec un score de ${winner.scores.global.toFixed(1)}/10 contre ${(winner.slug === seedA.slug ? seedB : seedA).scores.global.toFixed(1)}/10. ${winner.characterTags.slice(0, 3).join(", ")}.`
                        : `${seedA.name} (${seedA.scores.global}/10) et ${seedB.name} (${seedB.scores.global}/10) sont très proches. Le choix dépend de vos priorités personnelles.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `Quelle est la différence de coût entre ${seedA.name} et ${seedB.name} ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `${seedA.name} a un score coût de la vie de ${seedA.scores.cost}/10 et ${seedB.name} de ${seedB.scores.cost}/10. ${seedA.scores.cost > seedB.scores.cost ? seedA.name : seedB.name} est la ville la plus abordable.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `Où est-il plus facile de télétravailler, à ${seedA.name} ou ${seedB.name} ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `${seedA.name} obtient ${seedA.scores.remoteWork}/10 en télétravail et ${seedB.name} obtient ${seedB.scores.remoteWork}/10. ${seedA.scores.remoteWork > seedB.scores.remoteWork ? seedA.name : seedB.name} est mieux équipée pour le télétravail.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `${seedA.name} ou ${seedB.name} : laquelle est meilleure pour les familles avec enfants ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Score sécurité — ${seedA.name} : ${seedA.scores.safety}/10, ${seedB.name} : ${seedB.scores.safety}/10. Score écoles — ${seedA.name} : ${seedA.scores.schools}/10, ${seedB.name} : ${seedB.scores.schools}/10. ${(seedA.scores.safety + seedA.scores.schools) > (seedB.scores.safety + seedB.scores.schools) ? seedA.name : seedB.name} est globalement mieux notée pour les familles sur ces deux critères.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `${seedA.name} ou ${seedB.name} : laquelle a le meilleur cadre naturel ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `${seedA.name} obtient ${seedA.scores.nature}/10 sur le critère nature et ${seedB.name} obtient ${seedB.scores.nature}/10. ${seedA.scores.nature > seedB.scores.nature ? seedA.name : seedB.name} l'emporte côté nature, parcs et accès au plein air.`,
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />

      {/* Header */}
      <section className="relative overflow-hidden bg-aurora pt-20 pb-10 sm:pb-12">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-[var(--text-tertiary)]">
            <Link href="/comparer" className="font-medium text-[#4338CA] hover:text-[#BE185D]">Comparer</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <span>{seedA.name} vs {seedB.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <EmojiBadge emoji="⚔️" tone="indigo" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Comparaison 2026 · Mode battle
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.08]">
            <span className="gradient-text-anim pr-1">{seedA.name}</span>{" "}
            <span className="inline-flex align-middle items-center justify-center rounded-full grad-head-5 px-2.5 py-0.5 text-sm sm:text-base font-extrabold">vs</span>{" "}
            <span className="gradient-text-anim pr-1">{seedB.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg">
            Duel critère par critère, avec verdict final.
          </p>
        </div>
      </section>

      {/* Duel */}
      <section className="band band-indigo py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <VsBattle a={seedA} b={seedB} />

          {/* F63 cross-link: synthèse 8 axes */}
          <Link
            href={`/comparer/${pair}/synthese`}
            className="block rounded-2xl bg-white ring-1 ring-[#C7D2FE] shadow-[0_14px_34px_-24px_rgba(79,70,229,0.6)] hover:ring-[#4F46E5] hover:-translate-y-0.5 hover:shadow-lg transition-all p-5 group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <EmojiBadge emoji="✨" tone="pink" size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
                    Synthèse 8 axes — {seedA.name} vs {seedB.name}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    Comparaison sur env / santé / emploi / cadre / vélo / sécurité / démo / services
                    publics, écart significatif ±0,3 pt par axe.
                  </div>
                </div>
              </div>
              <span className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full grad-head-0 text-sm font-bold" aria-hidden>→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Climat + immobilier */}
      <section className="band band-sky py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <EmojiBadge emoji="🌤️" tone="sky" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Climat et logement</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#BAE6FD] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)]">
              <h3 className="grad-head-5 px-5 py-2.5 text-sm font-bold uppercase tracking-widest">Climat</h3>
              <div className="grid grid-cols-3 gap-4 p-5 text-center text-sm">
                <div />
                <div className="font-semibold text-[#4338CA]">{seedA.name}</div>
                <div className="font-semibold text-[#BE185D]">{seedB.name}</div>
                {[
                  { label: "Soleil / an", a: seedA.sunshinedays ? `${Math.round(seedA.sunshinedays / 9.5)} j` : "—", b: seedB.sunshinedays ? `${Math.round(seedB.sunshinedays / 9.5)} j` : "—" },
                  { label: "Juillet", a: seedA.avgTempJuly ? `${seedA.avgTempJuly}°C` : "—", b: seedB.avgTempJuly ? `${seedB.avgTempJuly}°C` : "—" },
                  { label: "Janvier", a: seedA.avgTempJanuary ? `${seedA.avgTempJanuary}°C` : "—", b: seedB.avgTempJanuary ? `${seedB.avgTempJanuary}°C` : "—" },
                ].map(({ label, a, b }) => (
                  <React.Fragment key={label}>
                    <div className="text-xs text-[var(--text-secondary)] text-left">{label}</div>
                    <div className="font-mono-data font-bold text-[var(--text-primary)]">{a}</div>
                    <div className="font-mono-data font-bold text-[var(--text-primary)]">{b}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Housing prices */}
            {(getHousing(slugA) || getHousing(slugB)) && (
              <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#BAE6FD] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)]">
                <h3 className="grad-head-0 px-5 py-2.5 text-sm font-bold uppercase tracking-widest">Immobilier & Loyers</h3>
                <div className="grid grid-cols-3 gap-4 p-5 pb-0 text-center text-sm">
                  <div />
                  <div className="font-semibold text-[#4338CA]">{seedA.name}</div>
                  <div className="font-semibold text-[#BE185D]">{seedB.name}</div>
                  {[
                    { label: "Loyer T1 / mois", a: getHousing(slugA)?.avgRentT1, b: getHousing(slugB)?.avgRentT1, unit: "€" },
                    { label: "Loyer T2 / mois", a: getHousing(slugA)?.avgRentT2, b: getHousing(slugB)?.avgRentT2, unit: "€" },
                    { label: "Loyer T3 / mois", a: getHousing(slugA)?.avgRentT3, b: getHousing(slugB)?.avgRentT3, unit: "€" },
                    { label: "Prix achat / m²", a: getHousing(slugA)?.avgBuyPriceM2, b: getHousing(slugB)?.avgBuyPriceM2, unit: "€/m²" },
                  ].map(({ label, a, b, unit }) => {
                    const cheaper = a && b ? (a < b ? "a" : b < a ? "b" : "equal") : null;
                    return (
                      <React.Fragment key={label}>
                        <div className="text-xs text-[var(--text-secondary)] text-left">{label}</div>
                        <div className={`font-mono-data font-bold ${cheaper === "a" ? "text-emerald-700" : "text-[var(--text-primary)]"}`}>
                          {a ? `${a.toLocaleString("fr-FR")} ${unit}` : "—"}
                        </div>
                        <div className={`font-mono-data font-bold ${cheaper === "b" ? "text-emerald-700" : "text-[var(--text-primary)]"}`}>
                          {b ? `${b.toLocaleString("fr-FR")} ${unit}` : "—"}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--text-tertiary)] p-5">
                  Prix médians indicatifs (source : DVF / données marché 2024). La couleur verte indique la ville la moins chère.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pour qui ? */}
      <section className="band band-pink py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <EmojiBadge emoji="🧭" tone="pink" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Pour quel profil choisir chaque ville ?</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {PROFILES.map(({ label, emoji, keys, desc }) => {
              const scoreA = keys.reduce((s, k) => s + seedA.scores[k], 0) / keys.length;
              const scoreB = keys.reduce((s, k) => s + seedB.scores[k], 0) / keys.length;
              const diff = Math.abs(scoreA - scoreB);
              const profileWinner = scoreA > scoreB ? seedA : scoreB > scoreA ? seedB : null;
              return (
                <div key={label} className="rounded-2xl bg-white ring-1 ring-[#FBCFE8] shadow-[0_14px_34px_-24px_rgba(219,39,119,0.55)] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg" aria-hidden>{emoji}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-3">{desc}</p>
                  {profileWinner ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${profileWinner === seedA ? "bg-[#E0E7FF] text-[#4338CA]" : "bg-[#FCE7F3] text-[#BE185D]"}`}>{profileWinner.name}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">+{diff.toFixed(1)} pts</span>
                    </div>
                  ) : (
                    <span className="rounded-full bg-[#F1F0FF] px-2.5 py-0.5 text-sm text-[#4338CA]">Égalité</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="band band-bold py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-4">
          <p className="text-lg sm:text-xl font-semibold">
            Vous hésitez encore ? Notre IA peut analyser votre profil exact.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/city-match"
              className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#4338CA] shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              ✨ Quiz de matching IA
            </Link>
            <Link
              href="/comparer"
              className="inline-flex items-center rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/50 hover:bg-white/25 hover:-translate-y-0.5 transition-all"
            >
              Comparateur libre
            </Link>
          </div>
        </div>
      </section>

      {/* Related comparisons */}
      <section className="band band-lilac py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <EmojiBadge emoji="🔁" tone="lilac" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Comparaisons similaires</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {SEO_PAIRS.filter(([a, b]) =>
              (a === slugA || b === slugA || a === slugB || b === slugB) &&
              !(a === slugA && b === slugB) && !(a === slugB && b === slugA)
            ).slice(0, 10).map(([a, b]) => {
              const ca = CITIES_SEED.find((c) => c.slug === a);
              const cb = CITIES_SEED.find((c) => c.slug === b);
              if (!ca || !cb) return null;
              return (
                <Link
                  key={`${a}-vs-${b}`}
                  href={`/comparer/${a}-vs-${b}`}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#4338CA] ring-1 ring-[#DDD6FE] hover:ring-[#4F46E5] hover:-translate-y-0.5 transition-all"
                >
                  {ca.name} <span className="text-[#BE185D]">vs</span> {cb.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="band band-white py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-8">
          <CommentSection
            topic={`compare:${[slugA, slugB].sort().join("-")}`}
            title={`${seedA.name} vs ${seedB.name} — votre verdict`}
            emptyHint={`Vous avez vécu dans l'une ou l'autre ? Donnez votre avis honnête : on n'a pas tout dit.`}
            subscribeContext={`${seedA.name} / ${seedB.name}`}
          />
          <FeedbackWidget />
        </div>
      </section>

      <Footer />
    </main>
  );
}
