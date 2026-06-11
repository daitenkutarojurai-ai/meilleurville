import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { MesVillesClient } from "@/app/mes-villes/MesVillesClient";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "My account · BestCitiesInFrance",
  description: "Your saved cities, reviews, alerts and projections — all in one place.",
  alternates: { canonical: `${EN_BASE}/my-account` },
  robots: { index: false, follow: true },
};

export default function MyAccountPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      <MesVillesClient cities={CITIES_LIGHT} />
      <Footer />
    </main>
  );
}
