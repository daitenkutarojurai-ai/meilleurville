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
import { CITIES_SEED } from "@/data/cities-seed";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MeilleurVille",
  url: BASE_URL,
  description: "La référence pour choisir où vivre en France : classements, avis d'habitants, quiz de matching, données locales.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/villes?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MeilleurVille",
  url: BASE_URL,
  logo: `${BASE_URL}/icon.png`,
  sameAs: [],
  description: "Plateforme de comparaison et classement des villes françaises par qualité de vie.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <Navbar />
      <HeroSection />
      <StatsBar />
      <RankingPreview />
      <FeaturedCities />
      <QuizTeaser />
      <ProfileQuickAccess />
      <GuidesTeaser />

      {/* Trending comparisons */}
      <section className="py-14 border-t border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
                Comparaisons populaires
              </p>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Les grandes questions du moment
              </h2>
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
                  className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {a.name}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-tertiary)] shrink-0">{a.scores.global.toFixed(1)}</span>
                    <span className="text-xs font-bold text-[var(--text-tertiary)] shrink-0">VS</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {b.name}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-tertiary)] shrink-0">{b.scores.global.toFixed(1)}</span>
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
      <section className="py-14 border-t border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-[var(--accent)] mb-2">Simulateur</p>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Combien économiseriez-vous ?</h2>
            <p className="text-[var(--text-secondary)]">Entrez votre loyer actuel et votre salaire pour voir le gain mensuel par ville.</p>
          </div>
          <CostCalculator />
        </div>
      </section>
      <RedFlagTeaser />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
