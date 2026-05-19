import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Methodology · How we rank French cities",
  description:
    "Full transparency on how BestCitiesInFrance computes scores: 8 axes, weighted aggregation, worst-axis penalty, data sources, calibration, and editorial overrides.",
  alternates: { canonical: `${EN_BASE}/methodology` },
};

export default function EnMethodology() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-6">
          Methodology
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-10">
          Every score on the site is reproducible from open data. This page is the audit trail.
        </p>

        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">The eight axes</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
          Every city is scored 0-10 on eight dimensions. Each axis aggregates several official indicators.
        </p>
        <ul className="text-[var(--text-secondary)] leading-relaxed mb-10 space-y-2">
          <li><strong className="text-[var(--text-primary)]">Quality of life</strong> — green space, services, perceived ambience, life-expectancy, public amenities.</li>
          <li><strong className="text-[var(--text-primary)]">Transport</strong> — TGV / TER / metro / tram coverage, walkability, bike infrastructure, commute times.</li>
          <li><strong className="text-[var(--text-primary)]">Nature</strong> — forest, coast, mountain access; air quality (ATMO); sunshine and climate.</li>
          <li><strong className="text-[var(--text-primary)]">Cost</strong> — rent (OLL), property prices (DVF), consumer prices vs national median.</li>
          <li><strong className="text-[var(--text-primary)]">Safety</strong> — crime per 1,000 inhabitants (SSMSI), incivilities, perceived safety.</li>
          <li><strong className="text-[var(--text-primary)]">Culture</strong> — museums, theatres, festivals, restaurants, universities.</li>
          <li><strong className="text-[var(--text-primary)]">Remote work</strong> — fibre coverage (ARCEP), coworking density, cost vs salary.</li>
          <li><strong className="text-[var(--text-primary)]">Schools</strong> — academic outcomes, school density, paediatric coverage.</li>
        </ul>

        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Three-stage pipeline</h2>
        <ol className="text-[var(--text-secondary)] leading-relaxed mb-10 space-y-3 list-decimal pl-5">
          <li>
            <strong className="text-[var(--text-primary)]">Raw seed.</strong> Every city has its eight axis scores in a versioned seed file, derived from a mix of indicators. Decimal precision intentional — we don't round to integers because per-axis differences of 0.3 matter when normalised.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Editorial calibration.</strong> Where reality and the raw indicator diverge (e.g. a city's reputation lags its current crime data), an editorial override is applied with a reasoned comment in the calibration file. Overrides are visible — no silent hand-tuning.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Distribution normalisation.</strong> Per-axis z-score rescaling brings the national distribution to a target mean ≈ 5.7 and std ≈ 1.5. Without this, raw scores would cluster around 6-7 and the site would look like every city is great.
          </li>
        </ol>

        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">The global score</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
          The global score is a <strong>weighted mean minus a worst-axis penalty</strong>. This is the most important design choice on the site:
        </p>
        <ul className="text-[var(--text-secondary)] leading-relaxed mb-10 space-y-2">
          <li>· If a city is great everywhere except one axis (say, safety at 3.5/10), that weakness pulls the global score down meaningfully.</li>
          <li>· A specific safety penalty kicks in when safety &lt; 4.5/10. Most-livable cities tend not to have a 3/10 on a critical axis.</li>
          <li>· A small standout bonus rewards cities whose top three axes average above 7.5 — truly exceptional places shouldn't be capped by an average city's ceiling.</li>
          <li>· Final scores are clamped between 2.8 and 8.6. We don't ship 0/10 or 10/10.</li>
        </ul>

        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Data sources</h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed mb-10 space-y-2">
          <li>· <strong className="text-[var(--text-primary)]">Insee</strong> — demographics, income, jobs, secondary residences.</li>
          <li>· <strong className="text-[var(--text-primary)]">SSMSI</strong> — crime statistics (Ministry of the Interior).</li>
          <li>· <strong className="text-[var(--text-primary)]">DREES</strong> — healthcare density (doctors per 1,000).</li>
          <li>· <strong className="text-[var(--text-primary)]">Observatoires Locaux des Loyers</strong> — real rent data per city / per typology.</li>
          <li>· <strong className="text-[var(--text-primary)]">DVF (data.gouv.fr)</strong> — actual transaction prices per m².</li>
          <li>· <strong className="text-[var(--text-primary)]">ARCEP</strong> — fibre and mobile coverage maps.</li>
          <li>· <strong className="text-[var(--text-primary)]">ATMO France</strong> — daily air quality.</li>
          <li>· <strong className="text-[var(--text-primary)]">Météo-France</strong> — climate normals 1991-2020.</li>
        </ul>

        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">What we explicitly don't do</h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed mb-10 space-y-2">
          <li>· We don't use Trip-Advisor-style review counts as signal. We use them as context.</li>
          <li>· We don't blend in "city reputation" or PR copy. Reputation is allowed to lag reality.</li>
          <li>· We don't sell editorial position. Affiliate links exist (booking partner on /vacations) and are disclosed.</li>
          <li>· We don't auto-generate AI city descriptions and call them content. Every body of text is reviewed.</li>
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/rankings" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">See rankings</Link>
          <Link href="/cities" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">Browse cities</Link>
          <Link href="/faq" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">FAQ</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
