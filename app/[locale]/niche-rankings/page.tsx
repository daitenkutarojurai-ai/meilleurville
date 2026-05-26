import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Niche city rankings — France 2026 · BestCitiesInFrance",
  description:
    "10 specialised city rankings for France: best air quality, quietest, safest for women, car-free, heatwave-resistant, remote work (fibre-adjusted), social capital, and more.",
  alternates: { canonical: `${EN_BASE}/niche-rankings` },
};

const NICHE_RANKINGS = [
  { slug: "air-quality",        emoji: "🍃", label: "Best air quality",           desc: "PM2.5 per department — Atlantic and coastal cities dominate." },
  { slug: "quietest",           emoji: "🤫", label: "Quietest cities",             desc: "Population + density + IDF penalty. Provincial cities win." },
  { slug: "safest-for-women",   emoji: "👤", label: "Safest for women solo",       desc: "Safety index + evening transport density. Late-night peace of mind." },
  { slug: "night-safety",       emoji: "🌙", label: "Night safety",                desc: "Safety score adjusted for after-dark incidents and nightlife." },
  { slug: "car-free",           emoji: "🚲", label: "Car-free living",             desc: "Public transport quality. Penalty for small cities with sparse TER." },
  { slug: "remote-work",        emoji: "💻", label: "Remote work (fibre-adjusted)", desc: "Quality of life + FTTH fibre by department (ARCEP Q4 2024)." },
  { slug: "heatwave-resistant", emoji: "🥵", label: "Heatwave resistance",         desc: "July averages vs 22°C comfort baseline. Brittany and Normandy lead." },
  { slug: "social-capital",     emoji: "🤝", label: "Social capital",              desc: "Inverse of single-person household share. Smaller cities win." },
  { slug: "young-professionals", emoji: "🚀", label: "Young professionals",        desc: "Culture × 2, transport, remote work, cost. For 25–35s building a career." },
  { slug: "families",           emoji: "👨‍👩‍👧", label: "Families (niche score)",   desc: "Schools × 3, safety, nature, housing affordability." },
];

export default function NicheRankingsIndex() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="mb-3 inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-sm text-[var(--text-secondary)]">
            📊 Specialist city rankings
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Niche city rankings
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            10 specialist rankings that go beyond the main scores — each focused on a single
            factor: air quality, noise, night safety, car-free infrastructure, heatwave
            resistance, and more.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {NICHE_RANKINGS.map((r) => (
            <Link key={r.slug} href={`/niche-rankings/${r.slug}`} className="block">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 cursor-pointer transition-colors h-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl" aria-hidden>{r.emoji}</span>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">{r.label}</h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{r.desc}</p>
                <p className="text-[11px] text-[var(--accent)] mt-3 underline">See top 50 →</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <p className="text-sm text-[var(--text-secondary)]">
            These niche rankings use derived scores (proxy v0) computed from existing data.
            See also the{" "}
            <Link href="/rankings" className="underline text-[var(--accent)]">
              main city rankings
            </Link>{" "}
            or the{" "}
            <Link href="/for-who" className="underline text-[var(--accent)]">
              rankings by lifestyle profile
            </Link>
            .
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
