"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, TrendingUp } from "lucide-react";
import {
  migrationFor,
  commonOriginSlugs,
  type MigrationResult,
} from "@/lib/people-like-you";
import { PROFILE_PAGES } from "@/lib/profile-pages";
import { enProfileLabel, enMigrationReason } from "@/lib/people-like-you-en";
import { CITIES_SEED } from "@/data/cities-seed";
import { formatNumber, scoreColor, scoreHex } from "@/lib/utils";

const ORIGIN_SLUGS = commonOriginSlugs(50);

function originOptions() {
  return ORIGIN_SLUGS.map((slug) => CITIES_SEED.find((c) => c.slug === slug)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c),
  );
}

export function PeopleLikeYouClient({ locale = "fr" }: { locale?: "fr" | "en" } = {}) {
  const en = locale === "en";
  const t = (fr: string, eng: string) => (en ? eng : fr);
  const cityHref = (slug: string) => (en ? `/cities/${slug}` : `/villes/${slug}`);
  const profileLabel = (slug: string, label: string) => (en ? enProfileLabel(slug, label) : label);
  const reasonText = (m: { city: (typeof CITIES_SEED)[number]; reason: string }) =>
    en ? enMigrationReason(m.city) : m.reason;

  const origins = useMemo(() => originOptions(), []);
  const [profileSlug, setProfileSlug] = useState(PROFILE_PAGES[0].slug);
  const [originSlug, setOriginSlug] = useState(origins.find((c) => c.slug === "paris")?.slug ?? origins[0].slug);

  const result: MigrationResult | null = useMemo(
    () => migrationFor(originSlug, profileSlug, 5),
    [originSlug, profileSlug],
  );

  return (
    <div className="space-y-8">
      {/* Honest disclaimer */}
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-canvas)] px-4 py-3 text-xs text-[var(--text-secondary)]">
        <strong className="text-[var(--text-primary)]">{t("À lire avant.", "Read this first.")}</strong>{" "}
        {t(
          `Cette page n'utilise pas de données de migration réelles — nous n'avons pas encore de comptes utilisateurs. Les recommandations sont calculées à partir des poids du profil (${PROFILE_PAGES.length} profils types) × scores de chaque ville. C'est un proxy honnête de « ce que choisirait quelqu'un comme vous », pas un suivi GPS. Quand les comptes arriveront, on remplacera progressivement par les vraies trajectoires anonymisées.`,
          `This page does not use real migration data — we don't have user accounts yet. Recommendations are computed from profile weights (${PROFILE_PAGES.length} personas) × each city's scores. It's an honest proxy for "what someone like you would pick", not GPS tracking. Once accounts exist, we'll gradually swap in real anonymized trajectories.`,
        )}
      </div>

      {/* Inputs */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
              {t("Vous êtes", "You are")}
            </label>
            <select
              value={profileSlug}
              onChange={(e) => setProfileSlug(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              aria-label={t("Profil de vie", "Lifestyle profile")}
            >
              {PROFILE_PAGES.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.emoji} {profileLabel(p.slug, p.label)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
              {t("Vous quittez", "You're leaving")}
            </label>
            <select
              value={originSlug}
              onChange={(e) => setOriginSlug(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              aria-label={t("Ville d'origine", "Origin city")}
            >
              {origins.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.region})
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Origin baseline */}
      {result && (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] px-5 py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)] mb-0.5">
                {t("Référence", "Baseline")}
              </div>
              <div className="text-base">
                <span className="font-bold text-[var(--text-primary)]">{result.origin.city.name}</span>
                <span className="text-[var(--text-secondary)]">{t(" — score profil ", " — profile score ")}</span>
                <span className={`font-mono-data font-bold ${scoreColor(result.origin.score / 10)}`}>
                  {result.origin.score.toFixed(1)}/100
                </span>
              </div>
            </div>
            <Link
              href={cityHref(result.origin.city.slug)}
              className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              {t("Voir la fiche", "View profile")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* Upgrades */}
      {result && (
        <section>
          <div className="flex items-baseline gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {t(
                `Les profils comme vous quittent ${result.origin.city.name} pour…`,
                `People like you leave ${result.origin.city.name} for…`,
              )}
            </h2>
          </div>
          {result.upgrades.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4">
              {t(
                `Aucune destination ne fait significativement mieux que ${result.origin.city.name} sur ce profil — vous êtes déjà bien placé·e. Regardez les villes similaires ci-dessous pour une alternative latérale.`,
                `No destination does significantly better than ${result.origin.city.name} on this profile — you're already well placed. See the similar cities below for a lateral move.`,
              )}
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-5">
              {result.upgrades.map((m, i) => (
                <Link
                  key={m.city.slug}
                  href={cityHref(m.city.slug)}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--accent)]/40"
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-tertiary)]">
                      #{i + 1}
                    </span>
                    <span
                      className="text-[10px] font-bold tabular-nums rounded-full px-2 py-0.5"
                      style={{
                        background: `${scoreHex(m.city.scores.global)}22`,
                        color: scoreHex(m.city.scores.global),
                      }}
                    >
                      +{m.delta.toFixed(1)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight">
                    {m.city.name}
                  </h3>
                  <p className="text-[10px] text-[var(--text-tertiary)] truncate mt-0.5">{m.city.region}</p>
                  <div className="mt-3 text-xs text-[var(--text-secondary)] leading-snug">
                    {reasonText(m)}
                  </div>
                  <div className="mt-3 flex items-baseline justify-between text-[11px]">
                    <span className="text-[var(--text-tertiary)]">{t("Score profil", "Profile score")}</span>
                    <span className={`font-mono-data font-bold ${scoreColor(m.score / 10)}`}>
                      {m.score.toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Laterals */}
      {result && result.laterals.length > 0 && (
        <section>
          <div className="flex items-baseline gap-2 mb-4">
            <MapPin className="h-5 w-5 text-[var(--text-tertiary)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {t("Villes équivalentes (changer de cadre sans perdre)", "Equivalent cities (a change of scene, no trade-off)")}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
            {result.laterals.map((m) => (
              <Link
                key={m.city.slug}
                href={cityHref(m.city.slug)}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-3 text-xs transition-colors hover:border-[var(--accent)]/40"
              >
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] truncate">
                  {m.city.name}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] truncate">{m.city.region}</div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-[var(--text-tertiary)]">
                    {m.delta >= 0 ? `+${m.delta.toFixed(1)}` : m.delta.toFixed(1)} {t("pt", "pt")}
                  </span>
                  <span className={`font-mono-data font-bold ${scoreColor(m.score / 10)}`}>
                    {m.score.toFixed(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="text-[11px] text-[var(--text-tertiary)] text-center">
        {t(
          `Population des villes d'origine ≥ 30 000 habitants (${origins.length} villes listées) · destinations : ${formatNumber(CITIES_SEED.length)} villes métropolitaines.`,
          `Origin cities ≥ 30,000 inhabitants (${origins.length} listed) · destinations: ${formatNumber(CITIES_SEED.length)} metropolitan cities.`,
        )}
      </p>
    </div>
  );
}
