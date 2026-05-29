import Link from "next/link";
import { Compass, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { nearestCities, formatDistance } from "@/lib/distances";
import { scoreColor, formatScore } from "@/lib/utils";

interface Props {
  citySlug: string;
  cityName: string;
  locale?: "fr" | "en";
}

export function GeographicNeighborsCard({ citySlug, cityName, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const neighbors = nearestCities(citySlug, 6);
  if (neighbors.length === 0) return null;

  return (
    <Card>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
        <Compass className="h-4 w-4 text-[var(--text-secondary)]" />
        {L(`Autour de ${cityName}`, `Around ${cityName}`)}
      </h3>
      <p className="text-[11px] text-[var(--text-tertiary)] mb-3">
        {L(
          "Les 6 villes les plus proches à vol d'oiseau, avec leur score qualité de vie.",
          "The 6 nearest cities as the crow flies, with their quality-of-life score."
        )}
      </p>
      <ul className="space-y-1.5">
        {neighbors.map((n) => (
          <li key={n.slug}>
            <Link
              href={locale === "en" ? `/cities/${n.slug}` : `/villes/${n.slug}`}
              className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 hover:bg-[var(--bg-elevated)] transition-colors group"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {n.name}
                </span>
                <span className="block text-[10px] text-[var(--text-tertiary)] truncate">
                  {n.sameRegion ? L("Même région", "Same region") : n.region}
                  {" · "}
                  <MapPin className="inline h-2.5 w-2.5 -mt-0.5" />
                  {formatDistance(n.distanceKm)}
                </span>
              </span>
              <span className={`text-sm font-mono-data font-bold tabular-nums ${scoreColor(n.scoreGlobal)} flex-shrink-0`}>
                {formatScore(n.scoreGlobal)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
