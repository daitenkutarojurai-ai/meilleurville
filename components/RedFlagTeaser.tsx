import Link from "@/components/AppLink";
import { AlertTriangle, ArrowRight, Volume2, Droplets, Wind, Shield } from "lucide-react";
import type { CSSProperties } from "react";

// The Red Flag Radar as the hazard legend of the survey map: a framed cartouche
// on topo paper, each category a hatched brick symbol with a grid reference.
// Brick is the site's one warm pop — red stays reserved for the score tiers,
// so no red washes, pills or icons here. CLAUDE.md « Carte & plaque ».
const HATCH: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, color-mix(in srgb, var(--accent-pink) 16%, transparent) 0 2px, transparent 2px 6px)",
};

export function RedFlagTeaser({ locale = "fr" }: { locale?: "fr" | "en" } = {}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);

  const FLAG_TYPES = [
    {
      icon: Volume2,
      label: L("Couloirs de bruit", "Noise corridors"),
      desc: L("Autoroutes, voies ferrées, aéroports", "Motorways, rail lines, airports"),
    },
    {
      icon: Droplets,
      label: L("Zones inondables", "Flood zones"),
      desc: L("PPRI, débordements récents", "Flood-risk plans, recent overflows"),
    },
    {
      icon: Wind,
      label: L("Qualité d'air", "Air quality"),
      desc: L("PM10 / PM2.5 / NO₂ chroniques", "Chronic PM10 / PM2.5 / NO₂"),
    },
    {
      icon: Shield,
      label: L("Insécurité", "Crime"),
      desc: L("Cambriolages, vols avec violence", "Burglaries, violent thefts"),
    },
  ];

  return (
    <section className="py-8 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid items-center gap-10 border-t border-[var(--border)] pt-6 lg:grid-cols-2">
          {/* Left: copy */}
          <div>
            <p className="mb-3 inline-flex items-center gap-2 font-mono-data text-xs font-semibold uppercase tracking-widest text-[var(--accent-pink)]">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
              Red Flag Radar
            </p>
            <h2 className="mb-4 text-3xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] lg:text-5xl">
              {locale === "en" ? (
                <>
                  What the property listing{" "}
                  <span className="font-display italic text-[var(--accent-pink)]">will never tell you.</span>
                </>
              ) : (
                <>
                  Ce que l&apos;annonce immobilière{" "}
                  <span className="font-display italic text-[var(--accent-pink)]">ne vous dira jamais.</span>
                </>
              )}
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-[var(--text-secondary)]">
              {L(
                "Bruit, inondations, pollution, insécurité — quatre catégories de points noirs qu'on liste pour chaque ville à partir des données ouvertes (Géorisques, ATMO, SSMSI). Sourcé, daté, vérifiable.",
                "Noise, flooding, pollution, crime — four categories of red flags we list for every city, built from open data (Géorisques, ATMO, SSMSI). Sourced, dated, checkable."
              )}
            </p>
            <Link
              href="/red-flags"
              className="inline-flex items-center gap-2 border-b-2 border-[var(--accent-pink)] pb-0.5 font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent-pink)]"
            >
              {L("Explorer le Red Flag Radar", "Explore the Red Flag Radar")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Right: the legend cartouche — honest categories, not fake signalements */}
          <div className="topo-bg rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-1.5">
            <div className="rounded-lg border border-[var(--text-primary)]/15 bg-[var(--bg-surface)]/90 p-4 sm:p-5">
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-[var(--text-primary)]/15 pb-2">
                <p className="font-mono-data text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">
                  {L("Légende", "Legend")}
                </p>
                <p className="font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                  {L("4 catégories surveillées", "4 categories tracked")}
                </p>
              </div>
              <ul>
                {FLAG_TYPES.map(({ icon: Icon, label, desc }, i) => (
                  <li
                    key={label}
                    className="flex items-center gap-4 border-b border-dashed border-[var(--border)] py-3 last:border-b-0"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-[var(--accent-pink)] bg-[var(--bg-surface)] text-[var(--accent-pink)]"
                      style={HATCH}
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-[var(--text-primary)]">{label}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{desc}</div>
                    </div>
                    <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]" aria-hidden="true">
                      R{i + 1}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-[var(--text-primary)]/15 pt-3 text-xs text-[var(--text-secondary)]">
                {L(
                  "Vous voulez signaler un point noir ? Discussion ouverte sur la page Red Flags.",
                  "Spotted a red flag? Join the open discussion on the Red Flags page."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
