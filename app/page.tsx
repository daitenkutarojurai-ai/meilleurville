import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { StatsBar } from "@/components/StatsBar";
import { RankingPreview } from "@/components/RankingPreview";
import { FeaturedCities } from "@/components/FeaturedCities";
import { QuizTeaser } from "@/components/QuizTeaser";
import { GuidesTeaser } from "@/components/GuidesTeaser";
import { RedFlagTeaser } from "@/components/RedFlagTeaser";
import { NewsletterSection } from "@/components/NewsletterSection";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <RankingPreview />
      <FeaturedCities />
      <QuizTeaser />
      <GuidesTeaser />
      <RedFlagTeaser />
      <NewsletterSection />
      <Footer />
    </main>
  );
}
