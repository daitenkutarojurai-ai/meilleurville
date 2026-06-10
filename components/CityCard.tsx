import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatNumber, formatScore, scoreHex, scoreColor, scoreLabel } from "@/lib/utils";
import type { City } from "@/lib/types";
import { HOUSING } from "@/data/housing";
import { FavoriteButton } from "@/components/effects/FavoriteButton";

interface CityCardProps {
  city: City;
  rank?: number;
  className?: string;
  locale?: "fr" | "en";
}

function gradientForScore(score: number) {
  if (score >= 7.5) return "from-purple-500 via-violet-400 to-purple-300";
  if (score >= 7.0) return "from-green-500 via-lime-400 to-lime-300";
  if (score >= 6.0) return "from-lime-400 via-yellow-300 to-amber-300";
  if (score >= 5.0) return "from-amber-400 via-amber-300 to-yellow-200";
  if (score >= 4.0) return "from-orange-500 via-orange-400 to-amber-300";
  return "from-red-500 via-rose-400 to-orange-400";
}

const TIER_EN: Record<string, string> = {
  exceptionnel: "exceptional", excellent: "excellent", bon: "good",
  moyen: "average", "en dessous": "below average", mauvais: "poor",
};

export function CityCard({ city, rank, className, locale = "fr" }: CityCardProps) {
  const score = city.scores.global;
  const cover = gradientForScore(score);
  const frTier = scoreLabel(score);
  const tier = locale === "en" ? TIER_EN[frTier] ?? frTier : frTier;
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);

  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-200 hover:border-[var(--accent)]/40 hover:shadow-xl hover:shadow-[var(--accent)]/10 hover:-translate-y-0.5 cursor-pointer shine",
        className
      )}
    >
      <Link
        href={locale === "en" ? `/cities/${city.slug}` : `/villes/${city.slug}`}
        aria-label={`${city.name} — score ${formatScore(score)} ${L("sur", "out of")} 10 (${tier})`}
        className="absolute inset-0 z-[1]"
      />
        {/* Animated gradient cover stripe */}
        <div className={`relative h-2 bg-gradient-to-r ${cover}`}>
          <div className="absolute inset-0 bg-aurora opacity-50" />
        </div>

        <div className="p-5">
          <div className="absolute top-5 right-4 z-[2] flex items-center gap-1.5">
            <FavoriteButton slug={city.slug} size={14} className="!px-2 !py-1.5" />
            {rank && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]">
                <span className="text-xs font-bold font-mono-data text-[var(--text-secondary)]">
                  {rank}
                </span>
              </div>
            )}
          </div>

          <div className="mb-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {city.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {city.region} · {city.population ? formatNumber(city.population) + L(" hab.", " pop.") : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className={cn("text-3xl font-bold font-mono-data", scoreColor(score))} title={`Score ${tier}`}>
              {formatScore(score)}
              <span className="sr-only"> {L("sur", "out of")} 10 — {tier}</span>
            </div>
            {/* No "{n} avis" — that count was synthesized from the score. */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-amber-500" />
                <span className="text-xs text-[var(--text-secondary)]">{tier}</span>
              </div>
            </div>
          </div>

          {/* Mini score grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: L("Nature", "Nature"), val: city.scores.nature },
              { label: L("Transport", "Transport"), val: city.scores.transport },
              { label: L("Coût", "Cost"), val: city.scores.cost },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="rounded-lg bg-[var(--bg-elevated)] p-2 text-center group-hover:bg-[var(--accent-soft)] transition-colors"
              >
                <div className="text-xs font-mono-data font-semibold text-[var(--text-primary)]">
                  {formatScore(val)}
                </div>
                <div className="mt-1 h-1 rounded-full bg-white/70 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${(val / 10) * 100}%`, background: `linear-gradient(90deg, ${scoreHex(val)}, ${scoreHex(val)}88)` }}
                  />
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {city.characterTags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="subtle" className="capitalize text-[10px]">
                {tag}
              </Badge>
            ))}
            {HOUSING[city.slug] && (
              <span className="ml-auto text-[10px] text-[var(--text-tertiary)] font-mono-data">
                T2 ~{HOUSING[city.slug].avgRentT2}€
              </span>
            )}
          </div>
        </div>
    </div>
  );
}
