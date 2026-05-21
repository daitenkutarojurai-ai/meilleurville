import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeCitySynthesis,
  SYNTHESIS_LEVEL_COLOR,
  SYNTHESIS_LEVEL_BG,
  type SynthesisLevel,
  type SynthesisAxis,
} from "@/lib/city-synthesis";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

// EN axis labels/hints/hrefs, keyed by the stable FR key from lib/city-synthesis.ts
const AXIS_EN: Record<SynthesisAxis["key"], { label: string; hint: string; href: (slug: string) => string }> = {
  "cadre-de-vie": {
    label: "Quality of life",
    hint: "Environment + health + employment mega-index",
    href: (slug) => `/cities/${slug}`,
  },
  environnement: {
    label: "Environment",
    hint: "Air · noise · water · natural risks",
    href: (slug) => `/cities/${slug}/air-quality`,
  },
  sante: {
    label: "Healthcare",
    hint: "GPs · specialists · A&E · pharmacies",
    href: (slug) => `/cities/${slug}/healthcare`,
  },
  emploi: {
    label: "Employment",
    hint: "Unemployment · wages · dynamism",
    href: (slug) => `/cities/${slug}/employment`,
  },
  velo: {
    label: "Cycling",
    hint: "Network · terrain · safety",
    href: (slug) => `/cities/${slug}/cycling`,
  },
  securite: {
    label: "Safety",
    hint: "Property · persons · night · women alone",
    href: (slug) => `/cities/${slug}/safety`,
  },
  demographie: {
    label: "Demographics",
    hint: "Ageing · youth share · trajectory",
    href: (slug) => `/cities/${slug}/demographics`,
  },
  "services-publics": {
    label: "Public services",
    hint: "Schools · post office · library · town hall",
    href: (slug) => `/cities/${slug}/public-services`,
  },
};

const LEVEL_LABEL_EN: Record<SynthesisLevel, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Average",
  tendu: "Stretched",
};

function axisLabelEN(axis: SynthesisAxis): string {
  return AXIS_EN[axis.key]?.label ?? axis.label;
}

function composeSignatureEN(
  name: string,
  global: number,
  spread: number,
  strengths: SynthesisAxis[],
  tensions: SynthesisAxis[],
): string {
  const top = axisLabelEN(strengths[0]).toLowerCase();
  const bottom = axisLabelEN(tensions[0]).toLowerCase();
  const profile =
    global >= 7 ? "very favourable" : global >= 5.5 ? "balanced" : global >= 4 ? "average" : "stretched";
  const coherence =
    spread <= 1.2
      ? "consistent across all dimensions"
      : spread <= 2
        ? "mixed profile"
        : "sharply contrasted — strong highs and real weaknesses";

  if (global >= 7 && spread <= 1.2) {
    return `${name} presents a ${profile} profile, ${coherence}. No major weak point.`;
  }
  if (global <= 4) {
    return `${name} shows a ${profile} profile with the main pressure on ${bottom}. ${coherence.charAt(0).toUpperCase() + coherence.slice(1)}.`;
  }
  return `${name} offers a ${profile} profile (global ${global}/10), driven by ${top}; main tension on ${bottom}. ${coherence.charAt(0).toUpperCase() + coherence.slice(1)}.`;
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score * 10));
  const color =
    score >= 7.5 ? "bg-emerald-500" : score >= 5.5 ? "bg-lime-500" : score >= 4 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
      <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} aria-hidden="true" />
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const s = computeCitySynthesis(city);
  const topAxis = axisLabelEN(s.strengths[0]).toLowerCase();
  const bottomAxis = axisLabelEN(s.tensions[0]).toLowerCase();
  return {
    title: `${city.name} overview 2026 — all 8 indicators at a glance`,
    description: `${city.name} (${city.department}) synthesis across 8 axes: global ${s.global}/10 (${LEVEL_LABEL_EN[s.level].toLowerCase()}). Strength: ${topAxis}, tension: ${bottomAxis}. Deterministic, no invented numbers.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/overview` },
    openGraph: {
      title: `${city.name} overview — 8-axis data profile`,
      description: `Quality of life, environment, healthcare, employment, cycling, safety, demographics, public services — all in one screen.`,
    },
  };
}

export default async function EnCityOverviewPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const s = computeCitySynthesis(city);
  const signature = composeSignatureEN(city.name, s.global, s.spread, s.strengths, s.tensions);

  // Map axes to EN labels/hrefs
  const axesEN = s.axes.map((a) => ({
    ...a,
    labelEN: AXIS_EN[a.key]?.label ?? a.label,
    hintEN: AXIS_EN[a.key]?.hint ?? a.hint,
    hrefEN: AXIS_EN[a.key]?.href(slug) ?? `/cities/${slug}`,
  }));
  const strengthsEN = s.strengths.map((a) => ({
    ...a,
    labelEN: AXIS_EN[a.key]?.label ?? a.label,
    hrefEN: AXIS_EN[a.key]?.href(slug) ?? `/cities/${slug}`,
  }));
  const tensionsEN = s.tensions.map((a) => ({
    ...a,
    labelEN: AXIS_EN[a.key]?.label ?? a.label,
    hrefEN: AXIS_EN[a.key]?.href(slug) ?? `/cities/${slug}`,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "BestCitiesInFrance", item: EN_BASE },
          { "@type": "ListItem", position: 2, name: "Cities", item: `${EN_BASE}/cities` },
          { "@type": "ListItem", position: 3, name: city.name, item: `${EN_BASE}/cities/${slug}` },
          { "@type": "ListItem", position: 4, name: "Overview", item: `${EN_BASE}/cities/${slug}/overview` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What is the overall profile of ${city.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${city.name} (${city.department}) scores ${s.global}/10 on the synthesis global (10 = excellent). ${signature} Profile consistency (std dev between axes): ${s.spread}.`,
            },
          },
          {
            "@type": "Question",
            name: `What are the strengths of ${city.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Top 3 axes: ${strengthsEN.map((a) => `${a.labelEN} (${a.score}/10)`).join(", ")}. These dimensions pull the profile upward.`,
            },
          },
          {
            "@type": "Question",
            name: `What are the weak points of ${city.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Top 3 tensions: ${tensionsEN.map((a) => `${a.labelEN} (${a.score}/10)`).join(", ")}. Worth investigating before committing to a move.`,
            },
          },
          {
            "@type": "Question",
            name: "How is the overview score calculated?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Arithmetic mean of 8 composite data-cluster scores (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services). All axes normalised to a '10 = excellent' convention for a unified panorama. The calculation is deterministic — no invented numbers.",
            },
          },
        ],
      },
    ],
  };

  const borderAccent = SYNTHESIS_LEVEL_BG[s.level].split(" ")[0].replace("bg-", "border-l-").replace("-50", "-500");

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>{" · "}
          <Link href="/cities" className="hover:underline">Cities</Link>{" · "}
          <Link href={`/cities/${slug}`} className="hover:underline">{city.name}</Link>{" · "}
          <span>Overview</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {city.name} — full overview
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          All 8 data-cluster dimensions on one screen: environment, healthcare, employment,
          quality of life, cycling, safety, demographics, public services. Convention: 10 = excellent.
          Click an axis to open the full methodology.
        </p>

        {/* Composite hero */}
        <div className={`mt-6 rounded-2xl border ${SYNTHESIS_LEVEL_BG[s.level]} border-l-4 ${borderAccent} p-5`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Global score</h2>
            <span className={`text-xs font-bold uppercase ${SYNTHESIS_LEVEL_COLOR[s.level]}`}>
              {LEVEL_LABEL_EN[s.level]} profile
            </span>
          </div>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-4xl font-bold tabular-nums text-[var(--text-primary)]">
              {s.global.toFixed(1)}
              <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              Consistency: std dev {s.spread} between axes
            </span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{signature}</p>
        </div>

        {/* 8 axes */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">The 8 axes in detail</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Sorted highest to lowest. Each axis links to its full methodology page.
        </p>
        <div className="mt-4 space-y-2">
          {axesEN.map((a) => (
            <Link
              key={a.key}
              href={a.hrefEN}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all p-4 group"
            >
              <div className="flex items-center justify-between mb-2 gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {a.labelEN}
                  </span>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{a.hintEN}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold tabular-nums text-[var(--text-primary)]">
                    {a.score.toFixed(1)}
                    <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                  </div>
                  <div className={`text-[10px] font-bold uppercase ${SYNTHESIS_LEVEL_COLOR[a.level]}`}>
                    {LEVEL_LABEL_EN[a.level]}
                  </div>
                </div>
              </div>
              <ScoreBar score={a.score} />
            </Link>
          ))}
        </div>

        {/* Strengths + Tensions */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-200 bg-[var(--bg-surface)] p-5">
            <h3 className="text-sm font-semibold text-emerald-700 mb-3 uppercase tracking-wide">
              ✓ Strengths
            </h3>
            <ul className="space-y-2 text-sm">
              {strengthsEN.map((a) => (
                <li key={a.key} className="flex items-center justify-between gap-3">
                  <Link href={a.hrefEN} className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-medium">
                    {a.labelEN}
                  </Link>
                  <span className={`font-bold tabular-nums text-sm ${SYNTHESIS_LEVEL_COLOR[a.level]}`}>
                    {a.score.toFixed(1)}/10
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-red-200 bg-[var(--bg-surface)] p-5">
            <h3 className="text-sm font-semibold text-red-700 mb-3 uppercase tracking-wide">
              ⚠ Watch out for
            </h3>
            <ul className="space-y-2 text-sm">
              {tensionsEN.map((a) => (
                <li key={a.key} className="flex items-center justify-between gap-3">
                  <Link href={a.hrefEN} className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-medium">
                    {a.labelEN}
                  </Link>
                  <span className={`font-bold tabular-nums text-sm ${SYNTHESIS_LEVEL_COLOR[a.level]}`}>
                    {a.score.toFixed(1)}/10
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Methodology</h2>
        <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            The overview aggregates 8 data-cluster composites.{" "}
            <strong className="text-[var(--text-primary)]">Unified convention:</strong> all axes
            normalised to <strong>10 = excellent</strong> for direct comparison and arithmetic mean.
            Clusters originally on a &ldquo;10 = worse&rdquo; scale (environment, healthcare, employment,
            safety, demographics, public services) are flipped via{" "}
            <code className="px-1 mx-1 rounded bg-[var(--bg-elevated)] text-xs">10 − composite</code>.
            Cycling and quality of life are already oriented positively.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            <strong className="text-[var(--text-primary)]">Consistency (std dev {s.spread}):</strong>{" "}
            measures whether the profile is uniform (≤ 1.2 = coherent) or
            contrasted (≥ 2 = strong highs and real weaknesses). An average city
            across all dimensions is different from an excellent city on 4 and weak on 4
            others — the mean alone doesn&apos;t tell the full story.
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Deterministic calculation — no invented numbers. Sources for each cluster are
            documented on their respective sub-pages.
          </p>
        </div>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Explore further</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/cities/${slug}/honest-review`} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <span aria-hidden>🧭</span><span>Honest review</span>
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">Profile-by-profile editorial verdict</div>
          </Link>
          <Link href={`/cities/${slug}`} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-[var(--text-primary)]">City profile</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">Scores, description, all sub-pages</div>
          </Link>
          <Link href={`/cities/${slug}/cost-of-living`} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-[var(--text-primary)]">Cost of living</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">Rents, purchase prices, monthly budget</div>
          </Link>
          <Link href="/rankings" className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow">
            <div className="text-sm font-semibold text-[var(--text-primary)]">Rankings</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">All ranking categories</div>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
