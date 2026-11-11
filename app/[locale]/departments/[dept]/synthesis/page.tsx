import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, slugToDept, getAllDepartments } from "@/lib/dept-slug";
import {
  computeCitySynthesis,
  SYNTHESIS_LEVEL_COLOR,
  type SynthesisLevel,
} from "@/lib/city-synthesis";
import { faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";
import { clampMeta, fitTitle } from "@/lib/brand";

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
    title: fitTitle(`${dept} cities ranked — 8-dimension profile`),
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

  const tableShell = "rounded-2xl bg-white overflow-hidden";
  const theadCls = "bg-[#EEF2FF] text-xs uppercase tracking-wide text-[#4338CA]";

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--accent)] hover:underline">Home</Link> ·{" "}
            <Link href="/departments" className="hover:text-[var(--accent)] hover:underline">Departments</Link> ·{" "}
            <Link href={`/departments/${deptSlug}`} className="hover:text-[var(--accent)] hover:underline">{dept}</Link>
          </nav>
          <div className="mt-5 flex items-center gap-3">
            <EmojiBadge emoji="🧭" tone={toneFor(deptSlug)} />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Synthesis
            </span>
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            <span className="font-display gradient-text-anim italic">{dept}</span> — cities ranked on 8 dimensions
          </h1>
          <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
            The {n} cit{n > 1 ? "ies" : "y"} we cover in the {dept} department, with the eight data
            dimensions of the site folded into a single 0-10 score. 10 = excellent, on every axis.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {[
              `${n} cit${n > 1 ? "ies" : "y"}`,
              `Average score: ${avgGlobal}/10`,
              `Consistency: ±${avgSpread}/10`,
            ].map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full bg-white/90 ring-1 ring-[#C7D2FE] px-3 py-1 font-semibold text-[#4338CA] tabular-nums"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Department average */}
      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold gradient-text mb-4">
            Department average, axis by axis
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AXIS_KEYS.map((k) => (
              <div
                key={k}
                className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-[#4338CA]">{AXIS_EN[k].label}</div>
                <div className="text-2xl font-bold tabular-nums text-[#312E81] mt-1">
                  {avgByAxis[k].toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-1 leading-tight">
                  {AXIS_EN[k].hint}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-3">
            Convention: 10 = excellent. Arithmetic mean across the cities of the department.
          </p>
        </div>
      </section>

      {/* Top */}
      <section className="band band-sky py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold gradient-text">
            {top.length === sorted.length
              ? "Every city in the department"
              : `Top ${top.length} — strongest profiles`}
          </h2>
          <div className={`mt-4 ${tableShell} shadow-[0_12px_32px_-20px_rgba(8,145,178,0.6)]`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={theadCls}>
                  <tr>
                    <th className="px-3 py-2.5 text-left">#</th>
                    <th className="px-3 py-2.5 text-left">City</th>
                    <th className="px-3 py-2.5 text-right">Overall</th>
                    <th className="px-3 py-2.5 text-right hidden sm:table-cell">Consistency</th>
                    <th className="px-3 py-2.5 text-left hidden md:table-cell">Top strength</th>
                    <th className="px-3 py-2.5 text-left hidden md:table-cell">Main tension</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((c, i) => (
                    <tr key={c.slug} className="border-t border-[#E0E7FF] hover:bg-[#F5F7FF] transition-colors">
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                            i < 3 ? `grad-head-${i}` : "bg-[#EEF2FF] text-[#4338CA]"
                          }`}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/cities/${c.slug}/synthesis`}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[c.synthesis.level]}`}>
                          {c.synthesis.global.toFixed(1)}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                          {EN_LEVEL_LABEL[c.synthesis.level]}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                        ±{c.synthesis.spread.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                        {en(c.synthesis.strengths[0]?.label)} {c.synthesis.strengths[0]?.score.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                        {en(c.synthesis.tensions[0]?.label)} {c.synthesis.tensions[0]?.score.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom (only if enough villes) */}
      {bottom.length > 0 && (
        <section className="band band-pink py-10 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold gradient-text">
              Bottom {bottom.length} — most strained profiles
            </h2>
            <div className={`mt-4 ${tableShell} shadow-[0_12px_32px_-20px_rgba(219,39,119,0.5)]`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FDF2F8] text-xs uppercase tracking-wide text-[#BE185D]">
                    <tr>
                      <th className="px-3 py-2.5 text-left">#</th>
                      <th className="px-3 py-2.5 text-left">City</th>
                      <th className="px-3 py-2.5 text-right">Overall</th>
                      <th className="px-3 py-2.5 text-left hidden md:table-cell">Main tension</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bottom.map((c, i) => (
                      <tr key={c.slug} className="border-t border-[#FCE7F3] hover:bg-[#FDF2F8] transition-colors">
                        <td className="px-3 py-2.5">
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#FCE7F3] px-1.5 text-[11px] font-bold tabular-nums text-[#BE185D]">
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <Link
                            href={`/cities/${c.slug}/synthesis`}
                            className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <span className="font-bold tabular-nums text-red-600">
                            {c.synthesis.global.toFixed(1)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                        </td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)] hidden md:table-cell text-xs">
                          {en(c.synthesis.tensions[0]?.label)} {c.synthesis.tensions[0]?.score.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cross-links */}
      <section className="band band-lilac py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold gradient-text">Next</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { href: `/departments/${deptSlug}`, emoji: "📍", title: `← ${dept} department`, sub: "Overview and city list" },
              { href: `/departments/${deptSlug}/tax`, emoji: "💰", title: `Property tax in ${dept}`, sub: "Taxe foncière, THRS, transfer duties" },
              { href: "/overall-ranking", emoji: "🏆", title: "National ranking", sub: `All ${CITIES_SEED.length} cities on the same 8 axes` },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-transparent hover:ring-[#C4B5FD] shadow-[0_10px_26px_-18px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 transition-all"
              >
                <EmojiBadge emoji={l.emoji} tone={toneFor(l.href)} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{l.title}</div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{l.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget locale="en" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
