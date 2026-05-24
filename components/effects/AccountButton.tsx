"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AccountButton() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

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
