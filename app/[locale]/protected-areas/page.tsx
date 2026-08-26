import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";
import {
  PROTECTED_AREAS_CREDIT_EN,
  PROTECTED_AREAS_URL,
  PROTECTED_RADIUS_KM,
} from "@/lib/biodiversity";
import {
  PROTECTION_ADHESION_ONLY,
  PROTECTION_CRAWLED_AT,
  PROTECTION_KIND_LABEL_EN,
  PROTECTION_MEDIAN_COVERAGE,
  PROTECTION_NO_PERIMETER,
  PROTECTION_RANKED_COUNT,
  PROTECTION_ZERO_COUNT,
  protectionRankingHead,
  rankByProtection,
  type ProtectionEntry,
} from "@/lib/protected-areas-ranking";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "French cities ringed by protected nature — 2026",
  description:
    "Share of the 15 km radius under statutory protection around 540 French cities: nature reserves, national and regional parks, Natura 2000, biotope orders.",
  alternates: pathAlternatesEn("/espaces-proteges", "/protected-areas"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // et la carte sociale disparaît entièrement.
    images: ["/opengraph-image"],
    title: "French cities ringed by protected natural areas",
    description:
      "2026 ranking of French cities by the share of their 15 km radius under statutory environmental protection. MNHN perimeters via IGN BD TOPO®.",
  },
};

const NATIONAL_LIMIT = 40;
const BIG_CITY_LIMIT = 20;
const BIG_CITY_MIN_POP = 100_000;

function fmt(n: number): string {
  return n.toFixed(1);
}

/** Cities whose only national-park polygon is an adhesion area: the "strongest
 *  status" column says so, rather than letting "national park" stand where no
 *  park core is involved. */
const ADHESION_ONLY_SLUGS = new Set(PROTECTION_ADHESION_ONLY.map((c) => c.slug));

function Row({ entry, rank, tied }: { entry: ProtectionEntry; rank: number; tied: boolean }) {
  return (
    <tr className="border-t border-[var(--border)]">
      <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums whitespace-nowrap">
        #{rank}
        {tied && <span className="ml-1 text-[10px] uppercase tracking-wide">tied</span>}
      </td>
      <td className="px-3 py-2">
        <Link
          href={`/cities/${entry.city.slug}/biodiversity`}
          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
        >
          {entry.city.name}
        </Link>
        <span className="block text-[11px] text-[var(--text-tertiary)]">{entry.city.region}</span>
      </td>
      <td className="px-3 py-2 text-right">
        <span className="font-bold tabular-nums text-emerald-700">{fmt(entry.coverage)}%</span>
      </td>
      <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
        {entry.areasTotal}
      </td>
      <td className="px-3 py-2 text-[var(--text-secondary)] hidden md:table-cell">
        {entry.strongest ? PROTECTION_KIND_LABEL_EN[entry.strongest] : "—"}
        {ADHESION_ONLY_SLUGS.has(entry.city.slug) && (
          <span className="block text-[10px] text-[var(--text-tertiary)]">buffer zone only</span>
        )}
      </td>
      <td className="px-3 py-2 text-[11px] text-[var(--text-tertiary)] hidden lg:table-cell">
        {entry.topArea ?? "—"}
      </td>
    </tr>
  );
}

function Head() {
  return (
    <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
      <tr>
        <th className="px-3 py-2 text-left">#</th>
        <th className="px-3 py-2 text-left">City</th>
        <th className="px-3 py-2 text-right">Coverage</th>
        <th className="px-3 py-2 text-right hidden sm:table-cell">Sites</th>
        <th className="px-3 py-2 text-left hidden md:table-cell">Strongest status</th>
        <th className="px-3 py-2 text-left hidden lg:table-cell">Largest site</th>
      </tr>
    </thead>
  );
}

export default function EnProtectedAreasPage() {
  const national = rankByProtection(NATIONAL_LIMIT);
  const big = rankByProtection(BIG_CITY_LIMIT, BIG_CITY_MIN_POP);
  const head = protectionRankingHead(national, 10);
  // Counted, not asserted: "only one big city makes the national table" would
  // age badly the day the next pass moves a figure.
  const bigInNational = national.tiers
    .flatMap((t) => t.entries)
    .filter((e) => e.city.population >= BIG_CITY_MIN_POP);
  const BASE_URL = ORIGIN_BY_LOCALE.en;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Protected natural areas", path: "/protected-areas" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Which French cities have the most protected nature around them?",
      a: `${head.entries
        .slice(0, 5)
        .map((e) => `${e.city.name} (${fmt(e.coverage)}% of the ${PROTECTED_RADIUS_KM} km radius)`)
        .join(", ")}. The median across the ${PROTECTION_RANKED_COUNT} measured cities is ${fmt(
        PROTECTION_MEDIAN_COVERAGE,
      )}%.`,
    },
    {
      q: "How is the coverage calculated?",
      a: `A ${PROTECTED_RADIUS_KM} km disc around the town centre is cut into 250 m cells. Each cell keeps the strongest protection covering it, so overlapping designations are never counted twice. The resulting share is weighted by status: nature reserve and national park 1, biotope protection order 0.8, Natura 2000 0.6, regional nature park 0.5.`,
    },
    {
      q: "Are ZNIEFF inventories included?",
      a: "No. A ZNIEFF is a scientific inventory with no legal force — it protects nothing on its own. Only statutory designations count: nature reserves, national and regional parks, prefectural biotope orders and Natura 2000 sites.",
    },
    {
      q: "Does high coverage mean the nature is accessible?",
      a: "No, and that is the main limit of this indicator. A designation says what cannot be done on the land, not what you can go and see: many Natura 2000 sites cover farmland or private property, with no footpath and no public access. For parks you can actually walk in, see each city's biodiversity page, which also lists mapped green space.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "French cities ringed by protected natural areas",
            description:
              "Share of the 15 km radius under statutory environmental protection around each city.",
            itemListOrder: head.ordered
              ? "https://schema.org/ItemListOrderDescending"
              : "https://schema.org/ItemListUnordered",
            numberOfItems: national.published,
            itemListElement: head.entries.map((entry, i) => ({
              "@type": "ListItem",
              ...(head.ordered ? { position: i + 1 } : {}),
              name: entry.city.name,
              url: `${BASE_URL}/cities/${entry.city.slug}/biodiversity`,
            })),
          }),
        }}
      />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          French cities with the most protected nature around them
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
          How much <em>legally protected</em> nature does a city have on its doorstep? We cut a{" "}
          {PROTECTED_RADIUS_KM} km disc around each town centre into 250 m cells, check what
          designation each cell carries, and publish the share of the disc that is covered. Median
          across the {PROTECTION_RANKED_COUNT} measured cities:{" "}
          <strong>{fmt(PROTECTION_MEDIAN_COVERAGE)}%</strong>.
        </p>
        <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed">
          Of the three components behind our biodiversity indicator, this is the only one that
          ranks honestly from one city to the next. A biotope order exists whether or not a
          naturalist ever walks past; a species count mostly measures how many naturalists do —
          which is why we withdrew our species-richness ranking in August 2026.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{PROTECTION_RANKED_COUNT} cities measured</Badge>
          <Badge>
            {PROTECTED_RADIUS_KM} km radius · 250 m grid
          </Badge>
          <Badge>Statutory designations only</Badge>
          {PROTECTION_CRAWLED_AT && <Badge>Boundaries as of {PROTECTION_CRAWLED_AT}</Badge>}
        </div>

        {/* National ranking */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          The top {national.published}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          No population filter, so the top of the table is dominated by mid-sized mountain and
          Mediterranean towns whose {PROTECTED_RADIUS_KM} km radius is almost entirely rural.
          Cities on the same figure share a rank — coverage is published to one decimal.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <Head />
              <tbody>
                {national.tiers.map((tier) =>
                  tier.entries.map((entry) => (
                    <Row
                      key={entry.city.slug}
                      entry={entry}
                      rank={tier.rank}
                      tied={tier.entries.length > 1}
                    />
                  )),
                )}
              </tbody>
            </table>
          </div>
        </Card>
        {national.nextTier && (
          <p className="mt-3 text-xs text-[var(--text-tertiary)] leading-relaxed">
            The ranking stops here:{" "}
            {national.nextTier.count === 1
              ? "the next city sits"
              : `the next ${national.nextTier.count} cities all sit`}{" "}
            at {fmt(national.nextTier.coverage)}%, and publishing half of a tie would mean picking
            at random.
          </p>
        )}

        {/* Large cities */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          What about the big cities?
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          The {big.pool} communes above 100,000 residents, compared with each other.{" "}
          {bigInNational.length === 1
            ? `Only one of them, ${bigInNational[0].city.name}, also makes the national table above:`
            : `${bigInNational.length} of them also make the national table above:`}{" "}
          a metropolitan area&apos;s disc is mostly the metropolitan area, and protected land starts
          beyond it.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <Head />
              <tbody>
                {big.tiers.map((tier) =>
                  tier.entries.map((entry) => (
                    <Row
                      key={entry.city.slug}
                      entry={entry}
                      rank={tier.rank}
                      tied={tier.entries.length > 1}
                    />
                  )),
                )}
              </tbody>
            </table>
          </div>
        </Card>
        {big.nextTier && (
          <p className="mt-3 text-xs text-[var(--text-tertiary)] leading-relaxed">
            {big.nextTier.count === 1
              ? "The next one sits"
              : `The next ${big.nextTier.count} sit`}{" "}
            at {fmt(big.nextTier.coverage)}%.
          </p>
        )}

        {/* Bottom of the table */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Where there is nothing
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          {PROTECTION_ZERO_COUNT} cities round down to 0.0% — a designated site too small or too
          far off-centre to register on the disc. Of those, {PROTECTION_NO_PERIMETER.length} have{" "}
          <strong>no</strong> statutory site at all within {PROTECTED_RADIUS_KM} km:
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          {PROTECTION_NO_PERIMETER.map((city, i) => (
            <span key={city.slug}>
              {i > 0 && <span className="text-[var(--text-tertiary)]"> · </span>}
              <Link
                href={`/cities/${city.slug}/biodiversity`}
                className="text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline"
              >
                {city.name}
              </Link>
            </span>
          ))}
        </p>
        <p className="mt-2 text-xs text-[var(--text-tertiary)] leading-relaxed">
          Alphabetical, deliberately unranked: they all carry the same value, and ordering them
          would publish the order of our data file as if it meant something. This is a measurement,
          not a gap in the data — all five layers of the pass cover their territory and find
          nothing there.
        </p>

        {/* Method */}
        <Card className="mt-12">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
            Method, and what the figure does not say
          </h2>
          <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              <strong>A grid, not a sum of areas.</strong> French designations nest inside one
              another: a Natura 2000 site routinely overlaps a reserve and a regional park. Adding
              their areas would count the same ground several times and could report more than 100%
              of the disc as protected. Each 250 m cell therefore keeps the strongest status
              covering it, counted once.
            </p>
            <p>
              <strong>Weighted by how strong the protection is.</strong> Nature reserve and
              national park count 1, prefectural biotope order 0.8, Natura 2000 0.6, regional
              nature park 0.5. Both ZNIEFF tiers are excluded: they are scientific inventories with
              no legal force, and counting them would say a document protects as much as a decree.
            </p>
            <p>
              <strong>Park cores and buffer zones count the same, for want of better data.</strong>{" "}
              The source publishes both as polygons of the same type; the core carries its own
              regulations, while the adhesion area is a charter zone with no general prohibition.
              For {PROTECTION_ADHESION_ONLY.length} cities the only national-park polygon found is
              an adhesion area — {PROTECTION_ADHESION_ONLY.slice(0, 4)
                .map((c) => c.name)
                .join(", ")}{" "}
              among them. Their coverage is an upper bound.
            </p>
            <p>
              <strong>Protected does not mean accessible.</strong> A designation says what cannot
              be done on the land, not what you can go and see: many Natura 2000 sites cover
              farmland or private property with no footpath. For parks you can actually walk in,
              each city&apos;s biodiversity page also lists mapped green space.
            </p>
            <p>
              <strong>A disc, not a commune.</strong> The {PROTECTED_RADIUS_KM} km radius reaches
              well beyond municipal boundaries, on purpose: a protected massif 12 km away is part
              of daily life, you go there on Sundays. It says nothing about what stands at the foot
              of your building.
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Boundaries:{" "}
              <a
                href={PROTECTED_AREAS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                {PROTECTED_AREAS_CREDIT_EN}
              </a>
              {PROTECTION_CRAWLED_AT ? `, as of ${PROTECTION_CRAWLED_AT}` : ""}. The figure is the
              one from that pass, not a live state: a site designated since then is not in it yet.
            </p>
          </div>
        </Card>

        <p className="mt-8 text-xs text-[var(--text-tertiary)] text-center">
          See also the{" "}
          <Link href="/map" className="underline">
            city map
          </Link>
          , the{" "}
          <Link href="/rankings" className="underline">
            lifestyle rankings
          </Link>{" "}
          or, city by city, the biodiversity page linked from each profile.
        </p>
      </section>

      <Footer />
    </main>
  );
}
