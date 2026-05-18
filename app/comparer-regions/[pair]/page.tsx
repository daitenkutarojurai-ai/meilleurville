import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { CITIES_COUNT } from "@/lib/site-stats";
import { HOUSING } from "@/data/housing";
import {
  METRO_REGIONS,
  REGION_EMOJIS,
  REGION_TAGLINES,
  regionToSlug,
  slugToRegion,
} from "@/lib/regions";
import { scoreColor, scoreHex } from "@/lib/utils";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ pair: string }> };

const PRIORITY_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["Bretagne", "Occitanie"],
  ["Bretagne", "Normandie"],
  ["Provence-Alpes-Côte d'Azur", "Nouvelle-Aquitaine"],
  ["Île-de-France", "Auvergne-Rhône-Alpes"],
];

// Editorial intros for the 4 priority pairs. Keys are the slug `${a}-vs-${b}`
// computed exactly like the URL — order matters and follows METRO_REGIONS order
// to keep canonical.
const PRIORITY_INTROS: Record<string, string> = {
  "bretagne-vs-occitanie":
    "Deux régions diamétralement opposées dans le top des relocations 2024. La Bretagne mise sur la côte sauvage, une scène tech à Rennes et un coût de vie qui reste sous la moyenne nationale. L'Occitanie offre du soleil quasi méditerranéen (Montpellier et Toulouse comptent parmi les villes les plus ensoleillées de France métropolitaine) et une dynamique étudiante intense — mais avec des étés qui deviennent réellement chauds. À comparer concrètement.",
  "bretagne-vs-normandie":
    "L'arbitrage classique entre les deux régions atlantiques nord-ouest. La Bretagne joue la carte identitaire forte, le cluster tech rennais et un littoral découpé. La Normandie joue la proximité Paris (Rouen à 1h20, Caen accessible), un patrimoine historique unique et un immobilier souvent encore plus abordable. Les climats se ressemblent — mais la Bretagne reste plus humide à l'ouest.",
  "provence-alpes-cote-d-azur-vs-nouvelle-aquitaine":
    "Sud-est versus sud-ouest. PACA capitalise sur la Méditerranée, l'art de vivre azuréen et un marché du luxe assumé, avec un coût de la vie en conséquence. La Nouvelle-Aquitaine combine Bordeaux dynamique, le Pays Basque premium et le Périgord rural — plus diverse, mais l'attractivité a fait grimper les prix de Bordeaux et de la côte basque depuis 5 ans.",
  "ile-de-france-vs-auvergne-rhone-alpes":
    "Paris et son écosystème versus Lyon et l'arc alpin. L'Île-de-France domine encore largement en emploi qualifié et accès culturel, au prix d'un logement qui phagocyte tout. Auvergne-Rhône-Alpes propose Lyon (2e ville française), Grenoble (tech / recherche), Annecy (lac + qualité de vie premium) et un arrière-pays alpin accessible. Pour ceux qui veulent quitter Paris sans perdre l'urbanité.",
};

export function generateStaticParams() {
  const params: Array<{ pair: string }> = [];
  for (let i = 0; i < METRO_REGIONS.length; i++) {
    for (let j = i + 1; j < METRO_REGIONS.length; j++) {
      params.push({
        pair: `${regionToSlug(METRO_REGIONS[i])}-vs-${regionToSlug(METRO_REGIONS[j])}`,
      });
    }
  }
  return params; // 78 = C(13, 2)
}

function parsePair(pair: string): { a: string; b: string } | null {
  // We can't naively split on "-vs-" because region slugs themselves contain
  // hyphens. Instead, scan: try each METRO_REGIONS slug as the prefix.
  for (const region of METRO_REGIONS) {
    const slug = regionToSlug(region);
    if (pair.startsWith(`${slug}-vs-`)) {
      const rest = pair.slice(slug.length + 4); // strip "<slug>-vs-"
      const b = slugToRegion(rest);
      if (b) return { a: region, b };
    }
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const { a, b } = parsed;
  return {
    title: `${a} vs ${b} — Comparatif régions 2026 | MeilleurVille`,
    description: `Comparaison complète entre ${a} et ${b} : coût de la vie, climat, immobilier, scores qualité de vie, meilleures villes. Données calibrées sur les ${CITIES_COUNT} villes du site.`,
    alternates: { canonical: `/comparer-regions/${pair}` },
    openGraph: {
      title: `${a} vs ${b} — Quelle région choisir ?`,
      description: `Comparatif côté coût, climat, immobilier, scores. Verdict par profil.`,
    },
  };
}

function statsForRegion(region: string) {
  const cities = CITIES_SEED.filter((c) => c.region === region);
  if (cities.length === 0) {
    return null;
  }
  const n = cities.length;
  const avg = (key: keyof (typeof CITIES_SEED)[number]["scores"]) =>
    cities.reduce((s, c) => s + c.scores[key], 0) / n;

  const sunshines = cities.map((c) => c.sunshinedays).filter((v): v is number => v != null);
  const julyTemps = cities.map((c) => c.avgTempJuly).filter((v): v is number => v != null);
  const janTemps = cities.map((c) => c.avgTempJanuary).filter((v): v is number => v != null);

  // Housing averaged over the cities that have HOUSING data
  const housing = cities
    .map((c) => HOUSING[c.slug])
    .filter((h): h is NonNullable<typeof h> => h != null);
  const avgHousing = (field: "avgRentT2" | "avgBuyPriceM2") => {
    const values = housing.map((h) => h[field]).filter((v): v is number => v != null);
    if (values.length === 0) return null;
    return values.reduce((s, v) => s + v, 0) / values.length;
  };

  const topCities = [...cities].sort((a, b) => b.scores.global - a.scores.global).slice(0, 5);

  return {
    n,
    scores: {
      global: avg("global"),
      life: avg("life"),
      transport: avg("transport"),
      nature: avg("nature"),
      cost: avg("cost"),
      safety: avg("safety"),
      culture: avg("culture"),
      remoteWork: avg("remoteWork"),
      schools: avg("schools"),
    },
    sunshineAvg: sunshines.length ? sunshines.reduce((s, v) => s + v, 0) / sunshines.length : null,
    julyAvg: julyTemps.length ? julyTemps.reduce((s, v) => s + v, 0) / julyTemps.length : null,
    janAvg: janTemps.length ? janTemps.reduce((s, v) => s + v, 0) / janTemps.length : null,
    avgRentT2: avgHousing("avgRentT2"),
    avgBuyPriceM2: avgHousing("avgBuyPriceM2"),
    topCities,
  };
}

const SCORE_ROWS = [
  { key: "global", label: "Score global" },
  { key: "life", label: "Qualité de vie" },
  { key: "transport", label: "Transport" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Coût de la vie" },
  { key: "safety", label: "Sécurité" },
  { key: "culture", label: "Culture" },
  { key: "remoteWork", label: "Télétravail" },
  { key: "schools", label: "Écoles" },
] as const;

export default async function ComparerRegionsPage({ params }: Props) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const { a, b } = parsed;

  const statsA = statsForRegion(a);
  const statsB = statsForRegion(b);
  if (!statsA || !statsB) notFound();

  const intro = PRIORITY_INTROS[pair];

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

  const winsA = SCORE_ROWS.filter(({ key }) => statsA.scores[key] > statsB.scores[key]).length;
  const winsB = SCORE_ROWS.filter(({ key }) => statsB.scores[key] > statsA.scores[key]).length;
  const overallWinner = winsA > winsB ? a : winsB > winsA ? b : null;

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

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
                  { "@type": "ListItem", position: 2, name: "Comparer régions", item: `${BASE_URL}/comparer-regions` },
                  { "@type": "ListItem", position: 3, name: `${a} vs ${b}`, item: `${BASE_URL}/comparer-regions/${pair}` },
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: `${a} ou ${b} : quelle région a le meilleur coût de la vie ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Score coût moyen — ${a} : ${statsA.scores.cost.toFixed(1)}/10, ${b} : ${statsB.scores.cost.toFixed(1)}/10. ${statsA.scores.cost > statsB.scores.cost ? a : b} est plus abordable en moyenne.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `${a} ou ${b} : laquelle a le meilleur climat ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Ensoleillement moyen — ${a} : ${statsA.sunshineAvg ? Math.round(statsA.sunshineAvg) : "—"} h/an, ${b} : ${statsB.sunshineAvg ? Math.round(statsB.sunshineAvg) : "—"} h/an.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `Quelle est la meilleure ville de ${a} ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `${statsA.topCities[0].name} avec un score global de ${statsA.topCities[0].scores.global.toFixed(1)}/10.`,
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
          <Badge variant="accent" className="mb-3">Comparatif régions · 2026</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            <span aria-hidden className="mr-2">
              {REGION_EMOJIS[a] ?? "📍"}
            </span>
            {a}{" "}
            <span className="text-[var(--text-secondary)]">vs</span>{" "}
            <span aria-hidden className="mr-2">
              {REGION_EMOJIS[b] ?? "📍"}
            </span>
            {b}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {statsA.n} villes en {a} · score moyen {statsA.scores.global.toFixed(1)}/10
            &nbsp;·&nbsp;
            {statsB.n} villes en {b} · score moyen {statsB.scores.global.toFixed(1)}/10
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        {intro && (
          <Card>
            <p className="text-[var(--text-secondary)] leading-relaxed">{intro}</p>
          </Card>
        )}

        {/* F67 — Synthèse régionale 8 axes teaser */}
        <Link
          href={`/comparer-regions/${pair}/synthese`}
          className="group flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:border-[var(--accent)] hover:shadow-md transition-all px-5 py-4"
        >
          <span className="text-2xl shrink-0">✨</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              Synthèse régionale 8 axes — {a} vs {b}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Profil moyen agrégé sur env / santé / emploi / cadre / vélo / sécurité /
              démo / services publics. Verdict axe par axe.
            </p>
          </div>
          <span className="text-sm text-[var(--accent)] font-medium shrink-0">Voir →</span>
        </Link>

        {overallWinner && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-1">Vue d&apos;ensemble — scores moyens</p>
            <p className="text-xl font-bold text-emerald-600">
              {overallWinner} l&apos;emporte sur {Math.max(winsA, winsB)} critères sur {SCORE_ROWS.length}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Moyennes calculées sur l&apos;ensemble des villes profilées par région.
            </p>
          </div>
        )}

        {/* Side-by-side score comparison */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-6">
            Scores moyens par critère
          </h2>
          <div className="space-y-5">
            {SCORE_ROWS.map(({ key, label }) => {
              const va = statsA.scores[key];
              const vb = statsB.scores[key];
              const diff = va - vb;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
                    <span className={diff > 0 ? "font-bold text-emerald-600" : ""}>{a}</span>
                    <span className="font-medium text-[var(--text-primary)]">{label}</span>
                    <span className={diff < 0 ? "font-bold text-emerald-600" : ""}>{b}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 text-right text-sm font-bold font-mono-data ${diff > 0 ? scoreColor(va) : "text-[var(--text-secondary)]"}`}>
                      {va.toFixed(1)}
                    </span>
                    <div className="flex-1 flex gap-1">
                      <div className="flex-1 flex justify-end">
                        <div
                          className="h-2 rounded-l-full"
                          style={{ width: `${(va / 10) * 100}%`, background: diff > 0 ? scoreHex(va) : `${scoreHex(va)}44` }}
                        />
                      </div>
                      <div className="w-px bg-[var(--border)]" />
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
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Climat moyen</h2>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div />
            <div className="font-semibold text-blue-600">{a}</div>
            <div className="font-semibold text-violet-400">{b}</div>
            {[
              { label: "Soleil / an", a: statsA.sunshineAvg, b: statsB.sunshineAvg, unit: " h" },
              { label: "Juillet moyen", a: statsA.julyAvg, b: statsB.julyAvg, unit: " °C" },
              { label: "Janvier moyen", a: statsA.janAvg, b: statsB.janAvg, unit: " °C" },
            ].map((row) => (
              <React.Fragment key={row.label}>
                <div className="text-xs text-[var(--text-secondary)] text-left">{row.label}</div>
                <div className="font-mono-data font-bold text-[var(--text-primary)]">
                  {row.a != null ? `${Math.round(row.a * 10) / 10}${row.unit}` : "—"}
                </div>
                <div className="font-mono-data font-bold text-[var(--text-primary)]">
                  {row.b != null ? `${Math.round(row.b * 10) / 10}${row.unit}` : "—"}
                </div>
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* Housing */}
        {(statsA.avgRentT2 || statsB.avgRentT2 || statsA.avgBuyPriceM2 || statsB.avgBuyPriceM2) && (
          <Card>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
              Immobilier moyen
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div />
              <div className="font-semibold text-blue-600">{a}</div>
              <div className="font-semibold text-violet-400">{b}</div>
              {[
                { label: "Loyer T2 médian", a: statsA.avgRentT2, b: statsB.avgRentT2, unit: " €/mois" },
                { label: "Prix achat / m²", a: statsA.avgBuyPriceM2, b: statsB.avgBuyPriceM2, unit: " €/m²" },
              ].map((row) => {
                const cheaper = row.a != null && row.b != null ? (row.a < row.b ? "a" : row.b < row.a ? "b" : "equal") : null;
                return (
                  <React.Fragment key={row.label}>
                    <div className="text-xs text-[var(--text-secondary)] text-left">{row.label}</div>
                    <div className={`font-mono-data font-bold ${cheaper === "a" ? "text-emerald-600" : "text-[var(--text-primary)]"}`}>
                      {row.a != null ? `${Math.round(row.a).toLocaleString("fr-FR")}${row.unit}` : "—"}
                    </div>
                    <div className={`font-mono-data font-bold ${cheaper === "b" ? "text-emerald-600" : "text-[var(--text-primary)]"}`}>
                      {row.b != null ? `${Math.round(row.b).toLocaleString("fr-FR")}${row.unit}` : "—"}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-4">
              Moyennes calculées sur les villes profilées avec données loyer / prix (DVF + observatoires).
            </p>
          </Card>
        )}

        {/* Top cities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { region: a, stats: statsA, tagline: REGION_TAGLINES[a] },
            { region: b, stats: statsB, tagline: REGION_TAGLINES[b] },
          ].map(({ region, stats, tagline }) => (
            <Card key={region}>
              <div className="mb-3">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  {REGION_EMOJIS[region] ?? "📍"} Top 5 — {region}
                </h2>
                {tagline && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{tagline}</p>
                )}
              </div>
              <ol className="space-y-2">
                {stats.topCities.map((city, i) => (
                  <li key={city.slug}>
                    <Link
                      href={`/villes/${city.slug}`}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm hover:border-[var(--accent)]/40"
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-mono-data text-xs text-[var(--text-tertiary)]">
                          {i + 1}.
                        </span>
                        <span className="font-medium text-[var(--text-primary)]">{city.name}</span>
                      </span>
                      <span className={`font-mono-data font-bold ${scoreColor(city.scores.global)}`}>
                        {city.scores.global.toFixed(1)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center space-y-3">
          <p className="text-[var(--text-secondary)]">
            La région donne le décor — c&apos;est la ville qui fait le quotidien.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={`/regions/${regionToSlug(a)}`}>
              <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90">
                Toutes les villes de {a}
              </Badge>
            </Link>
            <Link href={`/regions/${regionToSlug(b)}`}>
              <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90">
                Toutes les villes de {b}
              </Badge>
            </Link>
            <Link href="/quiz">
              <Badge variant="accent" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90">
                ✨ Quiz de matching
              </Badge>
            </Link>
          </div>
        </div>

        {/* Related */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Autres comparatifs régions
          </h2>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_PAIRS.filter(([x, y]) => {
              const slug = `${regionToSlug(x)}-vs-${regionToSlug(y)}`;
              return slug !== pair;
            }).map(([x, y]) => (
              <Link
                key={`${x}-${y}`}
                href={`/comparer-regions/${regionToSlug(x)}-vs-${regionToSlug(y)}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                {x} vs {y}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
