import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { CITIES_COUNT } from "@/lib/site-stats";
import { formatScore, scoreColor, scoreLabel } from "@/lib/utils";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

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
  alternates: {
    ...pathAlternatesEn("/avis", "/reviews"),
    languages: {
      fr: "https://www.mavilleideale.fr/avis",
      en: `${EN_BASE}/reviews`,
    },
  },
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

const AXES: { key: keyof (typeof CITIES_LIGHT)[number]["scores"]; label: string }[] = [
  { key: "life", label: "Quality of life" },
  { key: "transport", label: "Transport" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Cost of living" },
  { key: "safety", label: "Safety" },
  { key: "culture", label: "Culture" },
  { key: "remoteWork", label: "Remote work" },
  { key: "schools", label: "Schools" },
];

function CityRow({ rank, slug, name, department, score }: {
  rank: number;
  slug: string;
  name: string;
  department: string;
  score: number;
}) {
  return (
    <Link
      href={`/cities/${slug}`}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-subtle)] transition-colors"
    >
      <span className="w-6 shrink-0 text-xs tabular-nums text-[var(--text-tertiary)]">{rank}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
        {name}
        <span className="ml-2 text-xs font-normal text-[var(--text-tertiary)]">{department}</span>
      </span>
      <span className={`shrink-0 text-sm font-bold tabular-nums ${scoreColor(score)}`}>
        {formatScore(score)}
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

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          French city ratings and resident reviews
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Two different things, on the same page. The <strong>rating</strong>:{" "}
          {CITIES_COUNT} cities scored out of 10 on eight criteria measured from
          public data. The <strong>review</strong>: what the people living there
          say, in an open discussion on each city profile. The rating tells you
          where to look, the reviews tell you what the data misses.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{CITIES_COUNT} cities rated</Badge>
          <Badge>8 measured criteria</Badge>
          <Badge>No bought reviews</Badge>
        </div>

        {/* Find your city — the number one intent on this page */}
        <Card className="mt-6 p-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Look up a city&apos;s rating
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Type its name into the search, or browse the full list further down.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/cities"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Search a city →
            </Link>
            <Link
              href="/map"
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              See the ratings map
            </Link>
          </div>
        </Card>

        {/* The 8 criteria */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          What a city is rated on
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Each axis is scored out of 10, where 10 is best. The overall rating
          aggregates them, then subtracts a penalty on the weakest axis: that is
          what stops a city that shines on three criteria and collapses on a
          fourth from finishing ahead of one that is solid everywhere.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AXES.map((a) => (
            <div
              key={a.key}
              className="rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
            >
              {a.label}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          The calculation, source by source, is on the{" "}
          <Link href="/methodology" className="text-[var(--accent)] hover:underline">
            methodology page
          </Link>
          .
        </p>

        {/* Best rated */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          The 20 highest-rated cities
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Cities of more than {MIN_POP.toLocaleString("en-GB")} people, sorted by
          overall rating.
        </p>
        <Card className="mt-3 divide-y divide-[var(--border)] p-0 overflow-hidden">
          {best.map((c, i) => (
            <CityRow
              key={c.slug}
              rank={i + 1}
              slug={c.slug}
              name={c.name}
              department={c.department}
              score={c.scores.global}
            />
          ))}
        </Card>

        {/* Lowest rated */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          The 10 lowest ratings
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Publishing only the top of the table would be dishonest. These cities
          drop on at least one heavy axis — most often safety, employment, or
          housing cost relative to local income. It does not mean life there is
          bad: it means you should know what you are trading away.
        </p>
        <Card className="mt-3 divide-y divide-[var(--border)] p-0 overflow-hidden">
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
        </Card>

        {/* Leave a review */}
        <Card className="mt-10 p-5 border-l-4 border-l-[var(--accent)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Rate your city, or say what is wrong with it
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            The data does not capture the feel of a neighbourhood, the noise of a
            main road, or what has changed in the last five years. Every city
            profile has an open discussion at the bottom: open yours and write
            what you would have wanted to read before you moved in. We do not
            delete a review for being negative.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/cities"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Find my city and leave a review →
            </Link>
            <Link
              href="/methodology"
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              How the rating is calculated
            </Link>
          </div>
        </Card>

        {/* Full index — crawlable, ~100 bytes a link rather than a card.
            See "Performance constraints": never a whole collection in a grid,
            but the internal linking has to stay in the static HTML. */}
        <details className="mt-10 rounded-2xl border border-[var(--border)] p-5">
          <summary className="cursor-pointer text-lg font-semibold text-[var(--text-primary)]">
            All rated cities ({CITIES_COUNT})
          </summary>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Alphabetical. The overall rating follows the name.
          </p>
          <ul className="mt-4 columns-1 sm:columns-2 lg:columns-3 gap-4 text-sm">
            {alphabetical.map((c) => (
              <li key={c.slug} className="break-inside-avoid py-0.5">
                <Link href={`/cities/${c.slug}`} className="hover:underline text-[var(--text-secondary)]">
                  {c.name}
                </Link>{" "}
                <span className={`tabular-nums text-xs font-semibold ${scoreColor(c.scores.global)}`}>
                  {formatScore(c.scores.global)}
                </span>
              </li>
            ))}
          </ul>
        </details>

        {/* Go further */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">Go further</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/rankings"
            className="rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--accent)] transition-colors"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              🏆 Rankings by criterion
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              The overall rating hides the trade-offs. Sort on the one that matters to you.
            </div>
          </Link>
          <Link
            href="/city-match"
            className="rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--accent)] transition-colors"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              🎯 Your own rating
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              Reweight the eight axes for your situation: the ranking changes.
            </div>
          </Link>
          <Link
            href="/compare"
            className="rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--accent)] transition-colors"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              ⚖️ Compare two cities
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              Head to head on the eight axes, rents and typical profiles.
            </div>
          </Link>
          <Link
            href="/red-flags"
            className="rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--accent)] transition-colors"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              🚩 What nobody tells you
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              The traps by city type, before you sign a lease.
            </div>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
