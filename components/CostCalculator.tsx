"use client";
import { useState, useMemo } from "react";
import { Calculator, ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PARIS_T2_RENT = 1400;
const PARIS_CHARGES = 180;
const PARIS_TRANSPORT = 86;
const PARIS_FOOD_INDEX = 100;

function foodIndex(citySlug: string): number {
  const costScore = CITIES_SEED.find((c) => c.slug === citySlug)?.scores.cost ?? 7;
  return Math.round(115 - costScore * 3);
}

export function CostCalculator() {
  const [parisRent, setParisRent] = useState(1400);
  const [salary, setSalary] = useState(3500);

  const cities = useMemo(() => {
    return CITIES_SEED.filter((c) => HOUSING[c.slug])
      .map((c) => {
        const h = HOUSING[c.slug];
        const rentSavings = parisRent - h.avgRentT2;
        const chargeSavings = PARIS_CHARGES - Math.round(PARIS_CHARGES * 0.8);
        const transportSavings = PARIS_TRANSPORT - 25;
        const foodSavings = Math.round((salary * 0.25 * (PARIS_FOOD_INDEX - foodIndex(c.slug))) / 100);
        const totalMonthlySavings = rentSavings + chargeSavings + transportSavings + foodSavings;
        return {
          city: c,
          housing: h,
          rentSavings,
          totalMonthlySavings,
          annualSavings: totalMonthlySavings * 12,
          savingsPct: Math.round((totalMonthlySavings / salary) * 100),
        };
      })
      .sort((a, b) => b.totalMonthlySavings - a.totalMonthlySavings)
      .slice(0, 8);
  }, [parisRent, salary]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <Calculator className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">Calculateur de pouvoir d'achat</h3>
          <p className="text-xs text-[var(--text-secondary)]">Combien économiseriez-vous en quittant Paris ?</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-2">
            Mon loyer actuel (Paris)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={700}
              max={3000}
              step={50}
              value={parisRent}
              onChange={(e) => setParisRent(Number(e.target.value))}
              className="flex-1 accent-[var(--accent)]"
            />
            <span className="text-sm font-bold font-mono-data text-[var(--accent)] w-20 text-right">
              {parisRent}€/mois
            </span>
          </div>
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-2">
            Mon salaire net mensuel
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1500}
              max={8000}
              step={100}
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="flex-1 accent-[var(--accent)]"
            />
            <span className="text-sm font-bold font-mono-data text-[var(--accent)] w-20 text-right">
              {salary}€/mois
            </span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {cities.map(({ city, housing, totalMonthlySavings, annualSavings, savingsPct }) => {
          const positive = totalMonthlySavings > 0;
          return (
            <Link
              key={city.slug}
              href={`/villes/${city.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {city.name}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">{city.region}</span>
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Loyer T2 : {housing.avgRentT2}€/mois
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={cn("text-right", positive ? "text-emerald-400" : "text-red-400")}>
                  <div className="text-sm font-bold font-mono-data">
                    {positive ? "+" : ""}{totalMonthlySavings}€/mois
                  </div>
                  <div className="text-[10px]">
                    {positive ? "+" : ""}{annualSavings.toLocaleString("fr-FR")}€/an
                  </div>
                </div>
                {positive ? (
                  <TrendingDown className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-400 flex-shrink-0" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-[10px] text-[var(--text-tertiary)] mt-4">
        Estimation indicative basée sur les loyers médians, forfait transport moyen et indice alimentaire. Hors différentiel salarial.
      </p>
      <Link
        href="/quiz"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 text-sm text-[var(--accent)] font-medium py-2.5 hover:bg-[var(--accent)]/10 transition-colors"
      >
        Affiner avec le quiz IA complet
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
