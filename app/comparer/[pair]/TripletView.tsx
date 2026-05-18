// 3-city comparison view. Renders when the [pair] slug parses into 3 cities
// instead of 2 (e.g. /comparer/lyon-vs-bordeaux-vs-toulouse).
//
// Pair view in page.tsx is untouched — this file is only loaded for triplets.

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CommentSection } from "@/components/CommentSection";
import { CityCard } from "@/components/CityCard";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { SEO_PAIRS } from "@/lib/comparer-pairs";
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

const CITY_COLORS = ["#0ea5e9", "#a78bfa", "#f97316"] as const;

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
                  { "@type": "ListItem", position: 1, name: "MeilleurVille", item: BASE_URL },
                  { "@type": "ListItem", position: 2, name: "Comparer", item: `${BASE_URL}/comparer` },
                  { "@type": "ListItem", position: 3, name: `${a.name} vs ${b.name} vs ${c.name}`, item: `${BASE_URL}/comparer/${slug}` },
                ],
              },
              {
                "@type": "ItemList",
                name: `${a.name} vs ${b.name} vs ${c.name} — Comparaison`,
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
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Comparaison 3 villes · 2026</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            {a.name}{" "}
            <span className="text-[var(--text-secondary)]">vs</span>{" "}
            {b.name}{" "}
            <span className="text-[var(--text-secondary)]">vs</span>{" "}
            {c.name}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {a.region} · {a.scores.global}/10 &nbsp;·&nbsp; {b.region} · {b.scores.global}/10 &nbsp;·&nbsp; {c.region} · {c.scores.global}/10
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        {/* F69 — Synthèse 8 axes triplet teaser */}
        <Link
          href={`/comparer/${slug}/synthese`}
          className="group flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:border-[var(--accent)] hover:shadow-md transition-all px-5 py-4"
        >
          <span className="text-2xl shrink-0">✨</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              Synthèse 8 axes — {a.name} vs {b.name} vs {c.name}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Profil unifié sur env / santé / emploi / cadre / vélo / sécurité /
              démo / services publics. Gagnant par axe (seuil ±0,3 pt).
            </p>
          </div>
          <span className="text-sm text-[var(--accent)] font-medium shrink-0">Voir →</span>
        </Link>

        {/* City cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cityCards.map((cc) => (
            <CityCard key={cc.slug} city={cc} />
          ))}
        </div>

        {/* Verdict */}
        {overallWinner && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-1">Recommandé par MeilleurVille</p>
            <p className="text-xl font-bold text-emerald-600">
              {overallWinner.name} l&apos;emporte sur {overallWinner.wins} critères sur {SCORE_ROWS.length}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Comparatif basé sur 9 critères pondérés équitablement
            </p>
          </div>
        )}

        {/* Radar — 3 polygons */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
            Profils comparés
          </h2>
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
        </Card>

        {/* Side-by-side table */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-6">
            Comparaison critère par critère
          </h2>
          <div className="grid grid-cols-[1fr_repeat(3,minmax(0,1fr))] gap-2 text-sm">
            <div />
            {cities.map((city, i) => (
              <div key={city.slug} className="text-center font-semibold" style={{ color: CITY_COLORS[i] }}>
                {city.name}
              </div>
            ))}
            {SCORE_ROWS.map(({ key, label }) => {
              const w = winnerSlug(cities, key);
              return (
                <React.Fragment key={key}>
                  <div className="text-xs text-[var(--text-secondary)] py-2">{label}</div>
                  {cities.map((city) => {
                    const value = city.scores[key];
                    const isWinner = city.slug === w;
                    return (
                      <div
                        key={city.slug}
                        className={`text-center py-2 font-mono-data font-bold ${
                          isWinner ? scoreColor(value) : "text-[var(--text-secondary)]"
                        }`}
                      >
                        {value.toFixed(1)}
                        {isWinner && <span className="ml-1 text-[10px] uppercase tracking-wider text-emerald-600">·top</span>}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </Card>

        {/* Climate */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Climat</h2>
          <div className="grid grid-cols-[1fr_repeat(3,minmax(0,1fr))] gap-3 text-center text-sm">
            <div />
            {cities.map((city, i) => (
              <div key={city.slug} className="font-semibold" style={{ color: CITY_COLORS[i] }}>
                {city.name}
              </div>
            ))}
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
            ].map(({ label, values }) => (
              <React.Fragment key={label}>
                <div className="text-xs text-[var(--text-secondary)] text-left">{label}</div>
                {values.map((v, i) => (
                  <div key={i} className="font-mono-data font-bold text-[var(--text-primary)]">
                    {v}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* Housing */}
        {cities.some((city) => getHousing(city.slug)) && (
          <Card>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Immobilier & Loyers</h2>
            <div className="grid grid-cols-[1fr_repeat(3,minmax(0,1fr))] gap-3 text-center text-sm">
              <div />
              {cities.map((city, i) => (
                <div key={city.slug} className="font-semibold" style={{ color: CITY_COLORS[i] }}>
                  {city.name}
                </div>
              ))}
              {(
                [
                  ["Loyer T1 / mois", "avgRentT1", "€"],
                  ["Loyer T2 / mois", "avgRentT2", "€"],
                  ["Loyer T3 / mois", "avgRentT3", "€"],
                  ["Prix achat / m²", "avgBuyPriceM2", "€/m²"],
                ] as const
              ).map(([label, field, unit]) => {
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
                  <React.Fragment key={label}>
                    <div className="text-xs text-[var(--text-secondary)] text-left">{label}</div>
                    {values.map((v, i) => {
                      const isCheapest = cities[i].slug === cheapest;
                      return (
                        <div
                          key={i}
                          className={`font-mono-data font-bold ${
                            isCheapest ? "text-emerald-600" : "text-[var(--text-primary)]"
                          }`}
                        >
                          {v != null ? `${v.toLocaleString("fr-FR")} ${unit}` : "—"}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-4">
              Prix médians indicatifs (source : DVF / données marché 2024). La couleur verte indique la ville la moins chère.
            </p>
          </Card>
        )}

        {/* Per-profile recommendation */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">
            Pour quel profil choisir quelle ville ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROFILES.map(({ label, emoji, keys, desc }) => {
              const cityScores = cities.map((city) => ({
                slug: city.slug,
                name: city.name,
                score: keys.reduce((s, k) => s + city.scores[k], 0) / keys.length,
              }));
              const max = Math.max(...cityScores.map((c) => c.score));
              const winners = cityScores.filter((c) => c.score === max);
              const profileWinner = winners.length === 1 ? winners[0] : null;
              return (
                <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-3">{desc}</p>
                  {profileWinner ? (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-emerald-600">{profileWinner.name}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)]">
                        Score profil : {profileWinner.score.toFixed(1)}/10
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--text-tertiary)]">Égalité serrée</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-3">
          <p className="text-[var(--text-secondary)]">
            Vous hésitez encore ? Notre quiz peut affiner par profil personnel.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/quiz">
              <Badge variant="accent" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity">
                ✨ Quiz de matching
              </Badge>
            </Link>
            <Link href="/comparer">
              <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity">
                Comparateur libre
              </Badge>
            </Link>
          </div>
        </div>

        {/* Related: pair comparisons among the 3 cities */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Voir aussi en 2 villes
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              [a, b],
              [a, c],
              [b, c],
            ].map(([x, y]) => {
              const pairSlug = SEO_PAIRS.find(
                ([s1, s2]) =>
                  (s1 === x.slug && s2 === y.slug) || (s1 === y.slug && s2 === x.slug),
              );
              const href = pairSlug ? `/comparer/${pairSlug[0]}-vs-${pairSlug[1]}` : `/comparer/${x.slug}-vs-${y.slug}`;
              return (
                <Link
                  key={`${x.slug}-${y.slug}`}
                  href={href}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
                >
                  {x.name} vs {y.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Other triplets */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Autres comparaisons à 3 villes
          </h2>
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
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
                  >
                    {nx.name} vs {ny.name} vs {nz.name}
                  </Link>
                );
              })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <CommentSection
          topic={`compare:${[a.slug, b.slug, c.slug].sort().join("-")}`}
          title={`${a.name} vs ${b.name} vs ${c.name} — votre verdict`}
          emptyHint={`Vous avez vécu dans l'une de ces trois ? On veut le retour terrain.`}
        />
      </div>
    </main>
  );
}
