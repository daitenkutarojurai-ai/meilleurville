import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import {
  cityParks,
  sortedParks,
  areaLabel,
  OSM_CREDIT,
  OSM_LICENSE_URL,
  PARKS_CITY_COUNT,
  PARKS_TOTAL,
  type CityParks,
} from "@/lib/city-parks";

export const revalidate = false;

// Cards are ~2.5 kB of HTML each; the tail ships as a link index instead.
const INITIAL_VISIBLE = 60;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

export const metadata: Metadata = {
  title: `Parcs & espaces verts · ${PARKS_TOTAL} parcs dans ${PARKS_CITY_COUNT} villes`,
  description: `Les parcs, jardins publics et aires de jeux de ${PARKS_CITY_COUNT} villes françaises, référencés sur OpenStreetMap. Aire de jeux, accessibilité poussette, point d'eau — de quoi changer de parc ce week-end.`,
  alternates: { canonical: "/parcs" },
  openGraph: {
    title: "Parcs & espaces verts des villes françaises | MaVilleIdéale",
    description: `${PARKS_TOTAL} parcs référencés dans ${PARKS_CITY_COUNT} villes`,
  },
};

interface Row {
  slug: string;
  name: string;
  department: string;
  region: string;
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
      region: city.region,
      count: data.parks.length,
      playgrounds: data.parks.filter((p) => p.playground).length,
      biggest: top?.name ?? null,
      biggestArea: top ? areaLabel(top) : "",
    });
  }
  // Most parks first — this page exists to answer "where can I go instead",
  // so density of options is the useful sort, not alphabetical order.
  return rows.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "fr"));
}

export default function ParcsHubPage() {
  const rows = buildRows();
  const playgroundTotal = rows.reduce((s, r) => s + r.playgrounds, 0);

  const breadcrumb = breadcrumbJsonLd([
    { name: "MaVilleIdéale", path: "" },
    { name: "Parcs & espaces verts", path: "/parcs" },
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Villes françaises par nombre de parcs référencés",
    numberOfItems: rows.length,
    itemListElement: rows.slice(0, 50).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.name,
      url: `${BASE_URL}/villes/${r.slug}/parcs`,
      description: `${r.count} parcs référencés${r.playgrounds ? `, dont ${r.playgrounds} avec aire de jeux` : ""}`,
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
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Parcs &amp; espaces verts</span>
          </nav>

          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🌳 Espaces verts
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
            Changer de parc, pour une fois
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Tourner en rond dans le même square depuis deux ans, ça arrive vite. Voici les parcs,
            jardins publics et aires de jeux référencés ville par ville — avec ce qui décide vraiment
            un samedi matin : aire de jeux, accès poussette, point d&apos;eau, ombre.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { v: PARKS_TOTAL.toLocaleString("fr-FR"), l: "parcs référencés" },
              { v: rows.length, l: "villes couvertes" },
              { v: playgroundTotal.toLocaleString("fr-FR"), l: "avec aire de jeux" },
              { v: `${Math.round((PARKS_CITY_COUNT / CITIES_COUNT) * 100)} %`, l: "des villes du site" },
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
            Les villes, du mieux pourvu au moins pourvu
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Nombre de parcs nommés référencés dans OpenStreetMap. Un parc sans nom n&apos;est pas une
            destination : il n&apos;est pas compté.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.slice(0, INITIAL_VISIBLE).map((r) => (
              <Link
                key={r.slug}
                href={`/villes/${r.slug}/parcs`}
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
                    Le plus grand : {r.biggest}
                    {r.biggestArea ? ` (${r.biggestArea})` : ""}
                  </div>
                )}
                {r.playgrounds > 0 && (
                  <div className="mt-2 inline-flex items-center rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    🛝 {r.playgrounds} aire{r.playgrounds > 1 ? "s" : ""} de jeux
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* The remaining cities as a plain link index rather than more cards:
              a card costs ~2.5 kB of HTML, a link ~100 B. Rendering all 296 as
              cards made this hub a 788 kB page (see CLAUDE.md § Performance
              constraints). The links stay in the static HTML, so every city is
              still crawlable and one click deep. */}
          {rows.length > INITIAL_VISIBLE && (
            <details className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]">
                Les {rows.length - INITIAL_VISIBLE} autres villes référencées
              </summary>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {rows.slice(INITIAL_VISIBLE).map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/villes/${r.slug}/parcs`}
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

          {/* Coverage is partial and says so. The crawl advances batch by batch;
              claiming national coverage would be the easy lie here. */}
          <p className="mt-8 text-sm text-[var(--text-secondary)]">
            {PARKS_CITY_COUNT} villes sur {CITIES_COUNT} sont référencées pour l&apos;instant. Le
            relevé OpenStreetMap avance par lots — les autres villes apparaîtront ici au fur et à
            mesure, sans que la page change.
          </p>

          <p className="mt-4 text-xs text-[var(--text-tertiary)]">
            Données{" "}
            <a
              href={OSM_LICENSE_URL}
              rel="noopener noreferrer"
              target="_blank"
              className="underline hover:text-[var(--text-secondary)]"
            >
              OpenStreetMap — ODbL
            </a>
            {" · "}
            {OSM_CREDIT}. Un parc manque ? Il s&apos;ajoute directement sur OpenStreetMap, et il
            arrivera ici au relevé suivant.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
