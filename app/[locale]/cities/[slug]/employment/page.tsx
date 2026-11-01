import type { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { computeEmploymentMarket, type JobLevel } from "@/lib/employment-market";
import {
  BTS_SOURCE_URL,
  JOB_GROWTH_NATIONAL,
  JOBS_FROM,
  RP_SOURCE_URL,
  RP_YEAR,
  SALARY_NATIONAL,
  SALARY_YEAR,
  UNEMPLOYMENT_NATIONAL,
} from "@/lib/city-employment";
import { cityAlternatesEn } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";
import { fitTitle } from "@/lib/brand";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: fitTitle(`${c.name} job market — unemployment, dynamism, salaries (2026)`),
    description: computeEmploymentMarket(c).measured
      ? `The job market in ${c.name}: census unemployment, job growth and private-sector pay measured by INSEE, sector mix estimated.`
      : `The job market in ${c.name}: local unemployment, business creation, sector mix and median salary. What it's like to find work here.`,
    alternates: cityAlternatesEn("employment", slug),
  };
}

const LEVEL_LABEL: Record<JobLevel, string> = {
  facile: "Favourable",
  actif: "Active",
  tendu: "Strained",
  sinistre: "Depressed",
};

const HERO_VERDICT: Record<JobLevel, string> = {
  facile: "The local job market is favourable — low unemployment and a healthy spread of employers.",
  actif: "An active job market: not effortless, but a reasonable range of openings if your field is represented locally.",
  tendu: "The job market is strained. If you need local employment, line it up before you move rather than counting on finding it after.",
  sinistre: "The local job market is depressed — high unemployment, thin hiring. Best suited to remote workers or those arriving with a job already.",
};

const DIMS: { key: "unemployment" | "dynamism" | "sectorMix" | "salary"; label: string; note: string; measuredNote: string }[] = [
  { key: "unemployment", label: "Unemployment", note: "Estimated departmental band", measuredNote: "Measured (census)" },
  { key: "dynamism", label: "Dynamism", note: "Estimated net business creation", measuredNote: "Measured job growth" },
  { key: "sectorMix", label: "Sector mix", note: "Estimated diversity and resilience of local employers", measuredNote: "Estimated diversity and resilience of local employers" },
  { key: "salary", label: "Salaries", note: "Estimated departmental band", measuredNote: "Measured (private-sector pay)" },
];

export default async function EnCityEmployment({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const job = computeEmploymentMarket(c);
  // The lib composite is 0-10 where 10 = hardest market. Present "10 = best".
  const jobScore = Math.round((10 - job.composite) * 10) / 10;
  const m = job.measured;
  const isMeasured = (k: (typeof DIMS)[number]["key"]) =>
    k === "unemployment" ? m?.unemployment !== undefined : k === "dynamism" ? m?.jobGrowth !== undefined : k === "salary" ? m?.salary !== undefined : false;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: c.name, path: `/cities/${slug}` },
    { name: "Job market", path: `/cities/${slug}/employment` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />
      <section className="relative overflow-hidden bg-aurora">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-10">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{c.name}</Link>
          {" · "}
          <span>Job market</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>💼</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Job market in <span className="gradient-text">{c.name}</span>
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Job-market score: <span className={`font-mono-data font-bold ${scoreColor(jobScore)}`}>{jobScore.toFixed(1)}/10</span>{" "}
          ({LEVEL_LABEL[job.level]}). {HERO_VERDICT[job.level]}
        </p>
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
          {m
            ? "10 = most dynamic market. Unemployment, job growth and private-sector pay are measured by INSEE for this town; sector mix is estimated."
            : "10 = most dynamic market. Estimated at departmental level from population and local activity — calibrated against INSEE, DARES, SIRENE and DADS reference bands, not the unemployment rate published for this town."}
        </p>
        </div>
      </section>

      <section className="band band-indigo py-10">
        {m && (
          <div className="mx-auto max-w-3xl px-4 sm:px-6 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">The measurements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {m.unemployment !== undefined && (
                <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                  <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{m.unemployment.toFixed(1)}%</div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">unemployed among residents aged 15–64 (France: {UNEMPLOYMENT_NATIONAL.toFixed(1)}%, same measure)</div>
                </div>
              )}
              {m.jobs !== undefined && m.jobGrowth !== undefined && (
                <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                  <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{m.jobGrowth > 0 ? "+" : m.jobGrowth < 0 ? "−" : ""}{Math.abs(m.jobGrowth).toFixed(1)}%</div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">jobs located in the town since {JOBS_FROM}, {m.jobs.toLocaleString("en-GB")} in {RP_YEAR} (France: +{JOB_GROWTH_NATIONAL.toFixed(1)}%)</div>
                </div>
              )}
              {m.salary !== undefined && (
                <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                  <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">€{m.salary.toLocaleString("en-GB")}</div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">average net monthly pay, full-time equivalent, private-sector jobs located in the town (France: €{SALARY_NATIONAL.toLocaleString("en-GB")})</div>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Sources:{" "}
              <a href={RP_SOURCE_URL} target="_blank" rel="noreferrer" className="underline">INSEE, population census {RP_YEAR}</a>
              {" · "}
              <a href={BTS_SOURCE_URL} target="_blank" rel="noreferrer" className="underline">INSEE, all-employees base {SALARY_YEAR}</a>
              . Census unemployment is self-declared and runs higher than the quarterly ILO rate.
            </p>
          </div>
        )}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = job[d.key];
          const dimScore = Math.round((10 - dim.score) * 10) / 10;
          return (
            <div key={d.key} className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-[var(--text-primary)]">{d.label}</p>
                <span className={`font-mono-data font-bold ${scoreColor(dimScore)}`}>{dimScore.toFixed(1)}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {LEVEL_LABEL[dim.level]} — {isMeasured(d.key) ? d.measuredNote : d.note}
              </p>
            </div>
          );
        })}
        </div>
      </section>

      <section className="band band-sky py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold mb-3"><span className="gradient-text">How to read this</span></h2>
        {m ? (
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            Three of the four scores are <strong>measured</strong> for {c.name}: census
            unemployment among residents aged 15–64, the change in jobs located in the town
            since {JOBS_FROM}, and the average pay of private-sector jobs located there. Sector
            mix remains an <strong>estimate</strong>. Business-creation rates were deliberately
            left out: they are inflated by forced self-employment (delivery, ride-hailing) and
            would flag as dynamic towns that lack salaried jobs. The figures describe the town,
            not the whole commuting area: a dormitory town can show few jobs and modest pay
            while its residents work next door. Two further caveats:
          </p>
        ) : (
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            {c.name} is outside the INSEE datasets used here, so these four scores are a{" "}
            <strong>departmental estimate</strong>, not a measurement. Each department is
            placed in bands calibrated against the orders of magnitude published by INSEE,
            DARES, SIRENE and the DADS salary series. A town can also run better or worse than
            its department. Two further caveats:
          </p>
        )}
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· A strong overall market means little if your specific field has no local employers — check that separately.</li>
          <li>· If your income is remote or portable, the local job market matters far less. Weight it accordingly.</li>
        </ul>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="grad-head-0 rounded-full px-5 py-2.5 font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/jeunes-actifs" className="rounded-full bg-white px-5 py-2.5 font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]">Young-professionals ranking</Link>
        </div>
        </div>
      </section>
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>
      <Footer />
    </main>
  );
}
