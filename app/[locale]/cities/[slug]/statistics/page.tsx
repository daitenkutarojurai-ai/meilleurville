import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeEmploymentMarket } from "@/lib/employment-market";
import { computeDemography } from "@/lib/demography";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

type PopBucket = { label: string; hint: string; emoji: string };

function popBucket(pop: number | null): PopBucket {
  if (pop == null) return { label: "population not reported", hint: "", emoji: "📍" };
  if (pop >= 500_000) return { label: "large metropolis", hint: "> 500,000 residents", emoji: "🏙️" };
  if (pop >= 200_000) return { label: "regional metropolis", hint: "200,000 – 500,000 residents", emoji: "🌆" };
  if (pop >= 100_000) return { label: "large city", hint: "100,000 – 200,000 residents", emoji: "🏢" };
  if (pop >= 50_000) return { label: "mid-sized city", hint: "50,000 – 100,000 residents", emoji: "🏘️" };
  if (pop >= 20_000) return { label: "small city", hint: "20,000 – 50,000 residents", emoji: "🏡" };
  if (pop >= 5_000) return { label: "market town", hint: "5,000 – 20,000 residents", emoji: "🏡" };
  return { label: "village", hint: "< 5,000 residents", emoji: "🏡" };
}

type Tone = "high" | "good" | "median" | "low" | "very-low";

// Département median net wage (INSEE DADS) — brackets aligned with
// SALARY_HIGH/GOOD/LOW/VERY_LOW_DEPTS from lib/employment-market.ts.
function salaryBracket(score: number): { range: string; note: string; tone: Tone } {
  if (score <= 1.5) return { range: "> €2,400/month net", note: "above the national median — Greater Paris suburbs", tone: "high" };
  if (score <= 3) return { range: "€2,100 – €2,300/month net", note: "slightly above the national median", tone: "good" };
  if (score <= 5.5) return { range: "≈ €2,100/month net", note: "close to the national median", tone: "median" };
  if (score <= 7) return { range: "€1,850 – €1,950/month net", note: "below the national median", tone: "low" };
  return { range: "< €1,850/month net", note: "structurally low — constrained purchasing power", tone: "very-low" };
}

// Département unemployment rate (INSEE Q4 2024) — brackets aligned with
// UNEMP_VERY_LOW/LOW/HIGH/VERY_HIGH from lib/employment-market.ts.
function unemploymentBracket(score: number): { range: string; note: string; tone: Tone } {
  if (score <= 1.5) return { range: "< 5.5 %", note: "very low — hiring tension in several sectors", tone: "low" };
  if (score <= 3) return { range: "5.5 – 7 %", note: "below the national average (7.3 %)", tone: "good" };
  if (score <= 5.5) return { range: "7 – 8 %", note: "close to the national average", tone: "median" };
  if (score <= 7.5) return { range: "8 – 10 %", note: "above the national average", tone: "high" };
  return { range: "> 10 %", note: "very high (or overseas department under chronic tension)", tone: "very-low" };
}

// Département ageing (INSEE RP) — brackets aligned with ageingRisk
// (AGEING_VERY_HIGH/HIGH/LOW/VERY_LOW_DEPTS from lib/demography.ts).
function ageingBracket(score: number): { range: string; note: string } {
  if (score <= 1.5) return { range: "< 20 % over 60", note: "very young demographics (overseas departments)" };
  if (score <= 3) return { range: "22 – 27 % over 60", note: "young pyramid — metropolises and dense Île-de-France" };
  if (score <= 5) return { range: "≈ 28 % over 60", note: "close to the national median" };
  if (score <= 7) return { range: "32 – 35 % over 60", note: "marked ageing — sunbelt coast" };
  return { range: "35 – 40 % over 60", note: "very advanced ageing — rural central-eastern departments" };
}

// English mapping for demo.trajectory (10 = worst per lib convention).
function trajectoryReasonEN(score: number): string {
  if (score <= 2.5) return "Attractive metropolitan hub — sustained positive demographic balance (natural + migratory).";
  if (score <= 3.5) return "Department in demographic growth — positive migratory balance, confirmed appeal.";
  if (score <= 5.5) return "Trajectory close to stability — annual balance mildly positive or mildly negative.";
  if (score <= 7) return "Slow structural decline — migratory outflows outpacing arrivals for over a decade.";
  return "Structural demographic decline — negative balance for several decades (natural + migratory).";
}

const TONE_COLOR: Record<Tone, string> = {
  high: "text-emerald-700 dark:text-emerald-400",
  good: "text-lime-700 dark:text-lime-400",
  median: "text-amber-700 dark:text-amber-400",
  low: "text-orange-700 dark:text-orange-400",
  "very-low": "text-red-700 dark:text-red-400",
};

const TONE_BG: Record<Tone, string> = {
  high: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900",
  good: "bg-lime-50 dark:bg-lime-950/30 border-lime-200 dark:border-lime-900",
  median: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
  low: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900",
  "very-low": "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
};

const SALARY_LABEL: Record<Tone, string> = {
  high: "high", good: "good", median: "median", low: "low", "very-low": "very low",
};
const UNEMP_LABEL: Record<Tone, string> = {
  low: "very low", good: "low", median: "average", high: "high", "very-low": "very high",
};

function formatEN(n: number): string {
  return new Intl.NumberFormat("en-GB").format(n);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const bucket = popBucket(city.population);
  const pop = city.population ? `${formatEN(city.population)} residents` : "indicative size";
  return {
    title: `${city.name} statistics — population, wages, unemployment`.slice(0, 60),
    description: `Key figures for ${city.name} (${city.department}): ${pop}, département median net wage, unemployment rate, age structure and demographic trajectory. INSEE sources.`.slice(0, 160),
    alternates: { canonical: `${EN_BASE}/cities/${slug}/statistics` },
    openGraph: {
      title: `${city.name} statistics`,
      description: `Population, median wage, unemployment, age structure — INSEE synthesis ${bucket.label}.`,
    },
  };
}

export default async function EnCityStatisticsPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const emp = computeEmploymentMarket(city);
  const demo = computeDemography(city);
  const bucket = popBucket(city.population);
  const salary = salaryBracket(emp.salary.score);
  const unemp = unemploymentBracket(emp.unemployment.score);
  const ageing = ageingBracket(demo.ageing.score);

  const trajectoryLabel =
    demo.trajectory.score <= 3
      ? { label: "population growth", tone: "high" as Tone }
      : demo.trajectory.score <= 5.5
        ? { label: "stable trajectory", tone: "median" as Tone }
        : { label: "structural decline", tone: "very-low" as Tone };
  const trajectoryReason = trajectoryReasonEN(demo.trajectory.score);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${city.slug}` },
    { name: "Statistics", path: `/cities/${city.slug}/statistics` },
  ]);

  const popLine = city.population
    ? `${formatEN(city.population)} residents — ${bucket.label} (${bucket.hint})`
    : `${bucket.label} — indicative size`;

  const faq = faqJsonLd([
    {
      q: `How many residents does ${city.name} have?`,
      a: `${city.name} (${city.department}): ${popLine}. Source: INSEE, population census (RP) — most recent published vintage.`,
    },
    {
      q: `What is the median net wage in ${city.name}?`,
      a: `The estimated median net monthly wage at the département level (${city.department}) is around ${salary.range} — ${salary.note}. Source: INSEE DADS (net wages by département). The wage for the city itself is not published separately — the finest INSEE statistic is departmental.`,
    },
    {
      q: `What is the unemployment rate in ${city.name}?`,
      a: `The départemental unemployment rate for ${city.department} is estimated at ${unemp.range} — ${unemp.note}. Source: INSEE, quarterly unemployment by département (Q4 2024). The rate for the commune itself is not published separately by INSEE.`,
    },
    {
      q: `Is ${city.name} a young or an ageing city?`,
      a: `${city.name} (${city.department}): estimated age structure at ${ageing.range} — ${ageing.note}. Trajectory: ${trajectoryLabel.label}. Source: INSEE, population census (age structure by département).`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link> ·{" "}
          <Link href="/cities" className="hover:underline">Cities</Link> ·{" "}
          <Link href={`/cities/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {city.name} statistics
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Key figures to place {city.name} in context: population, median net wage,
          unemployment rate, age structure and demographic trajectory. Public sources:{" "}
          <a
            href="https://www.insee.fr/en/statistiques"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            INSEE
          </a>{" "}
          (census, DADS, quarterly unemployment).
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-[var(--text-secondary)]">
            INSEE figures
          </span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-[var(--text-secondary)]">
            Département-level ranges
          </span>
        </div>

        {/* Hero — population */}
        <div className="mt-6 rounded-2xl border border-l-4 border-l-[var(--accent)] border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
              Population
            </h2>
            <span className="text-xs font-bold uppercase text-[var(--accent)]">
              {bucket.emoji} {bucket.label}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-2">
            {city.population != null ? formatEN(city.population) : "—"}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">
              residents
            </span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            {bucket.hint} · Département: {city.department ?? "—"}
            {city.region ? ` · Region: ${city.region}` : ""}
          </p>
        </div>

        {/* 3 blocks — wage, unemployment, age structure */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Wage, employment, age structure
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          These three indicators are only published at the département level. The
          ranges reflect the département average — not the exact commune figure.
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`rounded-2xl border p-4 ${TONE_BG[salary.tone]}`}>
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Median net wage
              </div>
              <div className={`text-xs font-bold uppercase ${TONE_COLOR[salary.tone]}`}>
                {SALARY_LABEL[salary.tone]}
              </div>
            </div>
            <div className="text-lg font-bold tabular-nums text-[var(--text-primary)] mb-2">
              {salary.range}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {salary.note}. Source: INSEE DADS — département of {city.department}.
            </p>
          </div>

          <div className={`rounded-2xl border p-4 ${TONE_BG[unemp.tone]}`}>
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Unemployment rate
              </div>
              <div className={`text-xs font-bold uppercase ${TONE_COLOR[unemp.tone]}`}>
                {UNEMP_LABEL[unemp.tone]}
              </div>
            </div>
            <div className="text-lg font-bold tabular-nums text-[var(--text-primary)] mb-2">
              {unemp.range}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {unemp.note}. Source: INSEE, quarterly département rate Q4 2024.
            </p>
          </div>

          <div className="rounded-2xl border p-4 bg-[var(--bg-surface)] border-[var(--border)]">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Age structure
              </div>
              <div className="text-xs font-bold uppercase text-[var(--text-tertiary)]">
                Age 60+
              </div>
            </div>
            <div className="text-lg font-bold tabular-nums text-[var(--text-primary)] mb-2">
              {ageing.range}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {ageing.note}. Source: INSEE census (RP) — département of {city.department}.
            </p>
          </div>
        </div>

        {/* Trajectory */}
        <div className={`mt-6 rounded-2xl border p-5 ${TONE_BG[trajectoryLabel.tone]}`}>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              Demographic trajectory
            </div>
            <div className={`text-xs font-bold uppercase ${TONE_COLOR[trajectoryLabel.tone]}`}>
              {trajectoryLabel.label}
            </div>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {trajectoryReason}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Source: INSEE, département demographic balance (natural balance + net
            migration, annual).
          </p>
        </div>

        {/* Transparency — what INSEE does not publish at commune level */}
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            What INSEE does not publish at the commune level
          </div>
          <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Unemployment rate:</strong>{" "}
              published only quarterly at the département and employment-zone
              levels. No commune-by-commune figure.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Median net wage:</strong>{" "}
              published by département (DADS). Commune-level statistics exist for
              the largest cities but carry heavy noise for smaller ones.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Age structure:</strong>{" "}
              published by commune in the census, but fine age brackets get noisy
              below 20,000 residents — the robust reference is departmental.
            </li>
          </ul>
        </div>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Explore further
        </h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/cities/${city.slug}/employment`} className="block">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>💼</span>
                <span>Job market</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Unemployment, dynamism, sector mix, wages
              </div>
            </div>
          </Link>
          <Link href={`/cities/${city.slug}/demographics`} className="block">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>👥</span>
                <span>Demographics</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Ageing, young adults, renewal
              </div>
            </div>
          </Link>
          <Link href={`/cities/${city.slug}/cost-of-living`} className="block">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>🪙</span>
                <span>Cost of living</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Rent, monthly budget, Paris comparison
              </div>
            </div>
          </Link>
          <Link href={`/cities/${city.slug}/housing`} className="block">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>🏠</span>
                <span>Housing</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                €/m², T1/T2 rent, rental tension
              </div>
            </div>
          </Link>
          <Link href={`/cities/${city.slug}/tax`} className="block">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>💶</span>
                <span>Local tax</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Property tax, waste levy, commune rate
              </div>
            </div>
          </Link>
          <Link href={`/cities/${city.slug}/public-services`} className="block">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>🏛️</span>
                <span>Public services</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Post office, town hall, school, library
              </div>
            </div>
          </Link>
        </div>

        <p className="mt-6 text-xs text-[var(--text-tertiary)]">
          Département ranges derived from public INSEE series (census, DADS,
          quarterly unemployment). For an exact value at a specific vintage, check{" "}
          <a
            href={`https://www.insee.fr/fr/recherche/recherche-statistiques?q=${encodeURIComponent(city.name)}`}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            the INSEE record for {city.name}
          </a>
          .
        </p>
      </section>

      <Footer />
    </main>
  );
}
