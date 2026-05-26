import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Best value-for-money cities in France 2026 — quality of life per euro",
  description:
    "Top 50 French cities with the best quality-of-life-to-price ratio: overall score divided by buy price per m². The underrated cities where you get most for your money.",
  alternates: { canonical: `${EN_BASE}/best-value-cities` },
  openGraph: {
    title: "Best value-for-money cities in France 2026",
    description:
      "Which French cities give you the most quality of life per euro spent? Our value score reveals the underrated picks.",
    type: "website",
  },
};

function valueScore(globalScore: number, pricePerM2: number): number {
  if (pricePerM2 <= 0) return 0;
  return Math.round((globalScore / pricePerM2) * 10_000 * 10) / 10;
}

export default function BestValueCitiesPage() {
  const rows = CITIES_SEED
    .map((city) => {
      const housing = HOUSING[city.slug];
      if (!housing) return null;
      return {
        city,
        priceM2: housing.avgBuyPriceM2,
        rentT2: housing.avgRentT2,
        value: valueScore(city.scores.global, housing.avgBuyPriceM2),
      };
    })
    .filter((r): r is NonNullable<typeof r> => r != null)
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.bestcitiesinfrance.com";

  return (
    <main id="main-content" className="min-h-screen relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Best value-for-money cities in France 2026",
            itemListElement: rows.slice(0, 10).map((row, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: row.city.name,
              url: `${BASE_URL}/cities/${row.city.slug}`,
            })),
          }),
        }}
      />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            <Link href="/rankings" className="hover:underline">
              ← Rankings
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Best value-for-money cities in France
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            The 50 French cities where quality of life per euro invested is highest.
            Overall score divided by buy price per m² — the genuinely underrated picks.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">How to read this:</strong> the
            value score is the city&apos;s overall quality-of-life rating (0–10) divided
            by its median buy price per m². Cities like Limoges, Saint-Étienne, and Le
            Mans consistently rank here — not because they&apos;re glamorous, but because
            they offer solid schools, safety, and amenities at property prices that reflect
            weak demand rather than weak quality. Paris 6th arrondissement, for reference,
            has a similar overall score to Limoges but costs 8× more per m².
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Formula: (quality score × 10,000) ÷ buy price per m². Higher = better value.
            Score shown on the right is quality of life (0–10), not the value index.
          </p>
        </Card>

        <ol className="space-y-2">
          {rows.map((row, i) => (
            <li key={row.city.slug}>
              <Link
                href={`/cities/${row.city.slug}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-all"
              >
                <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                  #{i + 1}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="font-semibold text-[var(--text-primary)] block truncate">
                    {row.city.name}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {row.city.region} · 2-bed rent €{row.rentT2}/mo · buy €{row.priceM2.toLocaleString("en-GB")}/m²
                  </span>
                </span>
                <span className="text-right flex-shrink-0">
                  <span className="font-mono-data font-bold text-[var(--accent)] block">
                    {row.value.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">value pts</span>
                </span>
                <span className="text-right flex-shrink-0 w-12">
                  <span className={`font-mono-data font-bold ${scoreColor(row.city.scores.global)} block`}>
                    {row.city.scores.global.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">quality</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Caveats</h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• Buy price per m² is a city-wide median — the interquartile range can vary ±30%.</li>
            <li>• Smaller cities (&lt;30,000 residents) benefit mechanically from low prices but may have thin liquidity (harder to resell).</li>
            <li>• ~50 cities without housing data are excluded from this ranking.</li>
            <li>
              • Doesn&apos;t capture momentum: a fast-gentrifying city may be undervalued today
              and overvalued in 5 years.{" "}
              <Link href="/gentrification" className="underline">
                See the gentrification index.
              </Link>
            </li>
          </ul>
        </Card>

        <Card>
          <p className="text-sm text-[var(--text-secondary)]">
            See also:{" "}
            <Link href="/cheapest-cities" className="underline text-[var(--accent)]">
              cheapest cities by rent
            </Link>{" "}
            ·{" "}
            <Link href="/rankings/logement" className="underline text-[var(--accent)]">
              housing affordability ranking
            </Link>{" "}
            ·{" "}
            <Link href="/quiz" className="underline text-[var(--accent)]">
              personalised city quiz
            </Link>
            .
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
