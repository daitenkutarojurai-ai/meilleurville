import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SalaryEquivalentEN } from "@/components/SalaryEquivalentEN";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { fiscalityForCity } from "@/lib/fiscalite";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: `Salary equivalent between French cities 2026 · Disposable income calculator`,
  description: `How much do you need to earn in another French city to keep the same disposable income? Interactive calculator across ${CITIES_SEED.length} cities: rent, heating, mobility, taxes.`,
  alternates: { canonical: `${EN_BASE}/salary-equivalent` },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Salary equivalent", path: "/salary-equivalent" },
]);

function parseFonciereMidpoint(range: string): number | null {
  const cleaned = range.replace(/ /g, " ").replace(/[€/an\s]/g, "");
  const m = cleaned.match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  return Math.round((Number(m[1]) + Number(m[2])) / 2);
}

export default function EnSalaryEquivalentPage() {
  const cities = CITIES_SEED.filter((c) => c.department && c.region).map((c) => {
    const housing = HOUSING[c.slug];
    const fisc =
      c.department && c.region
        ? fiscalityForCity({ department: c.department, region: c.region })
        : null;
    return {
      slug: c.slug,
      name: c.name,
      region: c.region ?? "",
      department: c.department ?? "",
      population: c.population ?? 50000,
      avgRentT2: housing?.avgRentT2 ?? null,
      taxeFonciereAnnualMidpoint: fisc ? parseFonciereMidpoint(fisc.taxeFonciereT3) : null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "en"));

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            💸 Salary equivalent
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            What salary do you need in another city to keep the same standard of living?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            You earn €X in Paris and want to move to Lyon — how much do you need to negotiate?
            This calculator converts based on rent, heating, mobility, and taxes across{" "}
            {CITIES_SEED.length} French cities.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <SalaryEquivalentEN cities={cities} />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Methodology
          </h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• <strong>Median 1-bed rent</strong> per city (Clameur / rent observatories 2024)</li>
            <li>• <strong>Heating</strong> by ADEME climate zone (H1a to H3)</li>
            <li>• <strong>Mobility</strong>: regional car insurance + fuel (25k km/year) OR official transit pass</li>
            <li>• <strong>Property tax</strong> (DGFiP T3 second-hand, monthly share)</li>
            <li>• <strong>Waste tax (TEOM)</strong> (DGFiP municipal median, monthly share)</li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Indicative calculation. For a personalised breakdown including health insurance,
            childcare, condo charges and groceries, see{" "}
            <Link href="/calculator/real-cost" className="underline">
              the per-city cost calculator
            </Link>
            .
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
