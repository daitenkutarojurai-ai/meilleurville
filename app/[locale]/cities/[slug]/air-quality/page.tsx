import type { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { AirMeasuredCard } from "@/components/AirMeasuredCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { cityAirEvaluated } from "@/lib/city-air";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { computeAirQuality, AIR_MEASURED_MAX_KM, type AirLevel } from "@/lib/air-quality";
import { cityAlternatesEn } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";
import { fitTitle } from "@/lib/brand";

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
    title: fitTitle(`${c.name} air quality — NO₂, PM2.5, ozone, pollen (2026)`),
    description: `Air quality in ${c.name}: nitrogen dioxide, fine particles, ozone and pollen exposure. What the air is actually like to breathe year-round.`,
    alternates: cityAlternatesEn("air-quality", slug),
  };
}

const LEVEL_LABEL: Record<AirLevel, string> = {
  faible: "Clean",
  modere: "Moderate",
  eleve: "Elevated",
  fort: "Poor",
};

const HERO_VERDICT: Record<AirLevel, string> = {
  faible: "The air here is clean — pollution sits well below the levels that affect health.",
  modere: "Air quality is moderate: fine for most people, with the odd spike on still winter days or hot summer afternoons.",
  eleve: "Air pollution runs elevated. People with asthma or young children will notice it — worth weighing if respiratory health matters to you.",
  fort: "Air quality is poor by French standards — recurring pollution episodes. Take it seriously if anyone in the household has a respiratory condition.",
};

const DIMS: { key: "no2" | "pm25" | "ozone" | "pollen"; label: string; note: string }[] = [
  { key: "no2", label: "NO₂", note: "Nitrogen dioxide — road traffic and diesel" },
  { key: "pm25", label: "PM2.5", note: "Fine particles — heating and industry" },
  { key: "ozone", label: "Ozone", note: "Photochemical — heat and sunshine" },
  { key: "pollen", label: "Pollen", note: "Allergenic pollen load" },
];

export default async function EnCityAir({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const air = computeAirQuality(c);
  // The lib composite is 0-10 where 10 = most polluted. Present an intuitive
  // "10 = cleanest" score.
  const cleanScore = Math.round((10 - air.composite) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: c.name, path: `/cities/${slug}` },
    { name: "Air quality", path: `/cities/${slug}/air-quality` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />
      <section className="relative overflow-hidden bg-aurora">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-10">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{c.name}</Link>
          {" · "}
          <span>Air quality</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🌬️</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Air quality in <span className="gradient-text">{c.name}</span>
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Air quality score: <span className={`font-mono-data font-bold ${scoreColor(cleanScore)}`}>{cleanScore.toFixed(1)}/10</span>{" "}
          ({LEVEL_LABEL[air.level]}). {HERO_VERDICT[air.level]}
        </p>
        {/* The FR twin (/villes/[slug]/air) states both of these; this page
            stated neither, so a reader had no way to know which direction the
            number runs or where it comes from. hreflang alternates must not
            disagree on that. */}
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
          10 = cleanest air.{" "}
          {air.measuredCount === 3
            ? `NO₂, fine particles and ozone are measured: each score comes from the annual average of an urban or suburban background station within ${AIR_MEASURED_MAX_KM} km, read against the WHO guideline and the 2030 EU limit.`
            : air.measuredCount > 0
              ? `Partly measured: ${air.measuredCount} of the three pollutants come from an urban or suburban background station within ${AIR_MEASURED_MAX_KM} km; the rest is estimated by a commune-level model (see each card).`
              : `No urban or suburban background station within ${AIR_MEASURED_MAX_KM} km, so the scores are a commune-level estimate (size, département, climate), not a station reading.`}{" "}
          Pollen is always estimated from the RNSA regional basins, without reusing
          its readings. Measured annual averages from nearby stations (up to 25 km)
          are listed below.
        </p>
        </div>
      </section>

      {cityAirEvaluated(slug) && (
        <section className="band band-aqua py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <AirMeasuredCard slug={slug} cityName={c.name} locale="en" />
          </div>
        </section>
      )}

      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = air[d.key];
          const dimScore = Math.round((10 - dim.score) * 10) / 10;
          return (
            <div key={d.key} className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-[var(--text-primary)]">{d.label}</p>
                <span className={`font-mono-data font-bold ${scoreColor(dimScore)}`}>{dimScore.toFixed(1)}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {LEVEL_LABEL[dim.level]} — {d.note}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                {dim.measured
                  ? `Measured: ${dim.measured.unit === "jours" ? `${Math.round(dim.measured.value)} day${Math.round(dim.measured.value) === 1 ? "" : "s"} above 120 µg/m³ (8-hour mean)` : `${dim.measured.value.toFixed(1)} µg/m³ annual mean`} in ${dim.measured.year}, background station ${dim.measured.distanceKm < 1 ? dim.measured.distanceKm.toFixed(1) : Math.round(dim.measured.distanceKm)} km away`
                  : "Estimated (commune-level model)"}
              </p>
            </div>
          );
        })}
        </div>
      </section>

      <section className="band band-sky py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold mb-3"><span className="gradient-text">What this covers</span></h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· <strong className="text-[var(--text-primary)]">NO₂</strong> — mostly road traffic. Measured annual mean where a background station is within {AIR_MEASURED_MAX_KM} km: the WHO guideline (10 µg/m³) scores 6.5, the 2030 EU limit (20 µg/m³) 2.5.</li>
          <li>· <strong className="text-[var(--text-primary)]">PM2.5</strong> — fine particles from heating and industry. Measured the same way: WHO 5 µg/m³ scores 8.5, the 2030 EU limit of 10 µg/m³ scores 4.5.</li>
          <li>· <strong className="text-[var(--text-primary)]">Ozone</strong> — forms in heat and sunshine. Measured as days above 120 µg/m³ over 8 hours; the EU target of 25 days a year scores 2.5. One year only, so it depends on the summer.</li>
          <li>· <strong className="text-[var(--text-primary)]">Pollen</strong> — the allergenic load, always estimated from regional basins.</li>
          <li>· A background station measures the air you breathe at home, away from direct traffic; next to a busy road, NO₂ is much higher. Rural stations are not used to score a town.</li>
        </ul>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="grad-head-0 rounded-full px-5 py-2.5 font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/ecologie" className="rounded-full bg-white px-5 py-2.5 font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]">Ecology &amp; air ranking</Link>
        </div>
        </div>
      </section>
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>
      <Footer />
    </main>
  );
}
