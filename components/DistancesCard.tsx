import { Plane, Mountain, Waves, Snowflake, Train, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  computeCityDistances,
  approxDriveTimeMin,
  formatDistance,
} from "@/lib/distances";
import { parisCommute } from "@/lib/paris-commute";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: CitySeed;
}

function timeBadge(km: number): string {
  const mins = approxDriveTimeMin(km);
  if (mins < 60) return `~${mins} min en voiture`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `~${h} h en voiture`;
  return `~${h} h ${m.toString().padStart(2, "0")} en voiture`;
}

interface Row {
  icon: React.ElementType;
  label: string;
  value: string | null;
  detail?: string;
  hint?: string;
}

export function DistancesCard({ city }: Props) {
  const d = computeCityDistances(city);
  if (city.latitude == null || city.longitude == null) {
    return null; // DROM or missing coords — silent
  }

  // Special-case Paris itself
  const parisLabel =
    d.paris != null && d.paris < 5 ? "Vous y êtes" : d.paris != null ? formatDistance(d.paris) : null;
  const trainToParis = parisCommute(city);
  const isParis = d.paris != null && d.paris < 5;

  const rows: Row[] = [
    {
      icon: Train,
      label: "Paris",
      value: parisLabel,
      detail: !isParis && trainToParis.source !== "unavailable"
        ? `Train ~${trainToParis.display}${trainToParis.source === "via-nearby-station" && trainToParis.viaStation ? ` via ${trainToParis.viaStation}` : ""}`
        : d.paris != null && d.paris >= 5 ? "À vol d'oiseau" : undefined,
      hint: !isParis && d.paris != null && d.paris >= 50 ? timeBadge(d.paris) : undefined,
    },
    {
      icon: MapPin,
      label: "Métropole la plus proche",
      value: d.nearestMetro ? formatDistance(d.nearestMetro.distanceKm) : null,
      detail: d.nearestMetro?.label,
      hint: d.nearestMetro && d.nearestMetro.distanceKm >= 30 ? timeBadge(d.nearestMetro.distanceKm) : undefined,
    },
    {
      icon: Waves,
      label: "Mer la plus proche",
      value: d.sea ? formatDistance(d.sea.distanceKm) : null,
      detail: d.sea ? `${d.sea.label}${d.sea.meta ? ` — ${d.sea.meta}` : ""}` : undefined,
      hint: d.sea && d.sea.distanceKm >= 30 ? timeBadge(d.sea.distanceKm) : undefined,
    },
    {
      icon: Mountain,
      label: "Montagne",
      value: d.mountain ? formatDistance(d.mountain.distanceKm) : null,
      detail: d.mountain ? `${d.mountain.label}${d.mountain.meta ? ` — ${d.mountain.meta}` : ""}` : undefined,
      hint: d.mountain && d.mountain.distanceKm >= 50 ? timeBadge(d.mountain.distanceKm) : undefined,
    },
    {
      icon: Plane,
      label: "Aéroport",
      value: d.airport ? formatDistance(d.airport.distanceKm) : null,
      detail: d.airport?.label,
      hint: d.airport && d.airport.distanceKm >= 30 ? timeBadge(d.airport.distanceKm) : undefined,
    },
    {
      icon: Snowflake,
      label: "Station de ski",
      value: d.ski ? formatDistance(d.ski.distanceKm) : null,
      detail: d.ski ? `${d.ski.label}${d.ski.meta ? ` — ${d.ski.meta}` : ""}` : undefined,
      hint: d.ski && d.ski.distanceKm >= 50 ? timeBadge(d.ski.distanceKm) : undefined,
    },
  ];

  return (
    <Card>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-[var(--text-secondary)]" />
        Distances clés
      </h3>
      <ul className="space-y-2.5">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <li key={r.label} className="flex items-start gap-2.5 text-xs">
              <Icon className="h-3.5 w-3.5 mt-0.5 text-[var(--accent)] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[var(--text-secondary)]">{r.label}</span>
                  <span className="font-mono-data font-semibold text-[var(--text-primary)] tabular-nums">
                    {r.value ?? "—"}
                  </span>
                </div>
                {(r.detail || r.hint) && (
                  <div className="text-[10px] text-[var(--text-tertiary)] truncate">
                    {r.detail}
                    {r.detail && r.hint ? " · " : ""}
                    {r.hint}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[10px] text-[var(--text-tertiary)] leading-tight">
        Distances à vol d&apos;oiseau (Haversine). Temps voiture indicatif (~75 km/h).
      </p>
    </Card>
  );
}
