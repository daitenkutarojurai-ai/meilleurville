import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CityMatchQuiz } from "./CityMatchQuiz";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

export const metadata: Metadata = {
  title: "City Match — quelle ville française vous correspond vraiment ?",
  description:
    "8 questions, 90 secondes : on calcule votre match personnel parmi 540 villes françaises. Top 3 + match surprise, classement live à chaque réponse, lien partageable.",
  alternates: { canonical: "/city-match" },
  openGraph: {
    title: "City Match · Le Tinder des villes françaises",
    description: "8 questions → vos 3 villes qui collent à votre vie.",
  },
};

export default function CityMatchPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "City Match", path: "/city-match" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">City Match</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            La ville qui colle à votre vie
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Pas un palmarès universel : votre <em>match</em> personnel. 8 questions,
            classement live, lien partageable. Aucun email demandé.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <CityMatchQuiz />
      </div>

      <Footer />
    </main>
  );
}
