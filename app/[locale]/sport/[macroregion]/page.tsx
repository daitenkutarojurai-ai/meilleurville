import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { MACRO_REGIONS, MACRO_REGION_SLUGS, getMacroRegion } from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import {
  computeSportLeisure,
  SPORT_LEVEL_COLOR,
} from "@/lib/sport-leisure";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternatesEn } from "@/lib/i18n";
import { fitTitle } from "@/lib/brand";

export const revalidate = false;
export const dynamicParams = false;

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

const EN_SPORT_LABEL: Record<string, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Average",
  "limité": "Limited",
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
    title: fitTitle(`Sport-friendly cities · ${label} 2026`),
    description: `Composite sport & leisure ranking (facilities, outdoor, clubs, climate) restricted to cities in the ${label} macro-region. Most sport-friendly vs least sport-friendly.`,
    alternates: pathAlternatesEn(`/sport/${macro.slug}`, `/sport/${macro.slug}`),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Sport-friendly cities · ${label}`,
      description: `Composite index by city across the ${label} macro-region.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function EnMacroRegionSportPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();
  const label = macroLabelEn(macro.slug, macro.label);

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      region: c.region,
      department: c.department,
      sport: computeSportLeisure(c),
    }));

  const best = [...cities].sort((a, b) => b.sport.composite - a.sport.composite).slice(0, 15);
  const worst = [...cities].sort((a, b) => a.sport.composite - b.sport.composite).slice(0, 10);

  const n = cities.length || 1;
  const avgComposite = Math.round((cities.reduce((s, c) => s + c.sport.composite, 0) / n) * 10) / 10;
  const avgFacilities = Math.round((cities.reduce((s, c) => s + c.sport.facilities.score, 0) / n) * 10) / 10;
  const avgOutdoor = Math.round((cities.reduce((s, c) => s + c.sport.outdoor.score, 0) / n) * 10) / 10;
  const avgClubs = Math.round((cities.reduce((s, c) => s + c.sport.clubs.score, 0) / n) * 10) / 10;
  const avgClimate = Math.round((cities.reduce((s, c) => s + c.sport.climate.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Sport & leisure", path: "/sport" },
    { name: label, path: `/sport/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which are the most sport-friendly cities in ${label}?`,
      a:
        best.length > 0
          ? `Top 3 by composite (10 = excellent): ${best
              .slice(0, 3)
              .map((c) => `${c.name} (${c.sport.composite.toFixed(1)}/10)`)
              .join(", ")}.`
          : `No city above 10,000 residents is referenced for this macro-region.`,
    },
    {
      q: `What is the average sport profile across ${label}?`,
      a: `Average composite ${avgComposite}/10 (10 = excellent). By dimension (10 = good): facilities ${avgFacilities}/10, outdoor playground ${avgOutdoor}/10, club scene ${avgClubs}/10, climate ${avgClimate}/10.`,
    },
    {
      q: `How is this ranking calculated?`,
      a: `Weighted composite across 4 dimensions: facilities (35%, RES INJEP + CREPS / INSEP bonus), outdoor playground (30%), club scene (20%), climate (15%). Sources: INJEP, sports.gouv.fr, CREPS, DRAJES, FFRandonnée.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
          <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/sport" className="hover:text-[var(--text-secondary)] transition-colors">Sport &amp; leisure</Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">{label}</span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <EmojiBadge emoji={macro.emoji} tone={toneFor(macro.slug)} />
          <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Sport &amp; leisure
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Sport-friendly cities — <span className="font-display gradient-text-anim italic">{label}</span>
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Composite index restricted to the {cities.length} referenced cities of 10,000+ residents
          in the {label} macro-region. Four dimensions: facilities, outdoor playground, club scene
          and a climate that supports activity.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">{cities.length} cities analysed</span>
          <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">Average composite: {avgComposite}/10</span>
        </div>
        </div>
      </section>

      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Macro-region aggregate */}
          <h2 className="text-2xl font-bold gradient-text mb-4">
            Average sport profile of the macro-region
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Facilities", v: avgFacilities, hint: "Network + elite" },
              { k: "Outdoor", v: avgOutdoor, hint: "Mountains / coast / forest / lakes" },
              { k: "Clubs", v: avgClubs, hint: "Club tissue" },
              { k: "Climate", v: avgClimate, hint: "Sunshine + heat + cold" },
            ].map((d) => (
              <div key={d.k} className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#4338CA]">{d.k}</div>
                <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {d.v.toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">{d.hint}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-4">
            Sub-scores: 10 = excellent on the dimension (sport convention, opposite to the
            environment convention where 10 = worst).
          </p>
        </div>
      </section>

      <section className="band band-sky py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Top sport-friendly */}
        <h2 className="text-2xl font-bold gradient-text">
          Top 15 — Most sport-friendly cities in {label}
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#CFFAFE] text-[#0E7490] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Facil.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Outdoor</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Clubs</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[#CFFAFE]">
                    <td className="px-3 py-2 font-bold tabular-nums text-[#0E7490]">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/sports-leisure`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SPORT_LEVEL_COLOR[c.sport.level]}`}>
                        {c.sport.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {EN_SPORT_LABEL[c.sport.level] ?? c.sport.level}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.facilities.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.outdoor.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.sport.clubs.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </section>

      <section className="band band-pink py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Worst */}
        <h2 className="text-2xl font-bold gradient-text">
          Top 10 — Least sport-friendly cities in {label}
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(219,39,119,0.45)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FCE7F3] text-[#9D174D] text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">City</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Facil.</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Outdoor</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Clubs</th>
                </tr>
              </thead>
              <tbody>
                {worst.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[#FCE7F3]">
                    <td className="px-3 py-2 font-bold tabular-nums text-[#9D174D]">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/cities/${c.slug}/sports-leisure`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.sport.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.facilities.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.sport.outdoor.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.sport.clubs.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </section>

      <section className="band band-lilac py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Other macro-regions */}
        <h2 className="text-xl font-bold gradient-text">
          Other macro-regions
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m) => (
            <Link key={m.slug} href={`/sport/${m.slug}`} className="group block">
              <div className="h-full rounded-2xl bg-white p-4 ring-1 ring-transparent shadow-[0_10px_28px_-18px_rgba(124,58,237,0.45)] transition-all group-hover:-translate-y-0.5 group-hover:ring-[#D8B4FE]">
                <EmojiBadge emoji={m.emoji} tone={toneFor(m.slug)} size="sm" className="mb-2" />
                <div className="text-sm font-semibold text-[var(--text-primary)]">{macroLabelEn(m.slug, m.label)}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Sport & leisure</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/sport" className="inline-flex items-center rounded-full grad-head-0 px-4 py-2 font-semibold shadow-sm transition-transform hover:-translate-y-0.5">
            → See the full national sport ranking
          </Link>
        </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget locale="en" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
