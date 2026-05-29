import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  computePublicServices,
  SERVICES_LEVEL_LABEL,
  SERVICES_LEVEL_COLOR,
} from "@/lib/public-services";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: CitySeed;
  locale?: "fr" | "en";
}

export function PublicServicesCard({ city, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const s = computePublicServices(city);
  const dims: Array<[string, typeof s.schools]> = [
    [L("Écoles", "Schools"), s.schools],
    [L("Médiath.", "Library"), s.library],
    [L("Poste", "Post"), s.postOffice],
    [L("Mairie", "Town hall"), s.cityHall],
  ];

  return (
    <Card>
      <Link
        href={locale === "en" ? `/cities/${city.slug}/public-services` : `/villes/${city.slug}/services-publics`}
        className="group block -m-5 p-5 hover:bg-[var(--bg-elevated)]/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[var(--text-secondary)]" />
            {L("Services publics", "Public services")}
          </h3>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>

        {/* Échelle « 10 = bon » comme le reste du site (le moteur interne
            note 10 = déficit ; on inverse pour l'affichage). */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
            {(10 - s.composite).toFixed(1)}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
          </span>
          <span className={`text-xs font-bold uppercase ${SERVICES_LEVEL_COLOR[s.level]}`}>
            {locale === "en"
              ? { excellent: "Excellent", correct: "Adequate", tendu: "Strained", desertique: "Sparse" }[s.level]
              : SERVICES_LEVEL_LABEL[s.level]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          {dims.map(([label, dim]) => (
            <div key={label} className="flex items-center justify-between rounded-lg bg-[var(--bg-surface)] px-2 py-1">
              <span className="text-[var(--text-secondary)]">{label}</span>
              <span className={`font-bold tabular-nums ${SERVICES_LEVEL_COLOR[dim.level]}`}>
                {(10 - dim.score).toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-3">
          {L(
            "10 = maillage de services publics complet · DEPP · CAF · La Poste · BNF · France Services.",
            "10 = full coverage of public services · DEPP · CAF · La Poste · BNF · France Services.",
          )}
        </p>
      </Link>
    </Card>
  );
}
