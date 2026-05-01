import Link from "next/link";
import { CITIES_SEED } from "@/data/cities-seed";

const FLAG_TYPES = [
  { emoji: "🔊", label: "Bruit chronique", desc: "Couloirs autoroutiers, voies ferrées, aéroports" },
  { emoji: "💧", label: "Risque inondation", desc: "Zones PPRI, débordements documentés" },
  { emoji: "🌫️", label: "Qualité d'air", desc: "PM10 / PM2.5 / NO₂ chroniques (ATMO)" },
  { emoji: "🚨", label: "Insécurité", desc: "Cambriolages et vols avec violence (SSMSI)" },
  { emoji: "🏗️", label: "Travaux longs", desc: "Chantiers majeurs sur 12 mois et plus" },
  { emoji: "🌊", label: "Érosion côtière", desc: "Communes en retrait du trait de côte" },
];

export function ContributionStats() {
  const totalCities = CITIES_SEED.length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Honest stats */}
      <div className="rounded-2xl glass border border-white/50 p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-5">Couverture actuelle</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: `${totalCities}`, label: "Villes profilées" },
            { value: "6", label: "Catégories de risques" },
            { value: "8", label: "Axes de notation" },
            { value: "100%", label: "Données ouvertes" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl bg-white/60 border border-[var(--border)]/60 p-3 text-center">
              <div className="text-xl font-black font-mono-data text-[var(--accent)]">{value}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Link
            href="/red-flags#discussions"
            className="block w-full text-center text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors rounded-xl py-2.5"
          >
            Signaler un point noir →
          </Link>
        </div>
      </div>

      {/* Categories tracked */}
      <div className="rounded-2xl glass border border-white/50 p-6 lg:col-span-2">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Catégories surveillées</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FLAG_TYPES.map((f) => (
            <div
              key={f.label}
              className="flex items-start gap-3 rounded-xl border border-[var(--border)]/60 bg-white/40 p-3"
            >
              <div className="text-2xl flex-shrink-0">{f.emoji}</div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[var(--text-primary)]">{f.label}</div>
                <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
          Sources : Géorisques (BRGM), ATMO France, SSMSI, observatoire des trajectoires littorales.
          Les signalements habitants sont publiés ci-dessous, après filtrage anti-spam.
        </p>
      </div>
    </div>
  );
}
