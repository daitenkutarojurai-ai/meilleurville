import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { VillesSearch } from "@/components/VillesSearch";

export const metadata: Metadata = {
  title: "Explorer toutes les villes françaises — Avis & Classements",
  description:
    "Découvrez les meilleures villes françaises : avis d'habitants, scores de qualité de vie, données locales. 238 communes analysées et comparées.",
};

export default function VillesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] py-14 border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">238 villes</Badge>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">
            Explorer les villes françaises
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            Avis d&apos;habitants · Scores de qualité de vie · Données officielles.
            Filtrez, triez, comparez.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <VillesSearch />
      </div>

      <Footer />
    </main>
  );
}
