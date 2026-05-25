import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Clock, Users, TrendingUp, Home } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { rentalTension, tensionInfo, tensionLevel } from "@/lib/rental-tension";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

function deriveMetrics(tension: number) {
  const weeksToFind = Math.max(1, Math.round(tension * 1.3));
  const applicantsPerListing = Math.max(3, Math.round(tension * 2.5));
  const incomeMultiple = Math.min(4.0, Math.round((2.5 + tension * 0.15) * 10) / 10);
  return { weeksToFind, applicantsPerListing, incomeMultiple };
}

const NARRATIVE: Record<
  "tendu" | "modere" | "detente",
  (city: string, weeks: number, applicants: number) => string
> = {
  tendu: (city, weeks, applicants) =>
    `Finding a flat in ${city} requires preparation and speed. With around ${applicants} applications per listing, landlords decide fast — often within 24 hours of posting. Budget at least ${weeks} weeks for a studio or one-bed in a central area. Incomplete dossiers are dismissed immediately.`,
  modere: (city, weeks, applicants) =>
    `The rental market in ${city} is active without being saturated. Listings attract around ${applicants} applicants on average — enough competition to reward a complete dossier, but still manageable. Allow ${weeks} weeks for your search. Avoiding July–September makes things easier.`,
  detente: (city, weeks, applicants) =>
    `${city} has a relatively relaxed rental market. Listings receive around ${applicants} applications on average, and a typical search takes ${weeks} week${weeks > 1 ? "s" : ""}. Landlords often have room to negotiate, especially outside peak student arrival periods.`,
};

const TIPS: Record<"tendu" | "modere" | "detente", string[]> = {
  tendu: [
    "Have your full dossier ready before you start viewing (pay slips, tax notice, guarantor docs).",
    "Aim for an income at least 3-4× the monthly rent — this is a hard filter for many landlords.",
    "Book viewings within hours of a listing appearing, not the next day.",
    "A short, personalised cover letter sets you apart in a pile of identical files.",
    "Start your search 6-8 weeks before your intended move-in date.",
  ],
  modere: [
    "Prepare your dossier before viewings so you can respond immediately if you like a place.",
    "Income ≥ 3× rent is the standard unwritten rule — guarantors help if you fall short.",
    "Avoid August (supply drops) and September (demand spikes at student move-in time).",
    "Check private listings (LeBonCoin, PAP) alongside agency listings for more flexibility.",
  ],
  detente: [
    "Weaker competition means you can negotiate rent reductions or have work done before moving in.",
    "Landlords are more open to recent CDI holders or moderate guarantors.",
    "Visit several properties before committing — the supply is there.",
    "January-February and October-November often offer the best choice.",
  ],
};

const BEST_SEASON: Record<"tendu" | "modere" | "detente", string> = {
  tendu:
    "November–February: lower competition as student season ends. Avoid July–September (peak demand).",
  modere:
    "October–November or February–March: decent supply, fewer competing applicants than at peak.",
  detente:
    "Any period works. End-of-month timing (when leases tend to end) often yields the best selection.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const tension = rentalTension(city);
  const tInfo = tensionInfo(tension);
  return {
    title: `Rental market in ${city.name} 2026 — competition, delays, requirements`,
    description: `How hard is it to find a flat in ${city.name}? Market tension score ${tension.toFixed(1)}/10 (${tInfo.shortLabel}), estimated weeks to find, applicants per listing, income rules. Clameur 2024.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/rental-market` },
  };
}

export default async function EnRentalMarketPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const tension = rentalTension(city);
  const tInfo = tensionInfo(tension);
  const level = tensionLevel(tension);
  const { weeksToFind, applicantsPerListing, incomeMultiple } = deriveMetrics(tension);
  const housing = getHousing(slug);

  const sorted = [...CITIES_SEED].sort((a, b) => rentalTension(b) - rentalTension(a));
  const rank = sorted.findIndex((c) => c.slug === city.slug) + 1;

  const similar = [...CITIES_SEED]
    .filter((c) => c.slug !== city.slug)
    .map((c) => ({ city: c, d: Math.abs(rentalTension(c) - tension) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
    .map((x) => x.city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${city.slug}` },
    { name: "Rental market", path: `/cities/${city.slug}/rental-market` },
  ]);

  const faq = faqJsonLd([
    {
      q: `How long does it take to find a flat in ${city.name}?`,
      a: `With a rental market tension score of ${tension.toFixed(1)}/10, the average estimated wait in ${city.name} is ${weeksToFind} week${weeksToFind > 1 ? "s" : ""}. The market is classified as "${tInfo.label}".`,
    },
    {
      q: `How many applications does a listing get in ${city.name}?`,
      a: `On average, a rental listing in ${city.name} receives around ${applicantsPerListing} applications. A complete, well-presented dossier submitted quickly is key.`,
    },
    {
      q: `What income do I need to rent in ${city.name}?`,
      a: housing
        ? `For a one-bed at around €${housing.avgRentT2}/month in ${city.name}, the standard landlord rule is a net monthly income of at least €${Math.round(housing.avgRentT2 * incomeMultiple)} (${incomeMultiple}× the rent).`
        : `The standard landlord rule in ${city.name} is a net monthly income of at least ${incomeMultiple}× the monthly rent.`,
    },
  ]);

  const levelBadgeClass =
    level === "tendu"
      ? "bg-red-100/80 text-red-700 border-red-200"
      : level === "modere"
        ? "bg-amber-100/80 text-amber-700 border-amber-200"
        : "bg-emerald-100/80 text-emerald-700 border-emerald-200";

  const levelLabelEn =
    level === "tendu" ? "Tight market" : level === "modere" ? "Moderate market" : "Relaxed market";

  return (
    <main id="main-content" className="min-h-screen relative bg-[var(--bg-canvas)]">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />

      <section className="relative pt-20 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/cities" className="hover:text-[var(--text-secondary)]">Cities</Link>
            <span>/</span>
            <Link href={`/cities/${slug}`} className="hover:text-[var(--text-secondary)]">{city.name}</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Rental market</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🏠 Rental market pressure · 2026
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            Rental market in{" "}
            <span className="font-display gradient-text-anim italic">{city.name}</span>
          </h1>
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-semibold ${levelBadgeClass}`}>
              {levelLabelEn}
            </span>
            <span className="text-[var(--text-tertiary)] text-sm">
              Score {tension.toFixed(1)}/10 · #{rank} tightest of {CITIES_SEED.length} cities
            </span>
          </div>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
            {NARRATIVE[level](city.name, weeksToFind, applicantsPerListing)}
          </p>
        </div>
      </section>

      {/* Stat strip */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Tension score
              </div>
              <div className="text-3xl font-black font-mono-data text-[var(--text-primary)]">
                {tension.toFixed(1)}<span className="text-base font-normal text-[var(--text-tertiary)]"> /10</span>
              </div>
              <div className={`text-[11px] mt-1 font-semibold ${tInfo.color}`}>{levelLabelEn}</div>
            </div>
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] mb-1">
                <Clock className="h-3.5 w-3.5" />
                Estimated wait
              </div>
              <div className="text-3xl font-black font-mono-data text-[var(--text-primary)]">
                {weeksToFind}<span className="text-base font-normal text-[var(--text-tertiary)]"> wks</span>
              </div>
              <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">to find a 1-bed</div>
            </div>
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] mb-1">
                <Users className="h-3.5 w-3.5" />
                Applicants / listing
              </div>
              <div className="text-3xl font-black font-mono-data text-[var(--text-primary)]">
                ~{applicantsPerListing}<span className="text-base font-normal text-[var(--text-tertiary)]"> files</span>
              </div>
              <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">2026 estimate</div>
            </div>
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] mb-1">
                <Home className="h-3.5 w-3.5" />
                Income required
              </div>
              <div className="text-3xl font-black font-mono-data text-[var(--text-primary)]">
                {incomeMultiple}×<span className="text-base font-normal text-[var(--text-tertiary)]"> rent</span>
              </div>
              <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">typical landlord rule</div>
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
            Estimates derived from Clameur 2024 rental observatory data. Delays vary by property type and neighbourhood.
          </p>
        </div>
      </section>

      {/* Rent reference if available */}
      {housing && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Reference rents in {city.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">Studio / 1-room</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">€{housing.avgRentT1}<span className="text-sm font-normal text-[var(--text-tertiary)]">/mo</span></div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">1-bed (reference)</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">€{housing.avgRentT2}<span className="text-sm font-normal text-[var(--text-tertiary)]">/mo</span></div>
                <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">Min. income ~€{Math.round(housing.avgRentT2 * incomeMultiple)}</div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">2-bed</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">€{housing.avgRentT3}<span className="text-sm font-normal text-[var(--text-tertiary)]">/mo</span></div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">Buy price / m²</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">€{housing.avgBuyPriceM2.toLocaleString("fr-FR")}<span className="text-sm font-normal text-[var(--text-tertiary)]">/m²</span></div>
              </div>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              Source: local rent observatories / Clameur 2024. City-wide averages — centre vs outskirts can vary by ±30%.
            </p>
          </div>
        </section>
      )}

      {/* Tips */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Finding a flat in {city.name}</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] divide-y divide-[var(--border)]">
            {TIPS[level].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <span className="text-[var(--accent)] font-bold text-sm mt-0.5 shrink-0">{i + 1}</span>
                <p className="text-sm text-[var(--text-secondary)] leading-snug">{tip}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] px-5 py-4">
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">📅 Best time to search</div>
            <p className="text-sm text-[var(--text-secondary)]">{BEST_SEASON[level]}</p>
          </div>
        </div>
      </section>

      {/* Similar cities */}
      <section className="relative pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Cities with a similar rental market</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similar.map((c) => {
              const ct = rentalTension(c);
              const ci = tensionInfo(ct);
              const lev = tensionLevel(ct);
              const labelEn =
                lev === "tendu" ? "Tight" : lev === "modere" ? "Moderate" : "Relaxed";
              return (
                <Link
                  key={c.slug}
                  href={`/cities/${c.slug}/rental-market`}
                  className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3"
                >
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    Score {ct.toFixed(1)} · <span className={ci.color}>{labelEn}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex gap-3 flex-wrap">
          <Link
            href={`/cities/${slug}/housing`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            🏠 Full housing & buy vs rent
          </Link>
          <Link
            href={`/cities/${slug}`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Full profile of {city.name}
          </Link>
          <Link
            href="/cities"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            All cities
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
