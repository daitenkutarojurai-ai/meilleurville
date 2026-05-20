import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { SEO_PAIRS } from "@/lib/comparer-pairs";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string; pair: string }> };

export async function generateStaticParams() {
  return SEO_PAIRS.map(([a, b]) => ({ locale: "en", pair: `${a}-vs-${b}` }));
}

type ScoreKey = keyof (typeof CITIES_SEED)[number]["scores"];

const SCORE_ROWS: Array<{ key: ScoreKey; label: string }> = [
  { key: "global", label: "Overall score" },
  { key: "life", label: "Quality of life" },
  { key: "transport", label: "Transport" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Cost of living" },
  { key: "safety", label: "Safety" },
  { key: "culture", label: "Culture" },
  { key: "remoteWork", label: "Remote work" },
  { key: "schools", label: "Schools" },
];

const PROFILES: Array<{ label: string; emoji: string; keys: ScoreKey[]; desc: string }> = [
  { label: "Family", emoji: "👨‍👩‍👧", keys: ["safety", "schools", "nature", "cost"], desc: "safety, schools, green space, budget" },
  { label: "Remote work", emoji: "💻", keys: ["remoteWork", "transport", "cost", "life"], desc: "fibre, coworking, cost, quality of life" },
  { label: "Retirement", emoji: "☀️", keys: ["nature", "safety", "cost", "life"], desc: "nature, safety, budget, wellbeing" },
  { label: "Students", emoji: "🎓", keys: ["culture", "transport", "cost", "schools"], desc: "culture, transport, budget, campus" },
];

function parsePair(pair: string) {
  const parts = pair.split("-vs-");
  if (parts.length !== 2) return null;
  const a = CITIES_SEED.find((c) => c.slug === parts[0]);
  const b = CITIES_SEED.find((c) => c.slug === parts[1]);
  if (!a || !b) return null;
  return { a, b };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const { a, b } = parsed;
  return {
    title: `${a.name} vs ${b.name} — Quality-of-life comparison 2026`,
    description: `Full comparison of ${a.name} (${a.scores.global}/10) and ${b.name} (${b.scores.global}/10): cost of living, transport, nature, safety, schools. Which French city should you choose?`,
    alternates: { canonical: `${EN_BASE}/compare/${pair}` },
    openGraph: {
      title: `${a.name} vs ${b.name} — which city wins?`,
      description: `${a.name}: ${a.scores.global}/10 · ${b.name}: ${b.scores.global}/10. Compare every criterion.`,
    },
  };
}

function profileScore(city: (typeof CITIES_SEED)[number], keys: ScoreKey[]): number {
  return keys.reduce((s, k) => s + city.scores[k], 0) / keys.length;
}

export default async function EnComparePair({ params }: Props) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const { a, b } = parsed;

  const housingA = getHousing(a.slug);
  const housingB = getHousing(b.slug);

  const overallWinner = a.scores.global === b.scores.global ? null : a.scores.global > b.scores.global ? a : b;

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/compare" className="hover:text-[var(--accent)]">Compare</Link>
          {" · "}
          <span>{a.name} vs {b.name}</span>
        </nav>
        <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
          {a.name} vs {b.name}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">
          {overallWinner
            ? `On the overall score, ${overallWinner.name} comes out ahead — but the right answer depends on what you're optimising for. Here's the full breakdown.`
            : `${a.name} and ${b.name} tie on the overall score. The decision comes down to which axes matter most to you.`}
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-4 grid grid-cols-2 gap-3">
        {[a, b].map((c) => (
          <Link
            key={c.slug}
            href={`/cities/${c.slug}`}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
          >
            <p className="text-xs text-[var(--text-secondary)]">{c.region ?? ""}</p>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{c.name}</h2>
            <p className={`font-mono-data text-3xl font-bold mt-1 ${scoreColor(c.scores.global)}`}>
              {c.scores.global.toFixed(1)}
              <span className="text-sm text-[var(--text-tertiary)]">/10</span>
            </p>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Score by score</h2>
        <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                <th className="text-left p-3 font-semibold">Criterion</th>
                <th className="text-center p-3 font-semibold">{a.name}</th>
                <th className="text-center p-3 font-semibold">{b.name}</th>
                <th className="text-center p-3 font-semibold">Winner</th>
              </tr>
            </thead>
            <tbody>
              {SCORE_ROWS.map((row) => {
                const va = a.scores[row.key];
                const vb = b.scores[row.key];
                const winner = va === vb ? "—" : va > vb ? a.name : b.name;
                return (
                  <tr key={row.key} className="border-t border-[var(--border)]">
                    <td className="p-3 text-[var(--text-primary)] font-medium">{row.label}</td>
                    <td className={`p-3 text-center font-mono-data font-bold ${scoreColor(va)}`}>{va.toFixed(1)}</td>
                    <td className={`p-3 text-center font-mono-data font-bold ${scoreColor(vb)}`}>{vb.toFixed(1)}</td>
                    <td className="p-3 text-center text-[var(--text-secondary)]">{winner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {(housingA || housingB) && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Housing</h2>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                  <th className="text-left p-3 font-semibold">Metric</th>
                  <th className="text-center p-3 font-semibold">{a.name}</th>
                  <th className="text-center p-3 font-semibold">{b.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--border)]">
                  <td className="p-3 text-[var(--text-primary)] font-medium">T2 rent / month</td>
                  <td className="p-3 text-center font-mono-data">{housingA ? `€${housingA.avgRentT2}` : "—"}</td>
                  <td className="p-3 text-center font-mono-data">{housingB ? `€${housingB.avgRentT2}` : "—"}</td>
                </tr>
                <tr className="border-t border-[var(--border)]">
                  <td className="p-3 text-[var(--text-primary)] font-medium">Buy price / m²</td>
                  <td className="p-3 text-center font-mono-data">{housingA ? `€${housingA.avgBuyPriceM2}` : "—"}</td>
                  <td className="p-3 text-center font-mono-data">{housingB ? `€${housingB.avgBuyPriceM2}` : "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Which one for your profile?</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {PROFILES.map((p) => {
            const sa = profileScore(a, p.keys);
            const sb = profileScore(b, p.keys);
            const pick = sa === sb ? null : sa > sb ? a : b;
            return (
              <div key={p.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span aria-hidden className="text-2xl">{p.emoji}</span>
                  <h3 className="font-bold text-[var(--text-primary)]">{p.label}</h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-2">{p.desc}</p>
                <p className="text-sm text-[var(--text-primary)]">
                  {pick ? <>Better fit: <strong>{pick.name}</strong> ({Math.max(sa, sb).toFixed(1)}/10)</> : <>Too close to call — both score {sa.toFixed(1)}/10.</>}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-3">
          <Link href={`/cities/${a.slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">{a.name} profile</Link>
          <Link href={`/cities/${b.slug}`} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90">{b.name} profile</Link>
          <Link href="/compare" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">More comparisons</Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
