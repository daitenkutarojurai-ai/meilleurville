import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ConnexionForm } from "@/app/connexion/ConnexionForm";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Sign in · BestCitiesInFrance",
  description:
    "Sign in to BestCitiesInFrance with a magic link — no password. Keep your saved cities, reviews and alerts in sync across every device.",
  alternates: { canonical: `${EN_BASE}/sign-in` },
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-24 pb-24">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
              Your account
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
              Sign in
            </h1>
            <p className="text-[var(--text-secondary)]">
              No password. We email you a sign-in link.
            </p>
          </div>
          <ConnexionForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
