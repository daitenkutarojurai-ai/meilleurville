import Link from "@/components/AppLink";
import { ArrowRight, Armchair, Bike, Drama, Laptop, Layers, TreePine, Users, Wallet, type LucideIcon } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";

// Profiles are the legend of the survey map: each one a numbered sheet with an
// enamel-plaque icon tile and its N°1 city on a street plaque. No glass cards,
// no emerald wash, no decorative emojis — CLAUDE.md « Carte & plaque ».
const pad2 = (n: number) => String(n).padStart(2, "0");

const PROFILES = [
  {
    slug: "famille",
    icon: Users as LucideIcon,
    label: "Familles",
    labelEn: "Families",
    desc: "Sécurité, écoles, espaces verts",
    descEn: "Safety, schools, green space",
    scoreKey: "safety" as const,
  },
  {
    slug: "teletravail",
    icon: Laptop as LucideIcon,
    label: "Télétravailleurs",
    labelEn: "Remote workers",
    desc: "Fibre, coworking, qualité de vie",
    descEn: "Fibre, coworking, quality of life",
    scoreKey: "remoteWork" as const,
  },
  {
    slug: "mobilite",
    icon: Bike as LucideIcon,
    label: "Sans voiture",
    labelEn: "Car-free",
    desc: "Transports, vélo, marchabilité",
    descEn: "Transit, cycling, walkability",
    scoreKey: "transport" as const,
  },
  {
    slug: "budget",
    icon: Wallet as LucideIcon,
    label: "Petit budget",
    labelEn: "Tight budget",
    desc: "Loyers abordables, coût de la vie",
    descEn: "Affordable rents, low cost of living",
    scoreKey: "cost" as const,
  },
  {
    slug: "culture",
    icon: Drama as LucideIcon,
    label: "Vie culturelle",
    labelEn: "Cultural life",
    desc: "Musées, festivals, patrimoine",
    descEn: "Museums, festivals, heritage",
    scoreKey: "culture" as const,
  },
  {
    slug: "nature",
    icon: TreePine as LucideIcon,
    label: "Nature",
    labelEn: "Nature",
    desc: "Montagne, mer, espaces naturels",
    descEn: "Mountains, coast, open spaces",
    scoreKey: "nature" as const,
  },
  {
    slug: "retraite",
    icon: Armchair as LucideIcon,
    label: "Retraite",
    labelEn: "Retirement",
    desc: "Calme, sécurité, services de santé",
    descEn: "Quiet, safety, healthcare access",
    scoreKey: "safety" as const,
  },
];

function getTopCity(scoreKey: (typeof PROFILES)[number]["scoreKey"]) {
  return [...CITIES_SEED].sort((a, b) => b.scores[scoreKey] - a.scores[scoreKey])[0];
}

export function ProfileQuickAccess({ locale = "fr" }: { locale?: "fr" | "en" } = {}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const total = pad2(PROFILES.length);
  return (
    <section className="band band-lilac py-8 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 font-mono-data text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              {L(`Votre profil · ${PROFILES.length} légendes`, `Your profile · ${PROFILES.length} legends`)}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              {locale === "en" ? (
                <>
                  <span className="font-display italic text-[var(--accent)]">Yours</span>, for the life you live
                </>
              ) : (
                <>
                  La <span className="font-display italic text-[var(--accent)]">vôtre</span>, selon votre vie
                </>
              )}
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              {L(
                "Classements spécialisés par profil. Cliquez sur le vôtre.",
                "Rankings tailored to each profile. Pick yours.",
              )}
            </p>
          </div>
          <Link
            href={locale === "en" ? "/rankings" : "/classements"}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            {L("Voir tous les classements thématiques", "See all themed rankings")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PROFILES.map((profile, i) => {
            const topCity = getTopCity(profile.scoreKey);
            const Icon = profile.icon;
            return (
              <Link
                key={profile.slug}
                href={locale === "en" ? `/rankings/${profile.slug}` : `/classements/${profile.slug}`}
                className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-colors hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="plaque !p-0 h-10 w-10 shrink-0 justify-center" aria-hidden="true">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                    {pad2(i + 1)} / {total}
                  </span>
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                  {L(profile.label, profile.labelEn)}
                </div>
                <div className="flex-1 text-[11px] leading-snug text-[var(--text-tertiary)]">
                  {L(profile.desc, profile.descEn)}
                </div>
                <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 border-t border-dashed border-[var(--border)] pt-2.5">
                  <span className="font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                    {L("N°1", "No.1")}
                  </span>
                  <span className="plaque plaque-small min-w-0 max-w-full"><span className="truncate">{topCity.name}</span></span>
                </div>
              </Link>
            );
          })}
          {/* Cadre de vie — the cross-cutting mega-index, no longer in the top
              bar (R7.1). Surfaced as the legend's index sheet, on topo paper. */}
          <Link
            href={locale === "en" ? "/rankings" : "/cadre-de-vie"}
            className="topo-bg group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4 transition-colors hover:border-[var(--accent)] sm:col-span-2"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="plaque !p-0 h-10 w-10 shrink-0 justify-center" aria-hidden="true">
                <Layers className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                {L("Index", "Index")}
              </span>
            </div>
            <div className="text-sm font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
              {L("Cadre de vie — le méga-index", "Living environment — the mega-index")}
            </div>
            <div className="flex-1 text-[11px] leading-snug text-[var(--text-secondary)]">
              {L(
                "Environnement, santé, services publics et emploi agrégés, ville par ville",
                "Environment, health, public services and jobs, combined city by city",
              )}
            </div>
            <div className="mt-3 flex items-center gap-1 border-t border-dashed border-[var(--border)] pt-2.5 text-xs font-semibold text-[var(--accent)]">
              {L("Ouvrir l'index", "Open the index")}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
