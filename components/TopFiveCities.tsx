import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";

function tagline(city: (typeof CITIES_SEED)[number]): string {
  const s = city.scores;
  const top = [
    { k: "nature", v: s.nature, label: "nature à portée de main" },
    { k: "culture", v: s.culture, label: "vie culturelle qui pétille" },
    { k: "transport", v: s.transport, label: "tout à 15 minutes en transport" },
    { k: "remoteWork", v: s.remoteWork, label: "paradis du télétravail" },
    { k: "safety", v: s.safety, label: "sentiment de sécurité au quotidien" },
    { k: "schools", v: s.schools, label: "très bonnes écoles" },
    { k: "cost", v: s.cost, label: "loyers raisonnables" },
    { k: "life", v: s.life, label: "art de vivre assumé" },
  ].sort((a, b) => b.v - a.v);

  const tag = city.characterTags[0];
  return `${tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : "Équilibrée"} · ${top[0].label}`;
}

function medal(rank: number): string {
  return ["🥇", "🥈", "🥉", "🏅", "🏅"][rank - 1] ?? "·";
}

function rankColor(rank: number): string {
  if (rank === 1) return "from-amber-300 via-yellow-400 to-orange-400";
  if (rank === 2) return "from-slate-200 via-slate-300 to-slate-400";
  if (rank === 3) return "from-orange-200 via-amber-400 to-orange-500";
  return "from-emerald-200 via-emerald-300 to-emerald-400";
}

export function TopFiveCities() {
  const top5 = [...CITIES_SEED]
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 5);

  return (
    <section className="relative py-14 sm:py-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
              <Trophy className="h-3.5 w-3.5" />
              Top 5 villes
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Les 5 villes les mieux notées
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Mise à jour automatique · Calibré sur {CITIES_SEED.length} villes
            </p>
          </div>
          <Link
            href="/villes"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Voir le classement complet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {top5.map((city, i) => {
            const rank = i + 1;
            return (
              <Link
                key={city.slug}
                href={`/villes/${city.slug}`}
                className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/50 hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <div className={`h-1.5 bg-gradient-to-r ${rankColor(rank)}`} aria-hidden />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl" aria-label={`Rang ${rank}`}>
                      {medal(rank)}
                    </span>
                    <span className="text-xs font-mono-data font-bold text-[var(--text-tertiary)]">
                      #{rank}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight">
                    {city.name}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                    {city.region}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-3 leading-snug line-clamp-3 flex-1">
                    {tagline(city)}
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
                        Score global
                      </div>
                      <div className="text-2xl font-bold font-mono-data text-[var(--accent)]">
                        {city.scores.global.toFixed(1)}
                      </div>
                    </div>
                    <span className="text-xs text-[var(--accent)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
