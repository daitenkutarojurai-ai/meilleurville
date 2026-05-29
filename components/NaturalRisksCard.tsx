import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { computeNaturalRisks, RISK_LEVEL_LABEL, RISK_LEVEL_COLOR } from "@/lib/natural-risks";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: CitySeed;
  locale?: "fr" | "en";
}

export function NaturalRisksCard({ city, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const r = computeNaturalRisks(city);
  const dims: Array<[string, typeof r.flood]> = [
    [L("Inondation", "Flooding"), r.flood],
    [L("Sismicité", "Seismic"), r.seismic],
    [L("Argile", "Clay shrink-swell"), r.clay],
    [L("Feu", "Wildfire"), r.wildfire],
  ];

  return (
    <Card>
      <Link
        href={locale === "en" ? `/cities/${city.slug}/natural-risks` : `/villes/${city.slug}/risques`}
        className="group block -m-5 p-5 hover:bg-[var(--bg-elevated)]/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--text-secondary)]" />
            {L("Risques naturels", "Natural risks")}
          </h3>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            {r.composite.toFixed(1)}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
          </span>
          <span className={`text-xs font-bold uppercase ${RISK_LEVEL_COLOR[r.level]}`}>
            {RISK_LEVEL_LABEL[r.level]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {dims.map(([label, dim]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-2 py-1">
              <span className="text-[var(--text-secondary)]">{label}</span>
              <span className={`font-bold tabular-nums ${RISK_LEVEL_COLOR[dim.level]}`}>
                {dim.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-3">
          {L(
            "10 = exposition aux risques maximale · BCSF · BRGM · ONF — vérifier le PPRI précis sur Géorisques.",
            "10 = highest risk exposure · BCSF · BRGM · ONF — check the exact flood-risk plan (PPRI) on Géorisques.",
          )}
        </p>
      </Link>
    </Card>
  );
}
