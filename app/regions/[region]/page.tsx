import { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { CityCard } from "@/components/CityCard";
import { CITIES_SEED } from "@/data/cities-seed";
import { GUIDES } from "@/data/guides";
import type { City } from "@/lib/types";
import { hreflangLanguages } from "@/lib/i18n";
import { fitTitle } from "@/lib/brand";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ region: string }> };

const REGION_EMOJIS: Record<string, string> = {
  "auvergne-rhone-alpes": "⛰️",
  "pays-de-la-loire": "🌊",
  "bretagne": "⚓",
  "nouvelle-aquitaine": "🍷",
  "occitanie": "☀️",
  "normandie": "🏰",
  "bourgogne-franche-comte": "🍇",
  "centre-val-de-loire": "🏰",
  "hauts-de-france": "🌾",
  "provence-alpes-cote-d-azur": "🌺",
  "grand-est": "🥨",
  "ile-de-france": "🗼",
  "corse": "🏝️",
  "la-reunion": "🌋",
  "martinique": "🌺",
  "guadeloupe": "🌴",
  "guyane": "🌿",
  "mayotte": "🐢",
};

const REGION_DESCRIPTIONS: Record<string, string> = {
  "auvergne-rhone-alpes": "Auvergne-Rhône-Alpes est la région la plus diverse de France : elle allie la puissance économique de Lyon (2e ville de France), les Alpes avec Grenoble et Annecy, et les volcans auvergnats autour de Clermont-Ferrand. Idéale pour les profils cherchant nature alpine, emploi tech, ou cadre de vie exceptionnel.",
  "pays-de-la-loire": "Les Pays de la Loire combinent la dynamique métropolitaine de Nantes, la vie étudiante, et un littoral atlantique accessible. Région des plus attractives de France, elle affiche une croissance démographique soutenue et un marché de l'emploi en progression constante.",
  "bretagne": "La Bretagne est la région française où la qualité de vie côtière rencontre une économie tech dynamique. Rennes mène la French Tech, Brest modernise son identité maritime, et la côte offre des paysages parmi les plus spectaculaires d'Europe. L'identité bretonne forte crée une cohésion sociale unique.",
  "nouvelle-aquitaine": "La Nouvelle-Aquitaine est la plus grande région de France en surface. Elle offre un éventail exceptionnel : Bordeaux et son dynamisme urbain, le Pays Basque et son lifestyle premium, le Périgord et la Corrèze ruraux mais authentiques. La viticulture, le surf et la gastronomie en font une région de style de vie à part.",
  "occitanie": "L'Occitanie bénéficie du meilleur ensoleillement de France continentale. Toulouse concentre l'industrie aéronautique européenne, Montpellier rayonne en santé et numérique, et Perpignan affiche les hivers les plus doux de France. Une région pour ceux qui veulent le soleil sans s'expatrier.",
  "normandie": "La Normandie allie patrimoine historique remarquable, agriculture d'exception et proximité de Paris (Rouen à 1h20 de Saint-Lazare). Caen et Rouen sont des villes universitaires solides, et le littoral normand reste l'un des plus accessibles depuis la région parisienne.",
  "bourgogne-franche-comte": "Bourgogne-Franche-Comté est la région du patrimoine gastronomique et viticole français. Dijon est une ville universitaire méconnue avec une gastronomie exceptionnelle, Besançon une ville verte préservée. Les prix de l'immobilier restent parmi les plus accessibles de France.",
  "centre-val-de-loire": "Le Centre-Val de Loire est la région des châteaux de la Loire et d'un immobilier remarquablement accessible à 1h de Paris. Tours, classée UNESCO, offre une qualité de vie patrimoniale rare. La région est idéale pour les Parisiens cherchant à s'éloigner sans perdre l'accessibilité capitale.",
  "hauts-de-france": "Les Hauts-de-France sont la région la plus sous-estimée pour le rapport qualité/prix. Lille est une métropole internationale (à 35 min de Bruxelles, 1h de Paris, 1h25 de Londres), avec une scène culturelle et gastronomique intense. Amiens et ses voisines offrent un immobilier ultra-abordable avec accès TGV.",
  "provence-alpes-cote-d-azur": "PACA est la région la plus ensoleillée et convoitée de France. Marseille (2e ville de France) monte en puissance, Aix-en-Provence cumule patrimoine et qualité de vie, Nice allie art de vivre et Méditerranée. Les prix sont élevés mais la qualité de vie y est souvent jugée incomparable.",
  "grand-est": "Le Grand Est est la région des frontières ouvertes. Strasbourg est capitale européenne et modèle de mobilité douce. Mulhouse et le Bas-Rhin permettent le travail frontalier en Suisse et Allemagne avec des salaires bien supérieurs. Colmar est l'une des villes les plus photographiées de France.",
  "ile-de-france": "L'Île-de-France concentre 20% de la population française et 30% du PIB national. Paris est le centre incontesté de la culture, de l'emploi et du réseau professionnel. Mais la région offre un éventail considérable : la banlieue chic (Neuilly-sur-Seine, Versailles, Saint-Germain-en-Laye, Vincennes) pour les familles aisées en quête de prestige et d'espaces verts, les villes tech (Issy-les-Moulineaux, Levallois-Perret) pour les profils numériques, les villes créatives (Montreuil, Pantin) pour les artistes, et les villes nouvelles accessibles (Cergy) pour les budgets serrés. La forêt de Fontainebleau et le Bois de Boulogne offrent des espaces naturels exceptionnels sans quitter la région.",
  "corse": "La Corse est l'île de beauté française par excellence : près de 305 jours de soleil à Ajaccio, la mer Méditerranée omniprésente, le maquis parfumé, les montagnes accessibles. Elle attire retraités en quête de soleil et télétravailleurs cherchant un cadre de vie exceptionnel. Le coût de la vie y est plus élevé que sur le continent en raison de l'insularité, et les transports internes restent une contrainte.",
  "la-reunion": "La Réunion est un département français de l'océan Indien à 9 000 km de la métropole : volcan actif (Piton de la Fournaise), cirques classés UNESCO, lagon, et un climat tropical tempéré par l'altitude. Saint-Denis concentre l'administration, Saint-Pierre rayonne sur le sud, Le Tampon et les hauts offrent fraîcheur et nature. Le coût de la vie reste 7 à 12 % au-dessus de la métropole (octroi de mer), mais la qualité de vie outdoor est exceptionnelle.",
  "martinique": "La Martinique est une île caribéenne au climat tropical (28 °C toute l'année), avec Fort-de-France comme préfecture et un patrimoine créole vivant. Les plages, les fonds blancs, le rhum agricole AOC et la gastronomie font partie du quotidien. Le coût de la vie est plus élevé qu'en métropole, le marché de l'emploi reste tendu, mais le cadre est inégalable pour qui cherche soleil, mer et lifestyle créole.",
  "guadeloupe": "La Guadeloupe est un archipel caribéen en forme de papillon : Grande-Terre balnéaire (Pointe-à-Pitre, Le Gosier), Basse-Terre montagneuse avec la Soufrière et la forêt tropicale. Les Abymes et Baie-Mahault concentrent l'activité économique. Climat chaud toute l'année, lagons accessibles, mais coût de la vie élevé et marché immobilier sous tension dans les zones touristiques.",
  "guyane": "La Guyane est un territoire amazonien grand comme le Portugal, en majorité couvert de forêt primaire. Cayenne (préfecture) est portée par le centre spatial de Kourou et une démographie jeune. Saint-Laurent-du-Maroni borde le fleuve frontalier avec le Suriname. Climat équatorial chaud et humide, biodiversité exceptionnelle, mais infrastructures limitées et coût de la vie élevé loin du littoral.",
  "mayotte": "Mayotte est le 101e département français, dans l'archipel des Comores. Lagon parmi les plus grands du monde, biodiversité marine remarquable (tortues, dauphins, baleines à bosse en saison). Mamoudzou concentre la population et l'activité. La situation économique et sociale reste difficile (insécurité, accès aux services, immigration), mais le potentiel naturel est immense et l'île attire de plus en plus de profils tournés vers la mer.",
};

function slugToRegion(slug: string): string | undefined {
  return CITIES_SEED.map((c) => c.region).find((r) =>
    r.toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") === slug
  );
}

function regionToSlug(region: string): string {
  return region
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function generateStaticParams() {
  const regions = [...new Set(CITIES_SEED.map((c) => c.region))];
  return regions.map((r) => ({ region: regionToSlug(r) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: regionSlug } = await params;
  const region = slugToRegion(regionSlug);
  if (!region) return {};
  const cities = CITIES_SEED.filter((c) => c.region === region);
  const topCity = [...cities].sort((a, b) => b.scores.global - a.scores.global)[0];
  return {
    title: fitTitle(`Meilleures villes ${region} 2026 · Qualité de vie & Classements`),
    description: `Découvrez les ${cities.length} meilleures villes de ${region} : scores de qualité de vie, avis d'habitants, comparaisons. N°1 : ${topCity?.name} (${topCity?.scores.global}/10).`,
    alternates: { canonical: `/regions/${regionSlug}`, languages: hreflangLanguages(`/regions/${regionSlug}`) },
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Villes de ${region} · MaVilleIdéale`,
      description: `${cities.length} villes analysées · Top : ${topCity?.name} ${topCity?.scores.global}/10`,
    },
  };
}

function seedToCity(s: (typeof CITIES_SEED)[number]): City {
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    region: s.region,
    department: s.department,
    population: s.population,
    latitude: s.latitude,
    longitude: s.longitude,
    scores: s.scores,
    characterTags: s.characterTags,
    reviewCount: 180 + Math.floor(s.scores.global * 30),
    sunshinedays: s.sunshinedays,
    avgTempJuly: s.avgTempJuly,
    avgTempJanuary: s.avgTempJanuary,
  };
}

export default async function RegionPage({ params }: Props) {
  const { region: regionSlug } = await params;
  const regionName = slugToRegion(regionSlug);
  if (!regionName) notFound();

  const cities = CITIES_SEED.filter((c) => c.region === regionName)
    .sort((a, b) => b.scores.global - a.scores.global);

  if (cities.length === 0) notFound();

  const top3 = cities.slice(0, 3);
  const rest = cities.slice(3);
  const avgScore = cities.reduce((s, c) => s + c.scores.global, 0) / cities.length;
  const emoji = REGION_EMOJIS[regionSlug] ?? "📍";

  // Avg scores per criterion
  const avgCriteria = {
    nature: cities.reduce((s, c) => s + c.scores.nature, 0) / cities.length,
    cost: cities.reduce((s, c) => s + c.scores.cost, 0) / cities.length,
    safety: cities.reduce((s, c) => s + c.scores.safety, 0) / cities.length,
    transport: cities.reduce((s, c) => s + c.scores.transport, 0) / cities.length,
    culture: cities.reduce((s, c) => s + c.scores.culture, 0) / cities.length,
  };

  const AXIS_LABEL_FR: Record<keyof typeof avgCriteria, string> = {
    nature: "Nature",
    cost: "Coût de la vie",
    safety: "Sécurité",
    transport: "Transports",
    culture: "Culture",
  };

  const regionDesc = REGION_DESCRIPTIONS[regionSlug];
  const departments = [...new Set(cities.map((c) => c.department))];
  const topCity = cities[0];

  const regionGuide = GUIDES.find((g) =>
    g.category === "region" && g.relatedCities.some((slug) => cities.some((c) => c.slug === slug))
  );
  const regionCitySlugs = new Set(cities.map((c) => c.slug));
  const regionGuides = GUIDES.filter((g) =>
    g.relatedCities.some((s) => regionCitySlugs.has(s))
  )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 9);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "MaVilleIdéale", item: baseUrl },
          { "@type": "ListItem", position: 2, name: "Régions", item: `${baseUrl}/regions` },
          { "@type": "ListItem", position: 3, name: regionName, item: `${baseUrl}/regions/${regionSlug}` },
        ],
      },
      {
        "@type": "ItemList",
        "name": `Meilleures villes de ${regionName}`,
        "numberOfItems": cities.length,
        "itemListElement": cities.slice(0, 10).map((c, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "name": c.name,
          "url": `${baseUrl}/villes/${c.slug}`,
        })),
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Quelle est la meilleure ville de ${regionName} ?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `La meilleure ville de ${regionName} selon notre algorithme est ${topCity.name} avec un score global de ${topCity.scores.global}/10. Elle se distingue par ${topCity.characterTags.slice(0, 3).join(", ")}.`,
            },
          },
          {
            "@type": "Question",
            "name": `Combien de villes sont analysées en ${regionName} ?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `MaVilleIdéale analyse ${cities.length} villes en ${regionName}, réparties sur ${departments.length} département${departments.length > 1 ? "s" : ""}. Le score moyen de la région est de ${avgScore.toFixed(1)}/10.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/regions" className="hover:text-[var(--text-secondary)] transition-colors">Régions</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{regionName}</span>
          </nav>
          <div className="flex items-center gap-3 mb-3">
            <EmojiBadge emoji={emoji} tone={toneFor(regionSlug)} />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Région
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="font-display gradient-text-anim italic">{regionName}</span>
          </h1>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">{cities.length} villes analysées</span>
            <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">Score moyen {avgScore.toFixed(1)}/10</span>
            <span className="inline-flex items-center rounded-full bg-white/85 px-3 py-1 font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE]">Données 2026</span>
          </div>
          {regionDesc && (
            <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed">
              {regionDesc}
            </p>
          )}
        </div>
      </section>

      {/* Profil moyen + synthèse */}
      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold gradient-text">Profil moyen de la région</h2>
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
            {Object.entries(avgCriteria).map(([key, val]) => (
              <div key={key} className="rounded-2xl bg-white px-4 py-3 text-center shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="text-xl font-bold font-mono-data text-[#4338CA]">{val.toFixed(1)}</div>
                <div className="text-xs text-[var(--text-secondary)]">{AXIS_LABEL_FR[key as keyof typeof avgCriteria]}</div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--text-tertiary)]">
            Moyenne des villes de la région, sur 10 : 10 = le meilleur sur chaque axe (coût de la vie : 10 = le plus abordable).
          </p>

          {/* F66 — Synthèse région teaser */}
          <Link
            href={`/regions/${regionSlug}/synthese`}
            className="group mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-white ring-1 ring-transparent hover:ring-[#C7D2FE] shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)] hover:-translate-y-0.5 transition-all px-5 py-4"
          >
            <EmojiBadge emoji="✨" tone="lilac" size="sm" className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                Synthèse 8 axes — villes de {regionName}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Palmarès régional sur env / santé / emploi / cadre / vélo / sécurité / démo /
                services publics + profil moyen de la région.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold shrink-0">Voir →</span>
          </Link>
        </div>
      </section>

      {/* Top 3 */}
      <section className="band band-pink py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold gradient-text mb-4">Top 3 en {regionName}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {top3.map((city, i) => (
              <CityCard key={city.slug} city={seedToCity(city)} rank={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Full list */}
      {rest.length > 0 && (
        <section className="band band-sky py-10 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold gradient-text mb-4">
              Toutes les villes ({cities.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((city, i) => (
                <CityCard key={city.slug} city={seedToCity(city)} rank={i + 4} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Départements + guides + renvois */}
      <section className="band band-lilac py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
          {departments.length > 1 && (
            <div>
              <h2 className="text-xl font-bold gradient-text mb-4">
                Départements de {regionName}
              </h2>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => {
                  const deptSlug = dept.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  const deptCities = cities.filter((c) => c.department === dept);
                  return (
                    <Link
                      key={dept}
                      href={`/departements/${deptSlug}`}
                      className="rounded-full bg-white ring-1 ring-[#E9D5FF] hover:ring-[#C084FC] shadow-[0_8px_20px_-16px_rgba(124,58,237,0.5)] transition-all px-4 py-2 text-sm"
                    >
                      <span className="font-medium text-[var(--text-primary)]">{dept}</span>
                      <span className="ml-1.5 text-xs text-[#6D28D9]">
                        {deptCities.length} ville{deptCities.length > 1 ? "s" : ""}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {regionGuides.length > 0 && (
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <h2 className="text-xl font-bold gradient-text">
                  {regionGuides.length} guides liés à {regionName}
                </h2>
                <Link href="/guides" className="text-xs font-semibold text-[#4338CA] hover:underline">
                  Tous les guides →
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
          )}

          <div className="flex flex-wrap gap-3">
            <Link href="/regions" className="rounded-full bg-white ring-1 ring-[#C7D2FE] px-4 py-2.5 text-sm font-medium text-[#4338CA] hover:ring-[#818CF8] transition-all">
              ← Toutes les régions
            </Link>
            {regionGuide && (
              <Link
                href={`/guides/${regionGuide.slug}`}
                className="rounded-full bg-white ring-1 ring-[#C7D2FE] px-4 py-2.5 text-sm font-medium text-[#4338CA] hover:ring-[#818CF8] transition-all"
              >
                {regionGuide.emoji} Guide {regionName.split("-")[0]} →
              </Link>
            )}
            <Link href="/classements" className="rounded-full bg-white ring-1 ring-[#C7D2FE] px-4 py-2.5 text-sm font-medium text-[#4338CA] hover:ring-[#818CF8] transition-all">
              Classements thématiques →
            </Link>
            <Link href="/city-match" className="rounded-full grad-head-0 px-4 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5">
              ✨ Quiz : trouver ma ville →
            </Link>
          </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>

      <Footer />
    </main>
  );
}
