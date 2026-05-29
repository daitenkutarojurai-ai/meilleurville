import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  computeDemography,
  DEMO_LEVEL_LABEL,
  DEMO_LEVEL_COLOR,
} from "@/lib/demography";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: CitySeed;
  locale?: "fr" | "en";
}

export function DemographyCard({ city, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const d = computeDemography(city);
  const dims: Array<[string, typeof d.ageing]> = [
    [L("Vieillis.", "Ageing"), d.ageing],
    [L("Jeunes", "Young"), d.youngActives],
    [L("Traj.", "Trend"), d.trajectory],
    [L("Renouv.", "Renewal"), d.renewal],
  ];

  return (
    <Card>
      <Link
        href={locale === "en" ? `/cities/${city.slug}/demographics` : `/villes/${city.slug}/demographie`}
        className="group block -m-5 p-5 hover:bg-[var(--bg-elevated)]/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--text-secondary)]" />
            {L("Démographie & vieillissement", "Demographics & ageing")}
          </h3>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>

        {/* Échelle « 10 = bon » (moteur interne note 10 = tension max ; on
            inverse l'affichage pour rester cohérent avec le reste du site). */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            {(10 - d.composite).toFixed(1)}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
          </span>
          <span className={`text-xs font-bold uppercase ${DEMO_LEVEL_COLOR[d.level]}`}>
            {DEMO_LEVEL_LABEL[d.level]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {dims.map(([label, dim]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-2 py-1">
              <span className="text-[var(--text-secondary)]">{label}</span>
              <span className={`font-bold tabular-nums ${DEMO_LEVEL_COLOR[dim.level]}`}>
                {(10 - dim.score).toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-3">
          {L("10 = démographie dynamique · INSEE RP · OMPHALE.", "10 = dynamic demographics · INSEE census · OMPHALE.")}
        </p>
      </Link>
    </Card>
  );
}
