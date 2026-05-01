import Link from "next/link";
import { AlertTriangle, ArrowRight, Volume2, Droplets, Wind, Shield } from "lucide-react";

const FLAG_TYPES = [
  { icon: Volume2, label: "Couloirs de bruit", desc: "Autoroutes, voies ferrées, aéroports" },
  { icon: Droplets, label: "Zones inondables", desc: "PPRI, débordements récents" },
  { icon: Wind, label: "Qualité d'air", desc: "PM10 / PM2.5 / NO₂ chroniques" },
  { icon: Shield, label: "Insécurité", desc: "Cambriolages, vols avec violence" },
];

export function RedFlagTeaser() {
  return (
    <section className="relative py-20 bg-[var(--bg-surface)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_70%_30%,rgba(239,68,68,0.06),transparent_70%)]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left: copy */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-500">
              <AlertTriangle className="h-3.5 w-3.5" />
              Red Flag Radar
            </div>
            <h2 className="mb-4 text-3xl lg:text-5xl font-bold text-[var(--text-primary)] leading-[1.05] tracking-tight">
              Ce que l&apos;annonce immobilière{" "}
              <span className="font-display italic gradient-text-anim">ne vous dira jamais.</span>
            </h2>
            <p className="mb-8 text-[var(--text-secondary)] leading-relaxed text-lg">
              Bruit, inondations, pollution, insécurité — quatre catégories de
              points noirs qu&apos;on liste pour chaque ville à partir des données ouvertes
              (Géorisques, ATMO, SSMSI). Sourcé, daté, vérifiable.
            </p>
            <Link
              href="/red-flags"
              className="inline-flex items-center gap-2 text-red-500 font-semibold hover:underline"
            >
              Explorer le Red Flag Radar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right: flag types — honest, not fake signalements */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-semibold mb-2">
              4 catégories surveillées
            </p>
            {FLAG_TYPES.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="group flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-red-500/40 hover:shadow-md transition-all p-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 group-hover:scale-110 transition-transform">
                  <Icon className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--text-primary)]">
                    {label}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">{desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-red-500 transition-colors" />
              </div>
            ))}
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)]/40 p-4 text-center">
              <div className="text-xs text-[var(--text-secondary)]">
                Vous voulez signaler un point noir ? Discussion ouverte sur la page Red Flags.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
