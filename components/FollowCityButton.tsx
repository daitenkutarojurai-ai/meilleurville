"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { authFetch, getToken, fetchMe } from "@/lib/auth-client";

interface Props {
  citySlug: string;
  cityName: string;
}

// R9.3 — "Suivre cette ville". For logged-in users this creates a score+comments
// alerte (the working D1 alertes pipeline, keyed to the account email). Anonymous
// visitors are sent to /connexion. Replaces the old dead Supabase `alerts` path.
export function FollowCityButton({ citySlug, cityName }: Props) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [unsubToken, setUnsubToken] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetchMe().then(async (user) => {
      if (cancelled || !user) {
        setLoading(false);
        return;
      }
      setEmail(user.email);
      try {
        const res = await fetch(`/api/alertes/list?email=${encodeURIComponent(user.email)}`);
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
      window.location.href = `/connexion?next=/villes/${citySlug}`;
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
        Chargement
      </button>
    );
  }

  if (!getToken()) {
    return (
      <a
        href={`/connexion?next=/villes/${citySlug}`}
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        title={`Suivre ${cityName}`}
      >
        <Bell className="h-3.5 w-3.5" />
        Suivre
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
      title={following ? `Ne plus suivre ${cityName}` : `Suivre ${cityName}`}
    >
      {following ? (
        <>
          <BellOff className="h-3.5 w-3.5" />
          Suivi actif
        </>
      ) : (
        <>
          <Bell className="h-3.5 w-3.5" />
          Suivre
        </>
      )}
    </button>
  );
}
