import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { rankGentrification, type GentrificationRow } from "@/lib/gentrification";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Gentrification index 2026 · French cities on the rise",
  description: `Ranking of French cities where gentrification is accelerating: property prices, 25-35 demographics, café/coworking openings, remote workers. ${CITIES_COUNT} cities, composite score 0-100.`,
  alternates: { canonical: `${EN_BASE}/gentrification` },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Gentrification index", path: "/gentrification" },
]);

const EN_TRAJECTORY: Record<
  GentrificationRow["trajectory"],
  { label: string; tone: string; desc: string }
> = {
  "montee-rapide": {
    label: "Rising fast",
    tone: "bg-red-100 text-red-700 border-red-300",
    desc: "All signals green AND property market already under pressure — short window before it gets expensive.",
  },
  "deja-en-cours": {
    label: "Already underway",
    tone: "bg-orange-100 text-orange-700 border-orange-300",
    desc: "Gentrification visible — rents and per-m² prices have been climbing for 3-5 years.",
  },
  potentiel: {
    label: "5-year potential",
    tone: "bg-amber-100 text-amber-700 border-amber-300",
    desc: "Positive demographic and economic signals, market still accessible.",
  },
  stable: {
    label: "Stable",
    tone: "bg-lime-100 text-lime-700 border-lime-300",
    desc: "No particular acceleration — well-established city, local character preserved.",
  },
  baisse: {
    label: "Declining",
    tone: "bg-slate-100 text-slate-700 border-slate-300",
    desc: "Demographic or attractiveness decline — good prices but little new momentum.",
  },
};

const EN_SIGNAL_LABEL: Record<string, string> = {
  prix: "Price trajectory",
  jeunes: "25–35 age group",
  ouvertures: "New openings (cafés / coworking)",
  remote: "Remote workers",
};

export default function EnGentrificationPage() {
  const top30 = rankGentrification(30);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "French cities rising in 2026 — gentrification index",
            itemListElement: top30.slice(0, 10).map((row, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: row.city.name,
              url: `${EN_BASE}/cities/${row.city.slug}`,
            })),
          }),
        }}
      />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            📈 Gentrification index 2026
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
            French cities on the rise
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Four composite signals: price level vs quality of life (DVF proxy), 25-35
            demographics, café/coworking openings, remote-worker growth. Score 0-100 across{" "}
            {CITIES_COUNT} cities. Data and formulas are open.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-8">
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
            How to read this ranking
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            A city at the top does not mean &quot;good property investment&quot; — it means{" "}
            <strong>market and demographic signals are converging</strong> toward intensification
            over the next 5 years. Read it as an opportunity, a warning, or pure sociological
            curiosity, depending on your situation.
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            All scores are proxy v0 (derived from current seed + housing data). Real sources to
            wire in: DVF (property transaction database), INSEE census, daily SIRENE business
            registration feed.
          </p>
        </Card>

        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Top 30 cities</h2>
          </div>
          <ol className="space-y-3">
            {top30.map((row, i) => {
              const traj = EN_TRAJECTORY[row.trajectory];
              return (
                <li key={row.city.slug}>
                  <Link href={`/cities/${row.city.slug}`} className="block">
                    <Card className="hover:border-[var(--accent)]/40 transition-colors cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 text-center">
                          <span className="font-mono-data text-2xl font-bold text-[var(--text-tertiary)]">
                            #{i + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-lg font-bold text-[var(--text-primary)]">
                              {row.city.name}
                            </span>
                            <span className="text-xs text-[var(--text-tertiary)]">
                              {row.city.region}
                            </span>
                            <span
                              className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${traj.tone}`}
                            >
                              {traj.label}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {row.signals.map((s) => (
                              <div key={s.key} className="text-[11px]">
                                <p className="text-[var(--text-tertiary)] truncate">
                                  {EN_SIGNAL_LABEL[s.key] ?? s.label}
                                </p>
                                <p className="font-mono-data font-bold text-[var(--text-primary)]">
                                  {s.value.toFixed(1)}/10
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-mono-data text-2xl font-bold text-[var(--accent)]">
                            {row.score.toFixed(1)}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                            / 100
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Trajectory legend
          </h3>
          <ul className="space-y-2 text-xs">
            {Object.entries(EN_TRAJECTORY).map(([k, v]) => (
              <li key={k} className="flex items-start gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold flex-shrink-0 ${v.tone}`}
                >
                  {v.label}
                </span>
                <span className="text-[var(--text-secondary)]">{v.desc}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
