import { Metadata } from "next";
import { QuizFlow } from "./QuizFlow";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Quiz — Trouvez votre ville idéale en France | MeilleurVille",
  description:
    "Quiz de matching en 3 minutes : 6 questions pour trouver la ville française parfaite pour vous. Algorithme pondéré sur 352 villes.",
  alternates: { canonical: "/quiz" },
  openGraph: {
    title: "Quiz de matching — Trouvez votre ville idéale",
    description:
      "3 minutes · 6 questions · 352 villes analysées. Quel est votre profil géographique ?",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const quizBreadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Quiz", path: "/quiz" },
]);

export default function QuizPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(quizBreadcrumb)} />
      <AmbientBackground />
      <Navbar />
      <QuizFlow />
      <Footer />
    </main>
  );
}
