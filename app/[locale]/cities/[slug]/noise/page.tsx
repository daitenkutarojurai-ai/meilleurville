import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeNoiseExposure, type NoiseLevel } from "@/lib/noise-exposure";
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
    title: `${c.name} noise — road, air, rail, nightlife (2026)`,
    description: `Noise exposure in ${c.name}: traffic, aircraft, rail and night-time urban noise. How quiet it actually is to live here.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/noise` },
  };
}

const LEVEL_LABEL: Record<NoiseLevel, string> = {
  faible: "Quiet",
  modere: "Moderate",
  eleve: "Noisy",
  fort: "Loud",
};

const HERO_VERDICT: Record<NoiseLevel, string> = {
  faible: "This is a quiet place — no major noise source dominates daily life.",
  modere: "Noise is moderate: ordinary town background, with the odd loud street or busy road.",
  eleve: "Noise exposure runs high. Pick your street carefully — the difference between blocks can be large.",
  fort: "Noise exposure is heavy here. If quiet matters to you, the specific address and floor will make or break it.",
};

const DIMS: { key: "road" | "aircraft" | "rail" | "urbanNight"; label: string; note: string }[] = [
  { key: "road", label: "Road traffic", note: "Motorway, ring road, major boulevards" },
  { key: "aircraft", label: "Aircraft", note: "Airport noise-exposure zones" },
  { key: "rail", label: "Rail", note: "High-speed and main-line railways" },
  { key: "urbanNight", label: "Night-time urban", note: "Bars, city centre, neighbourhood noise" },
];

export default async function EnCityNoise({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const noise = computeNoiseExposure(c);
  // The lib composite is 0-10 where 10 = loudest. Present "10 = quietest".
  const quietScore = Math.round((10 - noise.composite) * 10) / 10;

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
          <span>Noise</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🔇</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Noise in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Quiet score: <span className={`font-mono-data font-bold ${scoreColor(quietScore)}`}>{quietScore.toFixed(1)}/10</span>{" "}
          ({LEVEL_LABEL[noise.level]}). {HERO_VERDICT[noise.level]}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = noise[d.key];
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
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">A note on noise</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
          Noise is the most address-specific factor on this site — a city-level figure hides huge variation between a flat on a ring road and one on a courtyard 200 metres away. Treat this as a backdrop, then visit at the times you most value quiet: a weekday rush hour and a Friday night.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href={`/cities/${slug}/transport`} className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">{c.name} transport</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
