import Link from "next/link";
import { Volume2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { computeNoiseExposure, NOISE_LEVEL_LABEL, NOISE_LEVEL_COLOR } from "@/lib/noise-exposure";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: CitySeed;
  locale?: "fr" | "en";
}

export function NoiseCard({ city, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const n = computeNoiseExposure(city);
  const dims: Array<[string, typeof n.road]> = [
    [L("Routier", "Road"), n.road],
    [L("Aérien", "Aircraft"), n.aircraft],
    [L("Ferré", "Rail"), n.rail],
    [L("Nocturne", "Night-time"), n.urbanNight],
  ];

  return (
    <Card>
      <Link
        href={locale === "en" ? `/cities/${city.slug}/noise` : `/villes/${city.slug}/bruit`}
        className="group block -m-5 p-5 hover:bg-[var(--bg-elevated)]/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-[var(--text-secondary)]" />
            {L("Bruit", "Noise")}
          </h3>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            {n.composite.toFixed(1)}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
          </span>
          <span className={`text-xs font-bold uppercase ${NOISE_LEVEL_COLOR[n.level]}`}>
            {locale === "en"
              ? ({ faible: "Low", modere: "Moderate", eleve: "High", fort: "Severe" } as const)[n.level]
              : NOISE_LEVEL_LABEL[n.level]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {dims.map(([label, dim]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-2 py-1">
              <span className="text-[var(--text-secondary)]">{label}</span>
              <span className={`font-bold tabular-nums ${NOISE_LEVEL_COLOR[dim.level]}`}>
                {dim.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-3">
          {L(
            "10 = nuisance sonore maximale · CBS · PEB · Bruitparif — carte précise sur la CBS communale.",
            "10 = worst noise exposure · CBS · PEB · Bruitparif — see the town's strategic noise map for street-level detail."
          )}
        </p>
      </Link>
    </Card>
  );
}
