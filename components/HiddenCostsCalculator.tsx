"use client";

// F1 — Hidden Costs Calculator (interactive).
//
// Server passes the per-city CostBreakdown computed by lib/cost-living.ts. The
// client component adds: salary input (slider + free entry), mobility toggle
// (car / transit when both make sense), and a side-by-side comparison vs Paris.
//
// Pure client computation, no API route — keeps the page SSG and the
// calculator instant.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import {
  computeBreakdown,
  PARIS_REFERENCE,
  type CostCalcInput,
  type CostBreakdown,
} from "@/lib/cost-living";

interface Props {
  input: CostCalcInput;
}

function fmtEuro(value: number): string {
  return `${value.toLocaleString("fr-FR")} €`;
}

function diffBadge(value: number, ref: number): { label: string; tone: string } {
  const diff = value - ref;
  const pct = ref === 0 ? 0 : Math.round((diff / ref) * 100);
  if (Math.abs(pct) < 5) return { label: `≈ Paris`, tone: "text-[var(--text-tertiary)]" };
  if (diff < 0) return { label: `${pct}% vs Paris`, tone: "text-emerald-600" };
  return { label: `+${pct}% vs Paris`, tone: "text-red-600" };
}

const DEFAULT_SALARY = 2400;

export function HiddenCostsCalculator({ input }: Props) {
  const canChooseTransit = input.citySlug === "paris" || !!useMemo(
    () => computeBreakdown(input).transitPass,
    [input],
  );
  const initialMode: "car" | "transit" = canChooseTransit ? "transit" : "car";
  const [mode, setMode] = useState<"car" | "transit">(initialMode);
  const [salary, setSalary] = useState<number>(DEFAULT_SALARY);

  const breakdown: CostBreakdown = useMemo(
    () => computeBreakdown({ ...input, mobilityMode: mode }),
    [input, mode],
  );

  const remaining = salary - breakdown.totalFixed;
  const parisRemaining = salary - PARIS_REFERENCE.totalFixed;
  const ratio = salary === 0 ? 0 : breakdown.totalFixed / salary;

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
          Votre salaire net mensuel
        </h2>
        <div className="flex items-center gap-3 mb-2">
          <input
            id="hcc-salary"
            type="range"
            min={1200}
            max={6000}
            step={50}
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            className="flex-1"
            aria-label="Salaire net mensuel"
          />
          <input
            type="number"
            min={0}
            max={20000}
            step={50}
            value={salary}
            onChange={(e) => setSalary(Math.max(0, Number(e.target.value)))}
            className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-right font-mono-data font-bold text-[var(--text-primary)]"
            aria-label="Salaire net mensuel — saisie libre"
          />
          <span className="text-sm text-[var(--text-secondary)]">€/mois</span>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">
          Indicatif. Le calculateur ne prend en compte ni vos charges spécifiques
          (mutuelle, garde, sport, etc.) ni les variations interquartier.
        </p>
      </Card>

      {/* Mobility mode */}
      {canChooseTransit && (
        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Mode de mobilité
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("transit")}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                mode === "transit"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
              }`}
              aria-pressed={mode === "transit"}
            >
              🚊 Transports en commun
            </button>
            <button
              type="button"
              onClick={() => setMode("car")}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                mode === "car"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
              }`}
              aria-pressed={mode === "car"}
            >
              🚗 Voiture
            </button>
          </div>
        </Card>
      )}

      {/* Breakdown */}
      <Card>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Coût réel mensuel à {input.cityName}
        </h2>
        <ul className="space-y-2">
          {[
            { label: "Loyer T2 médian", value: breakdown.rentT2, ref: PARIS_REFERENCE.rentT2 },
            { label: "Chauffage (zone climatique)", value: breakdown.heating, ref: PARIS_REFERENCE.heating },
            ...(mode === "transit" && breakdown.transitPass
              ? [{ label: "Abonnement transports", value: breakdown.transitPass, ref: PARIS_REFERENCE.transitPass ?? 0 }]
              : [
                  { label: "Assurance voiture", value: breakdown.carInsurance, ref: PARIS_REFERENCE.carInsurance },
                  { label: "Carburant + entretien", value: breakdown.fuelCommute, ref: PARIS_REFERENCE.fuelCommute },
                  { label: "Parking résidentiel", value: breakdown.parking, ref: PARIS_REFERENCE.parking },
                ]),
            { label: "Taxe foncière (mensualisée)", value: breakdown.taxeFonciere, ref: PARIS_REFERENCE.taxeFonciere },
            { label: "Taxe ordures ménagères (TEOM)", value: breakdown.teom, ref: PARIS_REFERENCE.teom },
          ].map((row) => {
            const badge = diffBadge(row.value, row.ref);
            return (
              <li
                key={row.label}
                className="flex items-baseline justify-between gap-3 border-b border-[var(--border)]/40 last:border-b-0 py-2"
              >
                <span className="text-sm text-[var(--text-primary)]">{row.label}</span>
                <span className="flex items-baseline gap-2">
                  <span className={`text-xs ${badge.tone}`}>{badge.label}</span>
                  <span className="font-mono-data font-bold text-[var(--text-primary)] w-24 text-right">
                    {fmtEuro(row.value)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Verdict */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Coût fixe mensuel</p>
            <p className="font-mono-data font-bold text-2xl text-[var(--text-primary)]">
              {fmtEuro(breakdown.totalFixed)}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
              {Math.round(ratio * 100)}% du salaire
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Reste à vivre</p>
            <p
              className={`font-mono-data font-bold text-2xl ${
                remaining < 0 ? "text-red-600" : remaining < salary * 0.3 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {fmtEuro(remaining)}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
              {remaining < 0 ? "Salaire insuffisant" : remaining < salary * 0.3 ? "Tendu" : "Confortable"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Vs Paris (reste à vivre)</p>
            <p
              className={`font-mono-data font-bold text-2xl ${
                remaining > parisRemaining ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {remaining > parisRemaining ? "+" : ""}
              {fmtEuro(remaining - parisRemaining)}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
              Paris : {fmtEuro(parisRemaining)} restant
            </p>
          </div>
        </div>
      </Card>

      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
        Sources : Observatoires des loyers (Clameur, SeLoger), ADEME (zones thermiques),
        France Assureurs (régional), Ministère de l&apos;Économie (carburant), DGFiP
        (TEOM, taxe foncière), tarifs transports officiels exploitant. Toutes les
        valeurs sont médianes — votre situation réelle peut différer.
      </p>

      <div className="text-center">
        <Link
          href={`/villes/${input.citySlug}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--accent)] underline hover:opacity-80"
        >
          Fiche complète de {input.cityName} →
        </Link>
      </div>
    </div>
  );
}
