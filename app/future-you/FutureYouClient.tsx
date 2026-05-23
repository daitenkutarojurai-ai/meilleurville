"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Wallet,
  Clock,
  Frown,
  Smile,
  Thermometer,
  MapPin,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  simulateTopCities,
  simulateReference,
  PRIORITY_META,
  MOBILITY_META,
  CLIMATE_META,
  type Priority,
  type MobilityMode,
  type ClimatePref,
  type FutureYouResult,
} from "@/lib/future-you";
import { HOUSEHOLD_PROFILES, type HouseholdProfile } from "@/lib/household-cost";
import { formatNumber, scoreColor, scoreHex } from "@/lib/utils";

const PRIORITY_KEYS: Priority[] = [
  "budget",
  "nature",
  "culture",
  "safety",
  "family",
  "remote",
  "transport",
];

const MOBILITY_KEYS: MobilityMode[] = ["remote", "transit", "bike", "car"];
const CLIMATE_KEYS: ClimatePref[] = ["warm", "mild", "cold"];

const AFFORD_META: Record<FutureYouResult["affordability"], { label: string; color: string; emoji: string }> = {
  ok:       { label: "Confortable",  color: "#16A34A", emoji: "✅" },
  tight:    { label: "Serré",         color: "#F59E0B", emoji: "⚠️" },
  negative: { label: "En déficit",    color: "#EF4444", emoji: "🚨" },
};

function stressColor(s: number): string {
  if (s >= 7) return "#EF4444";
  if (s >= 5) return "#F59E0B";
  return "#22C55E";
}

function stressLabel(s: number): string {
  if (s >= 7) return "élevé";
  if (s >= 5) return "modéré";
  return "calme";
}

export function FutureYouClient() {
  const [salary, setSalary] = useState(2800);
  const [household, setHousehold] = useState<HouseholdProfile>("couple");
  const [mobility, setMobility] = useState<MobilityMode>("transit");
  const [priorities, setPriorities] = useState<Priority[]>(["budget", "nature", "safety"]);
  const [climate, setClimate] = useState<ClimatePref>("mild");
  const [commuteMaxMin, setCommuteMaxMin] = useState(45);

  const togglePriority = (p: Priority) =>
    setPriorities((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const input = useMemo(
    () => ({ salary, household, mobility, priorities, climatePref: climate, commuteMaxMin }),
    [salary, household, mobility, priorities, climate, commuteMaxMin],
  );

  const top3 = useMemo(() => simulateTopCities(input, 3), [input]);
  const reference = useMemo(() => simulateReference(input, "paris"), [input]);

  return (
    <div className="space-y-8">
      {/* Input panel */}
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[var(--accent)]" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Votre profil</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Salary slider */}
          <div>
            <label htmlFor="fy-salary" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
              Salaire net mensuel
            </label>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold font-mono-data text-[var(--text-primary)]">{formatNumber(salary)} €</span>
              <span className="text-xs text-[var(--text-tertiary)]">après impôts</span>
            </div>
            <input
              id="fy-salary"
              type="range"
              min={1500}
              max={8000}
              step={100}
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              aria-label="Salaire net mensuel en euros"
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] font-mono-data mt-1">
              <span>1 500 €</span>
              <span>SMIC ≈ 1 480 €</span>
              <span>8 000 €</span>
            </div>
          </div>

          {/* Commute max slider */}
          <div>
            <label htmlFor="fy-commute" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
              Trajet maximal acceptable
            </label>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold font-mono-data text-[var(--text-primary)]">{commuteMaxMin} min</span>
              <span className="text-xs text-[var(--text-tertiary)]">aller simple</span>
            </div>
            <input
              id="fy-commute"
              type="range"
              min={0}
              max={90}
              step={5}
              value={commuteMaxMin}
              onChange={(e) => setCommuteMaxMin(Number(e.target.value))}
              aria-label="Trajet maximum acceptable en minutes"
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] font-mono-data mt-1">
              <span>0 min</span>
              <span>30 min</span>
              <span>90 min</span>
            </div>
          </div>
        </div>

        {/* Household chips */}
        <div className="mt-6">
          <div className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
            Foyer
          </div>
          <div className="flex flex-wrap gap-2">
            {HOUSEHOLD_PROFILES.map((p) => {
              const active = household === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setHousehold(p.key)}
                  className={
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border " +
                    (active
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-[var(--bg-canvas)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/40")
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobility chips */}
        <div className="mt-5">
          <div className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
            Mode de déplacement principal
          </div>
          <div className="flex flex-wrap gap-2">
            {MOBILITY_KEYS.map((m) => {
              const meta = MOBILITY_META[m];
              const active = mobility === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMobility(m)}
                  className={
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border inline-flex items-center gap-1.5 " +
                    (active
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-[var(--bg-canvas)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/40")
                  }
                >
                  <span>{meta.emoji}</span> {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Climate chips */}
        <div className="mt-5">
          <div className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
            Climat préféré
          </div>
          <div className="flex flex-wrap gap-2">
            {CLIMATE_KEYS.map((c) => {
              const meta = CLIMATE_META[c];
              const active = climate === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setClimate(c)}
                  className={
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border inline-flex items-center gap-1.5 " +
                    (active
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-[var(--bg-canvas)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/40")
                  }
                >
                  <span>{meta.emoji}</span> {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority chips (multi-select) */}
        <div className="mt-5">
          <div className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
            Priorités (cochez ce qui compte pour vous)
          </div>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_KEYS.map((p) => {
              const meta = PRIORITY_META[p];
              const active = priorities.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePriority(p)}
                  className={
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border inline-flex items-center gap-1.5 " +
                    (active
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm shadow-[var(--accent)]/30"
                      : "bg-[var(--bg-canvas)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/40")
                  }
                >
                  <span>{meta.emoji}</span>
                  {meta.label}
                </button>
              );
            })}
          </div>
          {priorities.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">
              Sélectionnez au moins une priorité pour affiner les recommandations.
            </p>
          )}
        </div>
      </section>

      {/* Reference card */}
      {reference && (
        <section
          className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-canvas)] px-5 py-4"
          aria-label="Repère : votre vie à Paris"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-[var(--text-tertiary)]">
              Repère Paris
            </span>
            <span className="text-[var(--text-secondary)]">
              avec votre profil, il vous reste{" "}
              <span className={`font-mono-data font-bold ${reference.monthlyLeftover < 200 ? "text-red-600" : reference.monthlyLeftover < 600 ? "text-amber-600" : "text-emerald-600"}`}>
                {formatNumber(Math.round(reference.monthlyLeftover))} €/mois
              </span>
              {" · "}
              <span className="font-mono-data">{reference.freeHoursPerWeek}h libres/sem.</span>
              {" · "}
              <span className="font-mono-data">stress {reference.stressIndex}/10</span>
              .
            </span>
          </div>
        </section>
      )}

      {/* Top 3 result cards */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Top 3 villes pour vous
          </h2>
          <span className="text-xs text-[var(--text-tertiary)] font-mono-data">
            sur {top3.length ? 540 : 0} villes
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {top3.map((r, i) => (
            <article
              key={r.city.slug}
              className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">
                  #{i + 1}
                </span>
                <div
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: `${scoreHex(r.city.scores.global)}22`, color: scoreHex(r.city.scores.global) }}
                >
                  Match {r.fitScore}/100
                </div>
              </div>

              <Link href={`/villes/${r.city.slug}`} className="block group">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight">
                  {r.city.name}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{r.city.region}</p>
              </Link>

              {/* Stats grid */}
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-baseline gap-2">
                  <Wallet className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  <dt className="text-[var(--text-secondary)] flex-1">Reste à vivre</dt>
                  <dd className="font-mono-data font-bold" style={{ color: AFFORD_META[r.affordability].color }}>
                    {formatNumber(Math.round(r.monthlyLeftover))} €
                  </dd>
                </div>
                <div className="flex items-baseline gap-2 pl-6 -mt-1">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: AFFORD_META[r.affordability].color }}
                  >
                    {AFFORD_META[r.affordability].emoji} {AFFORD_META[r.affordability].label}
                  </span>
                  <span className="ml-auto text-[10px] text-[var(--text-tertiary)] font-mono-data">
                    loyer {r.rent ? `${formatNumber(r.rent)} €` : "—"}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <Clock className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  <dt className="text-[var(--text-secondary)] flex-1">Heures libres / sem.</dt>
                  <dd className="font-mono-data font-bold text-[var(--text-primary)]">{r.freeHoursPerWeek} h</dd>
                </div>

                <div className="flex items-baseline gap-2">
                  <MapPin className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  <dt className="text-[var(--text-secondary)] flex-1">Trajet estimé</dt>
                  <dd className="font-mono-data font-bold text-[var(--text-primary)]">
                    {r.commuteMinutes === 0 ? "0 min" : `~${r.commuteMinutes} min`}
                  </dd>
                </div>

                <div className="flex items-baseline gap-2">
                  {r.stressIndex >= 5 ? (
                    <Frown className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  ) : (
                    <Smile className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  )}
                  <dt className="text-[var(--text-secondary)] flex-1">Stress quotidien</dt>
                  <dd className="font-mono-data font-bold" style={{ color: stressColor(r.stressIndex) }}>
                    {r.stressIndex}/10
                  </dd>
                </div>
                <div className="pl-6 -mt-1 text-[10px] text-[var(--text-tertiary)]">
                  ambiance {stressLabel(r.stressIndex)}
                </div>

                <div className="flex items-baseline gap-2">
                  <Thermometer className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  <dt className="text-[var(--text-secondary)] flex-1">Climat match</dt>
                  <dd
                    className="font-mono-data font-bold"
                    style={{ color: scoreHex(r.climateMatch) }}
                  >
                    {r.climateMatch.toFixed(1)}/10
                  </dd>
                </div>
                <div className="pl-6 -mt-1 text-[10px] text-[var(--text-tertiary)]">
                  {r.city.avgTempJuly?.toFixed(0) ?? "—"}°C été · {r.city.avgTempJanuary?.toFixed(0) ?? "—"}°C hiver
                </div>
              </dl>

              {/* Score chip + axis breakdown if priorities */}
              {r.priorityBreakdown.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[var(--border)]">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)] mb-2">
                    Sur vos priorités
                  </div>
                  <ul className="space-y-1">
                    {r.priorityBreakdown.map((p) => (
                      <li key={p.priority} className="flex items-center gap-2 text-xs">
                        <span aria-hidden>{PRIORITY_META[p.priority].emoji}</span>
                        <span className="flex-1 text-[var(--text-secondary)]">{PRIORITY_META[p.priority].label}</span>
                        <span className={`font-mono-data font-bold ${scoreColor(p.axisScore)}`}>
                          {p.axisScore.toFixed(1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                href={`/villes/${r.city.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Voir la fiche complète <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Methodology */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-[var(--text-tertiary)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Comment ça marche</h3>
        </div>
        <ul className="text-xs text-[var(--text-secondary)] leading-relaxed space-y-1.5 list-disc pl-5">
          <li>
            <strong>Reste à vivre</strong> = salaire net − loyer (selon foyer) − chauffage (zone climatique
            ANAH) − mobilité (transit ou voiture selon mode) − taxe foncière (DGFiP)
            − TEOM (référentiel ADEME) − coût scolaire si famille.
          </li>
          <li>
            <strong>Trajet estimé</strong> : proxy à partir du score transport et de la population — pas une donnée GPS.
            Mode télétravail = 0 min.
          </li>
          <li>
            <strong>Heures libres</strong> = 168 h − 56 h sommeil − 40 h travail − 21 h courses/admin − trajet ×
            10 (5 j aller-retour). Une borne supérieure réaliste, pas une promesse.
          </li>
          <li>
            <strong>Stress quotidien</strong> : pondération sécurité, qualité de vie et trajet. Plus c&apos;est sûr, calme et
            court, moins ça monte.
          </li>
          <li>
            <strong>Match</strong> : moyenne pondérée de vos priorités × score axe ville, ajustée par budget et climat.
          </li>
        </ul>
      </section>
    </div>
  );
}
