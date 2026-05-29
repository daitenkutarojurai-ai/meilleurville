import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { rankByOwnerScore } from "@/lib/owner-rankings";
import { ownerScoreColor, type OwnerScoreKey } from "@/lib/owner-scores";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

interface EnNicheRanking {
  enSlug: string;
  scoreKey: OwnerScoreKey;
  emoji: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  methodology: string;
}

const EN_NICHE_RANKINGS: EnNicheRanking[] = [
  {
    enSlug: "air-quality",
    scoreKey: "score_qualite_air",
    emoji: "🍃",
    label: "Best air quality",
    metaTitle: "French cities with the best air quality 2026 — top 50",
    metaDescription:
      "Ranking of French cities by annual average PM2.5 per department (ATMO France 2023). Atlantic and coastal cities dominate; Grenoble and the Arve valley are at the bottom due to winter inversions.",
    intro:
      "Air quality varies enormously across France. Atlantic and coastal cities benefit from clean westerly airflow; valley cities — particularly Grenoble and the Arve valley — suffer from winter thermal inversions that trap particulates. Score inversely correlated with PM2.5 (lower PM2.5 = higher score).",
    methodology:
      "Score = 9.5 − (PM2.5 µg/m³ − 5) × 0.5. WHO 2021 threshold: >5 µg/m³ already harmful. Source: ATMO France 2023 departmental averages. Future: commune-level data.",
  },
  {
    enSlug: "quietest",
    scoreKey: "score_bruit",
    emoji: "🤫",
    label: "Quietest cities",
    metaTitle: "Quietest cities in France 2026 — noise ranking top 50",
    metaDescription:
      "Ranking of French cities by acoustic environment: population size, urban density, and Île-de-France penalty (Lden ≥60 dB documented). The smallest and least dense cities top the list.",
    intro:
      "Noise pollution is one of the most underrated factors in quality of life. This score combines city population, urban density, and a penalty for Île-de-France cities (where Bruitparif data confirms Lden ≥60 dB). Smaller provincial cities tend to win.",
    methodology:
      "Score = 8.5 − population penalty (0.5–2 pts by size band) − IDF penalty (1 pt). To be replaced by Bruitparif (IDF) + Cerema Strategic Noise Maps when available.",
  },
  {
    enSlug: "safest-for-women",
    scoreKey: "score_securite_femme_seule",
    emoji: "👤",
    label: "Safest for women living solo",
    metaTitle: "Safest French cities for women living solo 2026 — top 50",
    metaDescription:
      "Ranking of French cities combining safety index (SSMSI assault data) and evening transport density — the two factors that most affect feeling secure coming home late.",
    intro:
      "Getting home safely at night matters. This score combines the general safety index (SSMSI person-assault data) with evening transport density as a proxy for late-night journey security. Cities at the top combine both. To be replaced by SSMSI VFFS-specific data when the open API is available.",
    methodology:
      "Score = safety − (10 − safety) × 0.15 + transport bonus if public transport density is high. Source: SSMSI person-assault rate per 1,000 residents.",
  },
  {
    enSlug: "night-safety",
    scoreKey: "score_securite_nocturne",
    emoji: "🌙",
    label: "Night safety",
    metaTitle: "Safest French cities at night 2026 — top 50",
    metaDescription:
      "Ranking of French cities for night-time safety, derived from SSMSI person-assault data adjusted for after-dark incidents linked to nightlife and alcohol.",
    intro:
      "Night safety diverges from daytime safety in cities with active nightlife. This score amplifies the gap slightly versus general safety, penalising cities where evening incidents are higher relative to daytime. Small and medium cities with limited nightlife generally score best.",
    methodology:
      "Score = safety − (10 − safety) × 0.15. Source: SSMSI person-assault rate per 1,000 residents. Future: specific SSMSI night sub-category.",
  },
  {
    enSlug: "car-free",
    scoreKey: "score_sans_voiture",
    emoji: "🚲",
    label: "Car-free living",
    metaTitle: "Best French cities for car-free living 2026 — top 50",
    metaDescription:
      "Ranking of French cities where public transport and cycling infrastructure make car ownership optional. Score derived from GTFS multimodal data + OpenStreetMap walkability.",
    intro:
      "Ditching the car is possible in more French cities than you might think. This score uses public transport quality as the primary indicator, with a penalty for cities under 80,000 residents where the TER regional rail offer is limited. Metro, tram, and dense bus networks win.",
    methodology:
      "Score = site transport score, adjusted with penalty for pop <80k and transport <6.5. Future: INSEE Mobilité (% households without a car).",
  },
  {
    enSlug: "remote-work",
    scoreKey: "score_teletravail",
    emoji: "💻",
    label: "Remote work (fibre-adjusted)",
    metaTitle: "Best French cities for remote workers 2026 — fibre-adjusted top 50",
    metaDescription:
      "Remote work ranking for France combining FTTH fibre coverage by department (ARCEP Q4 2024) with quality-of-life score. Shows well-fibre rural areas that the standard ranking misses.",
    intro:
      "This ranking complements the main remote-work ranking by adding a fibre factor per department. The difference shows up in well-connected rural cities (vs congested metros). High FTTH coverage + quality of life is the winning combination for distributed teams.",
    methodology:
      "Score = remoteWork + FTTH dept adjustment (95% → +1, 80% → 0, 65% → −1). Source: ARCEP Q4 2024 estimated + site remoteWork seed score.",
  },
  {
    enSlug: "heatwave-resistant",
    scoreKey: "score_canicule",
    emoji: "🥵",
    label: "Heatwave resistance",
    metaTitle: "French cities most resistant to heatwaves 2026 — top 50",
    metaDescription:
      "Ranking of French cities where summer heat remains liveable. Score derived from Météo-France 1991–2020 July averages, with ARPEGE 2040 projection. Coastal and Atlantic cities lead.",
    intro:
      "As summers get hotter, heatwave resistance matters more. Cities at the top of this list have July averages where you can still go out between 2pm and 6pm without air conditioning. Coastal Brittany, Normandy, and Atlantic cities dominate; Mediterranean cities are at the bottom.",
    methodology:
      "Score = 9 − (mean July temp − 22) × 0.9, clamped 0–10. Source: Météo-France climatological normals 1991–2020. Future: ARPEGE 2040 projection (days >30°C).",
  },
  {
    enSlug: "social-capital",
    scoreKey: "score_solitude",
    emoji: "🤝",
    label: "Social capital",
    metaTitle: "French cities with best social fabric 2026 — loneliness ranking",
    metaDescription:
      "Ranking of French cities where loneliness risk is lowest: derived from % single-person households by department (INSEE census 2020). Smaller, more community-oriented cities lead.",
    intro:
      "Loneliness is a hidden cost of city life. This score inverts the % of single-person households by department — where that share is low, the social fabric tends to be denser. Small and medium cities, and university towns with active student life, tend to score best. Paris and dense inner-city areas are at the bottom.",
    methodology:
      "Score = 8.5 − (% single-person households dept − 30) × 0.25, + 0.8 bonus for <30,000 residents. Source: INSEE census 2020.",
  },
  {
    enSlug: "young-professionals",
    scoreKey: "score_jeune_actif",
    emoji: "🚀",
    label: "Young professionals",
    metaTitle: "Best French cities for young professionals 2026 — niche top 50",
    metaDescription:
      "Niche ranking for young professionals: combines job market, culture, nightlife, affordable rents, and a network for making real connections.",
    intro:
      "This score weights the axes that actually matter when you're 25–35 and starting your career: job density, cultural energy, affordable rents, and a city dynamic enough to build a social network. It amplifies the 'jeune actif' niche score from the city profiles.",
    methodology:
      "Score = jeuneActif niche score from lib/niche-scores.ts. Inputs: culture × 2, transport × 1.5, remoteWork × 1, cost × 1, life × 0.5.",
  },
  {
    enSlug: "families",
    scoreKey: "score_famille",
    emoji: "👨‍👩‍👧",
    label: "Families (niche score)",
    metaTitle: "Best French cities for families 2026 — niche score top 50",
    metaDescription:
      "Family niche ranking: schools, safety, nature access, housing affordability. A complementary view to the main families ranking — uses the owner-score formula.",
    intro:
      "This niche score weights the axes most important for family life: schools, safety, nature access, and cost of housing. It produces slightly different results from the main families ranking because it uses the owner-score formula rather than the standard RANKING_META weights.",
    methodology:
      "Score = famille niche score from lib/niche-scores.ts. Inputs: schools × 3, safety × 2.5, nature × 2, cost × 1.5, transport × 1.",
  },
];

const EN_NICHE_BY_SLUG = new Map(EN_NICHE_RANKINGS.map((r) => [r.enSlug, r]));

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return EN_NICHE_RANKINGS.map((r) => ({ locale: "en", slug: r.enSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = EN_NICHE_BY_SLUG.get(slug);
  if (!r) return {};
  return {
    title: r.metaTitle,
    description: r.metaDescription,
    alternates: { canonical: `${EN_BASE}/niche-rankings/${r.enSlug}` },
    openGraph: { title: r.metaTitle, description: r.metaDescription },
  };
}

export default async function EnNicheRankingPage({ params }: Props) {
  const { slug } = await params;
  const ranking = EN_NICHE_BY_SLUG.get(slug);
  if (!ranking) notFound();

  const top = rankByOwnerScore(ranking.scoreKey, 50);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://bestcitiesinfrance.com";
  const others = EN_NICHE_RANKINGS.filter((r) => r.enSlug !== ranking.enSlug);

  return (
    <main id="main-content" className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: ranking.metaTitle,
            description: ranking.metaDescription,
            itemListElement: top.slice(0, 10).map((row, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: row.city.name,
              url: `${BASE_URL}/cities/${row.city.slug}`,
            })),
          }),
        }}
      />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/niche-rankings" className="hover:underline">
              ← Niche rankings
            </Link>
          </Badge>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl" aria-hidden>{ranking.emoji}</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              {ranking.label}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">{ranking.intro}</p>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
            <span className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wider mr-2">
              Estimate
            </span>
            Score computed from {CITIES_COUNT} cities — see{" "}
            <Link href="/methodology" className="underline">
              methodology
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Top 50 — {ranking.label}
          </h2>
          <ol className="space-y-1.5">
            {top.map((row, i) => (
              <li key={row.city.slug}>
                <Link
                  href={`/cities/${row.city.slug}`}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 hover:border-[var(--accent)]/40 hover:shadow-sm transition-all"
                >
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                      #{i + 1}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)] truncate">
                      {row.city.name}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] truncate">
                      {row.city.region}
                    </span>
                  </span>
                  <span className={`font-mono-data font-bold ${ownerScoreColor(row.score)} flex-shrink-0`}>
                    {row.score.toFixed(1)}
                    <span className="text-xs text-[var(--text-tertiary)]"> /10</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Methodology</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{ranking.methodology}</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            When live data feeds replace the proxy estimates, this ranking recalculates automatically.
          </p>
        </Card>

        <section>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">Other niche rankings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {others.map((r) => (
              <Link
                key={r.enSlug}
                href={`/niche-rankings/${r.enSlug}`}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/40 transition-colors"
              >
                <span className="text-xl" aria-hidden>{r.emoji}</span>
                <span className="text-[var(--text-primary)]">{r.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          See also:{" "}
          <Link href="/rankings" className="underline">main city rankings</Link>
          {" "}·{" "}
          <Link href="/for-who" className="underline">rankings by profile</Link>
          {" "}·{" "}
          <Link href="/city-match" className="underline">personalised quiz</Link>.
        </p>
      </div>

      <Footer />
    </main>
  );
}
