import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MACRO_REGION_SLUGS, getMacroRegion } from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import {
  computeQualityOfLife,
  QOL_LEVEL_COLOR,
} from "@/lib/quality-of-life-index";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; macroregion: string }> };

export async function generateStaticParams() {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) return {};
  const enLabel = EN_MACRO_LABEL[macro.slug] ?? macro.label;
  return {
    title: `Quality of life · ${enLabel} — top cities 2026`,
    description: `Quality-of-life index (environment + healthcare + employment) for all cities in the ${enLabel} macro-region. Top and bottom cities ranked.`,
    alternates: { canonical: `${EN_BASE}/quality-of-life/${macro.slug}` },
    openGraph: {
      title: `Quality of life · ${enLabel}`,
      description: `Composite QoL score by city in the ${enLabel} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function EnMacroRegionQolPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();

  const enLabel = EN_MACRO_LABEL[macro.slug] ?? macro.label;

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      region: c.region,
      department: c.department,
      qol: computeQualityOfLife(c),
    }));

  const sortedBest = [...cities].sort((a, b) => b.qol.score - a.qol.score);
  const topBest = sortedBest.slice(0, 15);
  const worst = [...cities].sort((a, b) => a.qol.score - b.qol.score).slice(0, 10);

  const n = cities.length || 1;
  const avgQol = Math.round((cities.reduce((s, c) => s + c.qol.score, 0) / n) * 10) / 10;
  const avgEnv = Math.round((cities.reduce((s, c) => s + c.qol.envScore, 0) / n) * 10) / 10;
  const avgHealth = Math.round((cities.reduce((s, c) => s + c.qol.healthScore, 0) / n) * 10) / 10;
  const avgJob = Math.round((cities.reduce((s, c) => s + c.qol.jobScore, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Quality of life", path: "/quality-of-life" },
    { name: enLabel, path: `/quality-of-life/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which cities have the best quality of life in the ${enLabel} area?`,
      a: topBest.length > 0
        ? `Top 3 by composite QoL index: ${topBest.slice(0, 3).map(c => `${c.name} (${c.qol.score}/10)`).join(", ")}.`
        : `No cities above 10,000 inhabitants are indexed for this macro-region.`,
    },
    {
      q: `What is the average quality-of-life score for ${enLabel}?`,
      a: `Average ${avgQol}/10. Breakdown: environment ${avgEnv}/10, healthcare ${avgHealth}/10, employment ${avgJob}/10 (10 = excellent on all dimensions).`,
    },
    {
      q: "How is the quality-of-life index calculated?",
      a: "Composite of three sub-indices: environment (air, noise, water, natural risks) ~35%, healthcare (GP access, specialists, A&E, pharmacies) ~30%, employment (unemployment, salaries, economic dynamism) ~35%. Score 0–10, 10 = excellent.",
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
          <Link href="/quality-of-life" className="hover:underline">Quality of life</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Quality of life — {enLabel}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Quality-of-life index restricted to the {cities.length} cities with more than 10,000 inhabitants
          in the {enLabel} macro-region. Composite of environment + healthcare + employment into a
          single 0–10 score.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} cities analysed</Badge>
          <Badge>Average: {avgQol}/10</Badge>
        </div>

        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Macro-region averages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { k: "Environment", v: avgEnv, hint: "Air · noise · water · natural risks" },
              { k: "Healthcare", v: avgHealth, hint: "GPs · specialists · A&E · pharmacies" },
              { k: "Employment", v: avgJob, hint: "Unemployment · salaries · economic mix" },
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
            All sub-scores: 10 = best outcome on that dimension.
          </p>
        </Card>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — best quality of life in {enLabel}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">QoL</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Env.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Health</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Jobs</th>
                </tr>
              </thead>
              <tbody>
                {topBest.map((c, i) => (
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
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{c.department}</td>
                    <td className={`px-3 py-2 text-right font-semibold tabular-nums ${QOL_LEVEL_COLOR[c.qol.level]}`}>
                      {c.qol.score.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right text-[var(--text-secondary)] tabular-nums hidden sm:table-cell">
                      {c.qol.envScore.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right text-[var(--text-secondary)] tabular-nums hidden sm:table-cell">
                      {c.qol.healthScore.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right text-[var(--text-secondary)] tabular-nums hidden md:table-cell">
                      {c.qol.jobScore.toFixed(1)}
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
              Bottom 10 — areas requiring most improvement
            </h2>
            <Card className="mt-4 overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                    <tr>
                      <th className="px-3 py-2 text-left">City</th>
                      <th className="px-3 py-2 text-right">QoL</th>
                      <th className="px-3 py-2 text-right hidden sm:table-cell">Env.</th>
                      <th className="px-3 py-2 text-right hidden sm:table-cell">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worst.map((c) => (
                      <tr key={c.slug} className="border-t border-[var(--border)]">
                        <td className="px-3 py-2">
                          <Link href={`/cities/${c.slug}`} className="text-[var(--text-primary)] hover:text-[var(--accent)]">
                            {c.name}
                          </Link>
                        </td>
                        <td className={`px-3 py-2 text-right font-semibold tabular-nums ${QOL_LEVEL_COLOR[c.qol.level]}`}>
                          {c.qol.score.toFixed(1)}
                        </td>
                        <td className="px-3 py-2 text-right text-[var(--text-secondary)] tabular-nums hidden sm:table-cell">
                          {c.qol.envScore.toFixed(1)}
                        </td>
                        <td className="px-3 py-2 text-right text-[var(--text-secondary)] tabular-nums hidden sm:table-cell">
                          {c.qol.healthScore.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        <Card className="mt-8">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Methodology note</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Sub-scores are derived from official French data (SSMSI, DGOS, INSEE, DARES) and
            calibrated so 10 = best outcome on every dimension. The composite QoL score weights
            environment ~35%, healthcare ~30%, employment ~35%. Only cities with 10,000+ inhabitants
            appear in this index. Cities below that threshold are in the full city profiles.
          </p>
        </Card>

        <div className="mt-6">
          <Link href="/quality-of-life" className="text-sm text-[var(--accent)] hover:underline">
            ← All macro-regions
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
