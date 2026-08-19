import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";
import {
  cityParks,
  sortedParks,
  areaLabel,
  OSM_CREDIT_EN,
  OSM_LICENSE_URL,
  PARKS_CITY_COUNT,
  PARKS_CITY_WITHOUT_PARKS_COUNT,
  PARKS_TOTAL,
  type CityParks,
} from "@/lib/city-parks";

// Cards are ~2.5 kB of HTML each; the tail ships as a link index instead.
const INITIAL_VISIBLE = 60;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: `Parks & green space · ${PARKS_TOTAL} parks in ${PARKS_CITY_COUNT} French cities`,
  description: `Parks, public gardens and playgrounds across ${PARKS_CITY_COUNT} French cities, mapped from OpenStreetMap. Playground, step-free access, drinking water — what actually decides a Saturday morning.`,
  alternates: pathAlternatesEn("/parcs", "/parks"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Parks & green space in French cities | BestCitiesInFrance",
    description: `${PARKS_TOTAL} parks mapped across ${PARKS_CITY_COUNT} cities`,
  },
};

interface Row {
  slug: string;
  name: string;
  department: string;
  count: number;
  playgrounds: number;
  biggest: string | null;
  biggestArea: string;
}

function buildRows(): Row[] {
  const rows: Row[] = [];
  for (const city of CITIES_SEED) {
    const data = cityParks(city.slug);
    if (!data || !data.parks.length) continue;
    const top = sortedParks(data as CityParks)[0];
    rows.push({
      slug: city.slug,
      name: city.name,
      department: city.department,
      count: data.parks.length,
      playgrounds: data.parks.filter((p) => p.playground).length,
      biggest: top?.name ?? null,
      biggestArea: top ? areaLabel(top) : "",
    });
  }
  return rows.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));
}

export default function ParksHubPage() {
  const rows = buildRows();
  const playgroundTotal = rows.reduce((s, r) => s + r.playgrounds, 0);

  const breadcrumb = breadcrumbJsonLd([
    { name: "BestCitiesInFrance", path: "" },
    { name: "Parks & green space", path: "/parks" },
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "French cities by number of mapped parks",
    numberOfItems: rows.length,
    itemListElement: rows.slice(0, 50).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.name,
      url: `${EN_BASE}/cities/${r.slug}/parks`,
      description: `${r.count} parks mapped${r.playgrounds ? `, ${r.playgrounds} with a playground` : ""}`,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemListJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="relative overflow-hidden py-12 sm:py-16 border-b border-[var(--border)]">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Parks &amp; green space</span>
          </nav>

          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🌳 Green space
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
            Somewhere other than the usual park
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Parks, public gardens and playgrounds mapped city by city, with the details that decide a
            Saturday morning: playground, step-free access, drinking water, shade.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { v: PARKS_TOTAL.toLocaleString("en-GB"), l: "parks mapped" },
              { v: rows.length, l: "cities with a named park" },
              { v: playgroundTotal.toLocaleString("en-GB"), l: "with a playground" },
              { v: `${PARKS_CITY_COUNT} / ${CITIES_COUNT}`, l: "cities surveyed on OSM" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
              >
                <div className="text-xl font-bold font-mono-data text-[var(--accent)]">{s.v}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            Cities, best-served first
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Named parks mapped in OpenStreetMap. An unnamed polygon is not a destination, so it is
            not counted.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.slice(0, INITIAL_VISIBLE).map((r) => (
              <Link
                key={r.slug}
                href={`/cities/${r.slug}/parks`}
                className="group rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-elevated)]/40 ring-1 ring-black/[0.03] hover:border-[var(--accent)]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all px-4 py-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {r.name}
                  </span>
                  <span className="text-sm font-bold font-mono-data text-[var(--accent)] shrink-0">
                    {r.count}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                  {r.department}
                </div>
                {r.biggest && (
                  <div className="text-xs text-[var(--text-secondary)] mt-1.5 truncate">
                    Largest: {r.biggest}
                    {r.biggestArea ? ` (${r.biggestArea})` : ""}
                  </div>
                )}
                {r.playgrounds > 0 && (
                  <div className="mt-2 inline-flex items-center rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    🛝 {r.playgrounds} playground{r.playgrounds > 1 ? "s" : ""}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Tail as a link index, not more cards — a card is ~2.5 kB of HTML,
              a link ~100 B. Every city stays in the static HTML and crawlable.
              See CLAUDE.md § Performance constraints. */}
          {rows.length > INITIAL_VISIBLE && (
            <details className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]">
                The other {rows.length - INITIAL_VISIBLE} mapped cities
              </summary>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {rows.slice(INITIAL_VISIBLE).map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/cities/${r.slug}/parks`}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                    >
                      {r.name}{" "}
                      <span className="text-[var(--text-tertiary)] font-mono-data">{r.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <p className="mt-8 text-sm text-[var(--text-secondary)]">
            All {PARKS_CITY_COUNT} cities on the site have been surveyed on OpenStreetMap.
            {PARKS_CITY_WITHOUT_PARKS_COUNT > 0 && (
              <>
                {" "}
                {PARKS_CITY_WITHOUT_PARKS_COUNT} communes have no named park mapped yet — add one
                on OSM and it will appear here on the next data refresh.
              </>
            )}
          </p>

          <p className="mt-4 text-xs text-[var(--text-tertiary)]">
            Data from{" "}
            <a
              href={OSM_LICENSE_URL}
              rel="noopener noreferrer"
              target="_blank"
              className="underline hover:text-[var(--text-secondary)]"
            >
              OpenStreetMap — ODbL
            </a>
            {" · "}
            {OSM_CREDIT_EN}. Missing a park? Add it to OpenStreetMap and it will show up here on the
            next survey.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
