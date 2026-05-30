import Link from "next/link";
import { Dumbbell, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  computeSportLeisure,
  SPORT_LEVEL_LABEL,
  SPORT_LEVEL_COLOR,
} from "@/lib/sport-leisure";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: CitySeed;
  locale?: "fr" | "en";
}

export function SportLeisureCard({ city, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const s = computeSportLeisure(city);
  const dims: Array<[string, typeof s.facilities]> = [
    [L("Équipements", "Facilities"), s.facilities],
    [L("Outdoor", "Outdoor"), s.outdoor],
    [L("Clubs", "Clubs"), s.clubs],
    [L("Climat", "Climate"), s.climate],
  ];

  return (
    <Card>
      <Link
        href={locale === "en" ? `/cities/${city.slug}/sport` : `/villes/${city.slug}/sport`}
        className="group block -m-5 p-5 hover:bg-[var(--bg-elevated)]/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-[var(--text-secondary)]" />
            {L("Sport & loisirs", "Sport & leisure")}
          </h3>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            {s.composite.toFixed(1)}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
          </span>
          <span className={`text-xs font-bold uppercase ${SPORT_LEVEL_COLOR[s.level]}`}>
            {SPORT_LEVEL_LABEL[s.level]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {dims.map(([label, dim]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-2 py-1">
              <span className="text-[var(--text-secondary)]">{label}</span>
              <span className={`font-bold tabular-nums ${SPORT_LEVEL_COLOR[dim.level]}`}>
                {dim.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-3">
          {L(
            "INJEP · RES · CREPS — 10 = excellent.",
            "INJEP · RES · CREPS — 10 = best.",
          )}
        </p>
      </Link>
    </Card>
  );
}
