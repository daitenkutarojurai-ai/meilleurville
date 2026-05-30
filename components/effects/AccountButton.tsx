"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { User } from "lucide-react";
import { subscribeAuth, getAuthSnapshot, getServerAuthSnapshot } from "@/lib/auth-client";

export function AccountButton() {
  const loggedIn = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);

  const href = loggedIn ? "/mes-villes" : "/connexion";
  const ariaLabel = loggedIn ? "Mon espace" : "Se connecter";

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="inline-flex items-center justify-center rounded-full p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <User className="h-4 w-4" strokeWidth={loggedIn ? 2.5 : 2} />
    </Link>
  );
}
