import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `${c.name} cost of living — rent, property, monthly budget (2026)`,
    description: `What it actually costs to live in ${c.name} in 2026: rent for a T2, property prices per m², and a realistic monthly budget.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/cost-of-living` },
  };
}

function costVerdict(score: number): string {
  if (score >= 8) return "Very affordable for France. Your salary goes a long way.";
  if (score >= 7) return "Affordable. Below national-average pressure on rent and prices.";
  if (score >= 6) return "Moderate. Roughly aligned with the national median.";
  if (score >= 5) return "Above average. Budget carefully — rent will be a significant slice.";
  if (score >= 4) return "Expensive. Among the pricier cities in France.";
  return "Very expensive. Plan for Paris-tier rent and consumer prices.";
}

export default async function EnCityCost({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const housing = getHousing(c.slug);
  const score = c.scores.cost;

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{c.name}</Link>
          {" · "}
          <span>Cost of living</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>💶</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Cost of living in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Cost score: <span className={`font-mono-data font-bold ${scoreColor(score)}`}>{score.toFixed(1)}/10</span>. {costVerdict(score)}
        </p>
      </section>

      {housing && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">T1 rent / month</p>
            <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)]">€{housing.avgRentT1}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">T2 rent / month</p>
            <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)]">€{housing.avgRentT2}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Buy price / m²</p>
            <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)]">€{housing.avgBuyPriceM2}</p>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">A realistic monthly budget</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
          For a single professional in {c.name}, a reasonable monthly outline:
        </p>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· Rent (T2): {housing ? `€${housing.avgRentT2}` : "see local listings"}</li>
          <li>· Utilities, internet, phone: €120–180</li>
          <li>· Groceries: €300–450</li>
          <li>· Transport: €50–80 (monthly pass) — or €150+ with a car</li>
          <li>· Going out, leisure: €150–400 depending on lifestyle</li>
        </ul>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">
          Property prices source: DVF (data.gouv.fr) — real recorded transactions. Rents: Observatoires Locaux des Loyers + market estimates.
        </p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Property tax (taxe foncière)</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
          If you buy, you'll pay an annual taxe foncière based on the local rate × the cadastral value. Rates vary widely between communes. The FR site has a per-department fiscality estimator.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/budget" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Most affordable</Link>
          <Link href="/rankings/logement" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Housing affordability</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
