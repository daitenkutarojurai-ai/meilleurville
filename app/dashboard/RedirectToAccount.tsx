"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function RedirectToAccount() {
  useEffect(() => {
    window.location.replace("/mes-villes");
  }, []);
  return (
    <section className="relative pt-28 pb-28">
      <div className="mx-auto max-w-md px-4 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--accent)]" />
        <p className="mt-4 text-sm text-[var(--text-secondary)]">Redirection vers votre espace…</p>
      </div>
    </section>
  );
}
