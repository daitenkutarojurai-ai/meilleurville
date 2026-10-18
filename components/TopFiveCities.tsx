import Link from "@/components/AppLink";
import { ArrowRight } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { scoreColor, scoreHex } from "@/lib/utils";

function tagline(city: (typeof CITIES_SEED)[number], locale: "fr" | "en"): string {
  const s = city.scores;
  const top = [
    { k: "nature", v: s.nature, label: locale === "en" ? "nature within reach" : "nature à portée de main" },
    { k: "culture", v: s.culture, label: locale === "en" ? "a culture scene that buzzes" : "vie culturelle qui pétille" },
    { k: "transport", v: s.transport, label: locale === "en" ? "everything 15 minutes away by transit" : "tout à 15 minutes en transport" },
    { k: "remoteWork", v: s.remoteWork, label: locale === "en" ? "a remote-work paradise" : "paradis du télétravail" },
    { k: "safety", v: s.safety, label: locale === "en" ? "feeling safe day to day" : "sentiment de sécurité au quotidien" },
    { k: "schools", v: s.schools, label: locale === "en" ? "genuinely good schools" : "très bonnes écoles" },
    { k: "cost", v: s.cost, label: locale === "en" ? "rents you can live with" : "loyers raisonnables" },
    { k: "life", v: s.life, label: locale === "en" ? "an unapologetic art of living" : "art de vivre assumé" },
  ].sort((a, b) => b.v - a.v);

  const tag = city.characterTags[0];
  const fallback = locale === "en" ? "Well-rounded" : "Équilibrée";
  return `${tag ? tag.charAt(0).toUpperCase() + tag.slice(1) : fallback} · ${top[0].label}`;
}

/* Podium rank set as a carton label (same as CityCard): the old 🥇🥈🥉 +
   gold/bronze gradient bars borrowed amber/orange, reserved for score tiers. */

export function TopFiveCities({ locale = "fr" }: { locale?: "fr" | "en" } = {}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const top5 = [...CITIES_SEED]
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 5);

  return (
    <section id="top5" className="relative py-8 sm:py-20">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 border-t border-[var(--border)] pt-6">
          <div>
            <p className="font-mono-data text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
              {L("Podium · Top 5 villes", "Podium · Top 5 cities")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              {L("Les 5 villes les mieux notées", "The 5 best-rated cities")}
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              {L(
                `Mise à jour automatique · Calibré sur ${CITIES_SEED.length} villes`,
                `Auto-updated · Calibrated across ${CITIES_SEED.length} cities`,
              )}
            </p>
          </div>
          <Link
            href={locale === "en" ? "/cities" : "/villes"}
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            {L("Voir le classement complet", "See the full ranking")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {top5.map((city, i) => {
            const rank = i + 1;
            return (
              <Link
                key={city.slug}
                href={locale === "en" ? `/cities/${city.slug}` : `/villes/${city.slug}`}
                className="group relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)] transition-colors overflow-hidden"
              >
                {/* Map sheet with the place name on an enamel plaque — a name,
                    never the score (the flat stripe below carries the tier). */}
                <div className="topo-bg relative flex h-24 items-center justify-center bg-[var(--bg-canvas)] px-3">
                  <span
                    className="absolute left-2 top-2 rounded-md border border-[var(--accent)]/30 bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono-data text-xs font-bold text-[var(--accent)]"
                    aria-label={L(`Rang ${rank}`, `Rank ${rank}`)}
                  >
                    <span className="text-[9px] font-semibold opacity-70">{L("n°", "#")}</span>{rank}
                  </span>
                  <h3 className="plaque plaque-small max-w-full !text-sm leading-tight text-center">
                    {city.name}
                  </h3>
                </div>
                <div className="h-1.5" style={{ background: scoreHex(city.scores.global) }} aria-hidden="true" />
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-[var(--text-tertiary)] truncate">
                    {city.region}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-3 leading-snug line-clamp-2 sm:line-clamp-3 flex-1">
                    {tagline(city, locale)}
                  </p>
                  <div className="mt-4 flex items-end justify-between border-t border-dashed border-[var(--border)] pt-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
                        {L("Score global", "Overall score")}
                      </div>
                      <div className={`text-2xl font-bold font-mono-data ${scoreColor(city.scores.global)}`}>
                        {city.scores.global.toFixed(1)}
                        <span className="sr-only"> {L("sur", "out of")} 10</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--accent)] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
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
