import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { EN_GUIDES } from "@/data/guides-en";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE, hreflangLanguagesEn } from "@/lib/i18n";
import { REGION_EMOJIS, regionToSlug } from "@/lib/regions";

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
    title: `Cities in ${regionName} · French city guide`,
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

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/regions" className="hover:text-[var(--accent)]">Regions</Link>
          {" · "}
          <span>{regionName}</span>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl" aria-hidden>{REGION_EMOJIS[regionName] ?? "🇫🇷"}</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Cities in {regionName}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg max-w-3xl leading-relaxed">{intro}</p>
        <Link
          href={`/regions/${region}/synthesis`}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--accent)]/10 transition-colors"
        >
          <span>8-dimension synthesis ranking →</span>
        </Link>
      </section>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
          {cities.length} cities, ranked by quality of life
        </h2>
        <ol className="space-y-2">
          {cities.map((c, i) => (
            <li key={c.slug}>
              <Link
                href={`/cities/${c.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
              >
                <span className="font-mono-data text-xl font-bold w-10 text-[var(--text-tertiary)]">#{i + 1}</span>
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
      </section>
      {regionGuides.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-10">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Guides about {regionName}
            </h2>
            <Link href="/guides" className="text-xs text-[var(--accent)] hover:underline">
              All guides →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regionGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)] transition-colors"
              >
                <span className="text-2xl mb-2 block">{g.emoji}</span>
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-3">
                  {g.title}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">{g.readMinutes} min</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      <Footer />
    </main>
  );
}
