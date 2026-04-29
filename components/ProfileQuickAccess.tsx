import Link from "next/link";
import { CITIES_SEED } from "@/data/cities-seed";

const PROFILES = [
  {
    slug: "famille",
    emoji: "👨‍👩‍👧",
    label: "Familles",
    desc: "Sécurité, écoles, espaces verts",
    scoreKey: "safety" as const,
  },
  {
    slug: "teletravail",
    emoji: "💻",
    label: "Télétravailleurs",
    desc: "Fibre, coworking, qualité de vie",
    scoreKey: "remoteWork" as const,
  },
  {
    slug: "etudiant",
    emoji: "🎓",
    label: "Étudiants",
    desc: "Culture, transport, budget",
    scoreKey: "culture" as const,
  },
  {
    slug: "budget",
    emoji: "💰",
    label: "Petit budget",
    desc: "Loyers abordables, coût de la vie",
    scoreKey: "cost" as const,
  },
  {
    slug: "nature",
    emoji: "🌿",
    label: "Nature",
    desc: "Montagne, mer, espaces naturels",
    scoreKey: "nature" as const,
  },
  {
    slug: "retraite",
    emoji: "🏡",
    label: "Retraite",
    desc: "Calme, sécurité, services de santé",
    scoreKey: "safety" as const,
  },
];

function getTopCity(scoreKey: (typeof PROFILES)[number]["scoreKey"]) {
  return [...CITIES_SEED].sort((a, b) => b.scores[scoreKey] - a.scores[scoreKey])[0];
}

export function ProfileQuickAccess() {
  return (
    <section className="py-14 border-t border-[var(--border)]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-[var(--accent)] mb-2">Votre profil</p>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Trouver la ville idéale selon votre situation
          </h2>
          <p className="text-[var(--text-secondary)]">
            Classements spécialisés par profil de vie
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PROFILES.map((profile) => {
            const topCity = getTopCity(profile.scoreKey);
            return (
              <Link
                key={profile.slug}
                href={`/classements/${profile.slug}`}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] hover:shadow-sm transition-all p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{profile.emoji}</div>
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {profile.label}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)]">{profile.desc}</div>
                  </div>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] border-t border-[var(--border)] pt-2 mt-2">
                  N°1 : <span className="font-medium text-[var(--accent)]">{topCity.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/classements"
            className="text-sm text-[var(--accent)] hover:underline font-medium"
          >
            Voir tous les classements thématiques →
          </Link>
        </div>
      </div>
    </section>
  );
}
