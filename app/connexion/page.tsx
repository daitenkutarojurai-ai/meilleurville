import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ConnexionForm } from "./ConnexionForm";

export const metadata: Metadata = {
  title: "Connexion · MaVilleIdéale",
  description:
    "Connectez-vous à MaVilleIdéale par lien magique — sans mot de passe. Retrouvez vos villes favorites, vos avis et vos alertes sur tous vos appareils.",
  alternates: { canonical: "/connexion" },
  robots: { index: true, follow: true },
};

export default function ConnexionPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-24 pb-24">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
              Votre espace
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
              Se connecter
            </h1>
            <p className="text-[var(--text-secondary)]">
              Pas de mot de passe. On vous envoie un lien de connexion par email.
            </p>
          </div>
          <ConnexionForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
