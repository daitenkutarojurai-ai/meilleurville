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
import { PoliticalLeanTail, type LeanTailRow } from "@/components/PoliticalLeanTail";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Orientation politique des villes françaises · Classement 2026",
  description:
    "Estimation de l'orientation politique de 540 villes françaises d'après le 1er tour de la présidentielle 2022 (Ministère de l'Intérieur). Classement par ville : gauche, centre, extrême droite.",
  alternates: { canonical: "/orientation-politique" },
  openGraph: {
    title: "Orientation politique des villes françaises",
    description: "Le vote des habitants au 1er tour 2022, ville par ville. Indicatif, source Min. Intérieur.",
  },
};

const NAME_BY_SLUG = new Map(CITIES_SEED.map((c) => [c.slug, c]));

const SECTION_TITLE: Record<Bloc, string> = {
  gauche: "Villes orientées à gauche",
  centre: "Villes orientées au centre",
  droite: "Villes orientées à droite",
  extreme_droite: "Villes orientées à l'extrême droite",
};

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
      <section className="relative overflow-hidden py-14">
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
          {/* Legend */}
          <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
            {BLOC_ORDER.map((b) => (
              <span key={b} className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BLOC_COLORS[b] }} />
                {BLOC_LABEL.fr[b]}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16 space-y-12">
        {options.map((bloc) => {
          const cities = all
            .filter((c) => c.lean === bloc)
            .sort((a, b) => b.topPct - a.topPct);
          const TOP_VISIBLE = 30;
          const tailRows: LeanTailRow[] = cities
            .slice(TOP_VISIBLE)
            .flatMap((c) => {
              const city = NAME_BY_SLUG.get(c.slug);
              return city
                ? [{ slug: c.slug, name: city.name, topPct: c.topPct, blocs: c.blocs }]
                : [];
            });
          return (
            <section key={bloc}>
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

        <p className="text-xs leading-relaxed text-[var(--text-tertiary)] border-t border-[var(--border)] pt-6">
          Méthodologie · Chaque ville est classée selon la famille politique arrivée en tête au 1ᵉʳ tour de
          l'élection présidentielle 2022, à l'échelle de la commune (résultats du Ministère de l'Intérieur,
          data.gouv.fr). Gauche = Mélenchon, Roussel, Hidalgo, Jadot, Poutou, Arthaud · Centre = Macron ·
          Droite = Pécresse, Lassalle · Extrême droite = Le Pen, Zemmour, Dupont-Aignan. Indicateur sociologique
          indicatif, qui reflète le vote des habitants et non l'étiquette de la municipalité.
          {" "}Filtrez la <Link href="/carte" className="text-[var(--accent)] hover:underline">carte de France</Link>{" "}
          ou les <Link href="/villes" className="text-[var(--accent)] hover:underline">villes</Link> par orientation.
        </p>
      </div>

      <Footer />
    </main>
  );
}
