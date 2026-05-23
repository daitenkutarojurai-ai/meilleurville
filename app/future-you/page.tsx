import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { FutureYouClient } from "./FutureYouClient";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

export const metadata: Metadata = {
  title: "Future You — votre vie dans une autre ville en chiffres",
  description:
    "Salaire, foyer, mode de vie, priorités : on simule ce qu'il vous resterait chaque mois, combien d'heures libres par semaine et votre niveau de stress dans les 3 meilleures villes pour vous.",
  alternates: { canonical: "/future-you" },
  openGraph: {
    title: "Future You — la vie en chiffres",
    description: "Simulation honnête de votre vie dans une autre ville.",
  },
};

export default function FutureYouPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Future You", path: "/future-you" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Simulateur · Beta</Badge>
          <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--accent)] font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            R11.1 Future You
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Votre vie, en chiffres, dans une autre ville
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            On combine salaire, foyer, mode de déplacement et priorités pour
            estimer concrètement ce qu&apos;il vous resterait chaque mois, combien
            d&apos;heures libres vous auriez et votre niveau de stress quotidien
            dans les 3 villes qui vous correspondent le mieux.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <FutureYouClient />
      </div>

      <Footer />
    </main>
  );
}
