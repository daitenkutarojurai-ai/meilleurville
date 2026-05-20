import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeCyclingMobility, type CyclingLevel } from "@/lib/cycling-mobility";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";

const EN_BASE = ORIGIN_BY_LOCALE.en;

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
    title: `${c.name} cycling — bike network, terrain, safety (2026)`,
    description: `How bike-friendly is ${c.name}? Cycle network, topography, road safety and year-round usability for everyday cycling.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/cycling` },
  };
}

const LEVEL_LABEL: Record<CyclingLevel, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Average",
  difficile: "Difficult",
};

const HERO_VERDICT: Record<CyclingLevel, string> = {
  excellent: "Excellent for cycling — a real network, manageable terrain, and you can leave the car at home most days.",
  bon: "Good for cycling: a usable network with the odd gap. Everyday bike trips are realistic.",
  moyen: "Average for cycling. Doable for the committed, but the network has holes — scout your regular routes.",
  difficile: "Difficult for everyday cycling — thin infrastructure, tough terrain or both. Treat the bike as leisure, not transport.",
};

// Note: lib/cycling-mobility runs the OTHER way from most compute* libs —
// composite 10 = best. So scores are used directly, not flipped.
const DIMS: { key: "network" | "topography" | "safety" | "climate"; label: string; note: string }[] = [
  { key: "network", label: "Network", note: "Cycle lanes and greenways" },
  { key: "topography", label: "Terrain", note: "How hilly the everyday rides are" },
  { key: "safety", label: "Safety", note: "Road danger and protected infrastructure" },
  { key: "climate", label: "Climate", note: "Weather you can actually ride in" },
];

export default async function EnCityCycling({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const cycling = computeCyclingMobility(c);
  // composite is already 0-10 with 10 = best — use directly.
  const score = Math.round(cycling.composite * 10) / 10;

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{c.name}</Link>
          {" · "}
          <span>Cycling</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🚲</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Cycling in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Cycling score: <span className={`font-mono-data font-bold ${scoreColor(score)}`}>{score.toFixed(1)}/10</span>{" "}
          ({LEVEL_LABEL[cycling.level]}). {HERO_VERDICT[cycling.level]}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = cycling[d.key];
          const dimScore = Math.round(dim.score * 10) / 10;
          return (
            <div key={d.key} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-[var(--text-primary)]">{d.label}</p>
                <span className={`font-mono-data font-bold ${scoreColor(dimScore)}`}>{dimScore.toFixed(1)}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {LEVEL_LABEL[dim.level]} — {d.note}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">What the score weighs</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
          A bike-friendly city isn't just kilometres of painted lane — it's whether the network actually connects, whether the terrain is rideable without athletic legs, whether drivers and cyclists coexist safely, and whether the weather lets you ride for more than four months a year. France's mid-size cities have invested heavily in cycling over the past decade; the gap between the best and worst is now wide.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/cyclistes" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Cycling ranking</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
