import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { CITIES_COUNT } from "@/lib/site-stats";
import { formatScore, scoreColor, scoreHex, scoreLabel } from "@/lib/utils";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternatesEn } from "@/lib/i18n";

export const revalidate = false;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  // 49 chars with the brand suffix. The fuller "French city ratings and
  // resident reviews | BestCitiesInFrance" measured 61, one past what Google
  // renders — and the part that got cut was the brand.
  title: "French city ratings & reviews | BestCitiesInFrance",
  description: `A quality-of-life rating for ${CITIES_COUNT} French cities across 8 measured criteria, plus what the people living there actually say. Find yours, read it, add yours.`,
  alternates: pathAlternatesEn("/avis", "/reviews"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "French city ratings and resident reviews | BestCitiesInFrance",
    description: `A score out of 10 and resident reviews for ${CITIES_COUNT} cities. 8 measured criteria, no bought reviews.`,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

// Population floor for the best/worst extracts. Without it both lists fill up
// with communes of 3 000 people whose reviews nobody is looking for — the same
// floor as /overall-ranking. Mirrors MIN_POP in app/avis/page.tsx: the two
// pages are hreflang twins and must rank the same cities.
const MIN_POP = 15_000;

// English labels for the shared score tiers, mapped at the display site (see
// CLAUDE.md, EN routes convention 6 — lib/utils.ts stays French).
const TIER_EN: Record<string, string> = {
  exceptionnel: "exceptional", excellent: "excellent", bon: "good",
  moyen: "average", "en dessous": "below average", mauvais: "poor",
};

const AXES: { key: keyof (typeof CITIES_LIGHT)[number]["scores"]; label: string; emoji: string }[] = [
  { key: "life", label: "Quality of life", emoji: "🌿" },
  { key: "transport", label: "Transport", emoji: "🚆" },
  { key: "nature", label: "Nature", emoji: "🌳" },
  { key: "cost", label: "Cost of living", emoji: "💶" },
  { key: "safety", label: "Safety", emoji: "🛡️" },
  { key: "culture", label: "Culture", emoji: "🎭" },
  { key: "remoteWork", label: "Remote work", emoji: "💻" },
  { key: "schools", label: "Schools", emoji: "🎓" },
];

function CityRow({ rank, slug, name, department, score, podium = false }: {
  rank: number;
  podium?: boolean;
  slug: string;
  name: string;
  department: string;
  score: number;
}) {
  return (
    <Link
      href={`/cities/${slug}`}
      className="group flex items-center gap-3 px-4 py-2.5 hover:bg-[#EEF2FF] transition-colors"
    >
      <span
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
          podium ? "grad-head-1 shadow-sm" : "bg-[#EEF2FF] text-[#4338CA] ring-1 ring-[#C7D2FE]"
        }`}
      >
        {rank}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
        {name}
        <span className="ml-2 text-xs font-normal text-[var(--text-tertiary)]">{department}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2 py-0.5 ring-1 ring-[var(--border)]">
        <span className="h-2 w-2 rounded-full" style={{ background: scoreHex(score) }} aria-hidden />
        <span className={`text-sm font-bold tabular-nums ${scoreColor(score)}`}>{formatScore(score)}</span>
      </span>
      <span className="hidden sm:inline shrink-0 w-28 text-right text-xs text-[var(--text-tertiary)]">
        {TIER_EN[scoreLabel(score)] ?? scoreLabel(score)}
      </span>
    </Link>
  );
}

export default function ReviewsHubPage() {
  const eligible = CITIES_LIGHT.filter((c) => c.population >= MIN_POP);
  const best = [...eligible].sort((a, b) => b.scores.global - a.scores.global).slice(0, 20);
  const worst = [...eligible].sort((a, b) => a.scores.global - b.scores.global).slice(0, 10);
  const alphabetical = [...CITIES_LIGHT].sort((a, b) => a.name.localeCompare(b.name, "fr"));

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "City ratings and reviews", path: "/reviews" },
  ]);

  const faq = faqJsonLd([
    {
      q: "How is a city's rating calculated?",
      a: `Every city is rated out of 10 on eight measured criteria (${AXES.map((a) => a.label.toLowerCase()).join(", ")}), from public data: SSMSI crime statistics, Insee and local observatory rents, transport provision, density of amenities. The overall rating is a weighted average minus a penalty on the weakest axis — a city that is excellent on three criteria and collapses on a fourth cannot hide that hole behind its strengths. The calculation is deterministic and reproducible: the same data always gives the same rating.`,
    },
    {
      q: "Can I review my own city?",
      a: "Yes. Every city profile has an open discussion at the bottom of the page, and you can write there what the data does not say: the feel of a neighbourhood, the noise of a main road, what has changed in five years. No account is needed to read.",
    },
    {
      q: "Are reviews bought or filtered?",
      a: "No. No review is bought, no commune pays to improve its rating, and a negative review is not deleted for being negative. Only spam and defamatory or personally identifying posts are removed.",
    },
    {
      q: "Which French cities have the highest ratings?",
      a: `Among cities of more than ${MIN_POP.toLocaleString("en-GB")} people, the highest rated are ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${formatScore(c.scores.global)}/10)`)
        .join(", ")}. A high rating signals a profile with no marked weakness, not a city that suits everyone.`,
    },
    {
      q: "Does a low rating mean you should not live there?",
      a: "No. The rating aggregates eight criteria with the same weight for everyone, and nobody actually lives with that weighting: a remote worker without a car and a family of four are not reading the same city. A 4.5 dragged down by housing costs is still a good city if you already own your home.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="text-xs text-[var(--text-tertiary)] mb-4">
          <Link href="/" className="hover:underline">Home</Link>
        </nav>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <EmojiBadge emoji="⭐" tone="pink" size="lg" className="shadow-[0_12px_28px_-12px_rgba(219,39,119,0.55)]" />
        <div className="min-w-0">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text">
          French city ratings and resident reviews
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Two different things, on the same page. The <strong>rating</strong>:{" "}
          {CITIES_COUNT} cities scored out of 10 on eight criteria measured from
          public data. The <strong>review</strong>: what the people living there
          say, in an open discussion on each city profile. The rating tells you
          where to look, the reviews tell you what the data misses.
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1.5 text-[#3730A3] ring-1 ring-[#C7D2FE]"><span aria-hidden>🏙️</span>{CITIES_COUNT} cities rated</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2F8] px-3 py-1.5 text-[#9D174D] ring-1 ring-[#FBCFE8]"><span aria-hidden>📏</span>8 measured criteria</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFEFF] px-3 py-1.5 text-[#155E75] ring-1 ring-[#A5F3FC]"><span aria-hidden>🤝</span>No bought reviews</span>
        </div>
        </div>
        </div>

        {/* Find your city — the number one intent on this page */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.55)] ring-1 ring-[#C7D2FE]">
          <div aria-hidden className="h-1.5 grad-head-5" />
          <div className="p-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Look up a city&apos;s rating
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Type its name into the search, or browse the full list further down.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/cities"
              className="rounded-xl grad-head-5 px-4 py-2 text-sm font-semibold shadow-[0_10px_24px_-12px_rgba(219,39,119,0.7)] hover:-translate-y-0.5 transition-transform"
            >
              Search a city →
            </Link>
            <Link
              href="/map"
              className="rounded-xl bg-[#ECFEFF] px-4 py-2 text-sm font-semibold text-[#155E75] ring-1 ring-[#A5F3FC] hover:bg-[#CFFAFE] transition-colors"
            >
              See the ratings map
            </Link>
          </div>
          </div>
        </div>
        </div>
      </section>

      <section className="band band-indigo py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* The 8 criteria */}
        <div className="flex items-center gap-3">
        <EmojiBadge emoji="📏" tone="indigo" size="sm" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          What a city is rated on
        </h2>
        </div>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Each axis is scored out of 10, where 10 is best. The overall rating
          aggregates them, then subtracts a penalty on the weakest axis: that is
          what stops a city that shines on three criteria and collapses on a
          fourth from finishing ahead of one that is solid everywhere.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AXES.map((a, i) => (
            <div
              key={a.key}
              className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-[0_8px_20px_-16px_rgba(79,70,229,0.6)] ring-1 ring-[#C7D2FE]"
            >
              <EmojiBadge emoji={a.emoji} tone={toneFor(i)} size="sm" className="!h-8 !w-8 !text-base" />
              <span className="min-w-0">{a.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          The calculation, source by source, is on the{" "}
          <Link href="/methodology" className="font-medium text-[#4338CA] underline underline-offset-2 hover:text-[#BE185D]">
            methodology page
          </Link>
          .
        </p>
        </div>
      </section>

      <section className="band band-sky py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Best rated */}
        <div className="flex items-center gap-3">
        <EmojiBadge emoji="🏆" tone="sky" size="sm" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          The 20 highest-rated cities
        </h2>
        </div>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of more than {MIN_POP.toLocaleString("en-GB")} people, sorted by
          overall rating.
        </p>
        <div className="mt-4 divide-y divide-[#E0E7FF] overflow-hidden rounded-2xl bg-white shadow-[0_14px_32px_-22px_rgba(3,105,161,0.6)] ring-1 ring-[#BAE6FD]">
          {best.map((c, i) => (
            <CityRow
              key={c.slug}
              rank={i + 1}
              podium={i < 3}
              slug={c.slug}
              name={c.name}
              department={c.department}
              score={c.scores.global}
            />
          ))}
        </div>
        </div>
      </section>

      <section className="band band-pink py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Lowest rated */}
        <div className="flex items-center gap-3">
        <EmojiBadge emoji="📉" tone="pink" size="sm" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          The 10 lowest ratings
        </h2>
        </div>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Publishing only the top of the table would be dishonest. These cities
          drop on at least one heavy axis — most often safety, employment, or
          housing cost relative to local income. It does not mean life there is
          bad: it means you should know what you are trading away.
        </p>
        <div className="mt-4 divide-y divide-[#FCE7F3] overflow-hidden rounded-2xl bg-white shadow-[0_14px_32px_-22px_rgba(190,24,93,0.55)] ring-1 ring-[#FBCFE8]">
          {worst.map((c, i) => (
            <CityRow
              key={c.slug}
              rank={i + 1}
              slug={c.slug}
              name={c.name}
              department={c.department}
              score={c.scores.global}
            />
          ))}
        </div>
        </div>
      </section>

        {/* Leave a review */}
      <section className="band band-bold py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="flex justify-center"><span aria-hidden className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl ring-1 ring-white/40">💬</span></div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold">
            Rate your city, or say what is wrong with it
          </h2>
          <p className="mt-3 text-base text-white/90">
            The data does not capture the feel of a neighbourhood, the noise of a
            main road, or what has changed in the last five years. Every city
            profile has an open discussion at the bottom: open yours and write
            what you would have wanted to read before you moved in. We do not
            delete a review for being negative.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/cities"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#4338CA] shadow-lg hover:-translate-y-0.5 transition-transform"
            >
              Find my city and leave a review →
            </Link>
            <Link
              href="/methodology"
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/60 hover:bg-white/20 transition-colors"
            >
              How the rating is calculated
            </Link>
          </div>
        </div>
      </section>

      <section className="band band-lilac py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Full index — crawlable, ~100 bytes a link rather than a card.
            See "Performance constraints": never a whole collection in a grid,
            but the internal linking has to stay in the static HTML. */}
        <details className="group overflow-hidden rounded-2xl bg-white shadow-[0_14px_32px_-20px_rgba(124,58,237,0.6)]">
          <summary className="grad-head-4 flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
            <span aria-hidden className="text-lg leading-none">🔤</span>
            <span className="flex-1">
            All rated cities ({CITIES_COUNT})
            </span>
            <span aria-hidden className="text-lg leading-none transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="px-5 pt-4 text-sm text-[var(--text-secondary)]">
            Alphabetical. The overall rating follows the name.
          </p>
          <ul className="columns-1 gap-4 p-5 text-sm sm:columns-2 lg:columns-3">
            {alphabetical.map((c) => (
              <li key={c.slug} className="break-inside-avoid py-0.5">
                <Link href={`/cities/${c.slug}`} className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline">
                  {c.name}
                </Link>{" "}
                <span className={`tabular-nums text-xs font-semibold ${scoreColor(c.scores.global)}`}>
                  {formatScore(c.scores.global)}
                </span>
              </li>
            ))}
          </ul>
        </details>
        </div>
      </section>

      <section className="band band-aqua py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Go further */}
        <div className="flex items-center gap-3">
        <EmojiBadge emoji="🧭" tone="aqua" size="sm" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Go further</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/rankings"
            className="group rounded-2xl bg-white p-4 shadow-[0_10px_26px_-20px_rgba(14,116,144,0.7)] ring-1 ring-[#C7D2FE] hover:ring-[#818CF8] hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
              🏆 Rankings by criterion
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              The overall rating hides the trade-offs. Sort on the one that matters to you.
            </div>
          </Link>
          <Link
            href="/city-match"
            className="group rounded-2xl bg-white p-4 shadow-[0_10px_26px_-20px_rgba(14,116,144,0.7)] ring-1 ring-[#FBCFE8] hover:ring-[#F472B6] hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
              🎯 Your own rating
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              Reweight the eight axes for your situation: the ranking changes.
            </div>
          </Link>
          <Link
            href="/compare"
            className="group rounded-2xl bg-white p-4 shadow-[0_10px_26px_-20px_rgba(14,116,144,0.7)] ring-1 ring-[#A5F3FC] hover:ring-[#22D3EE] hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
              ⚖️ Compare two cities
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              Head to head on the eight axes, rents and typical profiles.
            </div>
          </Link>
          <Link
            href="/red-flags"
            className="group rounded-2xl bg-white p-4 shadow-[0_10px_26px_-20px_rgba(14,116,144,0.7)] ring-1 ring-[#E9D5FF] hover:ring-[#C084FC] hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
              🚩 What nobody tells you
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              The traps by city type, before you sign a lease.
            </div>
          </Link>
        </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
