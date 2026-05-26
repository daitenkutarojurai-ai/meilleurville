import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { EnGlobalSearch } from "@/components/EnGlobalSearch";
import { CITIES_SEED } from "@/data/cities-seed";
import { EN_GUIDES } from "@/data/guides-en";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Search — cities, guides, glossary · BestCitiesInFrance",
  description: `Search across all cities, guides and glossary terms on BestCitiesInFrance. Find the right French city or relocation guide in one place.`,
  alternates: { canonical: `${EN_BASE}/search` },
};

const GLOSSARY_INDEX = [
  { term: "DPE (Energy Performance Certificate)", def: "Rates a property from A (low consumption) to G (banned from rental since 2025). Always check before buying — F/G means €10,000–30,000 in mandatory works.", href: "/glossary#property" },
  { term: "Notary fees (frais de notaire)", def: "Transfer taxes + emoluments + disbursements: ~7–8% on older property, 2–3% on new builds. Always include them in your borrowing calculation.", href: "/glossary#property" },
  { term: "Taxe foncière (property ownership tax)", def: "Annual local tax paid by the owner. Calculated on the cadastral rental value. Varies widely by city — check before buying.", href: "/glossary#property" },
  { term: "Rent control (encadrement des loyers)", def: "A legal ceiling on rent per m². Currently in force in Paris, Lille, Lyon, Bordeaux, Montpellier, and expanding.", href: "/glossary#renting" },
  { term: "PTZ (Prêt à Taux Zéro)", def: "Zero-interest loan for first-time buyers, subject to income conditions. Counts toward borrowing capacity.", href: "/glossary#finance" },
  { term: "LMNP (furnished rental landlord status)", def: "Tax status for furnished-property landlords. Micro-BIC regime (50% rebate) or actual costs. Depreciation allowed under the réel regime.", href: "/glossary#finance" },
  { term: "ZFE (Low-emission zone)", def: "Urban perimeter progressively banning the most polluting vehicles based on Crit'Air sticker. Affects daily driving in major cities.", href: "/glossary#mobility" },
  { term: "FTTH fibre", def: "Full-fibre broadband direct to the home. 1–8 Gbps speeds. Coverage now above 80% nationally but uneven in rural areas.", href: "/glossary#connectivity" },
  { term: "Copropriété (co-ownership)", def: "Shared ownership structure for apartment buildings. Monthly charges cover maintenance; syndic manages common areas. Review last 3 years of meeting minutes before buying.", href: "/glossary#property" },
  { term: "Plus-value immobilière (capital gains)", def: "Difference between sale and purchase price. Exempt for primary residence. For rental property: 19% income tax + 17.2% social contributions, with tapered relief after year 5.", href: "/glossary#finance" },
  { term: "Carte Vitale (health card)", def: "Social security card that covers ~70% of healthcare costs. Europeans get it after registering; non-EU nationals after 3 months. Essential for seeing a doctor.", href: "/glossary#healthcare" },
  { term: "CAF (family allowance fund)", def: "Provides housing benefit (APL) for tenants. Apply within 1 month of signing a lease. Can reduce rent significantly on modest incomes.", href: "/glossary#social" },
  { term: "Préavis (notice period)", def: "1 month for furnished rentals and in high-tension zones (zone tendue); 3 months elsewhere for unfurnished. Can be shortened for job loss, health reasons.", href: "/glossary#renting" },
  { term: "PLU (local urban plan)", def: "Municipal document fixing land-use rules and construction constraints. Consult before buying if you plan extensions or changes of use.", href: "/glossary#planning" },
  { term: "Rendement brut / net (rental yield)", def: "Gross = annual rent / purchase price. Net = (rent − charges) / (price + notary fees). Typical gap: 1–1.5 points. Net yield below 3% rarely makes financial sense.", href: "/glossary#finance" },
];

export default function SearchPage() {
  const guides = EN_GUIDES.map((g) => ({
    slug: g.slug,
    title: g.title,
    intro: g.intro,
    category: g.category,
  }));

  const cities = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    score: c.scores.global,
  }));

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Search</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            Search BestCitiesInFrance
          </h1>
          <p className="text-[var(--text-secondary)]">
            {cities.length} cities, {guides.length} guides, {GLOSSARY_INDEX.length} glossary terms — one search bar.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <EnGlobalSearch
          cities={cities}
          guides={guides}
          glossary={GLOSSARY_INDEX}
        />
      </div>

      <Footer />
    </main>
  );
}
