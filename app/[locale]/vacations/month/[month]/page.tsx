import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookingCTA } from "@/components/BookingCTA";
import { CITIES_COUNT } from "@/lib/site-stats";
import {
  monthSignal,
  type MonthIndex,
} from "@/lib/vacation-seasons";
import {
  ACTIVITY_DEFS,
  type ActivitySlug,
} from "@/lib/vacation-activities";
import {
  topCitiesForMonth,
  BUDGET_TIER_LABEL,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import {
  MapPin,
  ChevronRight,
  Thermometer,
  CloudRain,
  Sun,
  Users,
} from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

// EN slug → month index
const EN_MONTH_TO_INDEX: Record<string, MonthIndex> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

const EN_MONTHS_ORDER = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
] as const;

type EnMonthSlug = (typeof EN_MONTHS_ORDER)[number];

const EN_MONTH_LABELS: Record<EnMonthSlug, string> = {
  january: "January", february: "February", march: "March",
  april: "April", may: "May", june: "June",
  july: "July", august: "August", september: "September",
  october: "October", november: "November", december: "December",
};

type Props = { params: Promise<{ locale: string; month: string }> };

export function generateStaticParams() {
  return EN_MONTHS_ORDER.map((slug) => ({ locale: "en", month: slug }));
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

// Month highlight activities — same logic as FR
const MONTH_HIGHLIGHT_ACTIVITIES: Record<MonthIndex, ActivitySlug[]> = {
  1: ["ski", "thermal", "citytrip"],
  2: ["ski", "thermal", "citytrip"],
  3: ["citytrip", "thermal", "vignobles"],
  4: ["citytrip", "vignobles", "famille"],
  5: ["citytrip", "vignobles", "famille"],
  6: ["plage", "surf", "montagne"],
  7: ["plage", "montagne", "surf"],
  8: ["plage", "montagne", "surf"],
  9: ["plage", "vignobles", "citytrip"],
  10: ["vignobles", "citytrip", "thermal"],
  11: ["thermal", "citytrip", "gastro"],
  12: ["ski", "citytrip", "thermal"],
};

const MONTH_ANGLES: Record<MonthIndex, { hook: string; warning: string }> = {
  1: {
    hook: "January feels like one long extended weekend: low prices, peace everywhere, low-angle winter light. Ski resorts in prime condition, city breaks deserted.",
    warning: "Avoid most coastlines — the water is 12 °C, restaurants are closed, and even Provence has no compelling reason to visit right now.",
  },
  2: {
    hook: "February is still winter and that is a good thing. Alpine resorts at peak snowpack, city breaks at reduced rates, and carnival season runs from Dunkirk to Nice.",
    warning: "School holidays mean packed, expensive ski resorts. If you ski, aim for the first or last weeks of the month.",
  },
  3: {
    hook: "Nature is restarting, mimosa is in full bloom, and tourism has not woken up yet. One of the best months of the year to visit without crowds.",
    warning: "Weather still unstable: the sea stays cold, high altitudes stay snowy. Good month for cities, shoulder season everywhere else.",
  },
  4: {
    hook: "Spring brings soft light and decent temperatures. City breaks, vineyards with early buds, mid-altitude hiking. Easter doubles visitor numbers.",
    warning: "Outside the Easter break, this is a sweet-spot month. During the holiday, expect summer prices in tourist areas.",
  },
  5: {
    hook: "May has everything: long days, reliable weather in the south, vineyards open, beaches not yet crowded. The long weekends of May 1st, 8th and Ascension weekend spike hotel prices.",
    warning: "Sea still cool in the north (16–17 °C). If swimming is the plan, wait for June.",
  },
  6: {
    hook: "June is summer without the rush. Mediterranean beaches at 21–23 °C, 16 hours of daylight, restaurants reopening. It is the favourite month of experienced travellers.",
    warning: "Schools are not yet out: the full tourist circus arrives in July.",
  },
  7: {
    hook: "July is peak season kicking in. The weather is guaranteed, but so are the prices and traffic jams. Beaches, mountains, festivals — everything works, everything is packed.",
    warning: "Bastille Day and the following two weeks are the absolute peak on the coast. If you can shift by 10 days, do it.",
  },
  8: {
    hook: "August is August. Everything is open, everything is crowded, everything costs +30%. The weather is on your side, locals' patience rather less so.",
    warning: "If you did not book in March, you will struggle. Consider the north-west half of France: less saturated than the Mediterranean coast.",
  },
  9: {
    hook: "September is mathematically the best month of the year. Sea still warm, prices collapse from the 1st, perfect light, vineyards in full harvest. The best-kept secret in French tourism.",
    warning: "No serious caveats — just go in September.",
  },
  10: {
    hook: "October brings an autumn that makes France photogenic. Forests changing colour, vineyards finishing harvest, city breaks at gentle prices.",
    warning: "In the south, Cevennes-style rainfall events can surprise. In the west, the Breton drizzle makes its return.",
  },
  11: {
    hook: "November is the great tourist silence. For those who like bare landscapes, empty museums and unhurried restaurants, it is a gift.",
    warning: "Many seaside resorts are closed. Aim for cities, wine regions or thermal spas.",
  },
  12: {
    hook: "December brings city lights, Christmas markets (Strasbourg, Colmar, Lille) and opening ski resorts. A busy but magical period.",
    warning: "The iconic Christmas markets are saturated on weekends and in the final week. Go on weekdays.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  const idx = EN_MONTH_TO_INDEX[month];
  if (!idx) return {};
  const label = EN_MONTH_LABELS[month as EnMonthSlug] ?? month;
  return {
    title: `Best places to visit in France in ${label} 2026 · top destinations`,
    description: `Top French destinations in ${label}: climate, crowds, activities. ${CITIES_COUNT} cities ranked by fit score. ${MONTH_ANGLES[idx].hook.slice(0, 70)}…`,
    alternates: { canonical: `${EN_BASE}/vacations/month/${month}` },
    openGraph: {
      title: `Best places to visit in France in ${label}`,
      description: `Climate, crowds, prices: the right ranking, no magazine filler.`,
    },
  };
}

export default async function MonthPage({ params }: Props) {
  const { month } = await params;
  const idx = EN_MONTH_TO_INDEX[month];
  if (!idx) notFound();
  const label = EN_MONTH_LABELS[month as EnMonthSlug] ?? month;

  const top30 = topCitiesForMonth(idx, { limit: 30 });
  const angles = MONTH_HIGHLIGHT_ACTIVITIES[idx];
  const angle = MONTH_ANGLES[idx];

  const topsByActivity = angles.map((slug) => ({
    activity: slug,
    list: topCitiesForMonth(idx, { activity: slug, limit: 3 }),
  }));

  const calmPicks = top30
    .filter(({ city }) => monthSignal(city, idx).crowded <= 2)
    .slice(0, 5);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: `${EN_BASE}/` },
    { name: "Vacations", path: `${EN_BASE}/vacations` },
    { name: label, path: `${EN_BASE}/vacations/month/${month}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best destinations in France in ${label}`,
    itemListElement: top30.slice(0, 10).map(({ city }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${EN_BASE}/cities/${city.slug}`,
      name: city.name,
    })),
  };

  function crowdLabel(crowded: number): string {
    if (crowded <= 2) return "Quiet";
    if (crowded === 3) return "Moderate";
    return "Very busy";
  }

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemList)} />
      <Navbar />

      <section className="relative overflow-hidden pt-12 pb-10 sm:pt-14">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-30" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-1">·</span>
            <Link href="/vacations" className="hover:underline">Vacations</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">{label}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            Where to go in France in{" "}
            <span className="font-display italic gradient-text-anim">{label}</span>?
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            {angle.hook}
          </p>
          <div className="mt-4 rounded-xl border border-amber-300/40 bg-amber-50/40 px-4 py-3 text-sm text-[var(--text-primary)]">
            <span className="font-semibold text-amber-700">Keep in mind: </span>
            {angle.warning}
          </div>
        </div>
      </section>

      {/* Top 10 */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Top 10 destinations in {label}
        </h2>
        <div className="space-y-3">
          {top30.slice(0, 10).map(({ city, fit }, i) => {
            const sig = monthSignal(city, idx);
            return (
              <Card key={city.slug}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1 shrink-0">
                    <span className="text-2xl font-bold font-mono-data text-[var(--text-tertiary)]">
                      #{i + 1}
                    </span>
                    <span className="text-xl font-bold font-mono-data text-[var(--accent)]">
                      {fit.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                      <Link
                        href={`/cities/${city.slug}`}
                        className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {city.name}
                      </Link>
                      <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {city.department}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-snug mb-2">
                      {fit.whyOneLine}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <Thermometer className="h-3 w-3" />
                        {sig.tempAvg} °C
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <CloudRain className="h-3 w-3" />
                        {sig.rainDays} rain days
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <Sun className="h-3 w-3" />
                        {sig.sunHoursPerDay} h sun/day
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <Users className="h-3 w-3" />
                        {crowdLabel(sig.crowded)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                        {BUDGET_TIER_LABEL[fit.budgetTier]}
                      </span>
                    </div>
                    <div className="mt-3">
                      <BookingCTA cityName={city.name} locale="en" variant="compact" month={idx} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* By activity this month */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          By activity in {label}
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {topsByActivity.map(({ activity, list }) => {
            const def = ACTIVITY_DEFS[activity];
            return (
              <Card key={activity}>
                <div className="flex items-center gap-2 mb-3">
                  <span aria-hidden className="text-lg">{def.emoji}</span>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {EN_ACTIVITY_LABELS[activity] ?? def.label}
                  </h3>
                </div>
                {list.length === 0 ? (
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Not the season for this activity in {label}.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {list.map(({ city, fit }, i) => (
                      <li key={city.slug} className="text-sm">
                        <Link
                          href={`/cities/${city.slug}`}
                          className="flex items-baseline justify-between gap-2 hover:text-[var(--accent)] transition-colors"
                        >
                          <span className="text-[var(--text-primary)] min-w-0 truncate">
                            <span className="font-mono-data text-[var(--text-tertiary)] mr-1.5">
                              #{i + 1}
                            </span>
                            {city.name}
                          </span>
                          <span className="text-xs font-mono-data font-bold text-[var(--accent)] shrink-0">
                            {fit.score.toFixed(1)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Off the beaten track */}
      {calmPicks.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Away from the crowds in {label}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Low tourist-crowd destinations — for those who prefer the quiet.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {calmPicks.map(({ city, fit }) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {city.name}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {city.department} · score {fit.score.toFixed(1)}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Other months cross-links */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Other months
        </h2>
        <div className="flex flex-wrap gap-2">
          {EN_MONTHS_ORDER.map((enSlug) => {
            const m = EN_MONTH_TO_INDEX[enSlug];
            if (m === idx) return null;
            return (
              <Link
                key={enSlug}
                href={`/vacations/month/${enSlug}`}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                {EN_MONTH_LABELS[enSlug]}
              </Link>
            );
          })}
          <Link
            href="/vacations"
            className="rounded-full bg-[var(--accent)] text-white px-3 py-1 text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            ← Vacations hub
          </Link>
        </div>
      </section>

      {/* Methodology */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-14">
        <Card className="bg-[var(--bg-elevated)]/40">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            How this ranking is built
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Composite score = activity fit (~45%) + seasonal fit (~25%) + travel profile (~15%) +
            overall city quality (~15%). Monthly climate interpolated from Météo-France 1991–2020
            normals; tourist crowd estimated from city characteristics (size, coastal, ski resort,
            etc.) modulated by month.
            <br /><br />
            <strong>Known limits:</strong> climate interpolated to ±1.5 °C, no real-time price
            data, crowd levels qualitative (1–5).{" "}
            <Link href="/methodology" className="underline ml-1">Full methodology</Link>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Météo-France climate data</Badge>
            <Badge>{CITIES_COUNT} cities scored</Badge>
            <Badge>Auto-updated monthly</Badge>
          </div>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
