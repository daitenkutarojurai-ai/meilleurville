import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: `Real cost of living calculator · ${CITIES_SEED.length} French cities 2026 | BestCitiesInFrance`,
  description: `Calculate the honest monthly cost of living across ${CITIES_SEED.length} French cities: median 1-bed rent, heating by climate zone, car or public transit, property tax, waste tax. Automatic comparison with Paris.`,
  alternates: { canonical: `${EN_BASE}/calculator/real-cost` },
};

export default function EnCalculatorRealCostIndexPage() {
  const top = [...CITIES_SEED]
    .filter((c) => getHousing(c.slug))
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 24);

  const byRegion = CITIES_SEED.reduce<Record<string, typeof CITIES_SEED[number][]>>(
    (acc, city) => {
      const r = city.region ?? "Other";
      (acc[r] ??= []).push(city);
      return acc;
    },
    {},
  );

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            💰 Honest calculator
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
            What does it actually cost to live in{" "}
            <span className="font-display italic">[your city]</span>?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Median 1-bed rent, heating by climate zone, car (regional insurance + fuel) or
            public transit if available, parking, monthly property tax share, waste tax. Real
            total + disposable income + automatic Paris comparison.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-10">
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            Top cities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {top.map((city) => (
              <Link
                key={city.slug}
                href={`/calculator/real-cost/${city.slug}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 hover:border-[var(--accent)]/50 hover:shadow-sm transition-all"
              >
                <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {city.name}
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] truncate">
                  {city.department}
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Browse by region</h2>
          <div className="space-y-6">
            {Object.entries(byRegion)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([region, cities]) => (
                <div key={region}>
                  <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wide">
                    {region} ({cities.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cities
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((city) => (
                        <Link
                          key={city.slug}
                          href={`/calculator/real-cost/${city.slug}`}
                          className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-primary)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-elevated)] transition-colors"
                        >
                          {city.name}
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
