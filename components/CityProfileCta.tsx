import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { cn, formatScore, scoreColor, scoreBg, scoreLabel } from "@/lib/utils";

/** Minimal shape needed for the CTA — works for both `City` and raw seed records. */
type CtaCity = {
  slug: string;
  name: string;
  scores: { global: number };
};

interface CityProfileCtaProps {
  city: CtaCity;
  /** Eyebrow line above the city name. */
  eyebrow?: string;
  /** Short sentence under the city name. */
  blurb?: string;
}

/**
 * Styled end-of-page CTA linking back to a city's full profile.
 * Replaces the flat "Fiche complète de X →" text links on per-city
 * tool pages (calculateur coût réel, coût ménage…). Shows the city
 * name, its global score badge (6-tier colour) and a clear button.
 */
export function CityProfileCta({ city, eyebrow, blurb }: CityProfileCtaProps) {
  const score = city.scores.global;
  return (
    <Link
      href={`/villes/${city.slug}`}
      className="group block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all hover:border-[var(--accent)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:p-6"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10">
          <MapPin className="h-6 w-6 text-[var(--accent)]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
            {eyebrow ?? "Fiche complète"}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {city.name}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                scoreBg(score),
                scoreColor(score)
              )}
              title={`Score global ${scoreLabel(score)}`}
            >
              {formatScore(score)}/10
              <span className="font-medium opacity-80">{scoreLabel(score)}</span>
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {blurb ??
              `Score détaillé, quartiers, climat, transports et coût de la vie à ${city.name}.`}
          </p>
        </div>

        <span className="hidden flex-shrink-0 items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-all group-hover:bg-[var(--accent-hover)] sm:inline-flex">
          Voir la fiche
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>

      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent)] sm:hidden">
        Voir la fiche complète
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
