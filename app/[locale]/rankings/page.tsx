import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RANKING_META } from "@/lib/rankings";
import { t, ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

// Localised labels for the existing French ranking slugs. Slug keys stay
// in French so URLs and FR data structures don't fork; only the display
// label and tagline are translated.
const RANKING_EN_LABELS: Record<string, { label: string; tagline: string }> = {
  teletravail: { label: "Remote work", tagline: "Fibre, coworking, cost-of-life vs salary." },
  famille: { label: "Families", tagline: "Schools, parks, paediatric coverage." },
  nature: { label: "Nature", tagline: "Forest, sea, mountains within reach." },
  etudiant: { label: "Students", tagline: "Universities, rent affordability, nightlife." },
  retraite: { label: "Retirees", tagline: "Healthcare access, climate, calm." },
  budget: { label: "Tight budget", tagline: "Rent, groceries, transport — total monthly load." },
  soleil: { label: "Sunshine", tagline: "Sunny days per year, mild winters." },
  securite: { label: "Safety", tagline: "Crime rates per 1,000 inhabitants (SSMSI)." },
  culture: { label: "Culture", tagline: "Museums, concerts, theatres, festivals." },
  mobilite: { label: "Mobility", tagline: "Public transit, walkability, bike lanes." },
  investissement: { label: "Property investment", tagline: "Yield, demand, price trajectory." },
  sante: { label: "Healthcare", tagline: "GPs, specialists, hospital coverage." },
  climat: { label: "Climate 2040", tagline: "Heat, water stress, projected liveability." },
  logement: { label: "Housing affordability", tagline: "Rent and purchase price vs local wages." },
  gastronomie: { label: "Food scene", tagline: "Restaurants, markets, regional specialities." },
};

export const metadata: Metadata = {
  title: "French city rankings · 13 themed leaderboards (2026)",
  description:
    "Independent rankings of French cities across 13 themes (remote work, families, retirees, climate, etc.). Calibrated on official data — Insee, SSMSI, observatoires des loyers.",
  alternates: { canonical: `${EN_BASE}/rankings` },
};

export default function EnRankingsIndex() {
  const all = Object.values(RANKING_META);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-10 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          {t("rankings.title", "en")}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          {t("rankings.intro", "en")}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {all.map((r) => {
            const en = RANKING_EN_LABELS[r.slug] ?? { label: r.label, tagline: "" };
            return (
              <li key={r.slug}>
                <Link
                  href={`/rankings/${r.slug}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden>
                      {r.emoji}
                    </span>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                      {en.label}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {en.tagline}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Footer />
    </main>
  );
}
