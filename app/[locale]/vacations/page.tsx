import type { Metadata } from "next";
import { CITIES_LIGHT } from "@/lib/cities-light";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_COUNT } from "@/lib/site-stats";
import {
  MONTHS,
  indexToMonthSlug,
  type MonthIndex,
} from "@/lib/vacation-seasons";
import { ACTIVITY_DEFS, ACTIVITIES } from "@/lib/vacation-activities";
import {
  topCitiesForMonth,
  VACATION_PROFILES,
  VACATION_PROFILE_DEFS,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { MapPin, ChevronRight, Calendar, Sparkles } from "lucide-react";

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Where to go on holiday in France 2026 · month-by-month guide",
  description: `Best time, best destination. Honest rankings of ${CITIES_COUNT} French cities for your holiday: beach, mountains, city breaks, wine regions. Real climate data + crowd levels + budget.`,
  alternates: { canonical: `${EN_BASE}/vacations` },
  openGraph: {
    title: "Holidays in France · where to go, when, for what",
    description: "Month by month, activity by activity. No magic top-10 lists, no agency filler.",
  },
};

// EN month label override map (FR slugs → EN labels)
const EN_MONTH_LABELS: Record<string, string> = {
  "janvier": "January",
  "février": "February",
  "mars": "March",
  "avril": "April",
  "mai": "May",
  "juin": "June",
  "juillet": "July",
  "août": "August",
  "septembre": "September",
  "octobre": "October",
  "novembre": "November",
  "décembre": "December",
};

// FR slug → EN URL slug
const FR_TO_EN_MONTH_SLUG: Record<string, string> = {
  "janvier": "january",
  "février": "february",
  "mars": "march",
  "avril": "april",
  "mai": "may",
  "juin": "june",
  "juillet": "july",
  "août": "august",
  "septembre": "september",
  "octobre": "october",
  "novembre": "november",
  "décembre": "december",
};

// EN activity labels (same slugs as FR)
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

// EN profile labels
const EN_PROFILE_LABELS: Record<string, string> = {
  famille: "Families",
  couple: "Couples",
  solo: "Solo",
  amis: "Groups of friends",
  seniors: "Seniors",
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: `${EN_BASE}/` },
  { name: "Vacations", path: `${EN_BASE}/vacations` },
]);

function getCurrentMonthIndex(): MonthIndex {
  const m = (new Date().getMonth() + 1) as MonthIndex;
  return m;
}

export default function VacationsHub() {
  const currentMonth = getCurrentMonthIndex();
  const topCurrent = topCitiesForMonth(currentMonth, CITIES_LIGHT, { limit: 6 });
  const currentFrSlug = indexToMonthSlug(currentMonth);
  const currentMonthLabel = EN_MONTH_LABELS[currentFrSlug] ?? currentFrSlug;
  const currentEnSlug = FR_TO_EN_MONTH_SLUG[currentFrSlug] ?? currentFrSlug;

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="relative overflow-hidden pt-14 pb-12 sm:pt-16 sm:pb-14">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-40" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">Vacations</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            Where to go on holiday{" "}
            <span className="font-display italic gradient-text-anim">in France</span>?
          </h1>
          <p className="text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            The right month, the right destination, the right budget. {CITIES_COUNT} French cities
            ranked on real climate data, tourist crowd levels and activity fit. No magic top-10,
            no agency listicles.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <Badge>Climate data 1991–2020</Badge>
            <Badge>Monthly crowd levels</Badge>
            <Badge>No paywall, no fluff</Badge>
          </div>
        </div>
      </section>

      {/* Top cities this month */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Best picks for {currentMonthLabel}
            </h2>
          </div>
          <Link
            href={`/vacations/month/${currentEnSlug}`}
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            Top 30 for this month →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topCurrent.map(({ city, fit }) => (
            <Link
              key={city.slug}
              href={`/cities/${city.slug}`}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {city.name}
                </h3>
                <span className="text-sm font-bold font-mono-data text-[var(--accent)] shrink-0">
                  {fit.score.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-snug">
                {fit.whyOneLine}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {city.department}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* By month */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Where to go in France by month
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-3xl">
          Each month has its own best destination-activity combination. Pick yours.
        </p>
        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {MONTHS.map((frSlug, idx) => {
            const month = (idx + 1) as MonthIndex;
            const label = EN_MONTH_LABELS[frSlug] ?? frSlug;
            const enSlug = FR_TO_EN_MONTH_SLUG[frSlug] ?? frSlug;
            const isCurrent = month === currentMonth;
            return (
              <Link
                key={frSlug}
                href={`/vacations/month/${enSlug}`}
                className={`group rounded-xl border px-4 py-3 transition-all hover:shadow-md ${
                  isCurrent
                    ? "border-[var(--accent)]/40 bg-[var(--accent)]/5"
                    : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* By activity */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-10">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          By activity
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-3xl">
          Ten classic holiday types. For each, the destinations that actually deliver — not
          the agency listicles.
        </p>
        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {ACTIVITIES.map((slug) => {
            const def = ACTIVITY_DEFS[slug];
            return (
              <Link
                key={slug}
                href={`/vacations/activity/${slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <span aria-hidden>{def.emoji}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {EN_ACTIVITY_LABELS[slug] ?? def.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* By travel profile */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-12">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          By travel group
        </h2>
        <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {VACATION_PROFILES.map((p) => {
            const def = VACATION_PROFILE_DEFS[p];
            return (
              <Link
                key={p}
                href={`/vacations/profile/${p}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <span aria-hidden>{def.emoji}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {EN_PROFILE_LABELS[p] ?? def.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Methodology note */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <Card className="bg-[var(--bg-elevated)]/50">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            How we rank these destinations
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Four signals per city per month: <strong>climate</strong> (temperature
            interpolated from 1991–2020 normals, rain days and sunshine by climate zone),
            <strong> tourist crowd level</strong> (summer peak everywhere, ski in winter,
            wine regions in mid-season), <strong>activity fit</strong> (beaches need heat,
            ski needs altitude), and <strong>travel profile</strong> (family, couple,
            solo, friends, seniors). The score combines these signals based on what you
            are looking for. See also our{" "}
            <Link href="/methodology" className="underline">full methodology</Link>.
          </p>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
