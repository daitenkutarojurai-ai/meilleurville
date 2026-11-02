import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { ENV_LEVEL_COLOR } from "@/lib/environment-index";
import { topHealthiest, topMostStressed } from "@/lib/environment-index-rankings";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { pathAlternatesEn } from "@/lib/i18n";
import { MACRO_REGIONS } from "@/lib/macro-regions";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "Healthiest cities in France · environmental index 2026",
  description:
    "National ranking of French cities by environmental health: air quality, noise, water stress, natural risks. Top 30 healthiest cities + top 20 most exposed. Open methodology.",
  alternates: pathAlternatesEn("/environnement", "/environment"),
};

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
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
      a: "The index aggregates four dimensions estimated at commune level: air quality (30% weight), noise (25%), water stress (25%), natural risks (20%). Each one is a model computed from the commune's own characteristics (size, département, terrain, climate, coastline) and keyed to the public reference frameworks — ATMO, CITEPA and RNSA for air, CBS, PEB and Bruitparif for noise, Propluvia and BRGM for water, BCSF, BRGM and ONF for risks — without reusing their readings. The 'environmental health' score 0-10 is the inverse of the composite stress.",
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
        </nav>

        <div className="flex items-center gap-3">
          <EmojiBadge emoji="🌿" tone="aqua" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            <span className="gradient-text">Healthiest</span> cities in France
          </h1>
        </div>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index covering four <strong>estimated</strong> environmental dimensions:
          air quality, noise, water stress and natural risks. Each is a commune-level model
          keyed to the public reference frameworks (ATMO, CBS / Bruitparif, Propluvia / BRGM,
          BCSF / BRGM / ONF) — this ranking compares estimates, not station readings.
          Score 0-10, 10 = healthiest environment. Filtered to cities
          ≥ 15,000 residents for meaningful urban indicators.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="grad-head-0 rounded-full px-3 py-1 font-semibold">Educational overview</span>
          <span className="rounded-full bg-white/85 px-3 py-1 font-medium text-[#4338CA] ring-1 ring-[#C7D2FE]">4 dimensions · {CITIES_COUNT} cities</span>
          <span className="rounded-full bg-white/85 px-3 py-1 font-medium text-[#4338CA] ring-1 ring-[#C7D2FE]">Air 30% · noise 25% · water 25% · risks 20%</span>
        </div>

        </div>
      </section>

      {/* Top villes saines — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 30 — Healthiest cities</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of 15,000+ residents with the highest environmental health score. Most are
          mid-altitude or temperate Atlantic coastal cities, low industrial density, few major
          road corridors.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--band-indigo)] text-xs uppercase tracking-wide text-[#4338CA]">
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
                  <tr key={c.slug} className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]">
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
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Sub-score reading: 10 = maximum exposure (worst), 0 = absent.
        </p>

        </div>
      </section>

      {/* Top villes exposées — bande rose */}
      <section className="band band-pink py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 20 — Most exposed cities</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities combining the highest environmental exposure across all 4 dimensions.
          Typically: large high-traffic metros, valley cities prone to thermal inversions,
          agglomerations under air corridors, or Mediterranean departments combining heat,
          drought, and wildfires.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(219,39,119,0.45)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--band-pink)] text-xs uppercase tracking-wide text-[#9D174D]">
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
                  <tr key={c.slug} className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]">
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
        </div>

        </div>
      </section>

      {/* Methodology — sky band */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-xl font-bold">
          <span className="gradient-text">Methodology</span>
        </h2>
        <div className="mt-3 rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Air quality (30%)</strong> — aggregate
              of NO2, PM2.5, ozone, pollen. See a{" "}
              <Link href={`/cities/${healthiest[0].slug}/air-quality`} className="text-[var(--accent)] hover:underline">
                city air-quality page
              </Link>{" "}
              for details. Reference frameworks: ATMO, CITEPA, RNSA.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Noise (25%)</strong> — road, air, rail,
              and night-time noise. Reference frameworks: Strategic Noise Maps (CBS), noise
              exposure plans (PEB) from the DGAC, Bruitparif Île-de-France.
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
        </div>

        </div>
      </section>

      {/* Macro-regions — lilac band */}
      <section className="band band-lilac py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-xl font-bold">
          <span className="gradient-text">By geographic zone</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          This ranking broken down by macro-region — each view shows only cities in that geographic zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m, i) => (
            <Link key={m.slug} href={`/environment/${m.slug}`} className="block">
              <div className="h-full rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] transition-transform hover:-translate-y-0.5">
                <EmojiBadge emoji={m.emoji} tone={toneFor(i)} size="sm" className="mb-2" />
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Environment index</div>
              </div>
            </Link>
          ))}
        </div>

        </div>
      </section>

      {/* City-level pages — aqua band */}
      <section className="band band-aqua py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-xl font-bold">
          <span className="gradient-text">City-level environment pages</span>
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["air-quality", "noise", "water", "natural-risks"] as const).map((sub, i) => {
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
                <div className="h-full rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] transition-transform hover:-translate-y-0.5 text-center">
                  <EmojiBadge emoji={emojis[sub]} tone={toneFor(i + 2)} size="sm" className="mb-2" />
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {labels[sub]}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    e.g. {healthiest[0].name}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
