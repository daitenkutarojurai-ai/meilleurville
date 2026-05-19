import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_COUNT, GUIDES_COUNT, RANKINGS_COUNT } from "@/lib/site-stats";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "FAQ · BestCitiesInFrance",
  description:
    "Answers to common questions about our French city rankings: methodology, data sources, score updates, editorial independence.",
  alternates: { canonical: `${EN_BASE}/faq` },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "How many cities do you cover?",
    a: `${CITIES_COUNT} French cities across mainland France and the overseas departments (DROM). All cities are scored on the same eight-axis system, so any two cities are directly comparable.`,
  },
  {
    q: "Where does the data come from?",
    a: "Official open data: Insee (demographics, income, jobs), SSMSI (crime statistics), Observatoires Locaux des Loyers (rent), DREES (healthcare density), ARCEP (fibre coverage), ATMO France (air quality), Météo-France (climate), DVF (property prices). We never use placeholder numbers — if a figure is uncertain, we say so.",
  },
  {
    q: "How are the scores computed?",
    a: "Each city is scored 0-10 on eight axes (life, transport, nature, cost, safety, culture, remote-work readiness, schools). The global score is a weighted mean minus a worst-axis penalty, so a city that's strong on average but very weak on one dimension (e.g. safety) doesn't hide behind its strengths. Full methodology is on the /methodology page.",
  },
  {
    q: "How often are rankings updated?",
    a: "Continuously. When a new official data release comes in (e.g. SSMSI quarterly crime stats, or a new Insee income survey), the affected scores update. Major rankings are reviewed at least quarterly.",
  },
  {
    q: "Do cities pay to be featured?",
    a: "No. We don't sell rankings, sponsored placements, or higher scores. Cities can email us to flag data corrections, but they can't buy editorial positioning. This is the entire point of the site.",
  },
  {
    q: "Why does my city have a different score than I expect?",
    a: "Two common reasons: (1) we use official data, which sometimes lags lived experience by 6-18 months; (2) we score on outcomes that may not match what locals value most. If a number looks wrong, email us with the source — corrections are usually live within a week.",
  },
  {
    q: "Do you cover overseas territories?",
    a: "Yes — La Réunion, Martinique, Guadeloupe, Guyane, and Mayotte are all included with the same scoring system. Overseas cities are flagged separately on maps but appear normally in all rankings.",
  },
  {
    q: "Can I use your data?",
    a: "Quote individual scores or rankings with credit and a link back. Bulk reuse, embedding, or commercial use — email us first so we can confirm scope and source recency.",
  },
  {
    q: "How is this different from a generic 'best cities in France' list?",
    a: "Most lists are written from a hotel-brochure perspective. We score on what matters when you actually live somewhere — rent vs salary, GP availability, ER wait times, school outcomes, crime per 1,000 inhabitants, fibre, commute times. Boring metrics. Honest answers.",
  },
];

export default function EnFaq() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-4">FAQ</h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-10">
          What people ask about our French city rankings — methodology, data, updates, editorial independence. {GUIDES_COUNT} long-form guides cover everything else.
        </p>
        <dl className="space-y-6">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <dt className="font-bold text-[var(--text-primary)] mb-2">{f.q}</dt>
              <dd className="text-[var(--text-secondary)] leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-sm text-[var(--text-tertiary)]">
          {RANKINGS_COUNT} themed rankings · {CITIES_COUNT} cities · all data sourced from official French open data.
        </p>
      </section>
      <Footer />
    </main>
  );
}
