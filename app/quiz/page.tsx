import { Metadata } from "next";
import { QuizFlow } from "./QuizFlow";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Quiz · Trouvez votre ville idéale en France | MaVilleIdeal",
  description: `Quiz de matching en 3 minutes : 6 questions pour trouver la ville française parfaite pour vous. Algorithme pondéré sur ${CITIES_COUNT} villes.`,
  alternates: { canonical: "/city-match" },
  openGraph: {
    title: "Quiz de matching · Trouvez votre ville idéale",
    description: `3 minutes · 6 questions · ${CITIES_COUNT} villes analysées. Quel est votre profil géographique ?`,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const quizBreadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Quiz", path: "/city-match" },
]);

export default function QuizPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(quizBreadcrumb)} />
      <AmbientBackground />
      <Navbar />
      <h1 className="sr-only">Quiz · Trouvez votre ville idéale en France</h1>
      <QuizFlow />
      <Footer />
    </main>
  );
}
