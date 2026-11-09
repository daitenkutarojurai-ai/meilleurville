import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { CITIES_SEED } from "@/data/cities-seed";
import { pathAlternatesEn } from "@/lib/i18n";
import { regionToSlug } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Cities by region · All French regions",
  description:
    "Explore the best French cities region by region: Brittany, Occitanie, PACA, Auvergne-Rhône-Alpes and more. Compared scores, top cities.",
  alternates: pathAlternatesEn("/regions", "/regions"),
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
      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <EmojiBadge emoji="🗺️" tone="indigo" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              {list.length} regions
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Cities <span className="font-display gradient-text-anim italic">by region</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            The 18 French regions, sorted by average quality-of-life score. Click a region to see all its cities.
          </p>
          <Link
            href="/compare-regions"
            className="mt-5 inline-flex items-center gap-2 rounded-full grad-head-0 px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
          >
            🗺️ Compare two regions side by side
          </Link>
        </div>
      </section>
      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/regions/${r.slug}`}
                  className="group block h-full rounded-3xl bg-white p-5 ring-1 ring-[#E0E7FF] shadow-[0_12px_30px_-20px_rgba(79,70,229,0.55)] transition-all hover:-translate-y-0.5 hover:ring-[#A5B4FC]"
                >
                  <div className="flex items-center gap-3">
                    <EmojiBadge emoji={REGION_EMOJIS[r.name] ?? "🇫🇷"} tone={toneFor(r.slug)} className="shrink-0" />
                    <h2 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">{r.name}</h2>
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    {r.count} cities · top: {r.topCity} · avg score{" "}
                    <span className="font-mono-data font-bold text-[#4338CA]">{r.avgScore.toFixed(1)}</span>/10
                  </p>
                </Link>
              </li>
            ))}
          </ul>
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
