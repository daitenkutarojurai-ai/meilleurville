import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MACRO_REGIONS, MACRO_REGION_SLUGS, getMacroRegion } from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import {
  computeEnvironmentIndex,
  ENV_LEVEL_LABEL,
  ENV_LEVEL_COLOR,
} from "@/lib/environment-index";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

type Props = { params: Promise<{ locale: string; macroregion: string }> };

export function generateStaticParams() {
  return MACRO_REGION_SLUGS.map((slug) => ({ locale: "en", macroregion: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) return {};
  const label = EN_MACRO_LABEL[macroregion] ?? macro.label;
  return {
    title: `Healthiest cities · ${label} 2026`,
    description: `Composite environmental ranking (air, noise, water, natural risks) for cities in the ${label} macro-region. Cleanest vs most exposed cities.`,
    alternates: { canonical: `${EN_BASE}/environment/${macro.slug}` },
    openGraph: {
      title: `Healthiest cities · ${label}`,
      description: `Composite environmental index for cities in the ${label} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionEnvironmentEnPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();

  const label = EN_MACRO_LABEL[macroregion] ?? macro.label;

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      department: c.department,
      index: computeEnvironmentIndex(c),
    }));

  const topHealthy = [...cities].sort((a, b) => b.index.healthScore - a.index.healthScore).slice(0, 15);
  const mostExposed = [...cities].sort((a, b) => b.index.stressComposite - a.index.stressComposite).slice(0, 10);

  const n = cities.length || 1;
  const avgHealth = Math.round((cities.reduce((s, c) => s + c.index.healthScore, 0) / n) * 10) / 10;
  const avgAir = Math.round((cities.reduce((s, c) => s + c.index.air, 0) / n) * 10) / 10;
  const avgNoise = Math.round((cities.reduce((s, c) => s + c.index.bruit, 0) / n) * 10) / 10;
  const avgWater = Math.round((cities.reduce((s, c) => s + c.index.eau, 0) / n) * 10) / 10;
  const avgRisks = Math.round((cities.reduce((s, c) => s + c.index.risques, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Environment", path: "/environment" },
    { name: label, path: `/environment/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which are the healthiest cities in ${label}?`,
      a:
        topHealthy.length > 0
          ? `Top 3 by environmental health score: ${topHealthy
              .slice(0, 3)
              .map((c) => `${c.name} (${c.index.healthScore.toFixed(1)}/10)`)
              .join(", ")}.`
          : `No cities with over 10,000 inhabitants are listed for this macro-region.`,
    },
    {
      q: `What is the average environmental stress level in ${label}?`,
      a: `Average environmental health score ${avgHealth.toFixed(1)}/10 (10 = healthiest). Average sub-scores (10 = worst exposure): air ${avgAir.toFixed(1)}/10, noise ${avgNoise.toFixed(1)}/10, water stress ${avgWater.toFixed(1)}/10, natural risks ${avgRisks.toFixed(1)}/10.`,
    },
    {
      q: `How is this ranking calculated?`,
      a: `Composite index aggregating air quality (ATMO/CITEPA/RNSA — 30%), noise (CBS/PEB/Bruitparif — 25%), water stress (Propluvia/BRGM — 25%) and natural risks (Georisques/BRGM — 20%). Score 0–10, 10 = healthiest environment.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link> ·{" "}
          <Link href="/environment" className="hover:underline">Environment</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Healthiest cities — {label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite environmental ranking for {cities.length} cities in the {label} macro-region
          with over 10,000 inhabitants. Index aggregating air quality, noise, water stress and
          natural risks.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} cities analysed</Badge>
          <Badge>Average environmental health: {avgHealth.toFixed(1)}/10</Badge>
        </div>

        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Average environmental profile for this macro-region
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Air", v: avgAir, hint: "PM2.5 + NO2 + ozone + pollen" },
              { k: "Noise", v: avgNoise, hint: "Road + air + rail + night" },
              { k: "Water", v: avgWater, hint: "Restrictions + aquifer + dry climate" },
              { k: "Risks", v: avgRisks, hint: "Flood + clay + fire + seismic" },
            ].map((d) => (
              <div key={d.k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                <div className="text-xs text-[var(--text-tertiary)]">{d.k}</div>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {d.v.toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">{d.hint}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Sub-scores: 10 = maximum exposure (worst). Environmental health score inverts this (10 = healthiest).
          </p>
        </Card>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — healthiest cities in {label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">Env. health</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Air</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Noise</th>
                </tr>
              </thead>
              <tbody>
                {topHealthy.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${ENV_LEVEL_COLOR[c.index.level]}`}>
                        {c.index.healthScore.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {ENV_LEVEL_LABEL[c.index.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.air.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.bruit.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — most exposed cities in {label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">Stress</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Water</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Risks</th>
                </tr>
              </thead>
              <tbody>
                {mostExposed.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.index.stressComposite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.eau.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.risques.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Other macro-regions
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m) => (
            <Link key={m.slug} href={`/environment/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Environmental index</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/environment" className="text-[var(--accent)] hover:underline">
            View the full national environmental ranking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
