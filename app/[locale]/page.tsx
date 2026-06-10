import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { StatsBar } from "@/components/StatsBar";
import { RankingPreview } from "@/components/RankingPreview";
import { FeaturedCities } from "@/components/FeaturedCities";
import { QuizTeaser } from "@/components/QuizTeaser";
import { ProfileQuickAccess } from "@/components/ProfileQuickAccess";
import { GuidesTeaser } from "@/components/GuidesTeaser";
import { RedFlagTeaser } from "@/components/RedFlagTeaser";
import { CostCalculator } from "@/components/CostCalculator";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Footer } from "@/components/Footer";
import { FranceHeatmap } from "@/components/FranceHeatmap";
import { TopFiveCities } from "@/components/TopFiveCities";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CityMarquee } from "@/components/CityMarquee";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { SectionNav } from "@/components/SectionNav";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { HERO_CITIES } from "@/lib/hero-data";
import { CITIES_COUNT, RANKINGS_COUNT } from "@/lib/site-stats";
import { scoreColor } from "@/lib/utils";

const EN_BASE = ORIGIN_BY_LOCALE.en;

// EN homepage = the exact same component tree as the FR homepage (app/page.tsx),
// rendered with locale="en". Components default to "fr", so the FR site is
// untouched; here every section gets locale="en" for English copy + EN routes.
export const metadata: Metadata = {
  title: "BestCitiesInFrance · Find the French city that fits you",
  description: `Independent rankings, lifestyle quiz, and city comparisons across ${CITIES_COUNT} French cities. Find where to live, work, or retire in France — with real data, no fluff.`,
  alternates: {
    canonical: `${EN_BASE}/`,
    // Page-level alternates override the layout default, so the hreflang map
    // must be restated here or the EN home emits no reciprocal hreflang (the FR
    // home links to EN but not vice-versa — breaks the language pairing).
    languages: {
      fr: ORIGIN_BY_LOCALE.fr,
      "fr-FR": ORIGIN_BY_LOCALE.fr,
      en: `${EN_BASE}/`,
      "en-US": `${EN_BASE}/`,
      "x-default": ORIGIN_BY_LOCALE.fr,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BestCitiesInFrance",
    url: `${EN_BASE}/`,
    title: "BestCitiesInFrance · Find the French city that fits you",
    description: `Independent rankings + lifestyle quiz across ${CITIES_COUNT} French cities. No fluff, no sponsored content.`,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BestCitiesInFrance",
  url: EN_BASE,
  description: "The reference for choosing where to live in France: rankings, resident reviews, a matching quiz and local data.",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${EN_BASE}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BestCitiesInFrance",
  url: EN_BASE,
  logo: `${EN_BASE}/icon.png`,
  sameAs: [],
  description: "Platform for comparing and ranking French cities by quality of life.",
};

export default function EnHomePage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <Navbar />
      <HeroSection locale="en" cities={HERO_CITIES} citiesCount={CITIES_COUNT} rankingsCount={RANKINGS_COUNT} />
      <SectionNav locale="en" />
      <ScrollReveal><TopFiveCities locale="en" /></ScrollReveal>
      <CityMarquee locale="en" />
      <ScrollReveal><StatsBar locale="en" citiesCount={CITIES_COUNT} rankingsCount={RANKINGS_COUNT} /></ScrollReveal>
      <ScrollReveal><FranceHeatmap locale="en" /></ScrollReveal>
      <ScrollReveal><RankingPreview locale="en" /></ScrollReveal>
      <ScrollReveal><FeaturedCities locale="en" /></ScrollReveal>
      <ScrollReveal><QuizTeaser citiesCount={CITIES_SEED.length} locale="en" /></ScrollReveal>
      <ScrollReveal><ProfileQuickAccess locale="en" /></ScrollReveal>
      <ScrollReveal><GuidesTeaser locale="en" /></ScrollReveal>

      {/* Hidden gems */}
      {(() => {
        const top10Slugs = new Set(
          [...CITIES_SEED].sort((a, b) => b.scores.global - a.scores.global).slice(0, 10).map((c) => c.slug)
        );
        const gems = CITIES_SEED
          .filter((c) => !top10Slugs.has(c.slug) && c.scores.global >= 6.2 && c.scores.cost >= 6.5 && c.population < 100000)
          .sort((a, b) => (b.scores.global + b.scores.cost) - (a.scores.global + a.scores.cost))
          .slice(0, 6);
        return (
          <section className="py-8 sm:py-16 border-t border-[var(--border)]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
                    💎 Hidden gems
                  </p>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    Live well without overpaying
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Great little cities, still under the radar — and the rent is gentle
                  </p>
                </div>
                <Link href="/rankings/budget" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline">
                  Budget ranking →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gems.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/cities/${city.slug}`}
                    className="group flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {city.name}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                        {city.department}, {city.region}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-sm font-bold font-mono-data ${scoreColor(city.scores.global)}`}>
                        {city.scores.global.toFixed(1)}
                      </div>
                      <div className="text-xs font-medium mt-0.5 text-[var(--text-tertiary)]">
                        cost <span className={scoreColor(city.scores.cost)}>{city.scores.cost.toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Trending comparisons */}
      <section className="py-8 sm:py-16 border-t border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
                ⚖️ Today&apos;s match-up
              </p>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                The classic dilemmas, settled
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                The city duels we get asked about most — with the scores to back it up
              </p>
            </div>
            <Link href="/compare" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline">
              All comparisons →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["annecy", "grenoble"],
              ["nantes", "rennes"],
              ["bordeaux", "toulouse"],
              ["lyon", "grenoble"],
              ["montpellier", "marseille"],
              ["nice", "aix-en-provence"],
            ].map(([slugA, slugB]) => {
              const a = CITIES_SEED.find((c) => c.slug === slugA);
              const b = CITIES_SEED.find((c) => c.slug === slugB);
              if (!a || !b) return null;
              const winner = a.scores.global >= b.scores.global ? a : b;
              return (
                <Link
                  key={`${slugA}-${slugB}`}
                  href={`/compare/${slugA}-vs-${slugB}`}
                  className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {a.name}
                    </span>
                    <span className={`text-xs font-mono font-bold shrink-0 ${scoreColor(a.scores.global)}`}>{a.scores.global.toFixed(1)}</span>
                    <span className="text-xs font-bold text-[var(--text-tertiary)] shrink-0">VS</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {b.name}
                    </span>
                    <span className={`text-xs font-mono font-bold shrink-0 ${scoreColor(b.scores.global)}`}>{b.scores.global.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-[var(--accent)] font-medium shrink-0 ml-2">
                    {winner.name} wins →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cost calculator section */}
      <section id="simulator" className="py-8 sm:py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">💸 Quick simulator</p>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">How much would be left in the bank?</h2>
            <p className="text-[var(--text-secondary)]">Type in your rent and salary, we work out the gap, city by city.</p>
          </div>
          <CostCalculator locale="en" />

          <div className="mt-8">
            <Link
              href="/future-you"
              className="group block rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/10 to-transparent p-5 hover:border-[var(--accent)] hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest font-bold text-[var(--accent)] mb-1">
                    ✨ Go further · Future You
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    Simulate your whole life in another city
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    Money left over, free hours, stress, climate — concrete numbers, not just scores.
                  </div>
                </div>
                <span className="shrink-0 text-[var(--accent)] text-lg font-bold">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
      <RedFlagTeaser locale="en" />
      <NewsletterSection locale="en" />
      <Footer />
    </main>
  );
}
