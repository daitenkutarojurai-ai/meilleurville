// EN port of FR F66 — Synthesis by administrative region.
//
// 18 SSG pages mirroring `/regions/[region]/synthese` for the English site.
// Reuses `getSynthesisRankings(CITIES_LIGHT)` (module-level cache, zero recompute) and
// supplies English labels at the display site per CLAUDE.md convention #6.

import { CITIES_LIGHT } from "@/lib/cities-light";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { regionToSlug, slugToRegion, REGION_EMOJIS } from "@/lib/regions";
import {
  getSynthesisRankings,
  SYNTHESIS_LEVEL_COLOR,
} from "@/lib/city-synthesis";
import type { SynthesisLevel } from "@/lib/city-synthesis";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; region: string }> };

const ALL_REGIONS = [...new Set(CITIES_SEED.map((c) => c.region))];

export function generateStaticParams() {
  return ALL_REGIONS.map((r) => ({ locale: "en", region: regionToSlug(r) }));
}

const EN_SYNTHESIS_LABEL: Record<SynthesisLevel, string> = {
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

const AXIS_KEYS = [
  "cadre-de-vie",
  "environnement",
  "sante",
  "emploi",
  "velo",
  "securite",
  "demographie",
  "services-publics",
] as const;

const AXIS_LABEL: Record<(typeof AXIS_KEYS)[number], { label: string; hint: string }> = {
  "cadre-de-vie": { label: "Quality of life", hint: "Mega-index" },
  "environnement": { label: "Env.", hint: "Air · noise · water · risks" },
  "sante": { label: "Health", hint: "GPs · specialists · A&E" },
  "emploi": { label: "Jobs", hint: "Unemployment · wages" },
  "velo": { label: "Cycling", hint: "Network · terrain" },
  "securite": { label: "Safety", hint: "Property · personal · night" },
  "demographie": { label: "Demo", hint: "Ageing · trajectory" },
  "services-publics": { label: "Services", hint: "Schools · admin · post" },
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: regionSlug } = await params;
  const region = slugToRegion(regionSlug, ALL_REGIONS);
  if (!region) return {};
  const count = CITIES_SEED.filter((c) => c.region === region).length;
  return {
    title: `${region} — 8-dimension city ranking | BestCitiesInFrance`,
    description: `Synthesis ranking of ${count} cities in ${region} across 8 data dimensions (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services). Convention: 10 = excellent.`,
    alternates: { canonical: `${EN_BASE}/regions/${regionSlug}/synthesis` },
    openGraph: {
      title: `Synthesis · ${region}`,
      description: `Cities of ${region} ranked across the 8 site data axes.`,
    },
  };
}

export default async function EnRegionSynthesisPage({ params }: Props) {
  const { region: regionSlug } = await params;
  const region = slugToRegion(regionSlug, ALL_REGIONS);
  if (!region) notFound();

  const rows = getSynthesisRankings(CITIES_LIGHT).filter((r) => r.region === region);
  if (rows.length === 0) notFound();

  const sorted = [...rows].sort((a, b) => b.synthesis.global - a.synthesis.global);
  const top = sorted.slice(0, Math.min(20, sorted.length));
  const bottom =
    sorted.length > 10
      ? [...rows]
          .sort((a, b) => a.synthesis.global - b.synthesis.global)
          .slice(0, Math.min(10, sorted.length - top.length))
      : [];

  const n = rows.length;
  const avgGlobal = Math.round((rows.reduce((s, c) => s + c.synthesis.global, 0) / n) * 10) / 10;
  const avgSpread = Math.round((rows.reduce((s, c) => s + c.synthesis.spread, 0) / n) * 10) / 10;

  const avgByAxis: Record<string, number> = {};
  for (const key of AXIS_KEYS) {
    const sum = rows.reduce((acc, c) => {
      const ax = c.synthesis.axes.find((a) => a.key === key);
      return acc + (ax?.score ?? 0);
    }, 0);
    avgByAxis[key] = Math.round((sum / n) * 10) / 10;
  }

  const regionDepts = new Set(rows.map((r) => r.department));
  const macros = MACRO_REGIONS.filter((m) => m.departments.some((d) => regionDepts.has(d)));

  const deptCounts = new Map<string, number>();
  for (const r of rows) deptCounts.set(r.department, (deptCounts.get(r.department) ?? 0) + 1);
  const topDepts = [...deptCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Regions", path: "/regions" },
    { name: region, path: `/regions/${regionSlug}` },
    { name: "Synthesis", path: `/regions/${regionSlug}/synthesis` },
  ]);

  const rankedAxes = AXIS_KEYS
    .map((k) => ({ k, label: AXIS_LABEL[k].label, v: avgByAxis[k] }))
    .sort((a, b) => b.v - a.v);

  const faq = faqJsonLd([
    {
      q: `Which cities of ${region} have the best overall profile?`,
      a:
        top.length > 0
          ? `Top 3 by synthesis (arithmetic mean of 8 normalised axes, 10 = excellent): ${top
              .slice(0, 3)
              .map((c) => `${c.name} (${c.synthesis.global}/10)`)
              .join(", ")}.`
          : `No referenced city for this region.`,
    },
    {
      q: `What is the average profile of cities in ${region}?`,
      a: `Across ${n} referenced ${n > 1 ? "cities" : "city"}, the average overall score is ${avgGlobal}/10. Average consistency (standard deviation between axes): ±${avgSpread}/10.`,
    },
    {
      q: `On which axis does ${region} stand out?`,
      a: `Strongest axis: ${rankedAxes[0].label} (${rankedAxes[0].v}/10). Most strained axis: ${rankedAxes[rankedAxes.length - 1].label} (${rankedAxes[rankedAxes.length - 1].v}/10).`,
    },
    {
      q: `How is this ranking calculated?`,
      a: `Synthesis: arithmetic mean of the 8 data-cluster composites (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services) normalised to a "10 = excellent" scale. Restricted to cities of ${region}.`,
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
          <Link href="/regions" className="hover:underline">Regions</Link> ·{" "}
          <Link href={`/regions/${regionSlug}`} className="hover:underline">{region}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden>{REGION_EMOJIS[region] ?? "🇫🇷"}</span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Synthesis — cities of {region}
          </h1>
        </div>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Synthesis ranking restricted to the {n} referenced {n > 1 ? "cities" : "city"} of {region}.
          All 8 data dimensions aggregated into a single 0-10 score, 10 = excellent.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{n} {n > 1 ? "cities" : "city"}</Badge>
          <Badge>Average overall: {avgGlobal}/10</Badge>
          <Badge>Consistency: ±{avgSpread}/10</Badge>
          {deptCounts.size > 0 && (
            <Badge>{deptCounts.size} {deptCounts.size > 1 ? "departments" : "department"}</Badge>
          )}
        </div>

        {/* Region average profile */}
        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Region average profile (8 axes)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AXIS_KEYS.map((k) => (
              <div
                key={k}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3"
              >
                <div className="text-xs text-[var(--text-tertiary)]">{AXIS_LABEL[k].label}</div>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {avgByAxis[k].toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">
                  {AXIS_LABEL[k].hint}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Convention: 10 = excellent. Arithmetic mean over the region&apos;s cities.
          </p>
        </Card>

        {/* Top */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          {top.length === sorted.length
            ? "All cities of the region"
            : `Top ${top.length} — most favourable profiles`}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Dept</th>
                  <th className="px-3 py-2 text-right">Overall</th>
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
                        href={`/cities/${c.slug}/synthesis`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden sm:table-cell text-xs">
                      {c.department}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.synthesis.level]}`}
                      >
                        {c.synthesis.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_SYNTHESIS_LABEL[c.synthesis.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      ±{c.synthesis.spread.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {EN_AXIS_LABEL[c.synthesis.strengths[0]?.label ?? ""] ?? c.synthesis.strengths[0]?.label}{" "}
                      {c.synthesis.strengths[0]?.score.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {EN_AXIS_LABEL[c.synthesis.tensions[0]?.label ?? ""] ?? c.synthesis.tensions[0]?.label}{" "}
                      {c.synthesis.tensions[0]?.score.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Bottom */}
        {bottom.length > 0 && (
          <>
            <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
              Top {bottom.length} — most strained profiles
            </h2>
            <Card className="mt-4 overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">City</th>
                      <th className="px-3 py-2 text-left hidden sm:table-cell">Dept</th>
                      <th className="px-3 py-2 text-right">Overall</th>
                      <th className="px-3 py-2 text-left hidden md:table-cell">Tension #1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bottom.map((c, i) => (
                      <tr key={c.slug} className="border-t border-[var(--border)]">
                        <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/cities/${c.slug}/synthesis`}
                            className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-[var(--text-secondary)] hidden sm:table-cell text-xs">
                          {c.department}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className="font-bold tabular-nums text-red-600">
                            {c.synthesis.global.toFixed(1)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                            /10
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                          {EN_AXIS_LABEL[c.synthesis.tensions[0]?.label ?? ""] ?? c.synthesis.tensions[0]?.label}{" "}
                          {c.synthesis.tensions[0]?.score.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {/* Department zoom — link back to /regions/[r] since dept synthesis EN doesn't exist yet */}
        {topDepts.length > 1 && (
          <>
            <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
              Department zoom
            </h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topDepts.map(([dept, count]) => {
                const deptSlug = dept
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[̀-ͯ]/g, "")
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "");
                return (
                  <Link
                    key={dept}
                    href={`/departments/${deptSlug}`}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow h-full">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        {dept}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">
                        {count} referenced {count > 1 ? "cities" : "city"}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Go further</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href={`/regions/${regionSlug}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                ← Region {region}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Overview + city ranking
              </div>
            </Card>
          </Link>
          <Link href="/overall-ranking" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                National overall ranking
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Universal 8-dimension ranking
              </div>
            </Card>
          </Link>
          <Link href="/compare-regions" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Compare two regions
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Side-by-side region profiles
              </div>
            </Card>
          </Link>
          {macros.slice(0, 3).map((m) => (
            <Link key={m.slug} href={`/overall-ranking/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {m.emoji} {EN_MACRO_LABEL[m.slug] ?? m.label}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Macro-region ranking
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
