import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { fiscalityForCity, TIER_TONE, type FiscaliteTier } from "@/lib/fiscalite";
import { faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { Coins, AlertTriangle, Home as HomeIcon, FileText, Info } from "lucide-react";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

// Property-tax "state" — the FiscaliteTier enum, with the "particulier" tier
// split into the two real cases (Paris / overseas) for native-EN copy.
type FiscState = Exclude<FiscaliteTier, "particulier"> | "paris" | "drom";

const FISC_EN: Record<FiscState, { label: string; taxeFonciere: string; notes: string }> = {
  faible: {
    label: "Low tax pressure",
    taxeFonciere: "€550-900/year",
    notes: "Relatively low tax pressure. The municipal property-tax rate is historically moderate and the cadastral rental base is typically low.",
  },
  moderee: {
    label: "Moderate tax pressure",
    taxeFonciere: "€900-1,300/year",
    notes: "A department around the national average. The municipal property tax varies by commune (roughly ±30% around the department average).",
  },
  elevee: {
    label: "High tax pressure",
    taxeFonciere: "€1,300-1,800/year",
    notes: "High tax pressure — housing costs and urban services push rates up. Always check the property tax on the seller's latest assessment notice.",
  },
  "tres-elevee": {
    label: "Very high tax pressure",
    taxeFonciere: "€1,700-2,400/year",
    notes: "Among the heaviest tax pressure in France. Always verify the property tax and any second-home surcharge before buying — it can add €100-200/month to a budget or eat into rental yield.",
  },
  paris: {
    label: "Special case — Paris",
    taxeFonciere: "€1,100-1,600/year",
    notes: "Paris has historically had one of the lowest municipal property-tax rates (~13.5% in 2024 after reform) but very high cadastral bases. The second-home tax surcharge can reach +60% since 2023 (Paris is a 'zone tendue').",
  },
  drom: {
    label: "Special case — overseas France",
    taxeFonciere: "€700-1,400/year",
    notes: "A specific overseas tax regime: reduced transfer duties (4.50% instead of 5.81% elsewhere), some partial exemptions, but highly variable municipal levies. Always confirm with a local notary.",
  },
};

const DROM_REGIONS = new Set(["Martinique", "Guadeloupe", "La Réunion", "Mayotte", "Guyane"]);

function stateFor(city: (typeof CITIES_SEED)[number]): FiscState {
  if (DROM_REGIONS.has(city.region)) return "drom";
  if (city.department === "Paris") return "paris";
  const f = fiscalityForCity({ department: city.department, region: city.region });
  return f.tier === "particulier" ? "moderee" : f.tier;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const en = FISC_EN[stateFor(city)];
  return {
    title: `Property tax in ${city.name} — taxe foncière, second-home tax, transfer duties (2026)`,
    description: `Department-level 2026 estimate for ${city.name} (${city.department}): annual property tax (${en.taxeFonciere}), second-home tax, transfer duties. Based on DGFiP data.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/tax` },
  };
}

export default async function EnCityTax({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const f = fiscalityForCity({ department: city.department, region: city.region });
  const state = stateFor(city);
  const en = FISC_EN[state];
  const tone = TIER_TONE[f.tier];

  const dmtoTotal = (f.dmtoDroitsPercent + 1.5).toFixed(1);
  const dmtoExample = Math.round((280_000 * (f.dmtoDroitsPercent + 1.5)) / 100);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
      { "@type": "ListItem", position: 2, name: "Cities", item: `${EN_BASE}/cities` },
      { "@type": "ListItem", position: 3, name: city.name, item: `${EN_BASE}/cities/${slug}` },
      { "@type": "ListItem", position: 4, name: "Property tax", item: `${EN_BASE}/cities/${slug}/tax` },
    ],
  };

  const faq = faqJsonLd([
    {
      q: `How much is property tax in ${city.name}?`,
      a: `Department-level 2026 estimate for an older T3 (2-bed) flat in ${city.name} (${city.department}): ${en.taxeFonciere}. The exact figure depends on the municipal rate voted each year and the property's cadastral rental base — check the seller's latest taxe foncière notice. ${en.label}.`,
    },
    {
      q: `Is ${city.name} in a "zone tendue" for the second-home tax?`,
      a: f.zoneTendue
        ? `${city.department} contains communes classified as "zone tendue" (decree 2023-822). Those communes may apply a second-home tax surcharge of +5% to +60%. Confirm ${city.name}'s exact status on service-public.fr before buying.`
        : `${city.department} has no commune classified as "zone tendue" to date. The second-home tax in ${city.name} is applied at the standard rate, with no surcharge.`,
    },
    {
      q: `What are the closing costs when buying in ${city.name}?`,
      a: `For a resale (older) property in ${city.name}, budget roughly ${dmtoTotal}% of the sale price in transfer duties (DMTO) plus notary fees. On a €280,000 purchase that is about €${dmtoExample.toLocaleString("en-GB")}. New-build (VEFA) closing costs are reduced to ~2-3%.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-12 pb-6">
        <nav className="mb-3 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{city.name}</Link>
          {" · "}
          <span>Property tax</span>
        </nav>
        <div className={`inline-flex items-center gap-2 rounded-full border ${tone.border} ${tone.bg} ${tone.text} px-3 py-1 text-xs font-semibold`}>
          <Coins className="h-3.5 w-3.5" />
          {en.label}
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
          Property tax in {city.name}
        </h1>
        <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
          Department-level 2026 estimate ({city.department}). Annual property tax, the
          second-home tax and the transfer duties to budget for before buying.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-12">
        {/* Disclaimer first, before any number */}
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--text-primary)] leading-relaxed">
            <strong>Department-level estimate.</strong> The figures below are ranges computed at
            the level of the {city.department} department. The municipal property tax and the
            cadastral rental base vary sharply from one commune to the next (up to ±30%). Always
            verify against the seller&apos;s latest property-tax notice and the notary&apos;s
            estimate before committing.
          </div>
        </div>

        {/* 3 cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <HomeIcon className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Property tax</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)] font-mono-data mb-1">{en.taxeFonciere}</p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Older 2-bed flat. Paid by the owner every year (taxe foncière).
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Second-home tax</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)] font-mono-data mb-1">
              {f.zoneTendue ? "+0 to +60%" : "Standard"}
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Tax on second homes. {f.zoneTendue
                ? `${city.department} has "zone tendue" communes — a surcharge is possible.`
                : "No zone tendue known in this department."}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Transfer duties</span>
            </div>
            <p className="text-xl font-bold text-[var(--text-primary)] font-mono-data mb-1">~{dmtoTotal}%</p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Resale standard. On a €280,000 purchase, budget ~€{dmtoExample.toLocaleString("en-GB")} in closing costs.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">The takeaway for {city.name}</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{en.notes}</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">How property tax is calculated</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              The annual taxe foncière = cadastral rental base (the theoretical gross rental value
              ÷ 2) × (municipal rate + department rate), plus a 3% state management fee. The base is
              revised yearly by the rent index — it rose +7.1% in 2023 and +3.9% in 2024.
            </p>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span><strong>Municipal rate</strong> — voted each year by the town council; ranges from 20% to 60% across communes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span><strong>Department rate</strong> — uniform across {city.department} (between 15% and 25% depending on the department).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span><strong>State management fee</strong> — an extra 3%.</span>
              </li>
            </ul>
            <p className="text-xs text-[var(--text-tertiary)] mt-4">
              Source: DGFiP, Observatoire des Finances Locales 2024, French tax code.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">The second-home tax (THRS)</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Abolished for primary residences since 2023, but kept for second homes. {f.zoneTendue
                ? `${city.department} contains communes classified as "zone tendue" (decree 2023-822) — those communes may apply a +5% to +60% surcharge to discourage vacant or second homes.`
                : `${city.department} has no commune classified as "zone tendue" to date — the tax is applied at the standard rate.`}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Confirm the exact commune&apos;s zone-tendue status on{" "}
              <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F42" target="_blank" rel="noopener" className="text-[var(--accent)] hover:underline">service-public.fr</a>{" "}
              before buying a second home.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Transfer duties (&quot;notary fees&quot;)</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
              Paid when you buy. For a resale property in {city.name}: <strong>~{dmtoTotal}%</strong> of
              the sale price — about <strong>€{dmtoExample.toLocaleString("en-GB")}</strong> on a €280,000 purchase.
            </p>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span><strong>Department duties</strong>: {f.dmtoDroitsPercent.toFixed(2)}%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span><strong>Municipal duty</strong>: 1.20% standard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span><strong>Assessment + notary fees</strong>: ~0.8-1.3%</span>
              </li>
            </ul>
            <p className="text-xs text-[var(--text-tertiary)] mt-4">
              New-build (VEFA): transfer duties drop to ~2-3% instead of ~7-8%. The saving is often
              offset by VAT and a higher purchase price.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6">
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-[var(--accent)]" />
              For a precise estimate
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              This page gives a department-level range. For an estimate at the commune (and street) level:
            </p>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span>Ask the seller for the latest property-tax notice (a mandatory disclosure document).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span>See the <a href="https://www.service-public.gouv.fr/particuliers/vosdroits/F59" target="_blank" rel="noopener" className="text-[var(--accent)] hover:underline">property-tax page on service-public.fr</a>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span>Ask a notary for an itemised quote of the acquisition costs.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">
            Back to {city.name}
          </Link>
          <Link href={`/cities/${slug}/cost-of-living`} className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">
            Cost of living
          </Link>
          <Link href={`/cities/${slug}/own-vs-rent`} className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">
            Renting vs buying
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
