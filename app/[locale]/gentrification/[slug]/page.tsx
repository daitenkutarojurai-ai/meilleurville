import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { computeGentrification, rankGentrification } from "@/lib/gentrification";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

const EN_TRAJECTORY: Record<string, { label: string; tone: string; desc: string }> = {
  "montee-rapide": {
    label: "Rapid rise",
    tone: "bg-red-100 text-red-700 border-red-300",
    desc: "All signals point up and the property market is already under pressure — a short window before prices become unaffordable.",
  },
  "deja-en-cours": {
    label: "Already underway",
    tone: "bg-orange-100 text-orange-700 border-orange-300",
    desc: "Gentrification clearly visible — rents and sale prices per m² have been climbing for 3–5 years.",
  },
  potentiel: {
    label: "5-year potential",
    tone: "bg-amber-100 text-amber-700 border-amber-300",
    desc: "Positive demographic and economic signals, market still affordable. Strong 5-year watch.",
  },
  stable: {
    label: "Stable",
    tone: "bg-lime-100 text-lime-700 border-lime-300",
    desc: "No particular acceleration — an established city with stable local values.",
  },
  baisse: {
    label: "Declining",
    tone: "bg-slate-100 text-slate-700 border-slate-300",
    desc: "Declining demographics or appeal — good prices but little new dynamism.",
  },
};

const EN_SIGNAL_LABEL: Record<string, string> = {
  prix: "Property price trajectory",
  demo: "Young adults (25–35)",
  ouvertures: "New openings (cafés / coworking)",
  teletravail: "Remote-worker influx",
};

const EN_SIGNAL_SOURCE: Record<string, string> = {
  prix: "Proxy v0 — current price level × quality-of-life score. To be replaced by 10-year DVF regression when available.",
  demo: "Proxy v0 — composite of culture + remote-work + cost scores + metro bonus. To be replaced by INSEE census % aged 25–35.",
  ouvertures: "Proxy v0 — geometric mean of culture × remote-work scores. To be replaced by SIRENE new-business flux (NAF cafés/coworking/IT).",
  teletravail: "Proxy v0 — proprietary remote-work score (FTTH coverage + telework axis). To be replaced by INSEE 'home workers' 5-year census.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const row = computeGentrification(city);
  const traj = EN_TRAJECTORY[row.trajectory] ?? { label: row.trajectory, tone: "", desc: "" };
  return {
    title: `Gentrification in ${city.name} 2026 · ${traj.label} · Score ${row.score.toFixed(0)}/100`,
    description: `${city.name}: ${traj.label.toLowerCase()} trajectory (composite score ${row.score.toFixed(1)}/100). 4 signals: property prices, 25–35 demographics, new openings, remote-worker influx.`,
    alternates: { canonical: `${EN_BASE}/gentrification/${slug}` },
    openGraph: {
      title: `${city.name} · Gentrification ${traj.label}`,
      description: `Composite score ${row.score.toFixed(1)}/100 across 4 signals.`,
    },
  };
}

export default async function EnGentrificationCityPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const row = computeGentrification(city);
  const traj = EN_TRAJECTORY[row.trajectory] ?? { label: row.trajectory, tone: "bg-gray-100 text-gray-700 border-gray-300", desc: "" };
  const housing = HOUSING[city.slug];

  const all = rankGentrification();
  const rank = all.findIndex((r) => r.city.slug === city.slug) + 1;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Gentrification index", path: "/gentrification" },
    { name: city.name, path: `/gentrification/${slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Is ${city.name} gentrifying?`,
      a: `${city.name} has a "${traj.label}" gentrification trajectory with a composite score of ${row.score.toFixed(1)}/100 (national rank #${rank}). ${traj.desc}`,
    },
    {
      q: `What are the 4 gentrification signals measured?`,
      a: "Property price trajectory, young-adult (25–35) demographic trend, new openings (cafés, coworking, freelancers), and remote-worker influx. Each signal is scored 0–10 and weighted to produce a composite 0–100 score.",
    },
    {
      q: `What does a gentrification score of ${row.score.toFixed(0)}/100 mean?`,
      a: `Scores above 70 indicate rapid or ongoing gentrification. 40–70 = potential. Below 40 = stable or declining. ${city.name} scores ${row.score.toFixed(0)} — ${traj.label.toLowerCase()}.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/gentrification" className="hover:underline">
              ← Gentrification index
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Gentrification in {city.name}
          </h1>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-semibold ${traj.tone}`}>
              {traj.label}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              {city.region} · {city.population?.toLocaleString("en-GB") ?? "—"} inhabitants
            </span>
            <span className="ml-auto text-[var(--text-secondary)] text-sm">
              <strong className="font-mono-data text-xl text-[var(--accent)]">{row.score.toFixed(1)}</strong>
              <span className="text-xs">/100</span> · national rank #{rank}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        <Card>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">{traj.label}:</strong>{" "}
            {traj.desc}
          </p>
        </Card>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            The 4 composite signals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {row.signals.map((s) => (
              <Card key={s.key}>
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {EN_SIGNAL_LABEL[s.key] ?? s.label}
                  </p>
                  <p className="font-mono-data font-bold text-lg text-[var(--text-primary)]">
                    {s.value.toFixed(1)}<span className="text-xs text-[var(--text-tertiary)]">/10</span>
                  </p>
                </div>
                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-[var(--accent)]"
                    style={{ width: `${s.value * 10}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                  {EN_SIGNAL_SOURCE[s.key] ?? s.source}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {housing && (
          <Card>
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3">
              Current property market
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Avg T2 rent</p>
                <p className="font-mono-data font-bold text-[var(--text-primary)]">€{housing.avgRentT2}/mo</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Avg T3 rent</p>
                <p className="font-mono-data font-bold text-[var(--text-primary)]">€{housing.avgRentT3}/mo</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Purchase price / m²</p>
                <p className="font-mono-data font-bold text-[var(--text-primary)]">€{housing.avgBuyPriceM2.toLocaleString("en-GB")}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Quality-of-life score</p>
                <p className="font-mono-data font-bold text-[var(--text-primary)]">{city.scores.global.toFixed(1)}/10</p>
              </div>
            </div>
          </Card>
        )}

        <div className="flex gap-3 flex-wrap">
          <Link
            href={`/cities/${slug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--accent)] text-[var(--accent)] font-semibold px-4 py-2 text-sm hover:bg-[var(--accent)]/5 transition-colors"
          >
            Full city profile
          </Link>
          <Link
            href="/gentrification"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium px-4 py-2 text-sm hover:border-[var(--accent)]/40 transition-colors"
          >
            National index
          </Link>
        </div>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Methodology</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Composite score 0–100 from 4 signals (property prices 35%, demographics 25%,
            new openings 20%, remote workers 20%). All signals use proxy v0 (derived from
            seed scores) — they will be replaced by official data sources (DVF, INSEE, SIRENE)
            as they become available. Trajectory thresholds: ≥70 = rapid/ongoing, 40–70 = potential,
            below 40 = stable or declining.
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
