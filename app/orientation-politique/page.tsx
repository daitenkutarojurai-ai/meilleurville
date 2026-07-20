import type { Metadata } from "next";
import Link from "next/link";
import { Vote } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  allPoliticalLeans,
  leanOptions,
  BLOC_ORDER,
  BLOC_COLORS,
  BLOC_LABEL,
  type Bloc,
} from "@/lib/political-lean";
import { inMetropolitanBox, project } from "@/lib/france-map-geo";
import { PoliticalLeanTail, type LeanTailRow } from "@/components/PoliticalLeanTail";
import { PoliticalMap, type PoliticalDot } from "@/components/PoliticalMap";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Orientation politique des villes françaises · Carte et classement 2026",
  description:
    "Carte et classement de l'orientation politique de 540 villes françaises d'après le 1er tour de la présidentielle 2022 (Ministère de l'Intérieur) : gauche, centre, extrême droite.",
  alternates: { canonical: "/orientation-politique" },
  openGraph: {
    title: "Orientation politique des villes françaises",
    description: "Le vote des habitants au 1er tour 2022, ville par ville, sur une carte. Indicatif, source Min. Intérieur.",
  },
};

const NAME_BY_SLUG = new Map(CITIES_SEED.map((c) => [c.slug, c]));

const SECTION_TITLE: Record<Bloc, string> = {
  gauche: "Villes orientées à gauche",
  centre: "Villes orientées au centre",
  droite: "Villes orientées à droite",
  extreme_droite: "Villes orientées à l'extrême droite",
};

// Cities visible before the "afficher le classement complet" toggle. Kept low
// on purpose: four blocs × 30 rows was ~120 cards of scroll before the reader
// reached the methodology.
const TOP_VISIBLE = 12;

function dotRadius(population: number): number {
  if (population > 500000) return 6.5;
  if (population > 200000) return 5;
  if (population > 80000) return 4;
  if (population > 30000) return 3.2;
  return 2.6;
}

function LeanBar({ blocs }: { blocs: Record<Bloc, number> }) {
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full" aria-hidden>
      {BLOC_ORDER.filter((b) => blocs[b] > 0).map((b) => (
        <span key={b} style={{ width: `${blocs[b]}%`, backgroundColor: BLOC_COLORS[b] }} />
      ))}
    </div>
  );
}

export default function OrientationPolitiquePage() {
  const all = allPoliticalLeans();
  const options = leanOptions();

  const byBloc = new Map<Bloc, typeof all>(
    options.map((b) => [b, all.filter((c) => c.lean === b).sort((x, y) => y.topPct - x.topPct)]),
  );

  // Mean bloc share across cities — an average of the 540 communal results,
  // not a national result (big cities do not weigh more here). Stated as such.
  const meanBlocs = (() => {
    const sums = {} as Record<Bloc, number>;
    for (const b of BLOC_ORDER) sums[b] = 0;
    for (const c of all) for (const b of BLOC_ORDER) sums[b] += c.blocs[b] ?? 0;
    const out = {} as Record<Bloc, number>;
    for (const b of BLOC_ORDER) out[b] = Math.round((sums[b] / all.length) * 10) / 10;
    return out;
  })();

  const dots: PoliticalDot[] = all.flatMap((c) => {
    const city = NAME_BY_SLUG.get(c.slug);
    if (!city || !inMetropolitanBox(city.longitude, city.latitude)) return [];
    const [x, y] = project(city.longitude, city.latitude);
    return [{
      slug: c.slug,
      name: city.name,
      lean: c.lean,
      topPct: c.topPct,
      blocs: c.blocs,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      r: dotRadius(city.population),
    }];
  });

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Orientation politique des villes françaises (1er tour 2022)",
    numberOfItems: all.length,
  };

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden py-10 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-aurora opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-emerald-700 shadow-xl shadow-[var(--accent)]/30 ring-1 ring-white/40">
            <Vote className="h-6 w-6 text-white" />
          </div>
          <h1 className="mb-3 text-3xl sm:text-5xl font-bold tracking-tight">
            <span className="font-display gradient-text-anim italic">Orientation politique des villes</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[var(--text-secondary)]">
            Comment {all.length} villes françaises ont voté au 1ᵉʳ tour de la présidentielle 2022,
            regroupé en quatre familles politiques. Estimation du vote des habitants — pas la couleur de la mairie.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16 space-y-10">
        {/* Vue d'ensemble — le lecteur doit comprendre la répartition avant
            d'attaquer la moindre liste */}
        <section aria-labelledby="vue-ensemble">
          <h2 id="vue-ensemble" className="sr-only">Vue d&apos;ensemble</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {options.map((b) => {
              const n = byBloc.get(b)?.length ?? 0;
              const pct = Math.round((n / all.length) * 100);
              return (
                <a
                  key={b}
                  href={`#bloc-${b}`}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-all hover:border-[var(--accent)]/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: BLOC_COLORS[b] }} />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{BLOC_LABEL.fr[b]}</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums" style={{ color: BLOC_COLORS[b] }}>{n}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">villes · {pct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                    <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: BLOC_COLORS[b] }} />
                  </div>
                </a>
              );
            })}
          </div>

          <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Moyenne des {all.length} villes
            </p>
            <LeanBar blocs={meanBlocs} />
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
              {BLOC_ORDER.map((b) => (
                <span key={b} className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BLOC_COLORS[b] }} />
                  {BLOC_LABEL.fr[b]} <span className="font-bold tabular-nums">{meanBlocs[b]}%</span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-tertiary)]">
              Moyenne non pondérée des résultats communaux : chaque ville compte pour une, quelle que soit sa taille.
              Ce n&apos;est donc pas le résultat national.
            </p>
          </div>
        </section>

        {/* Carte */}
        <section aria-labelledby="carte-politique">
          <h2 id="carte-politique" className="mb-3 text-lg font-bold text-[var(--text-primary)]">
            La carte
          </h2>
          <PoliticalMap dots={dots} />
        </section>

        {/* Classements par bloc */}
        {options.map((bloc) => {
          const cities = byBloc.get(bloc) ?? [];
          const tailRows: LeanTailRow[] = cities.slice(TOP_VISIBLE).flatMap((c) => {
            const city = NAME_BY_SLUG.get(c.slug);
            return city ? [{ slug: c.slug, name: city.name, topPct: c.topPct, blocs: c.blocs }] : [];
          });
          return (
            <section key={bloc} id={`bloc-${bloc}`} className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: BLOC_COLORS[bloc] }} />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">{SECTION_TITLE[bloc]}</h2>
                <span className="text-xs text-[var(--text-tertiary)]">{cities.length} villes</span>
                <span className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
              </div>
              <ol className="grid gap-2 sm:grid-cols-2">
                {cities.slice(0, TOP_VISIBLE).map((c, i) => {
                  const city = NAME_BY_SLUG.get(c.slug);
                  if (!city) return null;
                  return (
                    <li key={c.slug}>
                      <Link
                        href={`/villes/${c.slug}`}
                        className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:border-[var(--accent)]/40 hover:shadow-md"
                      >
                        <span className="w-6 shrink-0 text-right text-xs font-bold tabular-nums text-[var(--text-tertiary)]">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{city.name}</span>
                            <span className="shrink-0 text-xs font-bold tabular-nums" style={{ color: BLOC_COLORS[bloc] }}>
                              {c.topPct}%
                            </span>
                          </div>
                          <div className="mt-1.5">
                            <LeanBar blocs={c.blocs} />
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
                <PoliticalLeanTail rows={tailRows} startRank={TOP_VISIBLE + 1} bloc={bloc} />
              </ol>
            </section>
          );
        })}

        <details className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]">
            Méthodologie et sources
          </summary>
          <p className="mt-3 text-xs leading-relaxed text-[var(--text-tertiary)]">
            Chaque ville est classée selon la famille politique arrivée en tête au 1ᵉʳ tour de
            l&apos;élection présidentielle 2022, à l&apos;échelle de la commune (résultats du Ministère de
            l&apos;Intérieur, data.gouv.fr). Gauche = Mélenchon, Roussel, Hidalgo, Jadot, Poutou, Arthaud ·
            Centre = Macron · Droite = Pécresse, Lassalle · Extrême droite = Le Pen, Zemmour, Dupont-Aignan.
            Les pourcentages sont exprimés en part des suffrages exprimés. La droite classique n&apos;arrive
            en tête dans aucune des villes du panel en 2022, d&apos;où son absence des sections ci-dessus.
            Indicateur sociologique indicatif, qui reflète le vote des habitants et non l&apos;étiquette de
            la municipalité.
            {" "}Filtrez la <Link href="/carte" className="text-[var(--accent)] hover:underline">carte de France</Link>{" "}
            ou les <Link href="/villes" className="text-[var(--accent)] hover:underline">villes</Link> par orientation.
          </p>
        </details>
      </div>

      <Footer />
    </main>
  );
}
