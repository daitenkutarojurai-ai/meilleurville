// 3-city comparison view. Renders when the [pair] slug parses into 3 cities
// instead of 2 (e.g. /comparer/lyon-vs-bordeaux-vs-toulouse).
//
// Pair view in page.tsx is untouched — this file is only loaded for triplets.

import React from "react";
import Link from "@/components/AppLink";
import { EmojiBadge } from "@/components/EmojiBadge";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { CommentSection } from "@/components/CommentSection";
import { CityCard } from "@/components/CityCard";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { comparePairSlug } from "@/lib/comparer-pairs";
import { SEO_TRIPLETS } from "@/lib/comparer-triplets";
import { scoreColor } from "@/lib/utils";
import type { City } from "@/lib/types";
import { TripletRadar } from "./TripletRadar";

type SeedCity = (typeof CITIES_SEED)[number];

const SCORE_ROWS: Array<{ key: keyof SeedCity["scores"]; label: string }> = [
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

type ScoreKey = keyof SeedCity["scores"];

const PROFILES: Array<{ label: string; emoji: string; keys: ScoreKey[]; desc: string }> = [
  { label: "Famille", emoji: "👨‍👩‍👧", keys: ["safety", "schools", "nature", "cost"], desc: "sécurité, écoles, espaces verts, budget" },
  { label: "Télétravail", emoji: "💻", keys: ["remoteWork", "transport", "cost", "life"], desc: "fibre, coworking, coût, qualité de vie" },
  { label: "Retraite", emoji: "☀️", keys: ["nature", "safety", "cost", "life"], desc: "nature, sécurité, budget, bien-être" },
  { label: "Étudiant·e", emoji: "🎓", keys: ["culture", "transport", "cost", "schools"], desc: "culture, transports, budget, campus" },
];

// Villes du trio en indigo / rose / cyan : violet et orange sont réservés aux
// paliers de score (CLAUDE.md § Design identity).
const CITY_COLORS = ["#4F46E5", "#DB2777", "#0891B2"] as const;
const COLORS = ["text-[#4338CA]", "text-[#BE185D]", "text-[#0E7490]"] as const;
const PILL = [
  "bg-[#E0E7FF] text-[#4338CA]",
  "bg-[#FCE7F3] text-[#BE185D]",
  "bg-[#CFFAFE] text-[#0E7490]",
] as const;

function seedToCity(s: SeedCity): City {
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

// Per-criterion winner (highest score across the 3 cities). Returns the slug
// of the unique winner, or null on ties.
function winnerSlug(cities: SeedCity[], key: ScoreKey): string | null {
  const values = cities.map((c) => c.scores[key]);
  const max = Math.max(...values);
  const winners = cities.filter((c) => c.scores[key] === max);
  return winners.length === 1 ? winners[0].slug : null;
}

export function TripletView({ cities, slug }: { cities: SeedCity[]; slug: string }) {
  const [a, b, c] = cities;
  const cityCards = cities.map(seedToCity);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

  // Overall winner = the city that wins the most criteria
  const winCounts = cities.map((city) => ({
    slug: city.slug,
    name: city.name,
    wins: SCORE_ROWS.filter(({ key }) => winnerSlug(cities, key) === city.slug).length,
  }));
  const topWins = Math.max(...winCounts.map((w) => w.wins));
  const overallWinners = winCounts.filter((w) => w.wins === topWins);
  const overallWinner = overallWinners.length === 1 ? overallWinners[0] : null;

  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "MaVilleIdéale", item: BASE_URL },
                  { "@type": "ListItem", position: 2, name: "Comparer", item: `${BASE_URL}/comparer` },
                  { "@type": "ListItem", position: 3, name: `${a.name} vs ${b.name} vs ${c.name}`, item: `${BASE_URL}/comparer/${slug}` },
                ],
              },
              {
                "@type": "ItemList",
                name: `${a.name} vs ${b.name} vs ${c.name} · Comparaison`,
                itemListElement: cities.map((city, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: city.name,
                  url: `${BASE_URL}/villes/${city.slug}`,
                })),
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: `Quelle est la meilleure ville entre ${a.name}, ${b.name} et ${c.name} ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: overallWinner
                        ? `${overallWinner.name} l'emporte globalement (${overallWinner.wins} critères sur ${SCORE_ROWS.length}).`
                        : `${a.name}, ${b.name} et ${c.name} sont très proches. Le choix dépend de vos priorités personnelles.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `Coût de la vie : ${a.name}, ${b.name} ou ${c.name} ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: (() => {
                        const w = winnerSlug(cities, "cost");
                        const wc = cities.find((x) => x.slug === w);
                        return wc
                          ? `${wc.name} est la plus abordable (score coût ${wc.scores.cost}/10).`
                          : `Les trois villes sont au même niveau de coût.`;
                      })(),
                    },
                  },
                  {
                    "@type": "Question",
                    name: `Sécurité : ${a.name}, ${b.name} ou ${c.name} ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: (() => {
                        const w = winnerSlug(cities, "safety");
                        const wc = cities.find((x) => x.slug === w);
                        return wc
                          ? `${wc.name} obtient le meilleur score sécurité (${wc.scores.safety}/10).`
                          : `Les trois villes sont au même niveau de sécurité.`;
                      })(),
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
            <Link href="/" className="font-medium text-[#4338CA] hover:text-[#BE185D]">Accueil</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <Link href="/comparer" className="font-medium text-[#4338CA] hover:text-[#BE185D]">Comparer</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <span>{a.name} vs {b.name} vs {c.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <EmojiBadge emoji="🥊" tone="indigo" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Comparaison 3 villes · 2026
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-3">
            <span className="gradient-text-anim pr-1">{a.name}</span>{" "}
            <span className="inline-flex align-middle items-center justify-center rounded-full grad-head-5 px-2 py-0.5 text-xs sm:text-sm font-extrabold">vs</span>{" "}
            <span className="gradient-text-anim pr-1">{b.name}</span>{" "}
            <span className="inline-flex align-middle items-center justify-center rounded-full grad-head-5 px-2 py-0.5 text-xs sm:text-sm font-extrabold">vs</span>{" "}
            <span className="gradient-text-anim pr-1">{c.name}</span>
          </h1>
          <div className="flex flex-wrap gap-2 text-xs">
            {cities.map((city, i) => (
              <span key={city.slug} className={`rounded-full px-3 py-1 font-semibold ${PILL[i]}`}>
                {city.region} · {city.scores.global}/10
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Cartes + synthèse + verdict */}
      <section className="band band-indigo py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
          <Link
            href={`/comparer/${slug}/synthese`}
            className="group flex flex-wrap items-center gap-3 rounded-2xl bg-white ring-1 ring-[#C7D2FE] shadow-[0_14px_34px_-24px_rgba(79,70,229,0.6)] hover:ring-[#4F46E5] hover:-translate-y-0.5 hover:shadow-lg transition-all px-5 py-4"
          >
            <EmojiBadge emoji="✨" tone="pink" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
                Synthèse 8 axes — {a.name} vs {b.name} vs {c.name}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Profil unifié sur env / santé / emploi / cadre / vélo / sécurité /
                démo / services publics. Gagnant par axe (seuil ±0,3 pt).
              </p>
            </div>
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold shrink-0">Voir →</span>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cityCards.map((cc) => (
              <CityCard key={cc.slug} city={cc} />
            ))}
          </div>

          {overallWinner && (
            <div className="rounded-2xl bg-white ring-1 ring-[#C7D2FE] shadow-[0_14px_34px_-24px_rgba(79,70,229,0.6)] overflow-hidden text-center">
              <div className="h-1.5 grad-head-0" aria-hidden />
              <div className="p-6">
                <p className="text-sm text-[var(--text-secondary)] mb-1">Recommandé par MaVilleIdéale</p>
                <p className="text-xl font-bold">
                  <span className="gradient-text">{overallWinner.name}</span>{" "}
                  <span className="text-[var(--text-primary)]">l&apos;emporte sur {overallWinner.wins} critères sur {SCORE_ROWS.length}</span>
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Comparatif basé sur 9 critères pondérés équitablement
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Radar + tableau */}
      <section className="band band-sky py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
          <div className="flex items-center gap-3">
            <EmojiBadge emoji="📊" tone="sky" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Critère par critère</span>
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white ring-1 ring-[#BAE6FD] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)] p-5">
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">Profils comparés</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
                Chaque axe est un critère sur 10. Plus le polygone est large, plus la ville est forte.
              </p>
              <TripletRadar
                cities={cities.map((city, i) => ({
                  slug: city.slug,
                  name: city.name,
                  color: CITY_COLORS[i],
                  scores: SCORE_ROWS.filter((r) => r.key !== "global").map((r) => ({
                    criterion: r.label,
                    value: city.scores[r.key],
                  })),
                }))}
              />
            </div>

            <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-[#BAE6FD] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)]">
              <h3 className="grad-head-5 px-5 py-2.5 text-sm font-bold uppercase tracking-widest">
                Comparaison critère par critère
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EEF2FF] text-[#4338CA]">
                    <th className="text-left p-3 font-semibold"><span className="sr-only">Critère</span></th>
                    {cities.map((city, i) => (
                      <th key={city.slug} className={`text-center p-3 font-semibold ${COLORS[i]}`}>{city.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SCORE_ROWS.map(({ key, label }, ri) => {
                    const w = winnerSlug(cities, key);
                    return (
                      <tr key={key} className={`border-t border-[#E0E7FF] ${ri % 2 ? "bg-[#F8FAFF]" : ""}`}>
                        <td className="p-3 text-xs text-[var(--text-primary)] font-medium">{label}</td>
                        {cities.map((city) => {
                          const value = city.scores[key];
                          const isWinner = city.slug === w;
                          return (
                            <td
                              key={city.slug}
                              className={`p-3 text-center font-mono-data font-bold ${
                                isWinner ? scoreColor(value) : "text-[var(--text-secondary)]"
                              }`}
                            >
                              {value.toFixed(1)}
                              {isWinner && (
                                <span className="ml-1 rounded-full bg-[#E0E7FF] px-1.5 py-0.5 align-middle text-[9px] font-sans uppercase tracking-wider text-[#4338CA]">top</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Profils */}
      <section className="band band-pink py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <EmojiBadge emoji="🧭" tone="pink" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Pour quel profil choisir quelle ville ?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {PROFILES.map(({ label, emoji, keys, desc }) => {
              const cityScores = cities.map((city, i) => ({
                slug: city.slug,
                name: city.name,
                i,
                score: keys.reduce((s, k) => s + city.scores[k], 0) / keys.length,
              }));
              const max = Math.max(...cityScores.map((c) => c.score));
              const winners = cityScores.filter((c) => c.score === max);
              const profileWinner = winners.length === 1 ? winners[0] : null;
              return (
                <div key={label} className="rounded-2xl bg-white ring-1 ring-[#FBCFE8] shadow-[0_14px_34px_-24px_rgba(219,39,119,0.55)] p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span aria-hidden className="text-2xl">{emoji}</span>
                    <h3 className="font-bold text-[var(--text-primary)]">{label}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">{desc}</p>
                  {profileWinner ? (
                    <p className="flex flex-wrap items-center gap-1.5 text-sm">
                      <strong className={`rounded-full px-2.5 py-0.5 ${PILL[profileWinner.i]}`}>{profileWinner.name}</strong>
                      <span className="text-xs text-[var(--text-secondary)]">
                        Score profil : {profileWinner.score.toFixed(1)}/10
                      </span>
                    </p>
                  ) : (
                    <span className="rounded-full bg-[#F1F0FF] px-2.5 py-0.5 text-sm text-[#4338CA]">Égalité serrée</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Climat + logement */}
      <section className="band band-aqua py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
          <div className="flex items-center gap-3">
            <EmojiBadge emoji="🌤️" tone="aqua" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Climat et logement</span>
            </h2>
          </div>
          <div className={`grid gap-6 ${cities.some((city) => getHousing(city.slug)) ? "lg:grid-cols-2" : ""}`}>
            <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-[#A5F3FC] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)]">
              <h3 className="grad-head-5 px-5 py-2.5 text-sm font-bold uppercase tracking-widest">Climat</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EEF2FF] text-[#4338CA]">
                    <th className="text-left p-3 font-semibold"><span className="sr-only">Indicateur</span></th>
                    {cities.map((city, i) => (
                      <th key={city.slug} className={`text-center p-3 font-semibold ${COLORS[i]}`}>{city.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "Soleil / an",
                      values: cities.map((city) => (city.sunshinedays ? `${Math.round(city.sunshinedays / 9.5)} j` : "—")),
                    },
                    {
                      label: "Juillet",
                      values: cities.map((city) => (city.avgTempJuly != null ? `${city.avgTempJuly}°C` : "—")),
                    },
                    {
                      label: "Janvier",
                      values: cities.map((city) => (city.avgTempJanuary != null ? `${city.avgTempJanuary}°C` : "—")),
                    },
                  ].map(({ label, values }, ri) => (
                    <tr key={label} className={`border-t border-[#E0E7FF] ${ri % 2 ? "bg-[#F8FAFF]" : ""}`}>
                      <td className="p-3 text-xs text-[var(--text-primary)] font-medium">{label}</td>
                      {values.map((v, i) => (
                        <td key={i} className="p-3 text-center font-mono-data font-bold text-[var(--text-primary)]">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {cities.some((city) => getHousing(city.slug)) && (
              <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-[#A5F3FC] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)]">
                <h3 className="grad-head-0 px-5 py-2.5 text-sm font-bold uppercase tracking-widest">Immobilier & Loyers</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#EEF2FF] text-[#4338CA]">
                      <th className="text-left p-3 font-semibold"><span className="sr-only">Indicateur</span></th>
                      {cities.map((city, i) => (
                        <th key={city.slug} className={`text-center p-3 font-semibold ${COLORS[i]}`}>{city.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["Loyer T1 / mois", "avgRentT1", "€"],
                        ["Loyer T2 / mois", "avgRentT2", "€"],
                        ["Loyer T3 / mois", "avgRentT3", "€"],
                        ["Prix achat / m²", "avgBuyPriceM2", "€/m²"],
                      ] as const
                    ).map(([label, field, unit], ri) => {
                      const values = cities.map((city) => {
                        const h = getHousing(city.slug);
                        const raw = h?.[field];
                        return typeof raw === "number" ? raw : null;
                      });
                      const cheapest = (() => {
                        const present = values.filter((v): v is number => v != null);
                        if (present.length === 0) return null;
                        const min = Math.min(...present);
                        const winners = values
                          .map((v, i) => (v === min ? cities[i].slug : null))
                          .filter((s): s is string => s != null);
                        return winners.length === 1 ? winners[0] : null;
                      })();
                      return (
                        <tr key={label} className={`border-t border-[#E0E7FF] ${ri % 2 ? "bg-[#F8FAFF]" : ""}`}>
                          <td className="p-3 text-xs text-[var(--text-primary)] font-medium">{label}</td>
                          {values.map((v, i) => {
                            const isCheapest = cities[i].slug === cheapest;
                            return (
                              <td
                                key={i}
                                className={`p-3 text-center font-mono-data font-bold ${
                                  isCheapest ? "text-emerald-700" : "text-[var(--text-primary)]"
                                }`}
                              >
                                {v != null ? `${v.toLocaleString("fr-FR")} ${unit}` : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="text-xs text-[var(--text-secondary)] px-5 py-3 border-t border-[#E0E7FF]">
                  Prix médians indicatifs (source : DVF / données marché 2024). La couleur verte indique la ville la moins chère.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="band band-bold py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-4">
          <p className="text-lg font-semibold text-white">
            Vous hésitez encore ? Notre quiz peut affiner par profil personnel.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/city-match"
              className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#4338CA] shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              ✨ Quiz de matching
            </Link>
            <Link
              href="/comparer"
              className="inline-flex items-center rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/60 hover:bg-white/25 transition-all"
            >
              Comparateur libre
            </Link>
          </div>
        </div>
      </section>

      {/* Renvois */}
      <section className="band band-lilac py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <EmojiBadge emoji="🔁" tone="lilac" size="sm" />
              <h2 className="text-xl sm:text-2xl font-bold">
                <span className="gradient-text">Voir aussi en 2 villes</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                [a, b],
                [a, c],
                [b, c],
              ].map(([x, y]) => {
                const pairSlug = comparePairSlug(x.slug, y.slug);
                if (!pairSlug) return null;
                return (
                  <Link
                    key={`${x.slug}-${y.slug}`}
                    href={`/comparer/${pairSlug}`}
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#4338CA] ring-1 ring-[#DDD6FE] hover:ring-[#4F46E5] hover:-translate-y-0.5 transition-all"
                  >
                    {x.name} <span className="text-[#BE185D]">vs</span> {y.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <EmojiBadge emoji="🥊" tone="indigo" size="sm" />
              <h2 className="text-xl sm:text-2xl font-bold">
                <span className="gradient-text">Autres comparaisons à 3 villes</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {SEO_TRIPLETS.filter(
                ([x, y, z]) => `${x}-vs-${y}-vs-${z}` !== slug,
              )
                .filter(([x, y, z]) =>
                  [x, y, z].some((s) => s === a.slug || s === b.slug || s === c.slug),
                )
                .slice(0, 8)
                .map(([x, y, z]) => {
                  const nx = CITIES_SEED.find((cc) => cc.slug === x);
                  const ny = CITIES_SEED.find((cc) => cc.slug === y);
                  const nz = CITIES_SEED.find((cc) => cc.slug === z);
                  if (!nx || !ny || !nz) return null;
                  return (
                    <Link
                      key={`${x}-${y}-${z}`}
                      href={`/comparer/${x}-vs-${y}-vs-${z}`}
                      className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#4338CA] ring-1 ring-[#DDD6FE] hover:ring-[#4F46E5] hover:-translate-y-0.5 transition-all"
                    >
                      {nx.name} <span className="text-[#BE185D]">vs</span> {ny.name} <span className="text-[#BE185D]">vs</span> {nz.name}
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {/* Commentaires + feedback */}
      <section className="band band-white py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-8">
          <CommentSection
            topic={`compare:${[a.slug, b.slug, c.slug].sort().join("-")}`}
            title={`${a.name} vs ${b.name} vs ${c.name} — votre verdict`}
            emptyHint={`Vous avez vécu dans l'une de ces trois ? On veut le retour terrain.`}
          />
          <FeedbackWidget />
        </div>
      </section>
    </main>
  );
}
