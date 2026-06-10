import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { VERDICT_META, REF_SURFACE_M2, type RentVsBuyVerdict } from "@/lib/rent-vs-buy";
import { buildRentVsBuy } from "@/lib/rent-vs-buy-rankings";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

// English verdict copy for the French RentVsBuyVerdict enum. The CSS `tone`
// classes are reused from the shared VERDICT_META.
const VERDICT_EN: Record<RentVsBuyVerdict, { label: string; advice: string }> = {
  "fortement-acheteur": {
    label: "Strongly buy",
    advice: "The price-to-rent ratio is very low: buying pays for itself in under 13 years of rent. Worth it even for a 5-7 year stay.",
  },
  acheteur: {
    label: "Buy",
    advice: "Buying stays advantageous as long as you stay at least 6-8 years. The market offers a healthy price-to-rent balance.",
  },
  equilibre: {
    label: "Balanced",
    advice: "Buying and renting roughly even out. It comes down to how long you stay: over 10 years favours buying, otherwise rent.",
  },
  locataire: {
    label: "Rent",
    advice: "Purchase prices are high relative to rents. Renting keeps your flexibility without paying the premium.",
  },
  "fortement-locataire": {
    label: "Strongly rent",
    advice: "The price-to-rent ratio is very stretched: buying only breaks even past 30 years of rent. Renting stays rational for most profiles.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const data = buildRentVsBuy(slug);
  return {
    title: data
      ? `Renting vs buying in ${city.name} 2026 — ratio ${data.rentToPriceRatio} (${VERDICT_EN[data.verdict].label})`
      : `Renting vs buying in ${city.name} 2026`,
    description: data
      ? `Should you rent or buy in ${city.name}? Price-to-rent ratio ${data.rentToPriceRatio}, T3 mortgage ${data.monthlyMortgage} €/mo, deposit payback ${data.paybackYears ? data.paybackYears + " years" : "n/a"}. Built on rent/price medians + 2026 lending rates.`
      : `Should you rent or buy in ${city.name}? Rent and price-per-m² data plus a 25-year mortgage simulation.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/own-vs-rent` },
  };
}

function StatRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-[var(--border)]/50 py-2 last:border-0">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <span className={`text-sm font-mono-data font-semibold tabular-nums ${tone ?? "text-[var(--text-primary)]"}`}>{value}</span>
    </div>
  );
}

export default async function EnCityOwnVsRent({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const data = buildRentVsBuy(slug);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{city.name}</Link>
          {" · "}
          <span>Own vs rent</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🏠</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Renting vs buying in {city.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Price-to-rent ratio, a 25-year mortgage simulation, and how long it takes the
          deposit to pay back. All derived from the site&apos;s median T3 rent and
          price-per-m² figures plus January 2026 lending rates.
        </p>
      </section>

      {!data ? (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Not enough rent / price data for <strong>{city.name}</strong> in the housing
              dataset. See the <Link href={`/cities/${slug}`} className="underline">city profile</Link>{" "}
              for the medians we do have.
            </p>
          </div>
        </section>
      ) : (
        <>
          {/* Verdict */}
          <section className="mx-auto max-w-3xl px-4 sm:px-6 py-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Verdict</p>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${VERDICT_META[data.verdict].tone}`}>
                    {VERDICT_EN[data.verdict].label}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Price-to-rent ratio</p>
                  <p className="text-3xl font-bold font-mono-data tabular-nums text-[var(--text-primary)]">
                    {data.rentToPriceRatio}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">years of rent<br />to match the purchase</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {VERDICT_EN[data.verdict].advice}
              </p>
              <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-3 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                <strong className="text-[var(--text-primary)]">How to read this ratio:</strong> it shows how many years of rent
                it would take to equal the purchase price. <strong>&lt; 15 years: buying strongly favoured</strong>,
                15-20: standard balance, 20-25: renting is often smarter,
                <strong> &gt; 25 years: a stretched market where buying rarely wins</strong>.
              </div>
            </div>
          </section>

          {/* Raw figures */}
          <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">The numbers</h2>
            <p className="text-xs text-[var(--text-tertiary)] mb-3">
              Reference surface: median T3 of {REF_SURFACE_M2} m². Rent and price-per-m²
              medians from French rent observatories and DVF transaction data.
            </p>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <StatRow label="T3 purchase price" value={`€${data.priceT3.toLocaleString("en-GB")}`} />
              <StatRow label="Annual T3 rent" value={`€${data.rentT3Annual.toLocaleString("en-GB")}`} />
              <StatRow label="Deposit (10%)" value={`€${data.apport.toLocaleString("en-GB")}`} />
              <StatRow label="Notary fees (7.5%)" value={`€${data.notaryFees.toLocaleString("en-GB")}`} />
              <StatRow label="Cash needed up front" value={`€${data.totalCashIn.toLocaleString("en-GB")}`} />
            </div>
          </section>

          {/* Monthly comparison */}
          <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Monthly comparison</h2>
            <p className="text-xs text-[var(--text-tertiary)] mb-3">
              25-year repayment mortgage at 3.4% APR (median French bank rates, January 2026).
              Owner costs = 1.2% of the price per year (property tax, upkeep, landlord insurance).
            </p>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <StatRow label="Mortgage payment" value={`€${data.monthlyMortgage.toLocaleString("en-GB")}/mo`} />
              <StatRow label="+ Owner costs" value={`€${data.monthlyOwnerCharges.toLocaleString("en-GB")}/mo`} />
              <StatRow label="= Total owner cost" value={`€${(data.monthlyMortgage + data.monthlyOwnerCharges).toLocaleString("en-GB")}/mo`} />
              <StatRow label="T3 rent (as a tenant)" value={`€${Math.round(data.rentT3Annual / 12).toLocaleString("en-GB")}/mo`} />
              <StatRow
                label="Gap"
                value={`${data.monthlySavingsVsRent > 0 ? "−" : "+"}€${Math.abs(Math.round(data.monthlySavingsVsRent))}/mo`}
                tone={data.monthlySavingsVsRent > 0 ? "text-emerald-700" : "text-red-700"}
              />
            </div>
          </section>

          {/* Payback */}
          <section className="mx-auto max-w-3xl px-4 sm:px-6 py-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Deposit payback</p>
              {data.paybackYears != null ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  With €{data.totalCashIn.toLocaleString("en-GB")} of cash tied up (deposit + notary fees) and a rent
                  saving of <strong className="text-[var(--text-primary)]">€{Math.round(data.monthlySavingsVsRent)}/mo</strong>,
                  you recover your stake in <strong className="text-[var(--text-primary)]">{data.paybackYears} years</strong>
                  {" "}— beyond that point, owning is a net gain.
                </p>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">
                  The monthly owner cost (mortgage + charges) exceeds the T3 rent, so the deposit never pays
                  back through rent savings alone. Buying here is only justified by resale capital gains,
                  which fall outside our scope — see the <Link href="/methodology" className="underline">methodology</Link>.
                </p>
              )}
            </div>
          </section>
        </>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <p className="text-xs text-[var(--text-tertiary)] mb-5">
          Estimate — based on median rent / price figures and January 2026 bank rates. Your
          real situation may differ (larger deposit, negotiated rate, agency fees, tax schemes).
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {city.name}</Link>
          <Link href={`/cities/${slug}/cost-of-living`} className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Cost of living</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
