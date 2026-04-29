"use client";
import { useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PremiumCheckout() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planKey: "pro",
          email: email || undefined,
          successUrl: `${window.location.origin}/premium/success`,
          cancelUrl: `${window.location.origin}/premium`,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Erreur lors de la création du paiement");
        setLoading(false);
      }
    } catch {
      setError("Problème de connexion. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCheckout} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.fr (optionnel)"
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent)]/50 transition-colors"
      />
      <Button
        type="submit"
        size="lg"
        className="w-full gap-2 shadow-xl shadow-[var(--accent)]/20"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirection...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Démarrer l'essai gratuit
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}
      <p className="text-[10px] text-center text-[var(--text-secondary)]">
        Paiement sécurisé Stripe · SSL
      </p>
    </form>
  );
}
