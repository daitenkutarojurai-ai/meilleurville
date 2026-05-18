import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookingCTA } from "@/components/BookingCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  MONTHS_SHORT,
  monthSignal,
  formatMonthLabel,
  indexToMonthSlug,
  type MonthIndex,
} from "@/lib/vacation-seasons";
import {
  ACTIVITIES,
  ACTIVITY_DEFS,
  activityFitness,
} from "@/lib/vacation-activities";
import {
  vacationFit,
  bestMonthsFor,
  BUDGET_TIER_LABEL,
  BUDGET_TIER_DESC,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { MapPin, ChevronRight, Thermometer, CloudRain, Sun, Users, Calendar } from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ ville: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ ville: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params;
  const city = CITIES_SEED.find((c) => c.slug === ville);
  if (!city) return {};
  const best = bestMonthsFor(city);
  const months = best.map((m) => formatMonthLabel(m).toLowerCase()).join(", ");
  return {
    title: `Vacances à ${city.name} 2026 — quand y aller, quoi y faire`,
    description: `Quand partir à ${city.name} (${city.department}) : meilleurs mois ${months}. Climat, affluence, activités où la ville excelle. Score adéquation vacances + lien hôtels.`,
    alternates: { canonical: `/vacances/${city.slug}` },
    openGraph: {
      title: `Vacances à ${city.name}`,
      description: `Quand y aller, quoi y faire, à quel prix.`,
    },
  };
}

export default async function VilleVacancesPage({ params }: Props) {
  const { ville } = await params;
  const city = CITIES_SEED.find((c) => c.slug === ville);
  if (!city) notFound();

  const fit = vacationFit(city);
  const bestMonths = bestMonthsFor(city);
  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const m = (i + 1) as MonthIndex;
    return { month: m, signal: monthSignal(city, m) };
  });

  // Activités où la ville est bien placée (fitness ≥ 5)
  const activityRankings = ACTIVITIES
    .map((slug) => ({ slug, fitness: activityFitness(city, slug) }))
    .filter((a) => a.fitness >= 5)
    .sort((a, b) => b.fitness - a.fitness)
    .slice(0, 5);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Vacances", path: "/vacances" },
    { name: city.name, path: `/vacances/${city.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quel est le meilleur mois pour visiter ${city.name} ?`,
      a: `Les trois meilleurs mois pour ${city.name} sont ${bestMonths.map((m) => formatMonthLabel(m).toLowerCase()).join(", ")}. C'est la combinaison d'un climat favorable, d'une affluence touristique modérée et d'activités de saison.`,
    },
    {
      q: `Quelles activités faire à ${city.name} en vacances ?`,
      a: activityRankings.length > 0
        ? `${city.name} se distingue particulièrement sur ${activityRankings.slice(0, 3).map((a) => ACTIVITY_DEFS[a.slug].label.toLowerCase()).join(", ")}.`
        : `${city.name} reste une destination généraliste sans spécialité touristique marquée — bon pour un city-break ou une étape de road-trip.`,
    },
    {
      q: `Quel budget prévoir pour ${city.name} ?`,
      a: `${city.name} se situe dans la tranche ${BUDGET_TIER_LABEL[fit.budgetTier]} (${BUDGET_TIER_DESC[fit.budgetTier]}). Score coût de la vie : ${city.scores.cost.toFixed(1)}/10 — voir la fiche complète pour le détail loyers/restos.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="relative overflow-hidden pt-12 pb-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-30" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:underline">Accueil</Link>
            <span className="mx-1">·</span>
            <Link href="/vacances" className="hover:underline">Vacances</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">{city.name}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            Vacances à <span className="font-display italic gradient-text-anim">{city.name}</span>
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            <MapPin className="inline h-4 w-4 mr-1 text-[var(--accent)]" />
            {city.department} · {city.region}. Quand y aller, quoi y faire,
            à quel prix.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge>
              <Calendar className="inline h-3 w-3 mr-1" />
              Meilleurs mois : {bestMonths.map((m) => formatMonthLabel(m).slice(0, 3)).join(" · ")}
            </Badge>
            <Badge>Budget {BUDGET_TIER_LABEL[fit.budgetTier]}</Badge>
            <Badge>Score général {city.scores.global.toFixed(1)}/10</Badge>
          </div>
        </div>
      </section>

      {/* Calendrier 12 mois */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Calendrier de l&apos;année
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[var(--text-tertiary)] uppercase tracking-wider">
                  <th className="py-2 pr-2">Mois</th>
                  <th className="py-2 px-2 text-right">Temp.</th>
                  <th className="py-2 px-2 text-right">Pluie</th>
                  <th className="py-2 px-2 text-right">Soleil</th>
                  <th className="py-2 px-2 text-right">Foule</th>
                  <th className="py-2 pl-2"></th>
                </tr>
              </thead>
              <tbody>
                {monthsData.map(({ month, signal }) => {
                  const isTop3 = bestMonths.includes(month);
                  return (
                    <tr
                      key={month}
                      className={`border-t border-[var(--border)] ${
                        isTop3 ? "bg-[var(--accent)]/5" : ""
                      }`}
                    >
                      <td className="py-2 pr-2">
                        <Link
                          href={`/vacances/mois/${indexToMonthSlug(month)}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                        >
                          {MONTHS_SHORT[month - 1]}
                        </Link>
                        {isTop3 && (
                          <span className="ml-1.5 text-[10px] uppercase tracking-wider font-semibold text-[var(--accent)]">
                            recommandé
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right font-mono-data text-[var(--text-secondary)]">
                        {signal.tempAvg} °C
                      </td>
                      <td className="py-2 px-2 text-right font-mono-data text-[var(--text-secondary)]">
                        {signal.rainDays} j
                      </td>
                      <td className="py-2 px-2 text-right font-mono-data text-[var(--text-secondary)]">
                        {signal.sunHoursPerDay} h
                      </td>
                      <td className="py-2 px-2 text-right text-[var(--text-secondary)]">
                        {signal.crowded <= 2 ? "Calme" : signal.crowded === 3 ? "Modéré" : "Très fréquenté"}
                      </td>
                      <td className="py-2 pl-2 text-right">
                        <Link
                          href={`/vacances/mois/${indexToMonthSlug(month)}`}
                          className="text-[var(--accent)] hover:underline"
                        >
                          →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Activités où la ville excelle */}
      {activityRankings.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Quoi y faire
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {activityRankings.map((a) => {
              const def = ACTIVITY_DEFS[a.slug];
              return (
                <Link
                  key={a.slug}
                  href={`/vacances/activite/${a.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span aria-hidden className="text-2xl">{def.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {def.label}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        Note adéquation : {a.fitness.toFixed(1)}/10
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Climat actuel (mois en cours) */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
          Climat à {city.name}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(() => {
            const now = (new Date().getMonth() + 1) as MonthIndex;
            const sig = monthSignal(city, now);
            return (
              <>
                <Card>
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="h-4 w-4 text-rose-500" />
                    <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">{formatMonthLabel(now)}</span>
                  </div>
                  <div className="text-xl font-bold font-mono-data text-[var(--text-primary)]">
                    {sig.tempAvg} °C
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">
                    {sig.tempMin} / {sig.tempMax} °C
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-2 mb-1">
                    <CloudRain className="h-4 w-4 text-sky-500" />
                    <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Pluie</span>
                  </div>
                  <div className="text-xl font-bold font-mono-data text-[var(--text-primary)]">
                    {sig.rainDays} j
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">sur le mois</div>
                </Card>
                <Card>
                  <div className="flex items-center gap-2 mb-1">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Soleil</span>
                  </div>
                  <div className="text-xl font-bold font-mono-data text-[var(--text-primary)]">
                    {sig.sunHoursPerDay} h
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">par jour</div>
                </Card>
                <Card>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-violet-500" />
                    <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Affluence</span>
                  </div>
                  <div className="text-xl font-bold font-mono-data text-[var(--text-primary)]">
                    {sig.crowded}/5
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">
                    {sig.crowded <= 2 ? "Calme" : sig.crowded === 3 ? "Modéré" : "Très fréquenté"}
                  </div>
                </Card>
              </>
            );
          })()}
        </div>
      </section>

      {/* Booking CTA full */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <BookingCTA cityName={city.name} variant="full" />
      </section>

      {/* Lien vers fiche complète */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <Link
          href={`/villes/${city.slug}`}
          className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              Fiche complète de {city.name}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              8 axes, classements, quartiers, climat, sécurité, marché du travail — tout y est.
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] shrink-0" />
        </Link>
      </section>

      <Footer />
    </main>
  );
}
