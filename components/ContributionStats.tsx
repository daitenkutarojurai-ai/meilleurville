import Link from "@/components/AppLink";
import { ArrowRight, Construction, Droplets, ShieldAlert, Volume2, Waves, Wind } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";

// « Couleurs » (2026-10-26) : cartes blanches à ombre indigo, tuiles d'icône en
// dégradé vif (.grad-head-N) en rotation, comme les catégories R1-R6 du hub
// /red-flags. Aucune teinte de palier de score ici : une catégorie n'est pas une note.
const CARD =
  "rounded-2xl bg-[var(--bg-surface)] p-6 shadow-[0_10px_30px_-18px_rgba(79,70,229,0.45)] ring-1 ring-[var(--accent)]/10";

const FLAG_TYPES = [
  { icon: Volume2, label: "Bruit chronique", desc: "Couloirs autoroutiers, voies ferrées, aéroports" },
  { icon: Droplets, label: "Risque inondation", desc: "Zones PPRI, débordements documentés" },
  { icon: Wind, label: "Qualité d'air", desc: "PM10 / PM2.5 / NO₂ chroniques (ATMO)" },
  { icon: ShieldAlert, label: "Insécurité", desc: "Cambriolages et vols avec violence (SSMSI)" },
  { icon: Construction, label: "Travaux longs", desc: "Chantiers majeurs sur 12 mois et plus" },
  { icon: Waves, label: "Érosion côtière", desc: "Communes en retrait du trait de côte" },
];

export function ContributionStats() {
  const totalCities = CITIES_SEED.length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Honest stats */}
      <div className={CARD}>
        <h3 className="mb-4 border-b border-[var(--border)] pb-3 text-sm font-semibold text-[var(--text-primary)]">
          Couverture actuelle
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: `${totalCities}`, label: "Villes profilées" },
            { value: `${FLAG_TYPES.length}`, label: "Catégories de risques" },
            { value: "8", label: "Axes de notation" },
            { value: "100%", label: "Données ouvertes" },
          ].map(({ value, label }, i) => (
            <div key={label} className="rounded-xl bg-[var(--band-indigo)] p-3 text-center">
              <div className="font-mono-data text-[9px] font-semibold uppercase tracking-[0.18em] text-[#4338CA]" aria-hidden="true">
                N° {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-1 text-xl font-bold font-mono-data text-[var(--accent)]">{value}</div>
              <div className="mt-0.5 text-xs text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Link
            href="/contact?topic=red-flag"
            className="btn-couleurs flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-center text-sm font-semibold"
          >
            Signaler un point noir
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Categories tracked */}
      <div className={`${CARD} lg:col-span-2`}>
        <h3 className="mb-4 border-b border-[var(--border)] pb-3 text-sm font-semibold text-[var(--text-primary)]">
          Catégories surveillées
        </h3>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {FLAG_TYPES.map(({ icon: Icon, label, desc }, i) => (
            <li key={label} className="flex items-start gap-3">
              <span
                className={`grad-head-${i % 6} flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm`}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-[var(--text-primary)]">{label}</span>
                  <span className="font-mono-data text-[9px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]" aria-hidden="true">
                    C{i + 1}
                  </span>
                </div>
                <div className="text-[11px] leading-relaxed text-[var(--text-secondary)]">{desc}</div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-[var(--border)] pt-3 text-[11px] leading-relaxed text-[var(--text-tertiary)]">
          Sources : Géorisques (BRGM), ATMO France, SSMSI, observatoire des trajectoires littorales.
          Les signalements habitants sont publiés ci-dessous, après filtrage anti-spam.
        </p>
      </div>
    </div>
  );
}
