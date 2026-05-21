import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "French property & relocation glossary 2026 · BestCitiesInFrance",
  description:
    "Complete glossary: DPE energy rating, LMNP landlord status, taxe foncière, ZFE low-emission zones, rent control, notary fees, FTTH fibre... All the terms you need before buying, renting or moving in France.",
  alternates: { canonical: `${EN_BASE}/glossary` },
};

type Term = { term: string; def: string };
type Section = { title: string; emoji: string; terms: Term[] };

const SECTIONS: Section[] = [
  {
    title: "Property — buying and renting",
    emoji: "🏠",
    terms: [
      {
        term: "DPE (Energy Performance Certificate)",
        def: "Rates a property's energy consumption from A (≤70 kWh/m²/year) to G (>420 kWh/m²/year). Since 2025 class G properties are banned from the rental market; class F will follow in 2028, class E in 2034. Always check before buying — a DPE F/G means mandatory insulation works costing €10,000–30,000.",
      },
      {
        term: "Notary fees (frais de notaire)",
        def: "Transfer taxes + notary emoluments + disbursements, roughly 7–8% of the purchase price for older properties, 2–3% for new builds. Always add them to the purchase price when calculating borrowing capacity. On a €250,000 apartment in older stock: expect ~€17,000–19,000 in notary fees.",
      },
      {
        term: "Taxe foncière (property ownership tax)",
        def: "Annual local tax paid by the owner (primary or secondary residence). Calculated on the cadastral rental value × combined municipal and departmental rate. Varies widely: ~€600/year for a 3-room flat in Limoges, ~€1,800/year for the same in Marseille. Check before buying — it directly affects rental yield.",
      },
      {
        term: "Taxe d'habitation (residence tax)",
        def: "Abolished for primary residences since 2023. Still due on secondary residences, with a possible surcharge (up to +60%) in high-tension zones. Check before buying a coastal or tourist-town second home.",
      },
      {
        term: "Rent control (encadrement des loyers)",
        def: "A legal ceiling on rent per m², varying by property type, era, and floor. Currently in force in Paris, Lille, Lyon-Villeurbanne, Bordeaux, Montpellier, Plaine-Commune and Est-Ensemble. Landlords may only exceed the cap with a justified rent supplement (architectural character, premium fittings). Breach: retroactive restitution + fine ~€5,000.",
      },
      {
        term: "Loi Carrez (official floor area)",
        def: "The official private floor area of a co-owned property (co-propriété): zones with ceiling height < 1.80 m, walls, partitions, staircases and service ducts are excluded. Must be stated in any sale agreement. An error > 5% entitles the buyer to a proportional price reduction.",
      },
      {
        term: "Loi Boutin (habitable surface)",
        def: "The habitable surface of a let property (furnished or unfurnished). More restrictive than Loi Carrez: also excludes balconies, terraces, cellars and garages. Must be stated in the tenancy agreement.",
      },
      {
        term: "Service charges — recoverable vs non-recoverable",
        def: "Building management charges that a landlord can (recoverable: common-area maintenance, lift, cold water) or cannot (non-recoverable: façade works, major structure, building manager fees) pass on to the tenant. The non-recoverable ratio relative to gross rent is a key net-yield driver.",
      },
    ],
  },
  {
    title: "Buy-to-let investment",
    emoji: "💼",
    terms: [
      {
        term: "LMNP (Non-professional furnished-letting landlord)",
        def: "Tax status for landlords letting furnished properties, when rental income < €23,000/year OR < 50% of household income. Two regimes: micro-BIC (50% flat-rate deduction, simple) or réel (asset depreciation — often tax-neutral for the first several years). The go-to structure for individual buy-to-let investors.",
      },
      {
        term: "LMP (Professional furnished-letting landlord)",
        def: "Status that applies when rental income > €23,000/year AND > 50% of household income. More administrative complexity (professional BIC, URSSAF social charges) but losses can offset total income. Worthwhile beyond 3–4 let properties.",
      },
      {
        term: "Gross yield / net yield",
        def: "Gross = annual rent ÷ purchase price. Net = (rent − property tax − non-recoverable charges − insurance − estimated vacancy − annual maintenance) ÷ (purchase price + notary fees). The gross-to-net gap is typically 1–1.5 percentage points in France (e.g. 5.5% gross → 4% net).",
      },
      {
        term: "Reference rent index (loyer de référence)",
        def: "Median rent per m² by zone, property type, build era and furnished/unfurnished status. Published by OLAP (Paris) and regional rental observatories. Forms the legal basis for rent control and lets buyers benchmark proposed rents before purchase.",
      },
      {
        term: "Rental vacancy",
        def: "Period when a property is unlet. In Bordeaux, Lyon, Toulouse: ~2–4% (15–22 days/year). In Limoges or Saint-Étienne: ~6–8%. Budget for this in any realistic yield calculation — one month vacant per year shaves ~8% off gross yield.",
      },
      {
        term: "Pinel / Pinel+",
        def: "Tax relief on new-build buy-to-let (12% of price over 6 years, 18% over 9, 21% over 12; Pinel+ adds energy-efficiency requirements). Being phased out from 2024, possibly extended to 2027. Caveat: Pinel schemes are often overpriced versus equivalent older stock.",
      },
      {
        term: "Denormandie",
        def: "Tax relief similar to Pinel but for acquisition + renovation in older town-centre properties in eligible municipalities (≤200,000 inhabitants, urban renewal). Works must equal ≥25% of total cost. Particularly interesting in Limoges, Saintes, Roubaix, Cherbourg.",
      },
    ],
  },
  {
    title: "Planning and environment",
    emoji: "🌳",
    terms: [
      {
        term: "ZFE (Low-Emission Zone)",
        def: "Urban perimeter progressively banning the most-polluting vehicles. Mandatory for agglomerations > 150,000 inhabitants since 2024 (Lyon, Marseille, Toulouse, Bordeaux, Nantes, Strasbourg, Montpellier, Nice, etc.). Exclusion timeline: Crit'Air 5 → 4 → 3 → 2, varying by city. Check before buying an older diesel car or before relocating.",
      },
      {
        term: "PLU (Local Urban Plan)",
        def: "Municipal or metropolitan land-use document setting rules on what can be built, raised, extended or converted. Check before buying a property with renovation plans. Available at the town hall or on Géoportail-urbanisme.gouv.fr.",
      },
      {
        term: "Zoning A/B1/B2/C (housing)",
        def: "National zoning measuring property market tension, determining eligibility for Pinel, PTZ, etc. A bis (Paris) > A (large metros) > B1 (medium-tension towns) > B2 (low-tension towns) > C (rural). A B2 commune is eligible for the PTZ on older properties with works until 2027.",
      },
      {
        term: "PTZ (Zero-Rate Loan)",
        def: "Interest-free supplementary loan for first-time buyers meeting income conditions, capped at 50% of total purchase (varies by zone). Refocused from 2024–2027 on new-build apartments in high-tension zones + older properties with works in B2/C. Often decisive for lower-income first-time buyers.",
      },
      {
        term: "DROM (French Overseas Departments)",
        def: "Départements et Régions d'Outre-Mer: Guadeloupe (971), Martinique (972), French Guiana (973), Réunion (974), Mayotte (976). Specific tax and housing rules (LBU, overseas tax relief). Saint-Pierre-et-Miquelon and some overseas territories (French Polynesia, New Caledonia) are not DROM.",
      },
      {
        term: "ATMO air quality index",
        def: "Daily air quality score per agglomeration (1–10), published by approved associations (AirParif, Atmo Sud, Atmo Auvergne-Rhône-Alpes…). Measures 5 pollutants: PM10, PM2.5, NO2, O3, SO2. Check at atmo-france.org before moving if you have asthma or allergies.",
      },
    ],
  },
  {
    title: "Connectivity and remote work",
    emoji: "📡",
    terms: [
      {
        term: "FTTH fibre (Fiber To The Home)",
        def: "Fibre optic connection to inside the property. Symmetric speeds of 1–8 Gbps depending on plan. FTTH coverage in France: ~95% theoretical by end of 2025, but variable street by street. Always verify the exact address on the ARCEP fibre map (cartefibre.arcep.fr) before buying if you work remotely.",
      },
      {
        term: "DSL / VDSL",
        def: "Legacy copper technology (up to 100 Mbps depending on distance to the exchange). Being phased out by 2030. If an address has only VDSL with no fibre scheduled, intensive remote work carries real risk.",
      },
      {
        term: "Fixed 4G / Fixed 5G",
        def: "Mobile broadband replacing fixed-line when fibre/DSL is unavailable. Speed varies with coverage (10–300 Mbps). An acceptable rural fallback, but congested in tourist zones in summer (July–August: speeds can drop 3–5× in Hossegor, Île de Ré, Cassis, etc.).",
      },
      {
        term: "Mobile coverage map (ARCEP)",
        def: "Official 2G/3G/4G/5G coverage map by operator. Check before any rural or coastal move. Available at monreseaumobile.arcep.fr — allows real signal testing at a specific address.",
      },
      {
        term: "Coworking",
        def: "Shared workspace with a monthly subscription (€200–400/month). Useful for breaking remote-work isolation, accessing a professional network, and having a business address. Almost every French departmental capital has at least one; mid-sized cities (Brest, Quimper, La Rochelle) have several.",
      },
    ],
  },
  {
    title: "Tax and relocation finance",
    emoji: "📑",
    terms: [
      {
        term: "Quotient familial (family tax unit)",
        def: "France's mechanism for calculating income tax based on household composition (1 unit per adult, 0.5 per dependent child, 1 for a third child). Determines the top marginal tax bracket (TMI). Recalculate if a relocation coincides with a change in family situation.",
      },
      {
        term: "TMI (Top marginal tax rate)",
        def: "The income tax rate applied to the last tax bracket. 2025 bands: 0%, 11%, 30%, 41%, 45%. Determines the real tax cost of a buy-to-let investment (rental income adds to total household income).",
      },
      {
        term: "Social contributions (prélèvements sociaux)",
        def: "17.2% on capital income (rents, property gains, dividends). Added on top of income tax. For a 30% TMI investor: combined rate on rental income = 30 + 17.2 = 47.2% on the taxable base.",
      },
      {
        term: "CFE (Business property tax for self-employed)",
        def: "Local tax paid by freelancers/sole traders registered at their home address. Varies widely by commune (~€200/year in Marseille, up to ~€600/year in Paris). Factor in when freelancers move city.",
      },
      {
        term: "IFI (Property wealth tax)",
        def: "Replaced the ISF in 2018. Only targets net property assets > €1.3M. Rates 0.5%–1.5%. Relevant to multi-property investors. Primary residence benefits from a 30% discount.",
      },
      {
        term: "Capital gains tax (plus-value immobilière)",
        def: "Difference between sale price and cost price (+ fees and works). Exempt on primary residence. On a secondary residence or investment property: 19% income tax + 17.2% social contributions = 36.2%, with progressive tapering (full income-tax exemption after 22 years' ownership, full social-contributions exemption after 30 years).",
      },
    ],
  },
];

const TERM_COUNT = SECTIONS.reduce((n, s) => n + s.terms.length, 0);

export default function EnGlossaryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "French property and relocation glossary · BestCitiesInFrance",
    description:
      "Key terms for buying, renting, investing or relocating in France: DPE, LMNP, ZFE, taxe foncière, FTTH fibre, rent control and more.",
    hasDefinedTerm: SECTIONS.flatMap((s) =>
      s.terms.map((t) => ({
        "@type": "DefinedTerm",
        name: t.term,
        description: t.def,
        inDefinedTermSet: "BestCitiesInFrance Glossary",
      }))
    ),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            {" / "}
            <Link href="/tools" className="hover:underline">Tools</Link>
            {" / "}
            <span>Glossary</span>
          </nav>
          <Badge variant="accent" className="mb-3">Glossary</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            French property &amp; relocation glossary
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {TERM_COUNT} key terms for understanding French property, rental law, investment
            and relocation in 2026. No unnecessary jargon — just the definitions you need
            before signing anything.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        {/* Table of contents */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">
            Sections
          </p>
          <ol className="space-y-2">
            {SECTIONS.map((s, i) => (
              <li key={i}>
                <a
                  href={`#section-${i}`}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"
                >
                  <span className="text-xl">{s.emoji}</span>
                  {s.title}{" "}
                  <span className="text-[var(--text-tertiary)]">({s.terms.length})</span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        {SECTIONS.map((section, i) => (
          <section key={i} id={`section-${i}`} className="mb-12 scroll-mt-20">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">{section.emoji}</span>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{section.title}</h2>
            </div>
            <dl className="space-y-5">
              {section.terms.map((t, j) => (
                <div
                  key={j}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
                >
                  <dt className="font-semibold text-[var(--text-primary)] mb-2">{t.term}</dt>
                  <dd className="text-sm text-[var(--text-secondary)] leading-relaxed">{t.def}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <Footer />
    </main>
  );
}
