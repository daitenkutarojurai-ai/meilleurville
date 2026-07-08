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
  computeCommerce,
  type CommerceLevel,
} from "@/lib/commerce";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; macroregion: string }> };

export function generateStaticParams() {
  return MACRO_REGION_SLUGS.map((slug) => ({ locale: "en", macroregion: slug }));
}

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

const EN_LEVEL_LABEL: Record<CommerceLevel, string> = {
  exceptionnel: "Exceptional",
  solide: "Solid",
  correct: "Adequate",
  limite: "Limited",
};

const EN_LEVEL_COLOR: Record<CommerceLevel, string> = {
  exceptionnel: "text-emerald-600",
  solide: "text-lime-600",
  correct: "text-amber-600",
  limite: "text-orange-600",
};

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
    title: `Retail coverage · ${label} 2026`,
    description: `Retail offer across ${label} cities: density, markets & proximity, big-box, downtown vitality. Editorial ranking derived from INSEE / Procos.`,
    alternates: { canonical: `${EN_BASE}/retail-coverage/${macro.slug}` },
    openGraph: {
      title: `Retail coverage · ${label}`,
      description: `City-by-city retail and downtown-vitality ranking across the ${label} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function EnMacroRegionRetailPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();
  const label = macroLabelEn(macro.slug, macro.label);

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => {
      const commerce = computeCommerce(c);
      return {
        slug: c.slug,
        name: c.name,
        region: c.region,
        department: c.department,
        commerce,
      };
    });

  // 10 = excellent → descending sort for best coverage.
  const best = [...cities]
    .sort((a, b) => b.commerce.composite - a.commerce.composite)
    .slice(0, 15);
  const worst = [...cities]
    .sort((a, b) => a.commerce.composite - b.commerce.composite)
    .slice(0, 10);

  const n = cities.length || 1;
  const avgScore =
    Math.round(
      (cities.reduce((s, c) => s + c.commerce.composite, 0) / n) * 10,
    ) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Retail coverage", path: "/retail-coverage" },
    { name: label, path: `/retail-coverage/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which cities have the densest retail offer in ${label}?`,
      a:
        best.length > 0
          ? `Top 3 cities with the densest retail offer in ${label} (10 = excellent coverage): ${best
              .slice(0, 3)
              .map((c) => `${c.name} (${c.commerce.composite.toFixed(1)}/10)`)
              .join(", ")}.`
          : `No city above 10,000 residents is referenced for this macro-region.`,
    },
    {
      q: `What is the average retail-coverage score in ${label}?`,
      a: `Average score ${avgScore}/10 (10 = excellent coverage) across ${cities.length} referenced cities of 10,000+ residents.`,
    },
    {
      q: `How is this score calculated?`,
      a: `Score 0-10 (10 = excellent) combining four dimensions: overall coverage (35%), markets & proximity (25%), big-box (15%), downtown vitality (25%). Derived from the city profile (INSEE / Procos reference), not a field count.`,
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
          <Link href="/retail-coverage" className="hover:underline">
            Retail coverage
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Retail coverage — {label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Density and vitality of the retail offer across the {cities.length}{" "}
          referenced cities of 10,000+ residents in the {label} macro-region.
          Score 0-10, 10 = excellent coverage (dense, diversified, lively
          downtown).
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} cities analysed</Badge>
          <Badge>Average score: {avgScore}/10</Badge>
          <Badge>Sources: INSEE BPE, Procos</Badge>
        </div>

        {/* Best */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — best retail coverage in {label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr
                    key={c.slug}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/retail`}
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
                        {c.commerce.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${EN_LEVEL_COLOR[c.commerce.level]}`}
                      >
                        {EN_LEVEL_LABEL[c.commerce.level]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Worst */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — cities in retail stress in {label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr
                    key={c.slug}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/retail`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">
                      {c.department}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-orange-600">
                        {c.commerce.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span
                        className={`text-xs font-semibold ${EN_LEVEL_COLOR[c.commerce.level]}`}
                      >
                        {EN_LEVEL_LABEL[c.commerce.level]}
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
              href={`/retail-coverage/${m.slug}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {macroLabelEn(m.slug, m.label)}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Retail coverage
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link
            href="/retail-coverage"
            className="text-[var(--accent)] hover:underline"
          >
            → See the full national retail-coverage ranking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
