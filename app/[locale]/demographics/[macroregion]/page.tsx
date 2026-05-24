import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  MACRO_REGIONS,
  MACRO_REGION_SLUGS,
  getMacroRegion,
  citiesInMacroRegion,
} from "@/lib/macro-regions";
import {
  computeDemography,
  DEMO_LEVEL_LABEL,
  DEMO_LEVEL_COLOR,
} from "@/lib/demography";
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
    title: `Demographics · ${label} 2026`,
    description: `Composite demographics ranking (ageing, young workers, trajectory, renewal) for cities in the ${label} macro-region. Most dynamic vs most ageing cities.`,
    alternates: { canonical: `${EN_BASE}/demographics/${macro.slug}` },
    openGraph: {
      title: `Demographics · ${label}`,
      description: `Composite demographics index for cities in the ${label} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionDemographicsEnPage({ params }: Props) {
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
      demo: computeDemography(c),
    }));

  // 10 = worst → sort ascending for most dynamic cities
  const dynamic = [...cities].sort((a, b) => a.demo.composite - b.demo.composite).slice(0, 15);
  const ageing = [...cities].sort((a, b) => b.demo.composite - a.demo.composite).slice(0, 10);

  const n = cities.length || 1;
  const avgComposite = Math.round((cities.reduce((s, c) => s + c.demo.composite, 0) / n) * 10) / 10;
  const avgAgeing = Math.round((cities.reduce((s, c) => s + c.demo.ageing.score, 0) / n) * 10) / 10;
  const avgYoung = Math.round((cities.reduce((s, c) => s + c.demo.youngActives.score, 0) / n) * 10) / 10;
  const avgTraj = Math.round((cities.reduce((s, c) => s + c.demo.trajectory.score, 0) / n) * 10) / 10;
  const avgRenewal = Math.round((cities.reduce((s, c) => s + c.demo.renewal.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Demographics", path: "/demographics" },
    { name: label, path: `/demographics/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which cities have the most dynamic demographics in ${label}?`,
      a:
        dynamic.length > 0
          ? `Top 3 by composite score (10 = most dynamic): ${dynamic
              .slice(0, 3)
              .map((c) => `${c.name} (${(10 - c.demo.composite).toFixed(1)}/10)`)
              .join(", ")}.`
          : `No cities with over 10,000 inhabitants are listed for this macro-region.`,
    },
    {
      q: `What is the average demographic profile in ${label}?`,
      a: `Average composite score ${(10 - avgComposite).toFixed(1)}/10 (10 = most dynamic). Sub-scores: ageing ${(10 - avgAgeing).toFixed(1)}/10, young workers ${(10 - avgYoung).toFixed(1)}/10, trajectory ${(10 - avgTraj).toFixed(1)}/10, renewal ${(10 - avgRenewal).toFixed(1)}/10.`,
    },
    {
      q: `How is this ranking calculated?`,
      a: `Weighted composite across 4 INSEE dimensions: ageing (30%), demographic trajectory (30%), young workers 25-35 (25%), birth-rate renewal (15%). Sources: INSEE RP, Bilan démographique, OMPHALE projection.`,
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
          <Link href="/demographics" className="hover:underline">Demographics</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Demographics — {label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite demographics index for {cities.length} cities in the {label} macro-region
          with over 10,000 inhabitants. Four dimensions: ageing, young workers, trajectory,
          renewal.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} cities analysed</Badge>
          <Badge>Average composite: {(10 - avgComposite).toFixed(1)}/10</Badge>
        </div>

        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Average demographic profile for this macro-region
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Ageing", v: avgAgeing, hint: "% seniors 60+ by dept" },
              { k: "Young workers", v: avgYoung, hint: "Deficit of 25-35 age group" },
              { k: "Trajectory", v: avgTraj, hint: "Natural + migration balance" },
              { k: "Renewal", v: avgRenewal, hint: "Birth rate per 1,000" },
            ].map((d) => (
              <div key={d.k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                <div className="text-xs text-[var(--text-tertiary)]">{d.k}</div>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {(10 - d.v).toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">{d.hint}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Sub-scores: 10 = most dynamic demographics.
          </p>
        </Card>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — most dynamic demographics in {label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Ageing</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Young</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Trajectory</th>
                </tr>
              </thead>
              <tbody>
                {dynamic.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/demographics`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${DEMO_LEVEL_COLOR[c.demo.level]}`}>
                        {(10 - c.demo.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {DEMO_LEVEL_LABEL[c.demo.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.ageing.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.youngActives.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.demo.trajectory.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — most demographically strained cities in {label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Ageing</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Young</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Trajectory</th>
                </tr>
              </thead>
              <tbody>
                {ageing.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/demographics`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.demo.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.ageing.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.demo.youngActives.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.demo.trajectory.score).toFixed(1)}</td>
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
            <Link key={m.slug} href={`/demographics/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Demographics</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/demographics" className="text-[var(--accent)] hover:underline">
            View the full national demographics ranking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
