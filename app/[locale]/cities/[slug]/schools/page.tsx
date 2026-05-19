import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
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
    title: `${c.name} schools — primary, secondary, higher education (2026)`,
    description: `Schools in ${c.name}: academic outcomes, school density, options for international or alternative education.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/schools` },
  };
}

function schoolsVerdict(score: number): string {
  if (score >= 8) return "Very strong. Multiple high-performing options, good coverage from primary to lycée.";
  if (score >= 7) return "Solid. Outcomes above the national average, decent variety.";
  if (score >= 6) return "Average to good. Most needs are covered, edge cases (bilingual, alternative) may require travel.";
  if (score >= 5) return "Mixed. Some options are strong, others lag. Worth visiting before committing.";
  return "Below average. Investigate carefully — interview headteachers, check school-by-school stats.";
}

export default async function EnCitySchools({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const score = c.scores.schools;

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
          <span>Schools</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🎓</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Schools in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Schools score: <span className={`font-mono-data font-bold ${scoreColor(score)}`}>{score.toFixed(1)}/10</span>. {schoolsVerdict(score)}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How French schools work (quick refresher for newcomers)</h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· <strong className="text-[var(--text-primary)]">Maternelle</strong> (kindergarten) — ages 3–6, near-universal.</li>
          <li>· <strong className="text-[var(--text-primary)]">École élémentaire</strong> — ages 6–10, five years.</li>
          <li>· <strong className="text-[var(--text-primary)]">Collège</strong> — ages 11–14, ends with the Brevet.</li>
          <li>· <strong className="text-[var(--text-primary)]">Lycée</strong> — ages 15–17, ends with the Baccalauréat. General, technological, or vocational tracks.</li>
          <li>· <strong className="text-[var(--text-primary)]">Higher education</strong> — university, classes préparatoires, grandes écoles.</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">What the score reflects</h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· Density of public and private schools per capita</li>
          <li>· Outcomes: Brevet and Baccalauréat pass rates vs national average</li>
          <li>· Presence of bilingual / international sections (where relevant)</li>
          <li>· Higher-education offer — universities, BTS, grandes écoles</li>
          <li>· Travel times from typical residential neighbourhoods</li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/famille" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Best for families</Link>
          <Link href="/rankings/etudiant" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">Best for students</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
