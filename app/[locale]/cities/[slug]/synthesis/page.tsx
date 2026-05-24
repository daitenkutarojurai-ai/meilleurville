import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeCitySynthesis,
  SYNTHESIS_LEVEL_COLOR,
  SYNTHESIS_LEVEL_BG,
} from "@/lib/city-synthesis";
import type { SynthesisLevel } from "@/lib/city-synthesis";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

const EN_SYNTHESIS_LABEL: Record<SynthesisLevel, string> = {
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

const EN_AXIS_HINT: Record<string, string> = {
  "Cadre de vie": "Mega-index: env + healthcare + employment",
  "Environnement": "Air · noise · water · risks",
  "Santé": "GPs · specialists · A&E · pharmacies",
  "Emploi": "Unemployment · wages · economic dynamism",
  "Vélo": "Cycle network · terrain · safety",
  "Sécurité": "Property crime · personal safety · night",
  "Démographie": "Ageing · youth · population trajectory",
  "Services publics": "Admin · schools · transport",
};

function enAxisHref(key: string, slug: string): string {
  const map: Record<string, string> = {
    "cadre-de-vie": `/cities/${slug}`,
    "environnement": `/cities/${slug}/air-quality`,
    "sante": `/cities/${slug}/healthcare`,
    "emploi": `/cities/${slug}/employment`,
    "velo": `/cities/${slug}/cycling`,
    "securite": `/cities/${slug}/safety`,
    "demographie": `/cities/${slug}/demographics`,
    "services-publics": `/cities/${slug}/public-services`,
  };
  return map[key] ?? `/cities/${slug}`;
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score * 10));
  const color =
    score >= 7.5
      ? "bg-emerald-500"
      : score >= 5.5
        ? "bg-lime-500"
        : score >= 4
          ? "bg-amber-500"
          : "bg-red-500";
  return (
    <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
      <div
        className={`h-full ${color} transition-all`}
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const s = computeCitySynthesis(city);
  const topAxis = EN_AXIS_LABEL[s.strengths[0]?.label ?? ""] ?? "";
  const bottomAxis = EN_AXIS_LABEL[s.tensions[0]?.label ?? ""] ?? "";
  return {
    title: `${city.name} — 8-dimension city profile | BestCitiesInFrance`,
    description: `${city.name} (${city.department}) composite synthesis across 8 dimensions: overall ${s.global.toFixed(1)}/10 (${EN_SYNTHESIS_LABEL[s.level].toLowerCase()}). Strength: ${topAxis}, tension: ${bottomAxis}. ${s.signature}`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/synthesis` },
    openGraph: {
      title: `${city.name} city profile — 8 dimensions`,
      description: `Environment, healthcare, employment, quality of life, cycling, safety, demographics, public services — all in one view.`,
    },
  };
}

export default async function CitySynthesisENPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const s = computeCitySynthesis(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${city.slug}` },
    { name: "Full profile", path: `/cities/${city.slug}/synthesis` },
  ]);

  const faq = faqJsonLd([
    {
      q: `What is the overall profile of ${city.name}?`,
      a: `${city.name} (${city.department}) scores ${s.global.toFixed(1)}/10 overall across 8 dimensions (10 = excellent). ${s.signature} Profile consistency (standard deviation between axes): ±${s.spread.toFixed(1)}/10.`,
    },
    {
      q: `What are the strengths of ${city.name}?`,
      a: `Top 3 dimensions: ${s.strengths.map((a) => `${EN_AXIS_LABEL[a.label] ?? a.label} (${a.score.toFixed(1)}/10)`).join(", ")}. These dimensions pull the overall profile upward.`,
    },
    {
      q: `What are the tensions or weaknesses of ${city.name}?`,
      a: `Bottom 3 dimensions: ${s.tensions.map((a) => `${EN_AXIS_LABEL[a.label] ?? a.label} (${a.score.toFixed(1)}/10)`).join(", ")}. These are worth examining carefully before relocating here.`,
    },
    {
      q: `How is the composite score calculated?`,
      a: `Arithmetic mean of 8 data-cluster composites (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services). All dimensions normalised to a "10 = excellent" scale for unified comparison. The calculation is deterministic and reproducible.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link> ·{" "}
          <Link href="/cities" className="hover:underline">Cities</Link> ·{" "}
          <Link href={`/cities/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {city.name} — full 8-dimension profile
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          All 8 data dimensions in one view — environment, healthcare, employment,
          quality of life, cycling, safety, demographics, public services. Unified scale:
          10 = excellent. Click any dimension for the detailed methodology.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>8-dimension synthesis</Badge>
          <Badge>{city.region}</Badge>
        </div>

        <Card className={`mt-6 border-l-4 ${SYNTHESIS_LEVEL_BG[s.level].replace("bg-", "border-l-").replace("-50", "-500").split(" ")[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Overall score</h2>
            <span className={`text-xs font-bold uppercase ${SYNTHESIS_LEVEL_COLOR[s.level]}`}>
              {EN_SYNTHESIS_LABEL[s.level]} profile
            </span>
          </div>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-4xl font-bold tabular-nums text-[var(--text-primary)]">
              {s.global.toFixed(1)}
              <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              Consistency: std dev ±{s.spread.toFixed(1)}/10 between dimensions
            </span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{s.signature}</p>
        </Card>

        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">All 8 dimensions</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Sorted from highest to lowest score. Each dimension links to its detailed methodology page.
        </p>
        <div className="mt-4 space-y-2">
          {s.axes.map((a) => (
            <Link
              key={a.key}
              href={enAxisHref(a.key, city.slug)}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all p-4 group"
            >
              <div className="flex items-center justify-between mb-2 gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {EN_AXIS_LABEL[a.label] ?? a.label}
                  </span>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {EN_AXIS_HINT[a.label] ?? a.hint}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold tabular-nums text-[var(--text-primary)]">
                    {a.score.toFixed(1)}
                    <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                  </div>
                  <div className={`text-[10px] font-bold uppercase ${SYNTHESIS_LEVEL_COLOR[a.level]}`}>
                    {EN_SYNTHESIS_LABEL[a.level]}
                  </div>
                </div>
              </div>
              <ScoreBar score={a.score} />
            </Link>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="border-emerald-200">
            <h3 className="text-sm font-semibold text-emerald-700 mb-3 uppercase tracking-wide">
              ✓ Key strengths
            </h3>
            <ul className="space-y-2 text-sm">
              {s.strengths.map((a) => (
                <li key={a.key} className="flex items-center justify-between gap-3">
                  <Link href={enAxisHref(a.key, city.slug)} className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-medium">
                    {EN_AXIS_LABEL[a.label] ?? a.label}
                  </Link>
                  <span className={`font-bold tabular-nums text-sm ${SYNTHESIS_LEVEL_COLOR[a.level]}`}>
                    {a.score.toFixed(1)}/10
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="border-red-200">
            <h3 className="text-sm font-semibold text-red-700 mb-3 uppercase tracking-wide">
              ⚠ Key tensions
            </h3>
            <ul className="space-y-2 text-sm">
              {s.tensions.map((a) => (
                <li key={a.key} className="flex items-center justify-between gap-3">
                  <Link href={enAxisHref(a.key, city.slug)} className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-medium">
                    {EN_AXIS_LABEL[a.label] ?? a.label}
                  </Link>
                  <span className={`font-bold tabular-nums text-sm ${SYNTHESIS_LEVEL_COLOR[a.level]}`}>
                    {a.score.toFixed(1)}/10
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-8">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Methodology</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            The composite synthesis averages 8 data-cluster composites from the site&apos;s
            independent engines. Unified convention: all axes normalised to 10 = excellent.
            Clusters originally measured on a &quot;10 = worst&quot; scale (environment,
            healthcare, employment, safety, demographics, public services) are inverted
            via <code className="px-1 mx-0.5 rounded bg-[var(--bg-elevated)] text-xs">10 − composite</code>.
            Cycling and quality of life are already positive-direction. The calculation is
            deterministic and reproducible — no invented figures.
          </p>
        </Card>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link href={`/cities/${city.slug}`} className="text-sm text-[var(--accent)] hover:underline">
            ← Back to {city.name}
          </Link>
          <Link href="/overall-ranking" className="text-sm text-[var(--text-tertiary)] hover:underline">
            National overall ranking →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
