import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VsBattle } from "@/components/VsBattle";
import { EmojiBadge } from "@/components/EmojiBadge";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE, hreflangLanguagesEn } from "@/lib/i18n";
import { SEO_PAIRS, comparePairSlug } from "@/lib/comparer-pairs";
import { SEO_TRIPLETS } from "@/lib/comparer-triplets";
import { jsonLdScript } from "@/lib/jsonld";
import { fitTitle } from "@/lib/brand";

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
    title: fitTitle(`${a.name} vs ${b.name} — Quality-of-life comparison 2026`),
    description: `Full comparison of ${a.name} (${a.scores.global}/10) and ${b.name} (${b.scores.global}/10): cost of living, transport, nature, safety, schools. Which French city should you choose?`,
    alternates: { canonical: `${EN_BASE}/compare/${pair}`, languages: hreflangLanguagesEn(`/compare/${pair}`) },
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
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

  // Couleurs de ville « Couleurs » : indigo / rose / cyan (violet et ambre sont réservés aux paliers).
  const COLORS = ["text-[#4338CA]", "text-[#BE185D]", "text-[#0E7490]"];
  const HEAD = ["grad-head-0", "grad-head-1", "grad-head-3"];
  const PILL = ["bg-[#E0E7FF] text-[#4338CA]", "bg-[#FCE7F3] text-[#BE185D]", "bg-[#CFFAFE] text-[#0E7490]"];

  const pairSlug = `${a.slug}-vs-${b.slug}-vs-${c.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
          { "@type": "ListItem", position: 2, name: "Compare", item: `${EN_BASE}/compare` },
          { "@type": "ListItem", position: 3, name: `${a.name} vs ${b.name} vs ${c.name}`, item: `${EN_BASE}/compare/${pairSlug}` },
        ],
      },
      {
        "@type": "ItemList",
        name: `${a.name} vs ${b.name} vs ${c.name} — comparison`,
        url: `${EN_BASE}/compare/${pairSlug}`,
        numberOfItems: 3,
        itemListElement: [a, b, c].map((city, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: city.name,
          url: `${EN_BASE}/cities/${city.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Which is the best city: ${a.name}, ${b.name} or ${c.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${topCity.name} leads on the overall score with ${topCity.scores.global.toFixed(1)}/10. The right pick still depends on your priorities — cost, safety, transport and schools differ between the three.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden bg-aurora pt-20 pb-10 sm:pb-12">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-[var(--text-tertiary)]">
            <Link href="/" className="font-medium text-[#4338CA] hover:text-[#BE185D]">Home</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <Link href="/compare" className="font-medium text-[#4338CA] hover:text-[#BE185D]">Compare</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <span>{a.name} vs {b.name} vs {c.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <EmojiBadge emoji="🥊" tone="indigo" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              2026 comparison · 3 cities
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.1] mb-3">
            <span className="gradient-text-anim pr-1">{a.name}</span>{" "}
            <span className="inline-flex align-middle items-center justify-center rounded-full grad-head-5 px-2 py-0.5 text-xs sm:text-sm font-extrabold">vs</span>{" "}
            <span className="gradient-text-anim pr-1">{b.name}</span>{" "}
            <span className="inline-flex align-middle items-center justify-center rounded-full grad-head-5 px-2 py-0.5 text-xs sm:text-sm font-extrabold">vs</span>{" "}
            <span className="gradient-text-anim pr-1">{c.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-3xl">
            On the overall score, <strong className="text-[var(--text-primary)]">{topCity.name}</strong> leads at{" "}
            <strong className="text-[var(--text-primary)]">{topCity.scores.global.toFixed(1)}/10</strong> — but check the breakdown below before deciding.
          </p>
        </div>
      </section>

      {/* Score cards + synthesis link */}
      <section className="band band-indigo py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[a, b, c].map((city, i) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#C7D2FE] shadow-[0_14px_34px_-24px_rgba(79,70,229,0.6)] transition-all hover:ring-[#4F46E5] hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className={`h-1.5 ${HEAD[i]}`} aria-hidden />
                <div className="p-5">
                  <p className="text-xs text-[var(--text-secondary)]">{city.region ?? ""}</p>
                  <h2 className={`text-lg font-bold ${COLORS[i]}`}>{city.name}</h2>
                  <p className={`font-mono-data text-3xl font-bold mt-1 ${scoreColor(city.scores.global)}`}>
                    {city.scores.global.toFixed(1)}
                    <span className="text-sm text-[var(--text-tertiary)]">/10</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Cross-link: 8-dimension synthesis */}
          <Link
            href={`/compare/${pairSlug}/synthesis`}
            className="group flex flex-wrap items-center gap-3 rounded-2xl bg-white ring-1 ring-[#C7D2FE] shadow-[0_14px_34px_-24px_rgba(79,70,229,0.6)] hover:ring-[#4F46E5] hover:-translate-y-0.5 hover:shadow-lg transition-all px-5 py-4"
          >
            <EmojiBadge emoji="✨" tone="pink" size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
                8 dimensions compared — {a.name} vs {b.name} vs {c.name}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Environment, healthcare, employment, quality of life, cycling, safety,
                demographics, public services. Ahead only counts from 0.3 pts.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold shrink-0">View →</span>
          </Link>
        </div>
      </section>

      {/* Score table */}
      <section className="band band-sky py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <EmojiBadge emoji="📊" tone="sky" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Score by score</span>
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-[#BAE6FD] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#EEF2FF] text-[#4338CA]">
                  <th className="text-left p-3 font-semibold">Criterion</th>
                  {[a, b, c].map((city, i) => (
                    <th key={city.slug} className={`text-center p-3 font-semibold ${COLORS[i]}`}>{city.name}</th>
                  ))}
                  <th className="text-center p-3 font-semibold">Winner</th>
                </tr>
              </thead>
              <tbody>
                {SCORE_ROWS.map((row, ri) => {
                  const scores = [a, b, c].map((city) => city.scores[row.key]);
                  const maxScore = Math.max(...scores);
                  const winner = scores.filter((s) => s === maxScore).length === 1
                    ? [a, b, c][scores.indexOf(maxScore)].name
                    : "Tie";
                  return (
                    <tr key={row.key} className={`border-t border-[#E0E7FF] ${ri % 2 ? "bg-[#F8FAFF]" : ""}`}>
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
        </div>
      </section>

      {/* Profile picks */}
      <section className="band band-pink py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <EmojiBadge emoji="🧭" tone="pink" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Which one for your profile?</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {PROFILES.map((p) => {
              const scores = [a, b, c].map((city, i) => ({ city, i, score: profileScore(city, p.keys) }));
              scores.sort((x, y) => y.score - x.score);
              const [first, second] = scores;
              const tied = first.score === second.score;
              return (
                <div key={p.label} className="rounded-2xl bg-white ring-1 ring-[#FBCFE8] shadow-[0_14px_34px_-24px_rgba(219,39,119,0.55)] p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span aria-hidden className="text-2xl">{p.emoji}</span>
                    <h3 className="font-bold text-[var(--text-primary)]">{p.label}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">{p.desc}</p>
                  {tied ? (
                    <p className="text-sm text-[var(--text-primary)]">
                      <span className="rounded-full bg-[#F1F0FF] px-2.5 py-0.5 text-[#4338CA]">Too close to call</span>{" "}
                      — {first.city.name} and {second.city.name} tie at {first.score.toFixed(1)}/10.
                    </p>
                  ) : (
                    <p className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-primary)]">
                      Best fit:{" "}
                      <strong className={`rounded-full px-2.5 py-0.5 ${PILL[first.i]}`}>{first.city.name}</strong>
                      <span className="text-xs text-[var(--text-tertiary)]">({first.score.toFixed(1)}/10)</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Climate + housing */}
      <section className="band band-aqua py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
          <div className="flex items-center gap-3">
            <EmojiBadge emoji="🌤️" tone="aqua" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Climate and housing</span>
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-[#A5F3FC] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)]">
            <h3 className="grad-head-5 px-5 py-2.5 text-sm font-bold uppercase tracking-widest">Climate</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#EEF2FF] text-[#4338CA]">
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
                ].map(({ label, vals }, ri) => (
                  <tr key={label} className={`border-t border-[#E0E7FF] ${ri % 2 ? "bg-[#F8FAFF]" : ""}`}>
                    <td className="p-3 text-[var(--text-primary)] font-medium">{label}</td>
                    {vals.map((v, i) => <td key={i} className="p-3 text-center font-mono-data font-bold">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {([a, b, c].some((city) => getHousing(city.slug))) && (
            <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-[#A5F3FC] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)]">
              <h3 className="grad-head-0 px-5 py-2.5 text-sm font-bold uppercase tracking-widest">Housing</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EEF2FF] text-[#4338CA]">
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
                  ].map(({ label, vals }, ri) => (
                    <tr key={label} className={`border-t border-[#E0E7FF] ${ri % 2 ? "bg-[#F8FAFF]" : ""}`}>
                      <td className="p-3 text-[var(--text-primary)] font-medium">{label}</td>
                      {vals.map((v, i) => <td key={i} className="p-3 text-center font-mono-data font-bold">{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Pair links + profiles */}
      <section className="band band-lilac py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <EmojiBadge emoji="🔁" tone="lilac" size="sm" />
              <h2 className="text-xl sm:text-2xl font-bold">
                <span className="gradient-text">Compare pairs</span>
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {[[a, b], [a, c], [b, c]].map(([x, y]) => {
                const pairSlug = comparePairSlug(x.slug, y.slug);
                if (!pairSlug) return null;
                return (
                  <Link
                    key={`${x.slug}-${y.slug}`}
                    href={`/compare/${pairSlug}`}
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#4338CA] ring-1 ring-[#DDD6FE] hover:ring-[#4F46E5] hover:-translate-y-0.5 transition-all"
                  >
                    {x.name} <span className="text-[#BE185D]">vs</span> {y.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[a, b, c].map((city) => (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                className="inline-flex items-center rounded-full grad-head-0 px-5 py-2.5 text-sm font-semibold shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                {city.name} profile
              </Link>
            ))}
            <Link href="/compare" className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#4338CA] ring-1 ring-[#DDD6FE] hover:ring-[#4F46E5] hover:-translate-y-0.5 transition-all">
              More comparisons
            </Link>
          </div>
        </div>
      </section>

      <section className="band band-white py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget locale="en" />
        </div>
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
          { "@type": "ListItem", position: 2, name: "Compare", item: `${EN_BASE}/compare` },
          { "@type": "ListItem", position: 3, name: `${a.name} vs ${b.name}`, item: `${EN_BASE}/compare/${pair}` },
        ],
      },
      {
        "@type": "ItemList",
        name: `${a.name} vs ${b.name} — comparison`,
        url: `${EN_BASE}/compare/${pair}`,
        numberOfItems: 2,
        itemListElement: [a, b].map((city, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: city.name,
          url: `${EN_BASE}/cities/${city.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Which is the better city, ${a.name} or ${b.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: overallWinner
                ? `${overallWinner.name} comes out ahead overall with ${overallWinner.scores.global.toFixed(1)}/10 versus ${(overallWinner.slug === a.slug ? b : a).scores.global.toFixed(1)}/10. The right answer still depends on which criteria matter most to you.`
                : `${a.name} and ${b.name} tie on the overall score (${a.scores.global.toFixed(1)}/10). The decision comes down to the individual axes — cost, safety, transport, schools.`,
            },
          },
          {
            "@type": "Question",
            name: `Is ${a.name} or ${b.name} cheaper to live in?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${a.name} scores ${a.scores.cost.toFixed(1)}/10 on cost of living and ${b.name} scores ${b.scores.cost.toFixed(1)}/10. ${a.scores.cost === b.scores.cost ? "They are roughly on par." : `${a.scores.cost > b.scores.cost ? a.name : b.name} is the more affordable of the two.`}`,
            },
          },
          {
            "@type": "Question",
            name: `Which is better for remote work, ${a.name} or ${b.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${a.name} scores ${a.scores.remoteWork.toFixed(1)}/10 for remote work and ${b.name} scores ${b.scores.remoteWork.toFixed(1)}/10. ${a.scores.remoteWork === b.scores.remoteWork ? "Both are equally well set up." : `${a.scores.remoteWork > b.scores.remoteWork ? a.name : b.name} is better set up for remote workers.`}`,
            },
          },
        ],
      },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden bg-aurora pt-20 pb-10 sm:pb-12">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-[var(--text-tertiary)]">
            <Link href="/" className="font-medium text-[#4338CA] hover:text-[#BE185D]">Home</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <Link href="/compare" className="font-medium text-[#4338CA] hover:text-[#BE185D]">Compare</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <span>{a.name} vs {b.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <EmojiBadge emoji="⚔️" tone="indigo" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              2026 comparison · Head to head
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.08] mb-3">
            <span className="gradient-text-anim pr-1">{a.name}</span>{" "}
            <span className="inline-flex align-middle items-center justify-center rounded-full grad-head-5 px-2.5 py-0.5 text-sm sm:text-base font-extrabold">vs</span>{" "}
            <span className="gradient-text-anim pr-1">{b.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-3xl">
            {overallWinner
              ? `On the overall score, ${overallWinner.name} comes out ahead — but the right answer depends on what you're optimising for. Here's the full breakdown.`
              : `${a.name} and ${b.name} tie on the overall score. The decision comes down to which axes matter most to you.`}
          </p>
        </div>
      </section>

      {/* Duel */}
      <section className="band band-indigo py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <VsBattle a={a} b={b} locale="en" />

          {/* Cross-link: 8-dimension synthesis (EN twin of the FR « Synthèse 8 axes ») */}
          <Link
            href={`/compare/${a.slug}-vs-${b.slug}/synthesis`}
            className="block rounded-2xl bg-white ring-1 ring-[#C7D2FE] shadow-[0_14px_34px_-24px_rgba(79,70,229,0.6)] hover:ring-[#4F46E5] hover:-translate-y-0.5 hover:shadow-lg transition-all p-5 group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <EmojiBadge emoji="✨" tone="pink" size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
                    8 dimensions compared — {a.name} vs {b.name}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    Environment, healthcare, employment, quality of life, cycling, safety,
                    demographics and public services — a gap counts from 0.3 pts.
                  </div>
                </div>
              </div>
              <span className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full grad-head-0 text-sm font-bold" aria-hidden>→</span>
            </div>
          </Link>
        </div>
      </section>

      {(housingA || housingB) && (
        <section className="band band-sky py-10 sm:py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-6">
              <EmojiBadge emoji="🏠" tone="sky" size="sm" />
              <h2 className="text-2xl sm:text-3xl font-bold">
                <span className="gradient-text">Housing</span>
              </h2>
            </div>
            <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#BAE6FD] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#EEF2FF] text-[#4338CA]">
                    <th className="text-left p-3 font-semibold">Metric</th>
                    <th className="text-center p-3 font-semibold">{a.name}</th>
                    <th className="text-center p-3 font-semibold text-[#BE185D]">{b.name}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#E0E7FF]">
                    <td className="p-3 text-[var(--text-primary)] font-medium">T2 rent / month</td>
                    <td className="p-3 text-center font-mono-data font-bold">{housingA ? `€${housingA.avgRentT2}` : "—"}</td>
                    <td className="p-3 text-center font-mono-data font-bold">{housingB ? `€${housingB.avgRentT2}` : "—"}</td>
                  </tr>
                  <tr className="border-t border-[#E0E7FF] bg-[#F8FAFF]">
                    <td className="p-3 text-[var(--text-primary)] font-medium">Buy price / m²</td>
                    <td className="p-3 text-center font-mono-data font-bold">{housingA ? `€${housingA.avgBuyPriceM2}` : "—"}</td>
                    <td className="p-3 text-center font-mono-data font-bold">{housingB ? `€${housingB.avgBuyPriceM2}` : "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section className="band band-pink py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <EmojiBadge emoji="🧭" tone="pink" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Which one for your profile?</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {PROFILES.map((p) => {
              const sa = profileScore(a, p.keys);
              const sb = profileScore(b, p.keys);
              const pick = sa === sb ? null : sa > sb ? a : b;
              return (
                <div key={p.label} className="rounded-2xl bg-white ring-1 ring-[#FBCFE8] shadow-[0_14px_34px_-24px_rgba(219,39,119,0.55)] p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span aria-hidden className="text-2xl">{p.emoji}</span>
                    <h3 className="font-bold text-[var(--text-primary)]">{p.label}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">{p.desc}</p>
                  {pick ? (
                    <p className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-primary)]">
                      Better fit:{" "}
                      <strong className={`rounded-full px-2.5 py-0.5 ${pick === a ? "bg-[#E0E7FF] text-[#4338CA]" : "bg-[#FCE7F3] text-[#BE185D]"}`}>{pick.name}</strong>
                      <span className="text-xs text-[var(--text-tertiary)]">({Math.max(sa, sb).toFixed(1)}/10)</span>
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--text-primary)]">
                      <span className="rounded-full bg-[#F1F0FF] px-2.5 py-0.5 text-[#4338CA]">Too close to call</span>{" "}
                      — both score {sa.toFixed(1)}/10.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="band band-bold py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-4">
          <p className="text-lg sm:text-xl font-semibold">Read the full profile of each city before you decide.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={`/cities/${a.slug}`} className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#4338CA] shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">{a.name} profile</Link>
            <Link href={`/cities/${b.slug}`} className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#BE185D] shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">{b.name} profile</Link>
            <Link href="/compare" className="inline-flex items-center rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/50 hover:bg-white/25 hover:-translate-y-0.5 transition-all">More comparisons</Link>
          </div>
        </div>
      </section>

      <section className="band band-white py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget locale="en" />
        </div>
      </section>
      <Footer />
    </main>
  );
}
