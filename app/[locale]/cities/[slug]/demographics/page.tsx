import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { computeDemography, type DemoLevel } from "@/lib/demography";
import {
  AGE_LABELS_EN,
  INSEE_POP_BASE_YEAR,
  INSEE_POP_SOURCE_URL,
  INSEE_POP_YEAR,
  ageDistribution,
  cityPopulation,
  populationTrend,
  seniorShare,
  youthShare,
} from "@/lib/city-population";
import { cityAlternatesEn } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";

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
    title: `${c.name} demographics — ageing, growth, renewal (2026)`,
    description: `Demographic trend in ${c.name}: ageing, young-adult presence, population trajectory and natural renewal. Is the city growing or quietly emptying?`,
    alternates: cityAlternatesEn("demographics", slug),
  };
}

const LEVEL_LABEL: Record<DemoLevel, string> = {
  dynamique: "Dynamic",
  equilibre: "Balanced",
  vieillissant: "Ageing",
  critique: "Declining",
};

const HERO_VERDICT: Record<DemoLevel, string> = {
  dynamique: "Demographically dynamic — a young, growing population. New shops, services and energy tend to follow.",
  equilibre: "A balanced age profile: stable, neither booming nor emptying.",
  vieillissant: "The population is ageing. Calm and settled, but watch whether services and the job market keep pace over time.",
  critique: "Demographically declining — an ageing population and a shrinking base. This shapes everything from schools to property liquidity.",
};

const DIMS: { key: "ageing" | "youngActives" | "trajectory" | "renewal"; label: string; note: string }[] = [
  { key: "ageing", label: "Age profile", note: "Share of residents aged 60+" },
  { key: "youngActives", label: "Young adults", note: "Presence of 25-35 year-olds" },
  { key: "trajectory", label: "Population trend", note: "Net demographic balance" },
  { key: "renewal", label: "Natural renewal", note: "Birth rate vs an ageing base" },
];

export default async function EnCityDemographics({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const demo = computeDemography(c);
  const pop = cityPopulation(c.slug);
  const trend = populationTrend(c.slug);
  const seniors = seniorShare(c.slug);
  const youth = youthShare(c.slug);
  const ages = ageDistribution(c.slug);
  // The lib composite is 0-10 where 10 = worst (declining). Present "10 = best".
  const score = Math.round((10 - demo.composite) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: c.name, path: `/cities/${slug}` },
    { name: "Demographics", path: `/cities/${slug}/demographics` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{c.name}</Link>
          {" · "}
          <span>Demographics</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>👥</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Demographics of {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Vitality score: <span className={`font-mono-data font-bold ${scoreColor(score)}`}>{score.toFixed(1)}/10</span>{" "}
          ({LEVEL_LABEL[demo.level]}). {HERO_VERDICT[demo.level]}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = demo[d.key];
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

      {pop ? (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
            Census figures
          </h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">
                  {pop.pop2022.toLocaleString("en-GB")}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  residents in {INSEE_POP_YEAR}
                </div>
              </div>
              {trend ? (
                <div>
                  <div
                    className={`text-2xl font-bold font-mono-data ${
                      trend.direction === "hausse"
                        ? "text-emerald-600"
                        : trend.direction === "baisse"
                          ? "text-orange-600"
                          : "text-[var(--text-primary)]"
                    }`}
                  >
                    {trend.changePct > 0 ? "+" : ""}
                    {trend.changePct.toFixed(1)}%
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    since {INSEE_POP_BASE_YEAR}
                  </div>
                </div>
              ) : null}
              {seniors !== null ? (
                <div>
                  <div className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">
                    {seniors.toFixed(1)}%
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    aged 60+ <span className="opacity-70">(France ≈ 28%)</span>
                  </div>
                </div>
              ) : null}
              {youth !== null ? (
                <div>
                  <div className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">
                    {youth.toFixed(1)}%
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    under 30 <span className="opacity-70">(France ≈ 34%)</span>
                  </div>
                </div>
              ) : null}
            </div>

            {ages ? (
              <div className="mt-6 space-y-1.5">
                {ages.map((a) => (
                  <div key={a.key} className="flex items-center gap-3 text-xs">
                    <span className="w-16 shrink-0 text-[var(--text-secondary)]">
                      {AGE_LABELS_EN[a.key]}
                    </span>
                    <span className="flex-1 h-3 rounded bg-[var(--bg-subtle)] overflow-hidden">
                      <span
                        className="block h-full rounded bg-[var(--accent)]"
                        style={{ width: `${Math.min(100, a.share * 3)}%` }}
                      />
                    </span>
                    <span className="w-14 shrink-0 text-right font-mono-data text-[var(--text-secondary)]">
                      {a.share.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            <p className="mt-4 text-xs text-[var(--text-secondary)]">
              Measured commune by commune, not estimated. Source:{" "}
              <a
                href={INSEE_POP_SOURCE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Insee, {INSEE_POP_YEAR} population census
              </a>{" "}
              (Etalab Open Licence).
            </p>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Why the age curve matters</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
          Demographics are a slow-moving signal, but they predict a lot:
        </p>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· A young, growing city tends to gain shops, transport and amenities. A declining one slowly loses them.</li>
          <li>· An ageing town can be wonderfully calm — but check that schools, GPs and the job market aren't thinning out with it.</li>
          <li>· Population trend is also a property-liquidity signal: it's easier to resell where people want to move.</li>
        </ul>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href={`/cities/${slug}/employment`} className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">{c.name} job market</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
