import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { CarteClient } from "./CarteClient";

export const metadata: Metadata = {
  title: "Carte des villes françaises — Qualité de vie visualisée | MeilleurVille",
  description:
    `Carte interactive des meilleures villes de France : visualisez les scores de qualité de vie, coût de la vie, nature, sécurité sur une carte. ${CITIES_SEED.length}+ villes.`,
};

export default function CartePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Carte interactive</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Carte des villes françaises
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            {CITIES_SEED.length} villes visualisées par score. La taille et la couleur de chaque point reflètent le critère sélectionné.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <CarteClient />
      </div>

      <Footer />
    </main>
  );
}
