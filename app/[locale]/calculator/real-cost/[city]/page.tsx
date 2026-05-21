import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CityProfileCta } from "@/components/CityProfileCta";
import { HiddenCostsCalculatorEN } from "@/components/HiddenCostsCalculatorEN";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { fiscalityForCity } from "@/lib/fiscalite";
import { climateZoneFor, transitPassFor, type CostCalcInput } from "@/lib/cost-living";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; city: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", city: c.slug }));
}

function parseFonciereMidpoint(range: string): number | null {
  const cleaned = range.replace(/ /g, " ").replace(/[€/an\s]/g, "");
  const m = cleaned.match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  const lo = Number(m[1]);
  const hi = Number(m[2]);
  if (Number.isNaN(lo) || Number.isNaN(hi)) return null;
  return Math.round((lo + hi) / 2);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const c = CITIES_SEED.find((x) => x.slug === city);
  if (!c) return {};
  return {
    title: `Real monthly cost of living in ${c.name} 2026 · Calculator (rent, car, taxes)`,
    description: `Honest breakdown of monthly fixed costs in ${c.name}: median 1-bed rent, heating by climate zone, car or transit, property tax, waste tax. Side-by-side comparison with Paris.`,
    alternates: { canonical: `${EN_BASE}/calculator/real-cost/${city}` },
  };
}

export default async function EnCalculatorRealCostCityPage({ params }: Props) {
  const { city } = await params;
  const c = CITIES_SEED.find((x) => x.slug === city);
  if (!c) notFound();

  const housing = getHousing(c.slug);
  const fisc =
    c.department && c.region
      ? fiscalityForCity({ department: c.department, region: c.region })
      : null;
  const taxeFonciereMidpoint = fisc ? parseFonciereMidpoint(fisc.taxeFonciereT3) : null;
  const zone = climateZoneFor(c.department);
  const transitPass = transitPassFor(c.slug);

  const input: CostCalcInput = {
    citySlug: c.slug,
    cityName: c.name,
    department: c.department,
    region: c.region,
    population: c.population,
    avgRentT2: housing?.avgRentT2 ?? null,
    taxeFonciereAnnualMidpoint: taxeFonciereMidpoint,
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cost calculator", path: "/calculator/real-cost" },
    { name: c.name, path: `/calculator/real-cost/${c.slug}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/calculator/real-cost" className="hover:underline">
              ← All calculators
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Real monthly cost of living in {c.name}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {c.department && `${c.department}, `}
            {c.region}
            {zone && (
              <>
                {" "}
                · Climate zone <strong>{zone}</strong>
              </>
            )}
            {transitPass != null && (
              <>
                {" "}
                · Transit pass €{transitPass}/month
              </>
            )}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {!housing && (
          <Card>
            <p className="text-sm text-amber-700">
              No indexed T2 rent data for {c.name}. The calculation uses a département-level
              estimate, which is less precise.
            </p>
          </Card>
        )}

        <HiddenCostsCalculatorEN input={input} />

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            What this calculator does NOT include
          </h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• Health insurance supplement (€50–90/month on average)</li>
            <li>• Childcare (creche, childminder, after-school programmes)</li>
            <li>• Groceries (€350–600/month for a single person)</li>
            <li>• Leisure, sport, streaming subscriptions</li>
            <li>• Condo service charges (often €30–100/month on top of rent)</li>
            <li>• Neighbourhood variation (can be ±20% on rent)</li>
          </ul>
        </Card>

        <CityProfileCta
          city={c}
          eyebrow="Go further"
          blurb={`Global score, safety, transport, climate and reviews: the full profile for ${c.name}.`}
        />
      </div>

      <Footer />
    </main>
  );
}
