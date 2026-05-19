import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug } from "@/lib/dept-slug";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Cities by department · All French departments",
  description:
    "Explore French cities department by department. Each department lists its main cities ranked by quality of life.",
  alternates: { canonical: `${EN_BASE}/departments` },
};

export default function EnDepartmentsHub() {
  const map = new Map<string, { count: number; avg: number; top: string }>();
  for (const c of CITIES_SEED) {
    if (!c.department) continue;
    const e = map.get(c.department);
    if (!e) {
      map.set(c.department, { count: 1, avg: c.scores.global, top: c.name });
    } else {
      e.count += 1;
      e.avg += c.scores.global;
      if (c.scores.global > CITIES_SEED.find((x) => x.name === e.top)!.scores.global) e.top = c.name;
    }
  }
  const list = [...map.entries()]
    .map(([name, e]) => ({ name, slug: deptToSlug(name), count: e.count, avg: e.avg / e.count, top: e.top }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          Cities by department
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          {list.length} French departments, each with their main cities and quality-of-life scores.
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/departments/${d.slug}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
              >
                <h2 className="font-bold text-[var(--text-primary)]">{d.name}</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {d.count} cities · avg {d.avg.toFixed(1)}/10
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Footer />
    </main>
  );
}
