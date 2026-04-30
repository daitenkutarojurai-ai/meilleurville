import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { CityCard } from "@/components/CityCard";
import { Badge } from "@/components/ui/Badge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { Card } from "@/components/ui/Card";
import type { City } from "@/lib/types";
import Link from "next/link";
import { getHousing } from "@/data/housing";
import React from "react";

type Props = { params: Promise<{ pair: string }> };

// Pregenerate SEO comparison pages for top city pairs
const SEO_PAIRS = [
  ["annecy", "grenoble"],
  ["nantes", "rennes"],
  ["bordeaux", "toulouse"],
  ["lyon", "grenoble"],
  ["montpellier", "marseille"],
  ["nantes", "bordeaux"],
  ["rennes", "nantes"],
  ["nice", "aix-en-provence"],
  ["strasbourg", "lyon"],
  ["toulouse", "montpellier"],
  ["angers", "nantes"],
  ["lille", "strasbourg"],
  ["bordeaux", "nantes"],
  ["lyon", "bordeaux"],
  ["la-rochelle", "bordeaux"],
  ["pau", "biarritz"],
  ["caen", "rennes"],
  ["dijon", "strasbourg"],
  ["tours", "orleans"],
  ["annecy", "biarritz"],
  ["quimper", "brest"],
  ["valence", "grenoble"],
  ["lyon", "nice"],
  ["toulon", "nice"],
  ["rouen", "caen"],
  ["perpignan", "montpellier"],
  ["besancon", "dijon"],
  ["marseille", "nice"],
  ["saint-etienne", "lyon"],
  ["le-havre", "rouen"],
  ["vannes", "rennes"],
  ["chambery", "annecy"],
  ["nimes", "montpellier"],
  ["saint-malo", "rennes"],
  ["colmar", "strasbourg"],
  ["lorient", "brest"],
  ["bayonne", "bordeaux"],
  ["arles", "avignon"],
  ["metz", "nancy"],
  ["metz", "strasbourg"],
  ["nancy", "strasbourg"],
  ["saint-etienne", "grenoble"],
  ["limoges", "bordeaux"],
  ["limoges", "poitiers"],
  ["amiens", "lille"],
  ["amiens", "rouen"],
  ["troyes", "reims"],
  ["troyes", "dijon"],
  ["tours", "angers"],
  ["pau", "bayonne"],
  ["clermont-ferrand", "lyon"],
  ["clermont-ferrand", "grenoble"],
  ["toulon", "marseille"],
  ["perpignan", "nimes"],
  ["avignon", "marseille"],
  ["caen", "rouen"],
  ["reims", "troyes"],
  ["dijon", "besancon"],
  ["poitiers", "tours"],
  ["valence", "avignon"],
  ["frejus", "toulon"],
  ["colmar", "nancy"],
  ["angers", "tours"],
  ["nantes", "angers"],
  ["biarritz", "pau"],
  ["saint-malo", "brest"],
  ["quimper", "lorient"],
  ["vannes", "lorient"],
  ["brest", "rennes"],
  ["grenoble", "annecy"],
  ["montpellier", "nice"],
  ["gap", "grenoble"],
  ["cannes", "nice"],
  ["cannes", "marseille"],
  ["cannes", "biarritz"],
  ["ajaccio", "nice"],
  ["mulhouse", "strasbourg"],
  ["mulhouse", "colmar"],
  ["dunkerque", "lille"],
  ["dunkerque", "boulogne-sur-mer"],
  ["sete", "montpellier"],
  ["sete", "perpignan"],
  ["sete", "nimes"],
  ["sete", "beziers"],
  ["beziers", "montpellier"],
  ["beziers", "nimes"],
  ["laval", "nantes"],
  ["laval", "rennes"],
  ["laval", "le-mans"],
  ["perigueux", "bordeaux"],
  ["perigueux", "limoges"],
  ["ales", "nimes"],
  ["ales", "montpellier"],
  ["chartres", "orleans"],
  ["chartres", "tours"],
  ["rodez", "toulouse"],
  ["rodez", "montpellier"],
  ["rodez", "clermont-ferrand"],
  ["agen", "bordeaux"],
  ["agen", "toulouse"],
  ["macon", "lyon"],
  ["macon", "dijon"],
  ["bourg-en-bresse", "lyon"],
  ["bourg-en-bresse", "annecy"],
  ["evreux", "rouen"],
  ["evreux", "caen"],
  ["antibes", "nice"],
  ["antibes", "cannes"],
  ["thionville", "metz"],
  ["thionville", "nancy"],
  ["arras", "lille"],
  ["arras", "amiens"],
  ["carcassonne", "perpignan"],
  ["carcassonne", "toulouse"],
];

export function generateStaticParams() {
  return SEO_PAIRS.map(([a, b]) => ({ pair: `${a}-vs-${b}` }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const [slugA, slugB] = pair.split("-vs-");
  const a = CITIES_SEED.find((c) => c.slug === slugA);
  const b = CITIES_SEED.find((c) => c.slug === slugB);
  if (!a || !b) return {};

  return {
    title: `${a.name} vs ${b.name} — Comparaison qualité de vie 2025`,
    description: `Comparaison complète entre ${a.name} (${a.scores.global}/10) et ${b.name} (${b.scores.global}/10) : coût de vie, transport, nature, sécurité, écoles. Laquelle choisir ?`,
    openGraph: {
      title: `${a.name} vs ${b.name} — Quelle ville choisir ?`,
      description: `${a.name} : ${a.scores.global}/10 · ${b.name} : ${b.scores.global}/10. Comparez tous les critères.`,
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

const SCORE_ROWS: Array<{ key: keyof (typeof CITIES_SEED)[number]["scores"]; label: string }> = [
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

type ScoreKey = keyof (typeof CITIES_SEED)[number]["scores"];

const PROFILES: Array<{ label: string; emoji: string; keys: ScoreKey[]; desc: string }> = [
  { label: "Famille", emoji: "👨‍👩‍👧", keys: ["safety", "schools", "nature", "cost"], desc: "sécurité, écoles, espaces verts, budget" },
  { label: "Télétravail", emoji: "💻", keys: ["remoteWork", "transport", "cost", "life"], desc: "fibre, coworking, coût, qualité de vie" },
  { label: "Retraite", emoji: "☀️", keys: ["nature", "safety", "cost", "life"], desc: "nature, sécurité, budget, bien-être" },
  { label: "Étudiant·e", emoji: "🎓", keys: ["culture", "transport", "cost", "schools"], desc: "culture, transports, budget, campus" },
];

export default async function PairPage({ params }: Props) {
  const { pair } = await params;
  const parts = pair.split("-vs-");
  if (parts.length !== 2) notFound();

  const [slugA, slugB] = parts;
  const seedA = CITIES_SEED.find((c) => c.slug === slugA);
  const seedB = CITIES_SEED.find((c) => c.slug === slugB);

  if (!seedA || !seedB) notFound();

  const cityA = seedToCity(seedA);
  const cityB = seedToCity(seedB);

  const winsA = SCORE_ROWS.filter(({ key }) => seedA.scores[key] > seedB.scores[key]).length;
  const winsB = SCORE_ROWS.filter(({ key }) => seedB.scores[key] > seedA.scores[key]).length;
  const winner = winsA > winsB ? cityA : winsB > winsA ? cityB : null;

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "MeilleurVille", item: process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr" },
                  { "@type": "ListItem", position: 2, name: "Comparer", item: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr"}/comparer` },
                  { "@type": "ListItem", position: 3, name: `${seedA.name} vs ${seedB.name}`, item: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr"}/comparer/${pair}` },
                ],
              },
              {
                "@type": "ItemList",
                name: `${seedA.name} vs ${seedB.name} — Comparaison`,
                itemListElement: [cityA, cityB].map((c, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name: c.name,
                  url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr"}/villes/${c.slug}`,
                })),
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: `Quelle est la meilleure ville entre ${seedA.name} et ${seedB.name} ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: winner
                        ? `${winner.name} l'emporte globalement avec un score de ${winner.scores.global.toFixed(1)}/10 contre ${(winner.slug === seedA.slug ? seedB : seedA).scores.global.toFixed(1)}/10. ${winner.characterTags.slice(0, 3).join(", ")}.`
                        : `${seedA.name} (${seedA.scores.global}/10) et ${seedB.name} (${seedB.scores.global}/10) sont très proches. Le choix dépend de vos priorités personnelles.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `Quelle est la différence de coût entre ${seedA.name} et ${seedB.name} ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `${seedA.name} a un score coût de la vie de ${seedA.scores.cost}/10 et ${seedB.name} de ${seedB.scores.cost}/10. ${seedA.scores.cost > seedB.scores.cost ? seedA.name : seedB.name} est la ville la plus abordable.`,
                    },
                  },
                  {
                    "@type": "Question",
                    name: `Où est-il plus facile de télétravailler, à ${seedA.name} ou ${seedB.name} ?`,
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: `${seedA.name} obtient ${seedA.scores.remoteWork}/10 en télétravail et ${seedB.name} obtient ${seedB.scores.remoteWork}/10. ${seedA.scores.remoteWork > seedB.scores.remoteWork ? seedA.name : seedB.name} est mieux équipée pour le télétravail.`,
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />

      {/* Header */}
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Comparaison 2025</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            {seedA.name}{" "}
            <span className="text-[var(--text-secondary)]">vs</span>{" "}
            {seedB.name}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {seedA.region} · {seedA.scores.global}/10 &nbsp;vs&nbsp; {seedB.region} · {seedB.scores.global}/10
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-10">
        {/* Cards */}
        <div className="grid grid-cols-2 gap-4">
          <CityCard city={cityA} />
          <CityCard city={cityB} />
        </div>

        {/* Winner verdict */}
        {winner && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-6 text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-1">Recommandé par MeilleurVille</p>
            <p className="text-xl font-bold text-emerald-400">
              {winner.name} l'emporte sur {SCORE_ROWS.length - Math.min(winsA, winsB)} critères
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Résultat basé sur 9 critères pondérés équitablement
            </p>
          </div>
        )}

        {/* Head-to-head table */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-6">
            Comparaison critère par critère
          </h2>
          <div className="space-y-5">
            {SCORE_ROWS.map(({ key, label }) => {
              const va = seedA.scores[key];
              const vb = seedB.scores[key];
              const diff = va - vb;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
                    <span className={diff > 0 ? "font-bold text-emerald-400" : ""}>{seedA.name}</span>
                    <span className="font-medium text-[var(--text-primary)]">{label}</span>
                    <span className={diff < 0 ? "font-bold text-emerald-400" : ""}>{seedB.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 text-right text-sm font-bold font-mono-data ${diff > 0 ? "text-emerald-400" : "text-[var(--text-secondary)]"}`}>
                      {va.toFixed(1)}
                    </span>
                    <div className="flex-1 flex gap-1">
                      {/* A bar — right-aligned */}
                      <div className="flex-1 flex justify-end">
                        <div
                          className={`h-2 rounded-l-full ${diff > 0 ? "bg-emerald-400" : "bg-[var(--bg-elevated)]"}`}
                          style={{ width: `${(va / 10) * 100}%` }}
                        />
                      </div>
                      <div className="w-px bg-[var(--border)]" />
                      {/* B bar — left-aligned */}
                      <div className="flex-1">
                        <div
                          className={`h-2 rounded-r-full ${diff < 0 ? "bg-emerald-400" : "bg-[var(--bg-elevated)]"}`}
                          style={{ width: `${(vb / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className={`w-8 text-sm font-bold font-mono-data ${diff < 0 ? "text-emerald-400" : "text-[var(--text-secondary)]"}`}>
                      {vb.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Climate */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Climat</h2>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div />
            <div className="font-semibold text-blue-400">{seedA.name}</div>
            <div className="font-semibold text-violet-400">{seedB.name}</div>
            {[
              { label: "Soleil / an", a: seedA.sunshinedays ? `${seedA.sunshinedays}j` : "—", b: seedB.sunshinedays ? `${seedB.sunshinedays}j` : "—" },
              { label: "Juillet", a: seedA.avgTempJuly ? `${seedA.avgTempJuly}°C` : "—", b: seedB.avgTempJuly ? `${seedB.avgTempJuly}°C` : "—" },
              { label: "Janvier", a: seedA.avgTempJanuary ? `${seedA.avgTempJanuary}°C` : "—", b: seedB.avgTempJanuary ? `${seedB.avgTempJanuary}°C` : "—" },
            ].map(({ label, a, b }) => (
              <React.Fragment key={label}>
                <div className="text-xs text-[var(--text-secondary)] text-left">{label}</div>
                <div className="font-mono-data font-bold text-[var(--text-primary)]">{a}</div>
                <div className="font-mono-data font-bold text-[var(--text-primary)]">{b}</div>
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* Housing prices */}
        {(getHousing(slugA) || getHousing(slugB)) && (
          <Card>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Immobilier & Loyers</h2>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div />
              <div className="font-semibold text-blue-400">{seedA.name}</div>
              <div className="font-semibold text-violet-400">{seedB.name}</div>
              {[
                { label: "Loyer T1 / mois", a: getHousing(slugA)?.avgRentT1, b: getHousing(slugB)?.avgRentT1, unit: "€" },
                { label: "Loyer T2 / mois", a: getHousing(slugA)?.avgRentT2, b: getHousing(slugB)?.avgRentT2, unit: "€" },
                { label: "Loyer T3 / mois", a: getHousing(slugA)?.avgRentT3, b: getHousing(slugB)?.avgRentT3, unit: "€" },
                { label: "Prix achat / m²", a: getHousing(slugA)?.avgBuyPriceM2, b: getHousing(slugB)?.avgBuyPriceM2, unit: "€/m²" },
              ].map(({ label, a, b, unit }) => {
                const cheaper = a && b ? (a < b ? "a" : b < a ? "b" : "equal") : null;
                return (
                  <React.Fragment key={label}>
                    <div className="text-xs text-[var(--text-secondary)] text-left">{label}</div>
                    <div className={`font-mono-data font-bold ${cheaper === "a" ? "text-emerald-400" : "text-[var(--text-primary)]"}`}>
                      {a ? `${a.toLocaleString("fr-FR")} ${unit}` : "—"}
                    </div>
                    <div className={`font-mono-data font-bold ${cheaper === "b" ? "text-emerald-400" : "text-[var(--text-primary)]"}`}>
                      {b ? `${b.toLocaleString("fr-FR")} ${unit}` : "—"}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-4">
              Prix médians indicatifs (source : DVF / données marché 2024). La couleur verte indique la ville la moins chère.
            </p>
          </Card>
        )}

        {/* Pour qui ? */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-5">
            Pour quel profil choisir chaque ville ?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {PROFILES.map(({ label, emoji, keys, desc }) => {
              const scoreA = keys.reduce((s, k) => s + seedA.scores[k], 0) / keys.length;
              const scoreB = keys.reduce((s, k) => s + seedB.scores[k], 0) / keys.length;
              const diff = Math.abs(scoreA - scoreB);
              const profileWinner = scoreA > scoreB ? seedA : scoreB > scoreA ? seedB : null;
              return (
                <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">{desc}</p>
                  {profileWinner ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-emerald-400">{profileWinner.name}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">+{diff.toFixed(1)} pts</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--text-tertiary)]">Égalité</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-3">
          <p className="text-[var(--text-secondary)]">
            Vous hésitez encore ? Notre IA peut analyser votre profil exact.
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

        {/* Related comparisons */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Comparaisons similaires
          </h2>
          <div className="flex flex-wrap gap-2">
            {SEO_PAIRS.filter(([a, b]) =>
              (a === slugA || b === slugA || a === slugB || b === slugB) &&
              !(a === slugA && b === slugB) && !(a === slugB && b === slugA)
            ).slice(0, 10).map(([a, b]) => {
              const ca = CITIES_SEED.find((c) => c.slug === a);
              const cb = CITIES_SEED.find((c) => c.slug === b);
              if (!ca || !cb) return null;
              return (
                <Link
                  key={`${a}-vs-${b}`}
                  href={`/comparer/${a}-vs-${b}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
                >
                  {ca.name} vs {cb.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

