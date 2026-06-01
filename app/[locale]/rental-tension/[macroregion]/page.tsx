import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  MACRO_REGIONS,
  MACRO_REGION_SLUGS,
  getMacroRegion,
  citiesInMacroRegion,
} from "@/lib/macro-regions";
import { rentalTension, tensionInfo, type TensionLevel } from "@/lib/rental-tension";
import { HOUSING } from "@/data/housing";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; macroregion: string }> };

export function generateStaticParams() {
  return MACRO_REGION_SLUGS.map((slug) => ({ locale: "en", macroregion: slug }));
}

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

const EN_TENSION_SHORT: Record<TensionLevel, string> = {
  tendu: "Tight",
  modere: "Moderate",
  detente: "Relaxed",
};

function macroLabelEn(slug: string, fallback: string): string {
  return EN_MACRO_LABEL[slug] ?? fallback;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) return {};
  const label = macroLabelEn(macro.slug, macro.label);
  return {
    title: `Rental market pressure · ${label} 2026`,
    description: `Rental market across ${label} cities: where renting is tight vs where it's accessible. Reference 1-bed rents and a pressure score per city.`,
    alternates: { canonical: `${EN_BASE}/rental-tension/${macro.slug}` },
    openGraph: {
      title: `Rental market pressure · ${label}`,
      description: `How hard it is to find a rental, city by city across the ${label} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function EnMacroRegionTensionPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();
  const label = macroLabelEn(macro.slug, macro.label);

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => {
      const tension = rentalTension(c);
      return {
        slug: c.slug,
        name: c.name,
        region: c.region,
        department: c.department,
        tension,
        info: tensionInfo(tension),
        rentT2: HOUSING[c.slug]?.avgRentT2 ?? null,
      };
    });

  const tense = [...cities].sort((a, b) => b.tension - a.tension).slice(0, 15);
  const relaxed = [...cities].sort((a, b) => a.tension - b.tension).slice(0, 10);

  const n = cities.length || 1;
  const avgTension = Math.round((cities.reduce((s, c) => s + c.tension, 0) / n) * 10) / 10;
  const withRent = cities.filter((c) => c.rentT2 != null);
  const avgRentT2 = withRent.length
    ? Math.round(withRent.reduce((s, c) => s + (c.rentT2 as number), 0) / withRent.length)
    : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Rental market pressure", path: "/rental-tension" },
    { name: label, path: `/rental-tension/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Where is it hardest to find a rental in ${label}?`,
      a:
        tense.length > 0
          ? `Top 3 by pressure score (10 = very tight): ${tense
              .slice(0, 3)
              .map((c) => `${c.name} (${c.tension.toFixed(1)}/10)`)
              .join(", ")}.`
          : `No city above 10,000 residents is referenced for this macro-region.`,
    },
    {
      q: `What is the average rental pressure in ${label}?`,
      a: `Average pressure score ${avgTension}/10 (10 = very tight) across ${cities.length} referenced cities${
        avgRentT2 != null ? `, for an average 1-bed rent of about €${avgRentT2}/month` : ""
      }.`,
    },
    {
      q: `How is this score calculated?`,
      a: `Score 0-10 derived from the city's 1-bed (T2) rent relative to the national median (~€750/month, Clameur 2024) and a per-commune market-pressure correction (FNAIM, rent observatories, DGALN zoning).`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link> ·{" "}
          <Link href="/rental-tension" className="hover:underline">Rental market pressure</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Rental market pressure — {label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          How hard it is to find a rental across the {cities.length} referenced cities of 10,000+
          residents in the {label} macro-region. Score 0-10, 10 = very tight.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} cities analysed</Badge>
          <Badge>Average pressure: {avgTension}/10</Badge>
          {avgRentT2 != null && <Badge>Average 1-bed rent: ~€{avgRentT2}/month</Badge>}
        </div>

        {/* Most tense */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — Tightest cities in {label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">Pressure</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Level</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">1-bed rent</th>
                </tr>
              </thead>
              <tbody>
                {tense.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/rental-market`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.tension.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${c.info.color}`}>{EN_TENSION_SHORT[c.info.level]}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {c.rentT2 != null ? `€${c.rentT2}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Most relaxed */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — Most relaxed cities in {label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">Pressure</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Level</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">1-bed rent</th>
                </tr>
              </thead>
              <tbody>
                {relaxed.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/rental-market`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-emerald-600">
                        {c.tension.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${c.info.color}`}>{EN_TENSION_SHORT[c.info.level]}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                      {c.rentT2 != null ? `€${c.rentT2}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Other macro-regions */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Other macro-regions
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m) => (
            <Link key={m.slug} href={`/rental-tension/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{macroLabelEn(m.slug, m.label)}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Rental market pressure</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/rental-tension" className="text-[var(--accent)] hover:underline">
            → See the full national rental-pressure ranking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
