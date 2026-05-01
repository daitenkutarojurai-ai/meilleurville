import Link from "next/link";
import { MapPin, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatNumber, formatScore } from "@/lib/utils";
import type { City } from "@/lib/types";
import { HOUSING } from "@/data/housing";

interface CityCardProps {
  city: City;
  rank?: number;
  delta?: number;
  className?: string;
}

function gradientForScore(score: number) {
  if (score >= 8.5) return "from-emerald-500 via-emerald-400 to-lime-400";
  if (score >= 7.5) return "from-lime-400 via-green-400 to-amber-300";
  if (score >= 6.5) return "from-amber-400 via-amber-300 to-amber-200";
  if (score >= 5.5) return "from-orange-400 to-amber-300";
  return "from-orange-400 to-rose-300";
}

export function CityCard({ city, rank, delta, className }: CityCardProps) {
  const score = city.scores.global;
  const scoreColor =
    score >= 8 ? "text-emerald-600" : score >= 6 ? "text-amber-500" : "text-red-500";
  const cover = gradientForScore(score);

  return (
    <Link href={`/villes/${city.slug}`}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] transition-all duration-200 hover:border-[var(--accent)]/40 hover:shadow-xl hover:shadow-[var(--accent)]/10 hover:-translate-y-0.5 cursor-pointer shine",
          className
        )}
      >
        {/* Animated gradient cover stripe */}
        <div className={`relative h-2 bg-gradient-to-r ${cover}`}>
          <div className="absolute inset-0 bg-aurora opacity-50" />
        </div>

        <div className="p-5">
          {rank && (
            <div className="absolute top-5 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]">
              <span className="text-xs font-bold font-mono-data text-[var(--text-secondary)]">
                {rank}
              </span>
            </div>
          )}

          <div className="mb-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {city.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {city.region} · {city.population ? formatNumber(city.population) + " hab." : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className={cn("text-3xl font-bold font-mono-data", scoreColor)}>
              {formatScore(score)}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-amber-500" />
                <span className="text-xs text-[var(--text-secondary)]">
                  {city.reviewCount} avis
                </span>
              </div>
              {delta !== undefined && delta !== 0 && (
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    delta > 0 ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  <TrendingUp className={cn("h-3 w-3", delta < 0 && "rotate-180")} />
                  {Math.abs(delta)}
                </div>
              )}
            </div>
          </div>

          {/* Mini score grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Nature", val: city.scores.nature },
              { label: "Transport", val: city.scores.transport },
              { label: "Coût", val: city.scores.cost },
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
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${(val / 10) * 100}%` }}
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
    </Link>
  );
}
