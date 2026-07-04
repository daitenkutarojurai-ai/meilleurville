import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeCommerce,
  COMMERCE_LEVEL_COLOR,
  COMMERCE_LEVEL_BG,
  type CommerceDimension,
  type CommerceLevel,
} from "@/lib/commerce";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

const LEVEL_LABEL_EN: Record<CommerceLevel, string> = {
  exceptionnel: "Exceptional",
  solide: "Solid",
  correct: "Adequate",
  limite: "Limited",
};

const DIM_REASON_EN: Record<
  "coverage" | "proximity" | "bigBox" | "centreVille",
  (score: number) => string
> = {
  coverage: (s) =>
    s >= 7.5
      ? `Dense and highly diversified retail offer: national chains, independents, specialist shops. Little travel needed for daily essentials.`
      : s >= 6
        ? `Solid coverage: most everyday and specialist needs can be met on the spot.`
        : s >= 4.5
          ? `Adequate coverage for daily life; anything specialised may require a trip to a larger hub.`
          : `Limited offer — you will likely rely on a neighbouring city for non-food and specialist chains.`,
  proximity: (s) =>
    s >= 7.5
      ? `Lively markets and a rich fabric of independents: greengrocers, bakeries, wine merchants and food shops are well represented.`
      : s >= 6
        ? `Solid neighbourhood retail, with at least one regular market and an active independent scene.`
        : s >= 4.5
          ? `Adequate proximity: bakeries and small supermarkets cover the everyday; the independent scene is more modest.`
          : `Fragile proximity: few independents, an occasional market at best, daily life largely centred on chain supermarkets.`,
  bigBox: (s) =>
    s >= 7.5
      ? `Full peripheral retail parks: hypermarkets, big-box chains, DIY and furniture retailers all within easy reach.`
      : s >= 6
        ? `Big-box retail well established, typically on the outskirts and best accessed by car.`
        : s >= 4.5
          ? `At least one big-box hub; specialist chains may require a trip to a neighbouring city.`
          : `Little or no big-box retail on site — larger purchases mean a trip to a nearby hub.`,
  centreVille: (s) =>
    s >= 7.5
      ? `Lively downtown retail: busy shopping streets, low vacancy, terraces and strolling.`
      : s >= 6
        ? `Reasonably active downtown retail, with vacancy kept in check.`
        : s >= 4.5
          ? `Downtown is holding up but fragile: a handful of empty units, competition from the outskirts.`
          : `Downtown under pressure: visible retail vacancy, momentum captured by peripheral zones ("Action Cœur de Ville" profile).`,
};

function signatureEN(cityName: string, level: CommerceLevel): string {
  switch (level) {
    case "exceptionnel":
      return `${cityName} offers first-class retail coverage: you can find nearly everything on site, from the local market to national chains.`;
    case "solide":
      return `${cityName} has a solid, balanced retail offer across neighbourhood shops, downtown and big-box hubs.`;
    case "correct":
      return `${cityName} covers daily life without trouble; specialist retail and downtown shopping streets are more limited.`;
    case "limite":
      return `${cityName} has a narrow retail offer: daily needs are met, but specialist purchases often depend on a neighbouring city.`;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const c = computeCommerce(city);
  const levelWord = LEVEL_LABEL_EN[c.level].toLowerCase();
  return {
    title: `Shops in ${city.name} — retail coverage & markets`.slice(0, 60),
    description: `Retail coverage in ${city.name} (${city.department}): ${levelWord} offer, markets & proximity, big-box, downtown vitality. Score ${c.composite.toFixed(1)}/10.`.slice(0, 160),
    alternates: { canonical: `${EN_BASE}/cities/${slug}/retail` },
    openGraph: {
      title: `Shops in ${city.name}`,
      description: `Retail coverage, markets, big-box, downtown vitality — synthesis derived from the city profile.`,
    },
  };
}

function CommerceBlock({
  dim,
  label,
  reasonEN,
}: {
  dim: CommerceDimension;
  label: string;
  reasonEN: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${COMMERCE_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${COMMERCE_LEVEL_COLOR[dim.level]}`}>
          {LEVEL_LABEL_EN[dim.level]}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {dim.score.toFixed(1)}
          <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{reasonEN}</p>
    </div>
  );
}

export default async function EnCityRetailPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const c = computeCommerce(city);

  const coverageReason = DIM_REASON_EN.coverage(c.coverage.score);
  const proximityReason = DIM_REASON_EN.proximity(c.proximity.score);
  const bigBoxReason = DIM_REASON_EN.bigBox(c.bigBox.score);
  const centreReason = DIM_REASON_EN.centreVille(c.centreVille.score);
  const signature = signatureEN(city.name, c.level);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${city.slug}` },
    { name: "Shops", path: `/cities/${city.slug}/retail` },
  ]);

  const faq = faqJsonLd([
    {
      q: `How good is retail coverage in ${city.name}?`,
      a: `${city.name} (${city.department}) scores ${c.composite.toFixed(1)}/10 for retail coverage (10 = excellent). Breakdown: overall coverage ${c.coverage.score.toFixed(1)}/10, markets & proximity ${c.proximity.score.toFixed(1)}/10, big-box ${c.bigBox.score.toFixed(1)}/10, downtown vitality ${c.centreVille.score.toFixed(1)}/10. ${signature}`,
    },
    {
      q: `Are there markets in ${city.name}?`,
      a: `${proximityReason} INSEE publishes the exact number of food retailers per commune each year in the Base permanente des équipements (BPE).`,
    },
    {
      q: `Is downtown ${city.name} still alive?`,
      a: `${centreReason} Retail vacancy rates in French downtowns are tracked by Procos and by the "Action Cœur de Ville" programme (ANCT).`,
    },
    {
      q: `Where can I find the official retail figures for ${city.name}?`,
      a: `INSEE publishes the Base permanente des équipements (BPE) with the count of shops per commune (food, non-food, services). CCI chambers and Procos publish downtown retail vacancy rates.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link> ·{" "}
          <Link href="/cities" className="hover:underline">Cities</Link> ·{" "}
          <Link href={`/cities/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Shops in {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          A synthesis of local retail coverage: density and diversity of the offer,
          markets and neighbourhood shops, peripheral big-box retail, and downtown
          vitality. Reference sources:{" "}
          <a
            href="https://www.insee.fr/fr/metadonnees/source/serie/s1161"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            INSEE BPE
          </a>{" "}
          · Procos · Action Cœur de Ville.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Editorial synthesis</Badge>
          <Badge>INSEE BPE · Procos</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${COMMERCE_LEVEL_BG[c.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Retail coverage score</h2>
            <span className={`text-xs font-bold uppercase ${COMMERCE_LEVEL_COLOR[c.level]}`}>
              {LEVEL_LABEL_EN[c.level]} offer
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {c.composite.toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">10 = dense and diversified coverage · 0 = retail desert.</p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">The four dimensions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CommerceBlock dim={c.coverage} label="Coverage & diversity" reasonEN={coverageReason} />
          <CommerceBlock dim={c.proximity} label="Markets & proximity" reasonEN={proximityReason} />
          <CommerceBlock dim={c.bigBox} label="Big-box retail" reasonEN={bigBoxReason} />
          <CommerceBlock dim={c.centreVille} label="Downtown vitality" reasonEN={centreReason} />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Methodology</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Coverage &amp; diversity (35%):</strong>{" "}
              density of the retail offer, primarily correlated with catchment size
              (population), adjusted for the city&apos;s character (metropolis, prefecture,
              overall dynamism).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Markets &amp; proximity (25%):</strong>{" "}
              independent-shop fabric and food retailers, regular markets, gastronomy. A
              heritage or tourist centre lifts this dimension noticeably.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Big-box retail (15%):</strong>{" "}
              presence of large-format hubs and peripheral retail parks (hypermarkets,
              DIY, furniture).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Downtown vitality (25%):</strong>{" "}
              a proxy for retail vacancy. Mid-sized cities (20–60k residents) without a
              heritage or tourism draw are the most exposed to devitalisation (the target
              of the "Action Cœur de Ville" programme).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Score derived from the city profile (population, character, quality of life
            and cultural offer), not from a field count. For the exact number of shops
            per commune, see INSEE&apos;s Base permanente des équipements (BPE); for
            downtown vacancy, Procos publications.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Explore further</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/cities/${city.slug}/things-to-do`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🎯</span><span>Things to do</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Activities, outings, culture</div>
            </Card>
          </Link>
          <Link href={`/cities/${city.slug}/transport`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🚉</span><span>Transport</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Commutes, stations, motorways</div>
            </Card>
          </Link>
          <Link href={`/cities/${city.slug}/employment`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>💼</span><span>Job market</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Unemployment, wages, dynamism</div>
            </Card>
          </Link>
          <Link href={`/cities/${city.slug}/demographics`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>👥</span><span>Demographics</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Ageing, trajectory</div>
            </Card>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} locale="en" />
      </section>

      <Footer />
    </main>
  );
}
