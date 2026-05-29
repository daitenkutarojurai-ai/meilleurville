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
  locale?: "fr" | "en";
}

function timeBadge(km: number, locale: "fr" | "en"): string {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const mins = approxDriveTimeMin(km);
  if (mins < 60) return `~${mins}${L(" min en voiture", " min by car")}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `~${h}${L(" h en voiture", "h by car")}`;
  return `~${h}${L(" h ", "h")}${m.toString().padStart(2, "0")}${L(" en voiture", " by car")}`;
}

interface Row {
  icon: React.ElementType;
  label: string;
  value: string | null;
  detail?: string;
  hint?: string;
}

export function DistancesCard({ city, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const d = computeCityDistances(city);
  if (city.latitude == null || city.longitude == null) {
    return null; // DROM or missing coords — silent
  }

  // Special-case Paris itself
  const parisLabel =
    d.paris != null && d.paris < 5 ? L("Vous y êtes", "You're there") : d.paris != null ? formatDistance(d.paris) : null;
  const trainToParis = parisCommute(city);
  const isParis = d.paris != null && d.paris < 5;

  const rows: Row[] = [
    {
      icon: Train,
      label: "Paris",
      value: parisLabel,
      detail: !isParis && trainToParis.source !== "unavailable"
        ? `${L("Train ~", "Train ~")}${trainToParis.display}${trainToParis.source === "via-nearby-station" && trainToParis.viaStation ? `${L(" via ", " via ")}${trainToParis.viaStation}` : ""}`
        : d.paris != null && d.paris >= 5 ? L("À vol d'oiseau", "As the crow flies") : undefined,
      hint: !isParis && d.paris != null && d.paris >= 50 ? timeBadge(d.paris, locale) : undefined,
    },
    {
      icon: MapPin,
      label: L("Métropole la plus proche", "Nearest metro area"),
      value: d.nearestMetro ? formatDistance(d.nearestMetro.distanceKm) : null,
      detail: d.nearestMetro?.label,
      hint: d.nearestMetro && d.nearestMetro.distanceKm >= 30 ? timeBadge(d.nearestMetro.distanceKm, locale) : undefined,
    },
    {
      icon: Waves,
      label: L("Mer la plus proche", "Nearest coast"),
      value: d.sea ? formatDistance(d.sea.distanceKm) : null,
      detail: d.sea ? `${d.sea.label}${d.sea.meta ? ` — ${d.sea.meta}` : ""}` : undefined,
      hint: d.sea && d.sea.distanceKm >= 30 ? timeBadge(d.sea.distanceKm, locale) : undefined,
    },
    {
      icon: Mountain,
      label: L("Montagne", "Mountains"),
      value: d.mountain ? formatDistance(d.mountain.distanceKm) : null,
      detail: d.mountain ? `${d.mountain.label}${d.mountain.meta ? ` — ${d.mountain.meta}` : ""}` : undefined,
      hint: d.mountain && d.mountain.distanceKm >= 50 ? timeBadge(d.mountain.distanceKm, locale) : undefined,
    },
    {
      icon: Plane,
      label: L("Aéroport", "Airport"),
      value: d.airport ? formatDistance(d.airport.distanceKm) : null,
      detail: d.airport?.label,
      hint: d.airport && d.airport.distanceKm >= 30 ? timeBadge(d.airport.distanceKm, locale) : undefined,
    },
    {
      icon: Snowflake,
      label: L("Station de ski", "Ski resort"),
      value: d.ski ? formatDistance(d.ski.distanceKm) : null,
      detail: d.ski ? `${d.ski.label}${d.ski.meta ? ` — ${d.ski.meta}` : ""}` : undefined,
      hint: d.ski && d.ski.distanceKm >= 50 ? timeBadge(d.ski.distanceKm, locale) : undefined,
    },
  ];

  return (
    <Card>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-[var(--text-secondary)]" />
        {L("Distances clés", "Key distances")}
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
        {locale === "en" ? (
          "Straight-line distances (Haversine). Drive times are rough estimates (~75 km/h)."
        ) : (
          <>Distances à vol d&apos;oiseau (Haversine). Temps voiture indicatif (~75 km/h).</>
        )}
      </p>
    </Card>
  );
}
