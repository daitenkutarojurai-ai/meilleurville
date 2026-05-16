import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PurchaseSimulator } from "@/components/PurchaseSimulator";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Simulateur achat immobilier 2026 — Où acheter avec votre budget",
  description:
    "Simulateur d'achat immobilier 2026 : entrez votre budget + surface souhaitée → top 15 villes accessibles + mensualité prêt 20/25 ans + frais de notaire estimés.",
  alternates: { canonical: "/simulateur-achat" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Simulateur achat", path: "/simulateur-achat" },
]);

export default function SimulateurAchatPage() {
  const cities = CITIES_SEED
    .map((c) => {
      const h = HOUSING[c.slug];
      if (!h) return null;
      return {
        slug: c.slug,
        name: c.name,
        region: c.region ?? "",
        priceM2: h.avgBuyPriceM2,
        score: c.scores.global,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c != null);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            🏠 Simulateur achat
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Où acheter avec votre budget ?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Budget total + surface souhaitée → top 15 villes accessibles, classées par
            qualité de vie. Mensualité de prêt et frais de notaire estimés.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <PurchaseSimulator cities={cities} />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Limites du simulateur
          </h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• Prix m² = médiane communale 2024 (DVF + Meilleurs Agents). Variations interquartier de ±30 % possibles.</li>
            <li>• Taux d&apos;intérêt = moyenne marché janv. 2026 — votre offre réelle dépend de votre profil bancaire (revenu, ancienneté, taux d&apos;endettement).</li>
            <li>• Le simulateur ne prend pas en compte les charges de copropriété, la taxe foncière, ni l&apos;assurance emprunteur (~0,3 %/an).</li>
            <li>• Pour un calcul de votre coût mensuel global (incluant taxes locales), voir{" "}
              <Link href="/calculateur-cout-reel" className="underline">
                le calculateur par ville
              </Link>
              .
            </li>
            <li>• Pour repérer les villes en gentrification (anticiper la hausse), voir{" "}
              <Link href="/gentrification" className="underline">
                l&apos;index de gentrification
              </Link>
              .
            </li>
          </ul>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
