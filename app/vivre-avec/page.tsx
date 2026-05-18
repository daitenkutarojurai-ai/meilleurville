import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SALARY_BRACKETS, slugForSalary } from "@/lib/vivre-avec";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Vivre avec X €/mois en France 2026 · Top villes par salaire",
  description:
    "Top villes françaises adaptées à votre salaire net mensuel : 1 500, 2 000, 2 500, 3 000, 4 000, 5 000 €. Simulation reste à vivre + comparatif Paris.",
  alternates: { canonical: "/vivre-avec" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Vivre avec", path: "/vivre-avec" },
]);

export default function VivreAvecIndex() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            💶 Top villes par salaire
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Vivre avec X €/mois — où ?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            6 niveaux de salaire net, 6 listes de villes calibrées sur votre pouvoir d&apos;achat
            réel. Simulation coût fixe + reste à vivre + comparatif Paris.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SALARY_BRACKETS.map((s) => (
            <Link key={s} href={`/vivre-avec/${slugForSalary(s)}`} className="block">
              <Card className="hover:border-[var(--accent)]/40 cursor-pointer text-center transition-colors">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                  Salaire net mensuel
                </p>
                <p className="font-mono-data font-bold text-3xl text-[var(--text-primary)] my-2">
                  {s.toLocaleString("fr-FR")} €
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Top 10 villes + simulation
                </p>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
            Comment on calcule
          </h2>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• Budget logement = 33 % du salaire net (norme bancaire conservatrice)</li>
            <li>• Matching via{" "}
              <Link href="/quiz-compatibilite" className="underline">
                lib/compatibility.ts
              </Link>{" "}
              avec profil neutre (couple, hybride, budget priorité)
            </li>
            <li>• Coût mensuel via{" "}
              <Link href="/calculateur-cout-reel" className="underline">
                lib/cost-living.ts
              </Link>{" "}
              (loyer T2, chauffage ADEME, voiture ou transports, taxes)
            </li>
            <li>• Reste à vivre comparé automatiquement à Paris (loyer T2 médian 1 500 €)</li>
          </ul>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
