import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { regionToSlug } from "@/lib/regions";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Cities by region · All French regions",
  description:
    "Explore the best French cities region by region: Brittany, Occitanie, PACA, Auvergne-Rhône-Alpes and more. Compared scores, top cities.",
  alternates: { canonical: `${EN_BASE}/regions` },
};

const REGION_EMOJIS: Record<string, string> = {
  "Auvergne-Rhône-Alpes": "⛰️",
  "Pays de la Loire": "🌊",
  "Bretagne": "⚓",
  "Nouvelle-Aquitaine": "🍷",
  "Occitanie": "☀️",
  "Normandie": "🏰",
  "Bourgogne-Franche-Comté": "🍇",
  "Centre-Val de Loire": "🏰",
  "Hauts-de-France": "🌾",
  "Provence-Alpes-Côte d'Azur": "🌺",
  "Grand Est": "🥨",
  "Île-de-France": "🗼",
  "Corse": "🏝️",
  "La Réunion": "🌋",
  "Martinique": "🌺",
  "Guadeloupe": "🌴",
  "Guyane": "🌿",
  "Mayotte": "🐢",
};

export default function EnRegionsHub() {
  const regions = new Map<string, { count: number; topCity: string; avgScore: number }>();
  for (const c of CITIES_SEED) {
    if (!c.region) continue;
    const cur = regions.get(c.region);
    if (!cur) {
      regions.set(c.region, { count: 1, topCity: c.name, avgScore: c.scores.global });
    } else {
      cur.count += 1;
      cur.avgScore += c.scores.global;
      if (c.scores.global > CITIES_SEED.find((x) => x.name === cur.topCity)!.scores.global) {
        cur.topCity = c.name;
      }
    }
  }
  const list = [...regions.entries()].map(([name, r]) => ({
    name,
    slug: regionToSlug(name),
    count: r.count,
    topCity: r.topCity,
    avgScore: r.avgScore / r.count,
  })).sort((a, b) => b.avgScore - a.avgScore);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          Cities by region
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          The 18 French regions, sorted by average quality-of-life score. Click a region to see all its cities.
        </p>
        <Link
          href="/compare-regions"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-5 py-2.5 text-sm font-semibold text-[var(--accent)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)]/10"
        >
          🗺️ Compare two regions side by side
        </Link>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/regions/${r.slug}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden>{REGION_EMOJIS[r.name] ?? "🇫🇷"}</span>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">{r.name}</h2>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  {r.count} cities · top: {r.topCity} · avg score {r.avgScore.toFixed(1)}/10
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
