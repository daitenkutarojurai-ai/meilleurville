import type { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { cityAlternatesEn } from "@/lib/i18n";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAgenda } from "@/lib/city-agenda";
import { upcomingCityEvents, cityEventsJsonLd } from "@/lib/city-events";
import { CityEvents } from "@/components/CityEvents";
import { ReportCTA } from "@/components/ReportCTA";

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
    // Pas de suffixe de marque : cf. `/cities/[slug]/questions`. Les 540
    // titres passaient de 61-85 caractères à 39-61 en le retirant, et la
    // jumelle FR `/villes/[slug]/agenda` n'en porte pas.
    title: `Annual calendar of events in ${city.name} 2026`,
    description: `What to do in ${city.name} month by month: festivals, markets, national and regional events, best seasons to visit. Indicative 2026 calendar.`,
    alternates: cityAlternatesEn("calendar", slug),
  };
}

// Familles indigo / rose / cyan / ciel uniquement : vert, ambre et violet sont
// réservés aux paliers de score (identité « Couleurs »).
const CATEGORY_COLOR: Record<string, string> = {
  national: "bg-[var(--band-indigo)] text-[#4338CA]",
  regional: "bg-[var(--band-pink)] text-[#BE185D]",
  saisonnier: "bg-[var(--band-aqua)] text-[#0E7490]",
  local: "bg-[var(--band-sky)] text-[#0369A1]",
};

// Tuiles de mois en rotation (extrémités ≥ 4,5:1 sur texte blanc).
const MONTH_TILES = ["grad-head-0", "grad-head-5", "grad-head-4"] as const;
const CATEGORY_LABEL: Record<string, string> = {
  national: "National",
  regional: "Regional",
  saisonnier: "Seasonal",
  local: "Local",
};

export default async function EnCalendarPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const agenda = cityAgenda(city);
  const events = upcomingCityEvents(city.slug);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${city.slug}` },
    { name: "Calendar", path: `/cities/${city.slug}/calendar` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      {events.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(cityEventsJsonLd(events, city.name, "en"))}
        />
      )}
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />
        <section className="relative overflow-hidden bg-aurora py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="grad-head-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-[0_10px_24px_-10px_rgba(79,70,229,0.7)]">
                <CalendarDays className="h-7 w-7" aria-hidden />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight gradient-text">
                  Annual calendar — {city.name}
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Indicative 2026 calendar. Always confirm exact dates with the town hall or local tourist office.
                </p>
              </div>
            </div>
            <ReportCTA variant="inline" locale="en" className="mt-5" kinds={["evenement"]} cityName={city.name} />
          </div>
        </section>

        {/* « À venir » (datés, sourcés) en bande ciel */}
        <section className="band band-sky py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <CityEvents events={events} cityName={city.name} locale="en" />
          </div>
        </section>

        {/* Mois par mois (indicatif) en bande indigo */}
        <section className="band band-indigo py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-4 text-2xl font-bold tracking-tight gradient-text">
              Through the year
            </h2>
            <ol className="space-y-4">
              {agenda.map((item, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <div className={`${MONTH_TILES[i % MONTH_TILES.length]} shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide`}>
                      {item.monthLabelEn}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLOR[item.category]}`}
                    >
                      {CATEGORY_LABEL[item.category]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {item.titleEn}
                  </h3>
                  <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
                    {item.bodyEn}
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                    Source: {item.source}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Méthode, renvois et discussion en bande blanche */}
        <section className="band band-white py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              This calendar mixes confirmed national events (Bastille Day, Heritage Days), structural regional events (Cannes, Avignon, Lorient, Alsatian Christmas markets) and seasonal indicators derived from the city's average climate. No exact date is guaranteed without checking with organisers.
            </p>

            <div className="mt-8">
              <Link
                href={`/cities/${city.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--band-indigo)] px-4 py-2 text-sm font-semibold text-[#4338CA] transition-colors hover:bg-[#DCD7FF]"
              >
                <ArrowLeft className="h-4 w-4" /> Back to {city.name}
              </Link>
            </div>

            <div className="mt-8">
              <FeedbackWidget />
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
