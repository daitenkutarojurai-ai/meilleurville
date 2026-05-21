import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { projectClimate2040, type MacroRegion } from "@/lib/climate-2040";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

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
  const p = projectClimate2040(city);
  return {
    title: `${city.name} climate 2040 — heat days, tropical nights, projections`,
    description: `Climate projection for ${city.name} at 2040 horizon${p.projectedJulyC ? `: July avg ${p.projectedJulyC}°C (+${p.macroRegion.deltaJulyC}°C vs today), ${p.projectedDays30C} days above 30°C expected.` : "."} Based on Météo-France ARPEGE regional scenarios.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/climate-2040` },
  };
}

const MACRO_EN: Record<MacroRegion, { label: string; signature: string }> = {
  mediterranean: {
    label: "South-East Mediterranean",
    signature: "Mediterranean basin: summer heat waves multiplying, tropical nights increasingly frequent.",
  },
  atlantic: {
    label: "Atlantic Coastline",
    signature: "Atlantic façade: ocean regulation persists, keeping the rise moderate but real.",
  },
  iledefrance: {
    label: "Greater Île-de-France",
    signature: "Paris basin: urban heat island effect amplified, tropical nights rising sharply.",
  },
  "massif-central": {
    label: "Massif Central",
    signature: "Massif Central: altitude buffers temperatures but droughts are lengthening and snowfall declining.",
  },
  bretagne: {
    label: "Brittany",
    signature: "Brittany: the least exposed zone — ocean regulation holds, but the trend is clear.",
  },
  "hauts-france": {
    label: "Hauts-de-France",
    signature: "Northern France: a softened continental climate, but heat waves are hitting harder.",
  },
  "grand-est": {
    label: "Grand Est",
    signature: "Grand Est: continentality intensifying — summers drier and hotter than ever.",
  },
  "sud-ouest": {
    label: "South-West / Pyrenees",
    signature: "South-West: strong exposure to Iberian heat domes pushing north.",
  },
  "vallee-rhone": {
    label: "Rhône Valley",
    signature: "Rhône corridor: a thermal funnel between the Alps and Mediterranean — severe heat waves expected.",
  },
  normandie: {
    label: "Normandy / Cotentin",
    signature: "Normandy: strong ocean regulation keeps the rise contained.",
  },
  "centre-val-loire": {
    label: "Centre-Val de Loire",
    signature: "Loire Valley: caught between oceanic and continental patterns — summer droughts increasing.",
  },
  "bourgogne-franche-comte": {
    label: "Burgundy / Jura",
    signature: "Burgundy-Jura: moderate altitudes, warmer summers, milder winters.",
  },
  alpes: {
    label: "Alps / Savoie",
    signature: "Alps: altitude offers a heat refuge, but snowpack is in free fall.",
  },
  corse: {
    label: "Corsica",
    signature: "Corsica: very hot summers, amplified fire risk, marked drought.",
  },
  drom: {
    label: "Overseas France (DROM)",
    signature: "DROM: more intense cyclones, sea-level rise, amplified heat.",
  },
};

function verdictEN(cityName: string, days30: number): string {
  if (days30 >= 50) {
    return `${cityName} in 2040: ${days30} days above 30°C on average — a severe summer climate. Factor this in before committing to a long-term move.`;
  }
  if (days30 >= 30) {
    return `${cityName} in 2040: ${days30} days above 30°C — significantly hotter summers than today. Air conditioning and building adaptation will matter.`;
  }
  if (days30 >= 15) {
    return `${cityName} in 2040: ${days30} days above 30°C — still a temperate climate, but the warming trend is perceptible.`;
  }
  return `${cityName} remains relatively sheltered at the 2040 horizon: ${days30} days above 30°C estimated — below the French average.`;
}

interface DeltaBlockProps {
  label: string;
  current: number | null;
  projected: number | null;
  unit: string;
  hint?: string;
}

function DeltaBlock({ label, current, projected, unit, hint }: DeltaBlockProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <div className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">{label}</div>
      <div className="flex items-baseline gap-3">
        <div>
          <div className="text-[10px] text-[var(--text-tertiary)]">Today</div>
          <div className="text-xl font-bold tabular-nums text-[var(--text-secondary)]">
            {current != null ? `${current}` : "—"}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">{unit}</span>
          </div>
        </div>
        <span className="text-[var(--text-tertiary)] text-xl">→</span>
        <div>
          <div className="text-[10px] text-amber-700 font-semibold">By 2040</div>
          <div className="text-2xl font-bold tabular-nums text-red-700">
            {projected != null ? `${projected}` : "—"}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">{unit}</span>
          </div>
        </div>
      </div>
      {hint && <p className="text-[11px] text-[var(--text-tertiary)] mt-2">{hint}</p>}
    </div>
  );
}

export default async function EnClimate2040Page({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const p = projectClimate2040(city);
  const mr = MACRO_EN[p.macroRegion.key as MacroRegion];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BestCitiesInFrance", item: EN_BASE },
      { "@type": "ListItem", position: 2, name: "Cities", item: `${EN_BASE}/cities` },
      { "@type": "ListItem", position: 3, name: city.name, item: `${EN_BASE}/cities/${slug}` },
      { "@type": "ListItem", position: 4, name: "Climate 2040", item: `${EN_BASE}/cities/${slug}/climate-2040` },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav className="mb-3 text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            {" · "}
            <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
            {" · "}
            <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{city.name}</Link>
            {" · "}
            <span>Climate 2040</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
            {city.name} — Climate by 2040
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Projection to 2040 vs. the 1991-2020 reference period, based on
            Météo-France ARPEGE regional deltas for the{" "}
            <strong className="text-[var(--text-primary)]">{mr.label}</strong> macro-region.
          </p>
          <div className="flex flex-wrap gap-2 mt-3 text-xs">
            <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[var(--text-secondary)]">
              ARPEGE projection
            </span>
            <span className="inline-flex items-center rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[var(--text-secondary)]">
              Macro-region: {mr.label}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">

        {/* Verdict */}
        <div className="rounded-2xl border-l-4 border-l-amber-500 border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {verdictEN(city.name, p.projectedDays30C)}
          </p>
        </div>

        {/* 3 delta blocks */}
        <section>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">The key figures</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <DeltaBlock
              label="July average"
              current={p.currentJulyC}
              projected={p.projectedJulyC}
              unit="°C"
              hint={`+${p.macroRegion.deltaJulyC}°C vs 1991-2020`}
            />
            <DeltaBlock
              label="Days above 30°C / year"
              current={p.currentDays30C}
              projected={p.projectedDays30C}
              unit="d"
              hint={`+${p.macroRegion.extraDays30C} additional days`}
            />
            <DeltaBlock
              label="Tropical nights / year"
              current={p.currentTropicalNights}
              projected={p.projectedTropicalNights}
              unit="nights"
              hint={`+${p.macroRegion.extraTropicalNights} nights above 20°C`}
            />
          </div>
        </section>

        {/* Macro-region context */}
        <section>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
            Regional context — {mr.label}
          </h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {mr.signature}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-3">
              Source: Météo-France ARPEGE, median RCP4.5 and RCP8.5 scenarios. Regional
              uncertainty ±0.5°C. This page applies the macro-region average delta to{" "}
              {city.name}&apos;s current climate — the projection is <strong>indicative</strong>,
              not a fine-grained local forecast.
            </p>
          </div>
        </section>

        {/* Cross-links */}
        <section>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Explore further</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href={`/cities/${slug}/climate`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow"
            >
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Current climate</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{city.name} today</div>
            </Link>
            <Link
              href={`/cities/${slug}/honest-review`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow"
            >
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Synthesis</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Honest review of {city.name}</div>
            </Link>
            <Link
              href={`/cities/${slug}`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow"
            >
              <div className="text-xs uppercase text-[var(--text-tertiary)]">City profile</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Back to {city.name}</div>
            </Link>
            <Link
              href="/rankings"
              className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:shadow-md transition-shadow"
            >
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Rankings</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">All ranking categories</div>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
