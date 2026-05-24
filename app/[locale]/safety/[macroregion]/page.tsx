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
  computeSafetyDeep,
  SAFETY_LEVEL_LABEL,
  SAFETY_LEVEL_COLOR,
} from "@/lib/safety-deep";
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
    title: `Safety (SSMSI) · ${label} 2026`,
    description: `Composite safety ranking (property crime, personal crime, night-time, domestic violence) for cities in the ${label} macro-region. Quietest vs most tense cities.`,
    alternates: { canonical: `${EN_BASE}/safety/${macro.slug}` },
    openGraph: {
      title: `Safety · ${label}`,
      description: `Composite safety index for cities in the ${label} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionSafetyEnPage({ params }: Props) {
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
      safety: computeSafetyDeep(c),
    }));

  // 10 = worst → sort ascending for calmest cities
  const calmest = [...cities].sort((a, b) => a.safety.composite - b.safety.composite).slice(0, 15);
  const stressed = [...cities].sort((a, b) => b.safety.composite - a.safety.composite).slice(0, 10);

  const n = cities.length || 1;
  const avgComposite = Math.round((cities.reduce((s, c) => s + c.safety.composite, 0) / n) * 10) / 10;
  const avgProperty = Math.round((cities.reduce((s, c) => s + c.safety.property.score, 0) / n) * 10) / 10;
  const avgPersons = Math.round((cities.reduce((s, c) => s + c.safety.persons.score, 0) / n) * 10) / 10;
  const avgNoct = Math.round((cities.reduce((s, c) => s + c.safety.nocturnal.score, 0) / n) * 10) / 10;
  const avgVffs = Math.round((cities.reduce((s, c) => s + c.safety.vffs.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Safety", path: "/safety" },
    { name: label, path: `/safety/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which are the safest cities in ${label}?`,
      a:
        calmest.length > 0
          ? `Top 3 by composite score (lower = safer): ${calmest
              .slice(0, 3)
              .map((c) => `${c.name} (${c.safety.composite.toFixed(1)}/10)`)
              .join(", ")}.`
          : `No cities with over 10,000 inhabitants are listed for this macro-region.`,
    },
    {
      q: `What is the average safety profile in ${label}?`,
      a: `Average composite score ${avgComposite.toFixed(1)}/10 (10 = highest insecurity). Sub-scores: property crime ${avgProperty.toFixed(1)}/10, personal crime ${avgPersons.toFixed(1)}/10, night-time ${avgNoct.toFixed(1)}/10, domestic violence ${avgVffs.toFixed(1)}/10.`,
    },
    {
      q: `How is this ranking calculated?`,
      a: `Weighted composite across 4 SSMSI dimensions: property crime (35%), personal crime (30%), night-time incidents (20%), domestic violence (15%). Sources: SSMSI (interstats.fr), INSEE CVS, data.gouv.fr.`,
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
          <Link href="/safety" className="hover:underline">Safety</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Safety — {label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite safety index for {cities.length} cities in the {label} macro-region
          with over 10,000 inhabitants. Four dimensions: property crime, personal crime,
          night-time incidents, domestic violence.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} cities analysed</Badge>
          <Badge>Average composite: {avgComposite.toFixed(1)}/10</Badge>
        </div>

        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Average safety profile for this macro-region
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Property", v: avgProperty, hint: "Burglaries + theft" },
              { k: "Personal", v: avgPersons, hint: "Assault & battery" },
              { k: "Night-time", v: avgNoct, hint: "Fights & vandalism" },
              { k: "Dom. violence", v: avgVffs, hint: "SSMSI reports" },
            ].map((d) => (
              <div key={d.k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                <div className="text-xs text-[var(--text-tertiary)]">{d.k}</div>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {d.v.toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">{d.hint}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Sub-scores: 10 = maximum insecurity (SSMSI convention). Lower is safer.
          </p>
        </Card>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — safest cities in {label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Property</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Personal</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Night</th>
                </tr>
              </thead>
              <tbody>
                {calmest.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/safety`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SAFETY_LEVEL_COLOR[c.safety.level]}`}>
                        {c.safety.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {SAFETY_LEVEL_LABEL[c.safety.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.property.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.persons.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.safety.nocturnal.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — most tense cities in {label}
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
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Property</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Personal</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Night</th>
                </tr>
              </thead>
              <tbody>
                {stressed.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/safety`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.safety.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.property.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.persons.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.safety.nocturnal.score.toFixed(1)}</td>
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
            <Link key={m.slug} href={`/safety/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{EN_MACRO_LABEL[m.slug] ?? m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Safety (SSMSI)</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/safety" className="text-[var(--accent)] hover:underline">
            View the full national safety ranking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
