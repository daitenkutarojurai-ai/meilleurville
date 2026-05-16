import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CommentSection } from "@/components/CommentSection";
import { CITIES_SEED } from "@/data/cities-seed";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { City } from "@/lib/types";
import Link from "next/link";
import { getHousing } from "@/data/housing";
import { scoreColor, scoreHex } from "@/lib/utils";
import React from "react";
import { TripletView } from "./TripletView";

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

// Allow any city-vs-city pair beyond the curated SEO_PAIRS list to render on-demand.
// Only SEO_PAIRS are pre-built + sitemap'd, but Lyon-vs-Annecy etc. still resolve.
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parts = pair.split("-vs-");

  if (parts.length === 3) {
    const cities = parts.map((s) => CITIES_SEED.find((c) => c.slug === s));
    if (cities.some((c) => !c)) return {};
    const [a, b, c] = cities as NonNullable<(typeof cities)[number]>[];
    return {
      title: `${a.name} vs ${b.name} vs ${c.name} — Comparaison 3 villes 2026`,
      description: `Comparaison à 3 entre ${a.name} (${a.scores.global}/10), ${b.name} (${b.scores.global}/10) et ${c.name} (${c.scores.global}/10) : coût de vie, sécurité, transport, nature, écoles. Tableau côte à côte + radar.`,
      alternates: { canonical: `/comparer/${pair}` },
      openGraph: {
        title: `${a.name} vs ${b.name} vs ${c.name} — Quelle ville choisir ?`,
        description: `Comparatif complet sur 9 critères avec verdict par profil.`,
      },
    };
  }

  const [slugA, slugB] = parts;
  const a = CITIES_SEED.find((c) => c.slug === slugA);
  const b = CITIES_SEED.find((c) => c.slug === slugB);
  if (!a || !b) return {};

  return {
    title: `${a.name} vs ${b.name} — Comparaison qualité de vie 2026`,
    description: `Comparaison complète entre ${a.name} (${a.scores.global}/10) et ${b.name} (${b.scores.global}/10) : coût de vie, transport, nature, sécurité, écoles. Laquelle choisir ?`,
    alternates: { canonical: `/comparer/${pair}` },
    openGraph: {
      title: `${a.name} vs ${b.name} — Quelle ville choisir ?`,
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
                  { "@type": "ListItem", position: 1, name: "MeilleurVille", item: process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr" },
                  { "@type": "ListItem", position: 2, name: "Comparer", item: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr"}/comparer` },
                  { "@type": "ListItem", position: 3, name: `${seedA.name} vs ${seedB.name}`, item: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr"}/comparer/${pair}` },
                ],
              },
              {
                "@type": "ItemList",
                name: `${seedA.name} vs ${seedB.name} — Comparaison`,
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
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Comparaison 2026</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            {seedA.name}{" "}
            <span className="text-[var(--text-secondary)]">vs</span>{" "}
            {seedB.name}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {seedA.region} · {seedA.scores.global}/10 &nbsp;vs&nbsp; {seedB.region} · {seedB.scores.global}/10
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        {/* Cards */}
        <div className="grid grid-cols-2 gap-4">
          <CityCard city={cityA} />
          <CityCard city={cityB} />
        </div>

        {/* Winner verdict */}
        {winner && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-1">Recommandé par MeilleurVille</p>
            <p className="text-xl font-bold text-emerald-600">
              {winner.name} l&apos;emporte sur {SCORE_ROWS.length - Math.min(winsA, winsB)} critères
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Résultat basé sur 9 critères pondérés équitablement
            </p>
          </div>
        )}

        {/* Head-to-head table */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-6">
            Comparaison critère par critère
          </h2>
          <div className="space-y-5">
            {SCORE_ROWS.map(({ key, label }) => {
              const va = seedA.scores[key];
              const vb = seedB.scores[key];
              const diff = va - vb;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
                    <span className={diff > 0 ? "font-bold text-emerald-600" : ""}>{seedA.name}</span>
                    <span className="font-medium text-[var(--text-primary)]">{label}</span>
                    <span className={diff < 0 ? "font-bold text-emerald-600" : ""}>{seedB.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 text-right text-sm font-bold font-mono-data ${diff > 0 ? scoreColor(va) : "text-[var(--text-secondary)]"}`}>
                      {va.toFixed(1)}
                    </span>
                    <div className="flex-1 flex gap-1">
                      {/* A bar — right-aligned */}
                      <div className="flex-1 flex justify-end">
                        <div
                          className="h-2 rounded-l-full"
                          style={{ width: `${(va / 10) * 100}%`, background: diff > 0 ? scoreHex(va) : `${scoreHex(va)}44` }}
                        />
                      </div>
                      <div className="w-px bg-[var(--border)]" />
                      {/* B bar — left-aligned */}
                      <div className="flex-1">
                        <div
                          className="h-2 rounded-r-full"
                          style={{ width: `${(vb / 10) * 100}%`, background: diff < 0 ? scoreHex(vb) : `${scoreHex(vb)}44` }}
                        />
                      </div>
                    </div>
                    <span className={`w-8 text-sm font-bold font-mono-data ${diff < 0 ? scoreColor(vb) : "text-[var(--text-secondary)]"}`}>
                      {vb.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Climate */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Climat</h2>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div />
            <div className="font-semibold text-blue-600">{seedA.name}</div>
            <div className="font-semibold text-violet-400">{seedB.name}</div>
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
        </Card>

        {/* Housing prices */}
        {(getHousing(slugA) || getHousing(slugB)) && (
          <Card>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Immobilier & Loyers</h2>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div />
              <div className="font-semibold text-blue-600">{seedA.name}</div>
              <div className="font-semibold text-violet-400">{seedB.name}</div>
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
                    <div className={`font-mono-data font-bold ${cheaper === "a" ? "text-emerald-600" : "text-[var(--text-primary)]"}`}>
                      {a ? `${a.toLocaleString("fr-FR")} ${unit}` : "—"}
                    </div>
                    <div className={`font-mono-data font-bold ${cheaper === "b" ? "text-emerald-600" : "text-[var(--text-primary)]"}`}>
                      {b ? `${b.toLocaleString("fr-FR")} ${unit}` : "—"}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-4">
              Prix médians indicatifs (source : DVF / données marché 2024). La couleur verte indique la ville la moins chère.
            </p>
          </Card>
        )}

        {/* Pour qui ? */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">
            Pour quel profil choisir chaque ville ?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PROFILES.map(({ label, emoji, keys, desc }) => {
              const scoreA = keys.reduce((s, k) => s + seedA.scores[k], 0) / keys.length;
              const scoreB = keys.reduce((s, k) => s + seedB.scores[k], 0) / keys.length;
              const diff = Math.abs(scoreA - scoreB);
              const profileWinner = scoreA > scoreB ? seedA : scoreB > scoreA ? seedB : null;
              return (
                <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">{desc}</p>
                  {profileWinner ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-emerald-600">{profileWinner.name}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">+{diff.toFixed(1)} pts</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--text-tertiary)]">Égalité</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-3">
          <p className="text-[var(--text-secondary)]">
            Vous hésitez encore ? Notre IA peut analyser votre profil exact.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/quiz">
              <Badge variant="accent" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity">
                ✨ Quiz de matching IA
              </Badge>
            </Link>
            <Link href="/comparer">
              <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity">
                Comparateur libre
              </Badge>
            </Link>
          </div>
        </div>

        {/* Related comparisons */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Comparaisons similaires
          </h2>
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
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
                >
                  {ca.name} vs {cb.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <CommentSection
          topic={`compare:${[slugA, slugB].sort().join("-")}`}
          title={`${seedA.name} vs ${seedB.name} — votre verdict`}
          emptyHint={`Vous avez vécu dans l'une ou l'autre ? Donnez votre avis honnête : on n'a pas tout dit.`}
        />
      </div>

      <Footer />
    </main>
  );
}

