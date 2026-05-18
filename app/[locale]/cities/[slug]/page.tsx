import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import {
  t,
  getCityTitle,
  getCityDescription,
  getCityBody,
  ORIGIN_BY_LOCALE,
} from "@/lib/i18n";
import { scoreColor, sunshineDays } from "@/lib/utils";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

const EN_BASE = ORIGIN_BY_LOCALE.en;
const FR_BASE = ORIGIN_BY_LOCALE.fr;

// Build all 352 EN city pages at compile time, matching the FR site's
// generateStaticParams pattern in app/villes/[slug]/page.tsx.
export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};

  const title = getCityTitle(city, "en");
  const description = getCityDescription(city, "en");

  return {
    title,
    description,
    alternates: {
      canonical: `${EN_BASE}/cities/${slug}`,
      languages: {
        "fr-FR": `${FR_BASE}/villes/${slug}`,
        "en-US": `${EN_BASE}/cities/${slug}`,
        "x-default": `${EN_BASE}/cities/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `${EN_BASE}/cities/${slug}`,
      title: `${city.name} — BestCitiesInFrance · ${city.scores.global.toFixed(1)}/10`,
      description,
    },
  };
}

const SCORE_KEYS = [
  ["life", "city.score.life"],
  ["transport", "city.score.transport"],
  ["nature", "city.score.nature"],
  ["cost", "city.score.cost"],
  ["safety", "city.score.safety"],
  ["culture", "city.score.culture"],
  ["remoteWork", "city.score.remoteWork"],
  ["schools", "city.score.schools"],
] as const;

export default async function EnCityPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const housing = getHousing(city.slug);
  const body = getCityBody(city, "en");

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <article className="mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-12">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--text-secondary)] mb-4">
          <Link href="/" className="hover:underline">
            {t("nav.home", "en")}
          </Link>{" "}
          ·{" "}
          <Link href="/cities" className="hover:underline">
            {t("nav.cities", "en")}
          </Link>{" "}
          · <span>{city.name}</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            {city.name}
          </h1>
          <p className="text-[var(--text-secondary)] text-base">
            {city.department ? `${t("city.department", "en")}: ${city.department}` : null}
            {city.department && city.region ? " · " : null}
            {city.region ? `${t("city.region", "en")}: ${city.region}` : null}
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 mb-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {t("city.score.global", "en")}
            </h2>
            <span
              className={`font-mono-data text-4xl font-bold ${scoreColor(city.scores.global)}`}
            >
              {city.scores.global.toFixed(1)}/10
            </span>
          </div>
          <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {SCORE_KEYS.map(([key, label]) => (
              <div key={key} className="rounded-lg bg-[var(--bg-canvas)] p-3">
                <dt className="text-[var(--text-secondary)] text-xs">
                  {t(label, "en")}
                </dt>
                <dd className="font-mono-data font-bold text-[var(--text-primary)]">
                  {city.scores[key].toFixed(1)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {body ? (
          <section className="prose prose-neutral max-w-none mb-8 text-[var(--text-primary)]">
            <p className="text-base leading-relaxed">{body}</p>
          </section>
        ) : (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 mb-8 text-sm text-amber-900">
            English long-form description for {city.name} is not yet available — quality-of-life scores and basic stats above are calibrated on the same French sources used across the site.
          </section>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {city.population != null && (
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">
                {t("city.population", "en")}
              </p>
              <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">
                {city.population.toLocaleString("en-US")}
              </p>
            </div>
          )}
          {city.sunshinedays != null && (
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">
                {t("city.sunshine", "en")}
              </p>
              <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">
                {sunshineDays(city.sunshinedays)}
              </p>
            </div>
          )}
          {housing?.avgRentT2 != null && (
            <div className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">
                Avg. T2 rent (€/month)
              </p>
              <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">
                {housing.avgRentT2}
              </p>
            </div>
          )}
        </section>

        <section className="text-sm text-[var(--text-secondary)]">
          <p>
            Looking for the French-language version with neighbourhoods, schools, and
            climate sub-pages? <a className="underline" href={`${FR_BASE}/villes/${city.slug}`}>{city.name} on mavilleideale.fr</a>.
          </p>
        </section>
      </article>

      <Footer />
    </main>
  );
}
