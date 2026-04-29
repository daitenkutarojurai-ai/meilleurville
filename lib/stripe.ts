import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const PLANS = {
  pro: {
    name: "MeilleurVille Pro",
    price: 9.9,
    currency: "eur",
    interval: "month" as const,
    features: [
      "Profils de quartiers complets",
      "Red Flag Radar illimité",
      "Rapport IA personnalisé (PDF)",
      "Alertes nouvelles avis sur vos villes",
      "Historique comparaisons illimité",
      "Export données CSV",
      "Support prioritaire",
    ],
    priceId: process.env.STRIPE_PRICE_ID_PRO ?? "price_placeholder",
  },
} as const;

export type PlanKey = keyof typeof PLANS;
