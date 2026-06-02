"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { verifyLoginToken } from "@/lib/auth-client";

const IS_EN = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") === "en";
const t = (fr: string, en: string) => (IS_EN ? en : fr);
const HOME_PATH = IS_EN ? "/my-account" : "/mes-villes";
const LOGIN_PATH = IS_EN ? "/sign-in" : "/connexion";

type State = "verifying" | "ok" | "error";

export function CallbackClient() {
  const [state, setState] = useState<State>("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    // Scrub the token from the URL bar + history immediately so it can't leak
    // via browser history or a Referer header on subsequent navigations.
    if (token) window.history.replaceState(null, "", window.location.pathname);
    if (!token) {
      setState("error");
      setError(t("Lien de connexion incomplet.", "Incomplete sign-in link."));
      return;
    }
    let cancelled = false;
    verifyLoginToken(token).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setState("ok");
        const next = params.get("next");
        const dest = next && next.startsWith("/") ? next : HOME_PATH;
        // Small delay so the success state is visible, then hard-navigate.
        window.setTimeout(() => {
          window.location.replace(dest);
        }, 700);
      } else {
        setState("error");
        setError(res.error ?? t("Lien invalide ou expiré.", "Invalid or expired link."));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-3xl glass-strong border border-white/60 p-8 text-center shadow-md">
      {state === "verifying" && (
        <>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[var(--accent)] mb-4" />
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">{t("Connexion en cours…", "Signing you in…")}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("Vérification de votre lien.", "Verifying your link.")}</p>
        </>
      )}
      {state === "ok" && (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--accent)] mb-4" />
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">{t("Connecté !", "Signed in!")}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("Redirection vers votre espace…", "Taking you to your account…")}</p>
        </>
      )}
      {state === "error" && (
        <>
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">{t("Connexion impossible", "Sign-in failed")}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{error}</p>
          <a
            href={LOGIN_PATH}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            {t("Redemander un lien", "Request a new link")}
          </a>
        </>
      )}
    </div>
  );
}
