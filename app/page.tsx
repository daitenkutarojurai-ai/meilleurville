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
