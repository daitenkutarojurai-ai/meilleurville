import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookingCTA } from "@/components/BookingCTA";
import { StickyBookingBar } from "@/components/StickyBookingBar";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  monthSignal,
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
} from "@/lib/vacation-fit";
import { nearestStation, distanceToNearestKm } from "@/lib/climate-normals";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import {
  MapPin,
  ChevronRight,
  Thermometer,
  CloudRain,
  Sun,
  Users,
  Calendar,
} from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; city: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", city: c.slug }));
}

// EN month abbreviations (short — same as FR months but in English)
const EN_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// EN months full labels
const EN_MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function enMonthShort(m: MonthIndex): string {
  return EN_MONTHS_SHORT[m - 1];
}

function enMonthFull(m: MonthIndex): string {
  return EN_MONTHS_FULL[m - 1];
}

// EN slug → EN month index mapping (EN months are the canonical URL slugs)
const EN_MONTH_SLUGS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function enMonthSlug(m: MonthIndex): string {
  return EN_MONTH_SLUGS[m - 1];
}

// EN activity labels
const EN_ACTIVITY_LABELS: Record<string, string> = {
  plage: "Beach & relaxation",
  montagne: "Hiking & mountains",
  ski: "Skiing & winter sports",
  citytrip: "City break & culture",
  vignobles: "Wine & vineyards",
  surf: "Surfing & watersports",
  thermal: "Thermal spas & wellness",
  "road-trip": "Road trip",
  gastro: "Gastronomy",
  famille: "Family holidays",
};

// EN budget tier descriptions
const EN_BUDGET_TIER_DESC: Record<1 | 2 | 3 | 4, string> = {
  1: "very affordable (< €70/day)",
  2: "reasonable (€70–110/day)",
  3: "upmarket (€110–180/day)",
  4: "luxury / peak season (€180+/day)",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === citySlug);
  if (!city) return {};
  const best = bestMonthsFor(city);
  const months = best.map((m) => enMonthFull(m).toLowerCase()).join(", ");
  return {
    title: `Holidays in ${city.name} 2026 · when to go, what to do`,
    description: `When to visit ${city.name} (${city.department}): best months ${months}. Climate, crowds, activities where the city excels. Holiday fit score + hotels.`,
    alternates: { canonical: `${EN_BASE}/vacations/${city.slug}` },
    openGraph: {
      title: `Holidays in ${city.name}`,
      description: `When to go, what to do, what to budget.`,
    },
  };
}

export default async function CityVacationsPage({ params }: Props) {
  const { city: citySlug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === citySlug);
  if (!city) notFound();

  const fit = vacationFit(city);
  const bestMonths = bestMonthsFor(city);
  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const m = (i + 1) as MonthIndex;
    return { month: m, signal: monthSignal(city, m) };
  });

  const activityRankings = ACTIVITIES
    .map((slug) => ({ slug, fitness: activityFitness(city, slug) }))
    .filter((a) => a.fitness >= 5)
    .sort((a, b) => b.fitness - a.fitness)
    .slice(0, 5);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: `${EN_BASE}/` },
    { name: "Vacations", path: `${EN_BASE}/vacations` },
    { name: city.name, path: `${EN_BASE}/vacations/${city.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `What is the best month to visit ${city.name}?`,
      a: `The three best months for ${city.name} are ${bestMonths.map((m) => enMonthFull(m)).join(", ")}. This reflects a combination of favourable climate, moderate tourist crowds and seasonal activities.`,
    },
    {
      q: `What are the best activities to do in ${city.name}?`,
      a: activityRankings.length > 0
        ? `${city.name} stands out particularly for ${activityRankings.slice(0, 3).map((a) => (EN_ACTIVITY_LABELS[a.slug] ?? ACTIVITY_DEFS[a.slug].label).toLowerCase()).join(", ")}.`
        : `${city.name} is a generalist destination with no marked tourist specialty — good for a city break or a road-trip stop.`,
    },
    {
      q: `What budget should I plan for ${city.name}?`,
      a: `${city.name} falls in the ${BUDGET_TIER_LABEL[fit.budgetTier]} bracket (${EN_BUDGET_TIER_DESC[fit.budgetTier]}). Cost of living score: ${city.scores.cost.toFixed(1)}/10 — see the full city profile for rent and restaurant details.`,
    },
  ]);

  function crowdLabel(crowded: number): string {
    if (crowded <= 2) return "Quiet";
    if (crowded === 3) return "Moderate";
    return "Very busy";
  }

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
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-1">·</span>
            <Link href="/vacations" className="hover:underline">Vacations</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">{city.name}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            Holidays in{" "}
            <span className="font-display italic gradient-text-anim">{city.name}</span>
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            <MapPin className="inline h-4 w-4 mr-1 text-[var(--accent)]" />
            {city.department} · {city.region}. When to go, what to do, what to budget.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge>
              <Calendar className="inline h-3 w-3 mr-1" />
              Best months: {bestMonths.map((m) => enMonthShort(m)).join(" · ")}
            </Badge>
            <Badge>Budget {BUDGET_TIER_LABEL[fit.budgetTier]}</Badge>
            <Badge>Overall score {city.scores.global.toFixed(1)}/10</Badge>
          </div>
        </div>
      </section>

      {/* 12-month calendar */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Year-round calendar
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[var(--text-tertiary)] uppercase tracking-wider">
                  <th className="py-2 pr-2">Month</th>
                  <th className="py-2 px-2 text-right">Temp.</th>
                  <th className="py-2 px-2 text-right">Rain</th>
                  <th className="py-2 px-2 text-right">Sun</th>
                  <th className="py-2 px-2 text-right">Crowds</th>
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
                          href={`/vacations/month/${enMonthSlug(month)}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                        >
                          {EN_MONTHS_SHORT[month - 1]}
                        </Link>
                        {isTop3 && (
                          <span className="ml-1.5 text-[10px] uppercase tracking-wider font-semibold text-[var(--accent)]">
                            recommended
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right font-mono-data text-[var(--text-secondary)]">
                        {signal.tempAvg} °C
                      </td>
                      <td className="py-2 px-2 text-right font-mono-data text-[var(--text-secondary)]">
                        {signal.rainDays} d
                      </td>
                      <td className="py-2 px-2 text-right font-mono-data text-[var(--text-secondary)]">
                        {signal.sunHoursPerDay} h
                      </td>
                      <td className="py-2 px-2 text-right text-[var(--text-secondary)]">
                        {crowdLabel(signal.crowded)}
                      </td>
                      <td className="py-2 pl-2 text-right">
                        <Link
                          href={`/vacations/month/${enMonthSlug(month)}`}
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

      {/* Activities where this city excels */}
      {activityRankings.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            What to do here
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {activityRankings.map((a) => {
              const def = ACTIVITY_DEFS[a.slug];
              return (
                <Link
                  key={a.slug}
                  href={`/vacations/activity/${a.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span aria-hidden className="text-2xl">{def.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {EN_ACTIVITY_LABELS[a.slug] ?? def.label}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        Fit score: {a.fitness.toFixed(1)}/10
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

      {/* Current month climate snapshot */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
          Climate in {city.name}
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
                    <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
                      {enMonthShort(now)}
                    </span>
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
                    <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Rain</span>
                  </div>
                  <div className="text-xl font-bold font-mono-data text-[var(--text-primary)]">
                    {sig.rainDays} d
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">per month</div>
                </Card>
                <Card>
                  <div className="flex items-center gap-2 mb-1">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Sun</span>
                  </div>
                  <div className="text-xl font-bold font-mono-data text-[var(--text-primary)]">
                    {sig.sunHoursPerDay} h
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">per day</div>
                </Card>
                <Card>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-violet-500" />
                    <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Crowds</span>
                  </div>
                  <div className="text-xl font-bold font-mono-data text-[var(--text-primary)]">
                    {sig.crowded}/5
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">
                    {crowdLabel(sig.crowded)}
                  </div>
                </Card>
              </>
            );
          })()}
        </div>
        {/* Climate source transparency */}
        {(() => {
          const station = nearestStation(city);
          const dist = distanceToNearestKm(city);
          if (!station || dist == null) return null;
          return (
            <p className="text-[11px] text-[var(--text-tertiary)] mt-3 leading-relaxed">
              Climate data: <strong>Météo-France 1991–2020 normals</strong> from station{" "}
              <strong>{station.name}</strong>
              {dist > 0 && <> approximately {dist} km away</>}
              {dist > 80 && (
                <span className="text-amber-700"> · distant station, indicative values</span>
              )}
              .
            </p>
          );
        })()}
      </section>

      {/* Booking CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <BookingCTA cityName={city.name} variant="full" />
      </section>

      {/* Link to full city profile */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <Link
          href={`/cities/${city.slug}`}
          className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
        >
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              Full profile of {city.name}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              8 axes, rankings, neighbourhoods, climate, safety, employment — everything in one place.
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] shrink-0" />
        </Link>
      </section>

      <Footer />
      <StickyBookingBar cityName={city.name} />
    </main>
  );
}
