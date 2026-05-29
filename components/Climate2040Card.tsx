import Link from "next/link";
import { Thermometer, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { projectClimate2040 } from "@/lib/climate-2040";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: CitySeed;
  locale?: "fr" | "en";
}

export function Climate2040Card({ city, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const p = projectClimate2040(city);
  // Skip on DROM (modelling is much less reliable) and when no avgTempJuly
  if (city.avgTempJuly == null) return null;

  return (
    <Card>
      <Link
        href={locale === "en" ? `/cities/${city.slug}/climate-2040` : `/villes/${city.slug}/climat-2040`}
        className="group block -m-5 p-5 hover:bg-[var(--bg-elevated)]/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-[var(--text-secondary)]" />
            {L("Climat 2040", "Climate 2040")}
          </h3>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="rounded-xl bg-[var(--bg-surface)] p-2">
            <div className="text-[10px] uppercase text-[var(--text-tertiary)]">{L("Juillet", "July")}</div>
            <div className="text-lg font-bold tabular-nums">
              {p.projectedJulyC ?? "—"}
              <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">°C</span>
            </div>
            <div className="text-[10px] text-amber-700 font-semibold">
              +{p.macroRegion.deltaJulyC} °C
            </div>
          </div>
          <div className="rounded-xl bg-[var(--bg-surface)] p-2">
            <div className="text-[10px] uppercase text-[var(--text-tertiary)]">{L("Jours", "Days")} &gt; 30 °C</div>
            <div className="text-lg font-bold tabular-nums">
              {p.projectedDays30C}
              <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">{L("j", "d")}</span>
            </div>
            <div className="text-[10px] text-red-700 font-semibold">
              +{p.macroRegion.extraDays30C} {L("jours", "days")}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)] leading-tight">
          {L("Projection ARPEGE — macro-région ", "ARPEGE projection — macro-region ")}<strong className="text-[var(--text-secondary)]">{p.macroRegion.label}</strong>.
        </p>
      </Link>
    </Card>
  );
}
