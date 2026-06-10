import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VERDICT_META, type RentVsBuyVerdict } from "@/lib/rent-vs-buy";
import { buildAllRentVsBuy } from "@/lib/rent-vs-buy-rankings";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "Rent or buy in France 2026 · Price-to-rent ratio by city",
  description:
    "Ranking of French cities by price-to-rent ratio (PER). Cities where buying pays off quickly vs where renting stays rational. 2026 medians + benchmarks.",
  alternates: { canonical: `${EN_BASE}/own-vs-rent` },
  openGraph: {
    title: "Rent or buy in France 2026 · Price-to-rent ratio by city",
    description:
      "Ranking of French cities by price-to-rent ratio (PER). Cities where buying pays off quickly vs where renting stays rational. 2026 medians + benchmarks.",
  },
};

const EN_VERDICT: Record<RentVsBuyVerdict, string> = {
  "fortement-acheteur": "Strong buy",
  acheteur: "Buy",
  equilibre: "Balanced",
  locataire: "Rent",
  "fortement-locataire": "Strong rent",
};

export default function OwnVsRentIndexPage() {
  const all = buildAllRentVsBuy().sort((a, b) => a.rentToPriceRatio - b.rentToPriceRatio);
  const topBuy = all.slice(0, 15);
  const topRent = all.slice(-15).reverse();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Rent or buy", path: "/own-vs-rent" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Rent or buy in France?
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          {all.length} cities ranked by price-to-rent ratio. The lower the ratio, the faster buying pays
          off vs renting. The verdict combines the ratio + a 25-year loan simulation at 3.4% APR
          (median Jan 2026). T3 ≈ 65 m² median.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Badge>{all.length} cities</Badge>
          <Badge>DVF + rent observatory medians</Badge>
          <Badge>2026 benchmarks</Badge>
        </div>

        {/* Top 15 — buying pays off fastest */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Top 15 — Buying pays off fastest
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">Sorted by price-to-rent ratio (ascending).</p>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-surface)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              <tr>
                <th className="px-3 py-2 text-left w-12">#</th>
                <th className="px-3 py-2 text-left">City</th>
                <th className="px-3 py-2 text-right">Ratio</th>
                <th className="px-3 py-2 text-right hidden sm:table-cell">T3 price</th>
                <th className="px-3 py-2 text-right hidden sm:table-cell">T3 rent</th>
                <th className="px-3 py-2 text-right hidden md:table-cell">Payback</th>
              </tr>
            </thead>
            <tbody>
              {topBuy.map((r, i) => (
                <tr key={r.citySlug} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]">
                  <td className="px-3 py-2 text-sm tabular-nums text-[var(--text-tertiary)]">{i + 1}</td>
                  <td className="px-3 py-2 text-sm">
                    <Link
                      href={`/cities/${r.citySlug}/own-vs-rent`}
                      className="text-[var(--text-primary)] font-medium hover:underline"
                    >
                      {r.cityName}
                    </Link>
                    <span
                      className={`ml-2 inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] uppercase tracking-wider ${VERDICT_META[r.verdict].tone}`}
                    >
                      {EN_VERDICT[r.verdict] ?? VERDICT_META[r.verdict].label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums font-semibold text-[var(--text-primary)]">
                    {r.rentToPriceRatio}
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                    €{r.priceT3.toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                    €{Math.round(r.rentT3Annual / 12).toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                    {r.paybackYears != null ? `${r.paybackYears} years` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mt-2 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Ratio reading</strong> = years of rent to
          equal purchase price. &lt; 13: buying strongly wins · 13-18: buying favourable · 18-24:
          balanced · 24-30: renting smarter · &gt; 30: tight market.
        </p>

        {/* Top 15 — renting stays rational */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Top 15 — Renting stays rational
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">
          Sorted by price-to-rent ratio (descending). Buying is expensive relative to rents — rental
          flexibility is preferable.
        </p>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-surface)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              <tr>
                <th className="px-3 py-2 text-left w-12">#</th>
                <th className="px-3 py-2 text-left">City</th>
                <th className="px-3 py-2 text-right">Ratio</th>
                <th className="px-3 py-2 text-right hidden sm:table-cell">T3 price</th>
                <th className="px-3 py-2 text-right hidden sm:table-cell">T3 rent</th>
                <th className="px-3 py-2 text-right hidden md:table-cell">Monthly gap</th>
              </tr>
            </thead>
            <tbody>
              {topRent.map((r, i) => (
                <tr key={r.citySlug} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]">
                  <td className="px-3 py-2 text-sm tabular-nums text-[var(--text-tertiary)]">{i + 1}</td>
                  <td className="px-3 py-2 text-sm">
                    <Link
                      href={`/cities/${r.citySlug}/own-vs-rent`}
                      className="text-[var(--text-primary)] font-medium hover:underline"
                    >
                      {r.cityName}
                    </Link>
                    <span
                      className={`ml-2 inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] uppercase tracking-wider ${VERDICT_META[r.verdict].tone}`}
                    >
                      {EN_VERDICT[r.verdict] ?? VERDICT_META[r.verdict].label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums font-semibold text-[var(--text-primary)]">
                    {r.rentToPriceRatio}
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                    €{r.priceT3.toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                    €{Math.round(r.rentT3Annual / 12).toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums hidden md:table-cell">
                    <span className={r.monthlySavingsVsRent > 0 ? "text-emerald-700" : "text-red-700"}>
                      {r.monthlySavingsVsRent > 0 ? "−" : "+"}€{Math.abs(Math.round(r.monthlySavingsVsRent)).toLocaleString("en-GB")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mt-2 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Ratio reading</strong> = years of rent to
          equal purchase price. &lt; 13: buying strongly wins · 13-18: buying favourable · 18-24:
          balanced · 24-30: renting smarter · &gt; 30: tight market.
        </p>

        <div className="mt-10 text-xs text-[var(--text-tertiary)]">
          URL{" "}
          <code className="px-1 py-0.5 bg-[var(--bg-elevated)] rounded-full">
            /cities/&lt;city-slug&gt;/own-vs-rent
          </code>{" "}
          works for all cities covered by HOUSING (T3 rent + price/m² available).
        </div>
      </section>

      <Footer />
    </main>
  );
}
