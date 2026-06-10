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
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { PoliticalLeanTail, type LeanTailRow } from "@/components/PoliticalLeanTail";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "Political leaning of French cities · 2026 ranking",
  description:
    "Estimated political leaning of 540 French cities based on the 2022 presidential first round (Ministry of the Interior). Ranked city by city: left, centre, right, far right.",
  alternates: { canonical: `${EN_BASE}/political-leaning` },
  openGraph: {
    title: "Political leaning of French cities",
    description: "How residents voted in the 2022 first round, city by city. Indicative, source: French Ministry of the Interior.",
  },
};

const NAME_BY_SLUG = new Map(CITIES_SEED.map((c) => [c.slug, c]));

const SECTION_TITLE: Record<Bloc, string> = {
  gauche: "Left-leaning cities",
  centre: "Centrist cities",
  droite: "Right-leaning cities",
  extreme_droite: "Far-right-leaning cities",
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

export default function EnPoliticalLeaningPage() {
  const all = allPoliticalLeans();
  const options = leanOptions();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Political leaning of French cities (2022 first round)",
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
            <span className="font-display gradient-text-anim italic">Political leaning of French cities</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[var(--text-secondary)]">
            How {all.length} French cities voted in the first round of the 2022 presidential election,
            grouped into four political families. An estimate of how residents voted — not the colour of the town hall.
          </p>
          {/* Legend */}
          <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
            {BLOC_ORDER.map((b) => (
              <span key={b} className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BLOC_COLORS[b] }} />
                {BLOC_LABEL.en[b]}
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
                <span className="text-xs text-[var(--text-tertiary)]">{cities.length} cities</span>
                <span className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
              </div>
              <ol className="grid gap-2 sm:grid-cols-2">
                {cities.slice(0, TOP_VISIBLE).map((c, i) => {
                  const city = NAME_BY_SLUG.get(c.slug);
                  if (!city) return null;
                  return (
                    <li key={c.slug}>
                      <Link
                        href={`/cities/${c.slug}`}
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
                <PoliticalLeanTail rows={tailRows} startRank={TOP_VISIBLE + 1} bloc={bloc} locale="en" />
              </ol>
            </section>
          );
        })}

        <p className="text-xs leading-relaxed text-[var(--text-tertiary)] border-t border-[var(--border)] pt-6">
          Methodology · Each city is classified by the political family that came first in the first round of
          the 2022 presidential election, at the commune level (results from the French Ministry of the Interior,
          data.gouv.fr). Left = Mélenchon, Roussel, Hidalgo, Jadot, Poutou, Arthaud · Centre = Macron ·
          Right = Pécresse, Lassalle · Far right = Le Pen, Zemmour, Dupont-Aignan. An indicative sociological
          marker that reflects how residents voted, not the label of the local council.
          {" "}Filter the <Link href="/map" className="text-[var(--accent)] hover:underline">map of France</Link>{" "}
          or the <Link href="/cities" className="text-[var(--accent)] hover:underline">cities</Link> by leaning.
        </p>
      </div>

      <Footer />
    </main>
  );
}
