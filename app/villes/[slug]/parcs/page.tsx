import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CityPhotoBand } from "@/components/CityPhoto";
import { cityPhoto } from "@/lib/city-images";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import {
  cityParks,
  hasParksData,
  sortedParks,
  areaLabel,
  kindLabel,
  parkDistanceKm,
  nearbyCityParks,
  OSM_CREDIT,
  OSM_LICENSE_URL,
  PARKS_CITY_COUNT,
  type Park,
} from "@/lib/city-parks";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

/**
 * SSG only over cities whose OSM crawl has landed in data/city-parks.json.
 * Cities without data emit no route — a fabricated "aucun parc" page for the
 * other 530 slugs would be noise to index (roadmap F59). As the crawl advances
 * batch by batch, new slugs pop into the build automatically.
 */
export function generateStaticParams() {
  return CITIES_SEED.filter((c) => hasParksData(c.slug)).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  const data = cityParks(slug);
  if (!city || !data) return {};
  const top = sortedParks(data)[0];
  const count = data.parks.length;
  return {
    title: `Parcs & espaces verts à ${city.name} · ${count} parcs référencés`,
    description: `Les ${count} parcs et jardins publics de ${city.name} triés par superficie${top ? `, à commencer par ${top.name} (${areaLabel(top)})` : ""}. Aire de jeux, accessibilité, point d'eau — les critères qui décident un samedi matin. Données OpenStreetMap.`,
    alternates: { canonical: `/villes/${slug}/parcs` },
    openGraph: {
      title: `Parcs de ${city.name}`,
      description: `${count} parcs et jardins publics référencés sur OpenStreetMap`,
    },
  };
}

function walkMinutes(distanceKm: number | null): string | null {
  if (distanceKm == null) return null;
  const mins = Math.round((distanceKm / 5) * 60);
  if (mins < 5) return "≈ 5 min à pied";
  if (mins <= 60) return `≈ ${mins} min à pied`;
  return `≈ ${(distanceKm).toFixed(1)} km du centre`;
}

function amenitiesLine(p: Park): string {
  const bits: string[] = [];
  if (p.playground) bits.push("aire de jeux");
  if (p.wheelchair === true) bits.push("accessible poussette/PMR");
  if (p.drinkingWater) bits.push("point d'eau");
  if (p.dog === true) bits.push("chiens acceptés");
  return bits.join(" · ");
}

function osmUrl(osmId: string): string {
  const type = osmId[0] === "w" ? "way" : osmId[0] === "r" ? "relation" : "node";
  const id = osmId.slice(1);
  return `https://www.openstreetmap.org/${type}/${id}`;
}

export default async function ParcsPage({ params }: Props) {
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
    name: `Parcs de ${city.name}`,
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
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Parcs", path: `/villes/${slug}/parcs` },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemListJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />

      <section className="relative pt-20 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/villes" className="hover:text-[var(--text-secondary)]">Villes</Link>
            <span>/</span>
            <Link href={`/villes/${slug}`} className="hover:text-[var(--text-secondary)]">{city.name}</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Parcs</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🌳 Parcs & espaces verts
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            Parcs de{" "}
            <span className="font-display gradient-text-anim italic">{city.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
            {parks.length === 0 ? (
              <>Aucun parc nommé n&apos;est référencé sur OpenStreetMap pour cette commune — vous en connaissez un&nbsp;? <a href="https://www.openstreetmap.org/edit" className="text-[var(--accent)] hover:underline">Ajoutez-le sur OSM</a>, il apparaîtra ici à la prochaine mise à jour.</>
            ) : (
              <>{parks.length} parc{parks.length > 1 ? "s" : ""} et jardin{parks.length > 1 ? "s" : ""} publics{parks.length > 1 ? " sont" : " est"} référencé{parks.length > 1 ? "s" : ""} sur OpenStreetMap, du plus grand au plus petit. Ce qui décide un samedi matin : aire de jeux, ombre, poussette, chien.</>
            )}
          </p>
        </div>

        {photo && (
          <CityPhotoBand photo={photo} cityName={city.name} className="mt-8" />
        )}
      </section>

      {parks.length > 0 && (
        <>
          <section className="relative pb-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">🌳 Parcs référencés</div>
                  <div className="text-2xl font-black font-mono-data text-[var(--text-primary)]">
                    {parks.length}
                  </div>
                </div>
                <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">🛝 Aires de jeux</div>
                  <div className="text-2xl font-black font-mono-data text-[var(--text-primary)]">
                    {withPlayground}
                  </div>
                  <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">
                    {parks.length ? `${Math.round((withPlayground / parks.length) * 100)}% des parcs` : "—"}
                  </div>
                </div>
                <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">📐 Surface totale</div>
                  <div className="text-2xl font-black font-mono-data text-[var(--text-primary)]">
                    {totalHa >= 100 ? Math.round(totalHa) : totalHa.toFixed(1)}
                    <span className="text-sm font-normal text-[var(--text-tertiary)] ml-1">ha</span>
                  </div>
                </div>
                <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">🏆 Le plus grand</div>
                  <div className="text-base font-bold text-[var(--text-primary)] leading-tight truncate">
                    {biggest?.name ?? "—"}
                  </div>
                  <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">
                    {biggest ? areaLabel(biggest) : ""}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative pb-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                Les {parks.length} parcs, du plus grand au plus petit
              </h2>
              <ol className="space-y-2.5">
                {parks.map((p, i) => {
                  const dist = parkDistanceKm(city, p);
                  const walk = walkMinutes(dist);
                  const amenities = amenitiesLine(p);
                  return (
                    <li
                      key={p.osmId}
                      className="rounded-2xl glass border border-white/50 shadow-sm p-4 flex items-start gap-4"
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
                            {kindLabel(p.kind)}
                          </span>
                          {p.playground && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              🛝 aire de jeux
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] mt-1">
                          {p.areaM2 ? areaLabel(p) : "surface non renseignée"}
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
                          Carte ↗
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
            </div>
          </section>
        </>
      )}

      {/* Changer d'air — l'intention originale de F59 : un parent qui tourne
          en rond dans le même parc veut découvrir ceux de la ville d'à côté.
          Seules les villes voisines déjà crawlées apparaissent (les autres
          arriveront batch après batch). */}
      {nearby.length > 0 && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              Changer d&apos;air — parcs à moins de 30 min
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Quand le parc du coin devient trop familier, ceux des villes voisines valent le détour.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {nearby.map((n) => {
                const top = sortedParks(n.data)[0];
                return (
                  <Link
                    key={n.city.slug}
                    href={`/villes/${n.city.slug}/parcs`}
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
                      {n.data.parks.length} parc{n.data.parks.length > 1 ? "s" : ""}
                      {top ? ` · ${top.name} (${areaLabel(top)})` : ""}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ODbL — attribution is a licence condition, not decoration. */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
            <strong className="text-[var(--text-secondary)]">Source :</strong> {OSM_CREDIT},
            sous licence <a href={OSM_LICENSE_URL} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">ODbL</a>.
            Extraction Overpass API du {data.crawledAt}. Le crawl couvre actuellement {PARKS_CITY_COUNT} villes du site — les autres arrivent par lots.
            Un parc manque ou est mal renseigné ? <a href="https://www.openstreetmap.org/edit" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Contribuez sur OpenStreetMap</a>,
            la correction remontera à la prochaine mise à jour de nos données.
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex gap-3 flex-wrap">
          <Link
            href={`/villes/${slug}`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Profil complet de {city.name}
          </Link>
          <Link
            href={`/villes/${slug}/quartiers`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            🏘️ Quartiers de {city.name}
          </Link>
          <Link
            href={`/villes/${slug}/climat`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ☀️ Climat de {city.name}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </section>

      <Footer />
    </main>
  );
}
