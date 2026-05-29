import Link from "next/link";
import { CITIES_SEED } from "@/data/cities-seed";

const PROFILES = [
  {
    slug: "famille",
    emoji: "👨‍👩‍👧",
    label: "Familles",
    labelEn: "Families",
    desc: "Sécurité, écoles, espaces verts",
    descEn: "Safety, schools, green space",
    scoreKey: "safety" as const,
  },
  {
    slug: "teletravail",
    emoji: "💻",
    label: "Télétravailleurs",
    labelEn: "Remote workers",
    desc: "Fibre, coworking, qualité de vie",
    descEn: "Fibre, coworking, quality of life",
    scoreKey: "remoteWork" as const,
  },
  {
    slug: "mobilite",
    emoji: "🚲",
    label: "Sans voiture",
    labelEn: "Car-free",
    desc: "Transports, vélo, marchabilité",
    descEn: "Transit, cycling, walkability",
    scoreKey: "transport" as const,
  },
  {
    slug: "budget",
    emoji: "💰",
    label: "Petit budget",
    labelEn: "Tight budget",
    desc: "Loyers abordables, coût de la vie",
    descEn: "Affordable rents, low cost of living",
    scoreKey: "cost" as const,
  },
  {
    slug: "culture",
    emoji: "🎭",
    label: "Vie culturelle",
    labelEn: "Cultural life",
    desc: "Musées, festivals, patrimoine",
    descEn: "Museums, festivals, heritage",
    scoreKey: "culture" as const,
  },
  {
    slug: "nature",
    emoji: "🌿",
    label: "Nature",
    labelEn: "Nature",
    desc: "Montagne, mer, espaces naturels",
    descEn: "Mountains, coast, open spaces",
    scoreKey: "nature" as const,
  },
  {
    slug: "retraite",
    emoji: "🏡",
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
  return (
    <section className="relative py-8 sm:py-14 border-t border-[var(--border)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_30%_50%,rgba(34,197,94,0.06),transparent_70%)]" />
      </div>
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            {L("✨ Votre profil", "✨ Your profile")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            {locale === "en" ? (
              <>
                <span className="font-display gradient-text-anim italic">Yours</span>, for the life you live
              </>
            ) : (
              <>
                La <span className="font-display gradient-text-anim italic">vôtre</span>, selon votre vie
              </>
            )}
          </h2>
          <p className="text-[var(--text-secondary)]">
            {L(
              "Classements spécialisés par profil. Cliquez sur le vôtre.",
              "Rankings tailored to each profile. Pick yours.",
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PROFILES.map((profile) => {
            const topCity = getTopCity(profile.scoreKey);
            return (
              <Link
                key={profile.slug}
                href={locale === "en" ? `/rankings/${profile.slug}` : `/classements/${profile.slug}`}
                className="group relative overflow-hidden rounded-2xl glass border border-white/50 hover:border-[var(--accent)]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{profile.emoji}</div>
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {L(profile.label, profile.labelEn)}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">{L(profile.desc, profile.descEn)}</div>
                  </div>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] border-t border-[var(--border)] pt-2 mt-2">
                  {L("N°1 : ", "No.1: ")}<span className="font-medium text-[var(--accent)]">{topCity.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
        {/* Cadre de vie — the cross-cutting mega-index, no longer in the top
            bar (R7.1). Surfaced here as a full-width capstone card. */}
        <Link
          href={locale === "en" ? "/rankings" : "/cadre-de-vie"}
          className="group mt-6 flex items-center gap-3 rounded-2xl glass border border-white/50 hover:border-[var(--accent)]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all p-4"
        >
          <div className="text-2xl shrink-0">🌿</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              {L("Cadre de vie — le méga-index", "Living environment — the mega-index")}
            </div>
            <div className="text-[11px] text-[var(--text-tertiary)]">
              {L(
                "Environnement, santé, services publics et emploi agrégés, ville par ville",
                "Environment, health, public services and jobs, combined city by city",
              )}
            </div>
          </div>
          <span className="text-[var(--accent)] font-medium shrink-0">→</span>
        </Link>
        <div className="text-center mt-6">
          <Link
            href={locale === "en" ? "/rankings" : "/classements"}
            className="text-sm text-[var(--accent)] hover:underline font-medium"
          >
            {L("Voir tous les classements thématiques →", "See all themed rankings →")}
          </Link>
        </div>
      </div>
    </section>
  );
}
