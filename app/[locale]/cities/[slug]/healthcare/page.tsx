import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeHealthcareAccess, type HealthLevel } from "@/lib/healthcare-access";
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
    title: `${c.name} healthcare access — GPs, specialists, ER (2026)`,
    description: `Healthcare access in ${c.name}: how easy it is to find a GP, see a specialist, reach emergency care. Built on DREES medical-density data.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/healthcare` },
  };
}

// The lib's composite is 0-10 where 10 = medical desert. EN labels for the
// French HealthLevel enum.
const LEVEL_LABEL: Record<HealthLevel, string> = {
  facile: "Easy access",
  correct: "Adequate",
  tendu: "Strained",
  desert: "Medical desert",
};

const HERO_VERDICT: Record<HealthLevel, string> = {
  facile: "Finding a GP and seeing a specialist is straightforward here — among the easier French cities for healthcare access.",
  correct: "Healthcare access is adequate: most needs are met, though specialist wait times can run long.",
  tendu: "Healthcare access is strained. Registering with a GP can take effort — sort it out before you move, not after.",
  desert: "This is effectively a medical desert. New arrivals routinely struggle to find a GP at all — investigate very carefully.",
};

const DIMS: { key: "generalistes" | "specialistes" | "urgences" | "pharmacies"; label: string }[] = [
  { key: "generalistes", label: "GPs" },
  { key: "specialistes", label: "Specialists" },
  { key: "urgences", label: "Emergency care" },
  { key: "pharmacies", label: "Pharmacies" },
];

export default async function EnCityHealthcare({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const access = computeHealthcareAccess(c);
  // Present an intuitive 0-10 "access score" (higher = better) since the
  // lib composite runs the other way (10 = worst).
  const accessScore = Math.round((10 - access.composite) * 10) / 10;

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
          <span>Healthcare</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🏥</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Healthcare in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Access score: <span className={`font-mono-data font-bold ${scoreColor(accessScore)}`}>{accessScore.toFixed(1)}/10</span>{" "}
          ({LEVEL_LABEL[access.level]}). {HERO_VERDICT[access.level]}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = access[d.key];
          const dimScore = Math.round((10 - dim.score) * 10) / 10;
          return (
            <div key={d.key} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-[var(--text-primary)]">{d.label}</p>
                <span className={`font-mono-data font-bold ${scoreColor(dimScore)}`}>{dimScore.toFixed(1)}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{LEVEL_LABEL[dim.level]}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">What this covers</h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· <strong className="text-[var(--text-primary)]">GPs (médecins généralistes)</strong> — the entry point to French healthcare. Density per 1,000 residents, and whether doctors are accepting new patients.</li>
          <li>· <strong className="text-[var(--text-primary)]">Specialists</strong> — availability and typical wait times for common specialties.</li>
          <li>· <strong className="text-[var(--text-primary)]">Emergency care</strong> — distance to a hospital with an ER, and ER load.</li>
          <li>· <strong className="text-[var(--text-primary)]">Pharmacies</strong> — local pharmacy coverage, including duty rotas.</li>
        </ul>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">
          Built on DREES medical-density data. To get care reimbursed you generally need a declared GP (médecin traitant) — line one up early, especially in strained areas.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/sante" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Healthcare ranking</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
