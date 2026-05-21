import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: `Household cost by city 2026 · ${CITIES_SEED.length} French cities | BestCitiesInFrance`,
  description: `Monthly fixed costs for 4 household types — single, couple, family, retired — across ${CITIES_SEED.length} French cities. Rent, heating, mobility, taxes: honest medians.`,
  alternates: { canonical: `${EN_BASE}/household-cost` },
};

export default function EnHouseholdCostIndexPage() {
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
            👨‍👩‍👧 4 household types
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
            What does a month actually cost — for your household type?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Monthly fixed costs in {CITIES_SEED.length} French cities for 4 profiles: single
            (studio), couple (1-bed), family with 2 children (2-bed), retired. Rent, heating,
            mobility, property tax, waste tax. Honest medians — no sponsored results.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {Object.entries(byRegion)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([region, cities]) => (
              <div key={region}>
                <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
                  {region} ({cities.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cities
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((city) => (
                      <Link
                        key={city.slug}
                        href={`/household-cost/${city.slug}`}
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

      <Footer />
    </main>
  );
}
