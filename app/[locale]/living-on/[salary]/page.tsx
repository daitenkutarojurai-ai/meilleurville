import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  SALARY_BRACKETS,
  parseSalaryFromSlug,
  slugForSalary,
  buildSalaryLanding,
} from "@/lib/vivre-avec";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; salary: string }> };

export async function generateStaticParams() {
  return SALARY_BRACKETS.map((s) => ({ locale: "en", salary: slugForSalary(s) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { salary } = await params;
  const s = parseSalaryFromSlug(salary);
  if (!s) return {};
  return {
    title: `Living in France on €${s.toLocaleString("en-GB")}/month 2026 · Top 10 cities`,
    description: `Net salary €${s}/month: where can you live comfortably in France? Top 10 compatible cities with a housing budget of €${Math.round(s * 0.33)}, disposable income calculation, and Paris comparison.`,
    alternates: { canonical: `${EN_BASE}/living-on/${salary}` },
  };
}

function fmtEuro(value: number): string {
  return `€${value.toLocaleString("en-GB")}`;
}

export default async function EnLivingOnPage({ params }: Props) {
  const { salary } = await params;
  const s = parseSalaryFromSlug(salary);
  if (!s) notFound();

  const landing = buildSalaryLanding(s);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Living on", path: "/living-on" },
    { name: `€${s}/month`, path: `/living-on/${salary}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Living in France on €${s}/month · Top 10 cities`,
            itemListElement: landing.topMatches.slice(0, 10).map((m, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: m.city.name,
              url: `${EN_BASE}/cities/${m.city.slug}`,
            })),
          }),
        }}
      />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/living-on" className="hover:underline">
              ← All salary brackets
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Living in France on {fmtEuro(s)}/month
          </h1>
          <p className="text-[var(--text-secondary)]">
            Reasonable housing budget: {fmtEuro(landing.budget)}/month (33% of net). Top 10
            cities where this budget holds — with a disposable income simulation.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Top 10 compatible cities
          </h2>
          <ol className="space-y-2">
            {landing.topMatches.map((m, i) => (
              <li key={m.city.slug}>
                <Link
                  href={`/cities/${m.city.slug}`}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-colors"
                >
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                      #{i + 1}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)] truncate">
                      {m.city.name}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] truncate">
                      {m.city.region}
                    </span>
                  </span>
                  <span className="flex items-baseline gap-2 flex-shrink-0">
                    <span className="text-xs text-[var(--text-tertiary)]">
                      QoL {m.city.scores.global.toFixed(1)}
                    </span>
                    <span className="font-mono-data font-bold text-[var(--accent)] text-sm">
                      {m.score.toFixed(0)}% match
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {landing.topCity && (
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Concrete example: your budget in {landing.topCity.name}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Monthly fixed cost simulation on a net salary of {fmtEuro(s)}.
            </p>
            <Card>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Median 1-bed rent", value: landing.topCity.breakdown.rentT2 },
                  { label: "Heating", value: landing.topCity.breakdown.heating },
                  ...(landing.topCity.breakdown.transitPass
                    ? [{ label: "Transit pass", value: landing.topCity.breakdown.transitPass }]
                    : [
                        { label: "Car insurance", value: landing.topCity.breakdown.carInsurance },
                        { label: "Fuel + maintenance", value: landing.topCity.breakdown.fuelCommute },
                        { label: "Parking", value: landing.topCity.breakdown.parking },
                      ]),
                  { label: "Property tax (monthly share)", value: landing.topCity.breakdown.taxeFonciere },
                  { label: "Waste tax (TEOM)", value: landing.topCity.breakdown.teom },
                ].map((row) => (
                  <li
                    key={row.label}
                    className="flex items-baseline justify-between border-b border-[var(--border)]/40 last:border-b-0 py-1.5"
                  >
                    <span className="text-[var(--text-primary)]">{row.label}</span>
                    <span className="font-mono-data font-bold text-[var(--text-primary)]">
                      {fmtEuro(row.value)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-[var(--border)]">
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)]">Fixed costs / month</p>
                  <p className="font-mono-data font-bold text-xl text-[var(--text-primary)]">
                    {fmtEuro(landing.topCity.breakdown.totalFixed)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)]">Disposable income</p>
                  <p
                    className={`font-mono-data font-bold text-xl ${
                      landing.topCity.remaining < 0
                        ? "text-red-600"
                        : landing.topCity.remaining < s * 0.3
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {fmtEuro(landing.topCity.remaining)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--text-secondary)]">vs Paris</p>
                  <p
                    className={`font-mono-data font-bold text-xl ${
                      landing.topCity.remaining > landing.topCity.parisRemaining
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {landing.topCity.remaining > landing.topCity.parisRemaining ? "+" : ""}
                    {fmtEuro(landing.topCity.remaining - landing.topCity.parisRemaining)}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Link
                  href={`/calculator/real-cost/${landing.topCity.slug}`}
                  className="text-sm underline text-[var(--accent)]"
                >
                  Customise the calculation →
                </Link>
              </div>
            </Card>
          </section>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/quiz/compatibility">
            <Badge variant="accent" className="px-4 py-2 text-sm cursor-pointer">
              ✨ Refine with the compatibility quiz
            </Badge>
          </Link>
          <Link href="/calculator/real-cost">
            <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer">
              💰 Per-city cost calculator
            </Badge>
          </Link>
          <Link href="/living-on">
            <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer">
              Other salary brackets
            </Badge>
          </Link>
        </div>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Indicative calculation based on an &quot;average&quot; lifestyle (couple without
          children, hybrid work, budget priority). For a personalised calculation, use the
          compatibility quiz or the per-city calculator.
        </p>
      </div>

      <Footer />
    </main>
  );
}
