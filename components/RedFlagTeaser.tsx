import Link from "@/components/AppLink";
import { AlertTriangle, ArrowRight, Volume2, Droplets, Wind, Shield } from "lucide-react";
import { EmojiBadge, type EmojiTone } from "@/components/EmojiBadge";

// Red Flag Radar teaser. Identité « Couleurs » (2026-10-22) : chaque catégorie
// porte un emoji dans une pastille colorée, la légende est une carte blanche.

export function RedFlagTeaser({ locale = "fr" }: { locale?: "fr" | "en" } = {}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);

  const FLAG_TYPES = [
    {
      icon: Volume2,
      emoji: "🔊",
      tone: "lilac" as EmojiTone,
      label: L("Couloirs de bruit", "Noise corridors"),
      desc: L("Autoroutes, voies ferrées, aéroports", "Motorways, rail lines, airports"),
    },
    {
      icon: Droplets,
      emoji: "🌊",
      tone: "sky" as EmojiTone,
      label: L("Zones inondables", "Flood zones"),
      desc: L("PPRI, débordements récents", "Flood-risk plans, recent overflows"),
    },
    {
      icon: Wind,
      emoji: "🌫️",
      tone: "aqua" as EmojiTone,
      label: L("Qualité d'air", "Air quality"),
      desc: L("PM10 / PM2.5 / NO₂ chroniques", "Chronic PM10 / PM2.5 / NO₂"),
    },
    {
      icon: Shield,
      emoji: "🛡️",
      tone: "indigo" as EmojiTone,
      label: L("Insécurité", "Crime"),
      desc: L("Cambriolages, vols avec violence", "Burglaries, violent thefts"),
    },
  ];

  return (
    <section className="band band-pink py-8 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid items-center gap-10 border-t border-[var(--border)] pt-6 lg:grid-cols-2">
          {/* Left: copy */}
          <div>
            <EmojiBadge emoji="🚩" tone="pink" size="lg" className="mb-3" />
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
          <div className="rounded-3xl bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#DB2777] p-[3px] shadow-lg">
            <div className="rounded-[22px] bg-white p-4 sm:p-5">
              <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-[var(--text-primary)]/15 pb-2">
                <p className="font-mono-data text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">
                  {L("Légende", "Legend")}
                </p>
                <p className="font-mono-data text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                  {L("4 catégories surveillées", "4 categories tracked")}
                </p>
              </div>
              <ul>
                {FLAG_TYPES.map(({ emoji, tone, label, desc }, i) => (
                  <li
                    key={label}
                    className="flex items-center gap-4 border-b border-dashed border-[var(--border)] py-3 last:border-b-0"
                  >
                    <EmojiBadge emoji={emoji} tone={tone} size="md" />
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
