import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PremiumCheckout } from "./PremiumCheckout";
import { PLANS } from "@/lib/stripe";
import { CheckCircle, Sparkles, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "MeilleurVille Pro — Accès complet à l'intelligence urbaine",
  description:
    "Débloquez les profils de quartiers, Red Flag Radar, rapports IA personnalisés et alertes. 9,90€/mois, résiliation libre, 7 jours d'essai gratuit.",
};

const TRUST_SIGNALS = [
  { icon: Shield, text: "Résiliation à tout moment, sans engagement" },
  { icon: Zap, text: "7 jours d'essai gratuit, aucune carte requise" },
  { icon: Sparkles, text: "Rapport IA généré en moins de 30 secondes" },
];

export default function PremiumPage() {
  const plan = PLANS.pro;

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg-canvas)] py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-1.5 text-sm text-[var(--accent)]">
            <Sparkles className="h-3.5 w-3.5" />
            MeilleurVille Pro
          </div>
          <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-[var(--text-primary)] leading-tight">
            L'intelligence urbaine complète.{" "}
            <span className="gradient-text">Enfin.</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-xl mx-auto">
            Tout ce qu'il faut pour prendre la meilleure décision de votre vie.
          </p>
        </div>
      </section>

      {/* Pricing + features */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid gap-12 lg:grid-cols-2 items-start">
        {/* Feature list */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            Ce qui change avec Pro
          </h2>
          <div className="space-y-4">
            {[
              {
                title: "Profils de quartiers complets",
                desc: "Scores détaillés par quartier, carte interactive, ambiance Vibe DNA, historique temporel.",
                free: false,
              },
              {
                title: "Red Flag Radar illimité",
                desc: "Accès à tous les signalements vérifiés avec géolocalisation précise et sources.",
                free: false,
              },
              {
                title: "Rapport IA personnalisé (PDF)",
                desc: "Analyse Claude complète de votre ville cible : adéquation profil, risques, opportunités.",
                free: false,
              },
              {
                title: "Alertes email nouveaux avis",
                desc: "Soyez notifié en temps réel quand un nouvel avis est posté sur vos villes sauvegardées.",
                free: false,
              },
              {
                title: "Comparaisons illimitées",
                desc: "Jusqu'à 5 villes en parallèle avec export CSV des scores.",
                free: "2 villes",
              },
              {
                title: "Avis des habitants",
                desc: "Accès aux avis complets avec historique illimité.",
                free: "3 avis visibles",
              },
              {
                title: "Quiz IA + résultats",
                desc: "Quiz de matching et top 5 résultats.",
                free: true,
              },
              {
                title: "Scores de base",
                desc: "Scores globaux et par critère pour toutes les villes.",
                free: true,
              },
            ].map(({ title, desc, free }) => (
              <div key={title} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${free === false ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"}`}>
                  <CheckCircle className="h-3 w-3" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{title}</span>
                    {free === false && (
                      <span className="rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent)]">Pro</span>
                    )}
                    {typeof free === "string" && (
                      <span className="text-[10px] text-[var(--text-secondary)]">(gratuit : {free})</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout card */}
        <div className="lg:sticky lg:top-24">
          <div className="rounded-3xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] p-8 shadow-2xl shadow-[var(--accent)]/10">
            <div className="mb-2 text-center">
              <div className="text-5xl font-bold font-mono-data text-[var(--text-primary)]">
                {plan.price.toFixed(2).replace(".", ",")}€
              </div>
              <div className="text-[var(--text-secondary)] text-sm mt-1">par mois · sans engagement</div>
            </div>
            <div className="my-6 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-3 text-center text-sm text-emerald-400">
              🎁 7 jours d'essai gratuit — aucune carte requise
            </div>
            <PremiumCheckout />
            <div className="mt-6 space-y-2">
              {TRUST_SIGNALS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <Icon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--accent)]" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-6 space-y-3">
            {[
              { q: "Comment fonctionne l'essai gratuit ?", a: "7 jours d'accès complet. Si vous ne souhaitez pas continuer, annulez avant la fin de la période d'essai — aucun prélèvement." },
              { q: "Puis-je annuler quand je veux ?", a: "Oui, sans frais ni engagement. La résiliation prend effet à la fin de la période en cours." },
              { q: "Mes données sont-elles sécurisées ?", a: "Paiement sécurisé Stripe. Nous ne stockons jamais vos données bancaires." },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-[var(--text-primary)] list-none">
                  {q}
                  <span className="text-[var(--text-secondary)] group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="px-4 pb-3 text-xs text-[var(--text-secondary)] leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
