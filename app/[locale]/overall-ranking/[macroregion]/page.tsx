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
  computeCitySynthesis,
  SYNTHESIS_LEVEL_COLOR,
} from "@/lib/city-synthesis";
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

const EN_SYNTHESIS_LABEL: Record<string, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Moderate",
  tendu: "Strained",
};

const EN_AXIS_LABEL: Record<string, string> = {
  "Cadre de vie": "Quality of life",
  "Environnement": "Environment",
  "Santé": "Healthcare",
  "Emploi": "Employment",
  "Vélo": "Cycling",
  "Sécurité": "Safety",
  "Démographie": "Demographics",
  "Services publics": "Public services",
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
    title: `Overall ranking · ${label} 2026 — quality of life across all dimensions`,
    description: `Composite ranking of cities in the ${label} macro-region across 8 data dimensions: environment, healthcare, employment, quality of life, cycling, safety, demographics, public services. 10 = excellent.`,
    alternates: { canonical: `${EN_BASE}/overall-ranking/${macro.slug}` },
    openGraph: {
      title: `Overall ranking · ${label}`,
      description: `8-dimension composite ranking for cities in the ${label} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionOverallRankingEnPage({ params }: Props) {
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
      synthesis: computeCitySynthesis(c),
    }));

  const top = [...cities].sort((a, b) => b.synthesis.global - a.synthesis.global).slice(0, 15);
  const bottom = [...cities].sort((a, b) => a.synthesis.global - b.synthesis.global).slice(0, 10);

  const n = cities.length || 1;
  const avgGlobal = Math.round((cities.reduce((s, c) => s + c.synthesis.global, 0) / n) * 10) / 10;
  const avgSpread = Math.round((cities.reduce((s, c) => s + c.synthesis.spread, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Overall ranking", path: "/overall-ranking" },
    { name: label, path: `/overall-ranking/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which cities have the best overall profile in ${label}?`,
      a:
        top.length > 0
          ? `Top 3 by composite score across 8 dimensions (10 = excellent): ${top
              .slice(0, 3)
              .map((c) => `${c.name} (${c.synthesis.global.toFixed(1)}/10)`)
              .join(", ")}.`
          : `No cities with over 10,000 inhabitants are listed for this macro-region.`,
    },
    {
      q: `What is the average composite score in ${label}?`,
      a: `Average composite score ${avgGlobal.toFixed(1)}/10 across ${cities.length} cities with 10,000+ inhabitants in ${label}. Average profile consistency (standard deviation between axes): ±${avgSpread.toFixed(1)}/10.`,
    },
    {
      q: `How is the overall ranking calculated?`,
      a: `Arithmetic mean of 8 data-cluster composites (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services), all normalised to a "10 = excellent" scale. Restricted to cities with 10,000+ inhabitants in the ${label} macro-region.`,
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
          <Link href="/overall-ranking" className="hover:underline">Overall ranking</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Overall ranking — {label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          8-dimension composite ranking for {cities.length} cities in the {label} macro-region
          with over 10,000 inhabitants. Dimensions: environment, healthcare, employment,
          quality of life, cycling, safety, demographics, public services. Score 0–10, 10 = excellent.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} cities analysed</Badge>
          <Badge>Average: {avgGlobal.toFixed(1)}/10</Badge>
          <Badge>Consistency: ±{avgSpread.toFixed(1)}/10</Badge>
        </div>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — most favourable profiles in {label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Consistency</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Strength #1</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Tension #1</th>
                </tr>
              </thead>
              <tbody>
                {top.map((c, i) => (
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
                      <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.synthesis.level]}`}>
                        {c.synthesis.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_SYNTHESIS_LABEL[c.synthesis.level] ?? c.synthesis.level}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      ±{c.synthesis.spread.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {c.synthesis.strengths[0] && (
                        <>{EN_AXIS_LABEL[c.synthesis.strengths[0].label] ?? c.synthesis.strengths[0].label} {c.synthesis.strengths[0].score.toFixed(1)}</>
                      )}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {c.synthesis.tensions[0] && (
                        <>{EN_AXIS_LABEL[c.synthesis.tensions[0].label] ?? c.synthesis.tensions[0].label} {c.synthesis.tensions[0].score.toFixed(1)}</>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {bottom.length > 0 && (
          <>
            <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
              Top 10 — most strained profiles in {label}
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
                      <th className="px-3 py-2 text-right hidden sm:table-cell">Consistency</th>
                      <th className="px-3 py-2 text-left hidden md:table-cell">Tension #1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bottom.map((c, i) => (
                      <tr key={c.slug} className="border-t border-[var(--border)]">
                        <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/cities/${c.slug}`}
                            className="text-[var(--text-primary)] hover:text-[var(--accent)]"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                        <td className="px-3 py-2 text-right">
                          <span className="font-bold tabular-nums text-red-600">
                            {c.synthesis.global.toFixed(1)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                          ±{c.synthesis.spread.toFixed(1)}
                        </td>
                        <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                          {c.synthesis.tensions[0] && (
                            <>{EN_AXIS_LABEL[c.synthesis.tensions[0].label] ?? c.synthesis.tensions[0].label} {c.synthesis.tensions[0].score.toFixed(1)}</>
                          )}
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
            <Link key={m.slug} href={`/overall-ranking/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Overall ranking</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/overall-ranking" className="text-sm text-[var(--accent)] hover:underline">
            ← National overall ranking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
