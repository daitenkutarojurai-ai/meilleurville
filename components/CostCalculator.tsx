"use client";
import { useState, useMemo } from "react";
import { Calculator, ArrowRight, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import type { CostCalcCity } from "@/lib/cost-calc-data";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PARIS_CHARGES = 180;
const PARIS_TRANSPORT = 86;
const PARIS_FOOD_INDEX = 100;
const RENT_BUDGET_RATIO = 0.33; // standard taux d'effort

type PriorityId = "budget" | "remote" | "nature" | "culture" | "soleil" | "securite";

interface Priority {
  id: PriorityId;
  label: string;
  emoji: string;
  axis: "cost" | "remoteWork" | "nature" | "culture" | "life" | "safety";
  reasonTemplate: (score: number) => string;
}

const PRIORITIES_FR: Priority[] = [
  { id: "budget",   label: "Budget",     emoji: "💰", axis: "cost",       reasonTemplate: (s) => `Coût ${s.toFixed(1)}/10 — pouvoir d'achat préservé` },
  { id: "remote",   label: "Télétravail", emoji: "💻", axis: "remoteWork", reasonTemplate: (s) => `Télétravail ${s.toFixed(1)}/10 — fibre, coworkings, cadre` },
  { id: "nature",   label: "Nature",     emoji: "🌿", axis: "nature",     reasonTemplate: (s) => `Nature ${s.toFixed(1)}/10 — accès parcs, forêts, mer/montagne` },
  { id: "culture",  label: "Culture",    emoji: "🏛️", axis: "culture",    reasonTemplate: (s) => `Culture ${s.toFixed(1)}/10 — scène, restos, musées` },
  { id: "soleil",   label: "Qualité de vie", emoji: "☀️", axis: "life",   reasonTemplate: (s) => `Qualité de vie ${s.toFixed(1)}/10 — climat, ambiance` },
  { id: "securite", label: "Sécurité",   emoji: "🛡️", axis: "safety",     reasonTemplate: (s) => `Sécurité ${s.toFixed(1)}/10 — SSMSI dans la norme` },
];

const PRIORITIES_EN: Priority[] = [
  { id: "budget",   label: "Budget",      emoji: "💰", axis: "cost",       reasonTemplate: (s) => `Cost ${s.toFixed(1)}/10 — keep more of your paycheck` },
  { id: "remote",   label: "Remote work", emoji: "💻", axis: "remoteWork", reasonTemplate: (s) => `Remote work ${s.toFixed(1)}/10 — fibre, coworking, setup` },
  { id: "nature",   label: "Nature",      emoji: "🌿", axis: "nature",     reasonTemplate: (s) => `Nature ${s.toFixed(1)}/10 — parks, forests, sea/mountains` },
  { id: "culture",  label: "Culture",     emoji: "🏛️", axis: "culture",    reasonTemplate: (s) => `Culture ${s.toFixed(1)}/10 — scene, restaurants, museums` },
  { id: "soleil",   label: "Quality of life", emoji: "☀️", axis: "life",   reasonTemplate: (s) => `Quality of life ${s.toFixed(1)}/10 — climate, atmosphere` },
  { id: "securite", label: "Safety",      emoji: "🛡️", axis: "safety",     reasonTemplate: (s) => `Safety ${s.toFixed(1)}/10 — crime stats in the normal range` },
];

function foodIndex(costScore: number): number {
  return Math.round(115 - costScore * 3);
}

// cities is a server-computed projection (lib/cost-calc-data) — importing the
// seed + housing here would ship them in the homepage client bundle.
export function CostCalculator({ locale = "fr", cities: source }: { locale?: "fr" | "en"; cities: CostCalcCity[] }) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const PRIORITIES = locale === "en" ? PRIORITIES_EN : PRIORITIES_FR;
  const [parisRent, setParisRent] = useState(1400);
  const [salary, setSalary] = useState(3500);
  const [priorityId, setPriorityId] = useState<PriorityId>("budget");

  const priority = PRIORITIES.find((p) => p.id === priorityId)!;
  const rentBudget = Math.round(Math.max(parisRent, salary * RENT_BUDGET_RATIO));

  const cities = useMemo(() => {
    return source
      .map((c) => {
        const rentSavings = parisRent - c.avgRentT2;
        const chargeSavings = PARIS_CHARGES - Math.round(PARIS_CHARGES * 0.8);
        const transportSavings = PARIS_TRANSPORT - 25;
        const foodSavings = Math.round((salary * 0.25 * (PARIS_FOOD_INDEX - foodIndex(c.scores.cost))) / 100);
        const totalMonthlySavings = rentSavings + chargeSavings + transportSavings + foodSavings;
        const affordable = c.avgRentT2 <= rentBudget;
        const priorityScore = c.scores[priority.axis];

        // Composite ranking: priority axis dominates, savings provides
        // tie-breaking + a small penalty if the city is over the user's
        // rent budget. This way the order *visibly* shifts when the user
        // changes inputs — it was constant before because rentSavings
        // dominated and was identical-rank-preserving.
        const affordabilityWeight = affordable ? 0 : -2.5;
        const savingsWeight = Math.max(-1, Math.min(1, totalMonthlySavings / 1000));
        const rank = priorityScore + savingsWeight + affordabilityWeight;

        return {
          city: c,
          rentSavings,
          totalMonthlySavings,
          annualSavings: totalMonthlySavings * 12,
          affordable,
          priorityScore,
          rank,
          reason: priority.reasonTemplate(priorityScore),
        };
      })
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 8);
  }, [parisRent, salary, rentBudget, priority, source]);

  const overBudgetCount = cities.filter((c) => !c.affordable).length;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <Calculator className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{locale === "en" ? "Purchasing power calculator" : <>Calculateur de pouvoir d&apos;achat</>}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{L("Combien économiseriez-vous en quittant Paris, et où aller selon vos priorités ?", "How much would you save by leaving Paris, and where to go based on what matters to you?")}</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="calc-loyer" className="text-xs text-[var(--text-secondary)] block mb-2">
            {L("Mon loyer actuel (Paris)", "My current rent (Paris)")}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="calc-loyer"
              type="range"
              min={700}
              max={3000}
              step={50}
              value={parisRent}
              onChange={(e) => setParisRent(Number(e.target.value))}
              className="flex-1 accent-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
            />
            <span className="text-sm font-bold font-mono-data text-[var(--accent)] w-20 text-right">
              {parisRent}{L("€/mois", "€/mo")}
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="calc-salaire" className="text-xs text-[var(--text-secondary)] block mb-2">
            {L("Mon salaire net mensuel", "My monthly take-home pay")}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="calc-salaire"
              type="range"
              min={1500}
              max={8000}
              step={100}
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="flex-1 accent-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
            />
            <span className="text-sm font-bold font-mono-data text-[var(--accent)] w-20 text-right">
              {salary}{L("€/mois", "€/mo")}
            </span>
          </div>
        </div>
      </div>

      {/* Priority selector — this is what actually re-ranks the results */}
      <div className="mb-5">
        <label className="text-xs text-[var(--text-secondary)] block mb-2">
          {L("Ma priorité pour le déménagement", "What matters most in my move")}
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={L("Priorité", "Priority")}>
          {PRIORITIES.map((p) => {
            const active = p.id === priorityId;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPriorityId(p.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)]"
                )}
              >
                <span aria-hidden>{p.emoji}</span>
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
          {locale === "en"
            ? <>Within budget: 1-bed rent ≤ {rentBudget}€/mo (33% of pay or your current rent, whichever is higher).</>
            : <>Budget compatible : loyer T2 ≤ {rentBudget}€/mois (33 % du salaire ou votre loyer actuel, le plus haut).</>}
        </p>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {cities.map(({ city, totalMonthlySavings, annualSavings, affordable, reason }) => {
          const positive = totalMonthlySavings > 0;
          return (
            <Link
              key={city.slug}
              href={locale === "en" ? `/cities/${city.slug}` : `/villes/${city.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {city.name}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">{city.region}</span>
                  {!affordable && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-[10px] font-semibold px-1.5 py-0.5">
                      <AlertCircle className="h-3 w-3" />
                      {L("Hors budget", "Over budget")}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                  {L("Loyer T2 : ", "1-bed rent: ")}{city.avgRentT2}{L("€/mois", "€/mo")} · <span className="text-[var(--accent)] font-medium">{reason}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={cn("text-right", positive ? "text-emerald-600" : "text-red-500")}>
                  <div className="text-sm font-bold font-mono-data">
                    {positive ? "+" : ""}{totalMonthlySavings}{L("€/mois", "€/mo")}
                  </div>
                  <div className="text-[10px]">
                    {positive ? "+" : ""}{annualSavings.toLocaleString(locale === "en" ? "en-GB" : "fr-FR")}{L("€/an", "€/yr")}
                  </div>
                </div>
                {positive ? (
                  <TrendingDown className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <p className="text-[10px] text-[var(--text-tertiary)] mt-4">
        {L("Estimation indicative basée sur les loyers médians, forfait transport moyen et indice alimentaire. Hors différentiel salarial.", "Rough estimate based on median rents, an average transit pass and a food index. Salary differences not included.")}
        {overBudgetCount > 0 && (locale === "en"
          ? <> {overBudgetCount} {overBudgetCount > 1 ? "cities are" : "city is"} flagged over budget: a great fit for your priority, but the 1-bed rent is above your threshold.</>
          : <> {overBudgetCount} ville{overBudgetCount > 1 ? "s" : ""} {overBudgetCount > 1 ? "sont" : "est"} marquée{overBudgetCount > 1 ? "s" : ""} hors budget : excellent fit priorité mais loyer T2 au-dessus de votre seuil.</>
        )}
      </p>
      <Link
        href="/city-match"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 text-sm text-[var(--accent)] font-medium py-2.5 hover:bg-[var(--accent)]/10 transition-colors"
      >
        {L("Affiner avec le quiz IA complet", "Refine with the full AI quiz")}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
