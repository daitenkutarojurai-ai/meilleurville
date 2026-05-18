import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { CITIES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Calculateur de coût réel · Toutes les villes françaises 2026",
  description: `Calculez le coût de la vie mensuel honnête pour ${CITIES_COUNT} villes françaises : loyer T2, chauffage par zone climatique, voiture ou transports, taxes. Comparatif vs Paris.`,
  alternates: { canonical: "/calculateur-cout-reel" },
};

export default function CalculateurCoutReelIndex() {
  // Sort by global score then group by region for browsability.
  const top = [...CITIES_SEED]
    .filter((c) => getHousing(c.slug))
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 24);

  const byRegion = CITIES_SEED.reduce<Record<string, typeof CITIES_SEED[number][]>>(
    (acc, city) => {
      const r = city.region ?? "Autre";
      (acc[r] ??= []).push(city);
      return acc;
    },
    {},
  );

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            💰 Calculateur honnête
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
            Combien ça coûte vraiment de vivre à{" "}
            <span className="font-display italic">[votre ville]</span> ?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Loyer T2 médian, chauffage selon zone climatique, voiture (assurance régionale +
            carburant) ou transports en commun si la ville en a, parking, taxe foncière
            mensualisée, TEOM. Total réel + reste à vivre + comparatif Paris automatique.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-10">
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            Top villes les plus consultées
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {top.map((city) => (
              <Link
                key={city.slug}
                href={`/calculateur-cout-reel/${city.slug}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-colors"
              >
                {city.name}
                <span className="block text-[10px] text-[var(--text-tertiary)] mt-0.5">
                  {city.region}
                </span>
              </Link>
            ))}
          </div>
        </Card>

        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Par région
          </h2>
          <div className="space-y-6">
            {Object.entries(byRegion)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([region, cities]) => (
                <Card key={region}>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                    {region}{" "}
                    <span className="text-xs text-[var(--text-tertiary)]">
                      ({cities.length} villes)
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/calculateur-cout-reel/${city.slug}`}
                        className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
                      >
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </Card>
              ))}
          </div>
        </section>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Comment on calcule
          </h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• <strong>Loyer T2</strong> : observatoires Clameur / SeLoger 2024 par ville.</li>
            <li>• <strong>Chauffage</strong> : ADEME (zones thermiques H1a → H3) — coût médian pour ~45 m².</li>
            <li>• <strong>Voiture</strong> : France Assureurs (prime régionale) + 25k km/an (carburant + entretien) + parking selon taille de ville.</li>
            <li>• <strong>Transports</strong> : tarif officiel exploitant 2025 pour 65+ villes desservies par tram/bus structuré.</li>
            <li>• <strong>Taxe foncière</strong> : DGFiP (estimation T3 ancien), mensualisée.</li>
            <li>• <strong>TEOM</strong> : DGFiP (médiane communale), mensualisée.</li>
          </ul>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
