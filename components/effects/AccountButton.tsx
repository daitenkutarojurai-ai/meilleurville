"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { User } from "lucide-react";
import {
  subscribeAuth,
  getAuthSnapshot,
  getServerAuthSnapshot,
  getIdentity,
} from "@/lib/auth-client";

const IS_EN = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") === "en";

const COPY = IS_EN
  ? { signedIn: "My account · signed in", signIn: "Sign in", home: "/my-account", login: "/sign-in" }
  : { signedIn: "Mon espace · connecté", signIn: "Se connecter", home: "/mes-villes", login: "/connexion" };

export function AccountButton() {
  const loggedIn = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const [initial, setInitial] = useState<string | null>(null);

  // Pull the identity once logged in so the avatar can show a personal initial
  // (legit async data fetch — getIdentity is cached per token in auth-client).
  useEffect(() => {
    if (!loggedIn) {
      setInitial(null);
      return;
    }
    let alive = true;
    getIdentity().then((u) => {
      if (!alive || !u) return;
      const src = (u.handle || u.email || "").trim();
      setInitial(src ? src[0]!.toUpperCase() : null);
    });
    return () => {
      alive = false;
    };
  }, [loggedIn]);

  if (loggedIn) {
    return (
      <Link
        href={COPY.home}
        aria-label={COPY.signedIn}
        title={COPY.signedIn}
        className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-sm ring-2 ring-[var(--accent)]/20 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        {initial ? (
          <span className="text-[13px] font-semibold leading-none">{initial}</span>
        ) : (
          <User className="h-4 w-4" strokeWidth={2.5} />
        )}
        {/* Connected hint — a small green presence dot with a soft pulse ring. */}
        <span
          aria-hidden
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--bg-canvas)] bg-emerald-500"
        >
          <span className="absolute inset-0 rounded-full bg-emerald-500 motion-safe:animate-ping opacity-60" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={COPY.login}
      aria-label={COPY.signIn}
      title={COPY.signIn}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] py-1.5 pl-2.5 pr-3 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <User className="h-4 w-4" strokeWidth={2} />
      <span>{COPY.signIn}</span>
    </Link>
  );
}
