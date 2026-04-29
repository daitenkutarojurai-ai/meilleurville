import Link from "next/link";
import { MapPin, Star, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatNumber, formatScore } from "@/lib/utils";
import type { City } from "@/lib/types";

interface CityCardProps {
  city: City;
  rank?: number;
  delta?: number;
  className?: string;
}

export function CityCard({ city, rank, delta, className }: CityCardProps) {
  const score = city.scores.global;
  const scoreColor =
    score >= 8 ? "text-emerald-400" : score >= 6 ? "text-yellow-400" : "text-red-400";

  return (
    <Link href={`/villes/${city.slug}`}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all duration-200 hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--accent)]/8 hover:-translate-y-0.5 cursor-pointer",
          className
        )}
      >
        {/* Rank badge */}
        {rank && (
          <div className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border)]">
            <span className="text-xs font-bold font-mono-data text-[var(--text-secondary)]">
              {rank}
            </span>
          </div>
        )}

        {/* City header */}
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

        {/* Score */}
        <div className="mb-4 flex items-center gap-3">
          <div className={cn("text-3xl font-bold font-mono-data", scoreColor)}>
            {formatScore(score)}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-[var(--text-secondary)]">
                {city.reviewCount} avis
              </span>
            </div>
            {delta !== undefined && delta !== 0 && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  delta > 0 ? "text-emerald-400" : "text-red-400"
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
              className="rounded-lg bg-[var(--bg-elevated)] p-2 text-center"
            >
              <div className="text-xs font-mono-data font-semibold text-[var(--text-primary)]">
                {formatScore(val)}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {city.characterTags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="subtle" className="capitalize text-[10px]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
