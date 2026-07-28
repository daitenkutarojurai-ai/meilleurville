import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CityPhotoBand } from "@/components/CityPhoto";
import { cityPhoto } from "@/lib/city-images";
import { Footer } from "@/components/Footer";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import {
  cityParks,
  hasParksData,
  sortedParks,
  areaLabel,
  kindLabel,
  parkDistanceKm,
  nearbyCityParks,
  OSM_CREDIT_EN,
  OSM_LICENSE_URL,
  PARKS_CITY_COUNT,
  type Park,
} from "@/lib/city-parks";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.filter((c) => hasParksData(c.slug)).map((c) => ({
    locale: "en",
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  const data = cityParks(slug);
  if (!city || !data) return {};
  const top = sortedParks(data)[0];
  const count = data.parks.length;
  return {
    title: `Parks & green spaces in ${city.name} · ${count} public parks`,
    description: `The ${count} public parks and gardens in ${city.name}, sorted by size${top ? `, starting with ${top.name} (${areaLabel(top)})` : ""}. Playground, accessibility, drinking water — what actually decides a Saturday morning. Data from OpenStreetMap.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/parks` },
    openGraph: {
      title: `Parks in ${city.name}`,
      description: `${count} public parks and gardens mapped on OpenStreetMap`,
    },
  };
}

function walkMinutesEn(distanceKm: number | null): string | null {
  if (distanceKm == null) return null;
  const mins = Math.round((distanceKm / 5) * 60);
  if (mins < 5) return "≈ 5 min walk";
  if (mins <= 60) return `≈ ${mins} min walk`;
  return `≈ ${distanceKm.toFixed(1)} km from centre`;
}

function amenitiesLineEn(p: Park): string {
  const bits: string[] = [];
  if (p.playground) bits.push("playground");
  if (p.wheelchair === true) bits.push("wheelchair / stroller accessible");
  if (p.drinkingWater) bits.push("drinking water");
  if (p.toilets) bits.push("public toilets");
  if (p.dog === true) bits.push("dogs allowed");
  return bits.join(" · ");
}

function osmUrl(osmId: string): string {
  const type = osmId[0] === "w" ? "way" : osmId[0] === "r" ? "relation" : "node";
  const id = osmId.slice(1);
  return `https://www.openstreetmap.org/${type}/${id}`;
}

export default async function ParksPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const data = cityParks(slug);
  if (!data) notFound();
  const parks = sortedParks(data);
  const photo = cityPhoto(city.slug);
  const nearby = nearbyCityParks(city, { maxDistanceKm: 30, limit: 6 });

  const withPlayground = parks.filter((p) => p.playground).length;
  const totalHa = parks.reduce((s, p) => s + p.areaM2, 0) / 10_000;
  const biggest = parks[0] ?? null;

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Parks in ${city.name}`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: parks.length,
    itemListElement: parks.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Park",
        name: p.name,
        geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
        isAccessibleForFree: true,
        publicAccess: true,
        sameAs: osmUrl(p.osmId),
      },
    })),
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${slug}` },
    { name: "Parks", path: `/cities/${slug}/parks` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemListJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{city.name}</Link>
          {" · "}
          <span>Parks</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🌳</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Parks in {city.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          {parks.length === 0 ? (
            <>No named public park is currently mapped on OpenStreetMap for this commune — know one? <a href="https://www.openstreetmap.org/edit" className="text-[var(--accent)] hover:underline">Add it to OSM</a> and it will show up here on the next data refresh.</>
          ) : (
            <>{parks.length} public parks and gardens are mapped on OpenStreetMap, sorted from largest to smallest. The things that actually decide a Saturday morning: playground, shade, stroller access, whether dogs are welcome.</>
          )}
        </p>

        {photo && (
          <CityPhotoBand photo={photo} cityName={city.name} locale="en" className="mt-6" />
        )}
      </section>

      {parks.length > 0 && (
        <>
          <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Parks mapped</p>
              <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)]">{parks.length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">With playground</p>
              <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)]">{withPlayground}</p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                {parks.length ? `${Math.round((withPlayground / parks.length) * 100)}% of parks` : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Total area</p>
              <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)]">
                {totalHa >= 100 ? Math.round(totalHa) : totalHa.toFixed(1)}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-1">ha</span>
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Largest</p>
              <p className="text-base font-bold text-[var(--text-primary)] leading-tight truncate">
                {biggest?.name ?? "—"}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                {biggest ? areaLabel(biggest) : ""}
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              All {parks.length} parks, largest first
            </h2>
            <ol className="space-y-2.5">
              {parks.map((p, i) => {
                const dist = parkDistanceKm(city, p);
                const walk = walkMinutesEn(dist);
                const amenities = amenitiesLineEn(p);
                return (
                  <li
                    key={p.osmId}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex items-start gap-4"
                  >
                    <div className="text-xs font-mono-data text-[var(--text-tertiary)] pt-1 w-6 shrink-0">
                      #{i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">
                          {p.name}
                        </h3>
                        <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
                          {kindLabel(p.kind, "en")}
                        </span>
                        {p.playground && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            🛝 playground
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">
                        {p.areaM2 ? areaLabel(p) : "area not recorded"}
                        {walk ? ` · ${walk}` : ""}
                      </div>
                      {amenities && (
                        <div className="text-xs text-[var(--text-secondary)] mt-1">
                          {amenities}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=16/${p.lat}/${p.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        Map ↗
                      </a>
                      <a
                        href={osmUrl(p.osmId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                      >
                        OSM {p.osmId}
                      </a>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}

      {nearby.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            Change of scenery — parks less than 30 min away
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            When the local park starts to feel too familiar, the neighbouring cities are worth the drive.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nearby.map((n) => {
              const top = sortedParks(n.data)[0];
              return (
                <Link
                  key={n.city.slug}
                  href={`/cities/${n.city.slug}/parks`}
                  className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all p-4"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {n.city.name}
                    </div>
                    <div className="text-xs font-mono-data text-[var(--text-tertiary)] shrink-0">
                      {n.distanceKm} km
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {n.data.parks.length} park{n.data.parks.length > 1 ? "s" : ""}
                    {top ? ` · ${top.name} (${areaLabel(top)})` : ""}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Source:</strong> {OSM_CREDIT_EN},
          licensed under the <a href={OSM_LICENSE_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">ODbL</a>.
          Overpass API extraction from {data.crawledAt}. All {PARKS_CITY_COUNT} cities on the site have been surveyed on OpenStreetMap.
          A park is missing or wrong? <a href="https://www.openstreetmap.org/edit" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Contribute on OpenStreetMap</a> — the fix will flow into our next data refresh.
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 flex gap-3 flex-wrap">
        <Link
          href={`/cities/${slug}`}
          className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          ← Full {city.name} profile
        </Link>
        <Link
          href={`/cities/${slug}/neighbourhoods`}
          className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          🏘️ Neighbourhoods
        </Link>
        <Link
          href={`/cities/${slug}/climate`}
          className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          ☀️ Climate
        </Link>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} locale="en" />
      </section>

      <Footer />
    </main>
  );
}
