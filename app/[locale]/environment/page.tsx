import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topHealthiest,
  topMostStressed,
  ENV_LEVEL_COLOR,
} from "@/lib/environment-index";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Healthiest cities in France · environmental index 2026",
  description:
    "National ranking of French cities by environmental health: air quality, noise, water stress, natural risks. Top 30 healthiest cities + top 20 most exposed. Open methodology.",
  alternates: { canonical: `${EN_BASE}/environment` },
};

const EN_ENV_LABEL: Record<string, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Moderate",
  tendu: "Strained",
};

const MIN_POP = 15_000;

export default function EnEnvironmentPage() {
  const healthiest = topHealthiest(30, MIN_POP);
  const mostStressed = topMostStressed(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Environment", path: "/environment" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities are the most environmentally healthy in 2026?",
      a: `According to our composite environmental index (air quality, noise, water stress, natural risks), the healthiest cities (population ≥ 15,000) are: ${healthiest
        .slice(0, 5)
        .map((c) => `${c.name} (${c.index.healthScore.toFixed(1)}/10)`)
        .join(", ")}.`,
    },
    {
      q: "Which cities have the highest cumulative environmental stress?",
      a: `The cities with the most pronounced combined exposure are: ${mostStressed
        .slice(0, 5)
        .map((c) => `${c.name} (stress ${c.index.stressComposite.toFixed(1)}/10)`)
        .join(", ")}. These cities typically combine heavy air pollution, road/air-traffic noise, and Mediterranean water stress.`,
    },
    {
      q: "How is the environmental index calculated?",
      a: "The index aggregates four deterministic dimensions: air quality (ATMO, CITEPA, RNSA — 30% weight), noise (CBS, PEB, Bruitparif — 25%), water stress (Propluvia, BRGM — 25%), natural risks (Géorisques, BRGM, BCSF — 20%). The 'environmental health' score 0-10 is the inverse of the composite stress.",
    },
    {
      q: "Why is there a 15,000-resident minimum?",
      a: "Below that threshold, certain indicators (NO2, nightlife noise) are not meaningful, and the ranking would become misleading. All city profiles remain accessible via their sub-pages (/air-quality, /noise, /water, /natural-risks) regardless of population.",
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
          Healthiest cities in France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index covering four key environmental dimensions: air quality (ATMO),
          noise (CBS / Bruitparif), water stress (Propluvia / BRGM), and natural risks
          (Géorisques). Score 0-10, 10 = healthiest environment. Filtered to cities
          ≥ 15,000 residents for meaningful urban indicators.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Educational overview</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} cities</Badge>
          <Badge>Air 30% · noise 25% · water 25% · risks 20%</Badge>
        </div>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — Healthiest cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the highest environmental health score. Most are
          mid-altitude or temperate Atlantic coastal cities, low industrial density, few major
          road corridors.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Env. health</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Air</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Noise</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Water</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Risks</th>
                </tr>
              </thead>
              <tbody>
                {healthiest.map((c, i) => (
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
                      <span className={`font-bold tabular-nums ${ENV_LEVEL_COLOR[c.index.level]}`}>
                        {c.index.healthScore.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_ENV_LABEL[c.index.level] ?? c.index.level}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.air.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.bruit.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.index.eau.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.index.risques.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Sub-score reading: 10 = maximum exposure (worst), 0 = absent.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — Most exposed cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities combining the highest environmental exposure across all 4 dimensions.
          Typically: large high-traffic metros, valley cities prone to thermal inversions,
          agglomerations under air corridors, or Mediterranean departments combining heat,
          drought, and wildfires.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Region</th>
                  <th className="px-3 py-2 text-right">Stress</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Air</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Noise</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Water</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Risks</th>
                </tr>
              </thead>
              <tbody>
                {mostStressed.map((c, i) => (
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
                        {c.index.stressComposite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.air.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.index.bruit.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.index.eau.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.index.risques.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Methodology</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Air quality (30%)</strong> — aggregate
              of NO2, PM2.5, ozone, pollen. See a{" "}
              <Link href={`/cities/${healthiest[0].slug}/air-quality`} className="text-[var(--accent)] hover:underline">
                city air-quality page
              </Link>{" "}
              for details. Sources: ATMO, CITEPA, RNSA.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Noise (25%)</strong> — road, air, rail,
              and night-time noise. Sources: Strategic Noise Maps (CBS), noise exposure plans (PEB)
              from the DGAC, Bruitparif Île-de-France.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Water stress (25%)</strong> — drought
              restrictions (Propluvia 2022-2024), groundwater levels (BRGM 2022-2025), climate
              drought, drinking water supply.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Natural risks (20%)</strong> — flooding,
              seismic activity (2011 zoning), shrink-swell clay (BRGM), wildfires (ONF/ECASC).
              Always cross-check with Géorisques for the precise flood risk prevention plan (PPRI).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            This score is not a substitute for a technical assessment. It synthesises hazards at
            the city level and guides you to detailed per-city sub-pages. Weights reflect WHO
            health impact priorities (air and noise first).
          </p>
        </Card>

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          City-level environment pages
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["air-quality", "noise", "water", "natural-risks"] as const).map((sub) => {
            const labels: Record<string, string> = {
              "air-quality": "Air quality",
              noise: "Noise",
              water: "Water stress",
              "natural-risks": "Natural risks",
            };
            const emojis: Record<string, string> = {
              "air-quality": "🌬️",
              noise: "🔊",
              water: "💧",
              "natural-risks": "⚠️",
            };
            return (
              <Link key={sub} href={`/cities/${healthiest[0].slug}/${sub}`} className="block">
                <Card className="hover:shadow-md transition-shadow h-full text-center">
                  <div className="text-2xl mb-2">{emojis[sub]}</div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {labels[sub]}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    e.g. {healthiest[0].name}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <Footer />
    </main>
  );
}
