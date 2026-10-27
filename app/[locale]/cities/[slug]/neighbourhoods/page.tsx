import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { mapsPlaceUrl } from "@/lib/maps-link";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { CityPhotoBand } from "@/components/CityPhoto";
import { cityPhoto } from "@/lib/city-images";
import { Footer } from "@/components/Footer";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { getNeighborhoods, type Neighborhood } from "@/data/neighborhoods";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternatesEn } from "@/lib/i18n";

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
  const hoods = getNeighborhoods(slug);
  return {
    title: `Neighbourhoods of ${city.name} · Which district to choose? 2026`,
    description: `Compare ${hoods.length || "all"} neighbourhoods in ${city.name}: safety, rents, transport, and atmosphere. Find the district that matches your lifestyle.`,
    alternates: cityAlternatesEn("neighbourhoods", slug),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `${city.name} — neighbourhoods compared`,
      description: `Safety, rents, transport and vibe for each district. Which neighbourhood fits you?`,
    },
  };
}

const EN_TYPE_LABELS: Record<Neighborhood["type"], string> = {
  "centre-ville": "City Centre",
  résidentiel: "Residential",
  étudiant: "Student",
  branché: "Trendy",
  populaire: "Working-class",
  pavillonnaire: "Suburban",
};

const EN_TYPE_COLORS: Record<Neighborhood["type"], string> = {
  // Indigo / pink / cyan families only: green, lime, amber, orange, red and
  // violet are reserved for the score tiers (« Couleurs » identity).
  "centre-ville": "text-[#3730A3] bg-[#E0E7FF]",
  résidentiel: "text-[#155E75] bg-[#CFFAFE]",
  étudiant: "text-[#9D174D] bg-[#FCE7F3]",
  branché: "text-[#86198F] bg-[#FAE8FF]",
  populaire: "text-[#075985] bg-[#E0F2FE]",
  pavillonnaire: "text-[#1E40AF] bg-[#DBEAFE]",
};

const SCORE_AXES: Array<{ key: keyof Neighborhood["scores"]; label: string }> = [
  { key: "safety", label: "Safety" },
  { key: "transport", label: "Transport" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Cost" },
  { key: "nightlife", label: "Nightlife" },
];

function scoreColor(s: number) {
  if (s >= 7.5) return "text-purple-600";
  if (s >= 7.0) return "text-green-700";
  if (s >= 6.0) return "text-lime-700";
  if (s >= 5.0) return "text-amber-700";
  if (s >= 4.0) return "text-orange-700";
  return "text-red-600";
}

function enDescription(n: Neighborhood, cityName: string): string {
  const type = EN_TYPE_LABELS[n.type];
  const topScore = Math.max(n.scores.safety, n.scores.transport, n.scores.nature, n.scores.nightlife);
  let strength = "";
  if (topScore === n.scores.transport && n.scores.transport >= 7) strength = "well-connected";
  else if (topScore === n.scores.safety && n.scores.safety >= 7) strength = "very safe";
  else if (topScore === n.scores.nature && n.scores.nature >= 7) strength = "green and spacious";
  else if (topScore === n.scores.nightlife && n.scores.nightlife >= 7) strength = "lively at night";
  else strength = "balanced";

  const costNote = n.scores.cost >= 6.5
    ? "affordable rents"
    : n.scores.cost <= 4.5
    ? "premium rents"
    : "mid-range rents";

  return `${type} district in ${cityName}. ${strength.charAt(0).toUpperCase() + strength.slice(1)}, with ${costNote} (T2 avg €${n.avgRentT2}/mo). ${n.tags.slice(0, 3).join(", ")}.`;
}

export default async function EnCityNeighbourhoodsPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const photo = cityPhoto(city.slug);

  const neighborhoods = getNeighborhoods(slug);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${slug}` },
    { name: "Neighbourhoods", path: `/cities/${slug}/neighbourhoods` },
  ]);

  const jsonLd = neighborhoods.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Neighbourhoods of ${city.name}`,
    "description": `${neighborhoods.length} districts in ${city.name}: safety, rents, transport and atmosphere.`,
    "numberOfItems": neighborhoods.length,
    "itemListElement": neighborhoods.map((n, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": `${n.name} — ${city.name}`,
      "description": enDescription(n, city.name),
    })),
  } : null;

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href={`/cities/${slug}`} className="hover:underline">
              ← {city.name}
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Neighbourhoods of {city.name}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {neighborhoods.length > 0
              ? `${neighborhoods.length} districts scored on safety, transport, nature, cost and nightlife.`
              : "Neighbourhood data is being compiled for this city."}
          </p>
        </div>
        {photo && (
          <CityPhotoBand photo={photo} cityName={city.name} locale="en" className="mt-8" />
        )}
      </section>

      {/* District cards — indigo band */}
      <section className="band band-indigo py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
        {neighborhoods.length === 0 ? (
          <div className="rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] p-5">
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🏗️</div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Data being compiled
              </h2>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-4">
                Neighbourhood profiles for {city.name} are included in the next data update.
              </p>
              <Link
                href={`/cities/${slug}`}
                className="grad-head-0 inline-flex items-center gap-2 rounded-full font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
              >
                ← Back to {city.name}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {neighborhoods.map((n) => (
              <article key={n.slug} className="rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">{n.name}</h2>
                      <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${EN_TYPE_COLORS[n.type] ?? "text-[#3730A3] bg-[#E0E7FF]"}`}>
                        {EN_TYPE_LABELS[n.type] ?? n.type}
                      </span>
                      <a
                        href={mapsPlaceUrl(n.name, city.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex min-h-8 items-center gap-1 rounded-full bg-[var(--band-indigo)] px-3 py-1 text-xs font-semibold text-[#3730A3] transition-colors hover:bg-[#DCD7FF]"
                      >
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        See on Google Maps
                      </a>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                      {enDescription(n, city.name)}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {n.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[var(--band-sky)] text-[#1E3A8A]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 sm:w-52 rounded-xl bg-[var(--band-indigo)] p-4">
                    <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Avg T2 rent</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mb-4">€{n.avgRentT2}/mo</p>
                    <div className="space-y-1.5">
                      {SCORE_AXES.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-[var(--text-secondary)]">{label}</span>
                          <span className={`font-semibold ${scoreColor(n.scores[key])}`}>
                            {n.scores[key].toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </>
        )}
      </div>
      </section>

      {/* Methodology + discussion — white band */}
      <section className="band band-white py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
          {neighborhoods.length > 0 && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
              <h2 className="grad-head-2 px-5 py-3 text-sm font-semibold">Methodology</h2>
              <div className="p-5">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Neighbourhood scores are derived from local rental data, safety indices, public
                transport access, green-space coverage and nightlife density. Rents are median T2
                (one-bedroom) estimates from observatoire des loyers and real-estate listings,
                refreshed annually. Scores are on a 0–10 scale. These are estimates, not real-time data.
              </p>
              </div>
            </div>
          )}

          <DiscussionCTA cityName={city.name} citySlug={city.slug} locale="en" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
