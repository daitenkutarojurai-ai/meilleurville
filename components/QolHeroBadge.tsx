// F56 — Badge Cadre de Vie sur fiche ville.
//
// Surface le méga-index F52 (env + santé + emploi) sur la page la plus
// trafiquée du site (×540). Composant serveur — zéro JS.

import Link from "next/link";
import type { CitySeed } from "@/data/cities-seed";
import {
  computeQualityOfLife,
  QOL_LEVEL_LABEL,
  QOL_LEVEL_COLOR,
} from "@/lib/quality-of-life-index";
import { findMacroRegionForCity } from "@/lib/macro-regions";

export function QolHeroBadge({
  city,
  locale = "fr",
}: {
  city: CitySeed;
  locale?: "fr" | "en";
}) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const qol = computeQualityOfLife(city);
  const macro = findMacroRegionForCity(city);

  const envHref = macro
    ? locale === "en"
      ? `/environment/${macro.slug}`
      : `/environnement/${macro.slug}`
    : locale === "en"
      ? "/environment"
      : "/environnement";
  const healthHref = macro
    ? locale === "en"
      ? `/healthcare/${macro.slug}`
      : `/sante/${macro.slug}`
    : locale === "en"
      ? "/healthcare"
      : "/sante";
  const jobHref = macro
    ? locale === "en"
      ? `/employment/${macro.slug}`
      : `/emploi/${macro.slug}`
    : locale === "en"
      ? "/employment"
      : "/emploi";
  const nationalHub = L("Hub national →", "National hub →");

  return (
    <div className="mt-6 rounded-3xl border border-white/50 glass p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">
            {L("Index Cadre de Vie", "Quality of Life Index")}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-4xl font-bold font-mono-data ${QOL_LEVEL_COLOR[qol.level]}`}>
              {qol.score.toFixed(1)}
            </span>
            <span className="text-sm text-[var(--text-tertiary)]">/10</span>
            <span className={`text-xs uppercase tracking-wide font-semibold ${QOL_LEVEL_COLOR[qol.level]}`}>
              {QOL_LEVEL_LABEL[qol.level]}
            </span>
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            {L(
              "Composite F52 — environnement 35 % · santé 30 % · emploi 35 %",
              "F52 composite — environment 35% · healthcare 30% · employment 35%"
            )}
          </div>
        </div>

        <div className="text-xs flex flex-wrap gap-2">
          <Link
            href={locale === "en" ? "/quality-of-life" : "/cadre-de-vie"}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]/40 transition-colors"
          >
            {L("Classement national →", "National ranking →")}
          </Link>
          <Link
            href={
              locale === "en"
                ? "/quality-of-life/customize"
                : "/cadre-de-vie/personnaliser"
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10 transition-colors text-[var(--accent)] font-semibold"
          >
            {L("✨ Pondérer", "✨ Weight it")}
          </Link>
        </div>
      </div>

      {/* 3 pillars breakdown — cliquable vers la macro-région correspondante */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <PillarTile
          icon="🌿"
          label={L("Environnement", "Environment")}
          value={qol.envScore}
          href={envHref}
          subhref={macro ? `${macro.label} →` : nationalHub}
        />
        <PillarTile
          icon="🩺"
          label={L("Santé", "Healthcare")}
          value={qol.healthScore}
          href={healthHref}
          subhref={macro ? `${macro.label} →` : nationalHub}
        />
        <PillarTile
          icon="💼"
          label={L("Emploi", "Employment")}
          value={qol.jobScore}
          href={jobHref}
          subhref={macro ? `${macro.label} →` : nationalHub}
        />
      </div>
      <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
        {L(
          "Sous-scores : 10 = bon sur la dimension. Méga-index propre au site, agrégat des composites F44 / F47 / F50.",
          "Sub-scores: 10 = strong on that dimension. Site-specific mega-index, an aggregate of the F44 / F47 / F50 composites."
        )}
      </p>
    </div>
  );
}

function PillarTile({
  icon,
  label,
  value,
  href,
  subhref,
}: {
  icon: string;
  label: string;
  value: number;
  href: string;
  subhref: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-white/50 glass p-3 sm:p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <span className="text-lg">{icon}</span>
        <span className="font-bold font-mono-data text-base tabular-nums text-[var(--text-primary)]">
          {value.toFixed(1)}
          <span className="text-[10px] font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
        </span>
      </div>
      <div className="mt-1 text-xs font-semibold text-[var(--text-primary)]">{label}</div>
      <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5 truncate">{subhref}</div>
    </Link>
  );
}
