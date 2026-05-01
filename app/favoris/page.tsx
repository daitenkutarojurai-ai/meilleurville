import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { FavoritesGrid } from "./FavoritesGrid";

export const metadata: Metadata = {
  title: "Mes villes favorites — MeilleurVille",
  description: "Toutes les villes que vous avez sauvegardées sur MeilleurVille.",
  robots: { index: false, follow: true },
};

export default function FavorisPage() {
  return (
    <main className="min-h-screen relative">
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
          <FavoritesGrid />
        </div>
      </section>

      <Footer />
    </main>
  );
}
