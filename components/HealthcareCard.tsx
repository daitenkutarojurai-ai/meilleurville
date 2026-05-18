import Link from "next/link";
import { Stethoscope, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { computeHealthcareAccess, HEALTH_LEVEL_LABEL, HEALTH_LEVEL_COLOR } from "@/lib/healthcare-access";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: CitySeed;
}

export function HealthcareCard({ city }: Props) {
  const h = computeHealthcareAccess(city);
  const dims: Array<[string, typeof h.generalistes]> = [
    ["MG", h.generalistes],
    ["Spé.", h.specialistes],
    ["Urgences", h.urgences],
    ["Pharma.", h.pharmacies],
  ];

  return (
    <Card>
      <Link
        href={`/villes/${city.slug}/sante`}
        className="group block -m-5 p-5 hover:bg-[var(--bg-elevated)]/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-[var(--text-secondary)]" />
            Accès aux soins
          </h3>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>

        {/* Score affiché sur l'échelle « 10 = bon » comme le reste du site
            (le moteur interne note 10 = désert ; on inverse pour l'affichage). */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            {(10 - h.composite).toFixed(1)}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
          </span>
          <span className={`text-xs font-bold uppercase ${HEALTH_LEVEL_COLOR[h.level]}`}>
            {HEALTH_LEVEL_LABEL[h.level]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {dims.map(([label, dim]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-2 py-1">
              <span className="text-[var(--text-secondary)]">{label}</span>
              <span className={`font-bold tabular-nums ${HEALTH_LEVEL_COLOR[dim.level]}`}>
                {(10 - dim.score).toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-3">
          10 = excellent accès aux soins · DREES · CNOM · ARS.
        </p>
      </Link>
    </Card>
  );
}
