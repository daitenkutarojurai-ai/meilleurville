import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge } from "@/components/EmojiBadge";
import { pathAlternatesEn } from "@/lib/i18n";
import { CITIES_COUNT, GUIDES_COUNT, RANKINGS_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "FAQ · BestCitiesInFrance",
  description:
    "Answers to common questions about our French city rankings: methodology, data sources, score updates, editorial independence.",
  alternates: pathAlternatesEn("/faq", "/faq"),
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
      <section className="relative overflow-hidden bg-aurora pt-20 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <EmojiBadge emoji="❓" tone="pink" size="lg" className="shadow-[0_12px_28px_-12px_rgba(219,39,119,0.5)]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.05]">
            <span className="font-display gradient-text italic pr-1">FAQ</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            What people ask about our French city rankings — methodology, data, updates, editorial independence. {GUIDES_COUNT} long-form guides cover everything else.
          </p>
        </div>
      </section>
      <section className="band band-indigo py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <dl className="space-y-4">
            {FAQ.map((f, i) => (
              <div
                key={f.q}
                className="flex gap-4 rounded-2xl bg-white p-5 sm:p-6 shadow-[0_12px_30px_-22px_rgba(67,56,202,0.55)] ring-1 ring-[#E0E7FF]"
              >
                <span
                  aria-hidden="true"
                  className={`grad-head-${i % 6} flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold`}
                >
                  Q
                </span>
                <div className="min-w-0">
                  <dt className="font-bold text-[var(--text-primary)] mb-2">{f.q}</dt>
                  <dd className="text-[var(--text-secondary)] leading-relaxed">{f.a}</dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-center">
            <span className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#3730A3] ring-1 ring-[#C7D2FE]">
              {RANKINGS_COUNT} themed rankings · {CITIES_COUNT} cities · all data sourced from official French open data.
            </span>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
