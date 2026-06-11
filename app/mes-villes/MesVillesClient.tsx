"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Star, Bell, LogOut, Loader2, MapPin, LineChart, Pencil, Check, X } from "lucide-react";
import { CityCard } from "@/components/CityCard";
import type { CityLight } from "@/lib/cities-light";
import { authFetch, getToken, logout } from "@/lib/auth-client";
import type { City } from "@/lib/types";

const IS_EN = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") === "en";
const t = (fr: string, en: string) => (IS_EN ? en : fr);
const LOGIN_PATH = IS_EN ? "/sign-in" : "/connexion";
const HOME_PATH = IS_EN ? "/my-account" : "/mes-villes";
const REDIRECT_TO_LOGIN = `${LOGIN_PATH}?next=${HOME_PATH}`;
const CITIES_PATH = IS_EN ? "/cities" : "/villes";
const DATE_LOCALE = IS_EN ? "en-GB" : "fr-FR";

function seedToCity(s: CityLight): City {
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    region: s.region,
    department: s.department,
    population: s.population,
    latitude: s.latitude,
    longitude: s.longitude,
    scores: s.scores,
    characterTags: s.characterTags,
    reviewCount: 180 + Math.floor(s.scores.global * 30),
    sunshinedays: s.sunshinedays,
    avgTempJuly: s.avgTempJuly,
    avgTempJanuary: s.avgTempJanuary,
  };
}

interface Contribution {
  id: string;
  topic: string;
  body: string;
  rating?: number;
  type?: "comment" | "question";
  createdAt: string;
}
interface SavedProjection {
  id: string;
  citySlug: string;
  cityName: string;
  label: string;
  createdAt: string;
}
interface AccountData {
  user: { id: string; email: string; handle: string | null } | null;
  favorites: string[];
  contributions: Contribution[];
  contributionCount: number;
  projections: SavedProjection[];
  alertes: { citySlug: string; cityName: string; types: string[] }[];
}

function HandleEditor({ initial, onSaved }: { initial: string | null; onSaved: (h: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const handle = value.trim();
    if (handle.length < 2 || handle.length > 40) {
      setError(t("2 à 40 caractères.", "2 to 40 characters."));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await authFetch("/api/auth/handle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      const d = (await res.json().catch(() => ({}))) as { ok?: boolean; handle?: string; error?: string };
      if (res.ok && d.handle) {
        onSaved(d.handle);
        setEditing(false);
      } else {
        setError(d.error ?? t("Erreur.", "Error."));
      }
    } catch {
      setError(t("Erreur réseau.", "Network error."));
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
      >
        <Pencil className="h-3 w-3" />
        {initial ? t("Modifier mon pseudo", "Edit my display name") : t("Choisir un pseudo public", "Choose a public display name")}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={40}
          placeholder={t("Votre pseudo public", "Your public display name")}
          autoFocus
          className="rounded-lg border border-[var(--border)] bg-white/80 px-2.5 py-1 text-sm outline-none focus:border-[var(--accent)]/60"
        />
        <button type="button" onClick={save} disabled={saving} aria-label={t("Enregistrer", "Save")} className="text-[var(--accent)] hover:opacity-80 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
        <button type="button" onClick={() => { setEditing(false); setValue(initial ?? ""); setError(null); }} aria-label={t("Annuler", "Cancel")} className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && <span className="text-xs text-rose-600">{error}</span>}
      <span className="text-[10px] text-[var(--text-tertiary)]">{t("Affiché sur vos avis et questions.", "Shown on your reviews and questions.")}</span>
    </div>
  );
}

export function MesVillesClient({ cities }: { cities: CityLight[] }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AccountData | null>(null);

  useEffect(() => {
    if (!getToken()) {
      window.location.replace(REDIRECT_TO_LOGIN);
      return;
    }
    let cancelled = false;
    authFetch("/api/account")
      .then(async (res) => {
        if (res.status === 401) {
          window.location.replace(REDIRECT_TO_LOGIN);
          return null;
        }
        return (await res.json()) as AccountData;
      })
      .then((d) => {
        if (cancelled || !d) return;
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="relative pt-28 pb-28">
        <div className="mx-auto max-w-md px-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[var(--accent)]" />
          <p className="mt-4 text-sm text-[var(--text-secondary)]">{t("Chargement de votre espace…", "Loading your account…")}</p>
        </div>
      </section>
    );
  }

  if (!data || !data.user) {
    return (
      <section className="relative pt-28 pb-28">
        <div className="mx-auto max-w-md px-4 text-center">
          <p className="text-sm text-[var(--text-secondary)]">{t("Session expirée.", "Session expired.")}</p>
          <a href={LOGIN_PATH} className="mt-4 inline-block text-[var(--accent)] hover:underline">
            {t("Se reconnecter", "Sign in again")}
          </a>
        </div>
      </section>
    );
  }

  const favoriteCities = data.favorites
    .map((slug) => cities.find((c) => c.slug === slug))
    .filter((c): c is CityLight => Boolean(c))
    .map(seedToCity);

  const displayName = data.user.handle || data.user.email.split("@")[0];

  return (
    <>
      <section className="relative pt-20 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-3xl glass-strong border border-white/60 p-6 shadow-md">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-emerald-700 ring-1 ring-white/40 text-xl font-bold text-white shadow-lg uppercase">
              {displayName.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {data.user.handle ? t(`Bonjour ${data.user.handle}`, `Hi ${data.user.handle}`) : t("Mon espace", "My account")}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">{data.user.email}</p>
              <div className="mt-1.5">
                <HandleEditor
                  initial={data.user.handle}
                  onSaved={(h) =>
                    setData((prev) => (prev && prev.user ? { ...prev, user: { ...prev.user, handle: h } } : prev))
                  }
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                window.location.replace("/");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              <LogOut className="h-4 w-4" />
              {t("Se déconnecter", "Sign out")}
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          {[
            { icon: Heart, label: t("Villes favorites", "Saved cities"), value: data.favorites.length, color: "text-[var(--accent-pink)]" },
            { icon: Star, label: t("Contributions", "Contributions"), value: data.contributionCount, color: "text-amber-500" },
            { icon: Bell, label: t("Alertes actives", "Active alerts"), value: data.alertes.length, color: "text-[var(--accent)]" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 flex items-center gap-4">
              <Icon className={`h-6 w-6 ${color}`} />
              <div>
                <div className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">{value}</div>
                <div className="text-xs text-[var(--text-secondary)]">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Favorites */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-[var(--accent-pink)]" />
              <h2 className="font-semibold text-[var(--text-primary)]">{t("Villes favorites", "Saved cities")}</h2>
            </div>
            <Link href={CITIES_PATH} className="text-xs text-[var(--accent)] hover:underline">
              {t("Explorer →", "Explore →")}
            </Link>
          </div>
          {favoriteCities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/60 p-8 text-center text-sm text-[var(--text-secondary)]">
              {IS_EN ? (
                <>No saved cities yet. Tap the ❤️ on any city to save it here, across all your devices.</>
              ) : (
                <>Aucune ville favorite pour l&apos;instant. Cliquez sur le ❤️ d&apos;une ville pour la sauvegarder ici, sur tous vos appareils.</>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteCities.map((city) => (
                <CityCard key={city.slug} city={city} />
              ))}
            </div>
          )}
        </section>

        {/* Saved projections */}
        {data.projections.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <LineChart className="h-4 w-4 text-[var(--accent)]" />
              <h2 className="font-semibold text-[var(--text-primary)]">{t("Projections sauvegardées", "Saved projections")}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.projections.map((p) => (
                <Link
                  key={p.id}
                  href={`/projection-5ans?ville=${p.citySlug}`}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">{p.cityName}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{p.label}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Contributions */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">{t("Mes contributions", "My contributions")}</h2>
          </div>
          {data.contributions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/60 p-8 text-center text-sm text-[var(--text-secondary)]">
              {IS_EN ? (
                <>You haven&apos;t posted a review yet. Share your experience on a city page.</>
              ) : (
                <>Vous n&apos;avez pas encore publié d&apos;avis. Partagez votre expérience sur la page d&apos;une ville.</>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {data.contributions.map((c) => {
                const citySlug = c.topic.startsWith("city:") ? c.topic.slice(5) : null;
                const city = citySlug ? cities.find((x) => x.slug === citySlug) : null;
                return (
                  <div key={c.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {city ? city.name : c.topic}
                        {c.type === "question" && (
                          <span className="ml-2 text-xs text-[var(--accent)]">· {t("question", "question")}</span>
                        )}
                      </span>
                      {typeof c.rating === "number" && (
                        <span className="flex items-center gap-1 text-sm font-bold font-mono-data text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {c.rating}/5
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-3">{c.body}</p>
                    <div className="mt-2 text-xs text-[var(--text-tertiary)]">
                      {new Date(c.createdAt).toLocaleDateString(DATE_LOCALE)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
