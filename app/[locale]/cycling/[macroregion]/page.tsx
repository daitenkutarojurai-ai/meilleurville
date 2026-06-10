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
  computeCyclingMobility,
  CYCLING_LEVEL_LABEL,
  CYCLING_LEVEL_COLOR,
} from "@/lib/cycling-mobility";
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
    title: `Cycling-friendly cities · ${label} 2026`,
    description: `Composite cycling index (infrastructure, topography, safety, climate) for cities in the ${label} macro-region. Top cycling cities vs most challenging terrain.`,
    alternates: { canonical: `${EN_BASE}/cycling/${macro.slug}` },
    openGraph: {
      title: `Cycling-friendly cities · ${label}`,
      description: `Composite cycling mobility index for cities in the ${label} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

const EN_LEVEL_LABEL: Record<string, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Average",
  difficile: "Difficult",
};

export default async function MacroRegionCyclingEnPage({ params }: Props) {
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
      cycling: computeCyclingMobility(c),
    }));

  // composite: 10 = best for cycling → sort descending for best cities
  const best = [...cities].sort((a, b) => b.cycling.composite - a.cycling.composite).slice(0, 15);
  const worst = [...cities].sort((a, b) => a.cycling.composite - b.cycling.composite).slice(0, 10);

  const n = cities.length || 1;
  const avgComposite = Math.round((cities.reduce((s, c) => s + c.cycling.composite, 0) / n) * 10) / 10;
  const avgNetwork = Math.round((cities.reduce((s, c) => s + c.cycling.network.score, 0) / n) * 10) / 10;
  const avgTopo = Math.round((cities.reduce((s, c) => s + c.cycling.topography.score, 0) / n) * 10) / 10;
  const avgSafety = Math.round((cities.reduce((s, c) => s + c.cycling.safety.score, 0) / n) * 10) / 10;
  const avgClimate = Math.round((cities.reduce((s, c) => s + c.cycling.climate.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cycling", path: "/cycling" },
    { name: label, path: `/cycling/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which cities are most cycling-friendly in ${label}?`,
      a:
        best.length > 0
          ? `Top 3 by composite cycling score (10 = ideal): ${best
              .slice(0, 3)
              .map((c) => `${c.name} (${c.cycling.composite.toFixed(1)}/10)`)
              .join(", ")}.`
          : `No cities with over 10,000 inhabitants are listed for this macro-region.`,
    },
    {
      q: `What is the average cycling score in ${label}?`,
      a: `Average composite score ${avgComposite.toFixed(1)}/10 (10 = ideal cycling conditions). Sub-scores: infrastructure ${avgNetwork.toFixed(1)}/10, topography ${avgTopo.toFixed(1)}/10, safety ${avgSafety.toFixed(1)}/10, climate ${avgClimate.toFixed(1)}/10.`,
    },
    {
      q: `How is the cycling index calculated?`,
      a: `Composite of 4 dimensions: cycling infrastructure/network (40%, based on FUB barometer data and OpenStreetMap cycle network density), topography (25%, penalises hilly terrain), safety (20%, accident data and infrastructure quality), climate (15%, favours mild dry weather). Score 0–10, 10 = excellent cycling conditions.`,
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
          <Link href="/cycling" className="hover:underline">Cycling</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Cycling-friendly cities — {label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite cycling index for {cities.length} cities in the {label} macro-region
          with over 10,000 inhabitants. Four dimensions: infrastructure, topography, safety, climate.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} cities analysed</Badge>
          <Badge>Average: {avgComposite.toFixed(1)}/10</Badge>
        </div>

        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Average cycling profile for this macro-region
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Infrastructure", v: avgNetwork, hint: "FUB barometer + cycle network density" },
              { k: "Topography", v: avgTopo, hint: "Flat vs hilly terrain score" },
              { k: "Safety", v: avgSafety, hint: "Accident data + infrastructure quality" },
              { k: "Climate", v: avgClimate, hint: "Mild dry conditions for cycling" },
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
            10 = excellent cycling conditions on that dimension.
          </p>
        </Card>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — most cycling-friendly cities in {label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">Score</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Infra.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Topo.</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Safety</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/cycling`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${CYCLING_LEVEL_COLOR[c.cycling.level]}`}>
                        {c.cycling.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_LEVEL_LABEL[c.cycling.level] ?? CYCLING_LEVEL_LABEL[c.cycling.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {c.cycling.network.score.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {c.cycling.topography.score.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {c.cycling.safety.score.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {worst.length > 0 && (
          <>
            <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
              Top 10 — most challenging cycling terrain in {label}
            </h2>
            <Card className="mt-4 overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                    <tr>
                      <th className="px-3 py-2 text-left">City</th>
                      <th className="px-3 py-2 text-left">Department</th>
                      <th className="px-3 py-2 text-right">Score</th>
                      <th className="px-3 py-2 text-right hidden sm:table-cell">Infra.</th>
                      <th className="px-3 py-2 text-right hidden sm:table-cell">Topo.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worst.map((c) => (
                      <tr key={c.slug} className="border-t border-[var(--border)]">
                        <td className="px-3 py-2">
                          <Link href={`/cities/${c.slug}/cycling`} className="text-[var(--text-primary)] hover:text-[var(--accent)]">
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                        <td className="px-3 py-2 text-right">
                          <span className="font-bold tabular-nums text-orange-500">
                            {c.cycling.composite.toFixed(1)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-0.5">/10</span>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                          {c.cycling.network.score.toFixed(1)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                          {c.cycling.topography.score.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Other macro-regions
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m) => (
            <Link key={m.slug} href={`/cycling/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Cycling mobility</div>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-8">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Methodology note</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Composite of 4 dimensions: cycling infrastructure (40%, FUB barometer rankings +
            OpenStreetMap cycle network density), topography (25%, altitude variation and grade
            analysis), safety (20%, accident data and infrastructure separation quality), climate
            (15%, precipitation, temperature and wind data). Score 0–10, 10 = ideal cycling
            conditions. Only cities with 10,000+ inhabitants appear in this index.
          </p>
        </Card>

        <div className="mt-6">
          <Link href="/cycling" className="text-sm text-[var(--accent)] hover:underline">
            ← National cycling ranking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
