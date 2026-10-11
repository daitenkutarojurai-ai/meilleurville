import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, deptNumber } from "@/lib/dept-slug";
import { DepartementFinder, type DeptEntry } from "@/components/DepartementFinder";
import { DepartementMap, type DeptMapEntry } from "@/components/DepartementMap";
import { pathAlternatesEn } from "@/lib/i18n";

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
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          Cities by department
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          {sortedDepts.length} French departments, {CITIES_SEED.length} cities ranked by overall score. Click the map, or type a number, a name or your city.
        </p>
      </section>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <DepartementMap entries={mapEntries} locale="en" />
        <DepartementFinder depts={deptEntries} cityIndex={cityIndex} locale="en" />

        {/* Full city-by-city index: collapsed but in the static HTML, so all
            city links stay crawlable. */}
        <details className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]">
            All cities, department by department
          </summary>
          <div className="mt-5 space-y-5">
            {sortedDepts.map(({ dept, num, cities, avgScore }) => (
              <div key={dept}>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">
                  <span className="font-mono-data text-[var(--text-tertiary)]">{num}</span> {dept}{" "}
                  <Link
                    href={`/departments/${deptToSlug(dept)}`}
                    className="text-xs font-medium text-[var(--accent)] hover:underline"
                  >
                    guide →
                  </Link>
                </h2>
                <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                  {cities.length} {cities.length > 1 ? "cities" : "city"} · average {avgScore.toFixed(1)}/10
                </div>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/cities/${city.slug}`}
                      className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
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
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-10">
        <Link
          href="/compare-departments"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
        >
          📍 Compare two departments side by side
        </Link>
      </section>
      <Footer />
    </main>
  );
}
