import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QUITTER_PAIRS, buildQuitterPairData } from "@/lib/quitter-pairs";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "Moving from one French city to another — honest comparisons 2026",
  description: `${QUITTER_PAIRS.length} origin → destination comparisons: Paris → Lyon, Marseille → Aix, Lille → Amiens, and more. Fixed costs, quality-of-life delta, and a verdict on who the move actually makes sense for.`,
  alternates: { canonical: `${EN_BASE}/moving-from` },
  openGraph: {
    title: "Moving from one French city to another",
    description: `${QUITTER_PAIRS.length} argued comparisons. Fixed costs + quality of life + profile verdict.`,
  },
};

function enPairSlug(origin: string, destination: string): string {
  return `${origin}-to-${destination}`;
}

function groupByOrigin(): Map<string, ReturnType<typeof buildQuitterPairData>[]> {
  const grouped = new Map<string, ReturnType<typeof buildQuitterPairData>[]>();
  for (const pair of QUITTER_PAIRS) {
    const data = buildQuitterPairData(pair[0], pair[1]);
    if (!data) continue;
    const list = grouped.get(data.origin.name) ?? [];
    list.push(data);
    grouped.set(data.origin.name, list);
  }
  return grouped;
}

export default function MovingFromIndexPage() {
  const grouped = groupByOrigin();

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Moving from one French city to another
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          {QUITTER_PAIRS.length} origin → destination comparisons. Each page breaks down the fixed-cost
          gap (rent, heating, mobility, taxes), compares 10 quality-of-life scores, and tells you who
          the move actually makes sense for. All figures derived from {CITIES_COUNT} cities in our
          dataset — nothing invented.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Badge>{QUITTER_PAIRS.length} pairs</Badge>
          <Badge>Data calibrated across {CITIES_COUNT} cities</Badge>
        </div>

        {[...grouped.entries()].map(([originName, pairs]) => (
          <div key={originName} className="mt-10">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">From {originName}</h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pairs
                .filter((p): p is NonNullable<typeof p> => p !== null)
                .map((p) => {
                  const slug = enPairSlug(p.origin.slug, p.destination.slug);
                  return (
                    <Link key={slug} href={`/moving-from/${slug}`} className="block">
                      <Card className="p-4 hover:shadow-md transition h-full">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            → {p.destination.name}
                          </div>
                          <div className={`text-xs font-semibold ${p.globalDelta > 0 ? "text-emerald-700" : p.globalDelta < 0 ? "text-red-700" : "text-[var(--text-tertiary)]"}`}>
                            {p.globalDelta > 0 ? "+" : ""}{p.globalDelta} pts
                          </div>
                        </div>
                        {p.monthlySavings != null && (
                          <div className="mt-2 text-xs text-[var(--text-secondary)]">
                            Fixed costs:{" "}
                            <span className={p.monthlySavings > 0 ? "text-emerald-700 font-semibold" : "text-red-700 font-semibold"}>
                              {p.monthlySavings > 0 ? "−" : "+"}{Math.abs(Math.round(p.monthlySavings))} €/mo
                            </span>
                          </div>
                        )}
                      </Card>
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}

        <div className="mt-12 text-xs text-[var(--text-tertiary)]">
          Looking for a pair not listed here? The URL{" "}
          <code className="px-1 py-0.5 bg-[var(--bg-elevated)] rounded">/moving-from/&lt;city-a&gt;-to-&lt;city-b&gt;</code>{" "}
          works for any two cities in our dataset.
        </div>
      </section>
      <Footer />
    </main>
  );
}
