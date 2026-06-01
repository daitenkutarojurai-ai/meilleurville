import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ChevronRight, MapPin, TreePine, Utensils, Music, Bike, Camera, Coffee, Sunset } from "lucide-react";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

type CityRecord = (typeof CITIES_SEED)[number];

interface ActivityCategory {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
}

function buildActivityCategories(city: CityRecord): ActivityCategory[] {
  const { scores, characterTags } = city;
  const tags = new Set(characterTags);

  return [
    {
      icon: <TreePine className="h-5 w-5" />,
      label: "Nature & outdoors",
      description: scores.nature >= 7
        ? `Outstanding nature score (${scores.nature.toFixed(1)}/10). Hiking, parks and green space within immediate reach.`
        : scores.nature >= 5.5
        ? `Decent access to the outdoors (${scores.nature.toFixed(1)}/10). Urban parks and weekend escapes are doable.`
        : `Limited nature nearby (${scores.nature.toFixed(1)}/10). Plan to head out of town for the real thing.`,
      enabled: scores.nature >= 5.0,
    },
    {
      icon: <Utensils className="h-5 w-5" />,
      label: "Food & markets",
      description: tags.has("gastronomie") || scores.culture >= 6.5
        ? `A city known for its food. Markets, quality restaurants and local produce are well represented.`
        : `A solid dining scene with a few local addresses worth tracking down.`,
      enabled: true,
    },
    {
      icon: <Music className="h-5 w-5" />,
      label: "Culture & shows",
      description: scores.culture >= 7
        ? `High culture score (${scores.culture.toFixed(1)}/10). Museums, theatres, concerts, festivals — a dense programme.`
        : scores.culture >= 5.5
        ? `An active cultural life (${scores.culture.toFixed(1)}/10). A handful of landmark venues and regular events.`
        : `Culture concentrated around a few key venues (${scores.culture.toFixed(1)}/10).`,
      enabled: scores.culture >= 5.0,
    },
    {
      icon: <Bike className="h-5 w-5" />,
      label: "Cycling & soft mobility",
      description: scores.transport >= 7 || tags.has("vélo")
        ? `Well set up for getting around by bike. Cycle lanes, greenways and friendly terrain.`
        : scores.transport >= 5.5
        ? `A cycling network still under development. Some signposted routes are accessible.`
        : `Soft mobility is limited — a car is still needed for most trips.`,
      enabled: scores.transport >= 5.5 || tags.has("vélo"),
    },
    {
      icon: <Camera className="h-5 w-5" />,
      label: "Heritage & architecture",
      description: tags.has("patrimoine") || tags.has("historique") || scores.culture >= 6.5
        ? `Remarkable architectural heritage. Historic monuments, old quarters and cultural walks.`
        : `A few architectural landmarks to discover in the centre.`,
      enabled: tags.has("patrimoine") || tags.has("historique") || scores.culture >= 6.0,
    },
    {
      icon: <Coffee className="h-5 w-5" />,
      label: "Neighbourhood life & terraces",
      description: tags.has("étudiant") || tags.has("bobo") || tags.has("dynamique")
        ? `Lively neighbourhood life. Terraces, bars and independent cafés — daily life happens outside.`
        : `A few busy shopping streets with terraces open in season.`,
      enabled: tags.has("étudiant") || tags.has("bobo") || tags.has("dynamique") || scores.culture >= 5.5,
    },
    {
      icon: <Sunset className="h-5 w-5" />,
      label: "Relaxation & wellbeing",
      description: scores.life >= 7
        ? `Outstanding quality of life (${scores.life.toFixed(1)}/10). An unhurried pace and a developed wellbeing offer.`
        : `Decent quality of life for downtime activities (${scores.life.toFixed(1)}/10).`,
      enabled: scores.life >= 5.5,
    },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Things to do in ${city.name} (2026) — activities, days out and local tips`,
    description: `What to do in ${city.name}: nature, food, culture, heritage, neighbourhood life and weekend outings. A data-led read of what the city actually offers.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/things-to-do` },
    openGraph: {
      title: `Things to do in ${city.name}`,
      description: `Activities, days out and local tips — what ${city.name} actually offers.`,
    },
  };
}

export default async function EnThingsToDoPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const activities = buildActivityCategories(city);
  const enabledActivities = activities.filter((a) => a.enabled);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${slug}` },
    { name: `Things to do in ${city.name}`, path: `/cities/${slug}/things-to-do` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />
      <AmbientBackground />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{city.name}</Link>
          {" · "}
          <span className="text-[var(--text-primary)]">Things to do</span>
        </nav>

        <div className="flex items-start gap-3 mb-6">
          <div className="mt-1">
            <MapPin className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] leading-tight">
              Things to do in {city.name}
            </h1>
            <p className="mt-2 text-[var(--text-secondary)] max-w-2xl">
              Activities, days out and local tips in {city.name} — nature, food, culture and
              neighbourhood life. What actually earns the trip.
            </p>
          </div>
        </div>

        {/* Activity categories grid */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            What {city.name} offers
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {enabledActivities.map((activity) => (
              <div
                key={activity.label}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[var(--accent)]">{activity.icon}</span>
                  <span className="font-semibold text-sm text-[var(--text-primary)]">{activity.label}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {activity.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Score snapshot */}
        <div className="mb-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">
            {city.name} at a glance
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Culture & leisure", value: city.scores.culture },
              { label: "Nature", value: city.scores.nature },
              { label: "Quality of life", value: city.scores.life },
              { label: "Transport", value: city.scores.transport },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-[var(--accent)]">{value.toFixed(1)}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--text-tertiary)]">
            Scores out of 10 · <Link href="/methodology" className="underline hover:text-[var(--accent)]">See the methodology</Link>
          </p>
        </div>

        {/* Character tags */}
        {city.characterTags.length > 0 && (
          <div className="mb-10">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">
              {city.name} in a few words
            </h2>
            <div className="flex flex-wrap gap-2">
              {city.characterTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-sm border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Go deeper */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Go deeper</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/cities/${slug}/sports-leisure`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-colors px-5 py-4 group"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">🏋️ Sport & leisure</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Facilities · outdoor · clubs · climate</div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
            </Link>
            <Link
              href={`/cities/${slug}/seasons`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-colors px-5 py-4 group"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">🗓️ Seasons</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Best time of year to visit and settle</div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
            </Link>
            <Link
              href={`/cities/${slug}/neighbourhoods`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-colors px-5 py-4 group"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">🏘️ Neighbourhoods</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Where to base yourself, area by area</div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
            </Link>
            <Link
              href="/guides"
              className="flex items-center justify-between rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10 transition-colors px-5 py-4 group"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--accent)]">📚 All guides</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Long-form reads on moving to France</div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--accent)] transition-colors shrink-0" />
            </Link>
          </div>
        </div>

        {/* Back to city */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Link
            href={`/cities/${slug}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-colors px-5 py-3 text-sm font-medium text-[var(--text-primary)]"
          >
            ← Back to {city.name}
          </Link>
          <Link
            href="/rankings"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10 transition-colors px-5 py-3 text-sm font-medium text-[var(--accent)]"
          >
            All rankings →
          </Link>
        </div>

        <DiscussionCTA cityName={city.name} citySlug={slug} locale="en" />
      </section>

      <Footer />
    </main>
  );
}
