import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PurchaseSimulatorEN } from "@/components/PurchaseSimulatorEN";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Property purchase simulator 2026 · Where to buy in France on your budget",
  description:
    "Enter your budget and target floor area — see the top 15 affordable French cities ranked by quality of life, with monthly mortgage payment and estimated notary fees.",
  alternates: { canonical: `${EN_BASE}/simulator/purchase` },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Purchase simulator", path: "/simulator/purchase" },
]);

export default function EnSimulatorPurchasePage() {
  const cities = CITIES_SEED
    .map((c) => {
      const h = HOUSING[c.slug];
      if (!h) return null;
      return {
        slug: c.slug,
        name: c.name,
        region: c.region ?? "",
        priceM2: h.avgBuyPriceM2,
        score: c.scores.global,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c != null);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            🏠 Purchase simulator
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Where can you buy on your budget?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Set your total budget and target floor area — we return the top 15 affordable
            French cities ranked by quality of life, with monthly mortgage payment and
            estimated notary fees.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <PurchaseSimulatorEN cities={cities} />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Simulator limits
          </h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>• Price per m² = 2024 municipal median (DVF + Meilleurs Agents). Neighbourhood variation of ±30% is common.</li>
            <li>• Interest rate = market average Jan 2026, excl. insurance — your actual offer depends on your income, job stability, and debt ratio.</li>
            <li>• The simulator does not include condo service charges, property tax, or mortgage insurance (~0.3%/year).</li>
            <li>• For a full monthly cost breakdown (including local taxes), see{" "}
              <Link href="/calculator/real-cost" className="underline">
                the per-city cost calculator
              </Link>
              .
            </li>
          </ul>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
