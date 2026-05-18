import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { PersonalSynthesisQuiz } from "@/components/PersonalSynthesisQuiz";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Palmarès personnalisé · pondère les 8 axes selon tes priorités 2026",
  description:
    "Quiz court 8 sliders : pondérez environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics selon vos priorités. Top 10 villes recalculé en direct + lien partageable.",
  alternates: { canonical: "/palmares/personnaliser" },
  openGraph: {
    title: "Palmarès personnalisé 8 axes",
    description:
      "Pondère les 8 dimensions data du site et obtiens ton top 10 villes en direct.",
  },
};

export default function PersonnaliserPalmares() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Palmarès", path: "/palmares" },
    { name: "Personnaliser", path: "/palmares/personnaliser" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Comment fonctionne le palmarès personnalisé ?",
      a: "Vous notez l'importance des 8 axes data (environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics) sur une échelle 1-5. Les poids sont normalisés à 100 % puis appliqués aux scores synthèse F61 (déjà tous orientés 10 = excellent). Top 10 villes ≥ 15 000 hab. recalculé en direct.",
    },
    {
      q: "En quoi est-ce différent du quiz Cadre de Vie (F55) ?",
      a: "Le quiz F55 ne pondère que 3 piliers (environnement, santé, emploi) pour l'index Cadre de Vie. Ce quiz-ci pondère les 8 axes complets du site, y compris vélo, sécurité, démographie et services publics. Pour un projet de relocalisation complet, c'est la version la plus exhaustive.",
    },
    {
      q: "Comment partager mon résultat ?",
      a: "Le résultat est encodé dans le hash de l'URL (#e=...&s=...&j=...&q=...&v=...&n=...&d=...&p=...) — une lettre par axe, un chiffre 1-5 par poids. Cliquez sur « Copier le lien » : la personne qui ouvrira l'URL verra exactement votre pondération.",
    },
    {
      q: "Tous les axes par défaut à 3, c'est neutre ?",
      a: "Oui. Quand les 8 poids sont égaux, le score personnel est strictement la moyenne arithmétique des 8 axes — c'est exactement la définition du score global du palmarès standard F62. Le quiz ajoute de la valeur uniquement quand vous écartez certains axes.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/palmares" className="hover:underline">Palmarès</Link>
        </nav>

        <Badge variant="accent" className="mb-3">
          ✨ Recompute en direct · 8 axes
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Personnalise ton palmarès
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-2xl">
          Pondère les 8 dimensions data du site selon ce qui compte le plus pour ton
          projet. Le top 10 villes se recalcule à chaque réglage et le lien partageable
          encode tes priorités exactes.
        </p>

        <div className="mt-8">
          <PersonalSynthesisQuiz />
        </div>

        <p className="mt-6 text-xs text-[var(--text-tertiary)]">
          Convention unifiée : 10 = excellent sur chaque axe (clusters d&apos;origine
          « 10 = pire » déjà inversés — voir méthodologie sur{" "}
          <Link href="/palmares" className="underline">/palmares</Link>). Le recompute
          réutilise le cache module-level synthèse — aucun recalcul des 8 composites
          sous-jacents.
        </p>

        <div className="mt-8 text-sm flex flex-wrap gap-3">
          <Link href="/palmares" className="text-[var(--accent)] hover:underline">
            → Classement national standard
          </Link>
          <Link href="/cadre-de-vie/personnaliser" className="text-[var(--accent)] hover:underline">
            → Quiz Cadre de vie (3 piliers)
          </Link>
          <Link href="/quiz-compatibilite" className="text-[var(--accent)] hover:underline">
            → Quiz compatibilité lifestyle (10 Q)
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
