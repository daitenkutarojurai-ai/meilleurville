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
  title: "Cheapest cities to live in France 2026 — rent & buy prices ranked",
  description:
    "Top 50 cheapest French cities by median 2-bed rent in 2026. Real data from national rent observatories (ANIL/OLL) and DVF property transactions. Where your housing budget actually goes far.",
  alternates: { canonical: `${EN_BASE}/cheapest-cities` },
  openGraph: {
    title: "Cheapest cities to live in France 2026",
    description:
      "Ranked by 2-bed median rent: 50 French cities where housing is still genuinely affordable.",
    type: "website",
  },
};

export default function CheapestCitiesPage() {
  const rows = CITIES_SEED
    .map((city) => {
      const housing = HOUSING[city.slug];
      if (!housing) return null;
      return {
        city,
        rentT1: housing.avgRentT1,
        rentT2: housing.avgRentT2,
        rentT3: housing.avgRentT3,
        priceM2: housing.avgBuyPriceM2,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r != null)
    .sort((a, b) => a.rentT2 - b.rentT2 || a.priceM2 - b.priceM2)
    .slice(0, 50);

  const medianT2 = (() => {
    const all = Object.values(HOUSING).map((h) => h.avgRentT2).sort((a, b) => a - b);
    return all[Math.floor(all.length / 2)] ?? 700;
  })();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.bestcitiesinfrance.com";

  return (
    <main id="main-content" className="min-h-screen relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Cheapest cities to live in France 2026",
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
            Cheapest cities to live in France
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            The 50 French cities with the lowest housing costs in 2026. Sorted by median
            2-bed rent — no marketing gloss, just the numbers.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
        <Card>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">How to read this:</strong> cities
            are ranked by rising 2-bed (T2) median rent. The national median sits at{" "}
            <strong>€{medianT2}/month</strong> — anything below that is genuinely cheap by
            French standards. Most of the top entries are in the low-density interior:
            Creuse, Cantal, Haute-Vienne. Low rent and tight job markets tend to go
            together, so always cross-check the quality-of-life score on the right.
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Tie-break: buy price per m² ascending. The quality score (right column) is
            on a 0–10 scale, not a rent figure.
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
                  <span className="text-xs text-[var(--text-tertiary)] truncate">
                    {row.city.region} · {(row.city.population ?? 0).toLocaleString("en-GB")} residents
                    {" "}· studio €{row.rentT1}/mo · 3-bed €{row.rentT3}/mo · buy €{row.priceM2.toLocaleString("en-GB")}/m²
                  </span>
                </span>
                <span className="text-right flex-shrink-0">
                  <span className="font-mono-data font-bold text-[var(--accent)] block">
                    €{row.rentT2}/mo
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">2-bed rent</span>
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

        {rows.length === 0 && (
          <Card>
            <p className="text-sm text-[var(--text-secondary)]">No cities with housing data available.</p>
          </Card>
        )}

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Caveats</h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• The T2 rent shown is a city-wide median — the interquartile range can easily be ±25%.</li>
            <li>• Low rent isn&apos;t automatically a bargain: it often signals weak demand (declining population, scarce jobs). Always check the quality-of-life score and the full city profile.</li>
            <li>• Only cities with documented rent data are included; ~50 cities in the database are excluded.</li>
            <li>• Buying instead of renting? See the value-for-money ranking below.</li>
          </ul>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Data sources</h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>
              • Rents: network of{" "}
              <a href="https://www.observatoires-des-loyers.org" target="_blank" rel="noopener noreferrer nofollow" className="underline">
                Observatoires Locaux des Loyers
              </a>{" "}
              (OLL), coordinated by ANIL for the Ministry of Housing.
            </li>
            <li>
              • Buy prices:{" "}
              <a href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/" target="_blank" rel="noopener noreferrer nofollow" className="underline">
                Demandes de Valeurs Foncières (DVF)
              </a>{" "}
              via data.gouv.fr.
            </li>
            <li>• Population: INSEE census.</li>
          </ul>
        </Card>

        <Card>
          <p className="text-sm text-[var(--text-secondary)]">
            See also:{" "}
            <Link href="/best-value-cities" className="underline text-[var(--accent)]">
              best value-for-money cities
            </Link>{" "}
            ·{" "}
            <Link href="/rankings/logement" className="underline text-[var(--accent)]">
              housing affordability ranking
            </Link>{" "}
            ·{" "}
            <Link href="/quiz" className="underline text-[var(--accent)]">
              find your ideal French city
            </Link>
            .
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
