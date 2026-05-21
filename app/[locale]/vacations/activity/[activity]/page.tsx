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
  type MonthIndex,
} from "@/lib/vacation-seasons";
import {
  ACTIVITIES,
  ACTIVITY_DEFS,
  type ActivitySlug,
} from "@/lib/vacation-activities";
import {
  topCitiesForActivity,
  BUDGET_TIER_LABEL,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { MapPin, Calendar } from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; activity: string }> };

export function generateStaticParams() {
  return ACTIVITIES.map((slug) => ({ locale: "en", activity: slug }));
}

// EN overrides for activity labels, intros and meta
const EN_ACTIVITY_DEFS: Record<ActivitySlug, { label: string; intro: string; metaDesc: string }> = {
  plage: {
    label: "Beach & relaxation",
    intro: "Fine sand, water above 22 °C, preserved coves or large family beaches. We rank on actual coastline quality and seasonal weather — not on marketing.",
    metaDesc: "Best beach destinations in France 2026: Mediterranean, Atlantic, Brittany, Channel coast. Warm water, sand, hidden coves.",
  },
  montagne: {
    label: "Hiking & mountains",
    intro: "Marked trails, high-altitude lakes, perched villages. France has unique mountain density in Europe — here is where to go based on what you are after.",
    metaDesc: "Hiking holidays in France 2026: Alps, Pyrenees, Massif Central, Jura, Vosges. High lakes, GR trails, refuges, perched villages.",
  },
  ski: {
    label: "Skiing & winter sports",
    intro: "Well-known resorts, under-the-radar gems, and base-camp towns to ski without paying Courchevel rates.",
    metaDesc: "Best ski resorts in France 2026: Alps, Pyrenees, Jura, Vosges. Snow cover, accessibility, atmosphere.",
  },
  citytrip: {
    label: "City break & culture",
    intro: "Three days, one train and a backpack. We rank on real cultural depth (museums, live scene, heritage) more than postcard appeal.",
    metaDesc: "Best cities for a city break in France 2026: museums, gastronomy, nightlife, heritage, affordable prices.",
  },
  vignobles: {
    label: "Wine & vineyards",
    intro: "Wine routes, châteaux open for tastings, Michelin-starred restaurants. For those who consider wine and holiday to be the same word.",
    metaDesc: "Wine tourism holidays in France 2026: Bordeaux, Burgundy, Champagne, Rhône, Alsace. Wine routes, châteaux, tastings.",
  },
  surf: {
    label: "Surfing & watersports",
    intro: "Open Atlantic, consistent waves, surf schools everywhere. North Brittany for the brave, the Basque coast for surf culture.",
    metaDesc: "Surf spots in France 2026: Basque coast, Landes, Brittany. Beginners and experienced surfers, waves, schools, atmosphere.",
  },
  thermal: {
    label: "Thermal spas & wellness",
    intro: "Certified cures, high-end spas, hot springs open to the public. For spending a week switching off completely.",
    metaDesc: "Thermal spa towns in France 2026: Vichy, Évian, Aix, Dax. Cures, spas, hot springs, wellness.",
  },
  "road-trip": {
    label: "Road trip",
    intro: "A car, two weeks and a map. We identify the ideal bases for exploring — not single-destination towns.",
    metaDesc: "Road trip ideas in France 2026: Côte d'Azur, Brittany, Alsace, Causses, Pyrenees. Tested itineraries, stops, duration.",
  },
  gastro: {
    label: "Gastronomy",
    intro: "Lyon, Marseille, Bordeaux, Bayonne, Strasbourg — France has six serious gastronomic capitals, each with its own profile.",
    metaDesc: "Gastronomic holidays in France 2026: Lyon, Bordeaux, Strasbourg, Nice. Michelin stars, covered markets, food culture.",
  },
  famille: {
    label: "Family holidays",
    intro: "Safety, activities for children, restaurants that do not collapse when faced with a kids menu. We filter hard on these three criteria.",
    metaDesc: "Family holidays in France 2026: destinations with kids — beach, parks, activities, safety, manageable budget.",
  },
};

// EN month abbreviations
const EN_MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function enMonthLabel(m: MonthIndex): string {
  return EN_MONTHS_SHORT[m - 1];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { activity } = await params;
  if (!ACTIVITIES.includes(activity as ActivitySlug)) return {};
  const enDef = EN_ACTIVITY_DEFS[activity as ActivitySlug];
  return {
    title: `${enDef.label} holidays in France 2026 · top destinations`,
    description: enDef.metaDesc,
    alternates: { canonical: `${EN_BASE}/vacations/activity/${activity}` },
    openGraph: {
      title: `${enDef.label} holidays in France`,
      description: enDef.intro,
    },
  };
}

export default async function ActivityPage({ params }: Props) {
  const { activity } = await params;
  if (!ACTIVITIES.includes(activity as ActivitySlug)) notFound();
  const slug = activity as ActivitySlug;
  const def = ACTIVITY_DEFS[slug];
  const enDef = EN_ACTIVITY_DEFS[slug];

  const top30 = topCitiesForActivity(slug, { limit: 30 });

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: `${EN_BASE}/` },
    { name: "Vacations", path: `${EN_BASE}/vacations` },
    { name: enDef.label, path: `${EN_BASE}/vacations/activity/${slug}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best ${enDef.label.toLowerCase()} destinations in France`,
    itemListElement: top30.slice(0, 10).map(({ city }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${EN_BASE}/cities/${city.slug}`,
      name: city.name,
    })),
  };

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
            <span className="text-[var(--text-secondary)]">{enDef.label}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3 flex items-center gap-3 flex-wrap">
            <span aria-hidden>{def.emoji}</span>
            <span>
              <span className="font-display italic gradient-text-anim">{enDef.label}</span>{" "}
              holidays in France
            </span>
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            {enDef.intro}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge>
              <Calendar className="inline h-3 w-3 mr-1" />
              Best months: {def.bestMonths.map((m) => enMonthLabel(m as MonthIndex)).join(" · ")}
            </Badge>
            <Badge>{top30.length} destinations ranked</Badge>
          </div>
        </div>
      </section>

      {/* Top 15 */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Top 15 {enDef.label.toLowerCase()} destinations
        </h2>
        <div className="space-y-3">
          {top30.slice(0, 15).map(({ city, fit }, i) => (
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                      Activity fit: {fit.activityScore.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                      {BUDGET_TIER_LABEL[fit.budgetTier]}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                      Best months: {fit.bestMonths.map((m) => enMonthLabel(m)).join(", ")}
                    </span>
                  </div>
                  <div className="mt-3">
                    <BookingCTA cityName={city.name} variant="compact" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Remaining */}
      {top30.length > 15 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Also worth considering
          </h2>
          <div className="flex flex-wrap gap-2">
            {top30.slice(15).map(({ city, fit }, i) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="font-mono-data text-[var(--text-tertiary)]">#{16 + i}</span>
                <span>{city.name}</span>
                <span className="font-mono-data font-bold text-[var(--accent)]">{fit.score.toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Other activities */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Other activities
        </h2>
        <div className="flex flex-wrap gap-2">
          {ACTIVITIES.filter((a) => a !== slug).map((a) => {
            const otherDef = ACTIVITY_DEFS[a];
            const otherEnDef = EN_ACTIVITY_DEFS[a];
            return (
              <Link
                key={a}
                href={`/vacations/activity/${a}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                <span aria-hidden>{otherDef.emoji}</span>
                {otherEnDef.label}
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
            For {enDef.label.toLowerCase()}, each city is scored on its fit for the
            activity (detection via geographic characteristics, tags and scores), then
            weighted by overall city quality and travel profile. Destinations that do
            not fit the activity are excluded rather than placed at the bottom — it
            makes no sense to rank an inland town for the beach.
            <br /><br />
            <strong>Coverage:</strong> {CITIES_COUNT} cities evaluated,{" "}
            {top30.length} relevant for {enDef.label.toLowerCase()}.
          </p>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
