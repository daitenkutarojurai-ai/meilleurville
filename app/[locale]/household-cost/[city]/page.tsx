import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CityProfileCta } from "@/components/CityProfileCta";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  HOUSEHOLD_PROFILES,
  householdBreakdownsAllProfiles,
  type HouseholdProfile,
} from "@/lib/household-cost";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; city: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const c = CITIES_SEED.find((x) => x.slug === city);
  if (!c) return {};
  return {
    title: `Cost of living in ${c.name} by household type 2026 · Solo, couple, family, retired`,
    description: `Real monthly fixed costs in ${c.name} for 4 household types: single (studio), couple (1-bed), family with 2 children (2-bed), retired. Rent, heating, mobility, taxes — honest medians.`,
    alternates: { canonical: `${EN_BASE}/household-cost/${city}` },
  };
}

const EN_PROFILES: Record<HouseholdProfile, { label: string; tagline: string; surface: string }> = {
  solo: { label: "Single", tagline: "Young professional, studio, transit-first", surface: "Studio (~25 m²)" },
  couple: { label: "Couple", tagline: "1-bed, the site's reference baseline", surface: "1-bed (~45 m²)" },
  famille: { label: "Family (2 kids)", tagline: "2-bed, car near-essential, school costs", surface: "2-bed (~70 m²)" },
  retraite: { label: "Retired", tagline: "1-bed, home all day (+heating), no commute", surface: "1-bed (~45 m²)" },
};

function Row({ label, values, highlight = false }: { label: string; values: (number | null)[]; highlight?: boolean }) {
  return (
    <tr className={`${highlight ? "bg-[var(--bg-surface)] font-semibold" : "border-b border-[var(--border)]"}`}>
      <td className="px-3 py-2 text-sm text-[var(--text-primary)]">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-3 py-2 text-right text-sm tabular-nums">
          {v != null ? `€${v.toLocaleString("en-GB")}` : "—"}
        </td>
      ))}
    </tr>
  );
}

export default async function EnHouseholdCostCityPage({ params }: Props) {
  const { city } = await params;
  const c = CITIES_SEED.find((x) => x.slug === city);
  if (!c) notFound();

  const breakdowns = householdBreakdownsAllProfiles(city);
  const order: HouseholdProfile[] = ["solo", "couple", "famille", "retraite"];
  const byKey = new Map(breakdowns.map((b) => [b.profile, b]));
  const cols = order.map((k) => byKey.get(k)!);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Household cost", path: "/household-cost" },
    { name: c.name, path: `/household-cost/${c.slug}` },
  ]);

  const totals = cols.map((col) => col.total).filter((v): v is number => v != null);
  const cheapest = totals.length ? Math.min(...totals) : null;
  const priciest = totals.length ? Math.max(...totals) : null;

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link> ·{" "}
          <Link href="/household-cost" className="hover:underline">Household cost</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Cost of living in {c.name} by household type
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Monthly fixed costs in {c.name} for 4 household types: single, couple, family with
          2 children, retired. Medians derived from rent observatories, ADEME (climate zone),
          France Assureurs, and DGFiP. Indicative — your situation may vary.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Badge>{HOUSEHOLD_PROFILES.length} profiles</Badge>
          <Badge>DGFiP + ADEME medians</Badge>
          {cheapest != null && priciest != null && (
            <Badge>
              Single ↔ family gap: €{(priciest - cheapest).toLocaleString("en-GB")}/month
            </Badge>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {order.map((key, i) => {
            const b = cols[i];
            const en = EN_PROFILES[key];
            const isCheapest = b.total != null && b.total === cheapest;
            const isPriciest = b.total != null && b.total === priciest;
            return (
              <Card key={key} className="p-4">
                <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">{en.surface}</div>
                <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{en.label}</div>
                <div className="mt-1 text-xs text-[var(--text-tertiary)]">{en.tagline}</div>
                <div className="mt-3 text-xl font-bold tabular-nums">
                  {b.total != null ? `€${b.total.toLocaleString("en-GB")}` : "—"}
                  <span className="text-xs font-normal text-[var(--text-tertiary)]">/month</span>
                </div>
                {isCheapest && totals.length > 1 && (
                  <div className="mt-1 text-xs text-emerald-700 font-semibold">Cheapest</div>
                )}
                {isPriciest && totals.length > 1 && (
                  <div className="mt-1 text-xs text-red-700 font-semibold">Most expensive</div>
                )}
              </Card>
            );
          })}
        </div>

        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Breakdown by item</h2>
        <Card className="mt-3 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-[var(--bg-surface)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  {order.map((key) => (
                    <th key={key} className="px-3 py-2 text-right">{EN_PROFILES[key].label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="Rent" values={cols.map((col) => col.rent)} />
                <Row label="Heating" values={cols.map((col) => col.heating)} />
                <Row label="Mobility" values={cols.map((col) => col.mobility)} />
                <Row label="Property tax" values={cols.map((col) => col.taxeFonciere)} />
                <Row label="Waste tax (TEOM)" values={cols.map((col) => col.teom)} />
                <Row label="School extras" values={cols.map((col) => col.schoolExtra || null)} />
                <Row label="Monthly total" values={cols.map((col) => col.total)} highlight />
              </tbody>
            </table>
          </div>
        </Card>

        <p className="mt-3 text-xs text-[var(--text-tertiary)]">
          Assumptions: <strong>Single</strong> = studio, transit preferred where available.{" "}
          <strong>Couple</strong> = 1-bed, default mobility. <strong>Family</strong> = 2-bed, car
          (school run) + ~€150/month school extras (canteen, supplies, activities).{" "}
          <strong>Retired</strong> = 1-bed, no commute fuel, heating +10% (home all day). Groceries
          not included — they vary little geographically and depend on individual habits.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Go further</h2>
        <div className="mt-3">
          <CityProfileCta
            city={c}
            locale="en"
            blurb={`Global score, neighbourhoods, climate, and all costs in detail for ${c.name}.`}
          />
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/calculator/real-cost/${c.slug}`} className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Interactive calculator</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Enter your salary</div>
            </Card>
          </Link>
          <Link href="/simulator/purchase" className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Purchase simulator</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Where to buy on your budget</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
