"use client";

// F23 — Simulateur achat immobilier.
//
// Input : budget achat (€), surface souhaitée (m²). Output : top villes où
// ce budget achète, mensualité de prêt sur 20/25 ans à taux moyen actuel,
// frais de notaire estimés.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { scoreColor } from "@/lib/utils";

interface CityRow {
  slug: string;
  name: string;
  region: string;
  priceM2: number;
  score: number;
}

interface Props {
  cities: CityRow[];
}

// Taux moyen indicatif jan 2026, hors assurance.
const RATE_20Y = 3.6;
const RATE_25Y = 3.85;
// Frais de notaire ancien : environ 7-8% du prix d'achat (DMTO + émoluments + débours)
const NOTAIRE_PCT = 0.075;

function fmtEuro(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

// Standard amortization formula
function monthlyPayment(principal: number, annualRatePct: number, years: number): number {
  const monthlyRate = annualRatePct / 100 / 12;
  const n = years * 12;
  if (monthlyRate === 0) return principal / n;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
}

export function PurchaseSimulator({ cities }: Props) {
  const [budget, setBudget] = useState<number>(250000);
  const [surface, setSurface] = useState<number>(75);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(15);
  const [years, setYears] = useState<20 | 25>(20);

  const downPayment = (budget * downPaymentPct) / 100;
  const notaire = budget * NOTAIRE_PCT;
  const loanAmount = budget - downPayment;
  const monthly = monthlyPayment(loanAmount, years === 20 ? RATE_20Y : RATE_25Y, years);
  const totalCost = downPayment + notaire + monthly * years * 12;

  // Filter cities affordable for that budget at that surface
  const affordable = useMemo(() => {
    return cities
      .filter((c) => c.priceM2 * surface <= budget)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }, [cities, budget, surface]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <Card>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Vos paramètres</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Budget achat total
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={80000}
                max={1500000}
                step={10000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                aria-label="Budget achat total"
                className="flex-1"
              />
              <input
                type="number"
                min={50000}
                max={5000000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
                aria-label="Budget achat total en euros"
                className="w-28 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-right font-mono-data font-bold"
              />
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">€ — incluant frais de notaire</p>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Surface souhaitée (m²)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={20}
                max={200}
                step={5}
                value={surface}
                onChange={(e) => setSurface(Number(e.target.value))}
                aria-label="Surface souhaitée en mètres carrés"
                className="flex-1"
              />
              <input
                type="number"
                min={15}
                max={500}
                step={1}
                value={surface}
                onChange={(e) => setSurface(Math.max(15, Number(e.target.value)))}
                aria-label="Surface souhaitée en mètres carrés"
                className="w-20 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-right font-mono-data font-bold"
              />
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">m² — surface habitable</p>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Apport (% du prix)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                aria-label="Apport en pourcentage du prix"
                className="flex-1"
              />
              <span className="w-12 text-right font-mono-data font-bold text-[var(--text-primary)]">
                {downPaymentPct}%
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
              Apport : {fmtEuro(downPayment)} · à emprunter : {fmtEuro(loanAmount)}
            </p>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Durée du prêt
            </label>
            <div className="flex gap-2">
              {[20, 25].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y as 20 | 25)}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    years === y
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  {y} ans
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
              Taux indicatif {years === 20 ? RATE_20Y : RATE_25Y}% (hors assurance)
            </p>
          </div>
        </div>
      </Card>

      {/* Verdict */}
      <Card>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Simulation
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-[var(--bg-elevated)] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              Mensualité
            </p>
            <p className="font-mono-data font-bold text-xl text-[var(--accent)]">
              {fmtEuro(monthly)}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              Apport
            </p>
            <p className="font-mono-data font-bold text-xl text-[var(--text-primary)]">
              {fmtEuro(downPayment)}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              Frais notaire
            </p>
            <p className="font-mono-data font-bold text-xl text-[var(--text-primary)]">
              {fmtEuro(notaire)}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              Coût total
            </p>
            <p className="font-mono-data font-bold text-xl text-[var(--text-primary)]">
              {fmtEuro(totalCost)}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
          Taux : 3,6 % sur 20 ans / 3,85 % sur 25 ans (moyenne marché janv. 2026, hors
          assurance emprunteur ~0,3 %/an). Frais de notaire ancien estimés à 7,5 % du prix
          d&apos;achat. Apport recommandé : ≥ 10-15 % pour les meilleurs taux.
        </p>
      </Card>

      {/* Cities */}
      <Card>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
          Top 15 villes accessibles
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Villes où votre budget de {fmtEuro(budget)} permet d&apos;acheter au moins {surface} m².
          Triées par qualité de vie.
        </p>
        {affordable.length === 0 ? (
          <p className="text-sm text-amber-700">
            Aucune ville accessible avec ce budget et cette surface. Réduisez la surface ou
            augmentez le budget.
          </p>
        ) : (
          <ol className="space-y-2">
            {affordable.map((c, i) => {
              const requiredBudget = c.priceM2 * surface;
              const headroom = budget - requiredBudget;
              return (
                <li key={c.slug}>
                  <Link
                    href={`/villes/${c.slug}`}
                    className="flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 hover:border-[var(--accent)]/40 transition-all"
                  >
                    <span className="flex items-baseline gap-2 min-w-0">
                      <span className="font-mono-data text-xs text-[var(--text-tertiary)] w-6 flex-shrink-0">
                        #{i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="font-semibold text-[var(--text-primary)] block truncate">
                          {c.name}
                        </span>
                        <span className="text-[11px] text-[var(--text-tertiary)] truncate">
                          {c.priceM2.toLocaleString("fr-FR")} €/m² · {fmtEuro(requiredBudget)} pour {surface} m²
                        </span>
                      </span>
                    </span>
                    <span className="text-right flex-shrink-0">
                      <span className={`font-mono-data font-bold ${scoreColor(c.score)}`}>
                        {c.score.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-emerald-600 block">
                        +{fmtEuro(headroom)} marge
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}
