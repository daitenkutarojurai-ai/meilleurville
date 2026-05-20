import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeSafetyDeep, type SafetyLevel } from "@/lib/safety-deep";
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
    title: `${c.name} safety — crime, night safety, by the numbers (2026)`,
    description: `How safe is ${c.name}? Property crime, crimes against persons, night safety — built on SSMSI police statistics, not reputation.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/safety` },
  };
}

// The lib's composite is 0-10 where 10 = worst. EN labels for the French
// SafetyLevel enum.
const LEVEL_LABEL: Record<SafetyLevel, string> = {
  calme: "Calm",
  vigilance: "Some vigilance",
  tendu: "Strained",
  critique: "Critical",
};

const HERO_VERDICT: Record<SafetyLevel, string> = {
  calme: "By the official numbers, this is a calm city — crime rates sit below the national norm.",
  vigilance: "Ordinary big-town vigilance applies — nothing alarming, but neighbourhoods vary, so check the specific area.",
  tendu: "Crime statistics here run above average. It doesn't mean every neighbourhood is tense, but pick your area with care.",
  critique: "Crime statistics are among the highest in France. Neighbourhood choice matters enormously — research it street by street.",
};

const DIMS: { key: "property" | "persons" | "nocturnal" | "vffs"; label: string; note: string }[] = [
  { key: "property", label: "Property crime", note: "Burglary, vehicle theft, theft without violence" },
  { key: "persons", label: "Crimes against persons", note: "Assault and violence — gravity, not just frequency" },
  { key: "nocturnal", label: "Night safety", note: "How the city feels and behaves after dark" },
  { key: "vffs", label: "Violence against women", note: "Reported domestic and gender-based violence" },
];

export default async function EnCitySafety({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const safety = computeSafetyDeep(c);
  // Present an intuitive 0-10 "safety score" (higher = safer) since the lib
  // composite runs the other way (10 = worst).
  const safetyScore = Math.round((10 - safety.composite) * 10) / 10;

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
          <span>Safety</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🛡️</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Safety in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Safety score: <span className={`font-mono-data font-bold ${scoreColor(safetyScore)}`}>{safetyScore.toFixed(1)}/10</span>{" "}
          ({LEVEL_LABEL[safety.level]}). {HERO_VERDICT[safety.level]}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = safety[d.key];
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
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How to read this</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
          These figures come from SSMSI — the French Interior Ministry's statistical service — expressed per 1,000 residents, not from reputation or anecdote. Two things worth keeping in mind:
        </p>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· A city's reputation often lags its real numbers by a decade, in both directions.</li>
          <li>· City-level figures hide big neighbourhood variation. Use this as a starting filter, then check the specific area on the ground.</li>
        </ul>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/securite" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Safety ranking</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
