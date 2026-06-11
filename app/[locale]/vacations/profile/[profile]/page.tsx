import type { Metadata } from "next";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookingCTA } from "@/components/BookingCTA";
import { CITIES_COUNT } from "@/lib/site-stats";
import {
  topCitiesForProfile,
  BUDGET_TIER_LABEL,
  VACATION_PROFILES,
  VACATION_PROFILE_DEFS,
  type VacationProfile,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { MapPin } from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; profile: string }> };

export function generateStaticParams() {
  return VACATION_PROFILES.map((slug) => ({ locale: "en", profile: slug }));
}

// EN overrides for profile labels, intros and meta
const EN_PROFILE_DEFS: Record<VacationProfile, { label: string; intro: string; metaDesc: string }> = {
  famille: {
    label: "Families",
    intro: "Day-to-day safety, activities to keep children occupied, restaurants that actually work with kids. The destinations ranked here deliver all three — no agency top-10.",
    metaDesc: "Family holidays in France 2026: safe destinations, easy with children, manageable budget. Beach, parks, activities.",
  },
  couple: {
    label: "Couples",
    intro: "Restaurants, cultural scene, walks for two. The towns that lend themselves to a romantic long weekend without falling into clichés.",
    metaDesc: "Couple holidays in France 2026: romantic destinations, gastronomy, cultural atmosphere. Away from tourist traps.",
  },
  solo: {
    label: "Solo travellers",
    intro: "Safety (women travelling alone included), good transport options, enough cultural life to stay entertained. The cities where travelling alone is genuinely comfortable.",
    metaDesc: "Solo travel in France 2026: safe destinations, dense cultural scene, accessible by train.",
  },
  amis: {
    label: "Groups of friends",
    intro: "Bars, restaurants, nightlife, shared budget. The destinations that handle a group of 4–8 without breaking the bank.",
    metaDesc: "Group holidays in France 2026: destinations with nightlife, restaurants, manageable budget. Coast, mountains, city breaks.",
  },
  seniors: {
    label: "Seniors",
    intro: "Mild climate, accessibility, calm, healthcare nearby. No \"senior\" marketing — just the cities where day-to-day life feels genuinely relaxed.",
    metaDesc: "Senior holidays in France 2026: calm destinations, mild climate, accessibility, health infrastructure.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profile } = await params;
  if (!VACATION_PROFILES.includes(profile as VacationProfile)) return {};
  const enDef = EN_PROFILE_DEFS[profile as VacationProfile];
  return {
    title: `${enDef.label} holidays in France 2026 · top destinations`,
    description: enDef.metaDesc,
    alternates: { canonical: `${EN_BASE}/vacations/profile/${profile}` },
    openGraph: {
      title: `${enDef.label} holidays in France`,
      description: enDef.intro,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { profile } = await params;
  if (!VACATION_PROFILES.includes(profile as VacationProfile)) notFound();
  const slug = profile as VacationProfile;
  const def = VACATION_PROFILE_DEFS[slug];
  const enDef = EN_PROFILE_DEFS[slug];

  const top20 = topCitiesForProfile(slug, CITIES_LIGHT, { limit: 20 });

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: `${EN_BASE}/` },
    { name: "Vacations", path: `${EN_BASE}/vacations` },
    { name: enDef.label, path: `${EN_BASE}/vacations/profile/${slug}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best holiday destinations in France for ${enDef.label.toLowerCase()}`,
    itemListElement: top20.slice(0, 10).map(({ city }, i) => ({
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
            <Badge>{top20.length} destinations ranked</Badge>
            <Badge>Safety · quality of life · profile fit</Badge>
          </div>
        </div>
      </section>

      {/* Top 10 */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Top 10 destinations for {enDef.label.toLowerCase()}
        </h2>
        <div className="space-y-3">
          {top20.slice(0, 10).map(({ city, fit }, i) => (
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
                    <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                      {enDef.label} fit: {fit.profileScore.toFixed(1)}/10
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                      {BUDGET_TIER_LABEL[fit.budgetTier]}
                    </span>
                  </div>
                  <div className="mt-3">
                    <BookingCTA cityName={city.name} locale="en" variant="compact" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Remaining */}
      {top20.length > 10 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Also worth considering
          </h2>
          <div className="flex flex-wrap gap-2">
            {top20.slice(10).map(({ city, fit }, i) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                <span className="font-mono-data text-[var(--text-tertiary)]">#{11 + i}</span>
                <span>{city.name}</span>
                <span className="font-mono-data font-bold text-[var(--accent)]">{fit.score.toFixed(1)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Other profiles */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Other travel groups
        </h2>
        <div className="flex flex-wrap gap-2">
          {VACATION_PROFILES.filter((p) => p !== slug).map((p) => {
            const otherDef = VACATION_PROFILE_DEFS[p];
            const otherEnDef = EN_PROFILE_DEFS[p];
            return (
              <Link
                key={p}
                href={`/vacations/profile/${p}`}
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
            The <strong>{enDef.label.toLowerCase()}</strong> profile re-weights the
            existing site scores (safety, quality of life, culture, transport, cost,
            nature) according to what actually matters for this type of trip. Population
            filter: 8,000+ inhabitants — smaller places show up in the city or activity
            pages instead.
            <br /><br />
            <strong>Coverage:</strong> {CITIES_COUNT} cities evaluated.
          </p>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
