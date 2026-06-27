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
  internetScore,
  internetLabel,
  type InternetTier,
} from "@/lib/internet-score";
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

const EN_TIER_SHORT: Record<InternetTier, string> = {
  "tres-bonne": "Excellent",
  bonne: "Good",
  correcte: "Fair",
  limitee: "Limited",
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
    title: `Internet coverage · ${label} 2026`,
    description: `Fibre coverage across ${label} cities: where FTTH is fully deployed vs where the connection stays patchy. Regional estimate ARCEP Q4 2024.`,
    alternates: { canonical: `${EN_BASE}/internet-quality/${macro.slug}` },
    openGraph: {
      title: `Internet coverage · ${label}`,
      description: `City-by-city fibre and broadband ranking across the ${label} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function EnMacroRegionInternetPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();
  const label = macroLabelEn(macro.slug, macro.label);

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => {
      const score = internetScore(c);
      return {
        slug: c.slug,
        name: c.name,
        region: c.region,
        department: c.department,
        score,
        info: internetLabel(score),
      };
    });

  // 10 = excellent → descending sort for the best-connected.
  const best = [...cities].sort((a, b) => b.score - a.score).slice(0, 15);
  const worst = [...cities].sort((a, b) => a.score - b.score).slice(0, 10);

  const n = cities.length || 1;
  const avgScore =
    Math.round((cities.reduce((s, c) => s + c.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Internet coverage", path: "/internet-quality" },
    { name: label, path: `/internet-quality/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which cities have the best fibre coverage in ${label}?`,
      a:
        best.length > 0
          ? `Top 3 best-connected cities in ${label} (10 = fully deployed FTTH): ${best
              .slice(0, 3)
              .map((c) => `${c.name} (${c.score.toFixed(1)}/10)`)
              .join(", ")}.`
          : `No city above 10,000 residents is referenced for this macro-region.`,
    },
    {
      q: `What is the average internet score in ${label}?`,
      a: `Average score ${avgScore}/10 (10 = excellent fibre coverage) across ${cities.length} referenced cities of 10,000+ residents.`,
    },
    {
      q: `How is this score calculated?`,
      a: `Score 0-10 combining the city's remote-work seed score (60%), a regional bonus aligned on ARCEP Q4 2024 FTTH connectable rates, plus urban-density and low-density-department corrections.`,
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
          <Link href="/internet-quality" className="hover:underline">
            Internet coverage
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Internet coverage — {label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Connection quality across the {cities.length} referenced cities of
          10,000+ residents in the {label} macro-region. Score 0-10, 10 = fully
          deployed FTTH.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} cities analysed</Badge>
          <Badge>Average score: {avgScore}/10</Badge>
          <Badge>Source: ARCEP Q4 2024</Badge>
        </div>

        {/* Best */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — Best-fibred cities in {label}
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
                        href={`/cities/${c.slug}/internet-quality`}
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
                        {c.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${c.info.color}`}>
                        {EN_TIER_SHORT[c.info.tier]}
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
          Top 10 — Worst-connected cities in {label}
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
                        href={`/cities/${c.slug}/internet-quality`}
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
                        {c.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        /10
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${c.info.color}`}>
                        {EN_TIER_SHORT[c.info.tier]}
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
              href={`/internet-quality/${m.slug}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {macroLabelEn(m.slug, m.label)}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Internet coverage
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link
            href="/internet-quality"
            className="text-[var(--accent)] hover:underline"
          >
            → See the full national internet-coverage ranking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
