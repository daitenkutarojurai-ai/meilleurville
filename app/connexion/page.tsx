import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ClientSignIn } from "./ClientSignIn";

export const metadata: Metadata = {
  title: "Connexion · MaVilleIdeal",
  description: "Connectez-vous pour sauvegarder vos villes favorites et accéder à votre espace personnel.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/connexion" },
};

export default async function ConnexionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/mes-villes");

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-24 pb-16 flex flex-col items-center">
        <div className="w-full max-w-md px-4 sm:px-0">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-3">
              Mon espace
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
              Connectez-vous
            </h1>
            <p className="text-[var(--text-secondary)]">
              Sauvegardez vos villes favorites, accédez à votre espace personnel.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)]/80 backdrop-blur p-6 shadow-[0_8px_32px_-12px_rgba(31,58,42,0.10)]">
            <ClientSignIn />
          </div>

          <p className="text-center text-xs text-[var(--text-tertiary)] mt-6">
            En continuant, vous acceptez nos{" "}
            <a href="/cgu" className="underline underline-offset-2 hover:text-[var(--accent)] transition-colors">
              CGU
            </a>{" "}
            et notre{" "}
            <a href="/confidentialite" className="underline underline-offset-2 hover:text-[var(--accent)] transition-colors">
              politique de confidentialité
            </a>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
