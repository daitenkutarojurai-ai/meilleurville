import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { MACRO_REGIONS, MACRO_REGION_SLUGS, getMacroRegion } from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import {
  computeEnvironmentIndex,
  ENV_LEVEL_LABEL,
  ENV_LEVEL_COLOR,
} from "@/lib/environment-index";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternatesEn } from "@/lib/i18n";
import { fitTitle } from "@/lib/brand";

export const revalidate = false;
export const dynamicParams = false;

// EN level labels, same as the hub (the lib labels are French).
const EN_ENV_LABEL: Record<string, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Moderate",
  tendu: "Strained",
};

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
    title: fitTitle(`Healthiest cities · ${label} 2026`),
    description: `Composite environmental ranking (air, noise, water, natural risks) for cities in the ${label} macro-region. Cleanest vs most exposed cities.`,
    alternates: pathAlternatesEn(`/environnement/${macro.slug}`, `/environment/${macro.slug}`),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
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
      a: `Composite index aggregating four dimensions estimated at commune level: air quality (30%), noise (25%), water stress (25%) and natural risks (20%). Each is a model computed from the commune's own characteristics and keyed to the public reference frameworks (ATMO/CITEPA/RNSA, CBS/PEB/Bruitparif, Propluvia/BRGM, BCSF/BRGM/ONF) without reusing their readings. Score 0–10, 10 = healthiest environment.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link> ·{" "}
          <Link href="/environment" className="hover:underline">Environment</Link>
        </nav>

        <div className="flex items-center gap-3">
          <EmojiBadge emoji={macro.emoji} tone="aqua" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            <span className="gradient-text">Healthiest cities</span> — {label}
          </h1>
        </div>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite environmental ranking for {cities.length} cities in the {label} macro-region
          with over 10,000 inhabitants. Index aggregating air quality, noise, water stress and
          natural risks.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="grad-head-0 rounded-full px-3 py-1 font-semibold">{cities.length} cities analysed</span>
          <span className="rounded-full bg-white/85 px-3 py-1 font-medium text-[#4338CA] ring-1 ring-[#C7D2FE]">Average environmental health: {avgHealth.toFixed(1)}/10</span>
        </div>

        </div>
      </section>

      {/* Profil moyen — bande ciel */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
          <h2 className="text-sm uppercase tracking-wide text-[#0E7490] font-semibold mb-3">
            Average environmental profile for this macro-region
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Air", v: avgAir, hint: "PM2.5 + NO2 + ozone + pollen" },
              { k: "Noise", v: avgNoise, hint: "Road + air + rail + night" },
              { k: "Water", v: avgWater, hint: "Restrictions + aquifer + dry climate" },
              { k: "Risks", v: avgRisks, hint: "Flood + clay + fire + seismic" },
            ].map((d) => (
              <div key={d.k} className="rounded-xl bg-[#ECFEFF] p-3 ring-1 ring-[#A5F3FC]">
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
        </div>

        </div>
      </section>

      {/* Top 15 — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 15 — healthiest cities in {label}</span>
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--band-indigo)] text-xs uppercase tracking-wide text-[#4338CA]">
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
                  <tr key={c.slug} className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]">
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
                        {EN_ENV_LABEL[c.index.level] ?? ENV_LEVEL_LABEL[c.index.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.air.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.bruit.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        </div>
      </section>

      {/* Top 10 — bande rose */}
      <section className="band band-pink py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 10 — most exposed cities in {label}</span>
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(219,39,119,0.45)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--band-pink)] text-xs uppercase tracking-wide text-[#9D174D]">
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
                  <tr key={c.slug} className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]">
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
        </div>

        </div>
      </section>

      {/* Autres macro-régions — bande lilas */}
      <section className="band band-lilac py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-xl font-bold">
          <span className="gradient-text">Other macro-regions</span>
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m, i) => (
            <Link
              key={m.slug}
              href={`/environment/${m.slug}`}
              className="flex h-full items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_10px_24px_-18px_rgba(124,58,237,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(124,58,237,0.6)]"
            >
              <EmojiBadge emoji={m.emoji} tone={toneFor(i)} size="sm" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Environmental index</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/environment"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-[#4F46E5] to-[#DB2777] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-14px_rgba(79,70,229,0.7)] transition hover:opacity-95"
          >
            View the full national environmental ranking
          </Link>
        </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
