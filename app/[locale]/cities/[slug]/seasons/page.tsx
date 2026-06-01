import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { seasonalStats, type SeasonStats } from "@/lib/seasons";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Living in ${city.name} season by season · Climate & tourism 2026`,
    description: `What's ${city.name} like in spring, summer, autumn, winter? Temperatures, sunshine hours, rainy days and tourist crowd levels — four seasons, four realities.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/seasons` },
    openGraph: {
      title: `${city.name} — season by season`,
      description: `Climate and tourism pressure across the four seasons. What to expect month by month.`,
    },
  };
}

const SEASON_EMOJI: Record<SeasonStats["season"], string> = {
  printemps: "🌷",
  ete: "☀️",
  automne: "🍂",
  hiver: "❄️",
};

const EN_SEASON_LABEL: Record<SeasonStats["season"], { label: string; months: string }> = {
  printemps: { label: "Spring", months: "Mar–May" },
  ete: { label: "Summer", months: "Jun–Aug" },
  automne: { label: "Autumn", months: "Sep–Nov" },
  hiver: { label: "Winter", months: "Dec–Feb" },
};

const EN_TOURISM_BADGE: Record<SeasonStats["tourismLoad"], { label: string; tone: string }> = {
  calme: { label: "Quiet", tone: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  moyen: { label: "Moderate", tone: "bg-lime-100 text-lime-700 border-lime-300" },
  haut: { label: "Busy", tone: "bg-amber-100 text-amber-700 border-amber-300" },
  saturation: { label: "Peak", tone: "bg-red-100 text-red-700 border-red-300" },
};

const EN_TOURISM_EXPLANATION: Record<SeasonStats["tourismLoad"], Record<SeasonStats["season"], string>> = {
  calme: {
    printemps: "Low crowds — a good time to visit and secure housing without pressure.",
    ete: "Quieter than the coast in summer — comfortable pace, no price surges.",
    automne: "Back to local life after summer. Short-term rental prices are relaxed.",
    hiver: "Off-season. Ideal for visiting unhurried; most tourist amenities open.",
  },
  moyen: {
    printemps: "Some visitors on public holidays, but the city remains accessible.",
    ete: "Summer activity visible, especially on weekends, without reaching saturation.",
    automne: "Tourism easing after summer — pleasant balance of activity.",
    hiver: "Moderate footfall; some seasonal closures in quieter areas.",
  },
  haut: {
    printemps: "Tourist activity picking up — historic centres and markets get busy.",
    ete: "High summer footfall — expect queues at key sites, peak pricing on short-term lets.",
    automne: "Popular for autumn getaways; accommodation fills on weekends.",
    hiver: "High-season ski activity — accommodation prices spike on weekends.",
  },
  saturation: {
    printemps: "Early-season crowds building — book well in advance.",
    ete: "Peak tourist season: accommodation up 30–60 %, restaurants require reservations.",
    automne: "Still busy post-summer — popular festivals and harvest tourism.",
    hiver: "Peak ski season: short-term rents can double over weekends; road access can be slow.",
  },
};

function enSignature(s: SeasonStats, cityName: string): string {
  switch (s.season) {
    case "printemps":
      return `In ${cityName}, spring brings milder temperatures and reopened terraces. Average high around ${s.avgTempHigh} °C.`;
    case "ete":
      if (s.avgTemp >= 25) {
        return `${cityName} summers regularly exceed 30 °C in the afternoon — air conditioning and shutters are standard.`;
      }
      return `${cityName} has a relatively mild summer (July avg ${s.avgTemp} °C) — pleasant for outdoor life.`;
    case "automne":
      return `Autumn in ${cityName} is local life at its most relaxed — cooling temperatures, looser rental market, terraces still open in September–October.`;
    case "hiver":
      if (s.avgTemp <= 3) {
        return `${cityName} winters are genuinely cold (January avg ${s.avgTemp} °C) — budget for heating.`;
      }
      return `${cityName} winters are mild by French standards (January avg ${s.avgTemp} °C) — one of its underrated advantages.`;
  }
}

export default async function EnCitySeasonsPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const seasons = seasonalStats(city);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${slug}` },
    { name: "Seasons", path: `/cities/${slug}/seasons` },
  ]);
  const faq = faqJsonLd([
    {
      q: `What is the best time of year to visit ${city.name}?`,
      a: `Spring (Mar–May) and autumn (Sep–Oct) typically offer the best balance of mild temperatures and lower tourist pressure in ${city.name}. Summer is warmest but busiest; winter is off-peak and good for finding accommodation.`,
    },
    {
      q: `What are summers like in ${city.name}?`,
      a: `In ${city.name}, July averages around ${city.avgTempJuly ?? 22} °C${(city.avgTempJuly ?? 22) >= 27 ? ", with afternoon highs regularly above 30 °C" : ""}. Tourist pressure is ${EN_TOURISM_BADGE[seasons.find(s => s.season === "ete")!.tourismLoad].label.toLowerCase()} in summer.`,
    },
    {
      q: `How cold are winters in ${city.name}?`,
      a: `January in ${city.name} averages around ${city.avgTempJanuary ?? 5} °C. ${(city.avgTempJanuary ?? 5) <= 3 ? "Expect frost and possible snow." : "Mild by French standards — snow is rare."}`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href={`/cities/${slug}`} className="hover:underline">
              ← {city.name}
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Living in {city.name} — season by season
          </h1>
          <p className="text-[var(--text-secondary)]">
            Four seasons, four atmospheres: temperatures, sunshine hours, tourist pressure
            and what actually happens each quarter.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
        {seasons.map((s) => {
          const enSeason = EN_SEASON_LABEL[s.season];
          const badge = EN_TOURISM_BADGE[s.tourismLoad];
          const explanation = EN_TOURISM_EXPLANATION[s.tourismLoad][s.season];
          return (
            <Card key={s.season}>
              <div className="flex flex-wrap items-baseline gap-3 mb-4">
                <span className="text-3xl" aria-hidden>
                  {SEASON_EMOJI[s.season]}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{enSeason.label}</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">{enSeason.months}</p>
                </div>
                <span
                  className={`ml-auto inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.tone}`}
                >
                  Crowds: {badge.label}
                </span>
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                {enSignature(s, city.name)}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Avg temp</p>
                  <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">{s.avgTemp} °C</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Daytime high</p>
                  <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">{s.avgTempHigh} °C</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Sun / day</p>
                  <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">{s.sunshineHoursPerDay} h</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-elevated)] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Rainy days/mo</p>
                  <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">{s.rainyDaysPerMonth} d</p>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] p-3">
                <p className="text-xs text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Tourist pressure — {badge.label}:</strong>{" "}
                  {explanation}
                </p>
              </div>
            </Card>
          );
        })}

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Methodology</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Average temperatures: Météo-France climatology 1991–2020 (July / January from the seed
            data; spring and autumn estimated by interpolation). Sunshine hours derived from annual
            totals with seasonal weighting. Rainy days adjusted by regional context (Atlantic coast,
            Mediterranean, mountains). Tourist pressure is a deterministic estimate based on city
            character tags, region, and season — not scraped from real-time booking platforms.
          </p>
        </Card>

        <DiscussionCTA
          cityName={city.name}
          citySlug={city.slug}
          locale="en"
        />
      </div>

      <Footer />
    </main>
  );
}
