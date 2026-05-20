import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeWaterStress, type WaterLevel } from "@/lib/water-stress";
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
    title: `${c.name} water stress — droughts, restrictions, supply (2026)`,
    description: `Water stress in ${c.name}: summer restrictions, aquifer health, climate trend and supply security. An increasingly important factor.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/water` },
  };
}

const LEVEL_LABEL: Record<WaterLevel, string> = {
  faible: "Low",
  modere: "Moderate",
  eleve: "High",
  fort: "Severe",
};

const HERO_VERDICT: Record<WaterLevel, string> = {
  faible: "Water stress is low here — summers rarely bring meaningful restrictions.",
  modere: "Moderate water stress: occasional summer restrictions, nothing that should change your decision.",
  eleve: "Water stress runs high. Summer restrictions are now routine — factor it in if you want a garden or a pool.",
  fort: "Water stress is severe. Hosepipe bans and tightening supply are part of the local summer — a real long-term consideration.",
};

const DIMS: { key: "restrictions" | "aquifer" | "climate" | "supply"; label: string; note: string }[] = [
  { key: "restrictions", label: "Summer restrictions", note: "How often usage limits are imposed" },
  { key: "aquifer", label: "Aquifer health", note: "Groundwater table levels" },
  { key: "climate", label: "Climate trend", note: "Drought trajectory for the area" },
  { key: "supply", label: "Supply security", note: "Resilience of the local water network" },
];

export default async function EnCityWater({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const water = computeWaterStress(c);
  // The lib composite is 0-10 where 10 = most stressed. Present "10 = best".
  const score = Math.round((10 - water.composite) * 10) / 10;

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
          <span>Water</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>💧</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Water stress in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Water-security score: <span className={`font-mono-data font-bold ${scoreColor(score)}`}>{score.toFixed(1)}/10</span>{" "}
          (stress level: {LEVEL_LABEL[water.level]}). {HERO_VERDICT[water.level]}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = water[d.key];
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
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Why this is on the list</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
          Water used to be a non-question in France. It isn't any more. Large parts of the Mediterranean south and inland Occitanie now see summer usage restrictions every year, and the trend is one-directional. If you're buying for the long term — especially with a garden, a pool, or in a rural area on a stretched network — this belongs in the decision, not as an afterthought.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href={`/cities/${slug}/climate`} className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">{c.name} climate</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
