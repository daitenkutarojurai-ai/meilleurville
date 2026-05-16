"use client";

// F20 — Convertisseur salaire entre villes.
//
// Logique : maintenir le même reste-à-vivre. Le coût mensuel fixe diffère
// entre 2 villes (loyer, chauffage, mobilité, taxes). Le salaire équivalent
// dans la ville cible = salaire actuel ± (delta coût fixe).
//
// Formule : equivalent = salaireSource - coutSource + coutCible
//
// Pur client — réutilise lib/cost-living.ts. Pas d'API call.

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  computeBreakdown,
  type CostCalcInput,
} from "@/lib/cost-living";

type CityLite = {
  slug: string;
  name: string;
  region: string;
  department: string;
  population: number;
  avgRentT2: number | null;
  taxeFonciereAnnualMidpoint: number | null;
};

function fmtEuro(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} €`;
}

function diffPct(target: number, source: number): { label: string; tone: string } {
  if (source === 0) return { label: "—", tone: "" };
  const pct = Math.round(((target - source) / source) * 100);
  if (Math.abs(pct) < 2) return { label: "≈ même", tone: "text-[var(--text-secondary)]" };
  if (pct > 0) return { label: `+${pct}%`, tone: "text-red-600" };
  return { label: `${pct}%`, tone: "text-emerald-600" };
}

export function SalaryEquivalent({ cities }: { cities: CityLite[] }) {
  const [sourceSlug, setSourceSlug] = useState<string>("paris");
  const [targetSlug, setTargetSlug] = useState<string>("lyon");
  const [salary, setSalary] = useState<number>(3000);

  const source = cities.find((c) => c.slug === sourceSlug) ?? cities[0];
  const target = cities.find((c) => c.slug === targetSlug) ?? cities[1];

  const sourceBreakdown = useMemo(() => {
    const input: CostCalcInput = {
      citySlug: source.slug,
      cityName: source.name,
      department: source.department,
      region: source.region,
      population: source.population,
      avgRentT2: source.avgRentT2,
      taxeFonciereAnnualMidpoint: source.taxeFonciereAnnualMidpoint,
    };
    return computeBreakdown(input);
  }, [source]);

  const targetBreakdown = useMemo(() => {
    const input: CostCalcInput = {
      citySlug: target.slug,
      cityName: target.name,
      department: target.department,
      region: target.region,
      population: target.population,
      avgRentT2: target.avgRentT2,
      taxeFonciereAnnualMidpoint: target.taxeFonciereAnnualMidpoint,
    };
    return computeBreakdown(input);
  }, [target]);

  const equivalentSalary = salary - sourceBreakdown.totalFixed + targetBreakdown.totalFixed;
  const remaining = salary - sourceBreakdown.totalFixed;
  const costDiff = targetBreakdown.totalFixed - sourceBreakdown.totalFixed;
  const costPct = sourceBreakdown.totalFixed === 0
    ? 0
    : Math.round((costDiff / sourceBreakdown.totalFixed) * 100);

  return (
    <div className="space-y-6">
      {/* Input form */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Ville actuelle
            </label>
            <select
              value={sourceSlug}
              onChange={(e) => setSourceSlug(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Salaire net mensuel actuel
            </label>
            <input
              type="number"
              min={1000}
              max={20000}
              step={100}
              value={salary}
              onChange={(e) => setSalary(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-right font-mono-data font-bold text-[var(--text-primary)]"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">
              Ville cible
            </label>
            <select
              value={targetSlug}
              onChange={(e) => setTargetSlug(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-[var(--text-tertiary)]">
          Hypothèse : vous conservez le même niveau de vie (loyer T2, mobilité, taxes mensualisées).
          Le calcul ne couvre pas mutuelle, garde, alimentation.
        </p>
      </Card>

      {/* Verdict */}
      <Card>
        <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
          Salaire équivalent à {target.name}
        </p>
        <p className="font-mono-data font-bold text-4xl text-[var(--accent)] mb-1">
          {fmtEuro(equivalentSalary)}
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          pour conserver le même reste à vivre qu&apos;à {source.name} avec {fmtEuro(salary)}.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[var(--bg-elevated)] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              Coût fixe {source.name}
            </p>
            <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">
              {fmtEuro(sourceBreakdown.totalFixed)}
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              Coût fixe {target.name}
            </p>
            <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">
              {fmtEuro(targetBreakdown.totalFixed)}
              <span className={`ml-1.5 text-[11px] font-normal ${costPct === 0 ? "text-[var(--text-secondary)]" : costPct > 0 ? "text-red-600" : "text-emerald-600"}`}>
                {costPct >= 0 ? `+${costPct}%` : `${costPct}%`}
              </span>
            </p>
          </div>
          <div className="rounded-xl bg-[var(--bg-elevated)] p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              Reste à vivre
            </p>
            <p className={`font-mono-data font-bold text-lg ${remaining < 0 ? "text-red-600" : "text-[var(--text-primary)]"}`}>
              {fmtEuro(remaining)}
            </p>
          </div>
        </div>
      </Card>

      {/* Breakdown */}
      <Card>
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Détail du coût mensuel
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 text-[var(--text-secondary)] font-medium">Poste</th>
                <th className="text-right py-2 text-[var(--text-secondary)] font-medium">{source.name}</th>
                <th className="text-right py-2 text-[var(--text-secondary)] font-medium">{target.name}</th>
                <th className="text-right py-2 text-[var(--text-secondary)] font-medium">Écart</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Loyer T2", srcKey: "rentT2", tgtKey: "rentT2" },
                { label: "Chauffage", srcKey: "heating", tgtKey: "heating" },
                { label: "Mobilité (voiture ou transport)", srcKey: "mobilityCost", tgtKey: "mobilityCost" },
                { label: "Taxe foncière (mensualisée)", srcKey: "taxeFonciere", tgtKey: "taxeFonciere" },
                { label: "TEOM", srcKey: "teom", tgtKey: "teom" },
              ].map((row) => {
                const src = sourceBreakdown[row.srcKey as keyof typeof sourceBreakdown] as number;
                const tgt = targetBreakdown[row.tgtKey as keyof typeof targetBreakdown] as number;
                const diff = diffPct(tgt, src);
                return (
                  <tr key={row.label} className="border-b border-[var(--border)]/40">
                    <td className="py-2 text-[var(--text-primary)]">{row.label}</td>
                    <td className="text-right font-mono-data py-2 text-[var(--text-primary)]">
                      {fmtEuro(src)}
                    </td>
                    <td className="text-right font-mono-data py-2 text-[var(--text-primary)]">
                      {fmtEuro(tgt)}
                    </td>
                    <td className={`text-right font-mono-data py-2 ${diff.tone}`}>{diff.label}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-[var(--border)]">
                <td className="py-2 font-semibold text-[var(--text-primary)]">Total fixe</td>
                <td className="text-right font-mono-data font-bold py-2 text-[var(--text-primary)]">
                  {fmtEuro(sourceBreakdown.totalFixed)}
                </td>
                <td className="text-right font-mono-data font-bold py-2 text-[var(--text-primary)]">
                  {fmtEuro(targetBreakdown.totalFixed)}
                </td>
                <td className={`text-right font-mono-data font-bold py-2 ${costPct === 0 ? "text-[var(--text-secondary)]" : costPct > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {costPct >= 0 ? `+${costPct}%` : `${costPct}%`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
