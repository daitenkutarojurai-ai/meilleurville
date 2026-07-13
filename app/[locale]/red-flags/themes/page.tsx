import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_SEED } from "@/data/cities-seed";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Red Flag Themes 2026 · 20 risks | BestCitiesInFrance",
  description: `20 thematic risk rankings built from open data (Géorisques, ATMO, SSMSI, BRGM, INJEP, INSEE, Bison Futé, DEPS-MC) across ${CITIES_SEED.length} French cities. Which cities swelter in summer, gridlock at rush hour, face water stress or drain your budget fastest?`,
  alternates: { canonical: `${EN_BASE}/red-flags/themes` },
};

const THEMES = [
  { enSlug: "buyers-remorse",             emoji: "💸", title: "Cities you'll regret buying in",                        desc: "Price-to-value mismatch: high €/m², mediocre quality of life." },
  { enSlug: "car-dependent",              emoji: "🚗", title: "Where car-free living is genuinely hard",               desc: "No tram, sparse rail, structural car dependency despite the promises." },
  { enSlug: "beautiful-brutal-summers",   emoji: "🥵", title: "Beautiful cities… unbearable in summer",               desc: "Great on paper, stifling in July: 38 °C + mass tourism." },
  { enSlug: "chronic-air-pollution",      emoji: "🌫️", title: "Cities with chronically bad winter air",               desc: "PM2.5 peaks every November–March. Fine in summer, toxic in winter." },
  { enSlug: "natural-hazards",            emoji: "⚠️", title: "Most exposed to natural hazards",                      desc: "Floods, earthquakes, industrial risk — Géorisques data." },
  { enSlug: "noise-nightmare",            emoji: "🔊", title: "Where noise is a daily nightmare",                     desc: "Flight paths, motorways, rail lines, and nightlife all stacked." },
  { enSlug: "water-stress",               emoji: "💧", title: "Facing water shortages every summer",                  desc: "Restrictions from July. The aquifer problem nobody mentions at viewings." },
  { enSlug: "medical-desert",             emoji: "🩺", title: "Critical healthcare access problems",                  desc: "18-month GP waits, no specialist within 30 km." },
  { enSlug: "chronic-unemployment",       emoji: "📉", title: "Chronically weak job markets",                        desc: "Jobless rate hasn't dipped below 12% since 2010." },
  { enSlug: "quality-of-life-stretched",  emoji: "😓", title: "Quality of life stretched across every dimension",     desc: "No single catastrophe — everything just mediocre, simultaneously." },
  { enSlug: "cost-explosion",             emoji: "💥", title: "Where living costs exceed the local salary",           desc: "Rents have outpaced wages. The maths no longer works." },
  { enSlug: "public-services-desert",     emoji: "🏛️", title: "Cities in a public services desert",                  desc: "School closures, post-office gone, court 80 km away." },
  { enSlug: "anti-cycling",               emoji: "🚲", title: "Where daily cycling is out of reach",                  desc: "Bad infrastructure, steep hills, or plain hostility." },
  { enSlug: "sports-poor-cities",         emoji: "🏟️", title: "Where regular sport is a logistical struggle",         desc: "Thin facilities, fragile clubs, no nearby outdoor playground." },
  { enSlug: "critical-ageing",            emoji: "🕰️", title: "In critical demographic decline",                     desc: "Negative net migration + ageing population = shrinking services." },
  { enSlug: "tense-nights",              emoji: "🌙", title: "Tense night safety in party districts",                desc: "Not everywhere — specific neighbourhoods around bars and clubs." },
  { enSlug: "harsh-winters",              emoji: "❄️", title: "Cities with the harshest winters",                    desc: "Long grey cold spells, regular frost, 80+ frost days per year." },
  { enSlug: "daily-traffic-jams",         emoji: "🚥", title: "Cities gridlocked every rush hour",                  desc: "A86, A7, A8, Grenoble basin — commuters lose 300 hours a year." },
  { enSlug: "young-workers-leaving",      emoji: "🎒", title: "Cities that 25-35s are quietly leaving",              desc: "Structural young-worker deficit, negative balance, weak business flows." },
  { enSlug: "cultural-desert",            emoji: "🎭", title: "Cities where the cultural offer stays thin",         desc: "No labelled venue, arthouse cinemas rare, library stretched." },
] as const;

export default function EnRedFlagThemesPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-gradient-to-b from-red-950/20 to-[var(--bg-canvas)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            Thematic risk rankings
          </div>
          <h1 className="mb-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            20 risk patterns — which cities have them?
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)] text-lg">
            Open-data cross-references (Géorisques, ATMO, SSMSI, BRGM, DVF) across{" "}
            {CITIES_SEED.length} French cities. Each theme ranks cities by how severely they exhibit
            that specific pattern — so you know before you visit.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {THEMES.map(({ enSlug, emoji, title, desc }) => (
            <Link
              key={enSlug}
              href={`/red-flags/themes/${enSlug}`}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 hover:border-red-500/40 hover:shadow-md transition-all flex flex-col gap-3"
            >
              <div className="text-3xl">{emoji}</div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-red-500 transition-colors leading-snug">
                {title}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed flex-1">{desc}</p>
              <span className="text-xs font-medium text-red-500 group-hover:underline">
                See the ranking →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Looking for a specific city?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            Every city has its own per-flag report across 9 risk categories.
          </p>
          <Link
            href="/red-flags"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            <AlertTriangle className="h-4 w-4" />
            Browse city reports
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
