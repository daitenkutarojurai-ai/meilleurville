import { Metadata } from "next";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { CITIES_SEED } from "@/data/cities-seed";
import { EN_GUIDES } from "@/data/guides-en";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE, hreflangLanguagesEn } from "@/lib/i18n";
import { REGION_EMOJIS, regionToSlug } from "@/lib/regions";
import { jsonLdScript } from "@/lib/jsonld";
import { fitTitle } from "@/lib/brand";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; region: string }> };

// One-paragraph English tagline per region. Matches the FR REGION_DESCRIPTIONS
// in vibe but written natively in English, not translated literally.
const REGION_EN_DESCRIPTIONS: Record<string, string> = {
  "auvergne-rhone-alpes":
    "Auvergne-Rhône-Alpes is France's most varied region: the economic weight of Lyon (France's 2nd city), the Alps via Grenoble and Annecy, and the volcano country around Clermont-Ferrand. Best fit if you want alpine nature, tech jobs, or a top-tier living setting.",
  "pays-de-la-loire":
    "Pays de la Loire combines Nantes' metropolitan energy, an active student scene, and an accessible Atlantic coast. One of France's most attractive regions today, with steady demographic growth and an expanding job market.",
  "bretagne":
    "Brittany is where coastal quality of life meets a strong tech economy. Rennes leads French Tech, Brest is reinventing its maritime identity, and the coastline offers some of Europe's most striking landscapes. A strong regional identity fosters real social cohesion.",
  "nouvelle-aquitaine":
    "Nouvelle-Aquitaine is France's largest region by area. From Bordeaux's urban pulse to the premium lifestyle of the Basque Country, to the rural authenticity of Périgord and Corrèze. Wine, surf, and food make it a lifestyle region of its own.",
  "occitanie":
    "Occitanie gets the best sunshine in mainland France. Toulouse hosts European aerospace, Montpellier shines in health and tech, and Perpignan has the mildest winters in France. The place to go for sunshine without leaving the country.",
  "normandie":
    "Normandy combines remarkable historical heritage, top-tier agriculture, and proximity to Paris (Rouen ~1h20 from Saint-Lazare). Caen and Rouen are solid university towns, and the coast is one of the most accessible from the Paris region.",
  "bourgogne-franche-comte":
    "Bourgogne-Franche-Comté is France's wine and gastronomic heritage region. Dijon is an underestimated university town with exceptional food, Besançon a preserved green city. Property prices remain among the most accessible in the country.",
  "centre-val-de-loire":
    "Centre-Val de Loire is the region of the Loire châteaux and remarkably accessible real estate within an hour of Paris. Tours, UNESCO-listed, offers a rare heritage-driven quality of life. Ideal for Parisians wanting distance without losing capital access.",
  "hauts-de-france":
    "Hauts-de-France is the most underrated value-for-money region. Lille is an international metro (35 min to Brussels, 1h to Paris, 1h25 to London) with an intense culture and food scene. Amiens and neighbours offer ultra-affordable property with TGV access.",
  "provence-alpes-cote-d-azur":
    "PACA is France's sunniest and most coveted region. Marseille (2nd city) is on the rise, Aix-en-Provence layers heritage and quality of life, Nice combines art-de-vivre and the Mediterranean. Prices are high, but the quality of life is often considered unmatched.",
  "grand-est":
    "Grand Est is the open-borders region. Strasbourg is a European capital and a model for soft mobility. Mulhouse and Bas-Rhin enable cross-border work in Switzerland and Germany at much higher salaries. Colmar is one of France's most photographed towns.",
  "ile-de-france":
    "Île-de-France concentrates 20% of France's population and 30% of GDP. Paris is the undisputed centre of culture, employment, and professional networking, but the region spans a wide spectrum: the chic suburbs (Neuilly, Versailles, Saint-Germain-en-Laye), tech-heavy hubs (Issy, Levallois), creative cities (Montreuil, Pantin), and affordable new towns (Cergy). The Fontainebleau and Boulogne forests offer real green space without leaving the region.",
  "corse":
    "Corsica is France's island of beauty: nearly 305 sunny days in Ajaccio, the Mediterranean ever-present, fragrant maquis, accessible mountains. It attracts retirees chasing sunshine and remote workers chasing an exceptional setting. Cost of living is higher than mainland France due to insularity, and internal transport remains a constraint.",
  "la-reunion":
    "Réunion is a French department in the Indian Ocean, 9,000 km from mainland France: active volcano (Piton de la Fournaise), UNESCO-listed cirques, lagoon, and a tropical climate tempered by altitude. Saint-Denis concentrates administration, Saint-Pierre radiates over the south, Le Tampon and the highlands offer cooler temps and nature. Cost of living is 7-12% above mainland, but outdoor quality of life is exceptional.",
  "martinique":
    "Martinique is a Caribbean island with a tropical climate (28 °C year-round), Fort-de-France as prefecture, and a lively Creole heritage. Beaches, white sands, agricultural rum AOC, and food are part of daily life. Cost of living is higher than mainland and the job market is tight, but the setting is unmatched for sun, sea, and Creole lifestyle.",
  "guadeloupe":
    "Guadeloupe is a butterfly-shaped Caribbean archipelago: balnéaire Grande-Terre (Pointe-à-Pitre, Le Gosier), mountainous Basse-Terre with Soufrière and tropical forest. Les Abymes and Baie-Mahault concentrate economic activity. Warm year-round, accessible lagoons, but elevated cost of living and tight housing market in tourist zones.",
  "guyane":
    "French Guiana is an Amazonian territory the size of Portugal, mostly covered by primary forest. Cayenne (prefecture) is driven by the Kourou space centre and a young demographic. Saint-Laurent-du-Maroni borders the Suriname river. Hot, humid equatorial climate, exceptional biodiversity, but limited infrastructure and high cost of living away from the coast.",
  "mayotte":
    "Mayotte is France's 101st department, in the Comoros archipelago. One of the world's largest lagoons, remarkable marine biodiversity (turtles, dolphins, humpback whales in season). Mamoudzou concentrates population and activity. Economic and social challenges remain, but the natural potential is immense and the island increasingly attracts sea-oriented residents.",
};

export async function generateStaticParams() {
  const regions = [...new Set(CITIES_SEED.map((c) => c.region).filter(Boolean) as string[])];
  return regions.map((r) => ({ locale: "en", region: regionToSlug(r) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params;
  const allRegions = [...new Set(CITIES_SEED.map((c) => c.region).filter(Boolean) as string[])];
  const regionName = allRegions.find((r) => regionToSlug(r) === region);
  if (!regionName) return {};
  return {
    title: fitTitle(`Cities in ${regionName} · French city guide`),
    description: `Best cities to live in ${regionName} in 2026 — rankings, quality of life, and resident reviews.`,
    alternates: { canonical: `${EN_BASE}/regions/${region}`, languages: hreflangLanguagesEn(`/regions/${region}`) },
  };
}

export default async function EnRegionDetail({ params }: Props) {
  const { region } = await params;
  const allRegions = [...new Set(CITIES_SEED.map((c) => c.region).filter(Boolean) as string[])];
  const regionName = allRegions.find((r) => regionToSlug(r) === region);
  if (!regionName) notFound();

  const cities = CITIES_SEED
    .filter((c) => c.region === regionName)
    .sort((a, b) => b.scores.global - a.scores.global);

  const regionCitySlugs = new Set(cities.map((c) => c.slug));
  const regionGuides = EN_GUIDES.filter((g) =>
    g.relatedCities.some((s) => regionCitySlugs.has(s))
  )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 12);

  const intro = REGION_EN_DESCRIPTIONS[region] ??
    `${cities.length} cities, average score ${(cities.reduce((s, c) => s + c.scores.global, 0) / cities.length).toFixed(1)}/10.`;

  const topCity = cities[0];
  const avgScore = cities.reduce((s, c) => s + c.scores.global, 0) / cities.length;
  const departments = [...new Set(cities.map((c) => c.department).filter(Boolean))];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
          { "@type": "ListItem", position: 2, name: "Regions", item: `${EN_BASE}/regions` },
          { "@type": "ListItem", position: 3, name: regionName, item: `${EN_BASE}/regions/${region}` },
        ],
      },
      {
        "@type": "ItemList",
        name: `Best cities in ${regionName}`,
        url: `${EN_BASE}/regions/${region}`,
        numberOfItems: cities.length,
        // `cities` est trié par score global décroissant (voir plus haut) :
        // `ItemListOrderAscending` annonçait donc l'inverse de la liste publiée,
        // et la jumelle FR (`app/regions/[region]`) ne déclare aucun ordre.
        // Retiré plutôt que remplacé, pour que les deux locales disent la même
        // chose. Cf. docs/integrite-2026-08-28.md.
        itemListElement: cities.slice(0, 25).map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          url: `${EN_BASE}/cities/${c.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `What is the best city in ${regionName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Based on our scoring, the best city in ${regionName} is ${topCity.name} with an overall score of ${topCity.scores.global.toFixed(1)}/10.`,
            },
          },
          {
            "@type": "Question",
            name: `How many cities are ranked in ${regionName}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `We rank ${cities.length} cities in ${regionName}, across ${departments.length} department${departments.length > 1 ? "s" : ""}. The region's average score is ${avgScore.toFixed(1)}/10.`,
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
      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="mb-5 flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/regions" className="hover:text-[var(--text-secondary)] transition-colors">Regions</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{regionName}</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <EmojiBadge emoji={REGION_EMOJIS[regionName] ?? "🇫🇷"} tone={toneFor(region)} />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Region
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Cities in <span className="font-display gradient-text-anim italic">{regionName}</span>
          </h1>
          <p className="mt-4 text-[var(--text-secondary)] text-lg max-w-3xl leading-relaxed">{intro}</p>
          <Link
            href={`/regions/${region}/synthesis`}
            className="mt-5 inline-flex items-center gap-2 rounded-full grad-head-0 px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
          >
            <span>8-dimension synthesis ranking →</span>
          </Link>
        </div>
      </section>
      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold gradient-text mb-4">
            {cities.length} cities, ranked by quality of life
          </h2>
          <ol className="space-y-2">
            {cities.map((c, i) => (
              <li key={c.slug}>
                <Link
                  href={`/cities/${c.slug}`}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-transparent shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] transition-all hover:-translate-y-0.5 hover:ring-[#C7D2FE]"
                >
                  <span className="font-mono-data text-xl font-bold w-10 text-[#4338CA]">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--text-primary)] truncate">{c.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{c.department ?? ""}</p>
                  </div>
                  <span className={`font-mono-data font-bold text-2xl ${scoreColor(c.scores.global)}`}>
                    {c.scores.global.toFixed(1)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
      {regionGuides.length > 0 && (
        <section className="band band-lilac py-10 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <h2 className="text-xl font-bold gradient-text">
                Guides about {regionName}
              </h2>
              <Link href="/guides" className="text-xs font-semibold text-[#4338CA] hover:underline">
                All guides →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {regionGuides.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="group block">
                  <div className="h-full rounded-2xl bg-white p-4 ring-1 ring-transparent shadow-[0_10px_28px_-18px_rgba(124,58,237,0.45)] transition-all group-hover:-translate-y-0.5 group-hover:ring-[#D8B4FE]">
                    <EmojiBadge emoji={g.emoji} tone={toneFor(g.slug)} size="sm" className="mb-2" />
                    <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-3">
                      {g.title}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-2">{g.readMinutes} min</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget locale="en" />
        </div>
      </section>
      <Footer />
    </main>
  );
}
