import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { computeEmploymentMarket, JOB_LEVEL_LABEL, JOB_LEVEL_COLOR } from "@/lib/employment-market";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: CitySeed;
}

export function EmploymentCard({ city }: Props) {
  const e = computeEmploymentMarket(city);
  const dims: Array<[string, typeof e.unemployment]> = [
    ["Chômage", e.unemployment],
    ["Dynamisme", e.dynamism],
    ["Mix", e.sectorMix],
    ["Salaires", e.salary],
  ];

  return (
    <Card>
      <Link
        href={`/villes/${city.slug}/emploi`}
        className="group block -m-5 p-5 hover:bg-[var(--bg-elevated)]/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[var(--text-secondary)]" />
            Marché du travail
          </h3>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>

        {/* Échelle « 10 = bon » (le moteur interne note 10 = marché tendu ;
            on inverse pour l'affichage, cohérent avec le reste du site). */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            {(10 - e.composite).toFixed(1)}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
          </span>
          <span className={`text-xs font-bold uppercase ${JOB_LEVEL_COLOR[e.level]}`}>
            {JOB_LEVEL_LABEL[e.level]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {dims.map(([label, dim]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-2 py-1">
              <span className="text-[var(--text-secondary)]">{label}</span>
              <span className={`font-bold tabular-nums ${JOB_LEVEL_COLOR[dim.level]}`}>
                {(10 - dim.score).toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-3">
          10 = marché du travail dynamique · INSEE · DARES · SIRENE.
        </p>
      </Link>
    </Card>
  );
}
