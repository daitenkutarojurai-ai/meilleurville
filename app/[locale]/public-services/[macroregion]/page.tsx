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
import {
  computePublicServices,
  SERVICES_LEVEL_LABEL,
  SERVICES_LEVEL_COLOR,
} from "@/lib/public-services";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

const EN_MACRO_LABEL: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

type Props = { params: Promise<{ locale: string; macroregion: string }> };

export function generateStaticParams() {
  return MACRO_REGION_SLUGS.map((slug) => ({ locale: "en", macroregion: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) return {};
  const label = EN_MACRO_LABEL[macroregion] ?? macro.label;
  return {
    title: `Public services · ${label} 2026`,
    description: `Composite public services ranking (schools, city hall, post office, library) for cities in the ${label} macro-region. Best-served cities vs service deserts.`,
    alternates: { canonical: `${EN_BASE}/public-services/${macro.slug}` },
    openGraph: {
      title: `Public services · ${label}`,
      description: `Composite public services index for cities in the ${label} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionPublicServicesEnPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();

  const label = EN_MACRO_LABEL[macroregion] ?? macro.label;

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      department: c.department,
      services: computePublicServices(c),
    }));

  const best = [...cities].sort((a, b) => a.services.composite - b.services.composite).slice(0, 15);
  const desert = [...cities].sort((a, b) => b.services.composite - a.services.composite).slice(0, 10);

  const n = cities.length || 1;
  const avgComposite = Math.round((cities.reduce((s, c) => s + c.services.composite, 0) / n) * 10) / 10;
  const avgSchools = Math.round((cities.reduce((s, c) => s + c.services.schools.score, 0) / n) * 10) / 10;
  const avgLibrary = Math.round((cities.reduce((s, c) => s + c.services.library.score, 0) / n) * 10) / 10;
  const avgPost = Math.round((cities.reduce((s, c) => s + c.services.postOffice.score, 0) / n) * 10) / 10;
  const avgHall = Math.round((cities.reduce((s, c) => s + c.services.cityHall.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Public services", path: "/public-services" },
    { name: label, path: `/public-services/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which cities have the best public services in ${label}?`,
      a:
        best.length > 0
          ? `Top 3 by composite score (10 = full coverage): ${best
              .slice(0, 3)
              .map((c) => `${c.name} (${(10 - c.services.composite).toFixed(1)}/10)`)
              .join(", ")}.`
          : `No cities with over 10,000 inhabitants are listed for this macro-region.`,
    },
    {
      q: `What is the average public services level in ${label}?`,
      a: `Average composite score ${(10 - avgComposite).toFixed(1)}/10 (10 = full coverage). Sub-scores: schools ${(10 - avgSchools).toFixed(1)}/10, library ${(10 - avgLibrary).toFixed(1)}/10, post office ${(10 - avgPost).toFixed(1)}/10, city hall ${(10 - avgHall).toFixed(1)}/10.`,
    },
    {
      q: `How is this ranking calculated?`,
      a: `Weighted composite across 4 dimensions: schools & childcare (35%), city hall & admin services (25%), post office & France Services (25%), public library (15%). Sources: DEPP, CAF, BNF, La Poste, ANCT France Services.`,
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
          <Link href="/public-services" className="hover:underline">Public services</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Public services — {label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite public services index for {cities.length} cities in the {label} macro-region
          with over 10,000 inhabitants. Four dimensions: schools, library, post office, city hall.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} cities analysed</Badge>
          <Badge>Average composite: {(10 - avgComposite).toFixed(1)}/10</Badge>
        </div>

        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Average public services profile for this macro-region
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Schools", v: avgSchools, hint: "Coverage + nursery pressure" },
              { k: "Library", v: avgLibrary, hint: "BNF public reading network" },
              { k: "Post office", v: avgPost, hint: "Offices + APC + RPC + MFS" },
              { k: "City hall", v: avgHall, hint: "Opening hours + admin services" },
            ].map((d) => (
              <div key={d.k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                <div className="text-xs text-[var(--text-tertiary)]">{d.k}</div>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {(10 - d.v).toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">{d.hint}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Sub-scores: 10 = full public services coverage.
          </p>
        </Card>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — best-served cities in {label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Schools</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Post</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">City hall</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/public-services`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SERVICES_LEVEL_COLOR[c.services.level]}`}>
                        {(10 - c.services.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {SERVICES_LEVEL_LABEL[c.services.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.services.schools.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.services.postOffice.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.services.cityHall.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — service deserts in {label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Schools</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Post</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">City hall</th>
                </tr>
              </thead>
              <tbody>
                {desert.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/public-services`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {(10 - c.services.composite).toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.services.schools.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{(10 - c.services.postOffice.score).toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{(10 - c.services.cityHall.score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Other macro-regions
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m) => (
            <Link key={m.slug} href={`/public-services/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Public services</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/public-services" className="text-[var(--accent)] hover:underline">
            View the full national public services ranking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
