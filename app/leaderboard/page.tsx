import { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge } from "@/components/EmojiBadge";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { CITIES_SEED } from "@/data/cities-seed";
import { CITIES_CORE, RENT_T2_BY_SLUG } from "@/lib/cities-light";
import { scoreColor as scoreClass } from "@/lib/utils";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Leaderboard · Top villes France par qualité de vie",
  description:
    "Le classement global des meilleures villes françaises par qualité de vie, agrégé sur 9 critères : nature, transport, coût, sécurité, culture, écoles.",
  alternates: pathAlternates("/leaderboard", "/leaderboard"),
  openGraph: {
    title: "Leaderboard · Top villes France par qualité de vie",
    description: "Score global agrégé sur 9 critères de qualité de vie. Classement des meilleures villes françaises.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

const MEDAL = ["🥇", "🥈", "🥉"];
const sorted = [...CITIES_SEED].sort((a, b) => b.scores.global - a.scores.global);

export default function LeaderboardPage() {
  const podium = sorted.slice(0, 3);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Leaderboard", item: `${BASE_URL}/leaderboard` },
        ],
      },
      {
    "@type": "ItemList",
    name: "Classement des meilleures villes françaises par qualité de vie 2026",
    description: "Score global agrégé sur 9 critères : nature, transport, coût de la vie, sécurité, culture, écoles, qualité de vie, télétravail.",
    url: `${BASE_URL}/leaderboard`,
    numberOfItems: sorted.length,
    itemListElement: sorted.slice(0, 20).map((city, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: city.name,
      url: `${BASE_URL}/villes/${city.slug}`,
      description: `Score ${city.scores.global.toFixed(1)}/10 — ${city.region}`,
    })),
      },
    ],
  };

  const avg = sorted.reduce((s, c) => s + c.scores.global, 0) / sorted.length;
  const max = Math.max(...sorted.map((c) => c.scores.global));

  return (
    <main id="main-content" className="min-h-screen relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <EmojiBadge emoji="🏆" tone="indigo" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Classement global · {sorted.length} villes
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Le grand{" "}
            <span className="font-display gradient-text-anim italic pr-1">leaderboard</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Score global pondéré sur 8 axes (vie, sécurité, coût, nature, transport, culture, écoles, télétravail).
            Calibré sur Insee + Ministère Intérieur. Ce que chacun de ces axes mesure, et ce
            qu&apos;en disent les habitants, est détaillé sur la page{" "}
            <Link href="/avis" className="font-medium text-[#4338CA] underline underline-offset-2 hover:text-[#BE185D]">
              notes et avis des villes
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Podium */}
      <section className="band band-pink py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <EmojiBadge emoji="🥇" tone="pink" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Podium 2026</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {podium.map((city, i) => (
              <Link
                key={city.slug}
                href={`/villes/${city.slug}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-[0_14px_34px_-22px_rgba(219,39,119,0.55)] ring-1 ring-[#FBCFE8] hover:ring-[#EC4899] hover:-translate-y-0.5 hover:shadow-lg transition-all text-center"
              >
                <div className={`grad-head-${i} px-4 py-2 text-xs font-bold uppercase tracking-widest`}>
                  {MEDAL[i]} {i + 1}<sup>{i === 0 ? "re" : "e"}</sup> place
                </div>
                <div className="p-6 pt-5">
                  <div className={`text-3xl font-black font-mono-data mb-1 ${scoreClass(city.scores.global)}`}>
                    {city.scores.global.toFixed(1)}
                  </div>
                  <div className="text-base font-bold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
                    {city.name}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">{city.region}</div>
                  <div className="mt-4 space-y-1.5">
                    {([ { key: "life" as const, label: "Qualité de vie" }, { key: "transport" as const, label: "Transport" }, { key: "nature" as const, label: "Nature" }, { key: "cost" as const, label: "Coût de vie" } ]).map(({ key, label }) => (
                      <div key={key} className="flex-1">
                        <ScoreBar label={label} score={city.scores[key]} />
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Full table — interactive with region filter + sort */}
      <section className="band band-sky py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <EmojiBadge emoji="📊" tone="sky" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Classement complet <span className="text-[#4338CA]">— {sorted.length} villes</span>
            </h2>
          </div>
          <LeaderboardTable cities={CITIES_CORE} rentT2BySlug={RENT_T2_BY_SLUG} />
          {/* Le tableau ne rend que ses 100 premières lignes (le reste au clic).
              Cet index garde un lien HTML vers chaque ville, rang et note
              compris, lisible sans JavaScript et par les robots. */}
          <details className="mt-4 rounded-2xl bg-white shadow-[0_10px_28px_-20px_rgba(8,145,178,0.6)] ring-1 ring-[#BAE6FD]">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-[#4338CA]">
              Toutes les villes classées, du rang 1 au rang {sorted.length}
            </summary>
            {/* Deux balises par ligne (li + a), styles portés par la liste : cet
                index est écrit deux fois dans le HTML (balisage + charge RSC). */}
            <ol className="list-inside list-decimal columns-1 gap-x-6 px-4 pb-4 text-sm text-[var(--text-tertiary)] marker:text-xs sm:columns-2 lg:columns-3 [&_a]:inline-block [&_a]:py-1 [&_a]:text-[var(--text-primary)] [&_a:hover]:text-[#4338CA]">
              {sorted.map((city) => (
                <li key={city.slug}>
                  <Link href={`/villes/${city.slug}`}>{city.name}</Link> {city.scores.global.toFixed(1)}
                </li>
              ))}
            </ol>
          </details>
        </div>
      </section>

      {/* Stats strip + renvois */}
      <section className="band band-lilac py-12 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Villes classées", value: sorted.length.toString() },
              { label: "Score moyen", value: avg.toFixed(1) },
              { label: "Score max", value: max.toFixed(1) },
              { label: "Critères évalués", value: "9" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-white p-4 text-center shadow-[0_10px_28px_-20px_rgba(109,63,216,0.55)] ring-1 ring-[#DDD6FE]">
                <div className="text-2xl font-black font-mono-data text-[#4338CA]">{value}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/classements"
              className="inline-flex items-center rounded-full grad-head-0 px-5 py-3 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              Classements thématiques →
            </Link>
            <Link
              href="/comparer"
              className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE] hover:ring-[#4F46E5] hover:-translate-y-0.5 transition-all"
            >
              Comparer des villes →
            </Link>
            <Link
              href="/comparer-departements"
              className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#4338CA] ring-1 ring-[#C7D2FE] hover:ring-[#4F46E5] hover:-translate-y-0.5 transition-all"
            >
              Comparer deux départements →
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
