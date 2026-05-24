import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { fiscalityForCity } from "@/lib/fiscalite";
import { rentalTension, tensionInfo } from "@/lib/rental-tension";
import { internetScore, internetLabel } from "@/lib/internet-score";
import { faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { Home, Wifi, FileText, MapPin, ChevronRight, AlertCircle } from "lucide-react";

const EN_BASE = ORIGIN_BY_LOCALE.en;

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
  const housing = getHousing(slug);
  return {
    title: `Getting settled in ${city.name} — housing, internet, admin 2026 | BestCitiesInFrance`,
    description: `Practical guide to moving to ${city.name}: rent levels (${housing ? `T2 ${housing.avgRentT2} €/month` : "estimated"}), rental market tension, broadband, taxes, and admin steps.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/get-settled` },
    openGraph: {
      title: `Getting settled in ${city.name} — practical guide 2026`,
      description: `Rents, broadband, property tax, and the five admin steps you need on arrival in ${city.name}.`,
    },
  };
}

export default async function GetSettledPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const housing = getHousing(slug);
  const fisc = fiscalityForCity({ department: city.department, region: city.region });
  const tension = rentalTension(city);
  const tensionMeta = tensionInfo(tension);
  const internet = internetScore(city);
  const internetMeta = internetLabel(internet);

  const faq = faqJsonLd([
    {
      q: `How much does a flat cost to rent in ${city.name}?`,
      a: housing
        ? `In ${city.name}, a studio (T1) is roughly ${housing.avgRentT1} €/month, a one-bedroom (T2) around ${housing.avgRentT2} €/month and a two-bedroom (T3) around ${housing.avgRentT3} €/month. The average purchase price is ${housing.avgBuyPriceM2} €/m².`
        : `Individualised rent data is not available for ${city.name}. Use regional averages for ${city.region} as a reference, or check local letting agents.`,
    },
    {
      q: `Is it hard to find a flat in ${city.name}?`,
      a: `The rental market in ${city.name} is rated "${tensionMeta.label.toLowerCase()}" (score ${tension.toFixed(1)}/10 — 10 = very tight). ${tension >= 7 ? "Demand is strong: budget several weeks of searching and prepare a solid dossier (3 pay slips, last tax notice, guarantor or Visale guarantee)." : tension >= 4 ? "The market is balanced — a complete application should land a flat within a few weeks." : "The market is relaxed: plenty of stock and short lead times."}`,
    },
    {
      q: `Is fibre broadband available in ${city.name}?`,
      a: `Internet quality in ${city.name} is rated "${internetMeta.label}" (${internet.toFixed(1)}/10). ${internet >= 8 ? "FTTH fibre is generally well deployed across the town." : internet >= 6 ? "Fibre is available in most central neighbourhoods — check availability at your exact address on telecom.gouv.fr." : "Fibre coverage may be partial. Always verify at your exact address before signing a lease, especially if you work remotely."}`,
    },
    {
      q: `What administrative steps are needed when moving to ${city.name}?`,
      a: `On arrival in ${city.name}: (1) update your address on service-public.fr — it cascades automatically to CAF, CPAM, tax authority, and La Poste; (2) register on the electoral roll at the town hall before 31 December if you want to vote the following year; (3) transfer your health-insurance file to the CPAM of ${city.department}; (4) update energy and broadband contracts at least 30 days before moving in; (5) take out home insurance — mandatory for tenants.`,
    },
  ]);

  const housingRows: { label: string; value: string }[] = housing
    ? [
        { label: "Studio / T1", value: `${housing.avgRentT1} €/month` },
        { label: "1-bed / T2", value: `${housing.avgRentT2} €/month` },
        { label: "2-bed / T3", value: `${housing.avgRentT3} €/month` },
        { label: "Average buy price", value: `${housing.avgBuyPriceM2} €/m²` },
      ]
    : [];

  const adminSteps = [
    {
      num: "1",
      title: "Change of address",
      body: `Report your new address at service-public.fr/particuliers/vosdroits/N31. The platform automatically notifies CAF, CPAM, the tax authority, and La Poste (if you activate mail forwarding).`,
      href: "https://www.service-public.fr/particuliers/vosdroits/N31",
    },
    {
      num: "2",
      title: "Electoral roll registration",
      body: `If you move before 31 December, register at the ${city.name} town hall or on mon.service-public.fr before that date to be able to vote the following year.`,
      href: "https://www.service-public.fr/particuliers/vosdroits/F1970",
    },
    {
      num: "3",
      title: "Health insurance (CPAM) update",
      body: `Notify your change of department to the CPAM of ${city.department ?? city.region} (ameli.fr). If you move to a new department, you may also need to declare a new GP (médecin traitant).`,
      href: "https://www.ameli.fr",
    },
    {
      num: "4",
      title: "Energy & broadband contracts",
      body: `Cancel or transfer your electricity/gas and internet contracts. Give your providers at least 30 days' notice before moving in to avoid cut-offs.`,
      href: "https://www.service-public.fr/particuliers/vosdroits/F31",
    },
    {
      num: "5",
      title: "Home insurance",
      body: `Mandatory for tenants, strongly advised for owners. Compare via your bank or an aggregator. Have your certificate ready on lease-signing day.`,
      href: "https://www.service-public.fr/particuliers/vosdroits/F1350",
    },
  ];

  const relatedPages = [
    { href: `/cities/${city.slug}/cost-of-living`, emoji: "💸", label: "Cost of living", sub: "Rents, buying price, budget" },
    { href: `/cities/${city.slug}/tax`, emoji: "💰", label: "Property tax", sub: "Taxe foncière, DMTO" },
    { href: `/cities/${city.slug}/remote-work`, emoji: "💻", label: "Remote work", sub: "Fibre, coworking" },
    { href: `/cities/${city.slug}/transport`, emoji: "🚊", label: "Transport", sub: "Public transit, TGV" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />

        {/* Hero */}
        <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <nav className="text-xs text-[var(--text-tertiary)] mb-4">
              <Link href="/" className="hover:underline">Home</Link>
              {" / "}
              <Link href="/cities" className="hover:underline">Cities</Link>
              {" / "}
              <Link href={`/cities/${city.slug}`} className="hover:underline">{city.name}</Link>
              {" / "}
              <span>Get settled</span>
            </nav>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="h-6 w-6 text-[var(--accent)] shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Getting settled in {city.name}
              </h1>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Rents, broadband quality, local taxes and the five admin steps you need when
              moving to {city.name} ({city.department}).
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-10">

          {/* Housing */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Housing market</h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Rental market tension</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Difficulty finding a flat</div>
                </div>
                <span className={`text-sm font-bold ${tensionMeta.color}`}>
                  {tensionMeta.label} ({tension.toFixed(1)}/10)
                </span>
              </div>

              {housing ? (
                housingRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] last:border-0">
                    <span className="text-sm text-[var(--text-secondary)]">{row.label}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{row.value}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3 px-5 py-4 text-sm text-[var(--text-secondary)]">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    Individual rent data not available for {city.name}. Check local letting
                    agents or Se Loger / PAP for current listings.
                  </span>
                </div>
              )}
            </div>

            {tension >= 7 && (
              <div className="mt-3 flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>
                  Tight market: allow several weeks for your search. Prepare a complete dossier
                  (3 recent pay slips, tax notice, Visale guarantee or guarantor) — landlords
                  can be selective.
                </span>
              </div>
            )}

            <p className="mt-3 text-xs text-[var(--text-tertiary)]">
              Estimated from Clameur / regional rent observatories. Actual rents vary by
              neighbourhood, condition, and exact floor area.
            </p>
          </section>

          {/* Broadband */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Broadband & connectivity</h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Estimated quality</span>
                <span className={`text-sm font-bold ${internetMeta.color}`}>
                  {internetMeta.label} ({internet.toFixed(1)}/10)
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {internet >= 8
                  ? `FTTH fibre broadband is generally well deployed in ${city.name} and nearby communes. Speeds are more than sufficient for remote work and 4K streaming.`
                  : internet >= 6
                  ? `Fibre is available in most of ${city.name}'s central neighbourhoods. Peripheral zones may still be on VDSL or wireless superfast — check at your exact address on telecom.gouv.fr.`
                  : `Fibre coverage may be partial in ${city.name}. Always verify at your exact address before signing a lease, particularly if remote working is essential.`}
              </p>
              <a
                href="https://www.telecom.gouv.fr/fibre-optique/ma-connexion-internet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
              >
                Check availability at my address (telecom.gouv.fr)
                <ChevronRight className="h-3 w-3" />
              </a>
            </div>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Estimated from ARCEP fibre coverage data (Q4 2024) + remote-work score proxy.
            </p>
          </section>

          {/* Local taxes */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Local taxes — snapshot</h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Overall level</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Department {city.department}</div>
                </div>
                <span className="text-sm font-bold text-[var(--text-primary)]">{fisc.tierLabel}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Est. property tax (T3 flat)</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{fisc.taxeFonciereT3}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Transfer duties (DMTO)</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{fisc.dmtoDroitsPercent.toFixed(2)} %</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-[var(--text-secondary)]">Rent-control zone</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {fisc.zoneTendue ? "Yes — rent increases may be capped" : "No"}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-[var(--text-tertiary)]">
                Departmental estimate (DGFiP). Indicative values only.
              </p>
              <Link
                href={`/cities/${city.slug}/tax`}
                className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                Full tax breakdown <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </section>

          {/* Admin steps */}
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              Admin steps on arrival
            </h2>

            <ol className="space-y-4">
              {adminSteps.map((step) => (
                <li key={step.num} className="flex gap-4">
                  <span className="flex-none w-7 h-7 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-bold flex items-center justify-center mt-0.5">
                    {step.num}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{step.title}</div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.body}</p>
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline mt-1"
                    >
                      service-public.fr <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Related pages */}
          <section>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
              Learn more about {city.name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedPages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {p.emoji} {p.label}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{p.sub}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </section>

          <div className="text-center py-6">
            <Link
              href={`/cities/${city.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              ← Back to {city.name} full profile
            </Link>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
