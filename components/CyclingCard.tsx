import Link from "next/link";
import { Bike, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  computeCyclingMobility,
  CYCLING_LEVEL_LABEL,
  CYCLING_LEVEL_COLOR,
} from "@/lib/cycling-mobility";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: CitySeed;
  locale?: "fr" | "en";
}

export function CyclingCard({ city, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const c = computeCyclingMobility(city);
  const dims: Array<[string, typeof c.network]> = [
    [L("Réseau", "Network"), c.network],
    [L("Relief", "Terrain"), c.topography],
    [L("Sécurité", "Safety"), c.safety],
    [L("Climat", "Climate"), c.climate],
  ];

  return (
    <Card>
      <Link
        href={locale === "en" ? `/cities/${city.slug}/cycling` : `/villes/${city.slug}/velo`}
        className="group block -m-5 p-5 hover:bg-[var(--bg-elevated)]/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Bike className="h-4 w-4 text-[var(--text-secondary)]" />
            {L("Mobilité douce — vélo", "Active mobility — cycling")}
          </h3>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            {c.composite.toFixed(1)}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
          </span>
          <span className={`text-xs font-bold uppercase ${CYCLING_LEVEL_COLOR[c.level]}`}>
            {CYCLING_LEVEL_LABEL[c.level]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {dims.map(([label, dim]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-2 py-1">
              <span className="text-[var(--text-secondary)]">{label}</span>
              <span className={`font-bold tabular-nums ${CYCLING_LEVEL_COLOR[dim.level]}`}>
                {dim.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-3">
          {L(
            "Géovélo · FUB · Vélo & Territoires — 10 = excellent.",
            "Géovélo · FUB · Vélo & Territoires — 10 = best.",
          )}
        </p>
      </Link>
    </Card>
  );
}
