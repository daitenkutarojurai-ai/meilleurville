import type { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { MapsQuickSearch } from "@/components/MapsQuickSearch";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternatesEn } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";

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
    alternates: cityAlternatesEn("schools", slug),
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

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: c.name, path: `/cities/${slug}` },
    { name: "Schools", path: `/cities/${slug}/schools` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />
      <section className="relative overflow-hidden bg-aurora pt-20 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
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
            Schools in <span className="gradient-text">{c.name}</span>
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Schools score: <span className={`font-mono-data font-bold ${scoreColor(score)}`}>{score.toFixed(1)}/10</span>. {schoolsVerdict(score)}
        </p>
        </div>
      </section>

      {/* How French schools work — indigo band */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How French schools work (quick refresher for newcomers)</h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2">
          <li>· <strong className="text-[var(--text-primary)]">Maternelle</strong> (kindergarten) — ages 3–6, near-universal.</li>
          <li>· <strong className="text-[var(--text-primary)]">École élémentaire</strong> — ages 6–10, five years.</li>
          <li>· <strong className="text-[var(--text-primary)]">Collège</strong> — ages 11–14, ends with the Brevet.</li>
          <li>· <strong className="text-[var(--text-primary)]">Lycée</strong> — ages 15–17, ends with the Baccalauréat. General, technological, or vocational tracks.</li>
          <li>· <strong className="text-[var(--text-primary)]">Higher education</strong> — university, classes préparatoires, grandes écoles.</li>
        </ul>
        </div>
        </div>
      </section>

      {/* What the score reflects — sky band */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold mb-3"><span className="gradient-text">What the score reflects</span></h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2">
          <li>· Density of public and private schools per capita</li>
          <li>· Outcomes: Brevet and Baccalauréat pass rates vs national average</li>
          <li>· Presence of bilingual / international sections (where relevant)</li>
          <li>· Higher-education offer — universities, BTS, grandes écoles</li>
          <li>· Travel times from typical residential neighbourhoods</li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="grad-head-0 rounded-full px-5 py-2.5 font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/famille" className="rounded-full bg-[var(--band-indigo)] px-5 py-2.5 font-semibold text-[#3730A3] transition-colors hover:bg-[#DCD7FF]">Best for families</Link>
          <Link href="/rankings/etudiant" className="rounded-full bg-[var(--band-indigo)] px-5 py-2.5 font-semibold text-[#3730A3] transition-colors hover:bg-[#DCD7FF]">Best for students</Link>
        </div>
        </div>
      </section>
      <section className="band band-white py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <MapsQuickSearch topic="ecoles" cityName={c.name} department={c.department} locale="en" />
        </div>
        <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>
      <Footer />
    </main>
  );
}
