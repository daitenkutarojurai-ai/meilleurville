import type { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { rentalTension, tensionInfo } from "@/lib/rental-tension";
import { getNeighborhoods } from "@/data/neighborhoods";
import { faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternatesEn, ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { Home, TrendingUp, MapPin, AlertCircle, ChevronRight } from "lucide-react";

const EN_BASE = ORIGIN_BY_LOCALE.en;
import { PropertyPriceTable } from "@/components/PropertyPriceTable";
import { cityPropertyPrices } from "@/lib/property-prices";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const h = getHousing(slug);
  const p = cityPropertyPrices(slug);
  // L'ancienne description dépassait 160 caractères sur toutes les villes
  // couvertes : la queue « Clameur 2024 » poussait les prix hors du snippet.
  const measured =
    p?.apartment?.medianM2 && p.house?.medianM2
      ? `Flats €${p.apartment.medianM2.toLocaleString("en-GB")}/m², houses €${p.house.medianM2.toLocaleString("en-GB")}/m² in ${city.name} (${p.years[0]}-${p.years[p.years.length - 1]} sales).`
      : null;
  return {
    title: `Housing in ${city.name} — rents, prices, market tension 2026`,
    description: measured
      ? `${measured} Rents, market tension and buy vs rent.`
      : h
        ? `Studio €${h.avgRentT1}/mo, 1-bed €${h.avgRentT2}/mo in ${city.name}. Market tension, neighbourhood rents, buy vs rent.`
        : `Rental market and housing prices in ${city.name} (${city.department}). Tension score, buy vs rent analysis, neighbourhood breakdown.`,
    alternates: cityAlternatesEn("housing", slug),
  };
}

const NEIGHBOURHOOD_TYPE_EN: Record<string, string> = {
  "centre-ville": "City centre",
  "résidentiel": "Residential",
  "étudiant": "Student",
  "branché": "Trendy",
  "populaire": "Working-class",
  "pavillonnaire": "Suburban",
};

export default async function EnCityHousing({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const h = getHousing(slug);
  const neighborhoods = getNeighborhoods(slug);
  const tension = rentalTension(city);
  const tInfo = tensionInfo(tension);

  const buyRatioYears = h
    ? Math.round((h.avgBuyPriceM2 * 45) / (h.avgRentT2 * 12))
    : null;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
      { "@type": "ListItem", position: 2, name: "Cities", item: `${EN_BASE}/cities` },
      { "@type": "ListItem", position: 3, name: city.name, item: `${EN_BASE}/cities/${slug}` },
      { "@type": "ListItem", position: 4, name: "Housing", item: `${EN_BASE}/cities/${slug}/housing` },
    ],
  };

  const faq = faqJsonLd([
    {
      q: `How much is rent in ${city.name}?`,
      a: h
        ? `In ${city.name}, typical rents are: studio / 1-bed around €${h.avgRentT1}/month, 2-bed around €${h.avgRentT2}/month, 3-bed around €${h.avgRentT3}/month. Source: local rent observatories (Clameur 2024). Actual rents vary by location, size and condition.`
        : `Individualised rent data is not available for ${city.name} in our database. Check current listings on PAP, Leboncoin or SeLoger for live market prices.`,
    },
    {
      q: `Is it hard to find a flat in ${city.name}?`,
      a: `The rental market tension in ${city.name} is ${tension.toFixed(1)}/10 (10 = very competitive). The level is "${tInfo.label}". ${tension >= 7 ? `Good flats go fast — sometimes within hours. Prepare a complete application file in advance (last 3 pay slips, tax notice, ID, bank details and a guarantor if possible).` : tension >= 4 ? `The market is balanced. A solid application file is enough to find a place within a few weeks.` : `The market is relaxed — vacancy is higher and landlords are more open to negotiation.`}`,
    },
    {
      q: `Is it better to buy or rent in ${city.name}?`,
      a: buyRatioYears
        ? `In ${city.name}, you would need roughly ${buyRatioYears} years of equivalent rent to break even on buying a 45 m² 2-bed flat at ${h!.avgBuyPriceM2.toLocaleString("en-GB")} €/m². ${buyRatioYears <= 15 ? `Buying makes sense at medium term.` : buyRatioYears <= 22 ? `Buying is worthwhile if you plan to stay at least 10 years.` : `Renting is often the better financial move in this market over the short and medium term.`} Use the own vs rent page for a full breakdown.`
        : `Compare monthly rent against a mortgage payment using our renting vs buying page.`,
    },
    {
      q: `Which neighbourhoods are cheapest in ${city.name}?`,
      a: neighborhoods.length > 0
        ? `Neighbourhoods with rent data for ${city.name} show 2-bed rents ranging from €${Math.min(...neighborhoods.map((n) => n.avgRentT2))} to €${Math.max(...neighborhoods.map((n) => n.avgRentT2))}/month. ${neighborhoods.slice().sort((a, b) => a.avgRentT2 - b.avgRentT2)[0]?.name} is among the most affordable areas.`
        : `Check the neighbourhoods page for ${city.name} for a zone-by-zone breakdown.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav className="mb-4 text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            {" · "}
            <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
            {" · "}
            <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{city.name}</Link>
            {" · "}
            <span>Housing</span>
          </nav>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl grad-head-0 text-white shadow-[0_10px_24px_-12px_rgba(79,70,229,0.7)]">
              <Home className="h-5 w-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Housing in {city.name}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Rents, purchase prices and rental market tension in {city.name} ({city.department}).
          </p>
        </div>
      </section>

      {/* Rental market + measured prices — indigo band */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-10">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Rental market</h2>

          <div className="rounded-2xl bg-white overflow-hidden shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">Market tension</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">10 = very competitive</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full ${i < Math.round(tension) ? "bg-current" : "bg-[var(--border)]"} ${tInfo.color}`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-bold ${tInfo.color}`}>
                  {tension.toFixed(1)}/10 — {tInfo.shortLabel}
                </span>
              </div>
            </div>

            {h ? (
              <>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--text-secondary)]">Studio / 1-bed</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">€{h.avgRentT1}/month</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--text-secondary)]">2-bed flat</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">€{h.avgRentT2}/month</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--text-secondary)]">3-bed flat</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">€{h.avgRentT3}/month</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-[var(--text-secondary)]">Average purchase price</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">€{h.avgBuyPriceM2.toLocaleString("en-GB")}/m²</span>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3 px-5 py-4 text-sm text-[var(--text-secondary)]">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#DB2777]" />
                <span>
                  No individualised rent data for {city.name}. Check PAP.fr, SeLoger or Leboncoin for current listings.
                </span>
              </div>
            )}
          </div>

          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            Estimates from local rent observatories (Clameur 2024, ANIL).
            Actual rents vary by exact size, condition and neighbourhood.
          </p>
        </div>

        <PropertyPriceTable slug={city.slug} name={city.name} locale="en" />
        </div>
      </section>

      {/* Buy vs rent + neighbourhood rents — sky band */}
      {(buyRatioYears || neighborhoods.length > 0) && (
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-10">
        {buyRatioYears && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-[#4338CA]" />
              <h2 className="text-lg font-bold"><span className="gradient-text">Buy vs rent</span></h2>
            </div>

            <div className="rounded-2xl bg-white px-5 py-5 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--text-secondary)]">Break-even (45 m² 2-bed flat)</span>
                <span className="text-lg font-bold text-[var(--text-primary)]">{buyRatioYears} years</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {buyRatioYears <= 12
                  ? `At ${city.name}, buying pays off relatively quickly. With prices at €${h!.avgBuyPriceM2.toLocaleString("en-GB")}/m², purchasing makes sense if you plan to stay more than 10 years.`
                  : buyRatioYears <= 20
                  ? `The break-even point is around ${buyRatioYears} years. Buying is worth it if you plan to settle long-term in ${city.name}.`
                  : `In ${city.name}, renting is often the better financial choice over the short and medium term — high purchase prices (€${h!.avgBuyPriceM2.toLocaleString("en-GB")}/m²) push the break-even point far out.`}
              </p>
              <Link
                href={`/cities/${slug}/own-vs-rent`}
                className="inline-flex items-center gap-1 mt-4 rounded-full bg-[var(--band-indigo)] px-3 py-1.5 text-xs font-semibold text-[#3730A3] transition-colors hover:bg-[#DCD7FF]"
              >
                Detailed buy vs rent analysis <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {neighborhoods.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-[#4338CA]" />
              <h2 className="text-lg font-bold"><span className="gradient-text">Rents by neighbourhood</span></h2>
            </div>

            <div className="rounded-2xl bg-white overflow-hidden shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
              {neighborhoods
                .slice()
                .sort((a, b) => a.avgRentT2 - b.avgRentT2)
                .map((nb, i, arr) => (
                  <div
                    key={nb.name}
                    className={`flex items-center justify-between px-5 py-3 ${i < arr.length - 1 ? "border-b border-[var(--border)]" : ""}`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">{nb.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        {NEIGHBOURHOOD_TYPE_EN[nb.type] ?? nb.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[var(--text-primary)]">€{nb.avgRentT2}/month</div>
                      <div className="text-xs text-[var(--text-tertiary)]">2-bed</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        </div>
      </section>
      )}

      {/* Tips — pink band */}
      <section className="band band-pink py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-lg font-bold mb-3">
            <span className="gradient-text">Tips for finding a flat in {city.name}</span>
          </h2>
          <div className="rounded-2xl bg-white px-5 py-5 shadow-[0_10px_28px_-18px_rgba(219,39,119,0.55)] space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
            {tension >= 7 ? (
              <>
                <p>
                  <strong className="text-[var(--text-primary)]">Competitive market:</strong> good flats disappear within hours.
                  Set alerts on PAP.fr and Leboncoin and respond immediately.
                </p>
                <p>
                  Prepare your application file before you start viewing: last 3 pay slips, most recent tax notice,
                  ID, bank details and a guarantor or Visale guarantee if possible.
                  An incomplete file is rejected immediately.
                </p>
                <p>
                  Widen your search radius to 5-10 km around the city centre — neighbouring communes often
                  offer the same amenities at 10-15% less.
                </p>
              </>
            ) : tension >= 4 ? (
              <>
                <p>
                  <strong className="text-[var(--text-primary)]">Balanced market:</strong> allow 2-4 weeks to find something.
                  A solid, complete application is enough in most cases.
                </p>
                <p>
                  Check public transport connections from peripheral areas — the rent saving from living
                  slightly further out can easily outweigh the extra commute time.
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong className="text-[var(--text-primary)]">Relaxed market:</strong> you have room to compare options
                  and negotiate — landlords are more flexible when vacancy is higher.
                </p>
                <p>
                  A relaxed rental market can reflect a local economy in transition.
                  Check employment prospects before committing to a purchase.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Go further + feedback — white band */}
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">Go further</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { href: `/cities/${slug}/cost-of-living`, label: "Cost of living", sub: "Full budget breakdown" },
              { href: `/cities/${slug}/own-vs-rent`, label: "Renting vs buying", sub: "Break-even, monthly payments" },
              { href: `/cities/${slug}/tax`, label: "Property tax", sub: "Taxe foncière, transfer duties" },
              { href: `/cities/${slug}/transport`, label: "Transport", sub: "Connections, commute, transit score" },
            ].map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="flex items-center justify-between rounded-2xl bg-[var(--band-indigo)] px-5 py-4 hover:bg-[#DCD7FF] transition-colors group"
              >
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {p.label}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{p.sub}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#4338CA] shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/cities/${slug}`}
            className="rounded-full grad-head-0 px-5 py-2.5 text-white font-semibold hover:opacity-90"
          >
            Back to {city.name}
          </Link>
        </div>

        <FeedbackWidget />
        </div>
      </section>

      <Footer />
    </main>
  );
}
