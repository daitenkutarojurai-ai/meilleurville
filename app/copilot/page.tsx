import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CopilotClient } from "./CopilotClient";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Copilote Déménagement IA · MaVilleIdeal",
  description:
    "Posez vos questions à notre assistant IA : il connaît les 352 villes françaises, leurs loyers, scores de qualité de vie, fiscalité et transports. Recommandations personnalisées en quelques secondes.",
  alternates: { canonical: "/copilot" },
  openGraph: {
    title: "Copilote Déménagement IA",
    description: "352 villes · données 2026 · recommandations personnalisées",
  },
};

export default function CopilotPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Copilote IA", path: "/copilot" },
  ]);

  return (
    <>
      {jsonLdScript(breadcrumb)}
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />
        <div className="pt-16">
          <div className="mx-auto max-w-2xl px-0 sm:px-4">
            <div className="sm:rounded-2xl sm:border sm:border-[var(--border)] overflow-hidden bg-[var(--bg-canvas)] shadow-lg">
              <CopilotClient />
            </div>
          </div>
        </div>
        <div className="sm:hidden">
          <Footer />
        </div>
      </main>
    </>
  );
}
