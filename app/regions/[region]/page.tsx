import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CityCard } from "@/components/CityCard";
import { CITIES_SEED } from "@/data/cities-seed";
import { GUIDES } from "@/data/guides";
import type { City } from "@/lib/types";

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
  "ile-de-france": "L'Île-de-France concentre 20% de la population française et 30% du PIB. Paris reste le centre incontesté de la culture, de l'emploi et du réseau professionnel. Mais les villes de la petite couronne (Vincennes, Saint-Germain-en-Laye) offrent un compromis intéressant entre vie parisienne et cadre plus résidentiel.",
  "corse": "La Corse est l'île de beauté française par excellence : 2 890 heures de soleil à Ajaccio, la mer Méditerranée omniprésente, le maquis parfumé, les montagnes accessibles. Elle attire retraités en quête de soleil et télétravailleurs cherchant un cadre de vie exceptionnel. Le coût de la vie y est plus élevé que sur le continent en raison de l'insularité, et les transports internes restent une contrainte.",
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
    title: `Meilleures villes ${region} 2025 — Qualité de vie & Classements`,
    description: `Découvrez les ${cities.length} meilleures villes de ${region} : scores de qualité de vie, avis d'habitants, comparaisons. N°1 : ${topCity?.name} (${topCity?.scores.global}/10).`,
    openGraph: {
      title: `Villes de ${region} — MeilleurVille`,
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

  const regionDesc = REGION_DESCRIPTIONS[regionSlug];
  const departments = [...new Set(cities.map((c) => c.department))];
  const topCity = cities[0];

  const regionGuide = GUIDES.find((g) =>
    g.category === "region" && g.relatedCities.some((slug) => cities.some((c) => c.slug === slug))
  );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "MeilleurVille", item: baseUrl },
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
              "text": `MeilleurVille analyse ${cities.length} villes en ${regionName}, réparties sur ${departments.length} département${departments.length > 1 ? "s" : ""}. Le score moyen de la région est de ${avgScore.toFixed(1)}/10.`,
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/regions" className="hover:text-[var(--text-secondary)] transition-colors">Régions</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{regionName}</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{emoji}</div>
            <div>
              <Badge variant="accent" className="mb-2">Région</Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
                {regionName}
              </h1>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            {cities.length} villes analysées · Score moyen {avgScore.toFixed(1)}/10 · Données 2025
          </p>
          {regionDesc && (
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed">
              {regionDesc}
            </p>
          )}
          {/* Criteria bar */}
          <div className="mt-5 flex flex-wrap gap-3">
            {Object.entries(avgCriteria).map(([key, val]) => (
              <div key={key} className="rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] px-4 py-2 text-center">
                <div className="text-sm font-bold font-mono-data text-[var(--accent)]">{val.toFixed(1)}</div>
                <div className="text-[10px] text-[var(--text-tertiary)] capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        {/* Top 3 */}
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Top 3 en {regionName}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {top3.map((city, i) => (
              <CityCard key={city.slug} city={seedToCity(city)} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* Full list */}
        {rest.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              Toutes les villes ({cities.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((city, i) => (
                <CityCard key={city.slug} city={seedToCity(city)} rank={i + 4} />
              ))}
            </div>
          </section>
        )}

        {/* Departments */}
        {departments.length > 1 && (
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
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
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium text-[var(--text-primary)]">{dept}</span>
                    <span className="ml-1.5 text-xs text-[var(--text-tertiary)]">
                      {deptCities.length} ville{deptCities.length > 1 ? "s" : ""}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Related links */}
        <div className="flex flex-wrap gap-3 pt-4">
          <Link href="/regions" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            ← Toutes les régions
          </Link>
          {regionGuide && (
            <Link
              href={`/guides/${regionGuide.slug}`}
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-colors"
            >
              {regionGuide.emoji} Guide {regionName.split("-")[0]} →
            </Link>
          )}
          <Link href="/classements" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Classements thématiques →
          </Link>
          <Link href="/quiz" className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors">
            ✨ Quiz : trouver ma ville →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
