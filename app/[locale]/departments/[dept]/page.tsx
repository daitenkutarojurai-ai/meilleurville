import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, slugToDept } from "@/lib/dept-slug";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; dept: string }> };

export async function generateStaticParams() {
  const depts = [...new Set(CITIES_SEED.map((c) => c.department).filter(Boolean) as string[])];
  return depts.map((d) => ({ locale: "en", dept: deptToSlug(d) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dept } = await params;
  const name = slugToDept(dept);
  if (!name) return {};
  return {
    title: `Cities in ${name} — French department guide`,
    description: `Cities ranked in ${name}. Quality of life, housing, safety, and resident reviews.`,
    alternates: { canonical: `${EN_BASE}/departments/${dept}` },
  };
}

export default async function EnDepartmentDetail({ params }: Props) {
  const { dept } = await params;
  const name = slugToDept(dept);
  if (!name) notFound();

  const cities = CITIES_SEED
    .filter((c) => c.department === name)
    .sort((a, b) => b.scores.global - a.scores.global);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-6">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/departments" className="hover:text-[var(--accent)]">Departments</Link>
          {" · "}
          <span>{name}</span>
        </nav>
        <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
          Cities in {name}
        </h1>
        <p className="text-[var(--text-secondary)]">
          {cities.length} cities in the department, ranked by quality of life. Click a city to see its full profile.
        </p>
      </section>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <ol className="space-y-2">
          {cities.map((c, i) => (
            <li key={c.slug}>
              <Link
                href={`/cities/${c.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
              >
                <span className="font-mono-data text-xl font-bold w-10 text-[var(--text-tertiary)]">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--text-primary)] truncate">{c.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{c.region ?? ""}</p>
                </div>
                <span className={`font-mono-data font-bold text-2xl ${scoreColor(c.scores.global)}`}>
                  {c.scores.global.toFixed(1)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
      <Footer />
    </main>
  );
}
