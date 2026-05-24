import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CITIES_SEED } from "@/data/cities-seed";
import type { City } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CityCard } from "@/components/CityCard";
import { SignOutButton } from "./SignOutButton";
import { Heart, Bell, MessageSquare, MapPin, ChevronRight } from "lucide-react";
import { scoreColor, scoreLabel, formatScore } from "@/lib/utils";

function seedToCity(s: (typeof CITIES_SEED)[number]): City {
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

export const metadata: Metadata = {
  title: "Mon espace · MaVilleIdeal",
  description: "Vos villes sauvegardées, villes suivies et contributions.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/mes-villes" },
};

export default async function MesVillesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const [favResult, alertResult, commentResult] = await Promise.all([
    supabase
      .from("favorites")
      .select("city_slug")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("alerts")
      .select("city_slug, created_at")
      .eq("user_id", user.id)
      .eq("metric", "global")
      .order("created_at", { ascending: false }),
    supabase
      .from("comments")
      .select("id, city_slug, body, created_at, approved")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const favSlugs = (favResult.data ?? []).map((r) => r.city_slug);
  const alertSlugs = (alertResult.data ?? []).map((r) => r.city_slug);
  const recentComments = commentResult.data ?? [];

  const savedCities = favSlugs
    .map((slug) => CITIES_SEED.find((c) => c.slug === slug))
    .filter((c): c is (typeof CITIES_SEED)[number] => Boolean(c))
    .map(seedToCity);

  const followedCities = alertSlugs
    .map((slug) => CITIES_SEED.find((c) => c.slug === slug))
    .filter((c): c is (typeof CITIES_SEED)[number] => Boolean(c));

  const email = user.email ?? "";
  const displayName = email.split("@")[0];

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-20 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
                Mon espace
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-1">
                Bonjour,{" "}
                <span className="gradient-text-anim font-display italic">{displayName}</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">{email}</p>
            </div>
            <SignOutButton />
          </div>

          {/* Quick stats strip */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: Heart, label: "Favoris", count: savedCities.length, color: "text-pink-500" },
              { icon: Bell, label: "Suivies", count: followedCities.length, color: "text-[var(--accent)]" },
              { icon: MessageSquare, label: "Contributions", count: recentComments.length, color: "text-blue-500" },
            ].map(({ icon: Icon, label, count, color }) => (
              <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-4 text-center">
                <Icon className={`mx-auto h-5 w-5 mb-1 ${color}`} />
                <div className="text-2xl font-bold text-[var(--text-primary)]">{count}</div>
                <div className="text-xs text-[var(--text-tertiary)]">{label}</div>
              </div>
            ))}
          </div>

          {/* Favorites section */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <Heart className="h-5 w-5 text-pink-500" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Villes sauvegardées
                {savedCities.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-[var(--text-tertiary)]">
                    ({savedCities.length})
                  </span>
                )}
              </h2>
            </div>

            {savedCities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)]/50 px-6 py-10 text-center">
                <Heart className="mx-auto h-8 w-8 text-[var(--text-tertiary)] mb-3" strokeWidth={1.5} />
                <p className="text-[var(--text-secondary)] font-medium mb-1">Aucune ville sauvegardée</p>
                <p className="text-[var(--text-tertiary)] text-sm">Cliquez sur ♥ sur n&apos;importe quelle fiche ville pour la retrouver ici.</p>
                <Link
                  href="/villes"
                  className="inline-flex items-center gap-2 mt-5 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent)]/90 transition-colors"
                >
                  Explorer les villes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCities.map((city: City) => (
                  <CityCard key={city.slug} city={city} />
                ))}
              </div>
            )}
          </section>

          {/* Followed cities (alerts) */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <Bell className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Villes suivies
                {followedCities.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-[var(--text-tertiary)]">
                    ({followedCities.length})
                  </span>
                )}
              </h2>
            </div>

            {followedCities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)]/50 px-6 py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-[var(--text-tertiary)] mb-3" strokeWidth={1.5} />
                <p className="text-[var(--text-secondary)] font-medium mb-1">Aucune ville suivie</p>
                <p className="text-[var(--text-tertiary)] text-sm">
                  Cliquez sur <strong>Suivre</strong> sur une fiche ville pour être notifié des évolutions.
                </p>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {followedCities.map((city) => {
                  const color = scoreColor(city.scores.global);
                  const label = scoreLabel(city.scores.global);
                  return (
                    <Link
                      key={city.slug}
                      href={`/villes/${city.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 hover:shadow-sm transition-all group"
                    >
                      <MapPin className="h-4 w-4 text-[var(--accent)] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                          {city.name}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">{city.region}</div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-xs font-bold ${color}`}>
                          {formatScore(city.scores.global)}
                        </span>
                        <span className={`text-xs ${color} opacity-70`}>{label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent contributions */}
          {recentComments.length > 0 && (
            <section>
              <div className="mb-4 flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Mes contributions récentes</h2>
              </div>
              <div className="space-y-2">
                {recentComments.map((comment) => {
                  const city = CITIES_SEED.find((c) => c.slug === comment.city_slug);
                  const date = comment.created_at
                    ? new Date(comment.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                    : null;
                  return (
                    <Link
                      key={comment.id}
                      href={`/villes/${comment.city_slug}#discussions`}
                      className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-blue-400/40 hover:shadow-sm transition-all group"
                    >
                      <MessageSquare className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                            {city?.name ?? comment.city_slug}
                          </span>
                          {date && <span className="text-xs text-[var(--text-tertiary)]">· {date}</span>}
                          {comment.approved === false && (
                            <span className="text-xs text-amber-500 bg-amber-500/10 rounded px-1.5 py-0.5">En attente</span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{comment.body}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0 mt-0.5" />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* CTAs */}
          <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                Découvrez votre prochaine ville
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                City Match · Projection 5 ans · Future You
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/city-match" className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent)]/90 transition-colors">
                City Match
              </Link>
              <Link href="/projection-5ans" className="rounded-full border border-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors">
                Projection 5 ans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
