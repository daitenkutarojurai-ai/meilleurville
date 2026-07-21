import Link from "next/link";
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
import { CITIES_COUNT, RANKINGS_COUNT } from "@/lib/site-stats";
import { HOMEPAGE_CITIES } from "@/lib/home-data";
import { scoreColor } from "@/lib/utils";

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      {/* WebSite/Organization JSON-LD comes from the root layout's @id-anchored
          graph — duplicating it here made Google see two WebSite nodes. */}
      <AmbientBackground />
      <Navbar />
      <HeroSection cities={HOMEPAGE_CITIES} citiesCount={CITIES_COUNT} rankingsCount={RANKINGS_COUNT} />
      <SectionNav />
      <ScrollReveal><TopFiveCities /></ScrollReveal>
      <CityMarquee />
      <ScrollReveal><StatsBar citiesCount={CITIES_COUNT} rankingsCount={RANKINGS_COUNT} /></ScrollReveal>
      <ScrollReveal><FranceHeatmap cities={HOMEPAGE_CITIES} /></ScrollReveal>
      <ScrollReveal><RankingPreview /></ScrollReveal>
      <ScrollReveal><FeaturedCities /></ScrollReveal>
      <ScrollReveal><QuizTeaser citiesCount={CITIES_SEED.length} /></ScrollReveal>
      <ScrollReveal><ProfileQuickAccess /></ScrollReveal>
      <ScrollReveal><GuidesTeaser /></ScrollReveal>

      {/* Hidden gems section */}
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
                    💎 Pépites méconnues
                  </p>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    Bien vivre, sans se ruiner
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Des villes super chouettes, encore peu connues, et le loyer y est doux
                  </p>
                </div>
                <Link href="/classements/budget" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline">
                  Classement budget →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gems.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/villes/${city.slug}`}
                    className="group flex items-center gap-4 rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-elevated)]/40 ring-1 ring-black/[0.03] hover:border-[var(--accent)]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all px-4 py-3"
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
                        coût <span className={scoreColor(city.scores.cost)}>{city.scores.cost.toFixed(1)}</span>
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
                ⚖️ Le match du jour
              </p>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Hésitations classiques, on tranche
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Les duels de villes qu&apos;on nous demande le plus, score à l&apos;appui
              </p>
            </div>
            <Link href="/comparer" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline">
              Toutes les comparaisons →
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
                  href={`/comparer/${slugA}-vs-${slugB}`}
                  className="group flex min-w-0 items-center justify-between rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-elevated)]/40 ring-1 ring-black/[0.03] hover:border-[var(--accent)]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all px-4 py-3"
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
                    {winner.name} gagne →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cost calculator section */}
      <section id="simulateur" className="py-8 sm:py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">💸 Simulateur express</p>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Combien resterait-il sur le compte ?</h2>
            <p className="text-[var(--text-secondary)]">Tapez votre loyer et votre salaire, on calcule l&apos;écart, ville par ville.</p>
          </div>
          <CostCalculator cities={HOMEPAGE_CITIES} />

          <div className="mt-8">
            <Link
              href="/future-you"
              className="group block rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/10 to-transparent p-5 hover:border-[var(--accent)] hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-widest font-bold text-[var(--accent)] mb-1">
                    ✨ Pour aller plus loin · Future You
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    Simulez votre vie complète dans une autre ville
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    Reste à vivre, heures libres, stress, climat — chiffres concrets, pas que des scores.
                  </div>
                </div>
                <span className="shrink-0 text-[var(--accent)] text-lg font-bold">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
      <RedFlagTeaser />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
