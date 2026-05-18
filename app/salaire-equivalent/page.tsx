import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SalaryEquivalent } from "@/components/SalaryEquivalent";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { fiscalityForCity } from "@/lib/fiscalite";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Salaire équivalent entre villes 2026 — Calculateur reste à vivre",
  description: `Combien gagner dans une autre ville pour garder le même reste à vivre ? Calculateur interactif ${CITIES_COUNT} villes françaises. Loyer, mobilité, taxes inclus.`,
  alternates: { canonical: "/salaire-equivalent" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Salaire équivalent", path: "/salaire-equivalent" },
]);

function parseFonciereMidpoint(range: string): number | null {
  const cleaned = range.replace(/ /g, " ").replace(/[€/an\s]/g, "");
  const m = cleaned.match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  return Math.round((Number(m[1]) + Number(m[2])) / 2);
}

export default function SalaireEquivalentPage() {
  // Prepare lean city data for the client component
  const cities = CITIES_SEED.filter((c) => c.department && c.region).map((c) => {
    const housing = HOUSING[c.slug];
    const fisc =
      c.department && c.region
        ? fiscalityForCity({ department: c.department, region: c.region })
        : null;
    return {
      slug: c.slug,
      name: c.name,
      region: c.region ?? "",
      department: c.department ?? "",
      population: c.population ?? 50000,
      avgRentT2: housing?.avgRentT2 ?? null,
      taxeFonciereAnnualMidpoint: fisc ? parseFonciereMidpoint(fisc.taxeFonciereT3) : null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            💸 Salaire équivalent
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Quel salaire pour garder le même reste à vivre ?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Vous gagnez X € à Paris et vous voulez déménager à Lyon ? Combien faut-il négocier
            pour maintenir votre niveau de vie ? Ce calculateur fait la conversion sur loyer +
            chauffage + mobilité + taxes pour {CITIES_COUNT} villes.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <SalaryEquivalent cities={cities} />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Méthodologie
          </h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• <strong>Loyer T2 médian</strong> par ville (Clameur / observatoires loyer 2024)</li>
            <li>• <strong>Chauffage</strong> par zone climatique ADEME (H1a → H3)</li>
            <li>• <strong>Mobilité</strong> : assurance voiture régionale + carburant 25k km/an OU abonnement transport officiel</li>
            <li>• <strong>Taxe foncière</strong> (DGFiP T3 ancien, mensualisée)</li>
            <li>• <strong>TEOM</strong> (DGFiP médiane communale, mensualisée)</li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Calcul indicatif. Pour un calcul personnalisé inclusant mutuelle, garde, charges
            copro, alimentation, voir{" "}
            <Link href="/calculateur-cout-reel" className="underline">
              le calculateur par ville
            </Link>
            .
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
