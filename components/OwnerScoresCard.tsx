"use client";

// F3 — Profils propriétaires bloc. 10 scores 0-10 with source provenance
// per criterion. Click a score to expand its source line.
//
// All values come from lib/owner-scores.ts. v0 = derived from existing seed.
// When real feeds are wired, this component doesn't change — only the
// computation in owner-scores.ts does.

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  computeOwnerScores,
  ownerScoreColor,
  sourceKindBadge,
  type OwnerScore,
  type OwnerScoreKey,
  type SourceKind,
} from "@/lib/owner-scores";
import type { CitySeed } from "@/data/cities-seed";

type Locale = "fr" | "en";

// English labels keyed by score key — mirrors the French labels produced by
// lib/owner-scores.ts (which must not be edited). Under FR the lib's label is
// used verbatim; under EN this lookup replaces it.
const EN_OWNER_LABELS: Record<OwnerScoreKey, string> = {
  score_canicule: "Heatwave resilience",
  score_solitude: "Social connection",
  score_bruit: "Quiet / low noise",
  score_securite_nocturne: "Safety at night",
  score_sans_voiture: "Car-free living",
  score_teletravail: "Remote work",
  score_qualite_air: "Air quality",
  score_securite_femme_seule: "Safety for solo women",
  score_jeune_actif: "Young professionals",
  score_famille: "Families",
};

// English equivalents of the source/provenance strings. Several FR strings
// interpolate a numeric value (department %, µg/m³). To keep them in sync
// without editing the lib, we detect the interpolated number from the FR
// source string and reuse it in the EN copy.
function enSource(score: OwnerScore): string {
  const num = score.source.match(/(\d+(?:[.,]\d+)?)/)?.[1];
  switch (score.key) {
    case "score_canicule":
      return "Proxy v0 — derived from the average July temperature (Open-Meteo / 1991-2020 climatology). To be replaced by the Météo-France ARPEGE 2040 projection (days > 30 °C).";
    case "score_solitude":
      return score.kind === "estimation-regionale"
        ? "Regional estimate (Insee median). Will be refined by department in the next data import."
        : `Proxy v0 — share of single-person households at department level (${num}%, Insee 2020 census). To be replaced by single-person households at the municipality level + share of over-75s.`;
    case "score_bruit":
      return "Proxy v0 — population penalty + dense Île-de-France zone. To be replaced by Bruitparif (Greater Paris) + Cerema Strategic Noise Maps (Lden ≥ 55 dB(A) zones).";
    case "score_securite_nocturne":
      return `Proxy v0 — derived from the safety score (calibrated on SSMSI offences per 1,000 residents). To be replaced by the SSMSI "night-time offences" sub-category + hourly segmentation.`;
    case "score_sans_voiture":
      return "Proxy v0 — derived from the transport score (multimodal GTFS + OSM walkability). To be enriched with Insee Mobility (share of car-free households) and bike-network density (OSM).";
    case "score_teletravail":
      return num == null
        ? "Proxy v0 — existing remote-work score (fibre coverage + derived share of managers). To be replaced by ARCEP open data on FTTH at the municipality level."
        : `Proxy v0 — department FTTH coverage (${num}%, estimated ARCEP Q4 2024) combined with the existing remote-work score.`;
    case "score_qualite_air":
      return score.kind === "estimation-regionale"
        ? "Regional estimate — average PM2.5 across mainland France (~10 µg/m³). To be replaced by ATMO France station-by-station data (at the municipality level)."
        : `Proxy v0 — annual mean PM2.5 at department level (${num} µg/m³, ATMO France 2023). To be refined by municipality.`;
    case "score_securite_femme_seule":
      return "Proxy v0 — safety (SSMSI) weighted 70% + transport density (proxy for getting home at night) 30%. To be replaced by SSMSI VFFS data specific to women + a late-night tram index.";
    case "score_jeune_actif":
      return "Proxy v0 — average of culture + remote work + cost + a metropolitan bonus. To be replaced by share of 25-35-year-olds (Insee) + SIRENE openings (cafés / bars / coworking / freelancers) over 3 years.";
    case "score_famille":
      return "Proxy v0 — average of schools + safety + nature, with a penalty if the cost of living is very high. To be enriched with DEPP (school enrolment, brevet pass rates) + CAF (childcare places per 1,000 children) + ARS paediatrician density.";
  }
}

// English equivalents of the source-kind badge labels (lib produces FR).
const EN_KIND_LABELS: Record<SourceKind, string> = {
  real: "Real source",
  "estimation-regionale": "Regional estimate",
  "proxy-v0": "Estimate",
};

function ScoreRow({ score, locale }: { score: OwnerScore; locale: Locale }) {
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const [open, setOpen] = useState(false);
  const colorClass = ownerScoreColor(score.value);
  const kindBadge = sourceKindBadge(score.kind);
  const label = locale === "en" ? EN_OWNER_LABELS[score.key] : score.label;
  const kindLabel = locale === "en" ? EN_KIND_LABELS[score.kind] : kindBadge.label;
  const sourceText = locale === "en" ? enSource(score) : score.source;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-[var(--bg-canvas)] transition-colors"
        aria-expanded={open}
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {label}
          </span>
          <span
            className={`mt-1 inline-flex items-center self-start rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${kindBadge.tone}`}
          >
            {kindLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-mono-data font-bold text-lg ${colorClass}`}
            aria-label={t(`Score ${score.value} sur 10`, `Score ${score.value} out of 10`)}
          >
            {score.value.toFixed(1)}
          </span>
          <span className="text-[var(--text-tertiary)] text-xs" aria-hidden>
            /10
          </span>
        </div>
      </button>
      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2.5">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">{t("Source : ", "Source: ")}</strong>
            {sourceText}
          </p>
        </div>
      )}
    </div>
  );
}

export function OwnerScoresCard({
  city,
  locale = "fr",
}: {
  city: CitySeed;
  locale?: Locale;
}) {
  const t = (fr: string, en: string) => (locale === "en" ? en : fr);
  const scores = computeOwnerScores(city);
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
          {t(`Profils propriétaires — ${city.name}`, `Resident profiles — ${city.name}`)}
        </h2>
        <p className="text-xs text-[var(--text-tertiary)]">
          {t(
            "10 scores 0–10 sur des dimensions concrètes (canicule, solitude, bruit, sécurité nocturne, mobilité sans voiture, qualité d'air, etc.). Cliquez sur un score pour voir la source exacte. v0 = dérivé du seed actuel ; les feeds réels (Météo-France, Insee, Bruitparif, SSMSI, ATMO, SIRENE) seront branchés itération par itération.",
            "10 scores from 0 to 10 on concrete dimensions (heatwaves, isolation, noise, safety at night, car-free mobility, air quality, etc.). Click a score to see its exact source. v0 = derived from the current dataset; real feeds (Météo-France, Insee, Bruitparif, SSMSI, ATMO, SIRENE) will be wired in iteration by iteration.",
          )}
        </p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {scores.map((s) => (
          <li key={s.key}>
            <ScoreRow score={s} locale={locale} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
