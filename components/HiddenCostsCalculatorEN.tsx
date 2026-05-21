"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
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
  return `€${value.toLocaleString("en-GB")}`;
}

function diffBadge(value: number, ref: number): { label: string; tone: string } {
  const diff = value - ref;
  const pct = ref === 0 ? 0 : Math.round((diff / ref) * 100);
  if (Math.abs(pct) < 5) return { label: "≈ Paris", tone: "text-[var(--text-tertiary)]" };
  if (diff < 0) return { label: `${pct}% vs Paris`, tone: "text-emerald-600" };
  return { label: `+${pct}% vs Paris`, tone: "text-red-600" };
}

const DEFAULT_SALARY = 2400;

export function HiddenCostsCalculatorEN({ input }: Props) {
  const hasTransitPass = useMemo(
    () => !!computeBreakdown(input).transitPass,
    [input],
  );
  const canChooseTransit = input.citySlug === "paris" || hasTransitPass;
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
      <Card>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
          Your monthly net salary
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
            aria-label="Monthly net salary"
          />
          <input
            type="number"
            min={0}
            max={20000}
            step={50}
            value={salary}
            onChange={(e) => setSalary(Math.max(0, Number(e.target.value)))}
            className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-right font-mono-data font-bold text-[var(--text-primary)]"
            aria-label="Monthly net salary — free entry"
          />
          <span className="text-sm text-[var(--text-secondary)]">€/month</span>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">
          Indicative. The calculator does not include health insurance, childcare, groceries, or
          inter-neighbourhood rent variations.
        </p>
      </Card>

      {canChooseTransit && (
        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            How do you get around?
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
              🚊 Public transit
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
              🚗 Car
            </button>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Real monthly cost in {input.cityName}
        </h2>
        <ul className="space-y-2">
          {[
            { label: "Median 1-bed rent", value: breakdown.rentT2, ref: PARIS_REFERENCE.rentT2 },
            { label: "Heating (climate zone)", value: breakdown.heating, ref: PARIS_REFERENCE.heating },
            ...(mode === "transit" && breakdown.transitPass
              ? [{ label: "Transit pass", value: breakdown.transitPass, ref: PARIS_REFERENCE.transitPass ?? 0 }]
              : [
                  { label: "Car insurance", value: breakdown.carInsurance, ref: PARIS_REFERENCE.carInsurance },
                  { label: "Fuel + maintenance", value: breakdown.fuelCommute, ref: PARIS_REFERENCE.fuelCommute },
                  { label: "Residential parking", value: breakdown.parking, ref: PARIS_REFERENCE.parking },
                ]),
            { label: "Property tax (monthly share)", value: breakdown.taxeFonciere, ref: PARIS_REFERENCE.taxeFonciere },
            { label: "Waste collection tax (TEOM)", value: breakdown.teom, ref: PARIS_REFERENCE.teom },
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

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Total fixed costs</p>
            <p className="font-mono-data font-bold text-2xl text-[var(--text-primary)]">
              {fmtEuro(breakdown.totalFixed)}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
              {Math.round(ratio * 100)}% of salary
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">Left to live on</p>
            <p
              className={`font-mono-data font-bold text-2xl ${
                remaining < 0 ? "text-red-600" : remaining < salary * 0.3 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {fmtEuro(remaining)}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
              {remaining < 0 ? "Salary insufficient" : remaining < salary * 0.3 ? "Tight" : "Comfortable"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">vs Paris (left to live on)</p>
            <p
              className={`font-mono-data font-bold text-2xl ${
                remaining > parisRemaining ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {remaining > parisRemaining ? "+" : ""}
              {fmtEuro(remaining - parisRemaining)}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
              Paris: {fmtEuro(parisRemaining)} remaining
            </p>
          </div>
        </div>
      </Card>

      <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
        Sources: Rent observatories (Clameur, SeLoger), ADEME (climate zones), France Assureurs
        (regional car insurance), Ministry of Economy (fuel), DGFiP (waste tax, property tax),
        official transit operator tariffs. All values are medians — your actual situation may
        differ significantly.
      </p>

      <Link
        href={`/cities/${input.citySlug}`}
        className="group block rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all mt-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              Full city profile for {input.cityName}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              8-axis scores · rents · neighbourhoods · climate · safety · job market.
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0 mt-1" />
        </div>
      </Link>
    </div>
  );
}
