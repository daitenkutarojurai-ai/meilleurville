"use client";
import Link from "next/link";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PremiumGateProps {
  feature: string;
  preview?: React.ReactNode;
  className?: string;
}

export function PremiumGate({ feature, preview, className }: PremiumGateProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-[var(--accent)]/20", className)}>
      {/* Blurred preview */}
      {preview && (
        <div className="pointer-events-none select-none" aria-hidden>
          <div className="blur-sm opacity-40">{preview}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/60 to-transparent" />
        </div>
      )}

      {/* CTA overlay */}
      <div className={cn(
        "flex flex-col items-center text-center gap-3 p-6",
        preview ? "absolute inset-0 justify-center" : ""
      )}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <Lock className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <div>
          <p className="font-semibold text-[var(--text-primary)] mb-1">{feature}</p>
          <p className="text-xs text-[var(--text-secondary)]">
            Disponible avec MeilleurVille Pro · 9,90€/mois
          </p>
        </div>
        <Link href="/premium">
          <Button size="sm" className="gap-2 shadow-lg shadow-[var(--accent)]/20">
            <Sparkles className="h-3.5 w-3.5" />
            Essai 7j gratuit
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function PremiumBanner({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-r from-[var(--accent)]/10 via-[var(--bg-elevated)] to-[var(--bg-elevated)] px-5 py-4",
      className
    )}>
      <Sparkles className="h-5 w-5 text-[var(--accent)] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          Débloquez les quartiers, Red Flags et rapport IA
        </p>
        <p className="text-xs text-[var(--text-secondary)]">
          MeilleurVille Pro · 9,90€/mois · 7 jours gratuits
        </p>
      </div>
      <Link href="/premium" className="flex-shrink-0">
        <Button size="sm" className="gap-1.5 whitespace-nowrap">
          Essayer
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}
