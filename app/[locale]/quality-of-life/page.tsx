import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topBestQol,
  topWorstQol,
  QOL_LEVEL_COLOR,
} from "@/lib/quality-of-life-index";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { MACRO_REGIONS } from "@/lib/macro-regions";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Best quality of life in France · Composite index 2026",
  description: `Quality-of-life mega-index aggregating environment (air, noise, water, risks), healthcare access and job market for all ${CITIES_COUNT} French cities. Top 30 cities for quality of life.`,
  alternates: { canonical: `${EN_BASE}/quality-of-life` },
};

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

const EN_QOL_LABEL: Record<string, string> = {
  exceptionnel: "Exceptional",
  excellent: "Excellent",
  bon: "Good",
  moyen: "Moderate",
  tendu: "Strained",
};

const MIN_POP = 15_000;

export default function EnQualityOfLifePage() {
  const best = topBestQol(30, MIN_POP);
  const worst = topWorstQol(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Quality of life", path: "/quality-of-life" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities have the best quality of life?",
      a: `According to our composite Quality-of-Life Index (environment 35% + healthcare 30% + employment 35%), the highest-scoring cities (population ≥ 15,000) are: ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${c.qol.score}/10)`)
        .join(", ")}. These cities combine environmental quality, easy healthcare access and a dynamic job market.`,
    },
    {
      q: "How is the Quality-of-Life Index calculated?",
      a: "The index combines three deterministic sub-indices: (1) Environment (35%) — aggregate of air quality, noise, water stress, natural risks; (2) Healthcare (30%) — access to GPs, specialists, A&E, pharmacies; (3) Employment (35%) — unemployment rate, business dynamism, sector mix, average wages. Each sub-index is scored 0–10 (10 = good) then weighted.",
    },
    {
      q: "Why filter to cities with 15,000+ residents?",
      a: "Below that threshold some indicators (NO2, nightlife, business dynamism) are poorly defined and the ranking becomes misleading. All city profiles remain individually accessible via /cities/[slug] regardless of population.",
    },
    {
      q: "Is this weighting universal?",
      a: "No — it's an all-audience average. A retiree would weight healthcare and environment more heavily (less employment). A young professional would weight employment and dynamism more. For a personalised ranking, use our compatibility quiz.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Quality of life in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          A mega-index combining the three structural dimensions of any relocation decision into a
          single 0–10 score (10 = exceptional): environment (air, noise, water, risks), healthcare
          access, and the job market. Filtered to cities of 15,000+ residents for meaningful
          urban indicators.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Composite mega-index</Badge>
          <Badge>3 pillars × {CITIES_COUNT} cities</Badge>
          <Badge>Environment 35% · Healthcare 30% · Employment 35%</Badge>
        </div>

        {/* 3 pillars */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">The 3 pillars</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/environment" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-3xl mb-2">🌿</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Environment (35%)</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Air, noise, water, natural risks</div>
            </Card>
          </Link>
          <Link href="/healthcare" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-3xl mb-2">🩺</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Healthcare (30%)</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">GPs, specialists, A&E access</div>
            </Card>
          </Link>
          <Link href="/employment" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-3xl mb-2">💼</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Employment (35%)</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Unemployment, dynamism, wages</div>
            </Card>
          </Link>
        </div>

        {/* Top 30 */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — best quality of life
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents combining a healthy environment, easy healthcare
          access and a dynamic job market. Score 0–10, 10 = exceptional.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Quality of life</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Env.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Health</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Jobs</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
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
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${QOL_LEVEL_COLOR[c.qol.level]}`}>
                        {c.qol.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_QOL_LABEL[c.qol.level] ?? c.qol.level}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.envScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.healthScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.qol.jobScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Sub-score reading: 10 = good (already inverted from environment / healthcare / employment composites).
        </p>

        {/* Bottom 20 */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — most strained quality of life
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents accumulating strains across multiple pillars. Often: a
          post-industrial basin with degraded environment and a medical desert, or a
          Mediterranean metro combining high unemployment and polluted air.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Quality of life</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Env.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Health</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Jobs</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
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
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.qol.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.envScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.qol.healthScore.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.qol.jobScore.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">By geographic zone</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          This ranking broken down by macro-region — each view shows only cities in that geographic zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/quality-of-life/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Quality of life</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Personalise this ranking
        </h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/quiz/compatibility" className="block">
            <Card className="hover:shadow-md transition-shadow h-full border-[var(--accent)]/40">
              <div className="text-2xl mb-1">✨</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Compatibility quiz</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Top 5 cities matched to your profile</div>
            </Card>
          </Link>
          <Link href="/for-who" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Who is it for?</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">10 relocation profiles</div>
            </Card>
          </Link>
          <Link href="/red-flags" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚩</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red flags</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Pitfalls before you move</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
