import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { METRO_REGIONS, REGION_EMOJIS, regionToSlug, slugToRegion } from "@/lib/regions";
import { scoreColor, scoreHex, sunshineDays } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

// Pure SSG — built once at deploy, served from the static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; pair: string }> };

// Short native-English taglines per metropolitan region (keyed by name).
const REGION_EN_TAGLINES: Record<string, string> = {
  "Auvergne-Rhône-Alpes": "Lyon, the Alps and Auvergne — maximum variety.",
  Bretagne: "Wild coastline plus a real tech scene in Rennes.",
  "Bourgogne-Franche-Comté": "Wine heritage, food, and some of France's cheapest property.",
  "Centre-Val de Loire": "Loire châteaux and available housing an hour from Paris.",
  Corse: "France's island of beauty — sun, sea, mountains, insularity.",
  "Grand Est": "Open borders — European Strasbourg plus cross-border salaries.",
  "Hauts-de-France": "International Lille and ultra-affordable property.",
  "Île-de-France": "Paris plus chic suburbs, tech hubs and affordable new towns.",
  Normandie: "Heritage, farmland, and fast TGV access to Paris.",
  "Nouvelle-Aquitaine": "Bordeaux, the Basque Country and Périgord — the big south-west.",
  Occitanie: "The most sunshine in mainland France. Toulouse plus Montpellier.",
  "Pays de la Loire": "Dynamic Nantes and an accessible Atlantic coast.",
  "Provence-Alpes-Côte d'Azur": "Sea, sun and a premium quality of life.",
};

export function generateStaticParams() {
  const params: Array<{ locale: string; pair: string }> = [];
  for (let i = 0; i < METRO_REGIONS.length; i++) {
    for (let j = i + 1; j < METRO_REGIONS.length; j++) {
      params.push({
        locale: "en",
        pair: `${regionToSlug(METRO_REGIONS[i])}-vs-${regionToSlug(METRO_REGIONS[j])}`,
      });
    }
  }
  return params; // 78 = C(13, 2)
}

function parsePair(pair: string): { a: string; b: string } | null {
  // Region slugs themselves contain hyphens, so we can't split on "-vs-".
  // Scan: try each METRO_REGIONS slug as the prefix.
  for (const region of METRO_REGIONS) {
    const slug = regionToSlug(region);
    if (pair.startsWith(`${slug}-vs-`)) {
      const rest = pair.slice(slug.length + 4);
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
    title: `${a} vs ${b} — French regions compared 2026`,
    description: `Side-by-side comparison of ${a} and ${b}: cost of living, climate, housing, quality-of-life scores and top cities. Which French region should you move to?`,
    alternates: { canonical: `${EN_BASE}/compare-regions/${pair}` },
    openGraph: {
      title: `${a} vs ${b} — which region wins?`,
      description: "Cost, climate, housing and scores compared, with a verdict per profile.",
    },
  };
}

function statsForRegion(region: string) {
  const cities = CITIES_SEED.filter((c) => c.region === region);
  if (cities.length === 0) return null;
  const n = cities.length;
  const avg = (key: keyof (typeof CITIES_SEED)[number]["scores"]) =>
    cities.reduce((s, c) => s + c.scores[key], 0) / n;

  const sunshines = cities.map((c) => c.sunshinedays).filter((v): v is number => v != null);
  const julyTemps = cities.map((c) => c.avgTempJuly).filter((v): v is number => v != null);
  const janTemps = cities.map((c) => c.avgTempJanuary).filter((v): v is number => v != null);

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
  { key: "global", label: "Overall score" },
  { key: "life", label: "Quality of life" },
  { key: "transport", label: "Transport" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Cost of living" },
  { key: "safety", label: "Safety" },
  { key: "culture", label: "Culture" },
  { key: "remoteWork", label: "Remote work" },
  { key: "schools", label: "Schools" },
] as const;

export default async function EnCompareRegionsPair({ params }: Props) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const { a, b } = parsed;

  const statsA = statsForRegion(a);
  const statsB = statsForRegion(b);
  if (!statsA || !statsB) notFound();

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
                  { "@type": "ListItem", position: 1, name: "Best Cities in France", item: EN_BASE },
                  { "@type": "ListItem", position: 2, name: "Compare regions", item: `${EN_BASE}/compare-regions` },
                  { "@type": "ListItem", position: 3, name: `${a} vs ${b}`, item: `${EN_BASE}/compare-regions/${pair}` },
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: `${a} or ${b}: which region has the better cost of living?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Average cost-of-living score — ${a}: ${statsA.scores.cost.toFixed(1)}/10, ${b}: ${statsB.scores.cost.toFixed(1)}/10. ${statsA.scores.cost > statsB.scores.cost ? a : b} is more affordable on average.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `${a} or ${b}: which has the better climate?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `Average sunshine — ${a}: ${sunshineDays(statsA.sunshineAvg) ?? "—"} days/year, ${b}: ${sunshineDays(statsB.sunshineAvg) ?? "—"} days/year.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `What is the best city in ${a}?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `${statsA.topCities[0].name}, with an overall score of ${statsA.topCities[0].scores.global.toFixed(1)}/10.`,
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="mb-3 text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            {" · "}
            <Link href="/compare-regions" className="hover:text-[var(--accent)]">Compare regions</Link>
          </nav>
          <Badge variant="accent" className="mb-3">Regions compared · 2026</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            <span aria-hidden className="mr-2">{REGION_EMOJIS[a] ?? "📍"}</span>
            {a} <span className="text-[var(--text-secondary)]">vs</span>{" "}
            <span aria-hidden className="mr-2">{REGION_EMOJIS[b] ?? "📍"}</span>
            {b}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {statsA.n} cities in {a} · average score {statsA.scores.global.toFixed(1)}/10
            &nbsp;·&nbsp;
            {statsB.n} cities in {b} · average score {statsB.scores.global.toFixed(1)}/10
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        {overallWinner && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-1">Overall — average scores</p>
            <p className="text-xl font-bold text-emerald-600">
              {overallWinner} wins on {Math.max(winsA, winsB)} of {SCORE_ROWS.length} criteria
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Averages computed across every city we profile in each region.
            </p>
          </div>
        )}

        {/* Side-by-side score comparison */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-6">
            Average score by criterion
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
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Average climate</h2>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div />
            <div className="font-semibold text-blue-600">{a}</div>
            <div className="font-semibold text-violet-400">{b}</div>
            {[
              { label: "Sunshine / year", a: sunshineDays(statsA.sunshineAvg), b: sunshineDays(statsB.sunshineAvg), unit: " days" },
              { label: "July average", a: statsA.julyAvg, b: statsB.julyAvg, unit: " °C" },
              { label: "January average", a: statsA.janAvg, b: statsB.janAvg, unit: " °C" },
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
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Average housing</h2>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div />
              <div className="font-semibold text-blue-600">{a}</div>
              <div className="font-semibold text-violet-400">{b}</div>
              {[
                { label: "Median 1-bed rent", a: statsA.avgRentT2, b: statsB.avgRentT2, unit: " €/mo" },
                { label: "Buy price / m²", a: statsA.avgBuyPriceM2, b: statsB.avgBuyPriceM2, unit: " €/m²" },
              ].map((row) => {
                const cheaper = row.a != null && row.b != null ? (row.a < row.b ? "a" : row.b < row.a ? "b" : "equal") : null;
                return (
                  <React.Fragment key={row.label}>
                    <div className="text-xs text-[var(--text-secondary)] text-left">{row.label}</div>
                    <div className={`font-mono-data font-bold ${cheaper === "a" ? "text-emerald-600" : "text-[var(--text-primary)]"}`}>
                      {row.a != null ? `${Math.round(row.a).toLocaleString("en-GB")}${row.unit}` : "—"}
                    </div>
                    <div className={`font-mono-data font-bold ${cheaper === "b" ? "text-emerald-600" : "text-[var(--text-primary)]"}`}>
                      {row.b != null ? `${Math.round(row.b).toLocaleString("en-GB")}${row.unit}` : "—"}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-4">
              Averages computed across the profiled cities with rent / price data (DVF + local observatories).
            </p>
          </Card>
        )}

        {/* Top cities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { region: a, stats: statsA, tagline: REGION_EN_TAGLINES[a] },
            { region: b, stats: statsB, tagline: REGION_EN_TAGLINES[b] },
          ].map(({ region, stats, tagline }) => (
            <Card key={region}>
              <div className="mb-3">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  {REGION_EMOJIS[region] ?? "📍"} Top 5 — {region}
                </h2>
                {tagline && <p className="text-xs text-[var(--text-secondary)] mt-1">{tagline}</p>}
              </div>
              <ol className="space-y-2">
                {stats.topCities.map((city, i) => (
                  <li key={city.slug}>
                    <Link
                      href={`/cities/${city.slug}`}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm hover:border-[var(--accent)]/40"
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-mono-data text-xs text-[var(--text-tertiary)]">{i + 1}.</span>
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
            The region sets the backdrop — the city is what shapes daily life.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={`/regions/${regionToSlug(a)}`}>
              <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90">
                All cities in {a}
              </Badge>
            </Link>
            <Link href={`/regions/${regionToSlug(b)}`}>
              <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90">
                All cities in {b}
              </Badge>
            </Link>
            <Link href="/city-match">
              <Badge variant="accent" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90">
                ✨ Take the matching quiz
              </Badge>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
