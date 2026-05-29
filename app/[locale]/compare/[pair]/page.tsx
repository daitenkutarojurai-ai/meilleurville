import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VsBattle } from "@/components/VsBattle";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE, hreflangLanguagesEn } from "@/lib/i18n";
import { SEO_PAIRS } from "@/lib/comparer-pairs";
import { SEO_TRIPLETS } from "@/lib/comparer-triplets";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; pair: string }> };

export async function generateStaticParams() {
  return [
    ...SEO_PAIRS.map(([a, b]) => ({ locale: "en", pair: `${a}-vs-${b}` })),
    ...SEO_TRIPLETS.map(([a, b, c]) => ({ locale: "en", pair: `${a}-vs-${b}-vs-${c}` })),
  ];
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

function parseTriplet(pair: string) {
  const parts = pair.split("-vs-");
  if (parts.length !== 3) return null;
  const cities = parts.map((s) => CITIES_SEED.find((c) => c.slug === s));
  if (cities.some((c) => !c)) return null;
  return cities as [(typeof CITIES_SEED)[number], (typeof CITIES_SEED)[number], (typeof CITIES_SEED)[number]];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;

  const triplet = parseTriplet(pair);
  if (triplet) {
    const [a, b, c] = triplet;
    return {
      title: `${a.name} vs ${b.name} vs ${c.name} — 3-city comparison 2026`,
      description: `Compare ${a.name} (${a.scores.global}/10), ${b.name} (${b.scores.global}/10) and ${c.name} (${c.scores.global}/10) side by side: cost of living, safety, transport, nature, schools.`,
      alternates: { canonical: `${EN_BASE}/compare/${pair}`, languages: hreflangLanguagesEn(`/compare/${pair}`) },
    };
  }

  const parsed = parsePair(pair);
  if (!parsed) return {};
  const { a, b } = parsed;
  return {
    title: `${a.name} vs ${b.name} — Quality-of-life comparison 2026`,
    description: `Full comparison of ${a.name} (${a.scores.global}/10) and ${b.name} (${b.scores.global}/10): cost of living, transport, nature, safety, schools. Which French city should you choose?`,
    alternates: { canonical: `${EN_BASE}/compare/${pair}`, languages: hreflangLanguagesEn(`/compare/${pair}`) },
    openGraph: {
      title: `${a.name} vs ${b.name} — which city wins?`,
      description: `${a.name}: ${a.scores.global}/10 · ${b.name}: ${b.scores.global}/10. Compare every criterion.`,
    },
  };
}

function profileScore(city: (typeof CITIES_SEED)[number], keys: ScoreKey[]): number {
  return keys.reduce((s, k) => s + city.scores[k], 0) / keys.length;
}

function TripletPage({ cities }: { cities: [(typeof CITIES_SEED)[number], (typeof CITIES_SEED)[number], (typeof CITIES_SEED)[number]] }) {
  const [a, b, c] = cities;
  const topCity = [a, b, c].reduce((best, city) => city.scores.global > best.scores.global ? city : best);

  const COLORS = ["text-blue-600", "text-violet-600", "text-amber-600"];

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/compare" className="hover:text-[var(--accent)]">Compare</Link>
          {" · "}
          <span>{a.name} vs {b.name} vs {c.name}</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
          {a.name} vs {b.name} vs {c.name}
        </h1>
        <p className="text-[var(--text-secondary)]">
          On the overall score, <strong className="text-[var(--text-primary)]">{topCity.name}</strong> leads at{" "}
          <strong className="text-[var(--text-primary)]">{topCity.scores.global.toFixed(1)}/10</strong> — but check the breakdown below before deciding.
        </p>
      </section>

      {/* Score cards */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-4 grid grid-cols-3 gap-3">
        {[a, b, c].map((city) => (
          <Link
            key={city.slug}
            href={`/cities/${city.slug}`}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
          >
            <p className="text-xs text-[var(--text-secondary)]">{city.region ?? ""}</p>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{city.name}</h2>
            <p className={`font-mono-data text-3xl font-bold mt-1 ${scoreColor(city.scores.global)}`}>
              {city.scores.global.toFixed(1)}
              <span className="text-sm text-[var(--text-tertiary)]">/10</span>
            </p>
          </Link>
        ))}
      </section>

      {/* Score table */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Score by score</h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                <th className="text-left p-3 font-semibold">Criterion</th>
                {[a, b, c].map((city, i) => (
                  <th key={city.slug} className={`text-center p-3 font-semibold ${COLORS[i]}`}>{city.name}</th>
                ))}
                <th className="text-center p-3 font-semibold">Winner</th>
              </tr>
            </thead>
            <tbody>
              {SCORE_ROWS.map((row) => {
                const scores = [a, b, c].map((city) => city.scores[row.key]);
                const maxScore = Math.max(...scores);
                const winner = scores.filter((s) => s === maxScore).length === 1
                  ? [a, b, c][scores.indexOf(maxScore)].name
                  : "Tie";
                return (
                  <tr key={row.key} className="border-t border-[var(--border)]">
                    <td className="p-3 text-[var(--text-primary)] font-medium">{row.label}</td>
                    {[a, b, c].map((city) => {
                      const v = city.scores[row.key];
                      return (
                        <td key={city.slug} className={`p-3 text-center font-mono-data font-bold ${v === maxScore ? scoreColor(v) : "text-[var(--text-secondary)]"}`}>
                          {v.toFixed(1)}
                        </td>
                      );
                    })}
                    <td className="p-3 text-center text-[var(--text-secondary)] text-xs">{winner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Profile picks */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Which one for your profile?</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {PROFILES.map((p) => {
            const scores = [a, b, c].map((city) => ({ city, score: profileScore(city, p.keys) }));
            scores.sort((x, y) => y.score - x.score);
            const [first, second] = scores;
            const tied = first.score === second.score;
            return (
              <div key={p.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span aria-hidden className="text-2xl">{p.emoji}</span>
                  <h3 className="font-bold text-[var(--text-primary)]">{p.label}</h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-2">{p.desc}</p>
                <p className="text-sm text-[var(--text-primary)]">
                  {tied
                    ? <>Too close to call — {first.city.name} and {second.city.name} tie at {first.score.toFixed(1)}/10.</>
                    : <>Best fit: <strong>{first.city.name}</strong> ({first.score.toFixed(1)}/10)</>
                  }
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Climate */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Climate</h2>
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                <th className="text-left p-3 font-semibold">Metric</th>
                {[a, b, c].map((city, i) => (
                  <th key={city.slug} className={`text-center p-3 font-semibold ${COLORS[i]}`}>{city.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Sunshine days/year", vals: [a, b, c].map((city) => city.sunshinedays ? `${Math.round(city.sunshinedays / 9.5)} d` : "—") },
                { label: "July avg °C", vals: [a, b, c].map((city) => city.avgTempJuly ? `${city.avgTempJuly}°` : "—") },
                { label: "January avg °C", vals: [a, b, c].map((city) => city.avgTempJanuary ? `${city.avgTempJanuary}°` : "—") },
              ].map(({ label, vals }) => (
                <tr key={label} className="border-t border-[var(--border)]">
                  <td className="p-3 text-[var(--text-primary)] font-medium">{label}</td>
                  {vals.map((v, i) => <td key={i} className="p-3 text-center font-mono-data">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Housing */}
      {([a, b, c].some((city) => getHousing(city.slug))) && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Housing</h2>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                  <th className="text-left p-3 font-semibold">Metric</th>
                  {[a, b, c].map((city, i) => (
                    <th key={city.slug} className={`text-center p-3 font-semibold ${COLORS[i]}`}>{city.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "T2 rent / month", vals: [a, b, c].map((city) => { const h = getHousing(city.slug); return h?.avgRentT2 ? `€${h.avgRentT2}` : "—"; }) },
                  { label: "Buy price / m²", vals: [a, b, c].map((city) => { const h = getHousing(city.slug); return h?.avgBuyPriceM2 ? `€${h.avgBuyPriceM2}` : "—"; }) },
                ].map(({ label, vals }) => (
                  <tr key={label} className="border-t border-[var(--border)]">
                    <td className="p-3 text-[var(--text-primary)] font-medium">{label}</td>
                    {vals.map((v, i) => <td key={i} className="p-3 text-center font-mono-data">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pair links */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Compare pairs</h2>
        <div className="flex flex-wrap gap-2">
          {[[a, b], [a, c], [b, c]].map(([x, y]) => (
            <Link
              key={`${x.slug}-${y.slug}`}
              href={`/compare/${x.slug}-vs-${y.slug}`}
              className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
            >
              {x.name} vs {y.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex flex-wrap gap-3">
        {[a, b, c].map((city) => (
          <Link
            key={city.slug}
            href={`/cities/${city.slug}`}
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-white font-semibold hover:opacity-90"
          >
            {city.name} profile
          </Link>
        ))}
        <Link href="/compare" className="rounded-full border border-[var(--border)] px-5 py-2.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]">
          More comparisons
        </Link>
      </section>
      <Footer />
    </main>
  );
}

export default async function EnComparePair({ params }: Props) {
  const { pair } = await params;

  // 3-city dispatch
  const triplet = parseTriplet(pair);
  if (triplet) return <TripletPage cities={triplet} />;

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

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-6">
        <VsBattle a={a} b={b} locale="en" />
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
