import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, deptNumber } from "@/lib/dept-slug";
import { DepartementFinder, type DeptEntry } from "@/components/DepartementFinder";
import { DepartementMap, type DeptMapEntry } from "@/components/DepartementMap";
import { pathAlternatesEn } from "@/lib/i18n";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { EmojiBadge } from "@/components/EmojiBadge";

export const metadata: Metadata = {
  title: "Cities by department · All French departments",
  description:
    "Explore French cities department by department. Each department lists its main cities ranked by quality of life.",
  alternates: pathAlternatesEn("/departements", "/departments"),
};

export default function EnDepartmentsHub() {
  const byDept = new Map<string, typeof CITIES_SEED>();
  for (const c of CITIES_SEED) {
    if (!c.department) continue;
    const list = byDept.get(c.department);
    if (list) list.push(c);
    else byDept.set(c.department, [c]);
  }
  const sortedDepts = [...byDept.entries()]
    .map(([dept, cities]) => ({
      dept,
      num: deptNumber(dept, cities[0].inseeCode),
      cities: [...cities].sort((a, b) => b.scores.global - a.scores.global),
      avgScore: cities.reduce((s, c) => s + c.scores.global, 0) / cities.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  const deptEntries: DeptEntry[] = sortedDepts.map(({ dept, num, cities, avgScore }) => ({
    dept,
    slug: deptToSlug(dept),
    num,
    count: cities.length,
    avg: avgScore,
  }));

  const mapEntries: DeptMapEntry[] = sortedDepts.map(({ dept, num, cities, avgScore }) => ({
    slug: deptToSlug(dept),
    dept,
    num,
    cities: cities.length,
    avg: avgScore,
    lng: cities.reduce((s, c) => s + c.longitude, 0) / cities.length,
    lat: cities.reduce((s, c) => s + c.latitude, 0) / cities.length,
  }));

  const cityIndex: Array<[string, string]> = sortedDepts.flatMap(({ num, cities }) =>
    cities.map((c) => [c.name, num] as [string, string])
  );

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <nav className="flex items-center justify-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Departments</span>
          </nav>
          <div className="flex items-center justify-center gap-3 mb-3">
            <EmojiBadge emoji="🏙️" tone="pink" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              {sortedDepts.length} departments
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Cities by <span className="font-display gradient-text-anim italic">department</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            {sortedDepts.length} French departments, {CITIES_SEED.length} cities ranked by overall score. Click the map, or type a number, a name or your city.
          </p>
        </div>
      </section>
      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <DepartementMap entries={mapEntries} locale="en" />
        </div>
      </section>
      <section className="band band-sky py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <DepartementFinder depts={deptEntries} cityIndex={cityIndex} locale="en" />
        </div>
      </section>
      <section className="band band-lilac py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Full city-by-city index: collapsed but in the static HTML, so all
            city links stay crawlable. */}
        <details className="rounded-3xl bg-white p-5 sm:p-6 shadow-[0_14px_36px_-22px_rgba(124,58,237,0.5)] ring-1 ring-[#DDD6FE]">
          <summary className="cursor-pointer text-base font-bold gradient-text">
            All cities, department by department
          </summary>
          <div className="mt-5 space-y-5">
            {sortedDepts.map(({ dept, num, cities, avgScore }) => (
              <div key={dept}>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  <span className="mr-1 inline-flex rounded-md bg-[#EEF2FF] px-1.5 py-0.5 font-mono-data text-xs text-[#4338CA]">{num}</span> {dept}{" "}
                  <Link
                    href={`/departments/${deptToSlug(dept)}`}
                    className="text-xs font-semibold text-[#BE185D] hover:underline"
                  >
                    guide →
                  </Link>
                </h2>
                <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {cities.length} {cities.length > 1 ? "cities" : "city"} · average {avgScore.toFixed(1)}/10
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/cities/${city.slug}`}
                      className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[#4338CA]"
                    >
                      {city.name}{" "}
                      <span className="font-mono-data text-xs text-[var(--text-tertiary)]">
                        {city.scores.global.toFixed(1)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>
          <div className="pt-8">
            <Link
              href="/compare-departments"
              className="inline-flex items-center gap-2 rounded-full grad-head-0 px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
            >
              📍 Compare two departments side by side
            </Link>
          </div>
        </div>
      </section>
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget locale="en" />
        </div>
      </section>
      <Footer />
    </main>
  );
}
