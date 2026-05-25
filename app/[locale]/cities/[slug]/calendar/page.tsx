import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAgenda } from "@/lib/city-agenda";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Annual calendar of events in ${city.name} 2026 | Best Cities in France`,
    description: `What to do in ${city.name} month by month: festivals, markets, national and regional events, best seasons to visit. Indicative 2026 calendar.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/calendar` },
  };
}

const CATEGORY_COLOR: Record<string, string> = {
  national: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  regional: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  saisonnier: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  local: "bg-violet-500/10 text-violet-700 border-violet-500/20",
};
const CATEGORY_LABEL: Record<string, string> = {
  national: "National",
  regional: "Regional",
  saisonnier: "Seasonal",
  local: "Local",
};

export default async function EnCalendarPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const agenda = cityAgenda(city);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${city.slug}` },
    { name: "Calendar", path: `/cities/${city.slug}/calendar` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />
        <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] p-2.5">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                  Annual calendar — {city.name}
                </h1>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  Indicative 2026 calendar. Always confirm exact dates with the town hall or local tourist office.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <ol className="space-y-4">
              {agenda.map((item, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)] w-20 shrink-0">
                      {item.monthLabelEn}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLOR[item.category]}`}
                    >
                      {CATEGORY_LABEL[item.category]}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {item.titleEn}
                  </h2>
                  <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
                    {item.bodyEn}
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                    Source: {item.source}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-8 text-xs text-[var(--text-tertiary)] leading-relaxed">
              This calendar mixes confirmed national events (Bastille Day, Heritage Days), structural regional events (Cannes, Avignon, Lorient, Alsatian Christmas markets) and seasonal indicators derived from the city's average climate. No exact date is guaranteed without checking with organisers.
            </p>

            <div className="mt-8">
              <Link
                href={`/cities/${city.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Back to {city.name}
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
