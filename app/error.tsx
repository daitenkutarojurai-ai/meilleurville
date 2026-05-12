"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Home, RotateCcw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main id="main-content" className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--danger)]/10 border border-[var(--danger)]/20">
        <AlertTriangle className="h-8 w-8 text-[var(--danger)]" />
      </div>
      <h1 className="mb-3 text-2xl font-bold text-[var(--text-primary)]">
        Une erreur s&apos;est produite
      </h1>
      <p className="mb-2 max-w-md text-[var(--text-secondary)]">
        Quelque chose s&apos;est mal passé pendant le chargement de cette page.
        Vous pouvez réessayer ou revenir à l&apos;accueil.
      </p>
      {error.digest && (
        <p className="mb-8 font-mono-data text-xs text-[var(--text-tertiary)]">
          Code : {error.digest}
        </p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={reset} size="lg" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Réessayer
        </Button>
        <Link href="/">
          <Button size="lg" variant="secondary" className="gap-2">
            <Home className="h-4 w-4" />
            Retour à l&apos;accueil
          </Button>
        </Link>
      </div>
    </main>
  );
}
