import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { PersonalQolQuiz } from "@/components/PersonalQolQuiz";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Quiz Cadre de Vie personnalisé — vos priorités, votre top 10 villes",
  description:
    "Quiz court : pondérez environnement, santé et emploi selon vos priorités personnelles. Top 10 villes recalculé en direct + lien partageable. Index F52 reweighté.",
  alternates: { canonical: "/cadre-de-vie/personnaliser" },
  openGraph: {
    title: "Personnalise ton Cadre de Vie",
    description: "Pondère env / santé / emploi et obtiens ton top 10 villes en direct.",
  },
};

export default function PersonnaliserCadreVie() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Cadre de vie", path: "/cadre-de-vie" },
    { name: "Personnaliser", path: "/cadre-de-vie/personnaliser" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Comment fonctionne le quiz personnalisé Cadre de Vie ?",
      a: "Vous notez l'importance de 3 piliers (environnement, santé, emploi) sur une échelle 1-5. Les poids sont normalisés à 100 % puis appliqués aux sous-scores de l'Index Cadre de Vie F52. Le top 10 villes est recalculé en direct.",
    },
    {
      q: "En quoi est-ce différent du quiz compatibilité général ?",
      a: "Le quiz compatibilité (10 questions) couvre budget, climat, voiture, famille — il croise des axes lifestyle. Ce quiz-ci est focalisé sur les 3 piliers Cadre de Vie F52 (env/santé/emploi) avec un recompute déterministe et partageable.",
    },
    {
      q: "Comment partager mon résultat ?",
      a: "Le résultat est encodé dans le hash de l'URL (#e=...&s=...&j=...). Cliquez sur « Copier le lien » : la personne qui ouvrira l'URL verra exactement votre pondération.",
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
          <Link href="/cadre-de-vie" className="hover:underline">Cadre de vie</Link>
        </nav>

        <Badge variant="accent" className="mb-3">
          ✨ Recompute en direct
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Personnalise ton Cadre de Vie
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-2xl">
          Pondère les 3 piliers (environnement, santé, emploi) selon ce qui compte le plus
          pour ton projet. Le top 10 villes se recalcule à chaque réglage. Pondération
          par défaut : 35 / 30 / 35 (Index F52 standard).
        </p>

        <div className="mt-8">
          <PersonalQolQuiz />
        </div>

        <p className="mt-6 text-xs text-[var(--text-tertiary)]">
          Sous-scores affichés : 10 = bon sur la dimension (déjà inversés depuis F44 / F47 /
          F50). Composite perso = moyenne pondérée des 3 sous-scores selon les poids choisis.
        </p>

        <div className="mt-8 text-sm flex flex-wrap gap-3">
          <Link href="/cadre-de-vie" className="text-[var(--accent)] hover:underline">
            → Classement national standard
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
