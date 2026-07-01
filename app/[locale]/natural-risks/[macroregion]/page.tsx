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
} from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import {
  computeNaturalRisks,
  type RiskLevel,
} from "@/lib/natural-risks";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; macroregion: string }> };

export function generateStaticParams() {
  return MACRO_REGION_SLUGS.map((slug) => ({
    locale: "en",
    macroregion: slug,
  }));
}

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

const EN_LEVEL_LABEL: Record<RiskLevel, string> = {
  faible: "Low",
  modere: "Moderate",
  eleve: "Elevated",
  fort: "High",
};

const EN_LEVEL_COLOR: Record<RiskLevel, string> = {
  faible: "text-emerald-600",
  modere: "text-amber-600",
  eleve: "text-orange-600",
  fort: "text-red-600",
};

const EN_HAZARD_LABEL = {
  flood: "Flood",
  seismic: "Seismic",
  clay: "Clay",
  wildfire: "Wildfire",
} as const;

function macroLabelEn(slug: string, fallback: string): string {
  return EN_MACRO_LABEL[slug] ?? fallback;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) return {};
  const label = macroLabelEn(macro.slug, macro.label);
  return {
    title: `Natural risks · ${label} 2026`,
    description: `Flood, seismic activity, clay shrinkage and wildfire across ${label} cities. Top 15 most-exposed vs top 10 calmest.`,
    alternates: { canonical: `${EN_BASE}/natural-risks/${macro.slug}` },
    openGraph: {
      title: `Natural risks · ${label}`,
      description: `City-by-city natural-risk ranking across the ${label} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function EnMacroRegionRisksPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();
  const label = macroLabelEn(macro.slug, macro.label);

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => {
      const r = computeNaturalRisks(c);
      return {
        slug: c.slug,
        name: c.name,
        region: c.region,
        department: c.department,
        composite: r.composite,
        level: r.level,
        flood: r.flood.score,
        seismic: r.seismic.score,
        clay: r.clay.score,
        wildfire: r.wildfire.score,
      };
    });

  // 10 = maximum exposure → descending sort for the most-exposed.
  const most = [...cities]
    .sort((a, b) => b.composite - a.composite)
    .slice(0, 15);
  const least = [...cities]
    .sort((a, b) => a.composite - b.composite)
    .slice(0, 10);

  const n = cities.length || 1;
  const avgComposite =
    Math.round((cities.reduce((s, c) => s + c.composite, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Natural risks", path: "/natural-risks" },
    { name: label, path: `/natural-risks/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which cities are most exposed to natural risks in ${label}?`,
      a:
        most.length > 0
          ? `Top 3 with the highest composite risk score in ${label} (10 = maximum exposure): ${most
              .slice(0, 3)
              .map((c) => `${c.name} (${c.composite.toFixed(1)}/10)`)
              .join(", ")}.`
          : `No city above 10,000 residents is referenced for this macro-region.`,
    },
    {
      q: `What is the average natural-risk score in ${label}?`,
      a: `Average composite ${avgComposite}/10 (10 = maximum exposure) across ${cities.length} referenced cities of 10,000+ residents.`,
    },
    {
      q: `Which hazards dominate in ${label}?`,
      a: `Educational summary across 4 dimensions: flooding (35%, major river + elevation + coast), clay shrinkage (25%, BRGM departmental hazard), wildfire (20%, ONF classification), seismic activity (20%, 2011 regulatory zoning). Click any city for the hazard-by-hazard breakdown.`,
    },
    {
      q: "Do these scores replace an official PPRI?",
      a: "No. They are educational summaries at the municipal scale. For an official flood-risk prevention plan (PPRI), a technological-risk plan (PPRT) or the statutory état des risques (ERP, mandatory at sale), consult Géorisques with the exact address.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumb)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faq)}
      />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          ·{" "}
          <Link href="/natural-risks" className="hover:underline">
            Natural risks
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Natural risks — {label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Exposure to the 4 major hazards (flood, seismic activity, clay
          shrinkage, wildfire) across the {cities.length} referenced cities of
          10,000+ residents in the {label} macro-region. Composite 0-10, 10 =
          maximum exposure.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} cities analysed</Badge>
          <Badge>Average composite: {avgComposite}/10</Badge>
          <Badge>Sources: BCSF · BRGM · ONF</Badge>
        </div>

        {/* Most exposed */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — Most-exposed cities in {label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Level
                  </th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">
                    Top hazard
                  </th>
                </tr>
              </thead>
              <tbody>
                {most.map((c, i) => {
                  const top = [
                    { k: EN_HAZARD_LABEL.flood, v: c.flood },
                    { k: EN_HAZARD_LABEL.seismic, v: c.seismic },
                    { k: EN_HAZARD_LABEL.clay, v: c.clay },
                    { k: EN_HAZARD_LABEL.wildfire, v: c.wildfire },
                  ].sort((a, b) => b.v - a.v)[0];
                  return (
                    <tr
                      key={c.slug}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                        {i + 1}
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/cities/${c.slug}/natural-risks`}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-[var(--text-tertiary)]">
                        {c.department}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-bold tabular-nums text-red-600">
                          {c.composite.toFixed(1)}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                          /10
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right hidden sm:table-cell">
                        <span
                          className={`text-xs font-semibold ${EN_LEVEL_COLOR[c.level]}`}
                        >
                          {EN_LEVEL_LABEL[c.level]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right hidden md:table-cell text-xs text-[var(--text-tertiary)]">
                        {top.k} ({top.v.toFixed(0)})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Least exposed */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — Calmest cities in {label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {least.map((c, i) => (
                  <tr
                    key={c.slug}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/natural-risks`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">
                      {c.department}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-emerald-600">
                        {c.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${EN_LEVEL_COLOR[c.level]}`}
                      >
                        {EN_LEVEL_LABEL[c.level]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Other macro-regions */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Other macro-regions
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m) => (
            <Link
              key={m.slug}
              href={`/natural-risks/${m.slug}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {macroLabelEn(m.slug, m.label)}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Natural risks
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link
            href="/natural-risks"
            className="text-[var(--accent)] hover:underline"
          >
            → See the full national natural-risks ranking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
