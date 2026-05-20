import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeAirQuality, type AirLevel } from "@/lib/air-quality";
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
    title: `${c.name} air quality — NO₂, PM2.5, ozone, pollen (2026)`,
    description: `Air quality in ${c.name}: nitrogen dioxide, fine particles, ozone and pollen exposure. What the air is actually like to breathe year-round.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/air-quality` },
  };
}

const LEVEL_LABEL: Record<AirLevel, string> = {
  faible: "Clean",
  modere: "Moderate",
  eleve: "Elevated",
  fort: "Poor",
};

const HERO_VERDICT: Record<AirLevel, string> = {
  faible: "The air here is clean — pollution sits well below the levels that affect health.",
  modere: "Air quality is moderate: fine for most people, with the odd spike on still winter days or hot summer afternoons.",
  eleve: "Air pollution runs elevated. People with asthma or young children will notice it — worth weighing if respiratory health matters to you.",
  fort: "Air quality is poor by French standards — recurring pollution episodes. Take it seriously if anyone in the household has a respiratory condition.",
};

const DIMS: { key: "no2" | "pm25" | "ozone" | "pollen"; label: string; note: string }[] = [
  { key: "no2", label: "NO₂", note: "Nitrogen dioxide — road traffic and diesel" },
  { key: "pm25", label: "PM2.5", note: "Fine particles — heating and industry" },
  { key: "ozone", label: "Ozone", note: "Photochemical — heat and sunshine" },
  { key: "pollen", label: "Pollen", note: "Allergenic pollen load" },
];

export default async function EnCityAir({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const air = computeAirQuality(c);
  // The lib composite is 0-10 where 10 = most polluted. Present an intuitive
  // "10 = cleanest" score.
  const cleanScore = Math.round((10 - air.composite) * 10) / 10;

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
          <span>Air quality</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🌬️</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Air quality in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Air quality score: <span className={`font-mono-data font-bold ${scoreColor(cleanScore)}`}>{cleanScore.toFixed(1)}/10</span>{" "}
          ({LEVEL_LABEL[air.level]}). {HERO_VERDICT[air.level]}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = air[d.key];
          const dimScore = Math.round((10 - dim.score) * 10) / 10;
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
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">What this covers</h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· <strong className="text-[var(--text-primary)]">NO₂</strong> — mostly road traffic. Big metros with a saturated ring road tend to exceed WHO guidelines.</li>
          <li>· <strong className="text-[var(--text-primary)]">PM2.5</strong> — fine particles from heating and industry. Worst on cold, still winter days.</li>
          <li>· <strong className="text-[var(--text-primary)]">Ozone</strong> — forms in heat and sunshine, so it peaks in southern France in summer.</li>
          <li>· <strong className="text-[var(--text-primary)]">Pollen</strong> — the allergenic load, which varies a lot by surrounding vegetation.</li>
        </ul>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/ecologie" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Ecology &amp; air ranking</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
