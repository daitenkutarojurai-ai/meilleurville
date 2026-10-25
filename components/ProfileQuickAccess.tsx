import { EmojiBadge } from "@/components/EmojiBadge";
import Link from "@/components/AppLink";
import { ArrowRight, Armchair, Bike, Drama, Laptop, Layers, TreePine, Users, Wallet, type LucideIcon } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";

// « Couleurs » (CLAUDE.md § Design identity): white cards on the lilac band,
// each with a vivid gradient icon tile (grad-head-N, rotated by index) and its
// N°1 city on an indigo pill. The mega-index card is the one vivid tile.
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <EmojiBadge emoji="👥" tone="lilac" size="lg" className="mb-3" />
            <p className="mb-2 font-mono-data text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              {L(`Votre profil · ${PROFILES.length} profils`, `Your profile · ${PROFILES.length} profiles`)}
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
                className="group flex flex-col rounded-2xl bg-[var(--bg-surface)] p-4 shadow-[0_6px_20px_-12px_rgba(79,70,229,0.45)] ring-1 ring-[#4F46E5]/15 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_rgba(219,39,119,0.45)] hover:ring-[#4F46E5]/40"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className={`grad-head-${i % 6} flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm`} aria-hidden="true">
                    <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                  </span>
                  <span className="rounded-full bg-[var(--band-indigo)] px-2 py-0.5 font-mono-data text-[10px] font-semibold tracking-[0.12em] text-[var(--accent-hover)]">
                    {pad2(i + 1)} / {total}
                  </span>
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent)]">
                  {L(profile.label, profile.labelEn)}
                </div>
                <div className="flex-1 text-[11px] leading-snug text-[var(--text-tertiary)]">
                  {L(profile.desc, profile.descEn)}
                </div>
                <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--border)] pt-2.5">
                  <span className="font-mono-data text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-pink)]">
                    {L("N°1", "No.1")}
                  </span>
                  <span className="inline-flex min-w-0 max-w-full rounded-full bg-[var(--band-indigo)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent-hover)]"><span className="truncate">{topCity.name}</span></span>
                </div>
              </Link>
            );
          })}
          {/* Cadre de vie — the cross-cutting mega-index, no longer in the top
              bar (R7.1). The one vivid tile of the grid: gradient, white text. */}
          <Link
            href={locale === "en" ? "/rankings" : "/cadre-de-vie"}
            className="grad-head-5 group flex flex-col rounded-2xl p-4 shadow-[0_10px_28px_-12px_rgba(124,58,237,0.6)] transition-all hover:-translate-y-0.5 hover:brightness-105 sm:col-span-2"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/40" aria-hidden="true">
                <Layers className="h-5 w-5 text-white" strokeWidth={2} />
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 font-mono-data text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                {L("Index", "Index")}
              </span>
            </div>
            <div className="text-sm font-bold text-white">
              {L("Cadre de vie — le méga-index", "Living environment — the mega-index")}
            </div>
            <div className="flex-1 text-[11px] leading-snug text-white">
              {L(
                "Environnement, santé, services publics et emploi agrégés, ville par ville",
                "Environment, health, public services and jobs, combined city by city",
              )}
            </div>
            <div className="mt-3 flex items-center gap-1 border-t border-white/30 pt-2.5 text-xs font-semibold text-white">
              {L("Ouvrir l'index", "Open the index")}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
