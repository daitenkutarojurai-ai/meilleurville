import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AirRankingList } from "@/components/AirRankingList";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";
import { AIR_MEASURE_YEAR, AIR_REFERENCES, type AirPollutant } from "@/lib/city-air";
import {
  RANK_MAX_KM,
  RANKED_AIR_POLLUTANTS,
  airNationalStats,
  airRankEntries,
  airRankingHead,
  rankAir,
} from "@/lib/air-measured-ranking";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const LIMIT = 20;
const EN_BASE = ORIGIN_BY_LOCALE.en;

const LABEL: Record<AirPollutant, string> = {
  no2: "Nitrogen dioxide (NO₂)",
  pm25: "Fine particles (PM2.5)",
  pm10: "Particles (PM10)",
  o3: "Ozone (O₃)",
};

const ABOUT: Record<AirPollutant, string> = {
  no2: "Mostly from road traffic, diesel engines above all. It is the clearest marker of urban pollution and falls off quickly away from main roads.",
  pm25: "Particles under 2.5 micrometres, from wood heating, traffic, industry and farming. They reach deepest into the lungs.",
  pm10: "Particles under 10 micrometres: the same sources as PM2.5, plus road wear and building sites.",
  o3: "A secondary pollutant formed in sunlight from other pollutants. It peaks in summer, often well away from the cities that produced it: suburban and rural areas in the south are the most exposed.",
};

const no2 = airNationalStats("no2");
const no2Over2030 = airRankEntries("no2").filter((e) => e.measure.value > (AIR_REFERENCES.no2.eu2030 ?? Infinity));
const no2Over2030Idf = no2Over2030.filter((e) => e.region === "Île-de-France").length;
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

export const metadata: Metadata = {
  title: `Air quality in French cities — ${AIR_MEASURE_YEAR} measurements`,
  description: `Air pollution measured in ${AIR_MEASURE_YEAR} by official monitoring stations: the French cities with the cleanest and most polluted air (NO₂, fine particles, ozone), ${no2.pool} cities ranked.`,
  alternates: pathAlternatesEn("/qualite-de-l-air", "/air-quality"),
  openGraph: {
    images: ["/opengraph-image"],
    title: `Air quality in French cities — ${AIR_MEASURE_YEAR} measurements`,
    description: "French cities ranked by air pollution measured at official stations: nitrogen dioxide, fine particles and ozone.",
  },
};

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export default function EnAirQualityPage() {
  const sections = RANKED_AIR_POLLUTANTS.map((p) => ({
    p,
    stats: airNationalStats(p),
    cleanest: rankAir(p, LIMIT, "cleanest"),
    worst: rankAir(p, LIMIT, "worst"),
  }));
  const head = airRankingHead(rankAir("no2", 10, "cleanest"));

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Air quality", path: "/air-quality" },
  ]);
  const faq = faqJsonLd([
    {
      q: "Where do these figures come from?",
      a: `They are measurements, not estimates: ${AIR_MEASURE_YEAR} annual averages from the stations of France's regional air monitoring networks (AASQA), compiled by LCSQA and published by the European Environment Agency. Only validated data is used, and a station must cover at least 75 % of the year.`,
    },
    {
      q: "Why are some cities not ranked?",
      a: `A city is ranked only if its nearest background station is urban or suburban and within ${RANK_MAX_KM} km. A distant rural station measures the countryside, not the town, and would make it look cleaner than it is. Those cities keep their measurement, with the distance, on their own air quality page.`,
    },
    {
      q: "Why do several cities share exactly the same value?",
      a: "Usually because they share the same station, which is common in the Paris inner suburbs; sometimes because two different stations read the same average to one decimal. They are ranked as a tie, alphabetically, each station is named, and a tie is never split at the end of a list.",
    },
    {
      q: "Which thresholds matter?",
      a: "For nitrogen dioxide the WHO recommends 10 µg/m³ as an annual mean; the EU limit in force is 40 and drops to 20 in 2030. For PM2.5 the WHO recommends 5; the EU limit is 25 today and 10 from 2030.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `French cities with the lowest measured nitrogen dioxide (${AIR_MEASURE_YEAR})`,
          itemListOrder: head.ordered ? "https://schema.org/ItemListOrderAscending" : "https://schema.org/ItemListUnordered",
          numberOfItems: head.entries.length,
          itemListElement: head.entries.map((e, i) => ({
            "@type": "ListItem",
            ...(head.ordered ? { position: i + 1 } : {}),
            name: e.name,
            url: `${EN_BASE}/cities/${e.slug}/air-quality`,
          })),
        })}
      />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Air quality in French cities
        </h1>
        <p className="mt-3 max-w-3xl text-base text-[var(--text-secondary)] leading-relaxed">
          What official monitoring stations actually measured in {AIR_MEASURE_YEAR}, city by city. Each value is the
          annual average of the nearest &quot;background&quot; station, the one that measures the air of residential
          areas rather than the kerb of a main road.{" "}
          {`${no2.pool} cities are ranked on nitrogen dioxide, from ${no2.stations} stations.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Validated {AIR_MEASURE_YEAR} measurements</Badge>
          <Badge>Sources: AASQA · LCSQA · European Environment Agency</Badge>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{fmt(no2.median)}</div>
            <div className="text-xs text-[var(--text-secondary)]">µg/m³ of NO₂, median of ranked cities</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold tabular-nums text-amber-600">{no2.overWho}</div>
            <div className="text-xs text-[var(--text-secondary)]">cities above the WHO guideline (10)</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold tabular-nums text-orange-600">{no2.overEu2030}</div>
            <div className="text-xs text-[var(--text-secondary)]">above the EU&apos;s 2030 limit (20)</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold tabular-nums text-emerald-600">{no2.overEu}</div>
            <div className="text-xs text-[var(--text-secondary)]">above the current EU limit (40)</div>
          </Card>
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-3xl">
          {no2.overEu === 0
            ? "No background station exceeds the EU limit in force today. "
            : `${no2.overEu} cities exceed the EU limit in force. `}
          {`${pct(no2.overWho ?? 0, no2.pool)}% of ranked cities are still above the WHO guideline, and the 2030 limit, twice as strict as today's, is already exceeded in ${no2.overEu2030} cities${
            no2Over2030.length === 0 ? "" : no2Over2030Idf === no2Over2030.length ? ", all of them in the Paris region" : `, ${no2Over2030Idf} of them in the Paris region`
          }.`}
        </p>

        {sections.map(({ p, stats, cleanest, worst }) => (
          <div key={p} className="mt-12">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{LABEL[p]}</h2>
            <p className="mt-2 max-w-3xl text-sm text-[var(--text-secondary)]">
              {ABOUT[p]}{" "}
              {p === "o3"
                ? `Measure: days on which the 8-hour mean exceeded 120 µg/m³ (EU target: no more than 25 days a year). Median: ${fmt(stats.median)} days.`
                : `WHO guideline: ${AIR_REFERENCES[p].who} µg/m³ · EU limit: ${AIR_REFERENCES[p].eu} (${AIR_REFERENCES[p].eu2030} from 2030). Median of the ${stats.pool} ranked cities: ${fmt(stats.median)} µg/m³.`}
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <AirRankingList ranking={cleanest} pollutant={p} title={p === "o3" ? "Fewest peak days" : "Cleanest air"} locale="en" />
              <AirRankingList ranking={worst} pollutant={p} title={p === "o3" ? "Most peak days" : "Most polluted air"} locale="en" />
            </div>
          </div>
        ))}

        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Method</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] list-disc pl-5">
            <li>
              Validated hourly measurements ({AIR_MEASURE_YEAR}) from the AASQA stations, compiled by LCSQA (Licence
              Ouverte) and published by the European Environment Agency (CC BY 4.0). Station positions and types: France&apos;s
              official reporting to the EU.
            </li>
            <li>A station must cover at least 75 % of the year with valid data.</li>
            <li>
              For each city, the nearest background station. Ranking limited to urban or suburban stations within{" "}
              {RANK_MAX_KM} km; other cities show their measurement, with the distance, on their own page.
            </li>
            <li>
              A station measures one point, not a whole town: along a boulevard, pollution is markedly higher. This
              ranking compares background air, the air you breathe at home.
            </li>
          </ul>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
