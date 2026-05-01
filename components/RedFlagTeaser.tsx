import Link from "next/link";
import { AlertTriangle, ArrowRight, Volume2, Droplets, Wind, Shield } from "lucide-react";

const FLAGS = [
  { icon: Volume2, label: "Couloir de bruit autoroutier", severity: 4, city: "Lyon 7e" },
  { icon: Droplets, label: "Zone inondable identifiée", severity: 5, city: "Bordeaux Bastide" },
  { icon: Wind, label: "Qualité d'air dégradée (PM10)", severity: 3, city: "Montpellier Nord" },
  { icon: Shield, label: "Taux de cambriolages élevé", severity: 4, city: "Nice Centre" },
];

function SeverityDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i <= level
              ? level >= 4
                ? "bg-red-500"
                : level >= 3
                ? "bg-amber-400"
                : "bg-emerald-500"
              : "bg-[var(--bg-elevated)]"
          }`}
        />
      ))}
    </div>
  );
}

export function RedFlagTeaser() {
  return (
    <section className="py-20 bg-[var(--bg-surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left: copy */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-500">
              <AlertTriangle className="h-3.5 w-3.5" />
              Red Flag Radar
            </div>
            <h2 className="mb-4 text-3xl lg:text-4xl font-bold text-[var(--text-primary)] leading-tight">
              Ce que l'annonce immobilière{" "}
              <span className="text-red-500">ne vous dira jamais.</span>
            </h2>
            <p className="mb-8 text-[var(--text-secondary)] leading-relaxed text-lg">
              Les habitants signalent. L'IA agrège. Vous êtes informé.
              Bruit, inondations, pollution, insécurité — avant l'achat ou
              la signature du bail.
            </p>
            <Link
              href="/red-flags"
              className="inline-flex items-center gap-2 text-red-500 font-semibold hover:underline"
            >
              Explorer le Red Flag Radar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Right: flag cards */}
          <div className="space-y-3">
            {FLAGS.map(({ icon: Icon, label, severity, city }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                  <Icon className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {label}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">{city}</div>
                </div>
                <SeverityDots level={severity} />
              </div>
            ))}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-center">
              <div className="text-sm text-[var(--text-secondary)]">
                + 2 400 signalements vérifiés
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
