import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Sparkles, ArrowRight, MapPin } from "lucide-react";
import { PLANS } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Bienvenue sur Pro — MeilleurVille",
};

const NEXT_STEPS = [
  { icon: MapPin, text: "Explorez les profils de quartiers de votre ville cible", href: "/villes" },
  { icon: Sparkles, text: "Générez votre rapport IA personnalisé", href: "/quiz" },
];

export default function PremiumSuccessPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/10 border-2 border-emerald-400/30">
          <CheckCircle className="h-10 w-10 text-emerald-400" />
        </div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-sm text-[var(--accent)]">
          <Sparkles className="h-3.5 w-3.5" />
          MeilleurVille Pro activé
        </div>
        <h1 className="mt-4 mb-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
          Bienvenue dans la version Pro !
        </h1>
        <p className="mb-8 max-w-md text-[var(--text-secondary)]">
          Votre abonnement est actif. Vous avez maintenant accès à tous les
          profils de quartiers, Red Flags, rapports IA et alertes.
        </p>
        <div className="mb-10 grid gap-3 sm:grid-cols-2 max-w-lg w-full">
          {NEXT_STEPS.map(({ icon: Icon, text, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-left hover:border-[var(--accent)]/40 transition-colors group"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10">
                <Icon className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                {text}
              </span>
              <ArrowRight className="ml-auto h-4 w-4 text-[var(--text-secondary)]" />
            </Link>
          ))}
        </div>
        <div className="flex gap-3">
          <Link href="/villes">
            <Button size="lg">Explorer les villes</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary">Mon tableau de bord</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
