import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { pathAlternatesEn } from "@/lib/i18n";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";

export const metadata: Metadata = {
  title: "Methodology · How we rank French cities",
  description:
    "Full transparency on how BestCitiesInFrance computes scores: 8 axes, weighted aggregation, worst-axis penalty, data sources, calibration, and editorial overrides.",
  alternates: pathAlternatesEn("/methode", "/methodology"),
};

const AXES = [
  { emoji: "🌿", name: "Quality of life", desc: "green space, services, perceived ambience, life-expectancy, public amenities." },
  { emoji: "🚆", name: "Transport", desc: "TGV / TER / metro / tram coverage, walkability, bike infrastructure, commute times." },
  { emoji: "⛰️", name: "Nature", desc: "forest, coast, mountain access; air quality (ATMO); sunshine and climate." },
  { emoji: "💶", name: "Cost", desc: "rent (OLL), property prices (DVF), consumer prices vs national median." },
  { emoji: "🛡️", name: "Safety", desc: "crime per 1,000 inhabitants (SSMSI), incivilities, perceived safety." },
  { emoji: "🎭", name: "Culture", desc: "museums, theatres, festivals, restaurants, universities." },
  { emoji: "💻", name: "Remote work", desc: "fibre coverage (ARCEP), coworking density, cost vs salary." },
  { emoji: "🎒", name: "Schools", desc: "academic outcomes, school density, paediatric coverage." },
];

const SOURCES = [
  { name: "Insee", desc: "demographics, income, jobs, secondary residences." },
  { name: "SSMSI", desc: "crime statistics (Ministry of the Interior)." },
  { name: "DREES", desc: "healthcare density (doctors per 1,000)." },
  { name: "Observatoires Locaux des Loyers", desc: "real rent data per city / per typology." },
  { name: "DVF (data.gouv.fr)", desc: "actual transaction prices per m²." },
  { name: "ARCEP", desc: "fibre and mobile coverage maps." },
  { name: "ATMO France", desc: "daily air quality." },
  { name: "Météo-France", desc: "climate normals 1991-2020." },
];

const SECTION_HEAD = "flex items-center gap-3 mb-3";
const H2 = "text-2xl font-bold text-[var(--text-primary)]";
const CARD = "rounded-2xl bg-white p-4 shadow-[0_10px_24px_-18px_rgba(79,70,229,0.6)] ring-1";

export default function EnMethodology() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="relative overflow-hidden bg-aurora pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <EmojiBadge emoji="🔍" tone="indigo" size="lg" className="shadow-[0_12px_28px_-12px_rgba(79,70,229,0.55)]" />
            <div className="min-w-0">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 gradient-text">
                Methodology
              </h1>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                Every score on the site is reproducible from open data. This page is the audit trail.
                What comes out of the calculation is published city by city:{" "}
                <Link href="/reviews" className="font-medium text-[#4338CA] underline underline-offset-2 hover:text-[#BE185D]">
                  each rating out of 10 alongside the reviews left by residents
                </Link>
                .
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1.5 text-[#3730A3] ring-1 ring-[#C7D2FE]"><span aria-hidden>📏</span>8 axes scored 0-10</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2F8] px-3 py-1.5 text-[#9D174D] ring-1 ring-[#FBCFE8]"><span aria-hidden>🗂️</span>Open data</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFEFF] px-3 py-1.5 text-[#155E75] ring-1 ring-[#A5F3FC]"><span aria-hidden>🚫</span>No paid placement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band band-indigo py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className={SECTION_HEAD}>
            <EmojiBadge emoji="📏" tone="indigo" size="sm" />
            <h2 className={H2}>The eight axes</h2>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-5">
            Every city is scored 0-10 on eight dimensions. Each axis aggregates several official indicators.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {AXES.map((a, i) => (
              <li key={a.name} className={`${CARD} ring-[#C7D2FE] flex items-start gap-3`}>
                <EmojiBadge emoji={a.emoji} tone={toneFor(i)} size="sm" />
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong className="block text-[var(--text-primary)]">{a.name}</strong>
                  {a.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band-sky py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className={SECTION_HEAD}>
            <EmojiBadge emoji="⚙️" tone="sky" size="sm" />
            <h2 className={H2}>Three-stage pipeline</h2>
          </div>
          <ol className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              { title: "Raw seed.", text: "Every city has its eight axis scores in a versioned seed file, derived from a mix of indicators. Decimal precision intentional — we don't round to integers because per-axis differences of 0.3 matter when normalised." },
              { title: "Editorial calibration.", text: "Where reality and the raw indicator diverge (e.g. a city's reputation lags its current crime data), an editorial override is applied with a reasoned comment in the calibration file. Overrides are visible — no silent hand-tuning." },
              { title: "Distribution normalisation.", text: "Per-axis z-score rescaling brings the national distribution to a target mean ≈ 5.7 and std ≈ 1.5. Without this, raw scores would cluster around 6-7 and the site would look like every city is great." },
            ].map((step, i) => (
              <li key={step.title} className="overflow-hidden rounded-2xl bg-white shadow-[0_12px_28px_-20px_rgba(79,70,229,0.6)] ring-1 ring-[#BFDBFE]">
                <div className={`${["grad-head-0", "grad-head-5", "grad-head-4"][i]} px-4 py-2 text-xs uppercase tracking-wider font-semibold`}>
                  Stage {i + 1}
                </div>
                <p className="p-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)]">{step.title}</strong> {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band-pink py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className={SECTION_HEAD}>
            <EmojiBadge emoji="🧮" tone="pink" size="sm" />
            <h2 className={H2}>The global score</h2>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-5">
            The global score is a <strong>weighted mean minus a worst-axis penalty</strong>. This is the most important design choice on the site:
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "If a city is great everywhere except one axis (say, safety at 3.5/10), that weakness pulls the global score down meaningfully.",
              "A specific safety penalty kicks in when safety < 4.5/10. Most-livable cities tend not to have a 3/10 on a critical axis.",
              "A small standout bonus rewards cities whose top three axes average above 7.5 — truly exceptional places shouldn't be capped by an average city's ceiling.",
              "Final scores are clamped between 2.8 and 8.6. We don't ship 0/10 or 10/10.",
            ].map((item, i) => (
              <li key={item} className={`${CARD} ring-[#FBCFE8] flex items-start gap-3 text-sm text-[var(--text-secondary)] leading-relaxed`}>
                <span aria-hidden className={`${["grad-head-1", "grad-head-5", "grad-head-4", "grad-head-0"][i]} mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold`}>
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band-aqua py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className={SECTION_HEAD}>
            <EmojiBadge emoji="🗂️" tone="aqua" size="sm" />
            <h2 className={H2}>Data sources</h2>
          </div>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {SOURCES.map((s) => (
              <li key={s.name} className="rounded-xl bg-white px-4 py-3 text-sm text-[var(--text-secondary)] leading-relaxed ring-1 ring-[#A5F3FC] shadow-[0_8px_20px_-16px_rgba(8,145,178,0.6)]">
                <strong className="text-[#155E75]">{s.name}</strong> — {s.desc}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band-lilac py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className={SECTION_HEAD}>
            <EmojiBadge emoji="🚫" tone="lilac" size="sm" />
            <h2 className={H2}>What we explicitly don&apos;t do</h2>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "We don't use Trip-Advisor-style review counts as signal. We use them as context.",
              "We don't blend in \"city reputation\" or PR copy. Reputation is allowed to lag reality.",
              "We don't sell editorial position. Affiliate links exist (booking partner on /vacations) and are disclosed.",
              "We don't auto-generate AI city descriptions and call them content. Every body of text is reviewed.",
            ].map((item) => (
              <li key={item} className={`${CARD} ring-[#E9D5FF] text-sm text-[var(--text-secondary)] leading-relaxed`}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band band-bold py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-wrap gap-3">
          <Link href="/rankings" className="rounded-full bg-white px-5 py-2.5 font-semibold text-[#4338CA] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-transform">See rankings</Link>
          <Link href="/cities" className="rounded-full border border-white/70 px-5 py-2.5 font-semibold text-white hover:bg-white/15 transition-colors">Browse cities</Link>
          <Link href="/faq" className="rounded-full border border-white/70 px-5 py-2.5 font-semibold text-white hover:bg-white/15 transition-colors">FAQ</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
