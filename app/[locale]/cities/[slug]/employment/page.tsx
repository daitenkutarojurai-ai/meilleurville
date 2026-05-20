import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeEmploymentMarket, type JobLevel } from "@/lib/employment-market";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";

const EN_BASE = ORIGIN_BY_LOCALE.en;

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
    title: `${c.name} job market — unemployment, dynamism, salaries (2026)`,
    description: `The job market in ${c.name}: local unemployment, business creation, sector mix and median salary. What it's like to find work here.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/employment` },
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

const DIMS: { key: "unemployment" | "dynamism" | "sectorMix" | "salary"; label: string; note: string }[] = [
  { key: "unemployment", label: "Unemployment", note: "Departmental unemployment rate (INSEE)" },
  { key: "dynamism", label: "Business dynamism", note: "Net business creation" },
  { key: "sectorMix", label: "Sector mix", note: "Diversity and resilience of local employers" },
  { key: "salary", label: "Salaries", note: "Median net salary for the department" },
];

export default async function EnCityEmployment({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const job = computeEmploymentMarket(c);
  // The lib composite is 0-10 where 10 = hardest market. Present "10 = best".
  const jobScore = Math.round((10 - job.composite) * 10) / 10;

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-8">
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
            Job market in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Job-market score: <span className={`font-mono-data font-bold ${scoreColor(jobScore)}`}>{jobScore.toFixed(1)}/10</span>{" "}
          ({LEVEL_LABEL[job.level]}). {HERO_VERDICT[job.level]}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = job[d.key];
          const dimScore = Math.round((10 - dim.score) * 10) / 10;
          return (
            <div key={d.key} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-[var(--text-primary)]">{d.label}</p>
                <span className={`font-mono-data font-bold ${scoreColor(dimScore)}`}>{dimScore.toFixed(1)}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {LEVEL_LABEL[dim.level]} — {d.note}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How to read this</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
          These figures are measured at the departmental level (INSEE, DARES) — a city can run better or worse than its department, but the department sets the backdrop. Two caveats:
        </p>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· A strong overall market means little if your specific field has no local employers — check that separately.</li>
          <li>· If your income is remote or portable, the local job market matters far less. Weight it accordingly.</li>
        </ul>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/jeunes-actifs" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Young-professionals ranking</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
