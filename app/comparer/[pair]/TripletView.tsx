import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CityCard } from "@/components/CityCard";
import { CommentSection } from "@/components/CommentSection";
import { getHousing } from "@/data/housing";
import { CITIES_SEED } from "@/data/cities-seed";
import { scoreColor, scoreHex } from "@/lib/utils";
import type { City } from "@/lib/types";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, SITE_URL } from "@/lib/jsonld";

type Seed = (typeof CITIES_SEED)[number];
type ScoreKey = keyof Seed["scores"];

const SCORE_ROWS: Array<{ key: ScoreKey; label: string }> = [
  { key: "global", label: "Score global" },
  { key: "life", label: "Qualité de vie" },
  { key: "transport", label: "Transport" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Coût de vie" },
  { key: "safety", label: "Sécurité" },
  { key: "culture", label: "Culture" },
  { key: "remoteWork", label: "Télétravail" },
  { key: "schools", label: "Écoles" },
];

const PROFILES: Array<{ label: string; emoji: string; keys: ScoreKey[]; desc: string }> = [
  { label: "Famille", emoji: "👨‍👩‍👧", keys: ["safety", "schools", "nature", "cost"], desc: "sécurité, écoles, espaces verts, budget" },
  { label: "Télétravail", emoji: "💻", keys: ["remoteWork", "transport", "cost", "life"], desc: "fibre, coworking, coût, qualité de vie" },
  { label: "Retraite", emoji: "☀️", keys: ["nature", "safety", "cost", "life"], desc: "nature, sécurité, budget, bien-être" },
  { label: "Étudiant·e", emoji: "🎓", keys: ["culture", "transport", "cost", "schools"], desc: "culture, transports, budget, campus" },
];

function seedToCity(s: Seed): City {
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

interface Props {
  cities: Seed[];
  slug: string;
}

export function TripletView({ cities: input, slug }: Props) {
  // Caller in app/comparer/[pair]/page.tsx already narrows to length === 3.
  const cities: [Seed, Seed, Seed] = [input[0], input[1], input[2]];
  const [a, b, c] = cities;
  const cards = cities.map(seedToCity);

  // Per-row winner (index 0/1/2 of the city that scores highest on this axis).
  const winnerIdxByRow = SCORE_ROWS.map(({ key }) => {
    const vals = cities.map((city) => city.scores[key]);
    const max = Math.max(...vals);
    // Tie → no single winner highlighted.
    const winners = vals.filter((v) => v === max).length;
    return winners === 1 ? vals.indexOf(max) : -1;
  });

  const winsByCity = [0, 1, 2].map(
    (i) => winnerIdxByRow.filter((w) => w === i).length
  );
  const topWins = Math.max(...winsByCity);
  const overallWinnerIdx = winsByCity.filter((w) => w === topWins).length === 1
    ? winsByCity.indexOf(topWins)
    : -1;
  const overallWinner = overallWinnerIdx >= 0 ? cities[overallWinnerIdx] : null;

  // Pair links between the 3 cities — gives bottom-of-page a way to drill
  // into the 2-by-2 detail comparisons people often want after a triplet.
  const pairs: Array<[Seed, Seed]> = [
    [a, b],
    [a, c],
    [b, c],
  ];

  const breadcrumb = breadcrumbJsonLd([
    { name: "MeilleurVille", path: "" },
    { name: "Comparer", path: "/comparer" },
    { name: `${a.name} vs ${b.name} vs ${c.name}`, path: `/comparer/${slug}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${a.name} vs ${b.name} vs ${c.name} — Comparaison`,
    itemListElement: cards.map((city, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: city.name,
      url: `${SITE_URL}/villes/${city.slug}`,
    })),
  };

  const faq = faqJsonLd([
    {
      q: `Quelle est la meilleure ville entre ${a.name}, ${b.name} et ${c.name} ?`,
      a: overallWinner
        ? `${overallWinner.name} arrive en tête sur ${topWins} critères sur ${SCORE_ROWS.length}, avec un score global de ${overallWinner.scores.global.toFixed(1)}/10. Le choix final dépend ensuite de votre priorité (budget, sécurité, télétravail, nature).`
        : `Les trois villes sont au coude-à-coude : ${a.name} ${a.scores.global}/10, ${b.name} ${b.scores.global}/10, ${c.name} ${c.scores.global}/10. Aucune ne domine clairement, le choix dépendra de vos critères prioritaires.`,
    },
    {
      q: `Laquelle des trois est la moins chère pour se loger ?`,
      a: (() => {
        const ranked = [...cities].sort((x, y) => y.scores.cost - x.scores.cost);
        return `Sur le critère coût de vie : ${ranked[0].name} (${ranked[0].scores.cost}/10) > ${ranked[1].name} (${ranked[1].scores.cost}/10) > ${ranked[2].name} (${ranked[2].scores.cost}/10). Un score plus haut signifie un coût plus abordable.`;
      })(),
    },
    {
      q: `Où télétravailler entre ${a.name}, ${b.name} et ${c.name} ?`,
      a: (() => {
        const ranked = [...cities].sort((x, y) => y.scores.remoteWork - x.scores.remoteWork);
        return `${ranked[0].name} sort en tête sur le télétravail (${ranked[0].scores.remoteWork}/10) — fibre, coworkings, qualité de vie. ${ranked[1].name} (${ranked[1].scores.remoteWork}/10) et ${ranked[2].name} (${ranked[2].scores.remoteWork}/10) suivent.`;
      })(),
    },
    {
      q: `Laquelle est la plus sûre ?`,
      a: (() => {
        const ranked = [...cities].sort((x, y) => y.scores.safety - x.scores.safety);
        return `Classement sécurité : ${ranked[0].name} ${ranked[0].scores.safety}/10, ${ranked[1].name} ${ranked[1].scores.safety}/10, ${ranked[2].name} ${ranked[2].scores.safety}/10. Données SSMSI 2024 + observations locales.`;
      })(),
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemList)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />

      {/* Header */}
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Comparaison à 3 villes — 2026</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            {a.name}{" "}
            <span className="text-[var(--text-secondary)]">vs</span>{" "}
            {b.name}{" "}
            <span className="text-[var(--text-secondary)]">vs</span>{" "}
            {c.name}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {a.scores.global}/10 &nbsp;·&nbsp; {b.scores.global}/10 &nbsp;·&nbsp; {c.scores.global}/10
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((city) => (
            <CityCard key={city.slug} city={city} />
          ))}
        </div>

        {/* Overall verdict */}
        {overallWinner && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-1">Recommandé par MeilleurVille</p>
            <p className="text-xl font-bold text-emerald-600">
              {overallWinner.name} l&apos;emporte sur {topWins} critères sur {SCORE_ROWS.length}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Décompte basé sur 9 axes pondérés équitablement
            </p>
          </div>
        )}

        {/* Head-to-head table */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-6">
            Comparaison critère par critère
          </h2>
          <div className="space-y-6">
            {SCORE_ROWS.map(({ key, label }, rowIdx) => {
              const winnerIdx = winnerIdxByRow[rowIdx];
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
                    <span className="font-medium text-[var(--text-primary)]">{label}</span>
                    {winnerIdx >= 0 && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600">
                        {cities[winnerIdx].name} en tête
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {cities.map((city, i) => {
                      const v = city.scores[key];
                      const isWinner = winnerIdx === i;
                      return (
                        <div key={city.slug}>
                          <div className="flex items-baseline justify-between mb-1">
                            <span className={`text-xs ${isWinner ? "font-semibold text-emerald-600" : "text-[var(--text-secondary)]"}`}>
                              {city.name}
                            </span>
                            <span className={`text-sm font-bold font-mono-data ${isWinner ? scoreColor(v) : "text-[var(--text-secondary)]"}`}>
                              {v.toFixed(1)}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(v / 10) * 100}%`,
                                background: isWinner ? scoreHex(v) : `${scoreHex(v)}55`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Climate */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Climat</h2>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <div />
            {cities.map((city) => (
              <div key={city.slug} className="font-semibold text-[var(--text-primary)]">
                {city.name}
              </div>
            ))}
            {[
              { label: "Soleil / an", get: (s: Seed) => (s.sunshinedays ? `${Math.round(s.sunshinedays / 9.5)} j` : "—") },
              { label: "Juillet", get: (s: Seed) => (s.avgTempJuly ? `${s.avgTempJuly}°C` : "—") },
              { label: "Janvier", get: (s: Seed) => (s.avgTempJanuary ? `${s.avgTempJanuary}°C` : "—") },
            ].map((row) => (
              <div key={row.label} className="contents">
                <div className="text-xs text-[var(--text-secondary)] text-left">{row.label}</div>
                {cities.map((city) => (
                  <div key={city.slug} className="font-mono-data font-bold text-[var(--text-primary)]">
                    {row.get(city)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>

        {/* Housing prices */}
        {cities.some((city) => getHousing(city.slug)) && (
          <Card>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
              Immobilier &amp; Loyers
            </h2>
            <div className="grid grid-cols-4 gap-3 text-center text-sm">
              <div />
              {cities.map((city) => (
                <div key={city.slug} className="font-semibold text-[var(--text-primary)]">
                  {city.name}
                </div>
              ))}
              {(
                [
                  { label: "Loyer T1 / mois", field: "avgRentT1", unit: "€" },
                  { label: "Loyer T2 / mois", field: "avgRentT2", unit: "€" },
                  { label: "Loyer T3 / mois", field: "avgRentT3", unit: "€" },
                  { label: "Prix achat / m²", field: "avgBuyPriceM2", unit: "€/m²" },
                ] as const
              ).map((row) => {
                const values = cities.map((city) => {
                  const h = getHousing(city.slug);
                  return h ? (h[row.field] as number | undefined) : undefined;
                });
                const defined = values.filter((v): v is number => typeof v === "number");
                const cheapest = defined.length === cities.length ? Math.min(...defined) : null;
                return (
                  <div key={row.label} className="contents">
                    <div className="text-xs text-[var(--text-secondary)] text-left">{row.label}</div>
                    {values.map((v, i) => (
                      <div
                        key={cities[i].slug}
                        className={`font-mono-data font-bold ${cheapest !== null && v === cheapest ? "text-emerald-600" : "text-[var(--text-primary)]"}`}
                      >
                        {v ? `${v.toLocaleString("fr-FR")} ${row.unit}` : "—"}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-4">
              Prix médians indicatifs (DVF + observatoires locaux 2024). Le vert signale la ville la moins chère
              de la ligne, uniquement quand les trois données sont disponibles.
            </p>
          </Card>
        )}

        {/* Profile-based picks */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">
            La meilleure des trois selon votre profil
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {PROFILES.map(({ label, emoji, keys, desc }) => {
              const scores = cities.map((city) =>
                keys.reduce((sum, k) => sum + city.scores[k], 0) / keys.length
              );
              const top = Math.max(...scores);
              const winners = scores.filter((s) => s === top).length;
              const idx = winners === 1 ? scores.indexOf(top) : -1;
              const winner = idx >= 0 ? cities[idx] : null;
              const margin = winner
                ? top - Math.max(...scores.filter((_, i) => i !== idx))
                : 0;
              return (
                <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">{desc}</p>
                  {winner ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-emerald-600">{winner.name}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">+{margin.toFixed(1)} pts</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--text-tertiary)]">Égalité</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* 2-by-2 pair detail links */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Aller plus loin : comparaisons 2 à 2
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {pairs.map(([x, y]) => (
              <Link
                key={`${x.slug}-vs-${y.slug}`}
                href={`/comparer/${x.slug}-vs-${y.slug}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                {x.name} <span className="text-[var(--text-tertiary)]">vs</span> {y.name}
                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mt-1">
                  Fiche détaillée à 2
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-3">
          <p className="text-[var(--text-secondary)]">
            Trois finalistes mais toujours indécis ? Le quiz affine en 3 min.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/quiz">
              <Badge variant="accent" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity">
                ✨ Quiz de matching IA
              </Badge>
            </Link>
            <Link href="/comparer">
              <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer hover:opacity-90 transition-opacity">
                Comparateur libre
              </Badge>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <CommentSection
          topic={`compare3:${[a.slug, b.slug, c.slug].sort().join("-")}`}
          title={`${a.name} vs ${b.name} vs ${c.name} — votre verdict`}
          emptyHint="Vous avez vécu dans l'une ou plusieurs de ces villes ? Partagez votre comparatif honnête."
        />
      </div>
    </main>
  );
}
