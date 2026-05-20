import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { VillesSearch } from "@/components/VillesSearch";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Explorer toutes les villes françaises · Avis & Classements",
  description: `Découvrez les meilleures villes françaises : avis d'habitants, scores de qualité de vie, données locales. ${CITIES_COUNT} communes analysées et comparées.`,
  alternates: { canonical: "/villes" },
};

export default function VillesPage() {
  const count = CITIES_SEED.length;
  const avg = (CITIES_SEED.reduce((s, c) => s + c.scores.global, 0) / count).toFixed(1);
  const topPct = Math.round((CITIES_SEED.filter((c) => c.scores.global >= 7.5).length / count) * 100);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-20 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🌍 {count} villes profilées
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Explorez la France,{" "}
            <span className="font-display gradient-text-anim italic">ville par ville</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Scores calibrés sur Insee + Ministère Intérieur, avis d&apos;habitants, données locales.
            Filtrez, triez, comparez — sans bullshit.
          </p>

          {/* Honest mini stats */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl glass border border-white/50 px-6 py-3 shadow-md">
            <span className="flex items-center gap-1.5 text-sm">
              <span className="font-bold font-mono-data text-[var(--text-primary)]">{count}</span>
              <span className="text-[var(--text-secondary)]">villes</span>
            </span>
            <span className="text-[var(--border)]">·</span>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="font-bold font-mono-data text-[var(--accent)]">{avg}</span>
              <span className="text-[var(--text-secondary)]">/10 score moyen</span>
            </span>
            <span className="text-[var(--border)]">·</span>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="font-bold font-mono-data text-purple-500">{topPct}%</span>
              <span className="text-[var(--text-secondary)]">avec score ≥ 7.5</span>
            </span>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <VillesSearch />
      </div>

      <Footer />
    </main>
  );
}
