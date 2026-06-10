import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Badge } from "@/components/ui/Badge";
import { CompatibilityQuiz } from "@/components/CompatibilityQuiz";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Quiz compatibilité ville 2026 · Top 5",
  description: `Quiz de compatibilité ville : 10 questions sur votre budget, climat, situation, mode de travail. Algorithme calibré sur ${CITIES_COUNT} villes françaises. Top 5 avec score % et explication par critère.`,
  alternates: { canonical: "/quiz-compatibilite" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Quiz compatibilité", path: "/quiz-compatibilite" },
]);

export default function QuizCompatibilitePage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            ✨ Matching quantitatif
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
            Quelle ville vous correspond vraiment ?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            10 questions sur votre vie réelle (budget, climat, voiture, situation, priorités).
            Algorithme calibré sur les {CITIES_COUNT} villes du site. Résultat : Top 5 avec score % et
            décomposition critère par critère.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <CompatibilityQuiz />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 text-center text-xs text-[var(--text-tertiary)]">
        <p>
          Distinct du{" "}
          <Link href="/city-match" className="underline">
            quiz qualitatif
          </Link>{" "}
          : ici le score est un pourcentage, et chaque critère affiche sa contribution chiffrée.
          Méthodologie complète sur{" "}
          <Link href="/methode" className="underline">
            la page méthode
          </Link>
          .
        </p>
      </div>

      <Footer />
    </main>
  );
}
