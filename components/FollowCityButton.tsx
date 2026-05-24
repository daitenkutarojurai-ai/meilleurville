"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  citySlug: string;
  cityName: string;
}

// R9.3 — "Suivre cette ville" alert subscription.
// Writes a sentinel row to the alerts table (metric:"global", direction:"any", threshold:0)
// which represents a general city-watch subscription.
// If the user is not logged in, redirects to /connexion.
export function FollowCityButton({ citySlug, cityName }: Props) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      setSessionUser(user.id);
      supabase
        .from("alerts")
        .select("id")
        .eq("user_id", user.id)
        .eq("city_slug", citySlug)
        .eq("metric", "global")
        .maybeSingle()
        .then(({ data }) => {
          setFollowing(!!data);
          setLoading(false);
        });
    });
  }, [citySlug]);

  async function toggle() {
    if (!sessionUser) {
      window.location.href = `/connexion?next=/villes/${citySlug}`;
      return;
    }
    const supabase = createClient();
    setLoading(true);
    if (following) {
      await supabase
        .from("alerts")
        .delete()
        .eq("user_id", sessionUser)
        .eq("city_slug", citySlug)
        .eq("metric", "global");
      setFollowing(false);
    } else {
      await supabase.from("alerts").upsert(
        {
          user_id: sessionUser,
          city_slug: citySlug,
          metric: "global",
          direction: "any",
          threshold: 0,
          active: true,
        },
        { onConflict: "user_id,city_slug,metric" },
      );
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

  if (!sessionUser) {
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
