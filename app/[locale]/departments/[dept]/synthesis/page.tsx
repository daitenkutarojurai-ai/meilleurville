import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, slugToDept, getAllDepartments } from "@/lib/dept-slug";
import {
  computeCitySynthesis,
  SYNTHESIS_LEVEL_COLOR,
  type SynthesisLevel,
} from "@/lib/city-synthesis";
import { faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";
import { clampMeta } from "@/lib/brand";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; dept: string }> };

export function generateStaticParams() {
  return getAllDepartments().map((d) => ({ locale: "en", dept: deptToSlug(d) }));
}

// The synthesis engine is FR-labelled — it is the FR site's source of truth.
// Only the labels are translated here; every number comes straight from
// `computeCitySynthesis`, so a city shows the same score on both locales.
const EN_LEVEL_LABEL: Record<SynthesisLevel, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Moderate",
  tendu: "Strained",
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

type AxisKey = (typeof AXIS_KEYS)[number];

const AXIS_EN: Record<AxisKey, { label: string; hint: string }> = {
  "cadre-de-vie": { label: "Quality of life", hint: "Mega-index" },
  environnement: { label: "Environment", hint: "Air · noise · water · risks" },
  sante: { label: "Healthcare", hint: "GPs · specialists · A&E" },
  emploi: { label: "Employment", hint: "Unemployment · wages" },
  velo: { label: "Cycling", hint: "Network · terrain" },
  securite: { label: "Safety", hint: "Property · personal · night" },
  demographie: { label: "Demographics", hint: "Ageing · trajectory" },
  "services-publics": { label: "Public services", hint: "Schools · post · town hall" },
};

// Axis labels as the FR engine emits them, for the per-city strength/tension
// columns (those come back as display strings, not keys).
const AXIS_LABEL_EN: Record<string, string> = {
  "Cadre de vie": "Quality of life",
  Environnement: "Environment",
  Santé: "Healthcare",
  Emploi: "Employment",
  Vélo: "Cycling",
  Sécurité: "Safety",
  Démographie: "Demographics",
  "Services publics": "Public services",
};

const en = (frLabel: string | undefined) => (frLabel ? AXIS_LABEL_EN[frLabel] ?? frLabel : "");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dept: deptSlug } = await params;
  const dept = slugToDept(deptSlug);
  if (!dept) return {};
  const count = CITIES_SEED.filter((c) => c.department === dept).length;
  if (count === 0) return {};
  return {
    title: `${dept} cities ranked — 8-dimension profile`,
    description: clampMeta(
      `The ${count} cit${count > 1 ? "ies" : "y"} of the ${dept} department ranked across 8 data dimensions: environment, healthcare, employment, quality of life, cycling, safety, demographics, public services. 10 = excellent.`,
    ),
    alternates: pathAlternatesEn(`/departements/${deptSlug}/synthese`, `/departments/${deptSlug}/synthesis`),
    openGraph: {
      // Un openGraph de page remplace celui hérité de la racine : sans
      // `images`, la carte sociale disparaît au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `${dept} — 8-dimension city profile`,
      description: `Cities of the ${dept} department ranked on the eight data axes of the site.`,
    },
  };
}

export default async function EnDeptSynthesisPage({ params }: Props) {
  const { dept: deptSlug } = await params;
  const dept = slugToDept(deptSlug);
  if (!dept) notFound();

  const cities = CITIES_SEED.filter((c) => c.department === dept).map((c) => ({
    slug: c.slug,
    name: c.name,
    synthesis: computeCitySynthesis(c),
  }));
  if (cities.length === 0) notFound();

  // Same slicing rules as the FR twin, so both locales show the same tables.
  const sorted = [...cities].sort((a, b) => b.synthesis.global - a.synthesis.global);
  const top = sorted.slice(0, Math.min(15, sorted.length));
  const bottom =
    sorted.length > 8
      ? [...cities]
          .sort((a, b) => a.synthesis.global - b.synthesis.global)
          .slice(0, Math.min(10, sorted.length - top.length))
      : [];

  const n = cities.length;
  const avgGlobal = Math.round((cities.reduce((s, c) => s + c.synthesis.global, 0) / n) * 10) / 10;
  const avgSpread = Math.round((cities.reduce((s, c) => s + c.synthesis.spread, 0) / n) * 10) / 10;

  const avgByAxis: Record<string, number> = {};
  for (const key of AXIS_KEYS) {
    const sum = cities.reduce((acc, c) => {
      const ax = c.synthesis.axes.find((a) => a.key === key);
      return acc + (ax?.score ?? 0);
    }, 0);
    avgByAxis[key] = Math.round((sum / n) * 10) / 10;
  }
  const rankedAxes = AXIS_KEYS.map((k) => ({ label: AXIS_EN[k].label, v: avgByAxis[k] })).sort(
    (a, b) => b.v - a.v,
  );

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
      { "@type": "ListItem", position: 2, name: "Departments", item: `${EN_BASE}/departments` },
      { "@type": "ListItem", position: 3, name: dept, item: `${EN_BASE}/departments/${deptSlug}` },
      { "@type": "ListItem", position: 4, name: "8-dimension profile", item: `${EN_BASE}/departments/${deptSlug}/synthesis` },
    ],
  };

  const faq = faqJsonLd([
    {
      q: `Which cities in ${dept} have the best overall profile?`,
      a: `Top ${Math.min(3, top.length)} by the synthesis score (the mean of 8 normalised axes, 10 = excellent): ${top
        .slice(0, 3)
        .map((c) => `${c.name} (${c.synthesis.global.toFixed(1)}/10)`)
        .join(", ")}.`,
    },
    {
      q: `What does the average city in ${dept} look like?`,
      a: `Across the ${n} cit${n > 1 ? "ies" : "y"} we cover, the average synthesis score is ${avgGlobal}/10. Average consistency between axes (standard deviation) is ±${avgSpread}/10 — the lower that figure, the more even a city's profile.`,
    },
    {
      q: `What is ${dept} strongest and weakest at?`,
      a: `Strongest axis: ${rankedAxes[0].label} (${rankedAxes[0].v}/10). Most strained: ${rankedAxes[rankedAxes.length - 1].label} (${rankedAxes[rankedAxes.length - 1].v}/10).`,
    },
    {
      q: `How is this ranking calculated?`,
      a: `Each city gets a composite score on eight data clusters (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services), all normalised so that 10 = excellent. The synthesis score is their arithmetic mean. This page restricts the ranking to ${dept}.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>{" · "}
          <Link href="/departments" className="hover:underline">Departments</Link>{" · "}
          <Link href={`/departments/${deptSlug}`} className="hover:underline">{dept}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {dept} — cities ranked on 8 dimensions
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          The {n} cit{n > 1 ? "ies" : "y"} we cover in the {dept} department, with the eight data
          dimensions of the site folded into a single 0-10 score. 10 = excellent, on every axis.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{n} cit{n > 1 ? "ies" : "y"}</Badge>
          <Badge>Average score: {avgGlobal}/10</Badge>
          <Badge>Consistency: ±{avgSpread}/10</Badge>
        </div>

        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Department average, axis by axis
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AXIS_KEYS.map((k) => (
              <div key={k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                <div className="text-xs text-[var(--text-tertiary)]">{AXIS_EN[k].label}</div>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {avgByAxis[k].toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">
                  {AXIS_EN[k].hint}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Convention: 10 = excellent. Arithmetic mean across the cities of the department.
          </p>
        </Card>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          {top.length === sorted.length
            ? "Every city in the department"
            : `Top ${top.length} — strongest profiles`}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-right">Overall</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Consistency</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Top strength</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">Main tension</th>
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
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.synthesis.level]}`}>
                        {c.synthesis.global.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_LEVEL_LABEL[c.synthesis.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      ±{c.synthesis.spread.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {en(c.synthesis.strengths[0]?.label)} {c.synthesis.strengths[0]?.score.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                      {en(c.synthesis.tensions[0]?.label)} {c.synthesis.tensions[0]?.score.toFixed(1)}
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
              Bottom {bottom.length} — most strained profiles
            </h2>
            <Card className="mt-4 overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">City</th>
                      <th className="px-3 py-2 text-right">Overall</th>
                      <th className="px-3 py-2 text-left hidden md:table-cell">Main tension</th>
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
                        <td className="px-3 py-2 text-right">
                          <span className="font-bold tabular-nums text-red-600">
                            {c.synthesis.global.toFixed(1)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                        </td>
                        <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                          {en(c.synthesis.tensions[0]?.label)} {c.synthesis.tensions[0]?.score.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Next</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href={`/departments/${deptSlug}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">← {dept} department</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Overview and city list</div>
            </Card>
          </Link>
          <Link href={`/departments/${deptSlug}/tax`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Property tax in {dept}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Taxe foncière, THRS, transfer duties</div>
            </Card>
          </Link>
          <Link href="/overall-ranking" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">National ranking</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">All 540 cities on the same 8 axes</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
