import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { FavoritesGrid } from "./FavoritesGrid";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { UserBadges } from "@/components/UserBadges";

export const metadata: Metadata = {
  title: "Mes villes favorites",
  description: "Toutes les villes que vous avez sauvegardées sur MaVilleIdeal.",
  // Without an explicit canonical this page inherits the layout's "/" and
  // declares itself a duplicate of the homepage.
  alternates: { canonical: "/favoris" },
  robots: { index: false, follow: true },
};

export default function FavorisPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-20 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            ❤️ Vos coups de cœur
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Vos villes <span className="font-display gradient-text-anim italic">favorites</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Toutes les villes que vous avez sauvegardées, au même endroit.
          </p>
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <UserBadges />
          <FavoritesGrid cities={CITIES_LIGHT} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
