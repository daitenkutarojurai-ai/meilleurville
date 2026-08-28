import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ownerRankingHead, rankByOwnerScore } from "@/lib/owner-rankings";
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
    metaTitle: "French cities with the best air quality 2026",
    metaDescription:
      "French cities ranked on annual average PM2.5 per department (ATMO France 2023), across the 157 cities the source covers. Atlantic and coastal cities lead.",
    intro:
      "Air quality varies enormously across France. Atlantic and coastal cities benefit from clean westerly airflow; valley cities — particularly Grenoble and the Arve valley — suffer from winter thermal inversions that trap particulates. Score inversely correlated with PM2.5 (lower PM2.5 = higher score). The figure is departmental, not municipal: two cities in the same department carry the same number.",
    methodology:
      "Score = 9.5 − (PM2.5 µg/m³ − 5) × 0.5. WHO 2021 threshold: >5 µg/m³ already harmful. Source: ATMO France 2023 departmental averages, covering 19 departments — 157 cities are ranked, the other 383 carry a national fallback identical for all of them and are left out rather than sorted on a constant. Future: commune-level data.",
  },
  {
    enSlug: "quietest",
    scoreKey: "score_bruit",
    emoji: "🤫",
    label: "Quietest cities",
    metaTitle: "Quietest cities in France 2026 — noise ranking",
    metaDescription:
      "French cities by acoustic environment: city size and an Île-de-France penalty (Lden ≥60 dB documented). The smallest, least dense cities top the list.",
    intro:
      "Noise pollution is one of the most underrated factors in quality of life. This score combines city population and a penalty for Île-de-France cities (where Bruitparif data confirms Lden ≥60 dB). Smaller provincial cities tend to win. What it is not: no acoustic measurement goes into it — city size is the only input.",
    methodology:
      "Score = 9.6 − population penalty (0.8 pt above 60,000 residents, 1.7 above 150,000, 2.8 above 300,000; +0.2 below 20,000) − 1.2 pt in Île-de-France. With city size as its only input it produces just 9 distinct values across 540 cities: the top band alone holds 170 tied cities, and this ranking separates none of them. To be replaced by Bruitparif (IDF) + Cerema Strategic Noise Maps when available.",
  },
  {
    enSlug: "safest-for-women",
    scoreKey: "score_securite_femme_seule",
    emoji: "👤",
    label: "Safest for women living solo",
    metaTitle: "Safest French cities for women living solo 2026",
    metaDescription:
      "French cities ranked on the safety index (SSMSI assault data) weighted with evening transport density — the two factors behind feeling secure coming home late.",
    intro:
      "Getting home safely at night matters. This score combines the general safety index (SSMSI person-assault data) with evening transport density as a proxy for late-night journey security. Cities at the top combine both. To be replaced by SSMSI VFFS-specific data when the open API is available.",
    methodology:
      "Score = safety × 0.7 + transport × 0.3 − 0.5. Source: SSMSI person-assault rate per 1,000 residents, plus the site transport axis as a proxy for late-evening journeys.",
  },
  {
    enSlug: "night-safety",
    scoreKey: "score_securite_nocturne",
    emoji: "🌙",
    label: "Night safety",
    metaTitle: "Safest French cities at night 2026",
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
    metaTitle: "Best French cities for car-free living 2026",
    metaDescription:
      "French cities where transport and cycling make owning a car optional, ranked on the site transport axis with a penalty for small cities.",
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
    metaTitle: "Best French cities for remote workers 2026 — fibre-adjusted",
    metaDescription:
      "French cities for remote work, combining FTTH fibre coverage by department (ARCEP Q4 2024) with the remote-work score. Well-fibred rural towns surface.",
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
    metaTitle: "French cities most resistant to heatwaves 2026",
    metaDescription:
      "French cities where summer heat remains liveable, ranked on July averages for 1991–2020. Coastal, Atlantic and northern cities lead; the Mediterranean trails.",
    intro:
      "As summers get hotter, heatwave resistance matters more. Cities at the top of this list have July averages where you can still go out between 2pm and 6pm without air conditioning. Coastal Brittany, Normandy, and Atlantic cities dominate; Mediterranean cities are at the bottom.",
    methodology:
      "Score = 9.7 − (mean July temp − 18) × 0.7, clamped 0–10. Source: July averages for 1991–2020. The Météo-France ARPEGE 2040 projection is not wired in yet: this score describes today's heat, not 2040's.",
  },
  {
    enSlug: "social-capital",
    scoreKey: "score_solitude",
    emoji: "🤝",
    label: "Social capital",
    metaTitle: "French cities with the best social fabric 2026",
    metaDescription:
      "French cities where loneliness risk is lowest, from the share of single-person households by department (INSEE census 2020). Smaller towns lead.",
    intro:
      "Loneliness is a hidden cost of city life. This score inverts the % of single-person households by department — where that share is low, the social fabric tends to be denser. Small and medium cities, and university towns with active student life, tend to score best. Paris and dense inner-city areas are at the bottom.",
    methodology:
      "Score = 8.5 − (% single-person households in the department − 30) × 0.25, + 0.8 bonus below 30,000 residents. Source: INSEE census 2020, covering 25 departments — 226 cities are ranked, the other 314 carry a national fallback identical for all of them and are left out rather than sorted at a tie.",
  },
  {
    enSlug: "young-professionals",
    scoreKey: "score_jeune_actif",
    emoji: "🚀",
    label: "Young professionals",
    metaTitle: "Best French cities for young professionals 2026",
    metaDescription:
      "Niche ranking for young professionals: cultural offer, remote-work readiness and cost of living, with a bonus for cities big enough to build a network in.",
    intro:
      "This score weights the axes that actually matter when you're 25–35 and starting your career: cultural energy, remote-work readiness, affordable living, and a city dynamic enough to build a social network. Note what it does not contain: no job-market or hiring data feeds into it.",
    methodology:
      "Score = mean of the culture, remoteWork and cost axes, + 0.8 above 100,000 residents. Future: INSEE census (% aged 25–35) + SIRENE business-opening flows.",
  },
  {
    enSlug: "families",
    scoreKey: "score_famille",
    emoji: "👨‍👩‍👧",
    label: "Families (niche score)",
    metaTitle: "Best French cities for families 2026 — niche score",
    metaDescription:
      "Family niche ranking: schools, safety and nature access, with a penalty for the most expensive cities. A complementary view to the main families ranking.",
    intro:
      "This niche score weights the axes most important for family life: schools, safety and nature access, with a penalty for cities where the cost of living is at its worst. It produces slightly different results from the main families ranking because it uses the owner-score formula rather than the standard weights.",
    methodology:
      "Score = mean of the schools, safety and nature axes, − 0.5 when the cost axis falls below 4/10. Future: DEPP school data + CAF childcare places per 1,000 children.",
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
    openGraph: { title: r.metaTitle, description: r.metaDescription, images: ["/opengraph-image"] },
  };
}

export default async function EnNicheRankingPage({ params }: Props) {
  const { slug } = await params;
  const ranking = EN_NICHE_BY_SLUG.get(slug);
  if (!ranking) notFound();

  const result = rankByOwnerScore(ranking.scoreKey, 50);
  const head = ownerRankingHead(result, 10);
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
            itemListOrder: head.ordered
              ? "https://schema.org/ItemListOrderDescending"
              : "https://schema.org/ItemListUnordered",
            numberOfItems: result.published,
            itemListElement: head.cities.map((city, i) => ({
              "@type": "ListItem",
              ...(head.ordered ? { position: i + 1 } : {}),
              name: city.name,
              url: `${BASE_URL}/cities/${city.slug}`,
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
            Score derived from the site data,{" "}
            {result.pool === CITIES_COUNT
              ? `computed across all ${CITIES_COUNT} cities`
              : `ranked across ${result.pool} of the ${CITIES_COUNT} cities`}{" "}
            — see{" "}
            <Link href="/methodology" className="underline">
              methodology
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {result.firstTierOverflows
              ? `Top score — ${ranking.label}`
              : `Top ${result.published} cities — ${ranking.label}`}
          </h2>

          {result.firstTierOverflows ? (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              <strong>This score does not separate cities.</strong>{" "}
              {result.tiers[0]?.cities.length} cities share the top mark (
              {result.tiers[0]?.score.toFixed(1)}/10), so they are listed alphabetically, without
              ranks. Numbering them would mean publishing the order of our data file as if it
              measured something.
            </p>
          ) : (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Cities on the same score share the same rank — which is most of them, the score
              carrying a single decimal.
            </p>
          )}

          {result.excluded > 0 && (
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mb-4">
              {result.excluded} of the {CITIES_COUNT} cities on the site are not ranked: with no
              value published for their department, they carry a national fallback that is
              identical for all of them. Sorting those would be sorting a constant. Their score
              still shows on their own page, with its provenance.
            </p>
          )}

          <ol className="space-y-1.5">
            {result.tiers.map((tier) =>
              tier.cities.length === 1 ? (
                <li key={tier.score}>
                  <Link
                    href={`/cities/${tier.cities[0].slug}`}
                    className="flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 hover:border-[var(--accent)]/40 hover:shadow-sm transition-all"
                  >
                    <span className="flex items-baseline gap-3 min-w-0">
                      <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                        #{tier.rank}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)] truncate">
                        {tier.cities[0].name}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)] truncate">
                        {tier.cities[0].region}
                      </span>
                    </span>
                    <span className={`font-mono-data font-bold ${ownerScoreColor(tier.score)} flex-shrink-0`}>
                      {tier.score.toFixed(1)}
                      <span className="text-xs text-[var(--text-tertiary)]"> /10</span>
                    </span>
                  </Link>
                </li>
              ) : (
                <li
                  key={tier.score}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
                >
                  <p className="flex items-baseline justify-between gap-3 mb-2">
                    <span className="flex items-baseline gap-3 min-w-0">
                      <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                        #{tier.rank}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {tier.cities.length} cities tied
                      </span>
                    </span>
                    <span className={`font-mono-data font-bold ${ownerScoreColor(tier.score)} flex-shrink-0`}>
                      {tier.score.toFixed(1)}
                      <span className="text-xs text-[var(--text-tertiary)]"> /10</span>
                    </span>
                  </p>
                  <p className="pl-11 text-sm leading-relaxed">
                    {tier.cities.map((city, i) => (
                      <span key={city.slug}>
                        {i > 0 && <span className="text-[var(--text-tertiary)]"> · </span>}
                        <Link
                          href={`/cities/${city.slug}`}
                          className="text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline"
                        >
                          {city.name}
                        </Link>
                      </span>
                    ))}
                  </p>
                </li>
              )
            )}
          </ol>

          {result.nextTier && (
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mt-4">
              The ranking stops here: the next {result.nextTier.count} cities all sit at{" "}
              {result.nextTier.score.toFixed(1)}/10, and nothing in our data separates them.
              Publishing part of that group would mean picking at random.
            </p>
          )}
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
