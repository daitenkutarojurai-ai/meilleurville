import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeNaturalRisks, type RiskLevel } from "@/lib/natural-risks";
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
    title: `${c.name} natural risks — flood, seismic, clay, wildfire (2026)`,
    description: `Natural-risk exposure in ${c.name}: flooding, seismic activity, clay-shrinkage subsidence and wildfire. What to check before you buy.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/natural-risks` },
  };
}

const LEVEL_LABEL: Record<RiskLevel, string> = {
  faible: "Low",
  modere: "Moderate",
  eleve: "Elevated",
  fort: "High",
};

const HERO_VERDICT: Record<RiskLevel, string> = {
  faible: "Natural-risk exposure is low here — nothing that should shape where you buy.",
  modere: "Moderate natural-risk exposure: worth a look at the official risk map, but not a red flag.",
  eleve: "Natural-risk exposure is elevated. Check the property-specific risk report before you commit — it materially affects insurance.",
  fort: "High natural-risk exposure. The official état des risques is essential reading here, and it will affect both insurance cost and resale.",
};

const DIMS: { key: "flood" | "seismic" | "clay" | "wildfire"; label: string; note: string }[] = [
  { key: "flood", label: "Flood", note: "River and run-off flooding exposure" },
  { key: "seismic", label: "Seismic", note: "Earthquake zoning (2011 national map)" },
  { key: "clay", label: "Clay shrinkage", note: "Subsidence from clay soils in drought" },
  { key: "wildfire", label: "Wildfire", note: "Forest-fire exposure" },
];

export default async function EnCityRisks({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const risks = computeNaturalRisks(c);
  // The lib composite is 0-10 where 10 = highest risk. Present "10 = safest".
  const safeScore = Math.round((10 - risks.composite) * 10) / 10;

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
          <span>Natural risks</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🌊</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Natural risks in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Low-risk score: <span className={`font-mono-data font-bold ${scoreColor(safeScore)}`}>{safeScore.toFixed(1)}/10</span>{" "}
          (overall exposure: {LEVEL_LABEL[risks.level]}). {HERO_VERDICT[risks.level]}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = risks[d.key];
          const dimScore = Math.round((10 - dim.score) * 10) / 10;
          return (
            <div key={d.key} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-[var(--text-primary)]">{d.label}</p>
                <span className={`font-mono-data font-bold ${scoreColor(dimScore)}`}>{dimScore.toFixed(1)}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {LEVEL_LABEL[dim.level]} risk — {d.note}
              </p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Why this matters when you buy</h2>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
          When you buy or rent in France, the seller or landlord must give you an <em>état des risques</em> — a property-specific natural-risk statement. It's not optional paperwork:
        </p>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· Risk exposure drives home-insurance pricing, and in high-risk zones can make cover hard to get.</li>
          <li>· Clay-shrinkage subsidence is the quiet one — drought cycles crack foundations, and claims have risen sharply.</li>
          <li>· City-level scores are a first filter; the property's exact location can be very different from the city average.</li>
        </ul>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href={`/cities/${slug}/climate`} className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">{c.name} climate</Link>
          <Link href="/natural-risks" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">📊 National natural-risks ranking</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
