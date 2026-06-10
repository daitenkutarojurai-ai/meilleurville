import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RANKING_META, getRankedCities, type RankingSlug } from "@/lib/rankings";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE, hreflangLanguagesEn } from "@/lib/i18n";
import { jsonLdScript } from "@/lib/jsonld";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

// EN labels + descriptions for the 19 ranking slugs. Slugs themselves stay
// in French (single source of truth in lib/rankings.ts) — only the display
// copy is translated.
const RANKING_EN: Record<string, {
  label: string;
  headline: string;
  description: string;
  methodology: string;
  why: string[];
}> = {
  teletravail: {
    label: "Remote work",
    headline: "Best French cities for remote work in 2026",
    description:
      "Ranking of French cities for remote workers: fibre coverage, coworking spaces, cost of living vs salary, quality of life, and digital-nomad community.",
    methodology:
      "Composite score: Remote work (×3), Quality of life (×2), Cost (×1.5), Transport (×1), Culture (×0.5).",
    why: [
      "Fibre and 4G/5G coverage",
      "Density of coworking spaces",
      "Cost of living vs remote-tier salary",
      "Active digital community",
      "Day-to-day quality of life",
    ],
  },
  famille: {
    label: "Families",
    headline: "Best French cities for families in 2026",
    description:
      "Ranking of French cities to raise kids in: schools, safety, green space, housing affordability, and access to paediatric care.",
    methodology: "Composite score: Schools (×3), Safety (×2.5), Nature (×2), Cost (×1.5), Transport (×1).",
    why: [
      "School quality and academic outcomes",
      "Community safety index",
      "Parks and green space within walking distance",
      "Median price per m²",
      "Access to paediatric care",
    ],
  },
  nature: {
    label: "Nature & sport",
    headline: "Best French cities for outdoor lovers",
    description:
      "Ranking of French cities for nature, sport and the great outdoors: hiking, cycling, mountains, sea, air quality.",
    methodology: "Composite score: Nature (×4), Quality of life (×2), Safety (×1), Transport (×0.5).",
    why: [
      "Forest, lake, mountain or sea within 30 min",
      "Kilometres of safe cycle lanes",
      "Air-quality index (PM2.5, PM10)",
      "Annual sunshine (days)",
      "Sports clubs and outdoor infrastructure",
    ],
  },
  etudiant: {
    label: "Students",
    headline: "Best student cities in France",
    description:
      "Ranking of the best French student cities: universities, rent affordability, nightlife, mobility and cultural energy.",
    methodology: "Composite score: Culture (×3), Cost (×2.5), Transport (×2), Nature (×0.5).",
    why: [
      "Number of universities and grandes écoles",
      "Average rent for a studio",
      "Public transport for students",
      "Nightlife and cultural scene",
      "Alumni network and job opportunities",
    ],
  },
  retraite: {
    label: "Retirees",
    headline: "Best French cities for retirement",
    description:
      "Ranking of French cities for retirement: gentle pace of life, healthcare access, calm, sunshine, and budget.",
    methodology: "Composite score: Quality of life (×3), Safety (×2.5), Nature (×2), Cost (×2), Transport (×0.5).",
    why: [
      "Density of GPs and specialists",
      "Cost of living for retirees",
      "Sunshine and mild climate",
      "Calm and personal safety",
      "Senior activities and social life",
    ],
  },
  budget: {
    label: "Tight budget",
    headline: "Most affordable French cities for a good life",
    description:
      "Ranking of French cities where your money goes furthest: rent, groceries, going out. Maximum quality of life on a controlled budget.",
    methodology: "Composite score: Cost (×4), Quality of life (×2), Safety (×1.5), Transport (×1).",
    why: [
      "Median rent per m²",
      "Local consumer price index",
      "Average price of a restaurant meal",
      "Property prices",
      "Average utility and transport costs",
    ],
  },
  soleil: {
    label: "Sunshine & mild climate",
    headline: "Sunniest French cities",
    description:
      "Ranking of French cities by sunshine, mild climate, and outdoor quality of life. For people running from grey skies.",
    methodology: "Composite score: Nature (×3), Quality of life (×2), Cost (×1.5), Safety (×1).",
    why: [
      "Number of sunny days per year",
      "Average summer and winter temperatures",
      "Access to sea or mountain",
      "Outdoor air quality",
      "Outdoor-sport infrastructure",
    ],
  },
  securite: {
    label: "Safety",
    headline: "Safest French cities",
    description:
      "Ranking of the safest French cities: crime index, perceived safety, school outcomes, social cohesion. Built on SSMSI 2024 data.",
    methodology: "Composite score: Safety (×4), Schools (×2), Quality of life (×2), Nature (×1).",
    why: [
      "Crime rate per 1,000 inhabitants (SSMSI)",
      "Vandalism and incivilities index",
      "School outcomes and drop-out rate",
      "Perceived social cohesion (resident reviews)",
      "Local police and fire-service coverage",
    ],
  },
  culture: {
    label: "Culture & arts",
    headline: "French cities with the richest cultural life",
    description:
      "Ranking of French cities by cultural richness: museums, theatres, concerts, festivals, heritage, arts scene, leisure offer.",
    methodology: "Composite score: Culture (×4), Transport (×2), Quality of life (×1.5), Schools (×1).",
    why: [
      "Number of museums and national monuments",
      "Annual festivals and cultural programming",
      "Music and theatre scene",
      "Universities and grandes écoles",
      "Independent bookshops, galleries, cinemas",
    ],
  },
  mobilite: {
    label: "Car-free living",
    headline: "Best French cities to live without a car",
    description:
      "Ranking of French cities where you can go car-free: public transport, cycle lanes, neighbourhood shops, services within walking distance.",
    methodology: "Composite score: Transport (×4), Quality of life (×2), Culture (×1.5), Cost (×1).",
    why: [
      "Tram / metro / bus network (coverage, frequency)",
      "Kilometres of safe cycle lanes",
      "Walkability of shops and services",
      "TGV or TER station served",
      "Shared bikes and scooters available",
    ],
  },
  investissement: {
    label: "Property investment",
    headline: "Best French cities for property investment",
    description:
      "Ranking of French cities for real-estate investment: rental yield, rental tension, economic dynamism, and quality of life to attract stable tenants.",
    methodology:
      "Composite score: Cost (×3 — affordable buy-in), Quality of life (×2.5), Transport (×2), Culture (×1), Schools (×1).",
    why: [
      "Affordable price per m² (for solid gross yield)",
      "Rental tension (strong tenant demand)",
      "Local economic dynamism and jobs",
      "Quality of life to attract stable tenants",
      "TGV / transport connectivity",
    ],
  },
  sante: {
    label: "Healthcare access",
    headline: "Best French cities for healthcare access",
    description:
      "Ranking of French cities by healthcare quality: density of doctors, hospitals, specialists, waiting times, air quality, and supportive environment.",
    methodology:
      "Composite score: Quality of life (×3), Safety (×2.5), Nature/air (×2), Transport (×1), Cost (×1). Doctor density and air quality (PM2.5) push hardest via the Nature and Life axes.",
    why: [
      "Density of GPs and specialists (DREES 2025)",
      "Presence of a teaching hospital or major centre",
      "Outdoor air quality (ATMO — PM2.5, NO₂)",
      "ER wait times and access to local GPs",
      "Living environment: green space, activity, fresh food",
    ],
  },
  climat: {
    label: "Comfort climate",
    headline: "French cities with the most comfortable climate",
    description:
      "Ranking based on actual sunshine and temperature data: annual sun, mild summers (no heatwave), gentle winters (no hard frost). Most balanced climates come on top.",
    methodology:
      "Custom climate score: sunshine (×3, capped at 3 000 h/yr), summer mildness (×2, ideal ≈ 23 °C in July), winter mildness (×2, ideal ≈ 8 °C in January). Derived from Météo-France + Open-Meteo aggregated seed data.",
    why: [
      "Annual sunshine hours (Météo-France)",
      "July mean temperature (mild, not scorching)",
      "January mean temperature (gentle, not freezing)",
      "Automatic penalty for extremes (>30 °C summer, <0 °C winter)",
      "Climate classification (Mediterranean / oceanic / mountain / tropical)",
    ],
  },
  logement: {
    label: "Housing affordability",
    headline: "French cities where housing remains affordable in 2026",
    description:
      "Ranking based on real rent data (T1/T2/T3) and price per m²: where your housing budget goes furthest without sacrificing quality of life. Sources: DVF data.gouv.fr, Observatoires Locaux des Loyers, INSEE 2026.",
    methodology:
      "Affordability score: T2 rent (×3 — lower is better), buy price per m² (×2), cost-of-life score (×1). Anchored on national medians: T2 rent ≈ €700/mo, buy price ≈ €2 500/m².",
    why: [
      "Median T2 rent (Observatoires Locaux des Loyers 2025)",
      "Buy price per m² (DVF — Demande de Valeurs Foncières 2024-2025)",
      "Effort vs local median income (INSEE)",
      "Rental tension and time-to-rent",
      "5-year price trajectory (market volatility)",
    ],
  },
  "jeunes-actifs": {
    label: "Young professionals",
    headline: "Best French cities for young professionals in 2026",
    description:
      "Ranking of French cities to start or restart a career: density of professionals, TGV mobility, cultural scene, pro community, cost of living compatible with an entry salary.",
    methodology:
      "Composite score: Culture (×2.5), Transport (×2), Remote work (×1.5), Quality of life (×1.5), Cost (×1.5).",
    why: [
      "Share of 25-39 and density of professionals (Insee 2022)",
      "Business creation and labour-market dynamism (DARES 2024)",
      "Fibre coverage > 90% and coworking density (ARCEP)",
      "Cultural scene, nightlife, restaurants, festivals",
      "T2 rent compatible with a first cadre salary (OLL)",
      "Direct TGV link to at least one major metro (SNCF Connect 2026)",
    ],
  },
  gastronomie: {
    label: "Food & dining",
    headline: "Best French cities for food in 2026",
    description:
      "Ranking of French cities to eat well: density of restaurants, Michelin stars and Bib Gourmand 2025, AOC/AOP terroir, and regional culinary tradition.",
    methodology:
      "Composite score (proxy): Culture (×2.5 — culinary scene, restaurant density, markets), Quality of life (×2 — terraces, covered markets), Nature (×1.5 — local terroir, fresh produce), Cost (×1), Safety (×0.5).",
    why: [
      "Restaurant density per capita (Insee SIRENE 2024)",
      "Michelin stars / Bib Gourmand 2025 (correlated with culture/life score)",
      "Number of regional AOC/AOP labels (INAO)",
      "Covered markets and weekly producer markets",
      "Regional culinary tradition (cassoulet, choucroute, bouillabaisse, etc.)",
      "Variety: bistronomy, brasseries, world cuisine",
    ],
  },
  ecologie: {
    label: "Ecology & air quality",
    headline: "Most eco-friendly French cities",
    description:
      "Ranking of French cities by environmental commitment: air quality (PM2.5, NO₂), soft mobility, green space, low-carbon policies, climate resilience.",
    methodology: "Composite score: Nature/air (×4), Soft transport (×2.5), Quality of life (×2), Cost (×0.5).",
    why: [
      "ATMO air-quality index (PM2.5, NO₂, O₃) — 2024",
      "Share of trips by bike / walking / public transport (Cerema 2024)",
      "Green space per capita (ha/1 000 — Ademe)",
      "Adopted and ambitious local climate plan (PCAET)",
      "Zero net land-take and urban revegetation commitment",
    ],
  },
  cyclistes: {
    label: "Cycling & bike-friendly",
    headline: "Best French cities for cyclists in 2026",
    description:
      "Ranking of the most cycle-friendly French cities: kilometres of bike lanes, real perceived safety, network continuity, secure parking, and local cycling policy.",
    methodology:
      "Composite score (proxy): Transport (×3 — bike network, intermodality), Nature (×1.5 — greenways, scenic routes), Safety (×1.5 — bike-vs-car coexistence), Quality of life (×1 — topography, year-round usability).",
    why: [
      "FUB cycling-friendly rating 2025 (A+ to G — fub.fr)",
      "Kilometres of safe cycling infrastructure (Cerema 2024)",
      "Network continuity and intersections (proxy: transport score)",
      "Secure bike parking at stations and homes",
      "Train + bike intermodality (TER, Intercités)",
      "Local bike policy: Plan vélo, LEZ, school-streets, bike-bus",
      "Cyclist accident rate (ONISR)",
    ],
  },
  "bord-de-mer": {
    label: "Seaside living",
    headline: "Best French seaside cities to live in (2026)",
    description:
      "Ranking of French cities by the Atlantic, Mediterranean, Channel or North Sea — places where you can actually live year-round without becoming a tourist on your own street.",
    methodology:
      "Filtered to cities with a coastal character tag; composite of Nature (×3), Quality of life (×2.5), Safety (×1.5), Culture (×1), Cost (×0.5), plus bonuses for sunshine, surf/balnéaire, and small population.",
    why: [
      "Direct access to the coastline (SHOM 2024)",
      "Annual sunshine and bathing days (Météo-France 1991-2020)",
      "Fresh-fish markets and local seafood restaurants",
      "Maritime heritage: ramparts, Vauban forts, lighthouses",
      "Tourist pressure in July-August (Insee secondary residences)",
      "Year-round T2 rent (OLL — excluding seasonal lettings)",
      "Rail / motorway connection",
    ],
  },
};

export async function generateStaticParams() {
  // Cross-product locale × slug. Only EN is generated here (the parent
  // [locale] layout 404s anything other than "en").
  return Object.keys(RANKING_META).map((slug) => ({ locale: "en", slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!(slug in RANKING_META)) return {};
  const en = RANKING_EN[slug] ?? {
    label: slug,
    headline: `Ranking · ${slug}`,
    description: "French city ranking built from official open data — INSEE, Ministry of Interior, observatoires des loyers.",
    methodology: "",
    why: [],
  };
  return {
    title: en.headline,
    description: en.description,
    alternates: { canonical: `${EN_BASE}/rankings/${slug}`, languages: hreflangLanguagesEn(`/rankings/${slug}`) },
    openGraph: { title: en.headline, description: en.description },
    twitter: { card: "summary_large_image" },
  };
}

export default async function EnRankingDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!(slug in RANKING_META)) notFound();

  const meta = RANKING_META[slug as RankingSlug];
  const en = RANKING_EN[slug] ?? {
    label: meta.label,
    headline: meta.headline,
    description: meta.description,
    methodology: meta.methodology,
    why: meta.why ? [...meta.why] : [],
  };
  const ranked = getRankedCities(slug as RankingSlug);
  const top30 = ranked.slice(0, 30);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: en.headline,
        url: `${EN_BASE}/rankings/${slug}`,
        numberOfItems: ranked.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: top30.slice(0, 25).map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: r.city.name,
          url: `${EN_BASE}/cities/${r.city.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
          { "@type": "ListItem", position: 2, name: "Rankings", item: `${EN_BASE}/rankings` },
          { "@type": "ListItem", position: 3, name: en.label, item: `${EN_BASE}/rankings/${slug}` },
        ],
      },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemListJsonLd)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-16 pb-8">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/rankings" className="hover:text-[var(--accent)]">Rankings</Link>
          {" · "}
          <span>{en.label}</span>
        </nav>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl" aria-hidden>{meta.emoji}</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
            {en.headline}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg max-w-3xl">
          {en.description}
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
          Top {top30.length} · {en.label}
        </h2>
        <ol className="space-y-2">
          {top30.map((r) => (
            <li key={r.city.slug}>
              <Link
                href={`/cities/${r.city.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
              >
                <span className="font-mono-data text-xl font-bold w-10 text-[var(--text-tertiary)]">
                  #{r.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--text-primary)] truncate">{r.city.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {r.city.region ?? ""}{r.city.department ? ` · ${r.city.department}` : ""}
                  </p>
                </div>
                <span
                  className={`font-mono-data font-bold text-2xl ${scoreColor(r.score)}`}
                  aria-label={`Score ${r.score} out of 10`}
                >
                  {r.score.toFixed(1)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <h2 className="text-lg font-bold mb-3 text-[var(--text-primary)]">Methodology</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{en.methodology}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <h2 className="text-lg font-bold mb-3 text-[var(--text-primary)]">What we look at</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            {en.why.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden className="text-[var(--accent)]">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
