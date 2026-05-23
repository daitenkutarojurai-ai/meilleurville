import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_COUNT, GUIDES_COUNT, RANKINGS_COUNT } from "@/lib/site-stats";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "About · BestCitiesInFrance",
  description:
    "BestCitiesInFrance is the English-language reference for choosing where to live in France. Independent rankings, resident reviews, no fluff.",
  alternates: { canonical: `${EN_BASE}/about` },
};

export default function EnAbout() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-6">
          About BestCitiesInFrance
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-6">
          BestCitiesInFrance is an independent guide built to answer one question: where in France should you actually live? We cover {CITIES_COUNT} cities across {RANKINGS_COUNT} themed rankings, with {GUIDES_COUNT} long-form guides for specific situations (remote work, relocation, retirement, families, climate adaptation).
        </p>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-3">What we do</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
          We score every city on eight axes — quality of life, transport, nature, cost, safety, culture, remote-work readiness, and schools — using official open data (Insee, SSMSI for crime, Observatoires Locaux des Loyers for rent, DREES for healthcare, ARCEP for fibre, ATMO for air quality). Scores are calibrated, normalised, and explained in the methodology page.
        </p>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-3">What we don't do</h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed mb-6 space-y-2">
          <li>· Sell rankings to cities. Every score is editorial.</li>
          <li>· Hide our sources. Every ranking page lists the data behind it.</li>
          <li>· Use vague city descriptions written by marketing teams.</li>
          <li>· Pretend a single city fits everyone.</li>
        </ul>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-3">Who runs this</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
          Edited by Thomas Fendrich. Contact:{" "}
          <a className="text-[var(--accent)] hover:underline" href="mailto:hello@mavilleideale.fr">
            hello@mavilleideale.fr
          </a>
          .
        </p>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-10 mb-3">French version</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
          BestCitiesInFrance is the English version of <a className="text-[var(--accent)] hover:underline" href="https://www.mavilleideale.fr">MaVilleIdeal</a> (mavilleideale.fr). Same data, written for English-speaking readers.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/cities" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Browse cities</Link>
          <Link href="/rankings" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">See rankings</Link>
          <Link href="/methodology" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">Methodology</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
