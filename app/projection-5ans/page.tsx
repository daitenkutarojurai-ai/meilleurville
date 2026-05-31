import type { Metadata } from "next";
import { Telescope } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { ProjectionClient } from "./ProjectionClient";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Projection 5 ans — où devrais-je vivre dans 5 ans ? | MaVilleIdéale",
  description:
    "Famille, retraite, télétravail, budget en hausse ou en baisse — et un climat 2040 qui change tout. Trouvez la ville qui correspond à ce que vous serez dans 5 ans, pas à ce que vous êtes aujourd'hui.",
  alternates: { canonical: "/projection-5ans" },
  openGraph: {
    title: "Projection 5 ans — votre vie idéale dans 5 ans",
    description:
      "352 villes analysées selon votre trajectoire : famille, carrière, budget et risque climatique 2040.",
  },
};

export default function Projection5AnsPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Projection 5 ans", path: "/projection-5ans" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelle est la différence avec City Match ?",
      a: "City Match répond à 'quelle ville me correspond maintenant ?'. La Projection 5 ans répond à 'où devrais-je vivre dans 5 ans ?' — elle intègre votre trajectoire de vie future (famille, retraite, télétravail) et le risque climatique à horizon 2040.",
    },
    {
      q: "Comment le risque climatique est-il calculé ?",
      a: "Le risque clima 2040 est dérivé des projections macro-régionales ARPEGE (Météo-France, RCP4.5/8.5). Chaque ville est rattachée à une macro-région et reçoit un score de risque basé sur les jours > 30 °C projetés à horizon 2040. La pénalité sur le score final dépend de votre niveau de sensibilité.",
    },
    {
      q: "Le résultat est-il différent de Future You ?",
      a: "Oui. Future You simule des chiffres concrets (loyer, reste à vivre, temps libre) pour votre profil actuel. La Projection 5 ans modifie les pondérations selon votre trajectoire future et intègre la dimension climatique — elle est moins précise sur les chiffres, plus précise sur le positionnement long terme.",
    },
    {
      q: "Puis-je partager mon résultat ?",
      a: "Oui. Le bouton 'Partager' génère un lien qui encode vos choix dans l'URL. La même page rouverte avec ce lien affiche exactement la même projection.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Projection 5 ans</Badge>
          <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-600 font-semibold">
            <Telescope className="h-3.5 w-3.5" />
            Outil de projection
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Où devrais-je vivre dans 5 ans ?
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)] leading-relaxed">
            Pas la ville qui vous convient <em>aujourd&apos;hui</em> — celle qui conviendra
            à la personne que vous serez dans 5 ans. Famille, carrière, budget, et un
            climat 2040 qui ne ressemble pas au climat actuel.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <ProjectionClient />
      </div>

      <Footer />
    </main>
  );
}
