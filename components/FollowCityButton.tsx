"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { authFetch, getToken, fetchMe } from "@/lib/auth-client";

interface Props {
  citySlug: string;
  cityName: string;
  /** Rendered inside CityProfile on both domains; it used to say « Suivre » on the EN site. */
  locale?: "fr" | "en";
}

// R9.3 — "Suivre cette ville". For logged-in users this creates a score+comments
// alerte (the working D1 alertes pipeline, keyed to the account email). Anonymous
// visitors are sent to /connexion. Replaces the old dead Supabase `alerts` path.
export function FollowCityButton({ citySlug, cityName, locale = "fr" }: Props) {
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const loginHref = locale === "en" ? `/sign-in?next=/cities/${citySlug}` : `/connexion?next=/villes/${citySlug}`;
  const [following, setFollowing] = useState(false);
  // Démarre à `false`, pas à `true` : un visiteur anonyme est le cas normal, et
  // la bonne réponse pour lui est « Suivre ». Partir de `loading` affichait un
  // spinner « Chargement » sous le H1 des 540 pages ville jusqu'à l'hydratation
  // — plusieurs secondes, le temps que le JS de CityProfile arrive. On ne passe
  // en chargement que quand il y a réellement une session à interroger.
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [unsubToken, setUnsubToken] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) return;
    setLoading(true);
    let cancelled = false;
    fetchMe().then(async (user) => {
      if (cancelled || !user) {
        setLoading(false);
        return;
      }
      setEmail(user.email);
      try {
        const res = await authFetch("/api/alertes/list");
        const data = (await res.json()) as { alertes: { citySlug: string; unsubscribeToken: string }[] };
        const match = data.alertes.find((a) => a.citySlug === citySlug);
        if (!cancelled && match) {
          setFollowing(true);
          setUnsubToken(match.unsubscribeToken);
        }
      } catch {
        /* ignore — default to not-following */
      }
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [citySlug]);

  async function toggle() {
    if (!email) {
      window.location.href = loginHref;
      return;
    }
    setLoading(true);
    if (following && unsubToken) {
      await fetch(`/api/alertes/unsubscribe?token=${unsubToken}`).catch(() => {});
      setFollowing(false);
      setUnsubToken(null);
    } else {
      await authFetch("/api/alertes/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, citySlug, types: ["score", "comments"] }),
      }).catch(() => {});
      setFollowing(true);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-tertiary)] cursor-default"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {t("Chargement", "Loading")}
      </button>
    );
  }

  if (!getToken()) {
    return (
      <a
        href={loginHref}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        title={t(`Suivre ${cityName}`, `Follow ${cityName}`)}
      >
        <Bell className="h-3.5 w-3.5" />
        {t("Suivre", "Follow")}
      </a>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
        following
          ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
      title={following ? t(`Ne plus suivre ${cityName}`, `Unfollow ${cityName}`) : t(`Suivre ${cityName}`, `Follow ${cityName}`)}
    >
      {following ? (
        <>
          <BellOff className="h-3.5 w-3.5" />
          {t("Suivi actif", "Following")}
        </>
      ) : (
        <>
          <Bell className="h-3.5 w-3.5" />
          {t("Suivre", "Follow")}
        </>
      )}
    </button>
  );
}
