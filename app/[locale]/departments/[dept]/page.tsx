import { Metadata } from "next";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { DepartementFiche } from "@/components/DepartementFiche";
import { DepartementVoisins } from "@/components/DepartementVoisins";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, slugToDept } from "@/lib/dept-slug";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE, hreflangLanguagesEn } from "@/lib/i18n";
import { jsonLdScript } from "@/lib/jsonld";
import { fitTitle } from "@/lib/brand";

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
    title: fitTitle(`Cities in ${name} — French department guide`),
    description: `Cities ranked in ${name}. Quality of life, housing, safety, and resident reviews.`,
    alternates: { canonical: `${EN_BASE}/departments/${dept}`, languages: hreflangLanguagesEn(`/departments/${dept}`) },
  };
}

export default async function EnDepartmentDetail({ params }: Props) {
  const { dept } = await params;
  const name = slugToDept(dept);
  if (!name) notFound();

  const cities = CITIES_SEED
    .filter((c) => c.department === name)
    .sort((a, b) => b.scores.global - a.scores.global);

  const topCity = cities[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
          { "@type": "ListItem", position: 2, name: "Departments", item: `${EN_BASE}/departments` },
          { "@type": "ListItem", position: 3, name: name, item: `${EN_BASE}/departments/${dept}` },
        ],
      },
      {
        "@type": "ItemList",
        name: `Best cities in ${name}`,
        url: `${EN_BASE}/departments/${dept}`,
        numberOfItems: cities.length,
        // `cities` est trié par score global décroissant (voir plus haut) :
        // `ItemListOrderAscending` annonçait donc l'inverse de la liste publiée,
        // et la jumelle FR (`app/departements/[dept]`) ne déclare aucun ordre.
        // Retiré plutôt que remplacé, pour que les deux locales disent la même
        // chose. Cf. docs/integrite-2026-08-28.md.
        itemListElement: cities.slice(0, 25).map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          url: `${EN_BASE}/cities/${c.slug}`,
        })),
      },
      ...(topCity
        ? [{
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `What is the best city in ${name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Based on our scoring, the best city in ${name} is ${topCity.name} with an overall score of ${topCity.scores.global.toFixed(1)}/10, out of ${cities.length} ranked cit${cities.length > 1 ? "ies" : "y"} in the department.`,
                },
              },
            ],
          }]
        : []),
    ],
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <Navbar />
      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/departments" className="hover:text-[var(--text-secondary)] transition-colors">Departments</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{name}</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <EmojiBadge emoji="📍" tone={toneFor(dept)} />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Department
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">
            Cities in <span className="font-display gradient-text-anim italic">{name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-3xl">
            {cities.length} cities in the department, ranked by quality of life. Click a city to see its full profile.
          </p>
        </div>
      </section>

      {/* Department sub-pages — mirrors the two teasers on the FR department page. */}
      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-10">
          <div className="grid gap-3 md:grid-cols-2">
            <Link
              href={`/departments/${dept}/synthesis`}
              className="group flex flex-wrap items-center gap-3 rounded-2xl bg-white ring-1 ring-transparent hover:ring-[#C7D2FE] shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] hover:-translate-y-0.5 transition-all px-5 py-4"
            >
              <EmojiBadge emoji="✨" tone="lilac" size="sm" className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {name} cities ranked on 8 dimensions
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Environment, healthcare, employment, quality of life, cycling, safety, demographics,
                  public services — plus the department average on each axis.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold shrink-0">View →</span>
            </Link>
            <Link
              href={`/departments/${dept}/tax`}
              className="group flex flex-wrap items-center gap-3 rounded-2xl bg-white ring-1 ring-transparent hover:ring-[#C7D2FE] shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] hover:-translate-y-0.5 transition-all px-5 py-4"
            >
              <EmojiBadge emoji="💰" tone="sky" size="sm" className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  Property tax in {name}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Taxe foncière, second-home tax and transfer duties — 2026 department estimate, plus a
                  page per city.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold shrink-0">View →</span>
            </Link>
          </div>

          <DepartementFiche department={name} locale="en" />
        </div>
      </section>

      <section className="band band-sky py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <ol className="space-y-2">
            {cities.map((c, i) => (
              <li key={c.slug}>
                <Link
                  href={`/cities/${c.slug}`}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-transparent hover:ring-[#A5F3FC] shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)] transition-all hover:-translate-y-0.5"
                >
                  <span className="font-mono-data text-xl font-bold w-10 text-[#4338CA]">#{i + 1}</span>
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
        </div>
      </section>

      <section className="band band-lilac py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          <DepartementVoisins department={name} locale="en" />

      {(() => {
        // Neighbouring departments of the same region — the pairs the
        // comparator actually builds. Mirrors the FR department page so both
        // locales expose the same 390 comparisons to crawlers.
        const region = cities[0]?.region;
        if (!region) return null;
        const siblings = [
          ...new Set(
            CITIES_SEED.filter((c) => c.region === region && c.department !== name).map(
              (c) => c.department,
            ),
          ),
        ].sort((a, b) => a.localeCompare(b, "fr"));
        if (siblings.length === 0) return null;
        return (
          <div>
            <h2 className="text-xl font-bold gradient-text mb-3">
              Compare {name} with its neighbours
            </h2>
            <div className="flex flex-wrap gap-2">
              {siblings.map((s) => {
                const [x, y] = [name, s].sort((a, b) => a.localeCompare(b, "fr"));
                return (
                  <Link
                    key={s}
                    href={`/compare-departments/${deptToSlug(x)}-vs-${deptToSlug(y)}`}
                    className="rounded-full bg-white ring-1 ring-[#E9D5FF] hover:ring-[#C084FC] shadow-[0_8px_20px_-16px_rgba(124,58,237,0.5)] px-3 py-1.5 text-xs font-medium text-[#6D28D9] transition-all"
                  >
                    vs {s}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })()}
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
